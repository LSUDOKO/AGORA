import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, formatUnits, http } from "viem";
import deploymentData from "../deployments/addresses.json";
import { analyzeGas } from "../agent/skills/gasOptimizer";
import { monitorLiquidity } from "../agent/skills/liquidityMonitor";
import { analyzeMarketSentiment } from "../agent/skills/marketSentiment";
import { trackPortfolio } from "../agent/skills/portfolioTracker";
import { xlayerTestnet } from "./chain";
import { agentRegistryAbi, paymentRouterAbi, addresses, usdcAbi } from "./contracts";
import { resolvePaymentToken, resolveRpcUrl, resolveTestnetSwapTokenIn, resolveTestnetSwapTokenOut } from "./agentConfig";
import { UNISWAP_XLAYER_TESTNET } from "./uniswap";

export interface AgentTelemetry {
  chain: {
    id: number;
    name: string;
    rpcUrl: string;
    deployedAt: string;
  };
  wallet: {
    address: `0x${string}` | null;
    paymentToken: `0x${string}`;
    swapTokenIn: `0x${string}`;
    swapTokenOut: `0x${string}`;
  };
  agent: {
    agentId: string;
    totalTxns: string;
    totalEarned: string;
    receiptCount: string;
  };
  swap: {
    mode: "testnet-direct";
    executeEnabled: boolean;
    router: `0x${string}`;
    quoter: `0x${string}`;
    poolFee: number;
    status: "ready" | "dry-run";
  };
  x402: {
    status: "needs-second-wallet";
    detail: string;
    router: `0x${string}`;
  };
  portfolio: {
    balance: string;
    symbol: string;
  };
  gas: Awaited<ReturnType<typeof analyzeGas>>;
  liquidity: Awaited<ReturnType<typeof monitorLiquidity>>;
  sentiment: Awaited<ReturnType<typeof analyzeMarketSentiment>>;
  recentReceipts: Array<{
    receiptId: number;
    agentId: string;
    skillId: string;
    amount: string;
    timestamp: string;
    completed: boolean;
  }>;
  checklist: Array<{
    label: string;
    status: "complete" | "ready" | "blocked";
    detail: string;
  }>;
}

export async function getAgentTelemetry(): Promise<AgentTelemetry> {
  const rpcUrl = resolveRpcUrl();
  const walletAddress = process.env.PRIVATE_KEY ? privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`).address : null;
  const publicClient = createPublicClient({
    chain: xlayerTestnet,
    transport: http(rpcUrl),
  });

  const paymentToken = resolvePaymentToken();
  const swapTokenIn = resolveTestnetSwapTokenIn();
  const swapTokenOut = resolveTestnetSwapTokenOut();

  const [gas, liquidity, sentiment, portfolio, receiptCount] = await Promise.all([
    analyzeGas(rpcUrl),
    monitorLiquidity(rpcUrl),
    analyzeMarketSentiment(swapTokenIn),
    walletAddress ? trackPortfolio(rpcUrl, walletAddress, paymentToken) : Promise.resolve(null),
    publicClient.readContract({
      address: addresses.paymentRouter,
      abi: paymentRouterAbi,
      functionName: "receiptCount",
    }),
  ]);

  let agentId = 0n;
  let totalTxns = 0n;
  let totalEarned = 0n;

  if (walletAddress) {
    agentId = await publicClient.readContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: "ownerToAgentId",
      args: [walletAddress],
    });

    if (agentId > 0n) {
      const [, , agentTxs, agentEarned] = await publicClient.readContract({
        address: addresses.agentRegistry,
        abi: agentRegistryAbi,
        functionName: "getAgent",
        args: [agentId],
      });
      totalTxns = agentTxs;
      totalEarned = agentEarned;
    }
  }

  const recentReceiptIds = Array.from({ length: Math.min(Number(receiptCount), 5) }, (_, index) => Number(receiptCount) - index).filter(
    (id) => id > 0,
  );
  const receiptReads = await Promise.all(
    recentReceiptIds.map((receiptId) =>
      publicClient.readContract({
        address: addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "getReceipt",
        args: [BigInt(receiptId)],
      }),
    ),
  );

  return {
    chain: {
      id: deploymentData.chainId,
      name: xlayerTestnet.name,
      rpcUrl,
      deployedAt: deploymentData.deployedAt,
    },
    wallet: {
      address: walletAddress,
      paymentToken,
      swapTokenIn,
      swapTokenOut,
    },
    agent: {
      agentId: agentId.toString(),
      totalTxns: totalTxns.toString(),
      totalEarned: formatUnits(totalEarned, 6),
      receiptCount: receiptCount.toString(),
    },
    swap: {
      mode: "testnet-direct",
      executeEnabled: process.env.UNISWAP_EXECUTE === "true",
      router: UNISWAP_XLAYER_TESTNET.swapRouter,
      quoter: UNISWAP_XLAYER_TESTNET.quoter,
      poolFee: Number(process.env.UNISWAP_POOL_FEE || 3000),
      status: process.env.UNISWAP_EXECUTE === "true" ? "ready" : "dry-run",
    },
    x402: {
      status: "needs-second-wallet",
      detail: "The self-hire restriction is correct. Register skills from a second wallet to produce real x402 receipts.",
      router: addresses.paymentRouter,
    },
    portfolio: {
      balance: portfolio?.formattedBalance || "0",
      symbol: deploymentData.paymentTokenSymbol || "tUSDC",
    },
    gas,
    liquidity,
    sentiment,
    recentReceipts: receiptReads.map((receipt, index) => ({
      receiptId: recentReceiptIds[index],
      agentId: receipt[0].toString(),
      skillId: receipt[1].toString(),
      amount: formatUnits(receipt[2], 6),
      timestamp: new Date(Number(receipt[3]) * 1000).toISOString(),
      completed: receipt[4],
    })),
    checklist: [
      {
        label: "Uniswap execution",
        status: process.env.UNISWAP_EXECUTE === "true" ? "complete" : "ready",
        detail:
          process.env.UNISWAP_EXECUTE === "true"
            ? "Direct Uniswap V3 swap execution is enabled on X Layer testnet."
            : "Testnet quote and calldata generation work. Set UNISWAP_EXECUTE=true to broadcast.",
      },
      {
        label: "x402 payments",
        status: "blocked",
        detail: "A second provider wallet is still required for non-self-hire testing.",
      },
      {
        label: "Monitoring skills",
        status: "complete",
        detail: "Gas, liquidity, sentiment, and portfolio telemetry are live.",
      },
    ],
  };
}
