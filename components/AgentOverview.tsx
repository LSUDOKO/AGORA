"use client";

import AgentCard from "./AgentCard";
import { useAccount, useReadContract } from "wagmi";
import { agentRegistryAbi, addresses } from "../lib/contracts";

export default function AgentOverview() {
  const { address, isConnected } = useAccount();

  const { data: agentId } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "ownerToAgentId",
    args: address ? [address] : undefined,
    query: {
      enabled:
        Boolean(address) &&
        Boolean(addresses.agentRegistry) &&
        addresses.agentRegistry.startsWith("0x") &&
        addresses.agentRegistry.length === 42,
    },
  });

  const { data: agentData } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "getAgent",
    args: agentId && agentId > 0n ? [agentId] : undefined,
    query: {
      enabled:
        Boolean(agentId && agentId > 0n) &&
        Boolean(addresses.agentRegistry) &&
        addresses.agentRegistry.startsWith("0x") &&
        addresses.agentRegistry.length === 42,
    },
  });

  if (!isConnected || !address || !agentId || agentId === 0n || !agentData) {
    return (
      <AgentCard
        name="Priya Prime"
        address={address || "0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"}
        status={isConnected ? "Ready to Deploy" : "Connect Wallet"}
        tags={["Yield Finder", "Risk Aware", "x402 Enabled", "X Layer Native"]}
      />
    );
  }

  const [owner, name] = agentData;

  return (
    <AgentCard
      name={name}
      address={owner}
      status="Autonomous"
      tags={["Registered On-Chain", "x402 Enabled", "Prime Agent"]}
      agentId={Number(agentId)}
    />
  );
}
