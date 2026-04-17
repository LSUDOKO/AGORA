"use client";

import { useEffect, useState } from "react";
import AgentCard from "./AgentCard";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { agentRegistryAbi, addresses } from "../lib/contracts";

export default function AgentOverview() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: agentId, refetch: refetchAgentId } = useReadContract({
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

  const { data: agentData, refetch: refetchAgentData } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "getAgent",
    args: agentId && agentId > 0n ? [agentId] : undefined,
    query: {
      enabled:
        mounted &&
        Boolean(agentId && agentId > 0n) &&
        Boolean(addresses.agentRegistry) &&
        addresses.agentRegistry.startsWith("0x") &&
        addresses.agentRegistry.length === 42,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetchAgentId();
      refetchAgentData();
    }
  }, [isSuccess, refetchAgentId, refetchAgentData]);

  const handleRegister = () => {
    writeContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: "registerAgent",
      args: ["Agora Prime Agent"],
    });
  };

  // During SSR or initial mount, show a placeholder with no user-specific data
  if (!mounted || !isConnected || !address || !agentId || agentId === 0n || !agentData) {
    return (
      <AgentCard
        name="Agora Prime"
        address={mounted && address ? address : "0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"}
        status={mounted && isConnected ? "Ready to Deploy" : "Connect Wallet"}
        tags={["Yield Finder", "Risk Aware", "x402 Enabled", "X Layer Native"]}
        isRegistering={isPending || isWaiting}
        onRegister={handleRegister}
      />
    );
  }

  const [owner, name] = agentData as [string, string, bigint, bigint];

  const handleIncrementTx = () => {
    writeContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: "incrementTxCount",
      args: [agentId],
    });
  };

  const handleRecordEarnings = () => {
    writeContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: "recordEarnings",
      args: [agentId, 1000000n], // 1 tUSDC for mockup
    });
  };

  return (
    <AgentCard
      name={name}
      address={owner}
      status="Autonomous"
      tags={["Registered On-Chain", "x402 Enabled", "Prime Agent"]}
      agentId={Number(agentId)}
      onIncrementTx={handleIncrementTx}
      onRecordEarnings={handleRecordEarnings}
      isProcessing={isPending || isWaiting}
    />
  );
}


