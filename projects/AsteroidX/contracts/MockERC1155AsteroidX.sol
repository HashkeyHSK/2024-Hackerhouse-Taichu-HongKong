// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../contracts/IERC1155AsteroidX.sol";

contract MockERC1155AsteroidX is IERC1155AsteroidX {
    string private _name = "AsteroidX Universe";
    string private _symbol = "AsteroidX";
    address private constant _fundsWallet = address(1);

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function fundsWallet(uint256) external pure override returns(address) {
        return _fundsWallet;
    }

    function buy(address, uint256, uint256) external pure override returns(bool) {
        return true;
    }
} 