// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

//用于分红的合约，把 ERC20 代币打给本合约，各个股东通过harvest获取分红
abstract contract AbstractShare {
    struct UserInfo {
        uint rewardDebt;
        uint share; //股份
    }

    mapping (address => UserInfo) public userInfo;

    uint public totalShare; //总股份 = 所有股东的share股份相加

    uint internal totalReleased;

    uint internal lastTotal;

    uint public totalReward;

    uint internal accPerShare;

    event SetUser(address indexed wallet, uint share);
    event Harvest(address indexed wallet, uint amount);

    constructor() {
    }

    //股东管理
    function setUser(address _wallet, uint _share) internal returns (uint reward) {
        UserInfo storage user = userInfo[_wallet];

        if (_share == 0) { //移除
            reward = _harvest(_wallet);
            totalShare = totalShare - user.share;
            delete userInfo[_wallet];
            emit SetUser(_wallet, _share);
        
        } else if (user.share == 0) { //新增
            update();
            totalShare = totalShare + _share;
            uint myRewardDebt = _share * accPerShare / 1e12;
            userInfo[_wallet] = UserInfo(myRewardDebt, _share);
            emit SetUser(_wallet, _share);
        
        } else {
            reward = _harvest(_wallet);
            totalShare = totalShare + _share - user.share;
            user.share = _share;
            user.rewardDebt = _share * accPerShare / 1e12;
            emit SetUser(_wallet, _share);
        }
    }

    function update() internal {
        if (totalShare == 0) {
            return;
        }
        console.log("AbstractShare:update::", totalReleased, totalReward, lastTotal);
        uint reward = totalReleased + totalReward - lastTotal;
        accPerShare = accPerShare + reward * 1e12 / totalShare;
        lastTotal = totalReleased + totalReward;
    }

    function _harvest(address _wallet) internal returns (uint reward) {
        UserInfo storage user = userInfo[_wallet];
        if (user.share == 0) {
            return 0;
        }

        update();

        reward = pendingReward(_wallet);

        if (reward > 0) {
            user.rewardDebt = user.share * accPerShare / 1e12;
            totalReleased = totalReleased + reward;
            totalReward -= reward;
            emit Harvest(_wallet, reward);
        }
    }

    function receiveReward(uint ammount) internal {
        totalReward += ammount;
    }

    function pendingReward(address _wallet) public view returns (uint) {
        UserInfo memory user = userInfo[_wallet];
        uint reward = totalReleased + totalReward - lastTotal;
        uint acc = accPerShare + reward * 1e12 / totalShare;
        return user.share * acc / 1e12 - user.rewardDebt;
    }
}
