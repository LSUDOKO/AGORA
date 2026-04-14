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
import { xlayer, xlayerTestnet } from "./chain";
import {
  extractQuotedAmount,
  type UniswapCheckApprovalResponse,
  type UniswapQuoteResponse,
  type UniswapSwapResponse,
  UniswapClient,
} from "./uniswapClient";

loadEnv();

export interface UniswapEnvironment {
  chainId: 196 | 1952;
  rpcUrl: string;
  accountAddress: `0x${string}`;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
  amountInDecimals: number;
  slippageTolerance: number;
  protocols: string[];
  routingPreference: "BEST_PRICE" | "FASTEST" | "CLASSIC";
  execute: boolean;
}

const TRADING_API_SUPPORTED_CHAINS = new Set<number>([
  1, 10, 56, 130, 137, 143, 196, 324, 480, 1301, 1868, 42161, 42220, 43114, 81457, 8453, 84532, 10143, 11155111, 7777777,
]);

export interface PreparedSwap {
  approval: UniswapCheckApprovalResponse["approval"];
  quoteResponse: UniswapQuoteResponse;
  swapResponse: UniswapSwapResponse;
  quoteAmountOut: string | null;
  tokenInBalance: bigint;
  formattedTokenInBalance: string;
}

const DEFAULTS = {
  1952: {
    tokenIn: "0x19672692257930438F4277E9A74A698774776100",
    tokenOut: "0x2720d209E992B8D009386D4948A31E13B03623C2",
    amount: "0.1",
    decimals: 6,
  },
  196: {
    tokenIn: "0x74b7F16337b8972027F6196A17a631aC6dE26d22",
    tokenOut: "0xe538905cf8410324e03A5A23C1c177a474D59b2b",
    amount: "1",
    decimals: 6,
  },
} as const satisfies Record<number, { tokenIn: `0x${string}`; tokenOut: `0x${string}`; amount: string; decimals: number }>;

function isSupportedChainId(chainId: number): chainId is 196 | 1952 {
  return chainId === 196 || chainId === 1952;
}

function mustAddress(value: string | undefined, label: string): `0x${string}` {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${label} must be a valid 0x address.`);
  }
  return getAddress(value);
}

function getChain(chainId: 196 | 1952) {
  return chainId === 196 ? xlayer : xlayerTestnet;
}

export function resolveUniswapEnvironment(): UniswapEnvironment {
  const rawChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1952);
  if (!isSupportedChainId(rawChainId)) {
    throw new Error(`Unsupported NEXT_PUBLIC_CHAIN_ID ${rawChainId}. Expected 1952 or 196.`);
  }

  const chain = getChain(rawChainId);
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const defaults = DEFAULTS[rawChainId];
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || chain.rpcUrls.default.http[0];
  const tokenIn = mustAddress(process.env.UNISWAP_TOKEN_IN || defaults.tokenIn, "UNISWAP_TOKEN_IN");
  const tokenOut = mustAddress(
    process.env.UNISWAP_TOKEN_OUT || defaults.tokenOut || process.env.TESTNET_WETH_ADDRESS,
    "UNISWAP_TOKEN_OUT",
  );
  const amount = process.env.UNISWAP_AMOUNT_IN || defaults.amount;
  const amountInDecimals = Number(process.env.UNISWAP_TOKEN_IN_DECIMALS || defaults.decimals);
  const slippageTolerance = Number(process.env.UNISWAP_SLIPPAGE_TOLERANCE || 0.5);
  const protocols = (process.env.UNISWAP_PROTOCOLS || "V3")
    .split(",")
    .map((protocol) => protocol.trim())
    .filter(Boolean);
  const routingPreference = (process.env.UNISWAP_ROUTING_PREFERENCE || "BEST_PRICE") as
    | "BEST_PRICE"
    | "FASTEST"
    | "CLASSIC";
  const execute = process.env.UNISWAP_EXECUTE === "true";

  return {
    chainId: rawChainId,
    rpcUrl,
    accountAddress: account.address,
    tokenIn,
    tokenOut,
    amountIn: parseUnits(amount, amountInDecimals),
    amountInDecimals,
    slippageTolerance,
    protocols,
    routingPreference,
    execute,
  };
}

export class UniswapExecutionService {
  private readonly env: UniswapEnvironment;
  private readonly account;
  private readonly publicClient;
  private readonly walletClient;
  private readonly client: UniswapClient;

  constructor(env = resolveUniswapEnvironment()) {
    this.env = env;
    const chain = getChain(env.chainId);
    this.account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    this.publicClient = createPublicClient({ chain, transport: http(env.rpcUrl) });
    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(env.rpcUrl),
    });
    this.client = new UniswapClient(process.env.UNISWAP_API_KEY || "");
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
    if (!TRADING_API_SUPPORTED_CHAINS.has(this.env.chainId)) {
      throw new Error(
        `Uniswap Trading API does not support chain ${this.env.chainId}. X Layer mainnet (196) is supported, but X Layer testnet (1952) is not.`,
      );
    }

    const [tokenInBalance, approval, quoteResponse] = await Promise.all([
      this.getTokenInBalance(),
      this.client.checkApproval(this.env.tokenIn, this.env.amountIn.toString(), this.account.address, this.env.chainId),
      this.client.getQuote({
        tokenIn: this.env.tokenIn,
        tokenOut: this.env.tokenOut,
        amount: this.env.amountIn.toString(),
        type: "EXACT_INPUT",
        swapper: this.account.address,
        chainId: this.env.chainId,
        protocols: this.env.protocols,
        slippageTolerance: this.env.slippageTolerance,
        routingPreference: this.env.routingPreference,
      }),
    ]);

    const swapResponse = await this.client.getSwap({ quote: quoteResponse.quote });

    return {
      approval: approval.approval,
      quoteResponse,
      swapResponse,
      quoteAmountOut: extractQuotedAmount(quoteResponse),
      tokenInBalance,
      formattedTokenInBalance: formatUnits(tokenInBalance, this.env.amountInDecimals),
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
        value: BigInt(prepared.approval.value || 0),
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: approvalHash });
    }

    const swapHash = await this.walletClient.sendTransaction({
      to: prepared.swapResponse.swap.to,
      data: prepared.swapResponse.swap.data,
      value: BigInt(prepared.swapResponse.swap.value || 0),
      account: this.account,
    });
    return this.publicClient.waitForTransactionReceipt({ hash: swapHash });
  }
}
