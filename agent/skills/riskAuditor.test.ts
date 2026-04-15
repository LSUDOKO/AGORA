/**
 * Property tests for riskAuditor.
 *
 * **Validates: Requirements 9.6**
 *
 * Property: For any valid pool address string, the returned risk score
 * is always in [0, 100] and `passed` is true iff score >= 65.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// Mock shared module so callOnchainOS returns null (triggers fallback path)
// and createChainPublicClient returns a mock viem client.
vi.mock("../skills/shared", () => ({
  callOnchainOS: vi.fn().mockReturnValue(null),
  getChainFromRpc: vi.fn().mockReturnValue({ id: 1952, name: "X Layer Testnet" }),
  createChainPublicClient: vi.fn().mockReturnValue({
    readContract: vi.fn().mockImplementation(({ functionName }: { functionName: string }) => {
      if (functionName === "getReserves") {
        // Return realistic reserve data: [reserve0, reserve1, timestamp]
        return Promise.resolve([5_000_000n, 5_000_000n, 0]);
      }
      if (functionName === "totalSupply") {
        return Promise.resolve(2_000_000n);
      }
      return Promise.resolve(0n);
    }),
  }),
}));

import { auditPool } from "./riskAuditor";

describe("auditPool – risk score bounds property", () => {
  // Generator: any non-empty hex-like address string
  const poolAddressArb = fc
    .hexaString({ minLength: 40, maxLength: 40 })
    .map((s) => `0x${s}` as string);

  it("score is always in [0, 100] for any pool address (fallback path)", async () => {
    await fc.assert(
      fc.asyncProperty(poolAddressArb, async (poolAddress) => {
        const result = await auditPool(poolAddress, "https://testrpc.xlayer.tech");
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 20 },
    );
  });

  it("passed flag is true iff score >= 65", async () => {
    await fc.assert(
      fc.asyncProperty(poolAddressArb, async (poolAddress) => {
        const result = await auditPool(poolAddress, "https://testrpc.xlayer.tech");
        expect(result.passed).toBe(result.score >= 65);
      }),
      { numRuns: 20 },
    );
  });
});
