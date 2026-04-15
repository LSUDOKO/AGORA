import { callOnchainOS } from "./shared";

export interface SentimentResult {
  score: number;
  label: "bullish" | "neutral" | "bearish";
  confidence: number;
  signals: string[];
}

export async function analyzeMarketSentiment(
  tokenAddress: `0x${string}`,
  chainName = "xlayer",
): Promise<SentimentResult> {
  const [advancedInfo, clusterOverview] = await Promise.all([
    Promise.resolve(callOnchainOS(`token advanced-info --address ${tokenAddress} --chain ${chainName}`)),
    Promise.resolve(callOnchainOS(`token cluster-overview --address ${tokenAddress} --chain ${chainName}`)),
  ]);

  const signals: string[] = [];
  let score = 0;
  let dataPoints = 0;

  // Holder concentration signal (from advanced-info)
  const holderConcentration = advancedInfo?.data?.holderConcentration ?? null;
  if (holderConcentration !== null) {
    dataPoints++;
    if (holderConcentration < 30) {
      score += 30;
      signals.push("Low holder concentration — healthy distribution");
    } else if (holderConcentration > 70) {
      score -= 40;
      signals.push("High holder concentration — centralization risk");
    } else {
      score += 10;
      signals.push("Moderate holder concentration");
    }
  }

  // Rug risk signal (from cluster-overview)
  const rugRisk = clusterOverview?.data?.rugRisk ?? advancedInfo?.data?.riskControlLevel ?? null;
  if (rugRisk !== null) {
    dataPoints++;
    const riskStr = String(rugRisk).toLowerCase();
    if (riskStr === "low" || riskStr === "none") {
      score += 35;
      signals.push("Low rug risk detected");
    } else if (riskStr === "high" || riskStr === "critical") {
      score -= 50;
      signals.push("High rug risk detected — caution advised");
    } else {
      score -= 5;
      signals.push("Moderate rug risk");
    }
  }

  // Price trend signal (from advanced-info)
  const priceChange = advancedInfo?.data?.priceChange24h ?? null;
  if (priceChange !== null) {
    dataPoints++;
    const change = Number(priceChange);
    if (change > 5) {
      score += 35;
      signals.push(`Strong positive price trend: +${change.toFixed(2)}%`);
    } else if (change > 0) {
      score += 15;
      signals.push(`Positive price trend: +${change.toFixed(2)}%`);
    } else if (change < -5) {
      score -= 35;
      signals.push(`Strong negative price trend: ${change.toFixed(2)}%`);
    } else {
      score -= 10;
      signals.push(`Slight negative price trend: ${change.toFixed(2)}%`);
    }
  }

  // Clamp score to [-100, 100]
  score = Math.max(-100, Math.min(100, score));

  // Confidence based on how many data sources responded
  const confidence = dataPoints === 0 ? 0 : dataPoints / 3;

  // If no data, return neutral with low confidence
  if (dataPoints === 0) {
    signals.push("No data available — defaulting to neutral");
    return { score: 0, label: "neutral", confidence: 0, signals };
  }

  let label: "bullish" | "neutral" | "bearish";
  if (score > 20) {
    label = "bullish";
  } else if (score < -20) {
    label = "bearish";
  } else {
    label = "neutral";
  }

  return { score, label, confidence, signals };
}
