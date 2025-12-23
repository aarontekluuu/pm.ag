import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy MockOpinionExchange first (needed for TradeRouter)
  console.log("\n1. Deploying MockOpinionExchange...");
  const MockOpinionExchange = await ethers.getContractFactory("MockOpinionExchange");
  const mockOpinionExchange = await MockOpinionExchange.deploy();
  await mockOpinionExchange.waitForDeployment();
  const mockOpinionAddress = await mockOpinionExchange.getAddress();
  console.log("MockOpinionExchange deployed to:", mockOpinionAddress);

  // Deploy FeeTracker (needs TradeRouter address, but we'll set it after)
  console.log("\n2. Deploying FeeTracker...");
  const FeeTracker = await ethers.getContractFactory("FeeTracker");
  // We'll deploy with a placeholder address and update it after TradeRouter is deployed
  const feeTracker = await FeeTracker.deploy(ethers.ZeroAddress);
  await feeTracker.waitForDeployment();
  const feeTrackerAddress = await feeTracker.getAddress();
  console.log("FeeTracker deployed to:", feeTrackerAddress);

  // Get fee wallet address (use deployer for now, or set via env)
  const feeWallet = process.env.FEE_WALLET_ADDRESS || deployer.address;
  console.log("Fee wallet:", feeWallet);

  // Get fee basis points (default 50 = 0.5%)
  const feeBasisPoints = process.env.FEE_BASIS_POINTS 
    ? parseInt(process.env.FEE_BASIS_POINTS) 
    : 50;

  // Deploy TradeRouter
  console.log("\n3. Deploying TradeRouter...");
  const TradeRouter = await ethers.getContractFactory("TradeRouter");
  const tradeRouter = await TradeRouter.deploy(
    mockOpinionAddress,
    feeWallet,
    feeBasisPoints
  );
  await tradeRouter.waitForDeployment();
  const tradeRouterAddress = await tradeRouter.getAddress();
  console.log("TradeRouter deployed to:", tradeRouterAddress);

  // Update FeeTracker with TradeRouter address
  console.log("\n4. Updating FeeTracker with TradeRouter address...");
  const updateTx = await feeTracker.setTradeRouter(tradeRouterAddress);
  await updateTx.wait();
  console.log("FeeTracker updated");

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: await ethers.provider.getNetwork().then(n => n.name),
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      MockOpinionExchange: mockOpinionAddress,
      TradeRouter: tradeRouterAddress,
      FeeTracker: feeTrackerAddress,
    },
    feeWallet,
    feeBasisPoints,
    timestamp: new Date().toISOString(),
  };

  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const networkName = (await ethers.provider.getNetwork()).name;
  const deploymentFile = path.join(deploymentDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✅ Deployment complete!");
  console.log("\nContract addresses:");
  console.log("  MockOpinionExchange:", mockOpinionAddress);
  console.log("  TradeRouter:", tradeRouterAddress);
  console.log("  FeeTracker:", feeTrackerAddress);
  console.log("\nDeployment info saved to:", deploymentFile);
  
  console.log("\n📝 Add these to your .env file:");
  console.log(`MOCK_OPINION_EXCHANGE_ADDRESS=${mockOpinionAddress}`);
  console.log(`TRADE_ROUTER_ADDRESS=${tradeRouterAddress}`);
  console.log(`FEE_TRACKER_ADDRESS=${feeTrackerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

