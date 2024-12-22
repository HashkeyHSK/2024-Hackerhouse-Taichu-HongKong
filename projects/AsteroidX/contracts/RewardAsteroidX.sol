// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./IERC1155AsteroidX.sol";

error InvalidInput(string reason);
error InvalidOperation(string reason);
error ContractError(string reason);
error TransferError(string reason);

contract RewardAsteroidX is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20Metadata;
    using Address for address payable;

    IERC1155AsteroidX public iERC1155Asteroid;

    address public constant NATIVE_TOKEN = address(0);

    struct PaymentToken {
        bool isEnabled;
        uint256 minAmount;
        uint256 maxAmount;
        uint8 decimals;
    }

    struct UserInfo {
        uint256 purchaseAmount;
        uint256 purchaseValue;
        uint256 timestamp;
        bool hasClaimed;
        uint256 periodId;
        address paymentToken;
        uint256 claimedReward;
    }

    struct Period {
        uint256 startTime;
        uint256 endTime;
        uint256 claimStartTime;
        uint256 totalReward;
        uint256 totalPurchaseValue;
        bool isActive;
        address paymentToken;
        address rewardToken;
        bool refundEnabled;
    }

    struct PeriodView {
        uint256 startTime;
        uint256 endTime;
        uint256 claimStartTime;
        uint256 totalReward;
        uint256 totalPurchaseValue;
        bool isActive;
        uint256 participantsCount;
        address paymentToken;
        address rewardToken;
        bool refundEnabled;
        bool isPurchasable;
    }

    struct UserView {
        uint256 purchaseAmount;
        uint256 purchaseValue;
        uint256 timestamp;
        bool hasClaimed;
        uint256 periodId;
        address paymentToken;
        uint256 claimableReward;
        uint256 claimedReward;
        uint8 paymentTokenDecimals;
        uint8 rewardTokenDecimals;
    }

    mapping(address => UserInfo) public userInfo;
    mapping(uint256 => Period) public periods;
    mapping(uint256 => address[]) public periodParticipants;
    mapping(address => PaymentToken) public supportedTokens;
    mapping(address => uint256) public rewardPoolBalance;
    mapping(uint256 => uint256) public tokenPurchaseLimits;
    // Current active period ID
    uint256 public currentPeriodId;

    event Purchase(
        address indexed user,
        uint256 amount,
        uint256 value,
        uint256 periodId,
        uint256 timestamp,
        uint256 tokenId,
        address paymentToken
    );
    event Claim(
        address indexed user,
        uint256 reward,
        uint256 periodId,
        uint256 timestamp,
        address paymentToken
    );
    event PaymentTokenUpdated(
        address indexed token,
        bool isEnabled,
        uint256 minAmount,
        uint256 maxAmount
    );
    event ERC1155AsteroidContractSet(address indexed contractAddress);
    event NewPeriodCreated(
        uint256 indexed periodId,
        uint256 startTime,
        uint256 endTime,
        uint256 claimStartTime,
        uint256 totalReward
    );
    event RewardTokenDeposited(address indexed token, uint256 amount);
    event PeriodStatusChanged(uint256 indexed periodId, bool isActive);
    event PeriodEmergencyStopped(uint256 indexed periodId, string reason);
    event TokenPurchaseLimitUpdated(uint256 indexed tokenId, uint256 maxAmount);

    constructor() Ownable(_msgSender()) {
        // Default enable native token payment
        supportedTokens[NATIVE_TOKEN] = PaymentToken({
            isEnabled: true,
            minAmount: 0,
            maxAmount: type(uint256).max,
            decimals: 18
        });
    }

    function setPaymentToken(
        address token,
        bool isEnabled,
        uint256 minAmount,
        uint256 maxAmount
    ) external onlyOwner {
        if (token == address(0) && !isEnabled)
            revert InvalidInput("Cannot disable native token");

        if (token != NATIVE_TOKEN) {
            // For ERC20 tokens, verify contract address
            try IERC20Metadata(token).decimals() returns (uint8 _decimals) {
                // Verify token contract has code
                uint256 codeSize;
                assembly {
                    codeSize := extcodesize(token)
                }
                if (codeSize == 0)
                    revert InvalidInput("Token must be a contract");

                // Convert original values to token decimals
                uint256 minAmountWithDecimals = minAmount * 10**_decimals;
                uint256 maxAmountWithDecimals = maxAmount * 10**_decimals;

                supportedTokens[token] = PaymentToken({
                    isEnabled: isEnabled,
                    minAmount: minAmountWithDecimals,
                    maxAmount: maxAmountWithDecimals,
                    decimals: _decimals
                });
            } catch {
                revert InvalidInput("Invalid token contract");
            }
        } else {
            // Native token, 18 decimals
            uint256 minAmountWithDecimals = minAmount * 1 ether;
            uint256 maxAmountWithDecimals = maxAmount * 1 ether;

            supportedTokens[NATIVE_TOKEN] = PaymentToken({
                isEnabled: isEnabled,
                minAmount: minAmountWithDecimals,
                maxAmount: maxAmountWithDecimals,
                decimals: 18
            });
        }

        emit PaymentTokenUpdated(token, isEnabled, minAmount, maxAmount);
    }

    function createNewPeriod(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _claimStartTime,
        uint256 _totalReward,
        address _paymentToken,
        address _rewardToken,
        bool _refundEnabled
    ) external onlyOwner {
        if (_startTime >= _endTime) revert InvalidInput("Invalid time range");
        if (_endTime >= _claimStartTime)
            revert InvalidInput("Invalid claim time");
        if (_totalReward == 0) revert InvalidInput("Invalid reward amount");

        // Verify payment token and reward token are both set
        PaymentToken memory paymentTokenConfig = supportedTokens[_paymentToken];
        PaymentToken memory rewardTokenConfig = supportedTokens[_rewardToken];
        if (!paymentTokenConfig.isEnabled)
            revert InvalidInput("Payment token not supported");
        if (!rewardTokenConfig.isEnabled)
            revert InvalidInput("Reward token not supported");

        uint256 periodId = currentPeriodId + 1;
        periods[periodId] = Period({
            startTime: _startTime,
            endTime: _endTime,
            claimStartTime: _claimStartTime,
            totalReward: _totalReward,
            totalPurchaseValue: 0,
            isActive: false,
            paymentToken: _paymentToken,
            rewardToken: _rewardToken,
            refundEnabled: _refundEnabled
        });
        currentPeriodId = periodId;

        emit NewPeriodCreated(
            periodId,
            _startTime,
            _endTime,
            _claimStartTime,
            _totalReward
        );
    }

    function _safeTransferNative(address to, uint256 amount) internal {
        payable(to).sendValue(amount);
    }

    function isPeriodPurchasable(uint256 _periodId) public view returns (bool) {
        Period memory period = periods[_periodId];
        return
            period.isActive &&
            block.timestamp >= period.startTime &&
            block.timestamp < period.endTime &&
            !paused(); // Also check if contract is paused
    }

    function purchased(
        uint256 tokenId,
        uint256 amount,
        address paymentToken
    ) external payable nonReentrant whenNotPaused returns (bool) {
        // Basic validations
        _validatePurchaseBasics(tokenId, amount, paymentToken);

        // Process payment and get real amount
        uint256 realAmount = _processPayment(
            tokenId,
            amount,
            paymentToken,
            supportedTokens[paymentToken]
        );

        // Record user info and update period
        _recordPurchase(_msgSender(), amount, realAmount, paymentToken);

        // Buy NFT
        if (!iERC1155Asteroid.buy(_msgSender(), tokenId, amount))
            revert InvalidOperation("Purchase failed");

        emit Purchase(
            _msgSender(),
            amount,
            realAmount,
            currentPeriodId,
            block.timestamp,
            tokenId,
            paymentToken
        );
        return true;
    }

    function _validatePurchaseBasics(
        uint256 tokenId,
        uint256 amount,
        address paymentToken
    ) internal view {
        if (address(iERC1155Asteroid) == address(0))
            revert ContractError("Contract not initialized");

        uint256 maxAmount = tokenPurchaseLimits[tokenId];
        if (amount == 0 || maxAmount == 0 || amount > maxAmount)
            revert InvalidInput("Invalid amount");

        if (userInfo[_msgSender()].purchaseAmount != 0)
            revert InvalidOperation("Already purchased");

        Period storage currentPeriod = periods[currentPeriodId];

        if (!isPeriodPurchasable(currentPeriodId))
            revert InvalidOperation("Period not purchasable");

        if (paymentToken != currentPeriod.paymentToken)
            revert InvalidInput("Invalid payment token for current period");

        PaymentToken memory tokenConfig = supportedTokens[paymentToken];
        if (!tokenConfig.isEnabled)
            revert InvalidInput("Payment token not supported");
    }

    function _processPayment(
        uint256 tokenId,
        uint256 amount,
        address paymentToken,
        PaymentToken memory tokenConfig
    ) internal returns (uint256) {
        address fundsWallet = iERC1155Asteroid.fundsWallet(tokenId);
        if (fundsWallet == address(0))
            revert ContractError("Invalid funds wallet");

        uint256 realAmount;
        if (paymentToken == NATIVE_TOKEN) {
            realAmount = msg.value;
            if (realAmount == 0) revert InvalidInput("Invalid value");
            if (
                realAmount < tokenConfig.minAmount ||
                realAmount > tokenConfig.maxAmount
            ) revert InvalidInput("Amount out of range");

            _safeTransferNative(fundsWallet, realAmount);
        } else {
            realAmount = amount * 10**tokenConfig.decimals;
            if (
                realAmount < tokenConfig.minAmount ||
                realAmount > tokenConfig.maxAmount
            ) revert InvalidInput("Amount out of range");

            IERC20Metadata token = IERC20Metadata(paymentToken);
            if (token.balanceOf(_msgSender()) < realAmount)
                revert TransferError("Insufficient balance");

            token.safeTransferFrom(_msgSender(), fundsWallet, realAmount);
        }
        return realAmount;
    }

    function _recordPurchase(
        address user,
        uint256 amount,
        uint256 realAmount,
        address paymentToken
    ) internal {
        userInfo[user] = UserInfo({
            purchaseAmount: amount,
            purchaseValue: realAmount,
            timestamp: block.timestamp,
            hasClaimed: false,
            periodId: currentPeriodId,
            paymentToken: paymentToken,
            claimedReward: 0
        });

        Period storage currentPeriod = periods[currentPeriodId];
        periodParticipants[currentPeriodId].push(user);
        currentPeriod.totalPurchaseValue += realAmount;
    }

    function depositRewardToken(address token, uint256 amount)
        external
        payable
        onlyOwner
    {
        if (amount == 0) revert InvalidInput("Amount must be greater than 0");

        if (token == NATIVE_TOKEN) {
            if (msg.value != amount)
                revert InvalidInput("Invalid native token amount");
            rewardPoolBalance[NATIVE_TOKEN] += amount;
        } else {
            IERC20Metadata(token).safeTransferFrom(
                _msgSender(),
                address(this),
                amount
            );
            rewardPoolBalance[token] += amount;
        }

        emit RewardTokenDeposited(token, amount);
    }

    function claim() external nonReentrant returns (bool) {
        address userAddress = _msgSender();
        UserInfo storage user = userInfo[userAddress];

        if (user.purchaseAmount == 0)
            revert InvalidOperation("No purchase record");
        if (user.hasClaimed) revert InvalidOperation("Already claimed");

        Period storage period = periods[user.periodId];
        if (block.timestamp < period.claimStartTime)
            revert InvalidOperation("Claim not started");

        uint256 userReward = _calculateUserReward(userAddress);
        if (userReward == 0) revert InvalidOperation("No reward available");

        // Check reward token balance
        if (rewardPoolBalance[period.rewardToken] < userReward)
            revert TransferError("Insufficient reward token balance");

        // If refund is enabled, check payment token balance
        if (period.refundEnabled) {
            if (user.paymentToken == NATIVE_TOKEN) {
                if (address(this).balance < (userReward + user.purchaseValue))
                    revert TransferError(
                        "Insufficient balance for reward and refund"
                    );
            } else {
                uint256 totalNeeded;
                if (user.paymentToken == period.rewardToken) {
                    // If payment token is same as reward token, check total amount
                    totalNeeded = userReward + user.purchaseValue;
                    if (rewardPoolBalance[user.paymentToken] < totalNeeded)
                        revert TransferError(
                            "Insufficient token balance for reward and refund"
                        );
                } else {
                    // If different tokens, check balances separately
                    uint256 tokenBalance = IERC20Metadata(user.paymentToken)
                        .balanceOf(address(this));
                    if (tokenBalance < user.purchaseValue)
                        revert TransferError("Insufficient balance for refund");
                }
            }
        }

        // Update state first
        user.hasClaimed = true;
        user.claimedReward = userReward;

        // Deduct from reward pool
        rewardPoolBalance[period.rewardToken] -= userReward;

        // Distribute rewards and refund
        if (period.refundEnabled) {
            if (user.paymentToken == NATIVE_TOKEN) {
                // Native token: send reward and refund in one transaction
                if (period.rewardToken == NATIVE_TOKEN) {
                    _safeTransferNative(
                        userAddress,
                        userReward + user.purchaseValue
                    );
                } else {
                    _safeTransferNative(userAddress, user.purchaseValue);
                    IERC20Metadata(period.rewardToken).safeTransfer(
                        userAddress,
                        userReward
                    );
                }
            } else {
                // ERC20 tokens
                if (user.paymentToken == period.rewardToken) {
                    // If same token, send in one transaction
                    IERC20Metadata(user.paymentToken).safeTransfer(
                        userAddress,
                        userReward + user.purchaseValue
                    );
                } else {
                    // If different tokens, send separately
                    IERC20Metadata(user.paymentToken).safeTransfer(
                        userAddress,
                        user.purchaseValue
                    );
                    IERC20Metadata(period.rewardToken).safeTransfer(
                        userAddress,
                        userReward
                    );
                }
            }
        } else {
            // Only distribute rewards
            if (period.rewardToken == NATIVE_TOKEN) {
                _safeTransferNative(userAddress, userReward);
            } else {
                IERC20Metadata(period.rewardToken).safeTransfer(
                    userAddress,
                    userReward
                );
            }
        }

        emit Claim(
            userAddress,
            userReward,
            user.periodId,
            block.timestamp,
            period.rewardToken
        );
        return true;
    }

    // Prevent direct native token transfers
    receive() external payable {
        revert InvalidOperation("Direct transfer not allowed");
    }

    function emergencyWithdraw(
        address to,
        address token,
        uint256 amount
    ) external onlyOwner {
        if (to == address(0)) revert InvalidInput("Invalid recipient");
        if (amount == 0) revert InvalidInput("Amount must be greater than 0");

        // Ensure reward pool tokens cannot be withdrawn
        if (token == NATIVE_TOKEN) {
            uint256 withdrawableAmount = address(this).balance -
                rewardPoolBalance[NATIVE_TOKEN];
            if (amount > withdrawableAmount)
                revert TransferError("Amount exceeds withdrawable balance");
            _safeTransferNative(to, amount);
        } else {
            uint256 balance = IERC20Metadata(token).balanceOf(address(this));
            uint256 withdrawableAmount = balance - rewardPoolBalance[token];
            if (amount > withdrawableAmount)
                revert TransferError("Amount exceeds withdrawable balance");
            IERC20Metadata(token).safeTransfer(to, amount);
        }
    }

    function withdrawRewardPool(address token, uint256 amount)
        external
        onlyOwner
    {
        if (amount > rewardPoolBalance[token])
            revert TransferError("Amount exceeds reward pool balance");

        rewardPoolBalance[token] -= amount;
        if (token == NATIVE_TOKEN) {
            _safeTransferNative(_msgSender(), amount);
        } else {
            IERC20Metadata(token).safeTransfer(_msgSender(), amount);
        }
    }

    function periodInfo(uint256 _periodId)
        external
        view
        returns (PeriodView memory)
    {
        Period memory period = periods[_periodId];
        return
            PeriodView({
                startTime: period.startTime,
                endTime: period.endTime,
                claimStartTime: period.claimStartTime,
                totalReward: period.totalReward,
                totalPurchaseValue: period.totalPurchaseValue,
                isActive: period.isActive,
                participantsCount: periodParticipants[_periodId].length,
                paymentToken: period.paymentToken,
                rewardToken: period.rewardToken,
                refundEnabled: period.refundEnabled,
                isPurchasable: isPeriodPurchasable(_periodId)
            });
    }

    function setERC1155AsteroidContract(IERC1155AsteroidX _iERC1155Asteroid)
        external
        onlyOwner
    {
        if (iERC1155Asteroid == _iERC1155Asteroid)
            revert InvalidInput("Contract already configured");
        iERC1155Asteroid = _iERC1155Asteroid;
        emit ERC1155AsteroidContractSet(address(_iERC1155Asteroid));
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function calculateUserReward(address user) external view returns (uint256) {
        return _calculateUserReward(user);
    }

    function _calculateUserReward(address user)
        internal
        view
        returns (uint256)
    {
        UserInfo memory userInf = userInfo[user];
        if (userInf.purchaseAmount == 0) return 0;
        if (userInf.hasClaimed) return 0;

        Period memory period = periods[userInf.periodId];
        if (period.totalPurchaseValue == 0) return 0;

        // Get token decimals for the payment token of this period
        PaymentToken memory tokenConfig = supportedTokens[period.paymentToken];
        if (!tokenConfig.isEnabled) return 0; // If token is disabled, return 0

        // Convert reward amount to token decimals
        uint256 rewardWithPrecision = period.totalReward *
            10**tokenConfig.decimals;

        // Use Math.mulDiv for safe multiplication and division, avoiding overflow and precision loss
        return
            Math.mulDiv(
                userInf.purchaseValue,
                rewardWithPrecision,
                period.totalPurchaseValue,
                Math.Rounding.Floor
            );
    }

    function userRewardInfo(address user)
        external
        view
        returns (UserView memory)
    {
        UserInfo memory info = userInfo[user];

        // If user has no purchase record, return default values
        if (info.purchaseAmount == 0) {
            return
                UserView({
                    purchaseAmount: 0,
                    purchaseValue: 0,
                    timestamp: 0,
                    hasClaimed: false,
                    periodId: 0,
                    paymentToken: address(0),
                    claimableReward: 0,
                    claimedReward: 0,
                    paymentTokenDecimals: 0,
                    rewardTokenDecimals: 0
                });
        }

        // Get token decimals from stored configurations
        Period memory period = periods[info.periodId];
        PaymentToken memory paymentTokenConfig = supportedTokens[
            info.paymentToken
        ];
        PaymentToken memory rewardTokenConfig = supportedTokens[
            period.rewardToken
        ];

        // If user has claimed rewards, return recorded information
        if (info.hasClaimed) {
            return
                UserView({
                    purchaseAmount: info.purchaseAmount,
                    purchaseValue: info.purchaseValue,
                    timestamp: info.timestamp,
                    hasClaimed: true,
                    periodId: info.periodId,
                    paymentToken: info.paymentToken,
                    claimableReward: 0,
                    claimedReward: info.claimedReward,
                    paymentTokenDecimals: paymentTokenConfig.decimals,
                    rewardTokenDecimals: rewardTokenConfig.decimals
                });
        }

        // User hasn't claimed rewards, calculate claimable amount
        uint256 claimableReward = _calculateUserReward(user);
        return
            UserView({
                purchaseAmount: info.purchaseAmount,
                purchaseValue: info.purchaseValue,
                timestamp: info.timestamp,
                hasClaimed: false,
                periodId: info.periodId,
                paymentToken: info.paymentToken,
                claimableReward: claimableReward,
                claimedReward: 0,
                paymentTokenDecimals: paymentTokenConfig.decimals,
                rewardTokenDecimals: rewardTokenConfig.decimals
            });
    }

    function setPeriodStatus(uint256 _periodId, bool _isActive)
        external
        onlyOwner
    {
        Period storage period = periods[_periodId];
        if (period.startTime == 0) revert InvalidInput("Period not exists");

        period.isActive = _isActive;
        emit PeriodStatusChanged(_periodId, _isActive);
    }

    function emergencyStopPeriod(uint256 _periodId, string calldata reason)
        external
        onlyOwner
    {
        Period storage period = periods[_periodId];
        if (period.startTime == 0) revert InvalidInput("Period not exists");
        if (!period.isActive) revert InvalidOperation("Period not active");

        period.isActive = false;
        period.endTime = block.timestamp;

        emit PeriodEmergencyStopped(_periodId, reason);
    }

    function contractBalance(address token) external view returns (uint256) {
        if (token == NATIVE_TOKEN) {
            return address(this).balance;
        } else {
            return IERC20Metadata(token).balanceOf(address(this));
        }
    }

    function withdrawableBalance(address token)
        external
        view
        returns (uint256)
    {
        uint256 totalBalance = token == NATIVE_TOKEN
            ? address(this).balance
            : IERC20Metadata(token).balanceOf(address(this));

        uint256 poolBalance = rewardPoolBalance[token];

        return totalBalance > poolBalance ? totalBalance - poolBalance : 0;
    }

    function setTokenPurchaseLimit(uint256 tokenId, uint256 maxAmount)
        external
        onlyOwner
    {
        if (tokenId == 0) revert InvalidInput("Invalid token ID");
        tokenPurchaseLimits[tokenId] = maxAmount;
        emit TokenPurchaseLimitUpdated(tokenId, maxAmount);
    }

    function tokenPurchaseLimit(uint256 tokenId)
        external
        view
        returns (uint256)
    {
        return tokenPurchaseLimits[tokenId];
    }
}
