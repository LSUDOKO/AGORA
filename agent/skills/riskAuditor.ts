import { createPublicClient, http, parseAbi } from "viem";
import { xlayer, xlayerTestnet } from "../../frontend/lib/chain";
import { execSync } from "node:child_process";

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

export async function auditPool(poolAddress: string, rpcUrl: string): Promise<AuditResult> {
  const chain = getChainFromRpc(rpcUrl);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  // For testnet, use basic on-chain checks
  if (chain.id === 1952) {
    try {
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
    } catch (error) {
      console.error("Testnet audit error:", error);
      return {
        score: 0,
        passed: false,
        reasons: ["Failed to fetch pool data from testnet"],
        liquidity: 0n,
        reserve0: 0n,
        reserve1: 0n,
      };
    }
  }

  // For mainnet (chain 196), use comprehensive Onchain OS risk analysis
  try {
    console.log(`Auditing pool ${poolAddress} using Onchain OS...`);
    
    // Get token addresses from pool (assuming it's a token address for now)
    const tokenAddress = poolAddress;
    
    // Fetch comprehensive risk data
    const advancedInfo = callOnchainOS(`token advanced-info --address ${tokenAddress} --chain xlayer`);
    const holderData = callOnchainOS(`token holders --address ${tokenAddress} --chain xlayer`);
    const clusterData = callOnchainOS(`token cluster-overview --address ${tokenAddress} --chain xlayer`);
    
    let score = 50;
    const reasons: string[] = [];
    let liquidity = 0n;
    let reserve0 = 0n;
    let reserve1 = 0n;

    // Analyze risk level from advanced info
    if (advancedInfo && advancedInfo.ok && advancedInfo.data) {
      const riskLevel = advancedInfo.data.riskControlLevel;
      
      if (riskLevel === "low" || riskLevel === "medium") {
        score += 20;
        reasons.push(`Risk level: ${riskLevel} - acceptable for trading`);
      } else if (riskLevel === "high") {
        score -= 10;
        reasons.push(`Risk level: ${riskLevel} - proceed with caution`);
      } else if (riskLevel === "critical") {
        score -= 30;
        reasons.push(`Risk level: ${riskLevel} - high risk detected`);
      }

      // Check holder concentration
      const top10HoldPercent = parseFloat(advancedInfo.data.top10HoldPercent || "0");
      if (top10HoldPercent < 50) {
        score += 15;
        reasons.push(`Top 10 holders own ${top10HoldPercent.toFixed(1)}% - good distribution`);
      } else if (top10HoldPercent < 70) {
        score += 5;
        reasons.push(`Top 10 holders own ${top10HoldPercent.toFixed(1)}% - moderate concentration`);
      } else {
        score -= 10;
        reasons.push(`Top 10 holders own ${top10HoldPercent.toFixed(1)}% - high concentration risk`);
      }
    }

    // Analyze holder distribution
    if (holderData && holderData.ok && holderData.data && holderData.data.length > 0) {
      const holderCount = holderData.data.length;
      if (holderCount > 100) {
        score += 10;
        reasons.push(`${holderCount} holders - healthy distribution`);
      } else if (holderCount > 50) {
        score += 5;
        reasons.push(`${holderCount} holders - moderate distribution`);
      } else {
        reasons.push(`${holderCount} holders - limited distribution`);
      }
    }

    // Analyze cluster risk
    if (clusterData && clusterData.ok && clusterData.data) {
      const rugPullPercent = parseFloat(clusterData.data.rugPullPercent || "0");
      const newAddressPercent = parseFloat(clusterData.data.newAddressPercent || "0");
      
      if (rugPullPercent < 10) {
        score += 10;
        reasons.push(`Rug pull risk: ${rugPullPercent.toFixed(1)}% - low risk`);
      } else if (rugPullPercent < 30) {
        reasons.push(`Rug pull risk: ${rugPullPercent.toFixed(1)}% - moderate risk`);
      } else {
        score -= 15;
        reasons.push(`Rug pull risk: ${rugPullPercent.toFixed(1)}% - high risk`);
      }

      if (newAddressPercent < 20) {
        score += 5;
        reasons.push(`New wallet percentage: ${newAddressPercent.toFixed(1)}% - established holders`);
      } else if (newAddressPercent > 50) {
        reasons.push(`New wallet percentage: ${newAddressPercent.toFixed(1)}% - many new holders`);
      }
    }

    // If we couldn't get Onchain OS data, fall back to on-chain checks
    if (!advancedInfo || !advancedInfo.ok) {
      console.warn("Onchain OS data unavailable, using on-chain fallback");
      try {
        const [reserves, liquidityData] = await Promise.all([
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

        [reserve0, reserve1] = reserves;
        liquidity = liquidityData;
        const totalReserves = reserve0 + reserve1;

        if (liquidity > 1_000_000n) {
          score += 10;
          reasons.push("Healthy LP token supply depth detected.");
        }

        if (totalReserves > 10_000_000n) {
          score += 15;
          reasons.push("Pool reserves are deep enough for medium-sized execution.");
        }
      } catch (error) {
        console.warn("On-chain fallback also failed:", error);
        reasons.push("Unable to fetch complete risk data");
      }
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
  } catch (error) {
    console.error("Risk audit failed:", error);
    return {
      score: 0,
      passed: false,
      reasons: [error instanceof Error ? error.message : "Unknown audit error"],
      liquidity: 0n,
      reserve0: 0n,
      reserve1: 0n,
    };
  }
}
