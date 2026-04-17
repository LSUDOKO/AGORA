# Frontend Full Integration - Design

## Architecture Overview

The frontend will transition from mock data to a fully integrated real-time system with three data layers:

1. **On-Chain Layer**: Direct contract reads/writes via Wagmi
2. **Agent Layer**: Backend agent skills via API routes
3. **Event Layer**: Real-time event streaming via WebSocket/polling

## Component Integration Map

### Marketplace Page (`app/marketplace/page.tsx`)

**Current State**: Empty file with unused imports

**Target State**: Full marketplace with real skills

**Implementation**:
```typescript
// Load skills from SkillsRegistry
const { data: skillCount } = useReadContract({
  address: addresses.skillsRegistry,
  abi: skillsRegistryAbi,
  functionName: "skillCount"
});

// Fetch each skill's data
const skills = useReadContracts({
  contracts: Array.from({ length: Number(skillCount || 0) }, (_, i) => ({
    address: addresses.skillsRegistry,
    abi: skillsRegistryAbi,
    functionName: "getSkill",
    args: [BigInt(i + 1)]
  }))
});
```

**Data Flow**:
1. Component mounts → Read skillCount from contract
2. Generate array of skill IDs → Batch read all skills
3. Display in grid with HireSkillButton for each
4. Strategy filters apply client-side to loaded skills

### Dashboard Page (`app/dashboard/page.tsx`)

**Current State**: Static mock data in STATS and ACTION_QUEUE

**Target State**: Live agent metrics

**Changes Required**:

1. **Agent Card Integration**:
```typescript
const { address } = useAccount();
const { data: agentId } = useReadContract({
  address: addresses.agentRegistry,
  abi: agentRegistryAbi,
  functionName: "ownerToAgentId",
  args: address ? [address] : undefined
});

const { data: agentData } = useReadContract({
  address: addresses.agentRegistry,
  abi: agentRegistryAbi,
  functionName: "getAgent",
  args: agentId ? [agentId] : undefined,
  enabled: Boolean(agentId && agentId > 0n)
});
```

2. **Replace Static STATS**:
```typescript
const [stats, setStats] = useState({
  uptime: "0:00:00",
  earning: "0 AGR",
  activeTx: 0,
  network: "0%"
});

useEffect(() => {
  // Fetch from /api/agent/telemetry
  // Calculate uptime from first event timestamp
  // Sum earnings from agentData
  // Count active transactions
}, [agentData]);
```

3. **Dynamic Action Queue**:
```typescript
// Replace ACTION_QUEUE with real pending operations
const { data: telemetry } = useSWR('/api/agent/telemetry', {
  refreshInterval: 5000
});

const actionQueue = useMemo(() => {
  return telemetry?.latest
    ?.filter(e => e.event.includes('pending'))
    ?.map(e => ({
      time: formatTime(e.timestamp),
      title: e.event,
      desc: e.data.description,
      id: e.data.id,
      active: true
    })) || [];
}, [telemetry]);
```

### Leaderboard Page (`app/leaderboard/page.tsx`)

**Current State**: Uses MOCK_ROWS when no on-chain data

**Target State**: Always show real data or empty state

**Changes**:

1. **Remove Mock Fallback**:
```typescript
// DELETE this logic:
const enriched: EnrichedAgent[] = useMemo(() => {
  if (rows.length === 0) return MOCK_ROWS; // ❌ Remove
  // ...
}, [rows]);

// REPLACE with:
const enriched: EnrichedAgent[] = useMemo(() => {
  if (rows.length === 0) return []; // ✅ Empty array
  return rows.map(row => ({
    agentId: Number(row.agentId),
    txCount: Number(row.txCount),
    earnings: Number(row.usdcPaid) / 1_000_000,
    successRate: calculateSuccessRate(row),
    reputationScore: computeReputationScore(...)
  }));
}, [rows]);
```

2. **Add Empty State UI**:
```typescript
{sorted.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-slate-400">No agents registered yet</p>
    <Link href="/dashboard" className="text-cyan-400 underline">
      Register your agent to appear on the leaderboard
    </Link>
  </div>
) : (
  // Existing table
)}
```

### Activity Page (`app/activity/page.tsx`)

**Current State**: Uses INITIAL_ROWS mock data

**Target State**: Real-time event feed

**Implementation**:

