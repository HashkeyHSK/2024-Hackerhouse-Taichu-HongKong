import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractTransactionResponse } from "ethers";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import {
  RewardAsteroidX,
  TestToken,
  MockERC1155AsteroidX,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RewardAsteroidX", function () {
  // First define deployRewardFixture
  async function deployRewardFixture() {
    // 获取签名者账户
    const [owner, user1, user2, user3] = await ethers.getSigners();

    // 部署ERC20代币用于测试
    const TestToken = await ethers.getContractFactory("TestToken");
    const paymentToken = (await TestToken.deploy(
      "Payment Token",
      "PAY"
    )) as TestToken;
    const rewardToken = (await TestToken.deploy(
      "Reward Token",
      "RWD"
    )) as TestToken;

    // 部署Mock ERC1155合约
    const MockERC1155 = await ethers.getContractFactory("MockERC1155AsteroidX");
    const mockERC1155 = (await MockERC1155.deploy()) as MockERC1155AsteroidX;

    // 部署RewardAsteroidX合约
    const RewardAsteroidX = await ethers.getContractFactory("RewardAsteroidX");
    const rewardAsteroidX = (await RewardAsteroidX.deploy()) as RewardAsteroidX;

    // 初始化设置
    await rewardAsteroidX.setERC1155AsteroidContract(
      await mockERC1155.getAddress()
    );

    // 设置支付代币
    await rewardAsteroidX.setPaymentToken(
      await paymentToken.getAddress(),
      true,
      ethers.parseEther("1"), // 最小金额
      ethers.parseEther("1000") // 最大金额
    );

    // 设置奖励代币
    await rewardAsteroidX.setPaymentToken(
      await rewardToken.getAddress(),
      true,
      ethers.parseEther("1"),
      ethers.parseEther("1000")
    );

    // 设置代币购买限制
    await rewardAsteroidX.setTokenPurchaseLimit(1, ethers.parseEther("100"));

    return {
      rewardAsteroidX,
      mockERC1155,
      paymentToken,
      rewardToken,
      owner,
      user1,
      user2,
      user3,
    };
  }

  // Then define setupActivePeriod at the root level
  async function setupActivePeriod() {
    const fixture = await loadFixture(deployRewardFixture);
    const { rewardAsteroidX, paymentToken, rewardToken } = fixture;

    const now = await time.latest();
    const startTime = now + 60;
    const endTime = startTime + 86400;
    const claimStartTime = endTime + 3600;
    const totalReward = ethers.parseEther("1000");

    await rewardAsteroidX.createNewPeriod(
      startTime,
      endTime,
      claimStartTime,
      totalReward,
      await paymentToken.getAddress(),
      await rewardToken.getAddress(),
      false
    );

    await rewardAsteroidX.setPeriodStatus(1, true);
    await time.increaseTo(startTime);

    return { ...fixture };
  }

  // Add setupPurchasedPeriod at root level
  async function setupPurchasedPeriod() {
    const fixture = await setupActivePeriod();
    const { rewardAsteroidX, paymentToken, rewardToken, user1, user2 } =
      fixture;

    // Setup purchases
    const purchase1Amount = ethers.parseEther("10");
    const purchase2Amount = ethers.parseEther("20");

    await paymentToken.mint(user1.address, purchase1Amount);
    await paymentToken.mint(user2.address, purchase2Amount);
    await paymentToken
      .connect(user1)
      .approve(await rewardAsteroidX.getAddress(), purchase1Amount);
    await paymentToken
      .connect(user2)
      .approve(await rewardAsteroidX.getAddress(), purchase2Amount);

    await rewardAsteroidX
      .connect(user1)
      .purchased(1, purchase1Amount, await paymentToken.getAddress());
    await rewardAsteroidX
      .connect(user2)
      .purchased(1, purchase2Amount, await paymentToken.getAddress());

    const totalReward = ethers.parseEther("1000");
    await rewardToken.mint(fixture.owner.address, totalReward);
    await rewardToken
      .connect(fixture.owner)
      .approve(await rewardAsteroidX.getAddress(), totalReward);
    await rewardAsteroidX.depositRewardToken(
      await rewardToken.getAddress(),
      totalReward
    );

    return { ...fixture, purchase1Amount, purchase2Amount };
  }

  // Then your test descriptions
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { rewardAsteroidX, owner } = await loadFixture(deployRewardFixture);
      expect(await rewardAsteroidX.owner()).to.equal(owner.address);
    });

    it("Should support native token by default", async function () {
      const { rewardAsteroidX } = await loadFixture(deployRewardFixture);
      const nativeToken = await rewardAsteroidX.supportedTokens(
        ethers.ZeroAddress
      );
      expect(nativeToken.isEnabled).to.be.true;
    });
  });

  describe("Period Management", function () {
    it("Should create a new period correctly", async function () {
      const { rewardAsteroidX, paymentToken, rewardToken } = await loadFixture(
        deployRewardFixture
      );

      const now = await time.latest();
      const startTime = now + 3600; // 1 hour from now
      const endTime = startTime + 86400; // 24 hours duration
      const claimStartTime = endTime + 3600; // 1 hour after end
      const totalReward = ethers.parseEther("1000");

      await rewardAsteroidX.createNewPeriod(
        startTime,
        endTime,
        claimStartTime,
        totalReward,
        paymentToken.target,
        rewardToken.target,
        false
      );

      const periodId = await rewardAsteroidX.currentPeriodId();
      expect(periodId).to.equal(1);

      const period = await rewardAsteroidX.periods(periodId);
      expect(period.startTime).to.equal(startTime);
      expect(period.endTime).to.equal(endTime);
      expect(period.totalReward).to.equal(totalReward);
    });

    it("Should fail to create period with invalid time range", async function () {
      const { rewardAsteroidX, paymentToken, rewardToken } = await loadFixture(
        deployRewardFixture
      );

      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime - 1; // Invalid: end before start
      const claimStartTime = endTime + 3600;
      const totalReward = ethers.parseEther("1000");

      await expect(
        rewardAsteroidX.createNewPeriod(
          startTime,
          endTime,
          claimStartTime,
          totalReward,
          paymentToken.target,
          rewardToken.target,
          false
        )
      ).to.be.revertedWithCustomError(rewardAsteroidX, "InvalidInput");
    });
  });

  describe("Purchase", function () {
    it("Should allow purchase with ERC20 token", async function () {
      const { rewardAsteroidX, paymentToken, user1 } =
        await setupActivePeriod();

      const purchaseAmount = ethers.parseEther("10");

      // Approve tokens
      await paymentToken.mint(user1.address, purchaseAmount);
      await paymentToken
        .connect(user1)
        .approve(rewardAsteroidX.target, purchaseAmount);

      // Purchase
      await expect(
        rewardAsteroidX
          .connect(user1)
          .purchased(1, purchaseAmount, paymentToken.target)
      ).to.emit(rewardAsteroidX, "Purchase");

      const userInfo = await rewardAsteroidX.userInfo(user1.address);
      expect(userInfo.purchaseAmount).to.equal(purchaseAmount);
    });

    it("Should allow purchase with native token", async function () {
      const { rewardAsteroidX, user1 } = await setupActivePeriod();

      const purchaseAmount = ethers.parseEther("1");

      // Purchase with native token
      await expect(
        rewardAsteroidX
          .connect(user1)
          .purchased(1, purchaseAmount, ethers.ZeroAddress, {
            value: purchaseAmount,
          })
      ).to.emit(rewardAsteroidX, "Purchase");

      const userInfo = await rewardAsteroidX.userInfo(user1.address);
      expect(userInfo.purchaseAmount).to.equal(purchaseAmount);
    });
  });

  describe("Rewards", function () {
    async function setupPurchasedPeriod() {
      const fixture = await setupActivePeriod();
      const { rewardAsteroidX, paymentToken, rewardToken, user1, user2 } =
        fixture;

      // Setup purchases
      const purchase1Amount = ethers.parseEther("10");
      const purchase2Amount = ethers.parseEther("20");

      // Mint and approve tokens
      await paymentToken.mint(user1.address, purchase1Amount);
      await paymentToken.mint(user2.address, purchase2Amount);
      await paymentToken
        .connect(user1)
        .approve(rewardAsteroidX.target, purchase1Amount);
      await paymentToken
        .connect(user2)
        .approve(rewardAsteroidX.target, purchase2Amount);

      // Make purchases
      await rewardAsteroidX
        .connect(user1)
        .purchased(1, purchase1Amount, paymentToken.target);
      await rewardAsteroidX
        .connect(user2)
        .purchased(1, purchase2Amount, paymentToken.target);

      // Deposit reward tokens
      const totalReward = ethers.parseEther("1000");
      await rewardToken.mint(fixture.owner.address, totalReward);
      await rewardToken
        .connect(fixture.owner)
        .approve(rewardAsteroidX.target, totalReward);
      await rewardAsteroidX.depositRewardToken(rewardToken.target, totalReward);

      return { ...fixture, purchase1Amount, purchase2Amount };
    }

    it("Should calculate rewards correctly", async function () {
      const { rewardAsteroidX, user1, user2 } = await setupPurchasedPeriod();

      const user1Reward = await rewardAsteroidX.calculateUserReward(
        user1.address
      );
      const user2Reward = await rewardAsteroidX.calculateUserReward(
        user2.address
      );

      expect(user1Reward).to.be.gt(0);
      expect(user2Reward).to.be.gt(user1Reward); // User2 purchased more
    });

    it("Should allow claiming rewards after claim start time", async function () {
      const { rewardAsteroidX, user1 } = await setupPurchasedPeriod();

      // Move time to claim start
      const period = await rewardAsteroidX.periods(1);
      await time.increaseTo(period.claimStartTime);

      await expect(rewardAsteroidX.connect(user1).claim()).to.emit(
        rewardAsteroidX,
        "Claim"
      );

      const userInfo = await rewardAsteroidX.userInfo(user1.address);
      expect(userInfo.hasClaimed).to.be.true;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency stop period", async function () {
      const { rewardAsteroidX } = await setupActivePeriod();

      await expect(rewardAsteroidX.emergencyStopPeriod(1, "Emergency"))
        .to.emit(rewardAsteroidX, "PeriodEmergencyStopped")
        .withArgs(1, "Emergency");

      const period = await rewardAsteroidX.periods(1);
      expect(period.isActive).to.be.false;
    });

    it("Should allow owner to withdraw reward pool", async function () {
      const { rewardAsteroidX, rewardToken, owner } =
        await setupPurchasedPeriod();

      const withdrawAmount = ethers.parseEther("100");
      await expect(
        rewardAsteroidX.withdrawRewardPool(rewardToken.target, withdrawAmount)
      ).to.changeTokenBalance(rewardToken, owner, withdrawAmount);
    });
  });
});
