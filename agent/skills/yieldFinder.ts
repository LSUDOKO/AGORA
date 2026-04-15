import { parseAbi } from "viem";
import { callOnchainOS, createChainPublicClient, getChainFromRpc } from "./shared";

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

function calculateEstimatedApy(liquidity: bigint, reserve0: bigint, reserve1: bigint): number {
  const totalValue = Number(reserve0 + reserve1) / 1e6;
  const liq = Number(liquidity > 0n ? liquidity : 1n) / 1e6;
  const utilization = totalValue > 0 ? Math.min(totalValue / Math.max(liq, 1), 5) : 0.75;
  return Number((6 + utilization * 4.2).toFixed(2));
}

export async function findYield(rpcUrl: string): Promise<YieldOpportunity[]> {
  const chain = getChainFromRpc(rpcUrl);
  const publicClient = createChainPublicClient(rpcUrl);

  const opportunities: YieldOpportunity[] = [];

  // Use real Onchain OS data - "xlayer" works for both mainnet (196) and testnet (1952)
  const chainName = "xlayer";
  
  try {
    console.log(`Fetching liquidity pools from Onchain OS for USDC on ${chain.name}...`);
    
    const usdcAddress = MAINNET_USDC;
    
    const liquidityData = callOnchainOS(`token liquidity --address ${usdcAddress} --chain ${chainName}`);
    
    if (liquidityData && liquidityData.ok && liquidityData.data && liquidityData.data.length > 0) {
      console.log(`Found ${liquidityData.data.length} liquidity pools`);
      
      // Get top 3 pools by liquidity
      const topPools = liquidityData.data.slice(0, 3);
      
      for (const pool of topPools) {
        try {
          const poolAddress = pool.poolAddress as `0x${string}`;
          
          const token0Address = usdcAddress as `0x${string}`;
          const token1Address = MAINNET_WETH as `0x${string}`;
          
          const liquidityUsd = parseFloat(pool.liquidityUsd || "0");
          const priceData = callOnchainOS(`token price-info --address ${token0Address} --chain ${chainName}`);
          
          let estimatedAPY = 8.5;
          if (priceData && priceData.ok && priceData.data) {
            const volume24h = parseFloat(priceData.data.volume24h || "0");
            if (liquidityUsd > 0) {
              const dailyFeeRate = (volume24h * 0.003) / liquidityUsd;
              estimatedAPY = Number((dailyFeeRate * 365 * 100).toFixed(2));
            }
          }
          
          const feePercent = pool.liquidityProviderFeePercent || "0.3%";
          const feeValue = parseFloat(feePercent.replace('%', '')) * 100;
          
          opportunities.push({
            poolAddress,
            token0: token0Address,
            token1: token1Address,
            fee: Math.round(feeValue),
            liquidity: BigInt(Math.floor(liquidityUsd * 1e6)),
            estimatedAPY,
            amount: 1_000_000n,
            reserve0: pool.liquidityAmount?.[0]?.tokenAmount || "0",
            reserve1: pool.liquidityAmount?.[1]?.tokenAmount || "0",
          });
          
          console.log(`Pool: ${pool.pool} (${pool.protocolName}) - Liquidity: $${liquidityUsd.toFixed(2)} - APY: ${estimatedAPY}%`);
        } catch (error) {
          console.warn(`Error processing pool ${pool.poolAddress}:`, error);
        }
      }
    } else {
      console.warn(`No liquidity data from Onchain OS for ${chainName}`);
    }
    
    // If still no opportunities, return empty array
    if (opportunities.length === 0) {
      console.warn(`No yield opportunities found on ${chain.name}.`);
    }
  } catch (error) {
    console.error("Error fetching yield opportunities:", error);
  }

  return opportunities.sort((a, b) => b.estimatedAPY - a.estimatedAPY);
}
