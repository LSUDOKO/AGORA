import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getContractAddress } from "viem";
import hre from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const MAINNET_USDC = "0x74b7F16337b8972027F6196A17a631aC6dE26d22";
const TESTNET_USDC_SUPPLY = 1_000_000_000_000;

async function main() {
  // Set network from environment variable
  const targetNetwork = process.env.HARDHAT_NETWORK || "xlayer_testnet";
  if (hre.network.name !== targetNetwork) {
    console.log(`Switching to network: ${targetNetwork}`);
    hre.changeNetwork(targetNetwork);
  }

  const [deployer] = await hre.ethers.getSigners() as HardhatEthersSigner[];
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = hre.network.name;
  const isTestnet = chainId === 1952;

  const currentNonce = await hre.ethers.provider.getTransactionCount(deployer.address);
  const predictedRouterNonce = isTestnet ? currentNonce + 4 : currentNonce + 3;
  const predictedRouterAddress = getContractAddress({
    from: deployer.address as `0x${string}`,
    nonce: BigInt(predictedRouterNonce),
  });

  console.log("Deploying AGORA contracts...");
  console.log(`Network: ${networkName} (${chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Current nonce: ${currentNonce}`);
  console.log(`Predicted x402PaymentRouter: ${predictedRouterAddress}`);

  let usdcAddress = MAINNET_USDC;
  let testUsdcAddress = "";

  if (isTestnet) {
    const TestUSDC = await hre.ethers.getContractFactory("TestUSDC");
    const testUsdc = await TestUSDC.deploy(deployer.address, TESTNET_USDC_SUPPLY);
    await testUsdc.waitForDeployment();
    testUsdcAddress = await testUsdc.getAddress();
    usdcAddress = testUsdcAddress;
    console.log(`TestUSDC deployed: ${testUsdcAddress}`);
  } else {
    console.log(`USDC: ${usdcAddress}`);
  }

  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log(`AgentRegistry deployed: ${agentRegistryAddress}`);

  const SkillsRegistry = await hre.ethers.getContractFactory("SkillsRegistry");
  const skillsRegistry = await SkillsRegistry.deploy();
  await skillsRegistry.waitForDeployment();
  const skillsRegistryAddress = await skillsRegistry.getAddress();
  console.log(`SkillsRegistry deployed: ${skillsRegistryAddress}`);

  const LeaderboardTracker = await hre.ethers.getContractFactory("LeaderboardTracker");
  const leaderboardTracker = await LeaderboardTracker.deploy(predictedRouterAddress);
  await leaderboardTracker.waitForDeployment();
  const leaderboardTrackerAddress = await leaderboardTracker.getAddress();
  console.log(`LeaderboardTracker deployed: ${leaderboardTrackerAddress}`);

  const x402PaymentRouter = await hre.ethers.getContractFactory("x402PaymentRouter");
  const paymentRouter = await x402PaymentRouter.deploy(
    usdcAddress,
    agentRegistryAddress,
    skillsRegistryAddress,
    leaderboardTrackerAddress,
  );
  await paymentRouter.waitForDeployment();
  const paymentRouterAddress = await paymentRouter.getAddress();
  console.log(`x402PaymentRouter deployed: ${paymentRouterAddress}`);

  if (paymentRouterAddress.toLowerCase() !== predictedRouterAddress.toLowerCase()) {
    throw new Error(
      `Predicted router address mismatch. Expected ${predictedRouterAddress}, got ${paymentRouterAddress}.`,
    );
  }

  const output = {
    network: networkName,
    chainId,
    deployer: deployer.address,
    usdc: usdcAddress,
    paymentTokenSymbol: isTestnet ? "tUSDC" : "USDC",
    testTokens: {
      TestUSDC: testUsdcAddress,
    },
    contracts: {
      AgentRegistry: agentRegistryAddress,
      SkillsRegistry: skillsRegistryAddress,
      x402PaymentRouter: paymentRouterAddress,
      LeaderboardTracker: leaderboardTrackerAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  mkdirSync(join(process.cwd(), "deployments"), { recursive: true });
  writeFileSync(join(process.cwd(), "deployments", "addresses.json"), `${JSON.stringify(output, null, 2)}\n`);

  console.log("\nDeployment summary:");
  console.table(output.contracts);
  console.log("Saved deployment addresses to deployments/addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
