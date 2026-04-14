import { parseAbi } from "viem";

export const UNISWAP_XLAYER = {
  chainId: 196,
  wrappedNative: "0xe538905cf8410324e03A5A23C1c177a474D59b2b" as `0x${string}`,
  universalRouterV20: "0x5507749f2c558bb3e162c6e90c314c092e7372ff" as `0x${string}`,
  universalRouterV211: "0x8B844f885672f333Bc0042cB669255f93a4C1E6b" as `0x${string}`,
  swapProxy: "0x02E5be68D46DAc0B524905bfF209cf47EE6dB2a9" as `0x${string}`,
  creationBlockV20: 47_680_350,
  creationBlockV211: 55_072_165,
} as const;

export const universalRouterAbi = parseAbi([
  "function execute(bytes commands, bytes[] inputs, uint256 deadline)",
]);

export function getUniswapRouter(chainId: number): `0x${string}` | null {
  if (chainId === 196) return UNISWAP_XLAYER.universalRouterV211;
  return null;
}

export function getWrappedNative(chainId: number): `0x${string}` | null {
  if (chainId === 196) return UNISWAP_XLAYER.wrappedNative;
  return null;
}
