"use client";

import { useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useReadContract, useReadContracts, useWriteContract } from "wagmi";
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

  // Check if user has already hired this skill
  const { data: totalReceipts } = useReadContract({
    address: addresses.paymentRouter,
    abi: paymentRouterAbi,
    functionName: "receiptCount",
    query: { enabled: Boolean(addresses.paymentRouter) },
  });

  // Read all receipts to check if this user hired this skill
  const receiptIds = useMemo(() => {
    const count = Number(totalReceipts || 0);
    return Array.from({ length: Math.min(count, 50) }, (_, i) => BigInt(count - i));
  }, [totalReceipts]);

  const { data: receiptsData } = useReadContracts({
    contracts: receiptIds.map((id) => ({
      address: addresses.paymentRouter,
      abi: paymentRouterAbi,
      functionName: "receipts",
      args: [id],
    })),
    query: { enabled: receiptIds.length > 0 && Boolean(agentId) },
  });

  const hasHired = useMemo(() => {
    if (!receiptsData || !agentId) return false;
    
    return receiptsData.some((receipt) => {
      if (!receipt.result) return false;
      // Receipt struct: (agentId, skillId, amount, timestamp, completed)
      const [receiptAgentId, receiptSkillId] = receipt.result as [bigint, bigint, bigint, bigint, boolean];
      return receiptAgentId === agentId && receiptSkillId === BigInt(skillId);
    });
  }, [receiptsData, agentId, skillId]);

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

    if (hasHired) {
      setMessage("You've already hired this skill!");
      return;
    }

    try {
      setLoading(true);
      setMessage("Preparing x402 payment...");

      if (!allowance || allowance < priceUSDC) {
        setMessage("Approving USDC...");
        const approveHash = await writeContractAsync({
          address: addresses.usdc,
          abi: usdcAbi,
          functionName: "approve",
          args: [addresses.paymentRouter, parseUnits("1000", 6)],
        });
        await publicClient?.waitForTransactionReceipt({ hash: approveHash });
        await refetchAllowance();
      }

      setMessage("Hiring skill via x402...");
      const hireHash = await writeContractAsync({
        address: addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "hireSkill",
        args: [agentId, BigInt(skillId)],
      });
      
      setMessage("Waiting for confirmation...");
      await publicClient?.waitForTransactionReceipt({ hash: hireHash });
      
      setMessage(`✅ Skill hired! Tx: ${hireHash.slice(0, 10)}...`);
      
      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to hire skill.");
    } finally {
      setLoading(false);
    }
  };

  if (hasHired) {
    return (
      <div className="space-y-3">
        <button
          disabled
          className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 cursor-not-allowed"
        >
          ✓ Already Hired
        </button>
        <p className="text-xs text-slate-400">You've already hired this skill</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={hireSkill}
        disabled={loading}
        className="rounded-full bg-[#AAFF00] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#AAFF00]/80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing..." : `Hire via x402 · ${humanPrice}`}
      </button>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
