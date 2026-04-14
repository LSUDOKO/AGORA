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

  // Use real Onchain OS data for both testnet and mainnet
  // Note: Onchain OS uses "xlayer" for mainnet (196) and may not support testnet (1952)
  // We'll try testnet first, and if it fails, we'll use a fallback approach
  const chainName = chain.id === 1952 ? "xlayer-testnet" : "xlayer";
  
  try {
    console.log(`Fetching liquidity pools from Onchain OS for USDC on ${chain.name}...`);
    
    // For testnet, use the TestUSDC address from deployment
    const usdcAddress = chain.id === 1952 ? "0x70799d35aC43AD21e106270E14365a9B96BDc993" : MAINNET_USDC;
    
    const liquidityData = callOnchainOS(`token liquidity --address ${usdcAddress} --chain ${chainName}`);
    
    if (liquidityData && liquidityData.ok && liquidityData.data && liquidityData.data.length > 0) {
      // Get top 3 pools by liquidity
      const topPools = liquidityData.data.slice(0, 3);
      
      for (const pool of topPools) {
        try {
          const poolAddress = pool.poolAddress as `0x${string}`;
          const token0 = pool.token0Address as `0x${string}`;
          const token1 = pool.token1Address as `0x${string}`;
          
          // Get price info for APY calculation
          const priceData = callOnchainOS(`token price-info --address ${token0} --chain ${chainName}`);
          
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
      console.warn(`No liquidity data from Onchain OS for ${chainName}`);
      
      // Fallback: Try to get hot tokens and their liquidity pools
      const hotTokensData = callOnchainOS(`token hot-tokens --chain ${chainName} --limit 5`);
      
      if (hotTokensData && hotTokensData.ok && hotTokensData.data && hotTokensData.data.length > 0) {
        console.log(`Found ${hotTokensData.data.length} hot tokens, fetching their pools...`);
        
        for (const token of hotTokensData.data.slice(0, 2)) {
          const tokenLiquidity = callOnchainOS(`token liquidity --address ${token.address} --chain ${chainName}`);
          
          if (tokenLiquidity && tokenLiquidity.ok && tokenLiquidity.data && tokenLiquidity.data.length > 0) {
            const pool = tokenLiquidity.data[0];
            opportunities.push({
              poolAddress: pool.poolAddress as `0x${string}`,
              token0: pool.token0Address as `0x${string}`,
              token1: pool.token1Address as `0x${string}`,
              fee: 3000,
              liquidity: BigInt(Math.floor(parseFloat(pool.liquidity || "0"))),
              estimatedAPY: 10.0,
              amount: 1_000_000n,
              reserve0: pool.reserve0,
              reserve1: pool.reserve1,
            });
          }
        }
      }
    }
    
    // If still no opportunities, return empty array
    if (opportunities.length === 0) {
      console.warn(`No yield opportunities found on ${chain.name}. Onchain OS may not support this chain yet.`);
    }
  } catch (error) {
    console.error("Error fetching yield opportunities:", error);
  }

  return opportunities.sort((a, b) => b.estimatedAPY - a.estimatedAPY);
}
