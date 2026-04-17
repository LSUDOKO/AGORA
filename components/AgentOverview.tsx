"use client";

import { useEffect, useState } from "react";
import AgentCard from "./AgentCard";
import { useAccount, useChainId, usePublicClient, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { agentRegistryAbi, addresses } from "../lib/contracts";
import { wagmiConfig } from "../lib/wagmiConfig";
import { ACTIVE_CHAIN } from "../lib/chain";

export default function AgentOverview() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const [mounted, setMounted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const trackEvent = async (event: string, data: any) => {
    try {
      await fetch("/api/agent/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, data })
      });
    } catch (e) {
      console.warn("Telemetry track failed", e);
    }
  };

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

  const { writeContractAsync } = useWriteContract();

  async function submitAgentAction(functionName: "registerAgent" | "incrementTxCount" | "recordEarnings", args: unknown[]) {
    setIsProcessing(true);

    try {
      // Network check
      if (chainId !== ACTIVE_CHAIN.id) {
        try {
          await switchChainAsync({ chainId: ACTIVE_CHAIN.id });
        } catch (error) {
          console.error("Failed to switch network:", error);
          throw new Error("Please switch to X Layer Testnet to continue.");
        }
      }

      const hash = await writeContractAsync({
        address: addresses.agentRegistry,
        abi: agentRegistryAbi,
        functionName,
        args: args as never,
      });

      setTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        await waitForTransactionReceipt(wagmiConfig, { hash });
      }

      await Promise.all([refetchAgentId(), refetchAgentData()]);
      
      const eventName = 
          functionName === "registerAgent" ? "agent:registered" :
          functionName === "incrementTxCount" ? "agent:tx_increment" :
          "agent:earnings_recorded";
      
      trackEvent(eventName, { 
        agentId: agentId?.toString(), 
        txHash: hash, 
        args: JSON.stringify(args, (_, v) => typeof v === 'bigint' ? v.toString() : v) 
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleRegister = () => {
    void submitAgentAction("registerAgent", ["Agora Prime Agent"]);
  };

  // During SSR or initial mount, show a placeholder with no user-specific data
  if (!mounted || !isConnected || !address || !agentId || agentId === 0n || !agentData) {
    return (
      <AgentCard
        name="Agora Prime"
        address={mounted && address ? address : "0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"}
        status={mounted && isConnected ? "Ready to Deploy" : "Connect Wallet"}
        tags={["Yield Finder", "Risk Aware", "x402 Enabled", "X Layer Native"]}
        txHash={txHash}
        isRegistering={isProcessing}
        onRegister={handleRegister}
      />
    );
  }

  const [owner, name] = agentData as [string, string, bigint, bigint];

  const handleIncrementTx = () => {
    void submitAgentAction("incrementTxCount", [agentId]);
  };

  const handleRecordEarnings = () => {
    void submitAgentAction("recordEarnings", [agentId, 1000000n]);
  };

  return (
    <AgentCard
      name={name}
      address={owner}
      status="Autonomous"
      tags={["Registered On-Chain", "x402 Enabled", "Prime Agent"]}
      agentId={Number(agentId)}
      txHash={txHash}
      onIncrementTx={handleIncrementTx}
      onRecordEarnings={handleRecordEarnings}
      isProcessing={isProcessing}
    />
  );
}

