import { execSync } from "node:child_process";
import { createPublicClient, http } from "viem";
import { xlayer, xlayerTestnet } from "../../lib/chain";

export function getChainFromRpc(rpcUrl: string) {
  return rpcUrl.includes("testrpc") || rpcUrl.includes("xlayertest") ? xlayerTestnet : xlayer;
}

export function createChainPublicClient(rpcUrl: string) {
  const chain = getChainFromRpc(rpcUrl);
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

export function callOnchainOS(command: string): any {
  try {
    const okApiKey = process.env.OK_API_KEY || "";
    if (!okApiKey) {
      return null;
    }

    const result = execSync(`~/.local/bin/onchainos ${command}`, {
      encoding: "utf-8",
      timeout: 15_000,
      env: {
        ...process.env,
        OK_API_KEY: okApiKey,
        OK_ACCESS_KEY: okApiKey,
      },
    });

    return JSON.parse(result);
  } catch (error: any) {
    if (error?.message?.includes("Unexpected")) {
      return null;
    }

    // console.warn(`Onchain OS CLI error for command "${command}":`, error?.message || error);
    return null;
  }
}
