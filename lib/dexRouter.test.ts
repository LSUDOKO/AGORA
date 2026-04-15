/**
 * Unit tests for DEX Router network routing logic.
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("createDexRouter()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it("returns a UniswapDexRouter instance when NEXT_PUBLIC_CHAIN_ID=1952", async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = "1952";
    process.env.UNISWAP_API_KEY = "test-key";

    // Import both from the same fresh module instance so instanceof works
    const [{ createDexRouter }, { UniswapDexRouter }] = await Promise.all([
      import("./agentConfig"),
      import("./dexRouter"),
    ]);

    const router = createDexRouter();
    expect(router).toBeInstanceOf(UniswapDexRouter);
  });

  it("throws an error when NEXT_PUBLIC_CHAIN_ID=196 (mainnet not supported)", async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = "196";

    const { createDexRouter } = await import("./agentConfig");

    expect(() => createDexRouter()).toThrow();
  });

  it("thrown error message mentions chain 1952 or testnet", async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = "196";

    const { createDexRouter } = await import("./agentConfig");

    expect(() => createDexRouter()).toThrowError(/1952|testnet/i);
  });
});
