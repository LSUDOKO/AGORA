import { createPublicClient, formatUnits, http, parseAbi } from "viem";
import { xlayer, xlayerTestnet } from "../../frontend/lib/chain";
import { execSync } from "node:child_process";

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

const MAINNET_USDC = "0x74b7F16337b8972027F6196A17a631aC6dE26d22";
const MAINNET_WETH = "0x5A77f1443D16ee5761d310e38b62f77f726bC71c";

function getChainFromRpc(rpcUrl: string) {
  return rpcUrl.includes("testrpc") ? xlayerTestnet : xlayer;
}

function calculateEstimatedApy(liquidity: bigint, reserve0: bigint, reserve1: bigint): number {
  const totalValue = Number(reserve0 + reserve1) / 1e6;
  const liq = Number(liquidity > 0n ? liquidity : 1n) / 1e6;
  const utilization = totalValue > 0 ? Math.min(totalValue / Math.max(liq, 1), 5) : 0.75;
  return Number((6 + utilization * 4.2).toFixed(2));
}

function callOnchainOS(command: string): any {
  try {
    const okApiKey = process.env.OK_API_KEY || "";
    const result = execSync(`OK_API_KEY=${okApiKey} ~/.local/bin/onchainos ${command}`, {
      encoding: "utf-8",
      timeout: 10000,
      env: { ...process.env, OK_API_KEY: okApiKey },
    });
    return JSON.parse(result);
  } catch (error) {
    console.warn(`Onchain OS CLI error for command "${command}":`, error);
    return null;
  }
}

export async function findYield(rpcUrl: string): Promise<YieldOpportunity[]> {
  const chain = getChainFromRpc(rpcUrl);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const opportunities: YieldOpportunity[] = [];

  // For testnet, return mock data since Onchain OS doesn't support testnet
  if (chain.id === 1952) {
    console.log("Using mock data for testnet (chain 1952)");
    opportunities.push({
      poolAddress: "0x19672692257930438F4277E9A74A698774776100" as `0x${string}`,
      token0: "0x19672692257930438F4277E9A74A698774776100" as `0x${string}`, // USDC
      token1: "0x2720d209E992B8D009386D4948A31E13B03623C2" as `0x${string}`, // WETH
      fee: 3000,
      liquidity: 1000000000n,
      estimatedAPY: 12.5,
      amount: 500_000n, // 0.5 USDC
    });
    return opportunities;
  }

  // For mainnet (chain 196), use real Onchain OS data
  try {
    console.log("Fetching liquidity pools from Onchain OS for USDC on X Layer mainnet...");
    const liquidityData = callOnchainOS(`token liquidity --address ${MAINNET_USDC} --chain xlayer`);
    
    if (liquidityData && liquidityData.ok && liquidityData.data && liquidityData.data.length > 0) {
      // Get top 3 pools by liquidity
      const topPools = liquidityData.data.slice(0, 3);
      
      for (const pool of topPools) {
        try {
          const poolAddress = pool.poolAddress as `0x${string}`;
          const token0 = pool.token0Address as `0x${string}`;
          const token1 = pool.token1Address as `0x${string}`;
          
          // Get price info for APY calculation
          const priceData = callOnchainOS(`token price-info --address ${token0} --chain xlayer`);
          
          let estimatedAPY = 8.5; // Default APY
          if (priceData && priceData.ok && priceData.data) {
            // Calculate APY based on volume and liquidity
            const volume24h = parseFloat(priceData.data.volume24h || "0");
            const liquidity = parseFloat(pool.liquidity || "0");
            if (liquidity > 0) {
              const dailyFeeRate = (volume24h * 0.003) / liquidity; // 0.3% fee tier
              estimatedAPY = Number((dailyFeeRate * 365 * 100).toFixed(2));
            }
          }
          
          opportunities.push({
            poolAddress,
            token0,
            token1,
            fee: 3000,
            liquidity: BigInt(Math.floor(parseFloat(pool.liquidity || "0"))),
            estimatedAPY,
            amount: 1_000_000n, // 1 USDC
            reserve0: pool.reserve0,
            reserve1: pool.reserve1,
          });
        } catch (error) {
          console.warn(`Error processing pool ${pool.poolAddress}:`, error);
        }
      }
    } else {
      console.warn("No liquidity data from Onchain OS, using fallback");
      // Fallback to a known pool if API fails
      opportunities.push({
        poolAddress: "0x8C8d7C46219D9205f056f28fee5950aD564d7465" as `0x${string}`,
        token0: MAINNET_USDC as `0x${string}`,
        token1: MAINNET_WETH as `0x${string}`,
        fee: 3000,
        liquidity: 1000000000n,
        estimatedAPY: 8.5,
        amount: 1_000_000n,
      });
    }
  } catch (error) {
    console.error("Error fetching yield opportunities:", error);
    // Return fallback opportunity
    opportunities.push({
      poolAddress: "0x8C8d7C46219D9205f056f28fee5950aD564d7465" as `0x${string}`,
      token0: MAINNET_USDC as `0x${string}`,
      token1: MAINNET_WETH as `0x${string}`,
      fee: 3000,
      liquidity: 1000000000n,
      estimatedAPY: 8.5,
      amount: 1_000_000n,
    });
  }

  return opportunities.sort((a, b) => b.estimatedAPY - a.estimatedAPY);
}
