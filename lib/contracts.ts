import deploymentData from "../deployments/addresses.testnet.json";
import { erc20Abi, parseAbi } from "viem";

if (deploymentData.chainId !== 1952) {
  throw new Error(
    `Invalid deployment file: expected chainId 1952 (X Layer testnet), got ${deploymentData.chainId}`,
  );
}

export const addresses = {
  agentRegistry: deploymentData.contracts.AgentRegistry as `0x${string}`,
  skillsRegistry: deploymentData.contracts.SkillsRegistry as `0x${string}`,
  paymentRouter: deploymentData.contracts.x402PaymentRouter as `0x${string}`,
  leaderboard: deploymentData.contracts.LeaderboardTracker as `0x${string}`,
  usdc: deploymentData.usdc as `0x${string}`,
  testUsdc: (deploymentData.testTokens?.TestUSDC || "") as `0x${string}`,
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
