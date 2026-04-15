# Design Document: Hackathon Winning Features

## Overview

This design covers all features needed to win the Build X Hackathon. The core constraint is **Uniswap on testnet (chain 1952) only** — mainnet (chain 196) uses OKX DEX aggregator. All features are built on top of the existing AGORA contracts deployed on X Layer testnet.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  Dashboard │ Analytics │ Chat Interface │ Strategy Marketplace│
└──────────────────────┬──────────────────────────────────────┘
                       │ API Routes
┌──────────────────────▼──────────────────────────────────────┐
│                  Multi-Agent System                          │
│  YieldHunter │ RiskManager │ ExecutionAgent │ MonitorAgent   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Skills Layer                               │
│  GasOptimizer │ PortfolioTracker │ Sentiment │ LiquidityMon  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   DEX Router (Network-Aware)                  │
│  Testnet (1952): Uniswap Trading API                         │
│  Mainnet (196):  OKX DEX Aggregator                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              AGORA Smart Contracts (X Layer)                  │
│  AgentRegistry │ SkillsRegistry │ x402PaymentRouter          │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. DEX Router (Network-Aware Swap Execution)

**File:** `lib/dexRouter.ts`

The DEX router selects the correct swap backend based on chain ID:
- Chain 1952 (testnet) → Uniswap Trading API via `UniswapClient`
- Chain 196 (mainnet) → OKX DEX Aggregator API

```typescript
interface DexRouter {
  getQuote(params: QuoteParams): Promise<QuoteResult>
  executeSwap(params: SwapParams): Promise<SwapResult>
  checkApproval(params: ApprovalParams): Promise<ApprovalResult>
}
```

The router is instantiated once in `lib/agentConfig.ts` based on `NEXT_PUBLIC_CHAIN_ID`.

### 2. x402 Self-Hire Fix

**Files:** `scripts/generateProviderWallet.ts`, `scripts/registerProviderSkills.ts`

The fix involves two wallets:
- **Agent wallet** (`PRIVATE_KEY`): runs the prime agent, hires skills
- **Provider wallet** (`PROVIDER_PRIVATE_KEY`): registers skills, receives payments

The `x402PaymentRouter` contract already validates `msg.sender != skillProvider`. The fix is purely operational — register skills from a different wallet.

```
Agent Wallet ──hireSkill()──► x402PaymentRouter ──transfer()──► Provider Wallet
```

### 3. New Onchain OS Skills

All skills follow the existing pattern in `agent/skills/shared.ts`:

**`agent/skills/gasOptimizer.ts`** (already exists, enhance it)
- Query current gas price via `eth_gasPrice`
- Classify: low (<1 gwei), medium (1-5 gwei), high (>5 gwei)
- Track last 10 readings for trend

**`agent/skills/portfolioTracker.ts`** (already exists, enhance it)
- Read ERC-20 balances for tracked tokens
- Compute USD value using Onchain OS price data
- Store snapshots in memory with timestamps

**`agent/skills/marketSentiment.ts`** (already exists, enhance it)
- Aggregate Onchain OS `token advanced-info` signals
- Score: -100 (bearish) to +100 (bullish)
- Confidence based on data availability

**`agent/skills/liquidityMonitor.ts`** (already exists, enhance it)
- Poll pool reserves every cycle
- Alert when change > 20% from last reading
- Health score based on reserve depth

### 4. Multi-Agent System

**File:** `agent/multiAgent.ts`

Uses a simple in-process event emitter as the message bus:

```typescript
class AgentOrchestrator {
  yieldHunter: YieldHunterAgent
  riskManager: RiskManagerAgent
  executionAgent: ExecutionAgent
  monitorAgent: MonitorAgent
  bus: EventEmitter
}
```

Message flow:
1. `YieldHunterAgent` emits `opportunity:found`
2. `RiskManagerAgent` listens, audits, emits `opportunity:approved` or `opportunity:rejected`
3. `ExecutionAgent` listens to `opportunity:approved`, executes swap, emits `swap:completed`
4. `MonitorAgent` listens to all events, records metrics

### 5. Advanced Risk Scoring

**File:** `agent/skills/riskAuditor.ts` (enhance existing)

Weighted scoring components:
| Component | Weight | Source |
|-----------|--------|--------|
| Price volatility | 25% | Onchain OS price history |
| Liquidity depth | 30% | Onchain OS liquidity data |
| Holder distribution | 25% | Onchain OS holders |
| Cluster/rug risk | 20% | Onchain OS cluster-overview |

Final score = weighted sum, 0-100. Pass threshold: 65 (lowered from 75 for more activity).

### 6. Automated Rebalancing

**File:** `agent/rebalancer.ts`

```typescript
interface RebalancingStrategy {
  type: 'threshold' | 'time' | 'hybrid'
  targetAllocation: Record<string, number>  // token → % of portfolio
  rebalanceThreshold: number  // % drift before rebalancing
  minTradeSize: bigint        // minimum USDC to trade
}
```

Rebalancer runs after each agent cycle, checks drift, queues trades if needed.

### 7. Notification System

**File:** `lib/notifications.ts`

```typescript
interface NotificationConfig {
  webhookUrl?: string
  events: NotificationEventType[]
  agentId?: bigint
}

type NotificationEventType = 
  | 'swap:completed' 
  | 'opportunity:found'
  | 'risk:rejected'
  | 'rebalance:triggered'
  | 'gas:spike'
```

Webhook delivery with 3 retries, exponential backoff (1s, 2s, 4s).

