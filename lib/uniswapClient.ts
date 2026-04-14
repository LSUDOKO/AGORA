/**
 * Uniswap Trading API client for AGORA.
 * Wraps quote, approval, and swap transaction generation for supported chains.
 */

export interface UniswapApprovalTx {
  to: `0x${string}`;
  from?: `0x${string}`;
  data: `0x${string}`;
  value?: string;
  chainId?: number;
}

export interface UniswapCheckApprovalResponse {
  approval: UniswapApprovalTx | null;
}

export interface UniswapQuoteResponse {
  routing?: string;
  quote: Record<string, any>;
  permitData?: Record<string, any> | null;
}

export interface UniswapSwapResponse {
  swap: {
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

export interface UniswapQuoteRequest {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amount: string;
  type: "EXACT_INPUT" | "EXACT_OUTPUT";
  swapper: `0x${string}`;
  chainId: number;
  protocols?: string[];
  slippageTolerance?: number;
  routingPreference?: "BEST_PRICE" | "FASTEST" | "CLASSIC";
}

export interface UniswapSwapRequest {
  quote: Record<string, any>;
  permit?: { v: number; r: string; s: string; deadline: number };
  signature?: string;
}

function isHexAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function extractQuotedAmount(response: UniswapQuoteResponse): string | null {
  const quote = response.quote ?? {};

  if (typeof quote.amount === "string") return quote.amount;
  if (typeof quote.outputAmount === "string") return quote.outputAmount;
  if (typeof quote.output?.amount === "string") return quote.output.amount;
  if (typeof quote.quote?.amount === "string") return quote.quote.amount;

  const firstOutput = quote.orderInfo?.outputs?.[0];
  if (typeof firstOutput?.startAmount === "string") return firstOutput.startAmount;
  if (typeof firstOutput?.endAmount === "string") return firstOutput.endAmount;

  return null;
}

export class UniswapClient {
  private readonly baseUrl = "https://trade-api.gateway.uniswap.org/v1";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private assertReady() {
    if (!this.apiKey) {
      throw new Error("UNISWAP_API_KEY is missing.");
    }
  }

  private async request<TResponse>(endpoint: string, method: string, body: Record<string, any>): Promise<TResponse> {
    this.assertReady();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "x-universal-router-version": "2.0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Uniswap API error: ${JSON.stringify(error)}`);
    }

    return (await response.json()) as TResponse;
  }

  async checkApproval(
    token: `0x${string}`,
    amount: string,
    walletAddress: `0x${string}`,
    chainId: number,
  ): Promise<UniswapCheckApprovalResponse> {
    if (!isHexAddress(token) || !isHexAddress(walletAddress)) {
      throw new Error("Invalid token or wallet address supplied to checkApproval.");
    }

    return this.request<UniswapCheckApprovalResponse>("/check_approval", "POST", {
      token,
      amount,
      walletAddress,
      chainId,
    });
  }

  async getQuote(params: UniswapQuoteRequest): Promise<UniswapQuoteResponse> {
    if (!isHexAddress(params.tokenIn) || !isHexAddress(params.tokenOut) || !isHexAddress(params.swapper)) {
      throw new Error("Invalid address supplied to getQuote.");
    }

    return this.request<UniswapQuoteResponse>("/quote", "POST", {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amount: params.amount,
      type: params.type,
      swapper: params.swapper,
      tokenInChainId: params.chainId.toString(),
      tokenOutChainId: params.chainId.toString(),
      protocols: params.protocols,
      slippageTolerance: params.slippageTolerance,
      routingPreference: params.routingPreference,
    });
  }

  async getSwap(params: UniswapSwapRequest): Promise<UniswapSwapResponse> {
    return this.request<UniswapSwapResponse>("/swap", "POST", params);
  }
}
