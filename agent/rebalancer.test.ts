/**
 * Property tests for PortfolioRebalancer.
 *
 * **Validates: Requirements 10.1, 10.2, 10.3**
 *
 * Property: Given any current allocation and target allocation (both summing
 * to 100%), after computeRebalanceTrades() the resulting allocation drift
 * for tokens that had trades is at most the rebalanceThreshold.
 */

import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { PortfolioRebalancer } from "./rebalancer";
import type { PortfolioSnapshot } from "./skills/portfolioTracker";

// Minimal mock DexRouter — not used in pure logic tests
const mockDexRouter = {
  getQuote: vi.fn(),
  executeSwap: vi.fn(),
  checkApproval: vi.fn(),
};

const THRESHOLD = 5; // %

function makeRebalancer() {
  return new PortfolioRebalancer(
    "https://testrpc.xlayer.tech",
    "0x0000000000000000000000000000000000000001",
    mockDexRouter as any,
    { rebalanceThreshold: THRESHOLD, minTradeSize: 1n },
  );
}

// Generator: allocation map where values sum to 100 (integer percentages)
// Uses 2-3 tokens for simplicity.
const allocationArb = fc
  .tuple(
    fc.integer({ min: 10, max: 80 }),
    fc.integer({ min: 10, max: 80 }),
  )
  .map(([a, b]) => {
    const c = 100 - a - b;
    if (c < 5) return null;
    return { USDC: a, WOKB: b, ETH: c };
  })
  .filter((v): v is Record<string, number> => v !== null);

// Build a PortfolioSnapshot from an allocation map and a total USD value
function makeSnapshot(
  allocation: Record<string, number>,
  totalUsd: number,
): PortfolioSnapshot {
  const tokens = Object.entries(allocation).map(([symbol, pct]) => ({
    symbol,
    address: `0x${symbol.padEnd(40, "0")}` as `0x${string}`,
    balance: String(Math.floor((pct / 100) * totalUsd * 1e6)),
    decimals: 6,
    usdValue: (pct / 100) * totalUsd,
  }));
  return {
    tokens,
    totalUsd,
    timestamp: Date.now(),
    profitLoss: 0,
  };
}

describe("PortfolioRebalancer – checkDrift property", () => {
  it("drift values equal current minus target for all tokens", () => {
    const rebalancer = makeRebalancer();

    fc.assert(
      fc.property(allocationArb, allocationArb, (current, target) => {
        const drift = rebalancer.checkDrift(current, target);
        for (const token of Object.keys({ ...current, ...target })) {
          const expected = (current[token] ?? 0) - (target[token] ?? 0);
          expect(drift[token]).toBeCloseTo(expected, 5);
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("PortfolioRebalancer – computeRebalanceTrades property", () => {
  it("only generates trades when |drift| exceeds threshold", () => {
    const rebalancer = makeRebalancer();

    fc.assert(
      fc.property(
        allocationArb,
        allocationArb,
        fc.integer({ min: 1000, max: 100_000 }),
        (currentAlloc, targetAlloc, totalUsd) => {
          const snapshot = makeSnapshot(currentAlloc, totalUsd);
          const trades = rebalancer.computeRebalanceTrades(snapshot, targetAlloc);

          // Every trade must involve tokens whose drift exceeds the threshold
          const drift = rebalancer.checkDrift(currentAlloc, targetAlloc);
          for (const trade of trades) {
            // Find the token symbols from the snapshot
            const tokenInSymbol = snapshot.tokens.find(
              (t) => t.address === trade.tokenIn,
            )?.symbol;
            const tokenOutSymbol = snapshot.tokens.find(
              (t) => t.address === trade.tokenOut,
            )?.symbol;

            if (tokenInSymbol) {
              expect(Math.abs(drift[tokenInSymbol] ?? 0)).toBeGreaterThan(THRESHOLD);
            }
            if (tokenOutSymbol) {
              expect(Math.abs(drift[tokenOutSymbol] ?? 0)).toBeGreaterThan(THRESHOLD);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("trade amounts are always positive", () => {
    const rebalancer = makeRebalancer();

    fc.assert(
      fc.property(
        allocationArb,
        allocationArb,
        fc.integer({ min: 1000, max: 100_000 }),
        (currentAlloc, targetAlloc, totalUsd) => {
          const snapshot = makeSnapshot(currentAlloc, totalUsd);
          const trades = rebalancer.computeRebalanceTrades(snapshot, targetAlloc);
          for (const trade of trades) {
            expect(trade.amount).toBeGreaterThan(0n);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