### 8. Enhanced Dashboard

**New components:**
- `components/ActivityChart.tsx` — recharts line chart, polls `/api/agent/telemetry` every 5s
- `components/ProfitLossTracker.tsx` — cumulative P&L with sparkline
- `components/SkillMetrics.tsx` — table of skill usage stats
- `components/TransactionHistory.tsx` — filterable tx list
- `components/NetworkBadge.tsx` — testnet/mainnet indicator

**API routes:**
- `app/api/agent/telemetry/route.ts` (already exists, enhance)
- `app/api/agent/history/route.ts` — transaction history
- `app/api/agent/skills/route.ts` — skill performance metrics

### 9. AI Chat Interface

**File:** `app/api/chat/route.ts`, `components/ChatInterface.tsx`

Uses a simple intent parser (no external LLM required for hackathon):
```typescript
const intents = {
  'find opportunities': () => agent.scanForYield(),
  'check portfolio': () => trackPortfolio(...),
  'audit pool': (address) => auditPool(address, rpcUrl),
  'set risk threshold': (value) => updateConfig({ riskThreshold: value }),
}
```

For richer responses, optionally integrates with OpenAI if `OPENAI_API_KEY` is set.

### 10. Analytics Dashboard

**File:** `app/analytics/page.tsx`

Charts powered by recharts (already in ecosystem):
- Performance over time (line chart)
- Skill usage (bar chart)
- Gas cost trends (area chart)
- ROI projection (line chart with forecast)

Data sourced from in-memory telemetry store + on-chain events.

### 11. Strategy Marketplace

**File:** `app/marketplace/page.tsx` (enhance existing), `lib/strategies.ts`

Strategies stored as JSON in localStorage (no backend needed for hackathon):
```typescript
interface Strategy {
  id: string
  name: string
  description: string
  riskThreshold: number
  preferredProtocols: string[]
  tokenWhitelist: string[]
  tokenBlacklist: string[]
  rebalancingConfig: RebalancingStrategy
  author: string
  rating: number
  usageCount: number
}
```

### 12. Social Features / Leaderboard Enhancement

**File:** `app/leaderboard/page.tsx` (enhance existing)

Enhanced leaderboard reads from `LeaderboardTracker` contract:
- Sort by: earnings, tx count, success rate
- Show agent name, owner address (truncated), stats
- Reputation score = (earnings * 0.4) + (txCount * 0.3) + (successRate * 0.3)

## Data Flow: Full Agent Cycle

```
1. GasOptimizer.analyze()
   └─► if gas is "high" → skip cycle

2. YieldHunterAgent.scan()
   └─► Onchain OS: token liquidity, price-info
   └─► emit "opportunity:found"

3. RiskManagerAgent.audit()
   └─► Onchain OS: advanced-info, holders, cluster-overview
   └─► AdvancedRiskScorer.compute()
   └─► if score >= 65 → emit "opportunity:approved"
   └─► else → emit "opportunity:rejected"

4. ExecutionAgent.execute()
   └─► DEX Router (network-aware):
       ├─ testnet → UniswapClient.getQuote() + getSwap()
       └─ mainnet → OKX DEX API
   └─► walletClient.sendTransaction()
   └─► AgentRegistry.incrementTxCount()
   └─► AgentRegistry.recordEarnings()
   └─► emit "swap:completed"

5. MonitorAgent.record()
   └─► Update telemetry store
   └─► Trigger notifications if configured
   └─► Check rebalancing thresholds
```

## Network Configuration

```typescript
// lib/agentConfig.ts additions
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1952)
export const IS_TESTNET = CHAIN_ID === 1952

export function createDexRouter(): DexRouter {
  if (!IS_TESTNET) throw new Error('Uniswap DEX router is only supported on X Layer testnet (chain 1952)')
  return new UniswapDexRouter(process.env.UNISWAP_API_KEY!)
}
```

## Deployment Files

```
deployments/
  addresses.testnet.json   ← testnet (chain 1952) — canonical source
  addresses.json           ← copy of addresses.testnet.json for backward compat
```

## Correctness Properties

### Property 1: DEX Router Network Isolation
For any swap execution, if `chainId === 1952` then the Uniswap API is called; if `chainId === 196` then the OKX DEX API is called. These are mutually exclusive.

**Validates: Requirement 2.1, 2.2**

### Property 2: x402 Self-Hire Prevention
For any `hireSkill` call, if `agentOwner === skillProvider` then the transaction reverts. Payment only flows when addresses differ.

**Validates: Requirement 1.3, 1.4**

### Property 3: Risk Score Bounds
For any pool audit, the returned score is always in [0, 100]. The `passed` flag is true if and only if `score >= 65`.

**Validates: Requirement 9.6**

### Property 4: Portfolio Value Monotonicity
After a profitable swap, `portfolioValueUSD(t+1) > portfolioValueUSD(t)` (accounting for gas costs).

**Validates: Requirement 4.2, 4.3**

### Property 5: Notification Delivery
For any notification event, if a webhook URL is configured, the system attempts delivery at least once. On failure, it retries up to 3 times with exponential backoff.

**Validates: Requirement 11.1, 11.5**

## Testing Strategy

- **Unit tests** (`*.test.ts`): DEX router selection, risk scorer, rebalancer logic
- **Integration tests**: Full agent cycle on testnet fork
- **Property tests** (fast-check): Risk score bounds, self-hire prevention, notification retry logic

Testing framework: **vitest** (add to devDependencies) with **fast-check** for property tests.
