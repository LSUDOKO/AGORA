const { createPublicClient, http, parseAbi } = require('viem');
const deploymentData = require('./deployments/addresses.testnet.json');

const leaderboardAbi = parseAbi([
  "function getTopAgents(uint256 count) view returns (uint256[] memory, uint256[] memory)",
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

  console.log('Checking LeaderboardTracker at:', deploymentData.contracts.LeaderboardTracker);

  try {
    const [ids, values] = await client.readContract({
      address: deploymentData.contracts.LeaderboardTracker,
      abi: leaderboardAbi,
      functionName: 'getTopAgents',
      args: [10n],
    });
    console.log('Top Agent IDs:', ids.map(id => id.toString()));
    console.log('Top Agent Activity Values:', values.map(v => v.toString()));
  } catch (e) {
    console.error('Failed to fetch from LeaderboardTracker:', e.message);
  }
}

main();
