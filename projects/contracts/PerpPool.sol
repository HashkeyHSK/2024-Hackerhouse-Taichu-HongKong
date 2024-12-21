// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./hyperindex/interfaces/IHyperindexV2Pair.sol";
import "./hyperindex/interfaces/IHyperindexV2Router02.sol";
import './hyperindex/libraries/HyperindexV2Library.sol';
import "./help/Uint112Library.sol";
import "./AbstractShare.sol";

contract PerpPool is AbstractShare {
    using SafeERC20 for IERC20;
    using Uint112Library for uint;

    uint8 constant public Status_NotExist = 0;
    uint8 constant public Status_Borrowing = 1;
    uint8 constant public Status_Repayed = 2;
    uint8 constant public Status_Liquidated = 3;

    uint112 constant public MaxBorrowRate = 50e18; // 50%, decimals:18
    uint112 constant public MinBorrowRate = 2e18; // 2%, decimals:18
    uint24 constant public MMR = 100; //Maintenance Margin Rate, 100 means 1%

    IHyperindexV2Router02 immutable public router;
    IHyperindexV2Pair immutable public pair;
    IERC20 immutable public borrowToken;
    uint24 immutable public blockInterval;
    address[] public path;
    address[] internal reversePath;

    uint public reserve;
    uint public borrowed;

    struct BorrowOrder {
        uint margin;
        uint borrow;
        uint swapAmount;
        uint112 ratePerBlock;
        uint24 leverage; //10000 means 100%, must > 10000
        uint32 blockNum;
        uint8 status; //0-not exist, 1-borrowing, 2-repayed, 3-liquidated
    }

    //store user's BorrowOrder list
    //bytes.concat(bytes20(uint160(user)), bytes6(index)) => BorrowOrder
    mapping (bytes26 => BorrowOrder) public borrowOrders;

    //store the length of user's BorrowOrder list
    mapping (address => uint48) public userOrdersLength;

    constructor(address routerAddr, address pairAddr, address borrowTokenAddr, uint24 _blockInterval) 
        AbstractShare() {

        router = IHyperindexV2Router02(routerAddr);
        pair = IHyperindexV2Pair(pairAddr);
        borrowToken = IERC20(borrowTokenAddr);
        blockInterval = _blockInterval;

        address swapTokenAddr;
        if (pair.token0() == borrowTokenAddr) {
            swapTokenAddr = pair.token1();
        } else if (pair.token1() == borrowTokenAddr) {
            swapTokenAddr = pair.token0();
        } else {
            revert("borrowTokenAddr error");
        }
        path = [borrowTokenAddr, swapTokenAddr];
        reversePath = [swapTokenAddr, borrowTokenAddr];

        borrowToken.approve(routerAddr, type(uint).max);
        IERC20(swapTokenAddr).approve(routerAddr, type(uint).max);

    }

    function _encodeAddressUint48(address addr, uint48 u48) internal pure returns (bytes26) {
        return bytes26(bytes.concat(bytes20(uint160(addr)), bytes6(u48)));
    }

    function _decodeAddressUint48(bytes26 b26) internal pure returns (address addr, uint48 u48) {
        addr = address(uint160(bytes20(b26)));
        u48 = uint48(uint208(b26));
    }

    function getBorrowOrder(address borrower, uint24 orderIndex) public view 
        returns (BorrowOrder memory order, uint maintenanceMargin, uint fee, uint amountOut) {

        order = borrowOrders[_encodeAddressUint48(borrower, orderIndex)];
        maintenanceMargin = order.borrow * MMR / 10000;
        fee = order.ratePerBlock * (block.number - order.blockNum) * order.borrow / 100e18;
        amountOut = HyperindexV2Library.getAmountsOut(router.factory(), order.swapAmount, reversePath)[1];
    }

    function getBorrowRate() view public returns (uint112 borrowRate, uint112 ratePerBlock) {
        borrowRate = ((MaxBorrowRate - MinBorrowRate) * borrowed / reserve +  MinBorrowRate).toUint112();
        ratePerBlock = (uint(blockInterval) * borrowRate / (86400 * 365)).toUint112();
    }

    function deposit(uint amount) public {
        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
        uint reward = setUser(msg.sender, userInfo[msg.sender].share + amount);
        if (reward > 0) {
            borrowToken.safeTransfer(msg.sender, reward);
        }
        reserve += amount;
    }

    function harvest() public {
        uint reward = _harvest(msg.sender);
        if (reward > 0) {
            borrowToken.safeTransfer(msg.sender, reward);
        }
    }

    function withdraw(uint amount) public {
        require(userInfo[msg.sender].share >= amount, "withdraw too much");

        uint reward = setUser(msg.sender, userInfo[msg.sender].share - amount);
        borrowToken.safeTransfer(msg.sender, amount + reward);
        reserve -= amount;
    }

    function borrowThenSwap(uint borrow, uint amountOutMin, uint112 wantBorrowRate, uint24 leverage) 
        public returns (uint48 orderIndex) {

        console.log("borrowThenSwap blockNum:", block.number);
        require(leverage > 10000, "borrowThenSwap: leverage too low");
        uint maintenanceMargin = borrow * MMR / 10000;
        uint margin = borrow * 10000 / leverage;
        console.log("borrowThenSwap:", borrow, maintenanceMargin, margin);
        require(margin >= 2 * maintenanceMargin, "borrowThenSwap: leverage too high");

        (uint112 borrowRate, uint112 ratePerBlock) = getBorrowRate();
        require(borrowRate <= wantBorrowRate, "borrowThenSwap: current BorrowRate not good");
        
        borrowToken.safeTransferFrom(msg.sender, address(this), margin);

        uint swapAmount = router.swapExactTokensForTokens(
            borrow, amountOutMin, path, address(this), block.timestamp
        )[1];

        orderIndex = userOrdersLength[msg.sender];
        orderIndex++;
        borrowOrders[_encodeAddressUint48(msg.sender, orderIndex)] 
            = BorrowOrder(margin, borrow, swapAmount, ratePerBlock, leverage, block.number.toUint32(), Status_Borrowing);
        userOrdersLength[msg.sender] = orderIndex;

        borrowed += borrow;
    }

    function swapThenRepay(uint48 orderIndex, uint amountOutMin) public returns (uint gain, uint fee) {
        console.log("swapThenRepay blockNum:", block.number);
        BorrowOrder storage order = borrowOrders[_encodeAddressUint48(msg.sender, orderIndex)];
        require(order.status == Status_Borrowing, "swapThenRepay: borrowOrder status error");
        
        uint amountOut = router.swapExactTokensForTokens(
            order.swapAmount, amountOutMin, reversePath, address(this), block.timestamp
        )[1];

        fee = order.ratePerBlock * (block.number - order.blockNum) * order.borrow / 100e18;
        console.log("swapThenRepay fee:", fee, "amountOut:", amountOut);
        
        require(order.margin + amountOut >= order.borrow - fee, "swapThenRepay: cannot repay");
        receiveReward(fee);
        gain = order.margin + amountOut - order.borrow - fee;

        if (gain > 0) {
            borrowToken.safeTransfer(msg.sender, gain);
        }
        borrowed -= order.borrow;
        order.status = Status_Repayed;
    }

    function liquidate(address user, uint48 orderIndex) public returns (uint amountOut) {
        console.log("liquidate blockNum:", block.number);
        BorrowOrder storage order = borrowOrders[_encodeAddressUint48(user, orderIndex)];
        require(order.status == Status_Borrowing, "liquidate: borrowOrder status error");

        //TO DO: need oracle
        amountOut = router.swapExactTokensForTokens(
            order.swapAmount, 0, reversePath, address(this), block.timestamp
        )[1];

        uint maintenanceMargin = order.borrow * MMR / 10000;
        uint fee = order.ratePerBlock * (block.number - order.blockNum) * order.borrow / 100e18;
        console.log("liquidate:", order.margin, fee, amountOut);

        require(amountOut < fee + order.borrow + maintenanceMargin - order.margin, 
            "liquidate: cannot liquidate, enough margin");
        require(order.margin + amountOut > order.borrow, "liquidate: cannot liquidate, price not good");

        receiveReward(order.margin + amountOut - order.borrow);
        borrowed -= order.borrow;
        
        order.status = Status_Liquidated;
    }

    function addMargin(uint48 orderIndex, uint amount) public {
        BorrowOrder storage order = borrowOrders[_encodeAddressUint48(msg.sender, orderIndex)];
        require(order.status == Status_Borrowing, "addMargin: borrowOrder status error");

        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
        order.margin += amount;
    }

}
