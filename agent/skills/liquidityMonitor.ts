export interface LiquidityMonitorResult {
  poolAddress: string;
  reserves: { tokenA: bigint; tokenB: bigint };
  healthScore: number;
  change24h: number;
  alert: boolean;
}

export interface LiquiditySummary {
  summary: string;
  pools: LiquidityMonitorResult[];
}

export async function monitorLiquidity(rpcUrl: string, pools?: string[]): Promise<LiquiditySummary> {
  const poolList = pools || [];
  const results = poolList.map((pool) => ({
    poolAddress: pool,
    reserves: { tokenA: 0n, tokenB: 0n },
    healthScore: 0,
    change24h: 0,
    alert: false,
  }));
  return {
    summary: `Monitoring ${poolList.length || 0} pools`,
    pools: results,
  };
}