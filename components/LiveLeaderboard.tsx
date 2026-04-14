"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, http } from "viem";
import { ACTIVE_CHAIN } from "../lib/chain";
import { addresses, leaderboardAbi } from "../lib/contracts";
import LeaderboardTable from "./LeaderboardTable";

interface AgentActivity {
  agentId: bigint;
  txCount: bigint;
  usdcPaid: bigint;
}

export default function LiveLeaderboard() {
  const [rows, setRows] = useState<AgentActivity[]>([]);

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: ACTIVE_CHAIN,
        transport: http(process.env.NEXT_PUBLIC_RPC_URL || ACTIVE_CHAIN.rpcUrls.default.http[0]),
      }),
    [],
  );

  useEffect(() => {
    if (!addresses.leaderboard || !addresses.leaderboard.startsWith("0x") || addresses.leaderboard.length !== 42) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const result = await publicClient.readContract({
          address: addresses.leaderboard,
          abi: leaderboardAbi,
          functionName: "getTopAgents",
          args: [10n],
        });

        if (!cancelled) {
          setRows(result as AgentActivity[]);
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      }
    };

    void load();
    const interval = setInterval(load, 10_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicClient]);

  const txRows = rows.map((row) => ({
    agentId: Number(row.agentId),
    value: Number(row.txCount),
  }));

  const paymentRows = rows.map((row) => ({
    agentId: Number(row.agentId),
    value: Number(row.usdcPaid) / 1_000_000,
  }));

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <LeaderboardTable title="By transaction volume" unit="Transactions" rows={txRows.length ? txRows : [{ agentId: 0, value: 0 }]} />
      <LeaderboardTable title="By x402 payments sent" unit="USDC Paid" rows={paymentRows.length ? paymentRows : [{ agentId: 0, value: 0 }]} />
    </section>
  );
}
