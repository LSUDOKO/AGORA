import deploymentData from "../deployments/addresses.json";
import { xlayerTestnet } from "./chain";
import { UNISWAP_XLAYER_TESTNET } from "./uniswap";
import { DexRouter, UniswapDexRouter } from "./dexRouter";

export const TESTNET_CHAIN_ID = 1952;
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1952);

export function resolveActiveChainId() {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID || deploymentData.chainId || TESTNET_CHAIN_ID);
}

export function isTestnetChain(chainId: number) {
  return chainId === TESTNET_CHAIN_ID;
}

export function resolveRpcUrl() {
  return process.env.NEXT_PUBLIC_RPC_URL || xlayerTestnet.rpcUrls.default.http[0];
}

export function resolvePaymentToken() {
  return (deploymentData.testTokens?.TestUSDC || deploymentData.usdc) as `0x${string}`;
}

export function resolveTestnetSwapTokenIn() {
  return (process.env.UNISWAP_TOKEN_IN || resolvePaymentToken()) as `0x${string}`;
}

export function resolveTestnetSwapTokenOut() {
  return (process.env.UNISWAP_TOKEN_OUT || UNISWAP_XLAYER_TESTNET.wrappedNative) as `0x${string}`;
}

export function createDexRouter(): DexRouter {
  if (CHAIN_ID !== 1952) {
    throw new Error(`Uniswap DEX router is only supported on X Layer testnet (chain 1952). Current chain: ${CHAIN_ID}`);
  }
  return new UniswapDexRouter(process.env.UNISWAP_API_KEY!);
}
