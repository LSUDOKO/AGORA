"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { agentRegistryAbi, addresses } from "../lib/contracts";
import { wagmiConfig } from "../lib/wagmiConfig";
import { getTxExplorerUrl } from "../lib/explorer";

export default function DeployAgentButton() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [txHash, setTxHash] = useState<string | null>(null);

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

      setTxHash(hash);
      setMessage("Prime Agent deployed successfully!");
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
        className="rounded-full bg-[#AAFF00] px-5 py-3 text-sm font-black text-black uppercase tracking-widest transition hover:bg-[#AAFF00]/80 hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ fontFamily: "'Bebas Neue', cursive" }}
      >
        {loading ? "DEPLOYING TO X LAYER..." : "COMMIT AGENT REGISTRATION"}
      </button>
      {message && <p className="text-xs text-slate-400 font-bold tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{message}</p>}
      {txHash && (
        <a 
          href={getTxExplorerUrl(txHash)}
          target="_blank" rel="noreferrer"
          className="text-[10px] text-[#AAFF00] underline font-bold tracking-widest block mt-1" 
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          View Tx on X Layer Explorer ↗
        </a>
      )}
    </div>
  );
}
