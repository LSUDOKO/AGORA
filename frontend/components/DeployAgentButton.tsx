"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { agentRegistryAbi, addresses } from "../lib/contracts";
import { wagmiConfig } from "../lib/wagmiConfig";

export default function DeployAgentButton() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const deployAgent = async () => {
    if (!isConnected) {
      setMessage("Connect your wallet first.");
      return;
    }

    if (!addresses.agentRegistry || addresses.agentRegistry === "0x") {
      setMessage("Deploy contracts first so the frontend can read addresses.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Submitting Prime Agent registration...");
      const hash = await writeContractAsync({
        address: addresses.agentRegistry,
        abi: agentRegistryAbi,
        functionName: "registerAgent",
        args: ["Priya Prime"],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        await waitForTransactionReceipt(wagmiConfig, { hash });
      }

      setMessage(`Prime Agent deployed: ${hash}`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to deploy Prime Agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={deployAgent}
        disabled={loading}
        className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Deploying..." : "Deploy My Agent"}
      </button>
      {message ? <p className="text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}
