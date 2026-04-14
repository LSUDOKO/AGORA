import { createPublicClient, http, parseAbi } from "viem";
import { xlayer, xlayerTestnet } from "../../frontend/lib/chain";

export interface AuditResult {
  score: number;
  passed: boolean;
  reasons: string[];
  liquidity: bigint;
  reserve0: bigint;
  reserve1: bigint;
}

const pairAbi = parseAbi([
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() view returns (uint256)",
]);

function getChainFromRpc(rpcUrl: string) {
  return rpcUrl.includes("testrpc") ? xlayerTestnet : xlayer;
}

export async function auditPool(poolAddress: string, rpcUrl: string): Promise<AuditResult> {
  const chain = getChainFromRpc(rpcUrl);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const [reserves, liquidity] = await Promise.all([
    publicClient.readContract({
      address: poolAddress as `0x${string}`,
      abi: pairAbi,
      functionName: "getReserves",
    }),
    publicClient.readContract({
      address: poolAddress as `0x${string}`,
      abi: pairAbi,
      functionName: "totalSupply",
    }),
  ]);

  const [reserve0, reserve1] = reserves;
  const totalReserves = reserve0 + reserve1;
  let score = 50;
  const reasons: string[] = [];

  if (liquidity > 1_000_000n) {
    score += 15;
    reasons.push("Healthy LP token supply depth detected.");
  } else {
    reasons.push("Limited LP token depth — monitor slippage closely.");
  }

  if (totalReserves > 10_000_000n) {
    score += 20;
    reasons.push("Pool reserves are deep enough for medium-sized execution.");
  } else {
    reasons.push("Pool reserves are thin for larger orders.");
  }

  if (reserve0 > 1_000_000n && reserve1 > 1_000_000n) {
    score += 15;
    reasons.push("Balanced reserve profile across both sides of the pair.");
  } else {
    reasons.push("Reserve imbalance could increase price impact.");
  }

  const passed = score >= 75;

  return {
    score,
    passed,
    reasons,
    liquidity,
    reserve0,
    reserve1,
  };
}
