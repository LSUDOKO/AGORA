const { createPublicClient, http } = require('viem');
const deploymentData = require('./deployments/addresses.testnet.json');
const { parseAbi } = require('viem');

const agentRegistryAbi = parseAbi([
  "function ownerToAgentId(address owner) view returns (uint256)",
  "function getAgent(uint256 agentId) view returns (address owner, string name, uint256 totalTxns, uint256 totalEarned)",
]);

const xlayerTestnet = {
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://xlayertestrpc.okx.com"] } },
};

async function main() {
  const client = createPublicClient({
    chain: xlayerTestnet,
    transport: http("https://xlayertestrpc.okx.com"),
  });

  const address = deploymentData.deployer;
  console.log('Checking address:', address);

  const agentId = await client.readContract({
    address: deploymentData.contracts.AgentRegistry,
    abi: agentRegistryAbi,
    functionName: 'ownerToAgentId',
    args: [address],
  });

  console.log('Agent ID for deployer:', agentId.toString());

  if (agentId > 0n) {
    const data = await client.readContract({
      address: deploymentData.contracts.AgentRegistry,
      abi: agentRegistryAbi,
      functionName: 'getAgent',
      args: [agentId],
    });
    console.log('Agent Data:', data);
  }
}

main();
