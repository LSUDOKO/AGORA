import { config as loadEnv } from "dotenv";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatUnits,
  getAddress,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xlayerTestnet } from "./chain";
import {
  TESTNET_CHAIN_ID,
  isTestnetChain,
  resolveRpcUrl,
  resolveTestnetSwapTokenIn,
  resolveTestnetSwapTokenOut,
  createDexRouter,
} from "./agentConfig";
import type { DexRouter } from "./dexRouter";

loadEnv();

export interface UniswapEnvironment {
  chainId: 1952;
  rpcUrl: string;
  accountAddress: `0x${string}`;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
  amountInDecimals: number;
  slippageTolerance: number;
  fee: number;
  execute: boolean;
  mode: "testnet-direct";
}

export interface PreparedSwap {
  approval: {
    to: `0x${string}`;
    data: `0x${string}`;
    value: string;
  } | null;
  quoteAmountOut: string;
  minAmountOut: bigint;
  tokenInBalance: bigint;
  formattedTokenInBalance: string;
  swapTarget: `0x${string}`;
  swapCalldata: `0x${string}`;
}

function mustAddress(value: string | undefined, label: string): `0x${string}` {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${label} must be a valid 0x address.`);
  }

  return getAddress(value);
}

export function resolveUniswapEnvironment(): UniswapEnvironment {
  const rawChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || TESTNET_CHAIN_ID);
  if (!isTestnetChain(rawChainId)) {
    throw new Error(
      `AGORA is configured for Uniswap testnet mode only. Set NEXT_PUBLIC_CHAIN_ID=${TESTNET_CHAIN_ID} instead of ${rawChainId}.`,
    );
  }

  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is required for swap preparation.");
  }

  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const amountInDecimals = Number(process.env.UNISWAP_TOKEN_IN_DECIMALS || 6);
  const amount = process.env.UNISWAP_AMOUNT_IN || "1";

  return {
    chainId: TESTNET_CHAIN_ID,
    rpcUrl: resolveRpcUrl(),
    accountAddress: account.address,
    tokenIn: mustAddress(resolveTestnetSwapTokenIn(), "UNISWAP_TOKEN_IN"),
    tokenOut: mustAddress(resolveTestnetSwapTokenOut(), "UNISWAP_TOKEN_OUT"),
    amountIn: parseUnits(amount, amountInDecimals),
    amountInDecimals,
    slippageTolerance: Number(process.env.UNISWAP_SLIPPAGE_TOLERANCE || 0.5),
    fee: Number(process.env.UNISWAP_POOL_FEE || 3000),
    execute: process.env.UNISWAP_EXECUTE === "true",
    mode: "testnet-direct",
  };
}

export class UniswapExecutionService {
  private readonly env: UniswapEnvironment;
  private readonly account;
  private readonly publicClient;
  private readonly walletClient;
  private readonly router: DexRouter;

  constructor(env = resolveUniswapEnvironment()) {
    this.env = env;
    this.account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    this.publicClient = createPublicClient({
      chain: xlayerTestnet,
      transport: http(env.rpcUrl),
    });
    this.walletClient = createWalletClient({
      account: this.account,
      chain: xlayerTestnet,
      transport: http(env.rpcUrl),
    });
    this.router = createDexRouter();
  }

  getEnvironment() {
    return this.env;
  }

  async getTokenInBalance() {
    return this.publicClient.readContract({
      address: this.env.tokenIn,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [this.account.address],
    });
  }

  async prepareSwap(): Promise<PreparedSwap> {
    const amountInStr = this.env.amountIn.toString();

    const [tokenInBalance, approvalResult, quoteResult] = await Promise.all([
      this.getTokenInBalance(),
      this.router.checkApproval({
        token: this.env.tokenIn,
        amount: amountInStr,
        walletAddress: this.account.address,
        chainId: this.env.chainId,
      }),
      this.router.getQuote({
        tokenIn: this.env.tokenIn,
        tokenOut: this.env.tokenOut,
        amount: amountInStr,
        type: "EXACT_INPUT",
        swapper: this.account.address,
        chainId: this.env.chainId,
        slippageTolerance: this.env.slippageTolerance,
      }),
    ]);

    // Extract quoted output amount from the quote response
    const rawQuote = quoteResult.quote;
    const quotedAmountOut = BigInt(
      rawQuote.outputAmount ??
      rawQuote.output?.amount ??
      rawQuote.quote?.amount ??
      rawQuote.amount ??
      "0",
    );

    const minAmountOut =
      (quotedAmountOut * BigInt(Math.max(0, Math.round((100 - this.env.slippageTolerance) * 100)))) / 10_000n;

    // Map approval result to PreparedSwap shape
    const approval = approvalResult.approval
      ? {
          to: approvalResult.approval.to,
          data: approvalResult.approval.data,
          value: approvalResult.approval.value ?? "0",
        }
      : null;

    // Get the swap transaction from the router
    const swapResult = await this.router.executeSwap({ quote: rawQuote });

    return {
      approval,
      quoteAmountOut: quotedAmountOut.toString(),
      minAmountOut,
      tokenInBalance,
      formattedTokenInBalance: formatUnits(tokenInBalance, this.env.amountInDecimals),
      swapTarget: swapResult.tx.to,
      swapCalldata: swapResult.tx.data,
    };
  }

  async executePreparedSwap(prepared: PreparedSwap) {
    if (!this.env.execute) {
      throw new Error("UNISWAP_EXECUTE is not enabled. Refusing to submit transactions.");
    }

    if (prepared.approval) {
      const approvalHash = await this.walletClient.sendTransaction({
        to: prepared.approval.to,
        data: prepared.approval.data,
        value: 0n,
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: approvalHash });
    }

    const swapHash = await this.walletClient.sendTransaction({
      to: prepared.swapTarget,
      data: prepared.swapCalldata,
      value: 0n,
      account: this.account,
    });

    return this.publicClient.waitForTransactionReceipt({ hash: swapHash });
  }
}
