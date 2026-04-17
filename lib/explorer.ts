export const X_LAYER_TESTNET_EXPLORER_BASE = "https://www.okx.com/web3/explorer/xlayer-test";

export function getTxExplorerUrl(hash: string) {
  return `${X_LAYER_TESTNET_EXPLORER_BASE}/tx/${hash}`;
}
