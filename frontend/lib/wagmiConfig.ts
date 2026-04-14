"use client";

import { QueryClient } from "@tanstack/react-query";
import { Attribution } from "ox/erc8021";
import { createClient, custom, http } from "viem";
import { createConfig, createConnector } from "wagmi";
import { injected } from "wagmi/connectors";
import { ACTIVE_CHAIN, xlayer, xlayerTestnet } from "./chain";

const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE;
const DATA_SUFFIX = builderCode
  ? Attribution.toDataSuffix({ codes: [builderCode] })
  : undefined;

function injectedWithAttribution() {
  const base = injected();

  return createConnector((config) => {
    const connector = base(config);
    return {
      ...connector,
      async getClient({ chainId } = {}) {
        const id = chainId ?? (await connector.getChainId());
        const chain = config.chains.find((item) => item.id === id) ?? ACTIVE_CHAIN;
        const provider = await connector.getProvider({ chainId: id });
        if (!provider) {
          throw new Error("Injected provider unavailable");
        }

        const accounts = await connector.getAccounts();
        const account = accounts[0];

        return createClient({
          account,
          chain,
          dataSuffix: DATA_SUFFIX,
          transport: (opts) => custom(provider)({ ...opts, retryCount: 0 }),
        });
      },
    };
  });
}

export const wagmiConfig = createConfig({
  chains: [xlayerTestnet, xlayer],
  connectors: [injectedWithAttribution()],
  transports: {
    [xlayerTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://testrpc.xlayer.tech/terigon"),
    [xlayer.id]: http("https://rpc.xlayer.tech"),
  },
});

export const queryClient = new QueryClient();
