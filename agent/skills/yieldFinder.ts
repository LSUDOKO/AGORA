import { createPublicClient, formatUnits, http, parseAbi } from "viem";
import { xlayer, xlayerTestnet } from "../../frontend/lib/chain";

export interface YieldOpportunity {
  poolAddress: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  fee: number;
  liquidity: bigint;
  estimatedAPY: number;
  amount: bigint;
  reserve0?: string;
  reserve1?: string;
}

const pairAbi = parseAbi([
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() view returns (uint256)",
]);

const CANDIDATE_POOLS: Record<number, `0x${string}`[]> = {
  196: [
    "0x2E5B0E0F5d7E3c1A85f6D7A5A5d0D0f8f2B56cB7",
    "0x4b2f5E8bB9b6dD4e0F3Bf8B6D6e7e0F2B1A7d1C4",
    "0x8C8d7C46219D9205f056f28fee5950aD564d7465",
  ],
  1952: [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333",
  ],
};

function getChainFromRpc(rpcUrl: string) {
  return rpcUrl.includes("testrpc") ? xlayerTestnet : xlayer;
}

function calculateEstimatedApy(liquidity: bigint, reserve0: bigint, reserve1: bigint): number {
  const totalValue = Number(reserve0 + reserve1) / 1e6;
  const liq = Number(liquidity > 0n ? liquidity : 1n) / 1e6;
  const utilization = totalValue > 0 ? Math.min(totalValue / Math.max(liq, 1), 5) : 0.75;
  return Number((6 + utilization * 4.2).toFixed(2));
}

export async function findYield(rpcUrl: string): Promise<YieldOpportunity[]> {
  const chain = getChainFromRpc(rpcUrl);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const candidatePools = CANDIDATE_POOLS[chain.id] ?? [];
  const opportunities: YieldOpportunity[] = [];

  for (const poolAddress of candidatePools) {
    try {
      const [token0, token1, reserves, liquidity] = await Promise.all([
        publicClient.readContract({ address: poolAddress, abi: pairAbi, functionName: "token0" }),
        publicClient.readContract({ address: poolAddress, abi: pairAbi, functionName: "token1" }),
        publicClient.readContract({ address: poolAddress, abi: pairAbi, functionName: "getReserves" }),
        publicClient.readContract({ address: poolAddress, abi: pairAbi, functionName: "totalSupply" }),
      ]);

      const [reserve0, reserve1] = reserves;
      opportunities.push({
        poolAddress,
        token0,
        token1,
        fee: 3000,
        liquidity,
        estimatedAPY: calculateEstimatedApy(liquidity, reserve0, reserve1),
        amount: 1_000_000n,
        reserve0: formatUnits(reserve0, 6),
        reserve1: formatUnits(reserve1, 6),
      });
    } catch (error) {
      console.warn(`Skipping pool ${poolAddress}:`, error);
    }
  }

  return opportunities.sort((a, b) => b.estimatedAPY - a.estimatedAPY);
}
