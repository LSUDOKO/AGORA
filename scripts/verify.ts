import hre from "hardhat";
import deploymentData from "../deployments/addresses.json";

async function verifyContract(address: string, constructorArguments: unknown[] = [], contract?: string) {
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments,
      contract,
    });
    console.log(`Verified: ${address}`);
  } catch (error) {
    console.error(`Verification failed for ${address}:`, error);
  }
}

async function main() {
  // Set network from environment variable
  const targetNetwork = process.env.HARDHAT_NETWORK || "xlayer_testnet";
  if (hre.network.name !== targetNetwork) {
    console.log(`Switching to network: ${targetNetwork}`);
    hre.changeNetwork(targetNetwork);
  }

  const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);
  const { contracts, usdc, testTokens, chainId: deploymentChainId } = deploymentData;

  if (!contracts.AgentRegistry || !contracts.SkillsRegistry || !contracts.x402PaymentRouter || !contracts.LeaderboardTracker) {
    throw new Error("deployments/addresses.json is incomplete. Deploy contracts first.");
  }

  if (!usdc) {
    throw new Error("USDC address missing from deployments/addresses.json");
  }

  const paymentRouterAddress = contracts.x402PaymentRouter;
  const leaderboardAddress = contracts.LeaderboardTracker;
  const agentRegistryAddress = contracts.AgentRegistry;
  const skillsRegistryAddress = contracts.SkillsRegistry;

  if (deploymentChainId && Number(deploymentChainId) !== chainId) {
    throw new Error(`Deployment file chainId ${deploymentChainId} does not match current network chainId ${chainId}`);
  }

  console.log(`Starting verification on chain ${chainId}...`);

  if (chainId === 1952 && testTokens?.TestUSDC) {
    await verifyContract(
      testTokens.TestUSDC,
      [deploymentData.deployer, 1_000_000_000_000],
      "contracts/TestUSDC.sol:TestUSDC",
    );
  }

  await verifyContract(agentRegistryAddress, [], "contracts/AgentRegistry.sol:AgentRegistry");
  await verifyContract(skillsRegistryAddress, [], "contracts/SkillsRegistry.sol:SkillsRegistry");
  await verifyContract(
    leaderboardAddress,
    [paymentRouterAddress],
    "contracts/LeaderboardTracker.sol:LeaderboardTracker",
  );
  await verifyContract(
    paymentRouterAddress,
    [usdc, agentRegistryAddress, skillsRegistryAddress, leaderboardAddress],
    "contracts/x402PaymentRouter.sol:x402PaymentRouter",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
