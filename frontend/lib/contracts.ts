import { erc20Abi, parseAbi } from "viem";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1952);
const isTestnet = chainId === 1952;

function getEnvAddress(envKey: string, fallback: string): `0x${string}` {
  const envAddr = process.env[envKey];
  return (envAddr || fallback) as `0x${string}`;
}

export const addresses = {
  agentRegistry: getEnvAddress("NEXT_PUBLIC_AGENT_REGISTRY", "0x9FCe359ab7A590d0491666B1f0873036f119Ef1d"),
  skillsRegistry: getEnvAddress("NEXT_PUBLIC_SKILLS_REGISTRY", "0xc24759ec6A8E9006B47a5e7BdA6e13e589D8b841"),
  paymentRouter: getEnvAddress("NEXT_PUBLIC_PAYMENT_ROUTER", "0x1d449F519D73e6A65cD65F0A29D4771b42f46CaE"),
  leaderboard: getEnvAddress("NEXT_PUBLIC_LEADERBOARD", "0x1C1D38899909A1DAa23c58DB5A798823E31f2ed2"),
  usdc: isTestnet
    ? getEnvAddress("NEXT_PUBLIC_TEST_USDC", "0x70799d35aC43AD21e106270E14365a9B96BDc993")
    : getEnvAddress("NEXT_PUBLIC_USDC", "0xdC00eC7B9e7F2d5E07aD2f73D4a3B89fD52F9F2F"),
  testUsdc: isTestnet
    ? getEnvAddress("NEXT_PUBLIC_TEST_USDC", "0x70799d35aC43AD21e106270E14365a9B96BDc993")
    : "" as `0x${string}`,
};

export const agentRegistryAbi = parseAbi([
  "function registerAgent(string name) returns (uint256)",
  "function getAgent(uint256 agentId) view returns (address owner, string name, uint256 totalTxns, uint256 totalEarned)",
  "function incrementTxCount(uint256 agentId)",
  "function recordEarnings(uint256 agentId, uint256 amount)",
  "function ownerToAgentId(address owner) view returns (uint256)",
  "event AgentRegistered(uint256 indexed agentId, address indexed owner, string name)",
  "event AgentTxCountIncremented(uint256 indexed agentId, uint256 newTotalTxns)",
  "event AgentEarningsRecorded(uint256 indexed agentId, uint256 amount, uint256 newTotalEarned)",
]);

export const skillsRegistryAbi = parseAbi([
  "function registerSkill(string name, string description, uint256 priceUSDC) returns (uint256)",
  "function getSkill(uint256 skillId) view returns (address provider, string name, uint256 priceUSDC, uint256 totalHires)",
  "function getSkillDescription(uint256 skillId) view returns (string description)",
  "function skillCount() view returns (uint256)",
  "event SkillRegistered(uint256 indexed skillId, address indexed provider, string name, uint256 priceUSDC)",
  "event SkillHireCountIncremented(uint256 indexed skillId, uint256 newTotalHires)",
]);

export const paymentRouterAbi = parseAbi([
  "function hireSkill(uint256 agentId, uint256 skillId) returns (uint256)",
  "function getReceipt(uint256 receiptId) view returns (uint256 agentId, uint256 skillId, uint256 amount, uint256 timestamp, bool completed)",
  "function markCompleted(uint256 receiptId)",
  "function receiptCount() view returns (uint256)",
  "event SkillHired(uint256 indexed receiptId, uint256 indexed agentId, uint256 indexed skillId, address provider, uint256 amount)",
  "event SkillCompleted(uint256 indexed receiptId)",
]);

export const leaderboardAbi = parseAbi([
  "function getTopAgents(uint256 limit) view returns ((uint256 agentId, uint256 txCount, uint256 usdcPaid)[] memory)",
  "function activities(uint256 agentId) view returns (uint256 agentIdValue, uint256 txCount, uint256 usdcPaid)",
  "event ActivityRecorded(uint256 indexed agentId, uint256 totalTxns, uint256 totalUsdcPaid)",
]);

export const usdcAbi = erc20Abi;
