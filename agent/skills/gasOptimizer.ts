import { formatUnits } from "viem";
import { createChainPublicClient } from "./shared";

export interface GasOptimizationReport {
  gasPriceWei: bigint;
  maxFeePerGasWei: bigint;
  maxPriorityFeePerGasWei: bigint;
  gasPriceGwei: string;
  recommendation: string;
  executionBand: "low" | "medium" | "high";
}

export interface GasAnalysis {
  gasPriceGwei: number;
  executionBand: "low" | "medium" | "high";
  trend: "rising" | "falling" | "stable";
  shouldDelay: boolean;
}

// Module-level history for trend analysis (last 10 readings)
const gasHistory: number[] = [];

export function getTrend(): "rising" | "falling" | "stable" {
  if (gasHistory.length < 2) return "stable";
  const recent = gasHistory.slice(-3);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const delta = last - first;
  if (delta > 0.1) return "rising";
  if (delta < -0.1) return "falling";
  return "stable";
}

export function shouldDelay(band: "low" | "medium" | "high", trend: "rising" | "falling" | "stable"): boolean {
  return band === "high" && trend === "rising";
}

export async function analyzeGas(rpcUrl: string): Promise<GasAnalysis> {
  const publicClient = createChainPublicClient(rpcUrl);
  const fees = await publicClient.estimateFeesPerGas();
  const gasPriceWei = fees.gasPrice ?? fees.maxFeePerGas ?? 0n;
  const gasPriceGweiStr = formatUnits(gasPriceWei, 9);
  const gasPriceFloat = Number(gasPriceGweiStr);

  // Track history (keep last 10)
  gasHistory.push(gasPriceFloat);
  if (gasHistory.length > 10) gasHistory.shift();

  let executionBand: "low" | "medium" | "high" = "medium";

  if (gasPriceFloat <= 0.2) {
    executionBand = "low";
  } else if (gasPriceFloat >= 1) {
    executionBand = "high";
  }

  const trend = getTrend();
  const delay = shouldDelay(executionBand, trend);

  return {
    gasPriceGwei: gasPriceFloat,
    executionBand,
    trend,
    shouldDelay: delay,
  };
}
