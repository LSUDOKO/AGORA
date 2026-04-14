"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, formatUnits, http, webSocket } from "viem";
import ActivityFeed from "./ActivityFeed";
import { ACTIVE_CHAIN } from "../lib/chain";
import { paymentRouterAbi, addresses } from "../lib/contracts";

interface FeedItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  amount: string;
  timeAgo: string;
}

const fallbackItems: FeedItem[] = [
  {
    id: "fallback-1",
    icon: "🤝",
    title: "Waiting for on-chain events",
    subtitle: "Connect live contracts to stream SkillHired and SkillCompleted events.",
    amount: "0.00 USDC",
    timeAgo: "just now",
  },
];

export default function LiveActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>(fallbackItems);

  const publicClient = useMemo(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WSS_URL;
    if (wsUrl) {
      return createPublicClient({
        chain: ACTIVE_CHAIN,
        transport: webSocket(wsUrl),
      });
    }

    return createPublicClient({
      chain: ACTIVE_CHAIN,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || ACTIVE_CHAIN.rpcUrls.default.http[0]),
    });
  }, []);

  useEffect(() => {
    if (!addresses.paymentRouter || !addresses.paymentRouter.startsWith("0x") || addresses.paymentRouter.length !== 42) {
      return;
    }

    let unwatchHired: (() => void) | undefined;
    let unwatchCompleted: (() => void) | undefined;

    try {
      unwatchHired = publicClient.watchContractEvent({
        address: addresses.paymentRouter,
        abi: paymentRouterAbi,
        eventName: "SkillHired",
        onLogs: (logs) => {
          const mapped = logs.map((log, index) => ({
            id: `${log.transactionHash}-${index}`,
            icon: "💸",
            title: `Agent #${log.args.agentId?.toString() ?? "?"} hired skill #${log.args.skillId?.toString() ?? "?"}`,
            subtitle: `Provider ${log.args.provider ?? "unknown"} received an x402 payment receipt on X Layer.`,
            amount: `${formatUnits(log.args.amount ?? 0n, 6)} USDC`,
            timeAgo: "just now",
          }));

          if (mapped.length > 0) {
            setItems((current) => [...mapped, ...current].slice(0, 20));
          }
        },
      });

      unwatchCompleted = publicClient.watchContractEvent({
        address: addresses.paymentRouter,
        abi: paymentRouterAbi,
        eventName: "SkillCompleted",
        onLogs: (logs) => {
          const mapped = logs.map((log, index) => ({
            id: `completed-${log.transactionHash}-${index}`,
            icon: "✅",
            title: `Receipt #${log.args.receiptId?.toString() ?? "?"} marked complete`,
            subtitle: "Skill provider finalized delivery for the hired task.",
            amount: "Completed",
            timeAgo: "just now",
          }));

          if (mapped.length > 0) {
            setItems((current) => [...mapped, ...current].slice(0, 20));
          }
        },
      });
    } catch (error) {
      console.error("Failed to subscribe to payment router events:", error);
    }

    return () => {
      unwatchHired?.();
      unwatchCompleted?.();
    };
  }, [publicClient]);

  return <ActivityFeed items={items} />;
}
