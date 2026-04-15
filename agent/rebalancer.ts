/**
 * Automated Portfolio Rebalancer
 *
 * Compares current portfolio allocation to a target allocation, computes
 * the trades needed to restore balance, and executes them via DexRouter.
 *
 * Requirement 10: Automated Portfolio Rebalancing
 */

import { DexRouter } from "../lib/dexRouter";
import { PortfolioSnapshot } from "./skills/portfolioTracker";

// ─── Exported types ──────────────────────────────────────────────────────────

export interface RebalanceTrade {
  tokenIn: string;
  tokenOut: string;
  amount: bigint;
  reason: string;
}

export interface RebalanceResult {
  tradesExecuted: number;
  totalRebalanced: bigint;
  newAllocation: Record<string, number>;
}

// ─── PortfolioRebalancer ─────────────────────────────────────────────────────

export class PortfolioRebalancer {
  private readonly rpcUrl: string;
  private readonly walletAddress: string;
  private readonly dexRouter: DexRouter;

  /** Minimum trade size in base units (default 100 000 = 0.1 USDC with 6 decimals) */
  private readonly minTradeSize: bigint;

  /** Drift percentage that must be exceeded before a trade is queued */
  private readonly rebalanceThreshold: number;

  constructor(
    rpcUrl: string,
    walletAddress: string,
    dexRouter: DexRouter,
    options: {
      minTradeSize?: bigint;
      rebalanceThreshold?: number;
    } = {},
  ) {
    this.rpcUrl = rpcUrl;
    this.walletAddress = walletAddress;
    this.dexRouter = dexRouter;
    this.minTradeSize = options.minTradeSize ?? 100_000n;
    this.rebalanceThreshold = options.rebalanceThreshold ?? Number(process.env.REBALANCE_THRESHOLD ?? 5);
  }

  // ── 10.2 checkDrift ────────────────────────────────────────────────────────

  /**
   * Returns drift percentage per token: current% − target%.
   * Positive  → overweight (need to sell)
   * Negative  → underweight (need to buy)
   */
  checkDrift(
    currentAllocation: Record<string, number>,
    targetAllocation: Record<string, number>,
  ): Record<string, number> {
    const drift: Record<string, number> = {};

    // Collect all token symbols from both maps
    const tokens = new Set([
      ...Object.keys(currentAllocation),
      ...Object.keys(targetAllocation),
    ]);

    for (const token of tokens) {
      const current = currentAllocation[token] ?? 0;
      const target = targetAllocation[token] ?? 0;
      drift[token] = current - target;
    }

    return drift;
  }

  // ── 10.3 computeRebalanceTrades ────────────────────────────────────────────

  /**
   * Given a portfolio snapshot and a target allocation (token → % of portfolio),
   * returns the list of trades required to restore balance.
   *
   * Only includes trades where |drift| exceeds `rebalanceThreshold`.
   */
  computeRebalanceTrades(
    snapshot: PortfolioSnapshot,
    targetAllocation: Record<string, number>,
  ): RebalanceTrade[] {
    const trades: RebalanceTrade[] = [];

    // Build current allocation map (token symbol → % of total USD)
    const currentAllocation: Record<string, number> = {};
    if (snapshot.totalUsd > 0) {
      for (const token of snapshot.tokens) {
        currentAllocation[token.symbol] =
          (token.usdValue / snapshot.totalUsd) * 100;
      }
    }

    const drift = this.checkDrift(currentAllocation, targetAllocation);

    // Separate overweight (sell) and underweight (buy) tokens
    const overweight: Array<{ symbol: string; drift: number }> = [];
    const underweight: Array<{ symbol: string; drift: number }> = [];

    for (const [symbol, d] of Object.entries(drift)) {
      if (Math.abs(d) <= this.rebalanceThreshold) continue; // within tolerance
      if (d > 0) {
        overweight.push({ symbol, drift: d });
      } else {
        underweight.push({ symbol, drift: Math.abs(d) });
      }
    }

    // Match overweight tokens (sell) against underweight tokens (buy)
    for (const over of overweight) {
      for (const under of underweight) {
        // Amount to rebalance: use the smaller of the two drifts (in USD)
        const driftPct = Math.min(over.drift, under.drift);
        const usdAmount = (driftPct / 100) * snapshot.totalUsd;

        // Find the token address for the overweight token
        const tokenInInfo = snapshot.tokens.find((t) => t.symbol === over.symbol);
        const tokenOutInfo = snapshot.tokens.find((t) => t.symbol === under.symbol);

        if (!tokenInInfo || !tokenOutInfo) continue;

        // Convert USD amount to base units using tokenIn decimals
        const tokenInPrice = tokenInInfo.usdValue / Number(tokenInInfo.balance || "1");
        const rawAmount =
          tokenInPrice > 0
            ? BigInt(Math.floor((usdAmount / tokenInPrice) * 10 ** tokenInInfo.decimals))
            : 0n;

        if (rawAmount < this.minTradeSize) continue;

        trades.push({
          tokenIn: tokenInInfo.address,
          tokenOut: tokenOutInfo.address,
          amount: rawAmount,
          reason: `Rebalance: ${over.symbol} overweight by ${over.drift.toFixed(2)}%, ${under.symbol} underweight by ${under.drift.toFixed(2)}%`,
        });
      }
    }

    return trades;
  }

  // ── 10.4 execute ──────────────────────────────────────────────────────────

  /**
   * Executes a list of rebalance trades via DexRouter.
   * Skips any trade below `minTradeSize`.
   * Returns a summary of what was executed.
   */
  async execute(trades: RebalanceTrade[]): Promise<RebalanceResult> {
    let tradesExecuted = 0;
    let totalRebalanced = 0n;
    const newAllocation: Record<string, number> = {};

    for (const trade of trades) {
      if (trade.amount < this.minTradeSize) {
        console.log(
          `[Rebalancer] Skipping trade (amount ${trade.amount} < minTradeSize ${this.minTradeSize})`,
        );
        continue;
      }

      try {
        console.log(
          `[Rebalancer] Executing trade: ${trade.tokenIn} → ${trade.tokenOut}, amount=${trade.amount}, reason="${trade.reason}"`,
        );

        // Get a quote from the DEX router
        const quoteResult = await this.dexRouter.getQuote({
          tokenIn: trade.tokenIn as `0x${string}`,
          tokenOut: trade.tokenOut as `0x${string}`,
          amount: trade.amount.toString(),
          type: "EXACT_INPUT",
          swapper: this.walletAddress as `0x${string}`,
          chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 1952),
        });

        // Execute the swap
        await this.dexRouter.executeSwap({
          quote: quoteResult.quote,
        });

        tradesExecuted++;
        totalRebalanced += trade.amount;

        console.log(`[Rebalancer] Trade executed successfully.`);
      } catch (err) {
        console.error(`[Rebalancer] Trade failed:`, err);
      }
    }

    return {
      tradesExecuted,
      totalRebalanced,
      newAllocation,
    };
  }
}
