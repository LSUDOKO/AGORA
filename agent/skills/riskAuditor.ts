import { parseAbi } from "viem";
import { callOnchainOS, createChainPublicClient, getChainFromRpc } from "./shared";

export interface AuditResult {
  score: number;
  passed: boolean;
  reasons: string[];
  liquidity: bigint;
  reserve0: bigint;
  reserve1: bigint;
  components?: {
    liquidityScore: number;
    holderScore: number;
    volatilityScore: number;
    clusterScore: number;
  };
}

const pairAbi = parseAbi([
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() view returns (uint256)",
]);

// Weights for each scoring component
const WEIGHTS = {
  liquidity: 0.30,
  holder: 0.25,
  volatility: 0.25,
  cluster: 0.20,
};

const PASS_THRESHOLD = 65;

export async function auditPool(poolAddress: string, rpcUrl: string): Promise<AuditResult> {
  const chain = getChainFromRpc(rpcUrl);
  const publicClient = createChainPublicClient(rpcUrl);

  // Use "xlayer" for both testnet and mainnet
  const chainName = "xlayer";

  try {
    console.log(`Auditing pool ${poolAddress} using Onchain OS on ${chain.name}...`);

    const tokenAddress = poolAddress;

    // Fetch comprehensive risk data from Onchain OS
    const advancedInfo = callOnchainOS(`token advanced-info --address ${tokenAddress} --chain ${chainName}`);
    const holderData = callOnchainOS(`token holders --address ${tokenAddress} --chain ${chainName}`);
    const clusterData = callOnchainOS(`token cluster-overview --address ${tokenAddress} --chain ${chainName}`);

    const reasons: string[] = [];
    let liquidity = 0n;
    let reserve0 = 0n;
    let reserve1 = 0n;

    // --- Component scores (each 0-100) ---
    let liquidityScore = 50;
    let holderScore = 50;
    let volatilityScore = 50;
    let clusterScore = 50;

    const hasOnchainData = advancedInfo && advancedInfo.ok && advancedInfo.data;

    if (hasOnchainData) {
      // --- Liquidity depth score (30%) ---
      // Use riskControlLevel as a proxy for overall liquidity/safety depth
      const riskLevel = advancedInfo.data.riskControlLevel;
      if (riskLevel === "low") {
        liquidityScore = 90;
        reasons.push(`Risk level: ${riskLevel} - strong liquidity depth`);
      } else if (riskLevel === "medium") {
        liquidityScore = 65;
        reasons.push(`Risk level: ${riskLevel} - acceptable liquidity depth`);
      } else if (riskLevel === "high") {
        liquidityScore = 35;
        reasons.push(`Risk level: ${riskLevel} - shallow liquidity depth`);
      } else if (riskLevel === "critical") {
        liquidityScore = 10;
        reasons.push(`Risk level: ${riskLevel} - critically low liquidity depth`);
      }

      // --- Holder distribution score (25%) ---
      const top10HoldPercent = parseFloat(advancedInfo.data.top10HoldPercent || "0");
      if (top10HoldPercent < 30) {
        holderScore = 95;
        reasons.push(`Top 10 holders own ${top10HoldPercent.toFixed(1)}% - excellent distribution`);
      } else if (top10HoldPercent < 50) {
        holderScore = 75;
        reasons.push(`Top 10 holders own ${top10HoldPercent.toFixed(1)}% - good distribution`);
      } else if (top10HoldPercent < 70) {
        holderScore = 50;
        reasons.push(`Top 10 holders own ${top10HoldPercent.toFixed(1)}% - moderate concentration`);
      } else {
        holderScore = 20;
        reasons.push(`Top 10 holders own ${top10HoldPercent.toFixed(1)}% - high concentration risk`);
      }

      // Supplement holder score with holder count if available
      if (holderData && holderData.ok && holderData.data && holderData.data.length > 0) {
        const holderCount = holderData.data.length;
        if (holderCount > 100) {
          holderScore = Math.min(100, holderScore + 10);
          reasons.push(`${holderCount} holders - healthy distribution`);
        } else if (holderCount > 50) {
          holderScore = Math.min(100, holderScore + 5);
          reasons.push(`${holderCount} holders - moderate distribution`);
        } else {
          reasons.push(`${holderCount} holders - limited distribution`);
        }
      }

      // --- Price volatility score (25%) using priceChange24h ---
      const priceChange24h = Math.abs(parseFloat(advancedInfo.data.priceChange24h || "0"));
      if (priceChange24h <= 5) {
        volatilityScore = 90;
        reasons.push(`24h price change: ${priceChange24h.toFixed(1)}% - very stable`);
      } else if (priceChange24h <= 10) {
        volatilityScore = 75;
        reasons.push(`24h price change: ${priceChange24h.toFixed(1)}% - low volatility`);
      } else if (priceChange24h <= 20) {
        volatilityScore = 50;
        reasons.push(`24h price change: ${priceChange24h.toFixed(1)}% - moderate volatility`);
      } else if (priceChange24h <= 40) {
        volatilityScore = 25;
        reasons.push(`24h price change: ${priceChange24h.toFixed(1)}% - high volatility (>20%)`);
      } else {
        volatilityScore = 5;
        reasons.push(`24h price change: ${priceChange24h.toFixed(1)}% - extreme volatility`);
      }

      // --- Cluster / rug risk score (20%) ---
      if (clusterData && clusterData.ok && clusterData.data) {
        const rugPullPercent = parseFloat(clusterData.data.rugPullPercent || "0");
        const newAddressPercent = parseFloat(clusterData.data.newAddressPercent || "0");

        if (rugPullPercent < 5) {
          clusterScore = 95;
          reasons.push(`Rug pull risk: ${rugPullPercent.toFixed(1)}% - very low risk`);
        } else if (rugPullPercent < 10) {
          clusterScore = 80;
          reasons.push(`Rug pull risk: ${rugPullPercent.toFixed(1)}% - low risk`);
        } else if (rugPullPercent < 30) {
          clusterScore = 50;
          reasons.push(`Rug pull risk: ${rugPullPercent.toFixed(1)}% - moderate risk`);
        } else {
          clusterScore = 15;
          reasons.push(`Rug pull risk: ${rugPullPercent.toFixed(1)}% - high rug risk`);
        }

        if (newAddressPercent < 20) {
          clusterScore = Math.min(100, clusterScore + 5);
          reasons.push(`New wallet percentage: ${newAddressPercent.toFixed(1)}% - established holders`);
        } else if (newAddressPercent > 50) {
          clusterScore = Math.max(0, clusterScore - 10);
          reasons.push(`New wallet percentage: ${newAddressPercent.toFixed(1)}% - many new holders`);
        }
      }
    } else {
      // --- Fallback: on-chain data when Onchain OS is unavailable ---
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
          liquidityScore = 70;
          reasons.push("Healthy LP token supply depth detected.");
        } else {
          liquidityScore = 30;
        }

        if (totalReserves > 10_000_000n) {
          liquidityScore = Math.min(100, liquidityScore + 15);
          reasons.push("Pool reserves are deep enough for medium-sized execution.");
        }

        // Volatility and cluster scores remain at neutral 50 when no data
        reasons.push("Holder and volatility data unavailable - using neutral scores");
      } catch (error) {
        console.warn("On-chain fallback also failed:", error);
        reasons.push("Unable to fetch complete risk data");
        liquidityScore = 0;
        holderScore = 0;
        volatilityScore = 0;
        clusterScore = 0;
      }
    }

    // Clamp all component scores to [0, 100]
    liquidityScore = Math.max(0, Math.min(100, liquidityScore));
    holderScore = Math.max(0, Math.min(100, holderScore));
    volatilityScore = Math.max(0, Math.min(100, volatilityScore));
    clusterScore = Math.max(0, Math.min(100, clusterScore));

    // Weighted final score
    const score = Math.round(
      liquidityScore * WEIGHTS.liquidity +
      holderScore * WEIGHTS.holder +
      volatilityScore * WEIGHTS.volatility +
      clusterScore * WEIGHTS.cluster
    );

    const passed = score >= PASS_THRESHOLD;

    return {
      score,
      passed,
      reasons,
      liquidity,
      reserve0,
      reserve1,
      components: {
        liquidityScore,
        holderScore,
        volatilityScore,
        clusterScore,
      },
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
      components: {
        liquidityScore: 0,
        holderScore: 0,
        volatilityScore: 0,
        clusterScore: 0,
      },
    };
  }
}
