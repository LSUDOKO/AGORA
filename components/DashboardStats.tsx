"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { agentRegistryAbi, addresses, paymentRouterAbi, usdcAbi } from "../lib/contracts";
import StatCard from "./StatCard";

export default function DashboardStats() {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: agentId } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "ownerToAgentId",
    args: address ? [address] : undefined,
    query: {
      enabled:
        mounted &&
        Boolean(address) &&
        Boolean(addresses.agentRegistry) &&
        addresses.agentRegistry.startsWith("0x") &&
        addresses.agentRegistry.length === 42,
    },
  });

  const { data } = useReadContracts({
    contracts:
      mounted && agentId && agentId > 0n
        ? [
            {
              address: addresses.agentRegistry,
              abi: agentRegistryAbi,
              functionName: "getAgent",
              args: [agentId],
            },
            {
              address: addresses.paymentRouter,
              abi: paymentRouterAbi,
              functionName: "receiptCount",
            },
            {
              address: addresses.usdc,
              abi: usdcAbi,
              functionName: "balanceOf",
              args: address ? [address] : undefined,
            },
          ]
        : [],
    query: { enabled: mounted && Boolean(agentId && agentId > 0n) },
  });

  const agentTuple = data?.[0]?.result as [string, string, bigint, bigint] | undefined;
  const totalTxns = agentTuple?.[2] || 0n;
  const totalEarned = agentTuple?.[3] || 0n;
  const totalReceipts = (data?.[1]?.result as bigint | undefined) || 0n;
  const usdcBalance = (data?.[2]?.result as bigint | undefined) || 0n;

  const stats = [
    { label: "Total Earned ($)", value: `$${formatUnits(totalEarned, 6)}`, helper: "Recorded in AgentRegistry" },
    { label: "Txns Today", value: totalTxns.toString(), helper: "Prime Agent transaction count" },
    { label: "Skills Hired", value: totalReceipts.toString(), helper: "x402 receipts issued on-chain" },
    { label: "Payment Token", value: `${formatUnits(usdcBalance, 6)}`, helper: "Wallet USDC/tUSDC balance" },
  ];

  if (!mounted) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}

