"use client";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 1952);

export default function NetworkBadge() {
  const isMainnet = CHAIN_ID === 196;
  const isTestnet = CHAIN_ID === 1952;

  const label = isMainnet ? "Mainnet" : isTestnet ? "Testnet" : `Chain ${CHAIN_ID}`;
  const classes = isMainnet
    ? "bg-green-500/20 text-green-400 border-green-500/30"
    : "bg-amber-500/20 text-amber-400 border-amber-500/30";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isMainnet ? "bg-green-400" : "bg-amber-400"}`} />
      {label}
    </span>
  );
}
