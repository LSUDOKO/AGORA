"use client";

import { Attribution } from "ox/erc8021";
import { createWalletClient, custom, type EIP1193Provider } from "viem";
import { ACTIVE_CHAIN } from "./chain";

const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE;

export const DATA_SUFFIX = builderCode
  ? Attribution.toDataSuffix({ codes: [builderCode] })
  : undefined;

export function getInjectedWalletClient() {
  const ethereum = (window as Window & { ethereum?: EIP1193Provider }).ethereum;

  if (typeof window === "undefined" || !ethereum) {
    throw new Error("No injected wallet found");
  }

  return createWalletClient({
    chain: ACTIVE_CHAIN,
    transport: custom(ethereum),
    dataSuffix: DATA_SUFFIX,
  });
}