1. **Replace Mock Data**:
```typescript
const [rows, setRows] = useState<ActivityRow[]>([]);

useEffect(() => {
  const fetchEvents = async () => {
    const res = await fetch('/api/agent/history?limit=50');
    const json = await res.json();
    setRows(json.events.map(e => ({
      icon: deriveIcon(e.event),
      name: e.data.agentName || `Agent_${e.data.agentId}`,
      addr: e.data.address || '0x...',
      amount: e.data.amount || '0 ETH',
      time: formatTimeAgo(e.timestamp)
    })));
  };
  
  fetchEvents();
  const interval = setInterval(fetchEvents, 5000);
  return () => clearInterval(interval);
}, []);
```

2. **Remove Fake Row Generation**:
```typescript
// DELETE this entire block:
const interval = setInterval(() => {
  const newRow = {
    icon: ["bolt", "shield", "swap_horiz", "database"][Math.floor(Math.random() * 4)],
    name: `Agent_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    // ...
  };
  setRows((prev) => [newRow, ...prev.slice(0, 4)]);
}, 12000);
```

### Analytics Page (`app/analytics/page.tsx`)

**Current State**: Uses GAS_MOCK_DATA and MOCK_ROI

**Target State**: Real metrics from agent

**Changes**:

1. **Real ROI Calculation**:
```typescript
const [roi, setRoi] = useState({ totalEarned: 0, totalGasCost: 0, initialCapital: 100 });

useEffect(() => {
  const fetchRoi = async () => {
    const [agentRes, gasRes] = await Promise.all([
      fetch('/api/agent/portfolio'),
      fetch('/api/agent/gas-costs') // New endpoint needed
    ]);
    
    const agentData = await agentRes.json();
    const gasData = await gasRes.json();
    
    setRoi({
      totalEarned: agentData.profitLoss,
      totalGasCost: gasData.totalCost,
      initialCapital: 100 // Could be from config
    });
  };
  
  fetchRoi();
  const interval = setInterval(fetchRoi, 15000);
  return () => clearInterval(interval);
}, []);
```

2. **Real Gas Data**:
```typescript
// Create new API route: app/api/agent/gas-costs/route.ts
export async function GET() {
  const telemetry = getTelemetry();
  
  // Extract gas costs from swap events
  const gasCosts = telemetry
    .filter(e => e.event === 'swap:completed')
    .map(e => ({
      time: new Date(e.timestamp).toLocaleTimeString(),
      gasGwei: e.data.gasPrice / 1e9,
      costUsd: (e.data.gasPrice * e.data.gasUsed) / 1e18 * 2000 // ETH price
    }));
    
  return NextResponse.json({ gasCosts, totalCost: sum(gasCosts) });
}
```

### MarketplaceGrid Component

**Current State**: Loads skills correctly but needs strategy integration

**Enhancement**: Add strategy filtering

```typescript
const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null);

const filteredSkills = useMemo(() => {
  if (!activeStrategy) return skills;
  
  return skills.filter(skill => {
    // Apply strategy filters
    if (activeStrategy.tokenWhitelist.length > 0) {
      // Check if skill involves whitelisted tokens
    }
    if (activeStrategy.preferredProtocols.length > 0) {
      // Check if skill uses preferred protocols
    }
    return true;
  });
}, [skills, activeStrategy]);
```

### LiveActivityFeed Component

**Current State**: Correctly subscribes to events

**Enhancement**: Add more event types

```typescript
// Add AgentRegistered events
unwatchRegistered = publicClient.watchContractEvent({
  address: addresses.agentRegistry,
  abi: agentRegistryAbi,
  eventName: "AgentRegistered",
  onLogs: (logs) => {
    const mapped = logs.map(log => ({
      id: `registered-${log.transactionHash}`,
      icon: "🤖",
      title: `New agent registered: #${log.args.agentId}`,
      subtitle: `Owner: ${log.args.owner}`,
      amount: "New Agent",
      timeAgo: "just now"
    }));
    setItems(current => [...mapped, ...current].slice(0, 20));
  }
});

// Add earnings events
unwatchEarnings = publicClient.watchContractEvent({
  address: addresses.agentRegistry,
  abi: agentRegistryAbi,
  eventName: "AgentEarningsRecorded",
  onLogs: (logs) => {
    // Similar mapping
  }
});
```

## API Routes Enhancement

### New Route: `/api/agent/gas-costs/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getTelemetry } from "../../../agent/multiAgent";

