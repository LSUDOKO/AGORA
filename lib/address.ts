export function toXkoAddress(address?: string | null): string {
  if (!address) return "—";
  const normalized = address.startsWith("0x") ? address.slice(2) : address;
  return `XKO${normalized}`;
}

export function toEvmAddress(address: string): `0x${string}` {
  if (address.startsWith("0x")) return address as `0x${string}`;
  if (/^xko/i.test(address)) {
    return `0x${address.slice(3)}` as `0x${string}`;
  }
  return `0x${address}` as `0x${string}`;
}

export function shortAddress(address?: string | null): string {
  if (!address) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
