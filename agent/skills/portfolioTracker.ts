import { erc20Abi, formatUnits } from "viem";
import { createChainPublicClient } from "./shared";

export interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
  usdValue: number;
}

export interface PortfolioSnapshot {
  tokens: TokenBalance[];
  totalUsd: number;
  timestamp: number;
  profitLoss: number;
}

// Module-level snapshot history (max 100)
const snapshots: PortfolioSnapshot[] = [];

// Simple price map (USD per token) — updated via Onchain OS when available
const priceMap: Record<string, number> = {
  // Fallback prices for common tokens
  USDC: 1.0,
  tUSDC: 1.0,
  WOKB: 0.0, // will be overridden by live data
};

export function getSnapshots(): PortfolioSnapshot[] {
  return snapshots;
}

export function getProfitLoss(): number {
  if (snapshots.length < 2) return 0;
  const first = snapshots[0];
  const latest = snapshots[snapshots.length - 1];
  return latest.totalUsd - first.totalUsd;
}

export async function trackPortfolio(
  rpcUrl: string,
  owner: `0x${string}`,
  tokenAddresses: `0x${string}`[],
): Promise<PortfolioSnapshot> {
  if (!Array.isArray(tokenAddresses)) {
    console.error("trackPortfolio error: tokenAddresses is not an array:", tokenAddresses);
    // Fallback to empty array if somehow called incorrectly
    tokenAddresses = [];
  }
  const publicClient = createChainPublicClient(rpcUrl);

  const tokenBalances: TokenBalance[] = await Promise.all(
    tokenAddresses.map(async (address) => {
      const [balance, symbol, decimals] = await Promise.all([
        publicClient.readContract({ address, abi: erc20Abi, functionName: "balanceOf", args: [owner] }) as Promise<bigint>,
        publicClient.readContract({ address, abi: erc20Abi, functionName: "symbol" }) as Promise<string>,
        publicClient.readContract({ address, abi: erc20Abi, functionName: "decimals" }) as Promise<number>,
      ]);

      const formattedBalance = formatUnits(balance, decimals);
      const price = priceMap[symbol] ?? 0;
      const usdValue = Number(formattedBalance) * price;

      return {
        address,
        symbol,
        balance: formattedBalance,
        decimals,
        usdValue,
      };
    }),
  );

  const totalUsd = tokenBalances.reduce((sum, t) => sum + t.usdValue, 0);
  const profitLoss = getProfitLoss();

  const snapshot: PortfolioSnapshot = {
    tokens: tokenBalances,
    totalUsd,
    timestamp: Date.now(),
    profitLoss,
  };

  // Store snapshot, keep max 100
  snapshots.push(snapshot);
  if (snapshots.length > 100) snapshots.shift();

  return snapshot;
}