export async function GET() {
  const telemetry = getTelemetry();
  
  const gasCosts = telemetry
    .filter(e => e.event === 'swap:completed' && e.data.gasUsed)
    .map(e => ({
      timestamp: e.timestamp,
      gasGwei: Number(e.data.gasPrice) / 1e9,
      gasUsed: Number(e.data.gasUsed),
      costUsd: (Number(e.data.gasPrice) * Number(e.data.gasUsed)) / 1e18 * 2000
    }));
    
  const totalCost = gasCosts.reduce((sum, c) => sum + c.costUsd, 0);
  
  return NextResponse.json({ gasCosts, totalCost });
}
```

### Enhanced Route: `/api/agent/portfolio/route.ts`

```typescript
// Add real earnings calculation
export async function GET() {
  const profitLoss = getProfitLoss();
  const snapshots = getSnapshots();
  
  // NEW: Fetch real earnings from contract
  const publicClient = createPublicClient({
    chain: ACTIVE_CHAIN,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL)
  });
  
  const agentId = 1n; // Get from session or query param
  const agentData = await publicClient.readContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "getAgent",
    args: [agentId]
  });
  
  const totalEarned = Number(agentData[3]) / 1e6; // totalEarned in USDC
  
  return NextResponse.json({ 
    profitLoss, 
    snapshots,
    totalEarned,
    totalTxns: Number(agentData[2])
  });
}
```

## State Management Strategy

### Global State (Context)
```typescript
// lib/AgentContext.tsx
export const AgentContext = createContext<{
  agentId: bigint | null;
  agentData: AgentData | null;
  isRegistered: boolean;
  refetch: () => void;
}>({
  agentId: null,
  agentData: null,
  isRegistered: false,
  refetch: () => {}
});

export function AgentProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  
  const { data: agentId, refetch } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "ownerToAgentId",
    args: address ? [address] : undefined
  });
  
  const { data: agentData } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "getAgent",
    args: agentId ? [agentId] : undefined,
    enabled: Boolean(agentId && agentId > 0n)
  });
  
  return (
    <AgentContext.Provider value={{
      agentId: agentId || null,
      agentData: agentData ? parseAgentData(agentData) : null,
      isRegistered: Boolean(agentId && agentId > 0n),
      refetch
    }}>
      {children}
    </AgentContext.Provider>
  );
}
```

### Local State (SWR)
```typescript
// Use SWR for API routes
import useSWR from 'swr';

const { data, error, mutate } = useSWR('/api/agent/telemetry', fetcher, {
  refreshInterval: 5000,
  revalidateOnFocus: true
});
```

## Error Handling Patterns

### Contract Read Errors
```typescript
const { data, error, isLoading } = useReadContract({
  address: addresses.skillsRegistry,
  abi: skillsRegistryAbi,
  functionName: "skillCount"
});

if (error) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
      <p className="text-red-400">Failed to load skills from contract</p>
      <p className="text-sm text-red-300 mt-2">{error.message}</p>
      <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
        Retry
      </button>
    </div>
  );
}
```

### Transaction Errors
```typescript
try {
  const hash = await writeContractAsync({
    address: addresses.paymentRouter,
    abi: paymentRouterAbi,
    functionName: "hireSkill",
    args: [agentId, skillId]
  });
  
  await publicClient.waitForTransactionReceipt({ hash });
  
  toast.success(`Skill hired! Tx: ${hash.slice(0, 10)}...`);
} catch (error) {
  if (error.message.includes('user rejected')) {
    toast.error('Transaction cancelled');
  } else if (error.message.includes('insufficient funds')) {
    toast.error('Insufficient balance for transaction');
  } else {
    toast.error(`Transaction failed: ${error.message}`);
  }
}
```

## Performance Optimizations

### Memoization
```typescript
const enrichedSkills = useMemo(() => {
  return skills.map(skill => ({
    ...skill,
    formattedPrice: formatUnits(skill.priceUSDC, 6),
    isAffordable: skill.priceUSDC <= userBalance
  }));
}, [skills, userBalance]);
```

### Debounced Updates
```typescript
const debouncedRefetch = useMemo(
  () => debounce(() => refetch(), 1000),
  [refetch]
);
```

### Lazy Loading
```typescript
const ActivityChart = lazy(() => import('../components/ActivityChart'));

<Suspense fallback={<ChartSkeleton />}>
  <ActivityChart />
</Suspense>
```

## Testing Strategy

### Unit Tests
- Test data transformation functions
- Test filter logic
- Test error handling

### Integration Tests
- Test contract read/write flows
- Test API route responses
- Test WebSocket connections

### E2E Tests
- Full user flow: connect → register → hire → view
- Error scenarios
- Network switching

## Deployment Checklist

- [ ] All mock data removed
- [ ] All contract addresses from deployment file
- [ ] Environment variables documented
- [ ] Error boundaries in place
- [ ] Loading states for all async operations
- [ ] Toast notifications configured
- [ ] WebSocket fallback tested
- [ ] Empty states designed
- [ ] Transaction confirmations working
- [ ] Real-time updates verified
