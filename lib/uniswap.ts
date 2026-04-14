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

export const UNISWAP_XLAYER_TESTNET = {
  chainId: 1952,
  wrappedNative: "0x2720d209E992B8D009386D4948A31E13B03623C2" as `0x${string}`,
  universalRouterV2: "0x3013d50F2C2c2f7b494B4E858D64a02568e647B7" as `0x${string}`,
  swapRouter: "0x91F566085a66a7b39922e30777176E3661608466" as `0x${string}`,
  factory: "0x429623C699E10F9c90F6230678d4D976458514C7" as `0x${string}`,
  quoter: "0xe62BaA3B73809CDea9e7019E7581B8511E948332" as `0x${string}`,
} as const;

export const universalRouterAbi = parseAbi([
  "function execute(bytes commands, bytes[] inputs, uint256 deadline)",
]);

export function getUniswapRouter(chainId: number): `0x${string}` | null {
  if (chainId === 196) return UNISWAP_XLAYER.universalRouterV211;
  if (chainId === 1952) return UNISWAP_XLAYER_TESTNET.universalRouterV2;
  return null;
}

export function getWrappedNative(chainId: number): `0x${string}` | null {
  if (chainId === 196) return UNISWAP_XLAYER.wrappedNative;
  if (chainId === 1952) return UNISWAP_XLAYER_TESTNET.wrappedNative;
  return null;
}
