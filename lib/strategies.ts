export interface Strategy {
  id: string;
  name: string;
  description: string;
  riskThreshold: number;
  preferredProtocols: string[];
  tokenWhitelist: string[];
  tokenBlacklist: string[];
  author: string;
  rating: number;
  usageCount: number;
}

const STORAGE_KEY = "agora_strategies";

export function getStrategies(): Strategy[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Strategy[]) : [];
  } catch {
    return [];
  }
}

export function saveStrategy(s: Strategy): void {
  if (typeof window === "undefined") return;
  const existing = getStrategies().filter((x) => x.id !== s.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, s]));
}

export function deleteStrategy(id: string): void {
  if (typeof window === "undefined") return;
  const updated = getStrategies().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getDefaultStrategies(): Strategy[] {
  return [
    {
      id: "default-conservative",
      name: "Conservative Yield",
      description: "Low-risk strategy targeting stable pools with high liquidity. Avoids volatile tokens.",
      riskThreshold: 80,
      preferredProtocols: ["Uniswap V3"],
      tokenWhitelist: ["USDC", "WETH", "WOKB"],
      tokenBlacklist: [],
      author: "AGORA Team",
      rating: 4.5,
      usageCount: 142,
    },
    {
      id: "default-balanced",
      name: "Balanced Growth",
      description: "Moderate risk with diversified protocol exposure. Targets 10-20% APY opportunities.",
      riskThreshold: 65,
      preferredProtocols: ["Uniswap V3", "OKX DEX"],
      tokenWhitelist: ["USDC", "WETH", "WOKB", "OKB"],
      tokenBlacklist: [],
      author: "AGORA Team",
      rating: 4.2,
      usageCount: 89,
    },
    {
      id: "default-aggressive",
      name: "Aggressive Alpha",
      description: "Higher risk tolerance for maximum yield. Scans emerging pools and new token pairs.",
      riskThreshold: 50,
      preferredProtocols: ["Uniswap V3", "OKX DEX"],
      tokenWhitelist: [],
      tokenBlacklist: ["SCAM", "RUG"],
      author: "AGORA Team",
      rating: 3.8,
      usageCount: 34,
    },
  ];
}
