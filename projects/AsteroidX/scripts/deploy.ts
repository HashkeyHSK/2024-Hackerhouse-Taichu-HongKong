import { ethers } from "hardhat";

async function main() {
  try {
    console.log("Starting deployment...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(
      "Deploying contracts with account:",
      await deployer.getAddress()
    );

    // Deploy Mock ERC1155
    console.log("\nDeploying MockERC1155AsteroidX...");
    const MockERC1155 = await ethers.getContractFactory("MockERC1155AsteroidX");
    const mockERC1155 = await MockERC1155.deploy();
    await mockERC1155.waitForDeployment();
    console.log(
      "MockERC1155AsteroidX deployed to:",
      await mockERC1155.getAddress()
    );

    // Deploy payment token (for testing)
    console.log("\nDeploying Payment Token...");
    const PaymentToken = await ethers.getContractFactory("TestToken");
    const paymentToken = await PaymentToken.deploy("Payment Token", "PAY");
    await paymentToken.waitForDeployment();
    console.log("Payment Token deployed to:", await paymentToken.getAddress());

    // Deploy reward token (for testing)
    console.log("\nDeploying Reward Token...");
    const RewardToken = await ethers.getContractFactory("TestToken");
    const rewardToken = await RewardToken.deploy("Reward Token", "RWD");
    await rewardToken.waitForDeployment();
    console.log("Reward Token deployed to:", await rewardToken.getAddress());

    // Deploy RewardAsteroidX
    console.log("\nDeploying RewardAsteroidX...");
    const RewardAsteroidX = await ethers.getContractFactory("RewardAsteroidX");
    const rewardAsteroidX = await RewardAsteroidX.deploy();
    await rewardAsteroidX.waitForDeployment();
    console.log(
      "RewardAsteroidX deployed to:",
      await rewardAsteroidX.getAddress()
    );

    // Initialize settings
    console.log("\nInitializing RewardAsteroidX...");

    // Set ERC1155 contract
    console.log("Setting ERC1155 contract...");
    await rewardAsteroidX.setERC1155AsteroidContract(
      await mockERC1155.getAddress()
    );

    // Set payment token
    console.log("Setting payment token...");
    await rewardAsteroidX.setPaymentToken(
      await paymentToken.getAddress(),
      true,
      ethers.parseEther("1"), // Minimum amount
      ethers.parseEther("1000") // Maximum amount
    );

    // Set reward token
    console.log("Setting reward token...");
    await rewardAsteroidX.setPaymentToken(
      await rewardToken.getAddress(),
      true,
      ethers.parseEther("1"),
      ethers.parseEther("1000")
    );

    // Set token purchase limit
    console.log("Setting token purchase limit...");
    await rewardAsteroidX.setTokenPurchaseLimit(1, ethers.parseEther("100"));

    console.log("\nDeployment completed!");
    console.log("\nContract Addresses:");
    console.log("--------------------");
    console.log("MockERC1155AsteroidX:", await mockERC1155.getAddress());
    console.log("Payment Token:", await paymentToken.getAddress());
    console.log("Reward Token:", await rewardToken.getAddress());
    console.log("RewardAsteroidX:", await rewardAsteroidX.getAddress());

    // Verify contract settings
    console.log("\nVerifying contract settings...");
    const erc1155Address = await rewardAsteroidX.iERC1155Asteroid();
    console.log(
      "ERC1155 contract set:",
      erc1155Address === (await mockERC1155.getAddress())
    );

    const paymentTokenInfo = await rewardAsteroidX.supportedTokens(
      await paymentToken.getAddress()
    );
    console.log("Payment token enabled:", paymentTokenInfo.isEnabled);

    const rewardTokenInfo = await rewardAsteroidX.supportedTokens(
      await rewardToken.getAddress()
    );
    console.log("Reward token enabled:", rewardTokenInfo.isEnabled);

    const purchaseLimit = await rewardAsteroidX.tokenPurchaseLimit(1);
    console.log(
      "Token purchase limit set:",
      purchaseLimit.toString() === ethers.parseEther("100").toString()
    );
  } catch (error) {
    console.error("Error during deployment:", error);
    throw error;
  }
}

// Run deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
