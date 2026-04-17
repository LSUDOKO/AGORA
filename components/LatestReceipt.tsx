"use client";

import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { addresses, paymentRouterAbi } from "../lib/contracts";
import X402Receipt from "./x402Receipt";

export default function LatestReceipt() {
  const { data: receiptCount } = useReadContract({
    address: addresses.paymentRouter,
    abi: paymentRouterAbi,
    functionName: "receiptCount",
    query: {
      enabled:
        Boolean(addresses.paymentRouter) &&
        addresses.paymentRouter.startsWith("0x") &&
        addresses.paymentRouter.length === 42,
    },
  });

  const { data: receipt } = useReadContract({
    address: addresses.paymentRouter,
    abi: paymentRouterAbi,
    functionName: "receipts",
    args: receiptCount && receiptCount > 0n ? [receiptCount] : undefined,
    query: { enabled: Boolean(receiptCount && receiptCount > 0n) },
  });

  if (!receiptCount || receiptCount === 0n || !receipt) {
    return (
      <X402Receipt
        service="Risk Auditor"
        protocol="x402"
        task="Awaiting first hire"
        amount="0.00 USDC"
        timestamp="No receipts yet"
        status="Idle"
      />
    );
  }

  // Receipt struct: (agentId, skillId, amount, timestamp, completed)
  const [agentId, skillId, amount, timestamp, completed] = receipt;

  return (
    <X402Receipt
      service={`Skill #${skillId.toString()}`}
      protocol="x402"
      task={`Receipt #${receiptCount.toString()} for Agent #${agentId.toString()}`}
      amount={`${formatUnits(amount, 6)} USDC`}
      timestamp={new Date(Number(timestamp) * 1000).toLocaleString()}
      status={completed ? "Completed" : "Pending"}
    />
  );
}
