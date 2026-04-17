"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccount, useReadContract } from "wagmi";
import { addresses, agentRegistryAbi } from "./contracts";

interface AgentData {
  owner: string;
  name: string;
  totalTxns: bigint;
  totalEarned: bigint;
}

interface AgentContextType {
  agentId: bigint | null;
  agentData: AgentData | null;
  isRegistered: boolean;
  isLoading: boolean;
  refetch: () => void;
}

const AgentContext = createContext<AgentContextType>({
  agentId: null,
  agentData: null,
  isRegistered: false,
  isLoading: false,
  refetch: () => {},
});

export function AgentProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();

  const {
    data: agentId,
    isLoading: isLoadingId,
    refetch: refetchId,
  } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "ownerToAgentId",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && addresses.agentRegistry),
    },
  });

  const {
    data: agentDataRaw,
    isLoading: isLoadingData,
    refetch: refetchData,
  } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "getAgent",
    args: agentId ? [agentId] : undefined,
    query: {
      enabled: Boolean(agentId && agentId > 0n),
    },
  });

  const agentData: AgentData | null = agentDataRaw
    ? {
        owner: agentDataRaw[0] as string,
        name: agentDataRaw[1] as string,
        totalTxns: agentDataRaw[2] as bigint,
        totalEarned: agentDataRaw[3] as bigint,
      }
    : null;

  const refetch = () => {
    refetchId();
    refetchData();
  };

  return (
    <AgentContext.Provider
      value={{
        agentId: agentId || null,
        agentData,
        isRegistered: Boolean(agentId && agentId > 0n),
        isLoading: isLoadingId || isLoadingData,
        refetch,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within AgentProvider");
  }
  return context;
}
