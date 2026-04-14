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
    if (!okApiKey) {
      console.warn("OK_API_KEY not found in environment");
      return null;
    }
    
    // Use execSync with proper environment variable passing
    const result = execSync(`~/.local/bin/onchainos ${command}`, {
      encoding: "utf-8",
      timeout: 15000,
      env: { 
        ...process.env, 
        OK_API_KEY: okApiKey,
        OK_ACCESS_KEY: okApiKey, // Some commands may use this variant
      },
    });
    return JSON.parse(result);
  } catch (error: any) {
    // Check if it's a JSON parse error (command succeeded but returned non-JSON)
    if (error.message && error.message.includes('Unexpected')) {
      console.warn(`Onchain OS CLI returned non-JSON output for command "${command}"`);
      return null;
    }
    console.warn(`Onchain OS CLI error for command "${command}":`, error.message || error);
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

  // Use real Onchain OS data - "xlayer" works for both mainnet (196) and testnet (1952)
  const chainName = "xlayer";
  
  try {
    console.log(`Fetching liquidity pools from Onchain OS for USDC on ${chain.name}...`);
    
    // For testnet, use the TestUSDC address; for mainnet, use real USDC
    const usdcAddress = chain.id === 1952 ? "0x70799d35aC43AD21e106270E14365a9B96BDc993" : MAINNET_USDC;
    
    const liquidityData = callOnchainOS(`token liquidity --address ${usdcAddress} --chain ${chainName}`);
    
    if (liquidityData && liquidityData.ok && liquidityData.data && liquidityData.data.length > 0) {
      console.log(`Found ${liquidityData.data.length} liquidity pools`);
      
      // Get top 3 pools by liquidity
      const topPools = liquidityData.data.slice(0, 3);
      
      for (const pool of topPools) {
        try {
          const poolAddress = pool.poolAddress as `0x${string}`;
          
          // Extract token addresses from liquidity amounts
          const token0Address = usdcAddress as `0x${string}`;
          const token1Symbol = pool.liquidityAmount?.[1]?.tokenSymbol || "UNKNOWN";
          
          // For simplicity, use pool address as token1 (in production, would need proper token lookup)
          const token1Address = poolAddress;
          
          // Parse liquidity USD value
          const liquidityUsd = parseFloat(pool.liquidityUsd || "0");
          
          // Get price info for APY calculation
          const priceData = callOnchainOS(`token price-info --address ${token0Address} --chain ${chainName}`);
          
          let estimatedAPY = 8.5; // Default APY
          if (priceData && priceData.ok && priceData.data) {
            // Calculate APY based on volume and liquidity
            const volume24h = parseFloat(priceData.data.volume24h || "0");
            if (liquidityUsd > 0) {
              const dailyFeeRate = (volume24h * 0.003) / liquidityUsd; // 0.3% fee tier
              estimatedAPY = Number((dailyFeeRate * 365 * 100).toFixed(2));
            }
          }
          
          // Parse fee percentage
          const feePercent = pool.liquidityProviderFeePercent || "0.3%";
          const feeValue = parseFloat(feePercent.replace('%', '')) * 100; // Convert to basis points
          
          opportunities.push({
            poolAddress,
            token0: token0Address,
            token1: token1Address,
            fee: Math.round(feeValue),
            liquidity: BigInt(Math.floor(liquidityUsd * 1e6)), // Convert USD to base units
            estimatedAPY,
            amount: 1_000_000n, // 1 USDC
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
