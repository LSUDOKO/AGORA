/**
 * Network-aware DEX router abstraction.
 * Testnet (chain 1952): Uniswap Trading API
 * Mainnet (chain 196):  OKX DEX Aggregator (not yet implemented)
 */

import {
  UniswapClient,
  UniswapQuoteRequest,
  UniswapQuoteResponse,
  UniswapSwapResponse,
  UniswapCheckApprovalResponse,
} from "./uniswapClient";

// ─── Shared param / result types ────────────────────────────────────────────

export interface QuoteParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amount: string;
  type: "EXACT_INPUT" | "EXACT_OUTPUT";
  swapper: `0x${string}`;
  chainId: number;
  slippageTolerance?: number;
}

export interface QuoteResult {
  /** Raw quote data from the underlying DEX */
  quote: Record<string, any>;
  /** Permit data if required by the DEX */
  permitData?: Record<string, any> | null;
  /** Human-readable output amount (best-effort) */
  outputAmount?: string;
}

export interface SwapParams {
  /** The quote object returned by `getQuote` */
  quote: Record<string, any>;
  permit?: { v: number; r: string; s: string; deadline: number };
  signature?: string;
}

export interface SwapResult {
  /** Unsigned transaction ready to be sent */
  tx: {
    to: `0x${string}`;
    from?: `0x${string}`;
    data: `0x${string}`;
    value?: string;
    gasLimit?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };
  permitData?: Record<string, any> | null;
}

export interface ApprovalParams {
  token: `0x${string}`;
  amount: string;
  walletAddress: `0x${string}`;
  chainId: number;
}

export interface ApprovalResult {
  /** Approval transaction, or null if no approval is needed */
  approval: {
    to: `0x${string}`;
    from?: `0x${string}`;
    data: `0x${string}`;
    value?: string;
    chainId?: number;
  } | null;
}

// ─── DexRouter interface ─────────────────────────────────────────────────────

export interface DexRouter {
  getQuote(params: QuoteParams): Promise<QuoteResult>;
  executeSwap(params: SwapParams): Promise<SwapResult>;
  checkApproval(params: ApprovalParams): Promise<ApprovalResult>;
}

// ─── UniswapDexRouter (testnet chain 1952) ───────────────────────────────────

export class UniswapDexRouter implements DexRouter {
  private readonly client: UniswapClient;

  constructor(apiKey: string) {
    this.client = new UniswapClient(apiKey);
  }

  async getQuote(params: QuoteParams): Promise<QuoteResult> {
    const request: UniswapQuoteRequest = {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amount: params.amount,
      type: params.type,
      swapper: params.swapper,
      chainId: params.chainId,
      slippageTolerance: params.slippageTolerance,
    };

    const response: UniswapQuoteResponse = await this.client.getQuote(request);

    return {
      quote: response.quote,
      permitData: response.permitData,
    };
  }

  async executeSwap(params: SwapParams): Promise<SwapResult> {
    const response: UniswapSwapResponse = await this.client.getSwap({
      quote: params.quote,
      permit: params.permit,
      signature: params.signature,
    });

    return {
      tx: response.swap,
      permitData: response.permitData,
    };
  }

  async checkApproval(params: ApprovalParams): Promise<ApprovalResult> {
    // If on X Layer Testnet (1952), the Uniswap Trading API won't have allowance data.
    // Perform a local on-chain check instead.
    if (params.chainId === 1952) {
      const { erc20Abi, createPublicClient, http, getAddress } = await import("viem");
      const { xlayerTestnet } = await import("./chain");
      const { resolveRpcUrl } = await import("./agentConfig");
      const { UNISWAP_XLAYER_TESTNET } = await import("./uniswap");

      const publicClient = createPublicClient({
        chain: xlayerTestnet,
        transport: http(resolveRpcUrl()),
      });

      const allowance = await publicClient.readContract({
        address: getAddress(params.token),
        abi: erc20Abi,
        functionName: "allowance",
        args: [getAddress(params.walletAddress), getAddress(UNISWAP_XLAYER_TESTNET.universalRouterV2)],
      });

      if (allowance >= BigInt(params.amount)) {
        return { approval: null };
      }

      // If allowance is insufficient, return an approval transaction targeting our testnet router
      const { encodeFunctionData } = await import("viem");
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [getAddress(UNISWAP_XLAYER_TESTNET.universalRouterV2), BigInt(params.amount)],
      });

      return {
        approval: {
          to: getAddress(params.token),
          data,
          chainId: params.chainId,
        },
      };
    }

    const response: UniswapCheckApprovalResponse = await this.client.checkApproval(
      params.token,
      params.amount,
      params.walletAddress,
      params.chainId,
    );

    return {
      approval: response.approval,
    };
  }
}
