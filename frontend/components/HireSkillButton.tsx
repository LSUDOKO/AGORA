"use client";

import { useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { agentRegistryAbi, addresses, paymentRouterAbi, usdcAbi } from "../lib/contracts";

interface HireSkillButtonProps {
  skillId: number;
  priceUSDC: bigint;
}

export default function HireSkillButton({ skillId, priceUSDC }: HireSkillButtonProps) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const { data: agentId } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "ownerToAgentId",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && addresses.agentRegistry) },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.usdc,
    abi: usdcAbi,
    functionName: "allowance",
    args: address ? [address, addresses.paymentRouter] : undefined,
    query: { enabled: Boolean(address && addresses.usdc && addresses.paymentRouter) },
  });

  const humanPrice = useMemo(() => `${formatUnits(priceUSDC, 6)} USDC`, [priceUSDC]);

  const hireSkill = async () => {
    if (!isConnected || !address) {
      setMessage("Connect your wallet first.");
      return;
    }

    if (!agentId || agentId === 0n) {
      setMessage("Register your Prime Agent first on the dashboard.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Preparing x402 payment...");

      if (!allowance || allowance < priceUSDC) {
        const approveHash = await writeContractAsync({
          address: addresses.usdc,
          abi: usdcAbi,
          functionName: "approve",
          args: [addresses.paymentRouter, parseUnits("1000", 6)],
        });
        await publicClient?.waitForTransactionReceipt({ hash: approveHash });
        await refetchAllowance();
      }

      const hireHash = await writeContractAsync({
        address: addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "hireSkill",
        args: [agentId, BigInt(skillId)],
      });
      await publicClient?.waitForTransactionReceipt({ hash: hireHash });
      setMessage(`Skill hired successfully. Tx: ${hireHash}`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to hire skill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={hireSkill}
        disabled={loading}
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing..." : `Hire via x402 · ${humanPrice}`}
      </button>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
