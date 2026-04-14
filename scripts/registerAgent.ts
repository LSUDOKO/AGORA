import hre from "hardhat";
import deploymentData from "../deployments/addresses.json";

async function main() {
  // Set network from environment variable
  const targetNetwork = process.env.HARDHAT_NETWORK || "xlayer_testnet";
  if (hre.network.name !== targetNetwork) {
    console.log(`Switching to network: ${targetNetwork}`);
    hre.changeNetwork(targetNetwork);
  }

  const [deployer] = await hre.ethers.getSigners();
  const agentRegistryAddress = deploymentData.contracts.AgentRegistry;

  if (!agentRegistryAddress) {
    throw new Error("Missing AgentRegistry address in deployments/addresses.json");
  }

  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = AgentRegistry.attach(agentRegistryAddress);

  console.log(`Registering agent for wallet ${deployer.address}`);
  console.log(`AgentRegistry: ${agentRegistryAddress}`);

  // Check if already registered
  const existingAgentId = await agentRegistry.ownerToAgentId(deployer.address);
  if (existingAgentId > 0n) {
    console.log(`Agent already registered with ID: ${existingAgentId}`);
    return;
  }

  const tx = await agentRegistry.registerAgent("Prime Agent");
  const receipt = await tx.wait();
  console.log(`Agent registered in tx ${receipt?.hash}`);

  const agentId = await agentRegistry.ownerToAgentId(deployer.address);
  console.log(`Agent ID: ${agentId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
