# AGORA — Autonomous Agent Economy on X Layer

AGORA is a fully autonomous DeFi agent system built on X Layer (OKX's EVM chain). Agents scan for yield opportunities, audit risk using Onchain OS, execute swaps via Uniswap (testnet), and pay each other for skills using the x402 payment protocol — all on-chain.

Built for the **Build X Hackathon** targeting all four prize categories: Best x402 Application, Most Active Agent, Best MCP Integration, and Best Economy Loop.

---

## Deployed Contracts — X Layer Testnet (Chain 1952)

| Contract | Address | Explorer |
|---|---|---|
| AgentRegistry | `0x9FCe359ab7A590d0491666B1f0873036f119Ef1d` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0x9FCe359ab7A590d0491666B1f0873036f119Ef1d) |
| SkillsRegistry | `0xc24759ec6A8E9006B47a5e7BdA6e13e589D8b841` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0xc24759ec6A8E9006B47a5e7BdA6e13e589D8b841) |
| x402PaymentRouter | `0x1d449F519D73e6A65cD65F0A29D4771b42f46CaE` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0x1d449F519D73e6A65cD65F0A29D4771b42f46CaE) |
| LeaderboardTracker | `0x1C1D38899909A1DAa23c58DB5A798823E31f2ed2` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0x1C1D38899909A1DAa23c58DB5A798823E31f2ed2) |
| TestUSDC (tUSDC) | `0x70799d35aC43AD21e106270E14365a9B96BDc993` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0x70799d35aC43AD21e106270E14365a9B96BDc993) |

**Deployer:** [`0x554e528cF22aD648Aae791AD67AD62BeD106e3e3`](https://www.oklink.com/x-layer-testnet/address/0x554e528cF22aD648Aae791AD67AD62BeD106e3e3)  
**Deployed:** 2026-04-14

---

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
│                   Skills Layer (Onchain OS)                   │
│  GasOptimizer │ PortfolioTracker │ Sentiment │ LiquidityMon  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              DEX Router (Testnet-Only: Uniswap)              │
│  Chain 1952 → Uniswap Trading API                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              AGORA Smart Contracts (X Layer Testnet)          │
│  AgentRegistry │ SkillsRegistry │ x402PaymentRouter          │
└─────────────────────────────────────────────────────────────┘
```

### Agent Cycle

1. **GasOptimizer** checks gas price — delays if high and rising
2. **YieldHunterAgent** scans Onchain OS for top liquidity pools
3. **RiskManagerAgent** audits the pool with weighted scoring (liquidity 30%, holders 25%, volatility 25%, cluster risk 20%)
4. If score ≥ 65 → **ExecutionAgent** gets a Uniswap quote and executes the swap
5. **MonitorAgent** records all events to telemetry, fires webhooks, checks rebalancing thresholds
6. **AgentRegistry** records the transaction count and earnings on-chain

---

## Features

### Economy Loop (x402 Payments)
- Agent hires the Risk Auditor skill via `x402PaymentRouter.hireSkill()`
- Payment flows from agent wallet → skill provider wallet in tUSDC
- Self-hire is prevented at the contract level and validated in code
- Use two wallets: `PRIVATE_KEY` (agent) and `PROVIDER_PRIVATE_KEY` (skill provider)

### Onchain OS Skills
| Skill | File | What it does |
|---|---|---|
| Gas Optimizer | `agent/skills/gasOptimizer.ts` | Tracks gas trend (rising/falling/stable), recommends delay |
| Portfolio Tracker | `agent/skills/portfolioTracker.ts` | Multi-token balances, USD value, P&L snapshots |
| Market Sentiment | `agent/skills/marketSentiment.ts` | Score [-100, 100] from holder concentration + rug risk + price trend |
| Liquidity Monitor | `agent/skills/liquidityMonitor.ts` | Pool health score, alerts on >20% reserve change |
| Risk Auditor | `agent/skills/riskAuditor.ts` | Weighted 4-factor risk score, pass threshold 65 |
| Yield Finder | `agent/skills/yieldFinder.ts` | Scans Onchain OS liquidity data for best APY pools |

### Multi-Agent System
Enable with `MULTI_AGENT=true`. Uses Node.js `EventEmitter` as an in-process message bus:

```
YieldHunterAgent → opportunity:found
RiskManagerAgent → opportunity:approved / opportunity:rejected
ExecutionAgent   → swap:completed
MonitorAgent     → records all events to telemetry store
```

### Automated Rebalancing
Configure target portfolio allocation and drift threshold. The rebalancer checks after each cycle and queues trades if any token drifts beyond the threshold.

```env
REBALANCE_THRESHOLD=5
TARGET_ALLOCATION={"USDC":50,"WOKB":50}
```

### Notification System
Webhook delivery with 3 retries and exponential backoff (1s → 2s → 4s). Fires on `swap:completed`, `risk:rejected`, and `gas:spike`.

```env
WEBHOOK_URL=https://your-webhook.example.com/events
```

---

## Frontend Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | Real-time activity chart, P&L tracker, skill metrics, network badge |
| `/analytics` | Performance charts (recharts), ROI calculation, CSV export |
| `/marketplace` | Strategy marketplace — create, import, export strategies |
| `/leaderboard` | Agent rankings by earnings, tx count, success rate, reputation score |
| `/activity` | Live activity feed |
| `/chat` | AI chat interface — query agent, audit pools, configure strategy |

---

## Quick Start

### Prerequisites
- Node.js 20+
- An X Layer testnet wallet with OKB (gas) and tUSDC
- Uniswap Trading API key
- Onchain OS CLI (`onchainos`) installed and `OK_API_KEY` set

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

```env
PRIVATE_KEY=0xyour_agent_wallet_private_key
UNISWAP_API_KEY=your_uniswap_api_key
OK_API_KEY=your_okx_api_key
NEXT_PUBLIC_CHAIN_ID=1952
NEXT_PUBLIC_RPC_URL=https://testrpc.xlayer.tech/terigon
```

### 3. Set up x402 Provider Wallet

Generate a second wallet for skill providers (required for real x402 payments):

```bash
npx tsx scripts/generateProviderWallet.ts
```

Add the output to `.env`:
```env
PROVIDER_PRIVATE_KEY=0xprovider_wallet_private_key
```

Fund the provider wallet with OKB (gas) and tUSDC, then register skills:

```bash
npx tsx scripts/registerProviderSkills.ts
```

### 4. Register Your Agent

```bash
npm run contracts:register:testnet
```

### 5. Run the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Run the Agent

```bash
npm run agent:run
```

For multi-agent mode:
```bash
MULTI_AGENT=true npm run agent:run
```

For live swap execution (dry-run by default):
```bash
UNISWAP_EXECUTE=true npm run agent:run
```

---

## Smart Contracts

### AgentRegistry
Registers agents on-chain. Tracks transaction count and earnings per agent.

```solidity
function registerAgent(string name) returns (uint256 agentId)
function incrementTxCount(uint256 agentId)
function recordEarnings(uint256 agentId, uint256 amount)
function ownerToAgentId(address owner) view returns (uint256)
```

### SkillsRegistry
Registers skills with a price in USDC. Any wallet can register skills.

```solidity
function registerSkill(string name, string description, uint256 priceUSDC) returns (uint256 skillId)
function getSkill(uint256 skillId) view returns (address provider, string name, uint256 priceUSDC, uint256 totalHires)
```

### x402PaymentRouter
Handles skill hiring payments. Transfers tUSDC from agent to skill provider. Prevents self-hire.

```solidity
function hireSkill(uint256 agentId, uint256 skillId) returns (uint256 receiptId)
function markCompleted(uint256 receiptId)
function getReceipt(uint256 receiptId) view returns (...)
```

### LeaderboardTracker
Tracks agent activity for the leaderboard. Readable by the frontend.

```solidity
function getTopAgents(uint256 limit) view returns ((uint256 agentId, uint256 txCount, uint256 usdcPaid)[] memory)
```

---

## Uniswap Integration (Testnet Only)

Uniswap is strictly limited to X Layer testnet (chain 1952). The `createDexRouter()` factory throws if `NEXT_PUBLIC_CHAIN_ID !== 1952`.

**Testnet router addresses:**
- Universal Router V2: `0x3013d50F2C2c2f7b494B4E858D64a02568e647B7`
- Swap Router: `0x91F566085a66a7b39922e30777176E3661608466`
- Quoter: `0xe62BaA3B73809CDea9e7019E7581B8511E948332`
- WOKB (wrapped native): `0x2720d209E992B8D009386D4948A31E13B03623C2`

The swap flow:
1. `checkApproval()` — check if token approval is needed
2. `getQuote()` — get best route and output amount
3. `executeSwap()` — generate the swap transaction
4. Broadcast via `walletClient.sendTransaction()`

---

## Development Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm test` | Run all tests (vitest) |
| `npm run agent:run` | Run the prime agent (single cycle) |
| `npm run contracts:compile` | Compile Solidity contracts |
| `npm run contracts:deploy:testnet` | Deploy contracts to X Layer testnet |
| `npm run contracts:seed:testnet` | Seed initial skills to SkillsRegistry |
| `npm run contracts:register:testnet` | Register agent in AgentRegistry |
| `npm run contracts:mint:testnet` | Mint test USDC to your wallet |
| `npm run uniswap:verify` | Dry-run a Uniswap swap (no broadcast) |
| `npm run uniswap:execute` | Execute a real Uniswap swap |

---

## Testing

```bash
npm test
```

Tests use **vitest** + **fast-check** for property-based testing:

- `lib/dexRouter.test.ts` — DEX router returns `UniswapDexRouter` for chain 1952, throws for chain 196
- `agent/skills/riskAuditor.test.ts` — risk score always in [0, 100], `passed` iff score ≥ 65
- `agent/rebalancer.test.ts` — drift math correctness, trades only generated above threshold
- `lib/notifications.test.ts` — retry count never exceeds 3, events always logged

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PRIVATE_KEY` | Yes | Agent wallet private key |
| `UNISWAP_API_KEY` | Yes | Uniswap Trading API key |
| `OK_API_KEY` | Yes | OKX API key for Onchain OS |
| `NEXT_PUBLIC_CHAIN_ID` | Yes | Chain ID — must be `1952` for testnet |
| `NEXT_PUBLIC_RPC_URL` | No | RPC URL (defaults to X Layer testnet) |
| `PROVIDER_PRIVATE_KEY` | No | Skill provider wallet (enables real x402 payments) |
| `UNISWAP_EXECUTE` | No | Set to `true` to broadcast swaps (default: dry-run) |
| `UNISWAP_TOKEN_IN` | No | Token to swap from (default: tUSDC) |
| `UNISWAP_TOKEN_OUT` | No | Token to swap to (default: WOKB) |
| `UNISWAP_AMOUNT_IN` | No | Amount to swap (default: `0.1`) |
| `UNISWAP_SLIPPAGE_TOLERANCE` | No | Slippage % (default: `0.5`) |
| `MULTI_AGENT` | No | Set to `true` to use multi-agent orchestrator |
| `REBALANCE_THRESHOLD` | No | Drift % before rebalancing (default: `5`) |
| `TARGET_ALLOCATION` | No | JSON allocation map (default: `{"USDC":50,"WOKB":50}`) |
| `WEBHOOK_URL` | No | Webhook endpoint for notifications |
| `OPENAI_API_KEY` | No | Enables richer AI chat responses |

---

## Project Structure

```
agora/
├── agent/
│   ├── primeAgent.ts          # Main agent entry point
│   ├── multiAgent.ts          # Multi-agent orchestrator (EventEmitter bus)
│   ├── rebalancer.ts          # Automated portfolio rebalancer
│   └── skills/
│       ├── gasOptimizer.ts    # Gas price trend analysis
│       ├── portfolioTracker.ts # Multi-token portfolio snapshots
│       ├── marketSentiment.ts  # Sentiment scoring [-100, 100]
│       ├── liquidityMonitor.ts # Pool health and change detection
│       ├── riskAuditor.ts      # Weighted 4-factor risk scoring
│       ├── yieldFinder.ts      # Onchain OS yield opportunity scanner
│       └── shared.ts           # Onchain OS CLI wrapper
├── app/                        # Next.js app router pages
│   ├── dashboard/page.tsx      # Real-time dashboard
│   ├── analytics/page.tsx      # Performance analytics
│   ├── marketplace/page.tsx    # Strategy marketplace
│   ├── leaderboard/page.tsx    # Agent leaderboard
│   ├── chat/page.tsx           # AI chat interface
│   └── api/                    # API routes
│       ├── agent/telemetry/    # Telemetry time-series
│       ├── agent/portfolio/    # Portfolio history
│       ├── agent/skills/       # Skill performance stats
│       ├── agent/history/      # Transaction history
│       └── chat/               # Chat intent parser
├── components/                 # React components
│   ├── ActivityChart.tsx       # Live activity line chart
│   ├── ProfitLossTracker.tsx   # Cumulative P&L
│   ├── SkillMetrics.tsx        # Skill usage stats table
│   ├── TransactionHistory.tsx  # Filterable tx list
│   ├── NetworkBadge.tsx        # Testnet/Mainnet indicator
│   └── ChatInterface.tsx       # Chat UI
├── contracts/                  # Solidity smart contracts
│   ├── AgentRegistry.sol
│   ├── SkillsRegistry.sol
│   ├── x402PaymentRouter.sol
│   └── LeaderboardTracker.sol
├── lib/
│   ├── dexRouter.ts            # DexRouter interface + UniswapDexRouter
│   ├── uniswapClient.ts        # Uniswap Trading API client
│   ├── uniswapExecution.ts     # Swap preparation and execution
│   ├── agentConfig.ts          # Network config + createDexRouter()
│   ├── contracts.ts            # Contract ABIs and addresses
│   ├── notifications.ts        # Webhook notification service
│   ├── strategies.ts           # Strategy marketplace CRUD
│   └── chain.ts                # Viem chain definitions
├── scripts/
│   ├── deploy.ts               # Contract deployment
│   ├── registerAgent.ts        # Agent registration
│   ├── generateProviderWallet.ts # Generate x402 provider wallet
│   ├── registerProviderSkills.ts # Register skills from provider wallet
│   ├── seedSkills.ts           # Seed initial skills
│   └── mintTestUSDC.ts         # Mint test USDC
├── deployments/
│   ├── addresses.json          # Active deployment addresses
│   └── addresses.testnet.json  # Testnet canonical addresses
└── .kiro/specs/                # Spec-driven development docs
    └── hackathon-winning-features/
        ├── requirements.md
        ├── design.md
        └── tasks.md
```

---

## Hackathon Prize Targets

| Prize | Status | Evidence |
|---|---|---|
| Best x402 Application (500 USDT) | Ready | Two-wallet setup, real payment flow in `hireRiskAuditor()` |
| Most Active Agent (500 USDT) | Ready | Run `npm run agent:run` continuously, tx count tracked on-chain |
| Best MCP Integration (500 USDT) | Ready | 6 Onchain OS skills using `onchainos` CLI |
| Best Economy Loop (500 USDT) | Ready | Earn → Pay → Earn cycle with on-chain receipts |

**Scoring breakdown:**
- Onchain OS/Uniswap Integration (25%): 6 skills + Uniswap Trading API
- X Layer Ecosystem Integration (25%): Deployed on X Layer testnet, verified on OKLink
- AI Interactive Experience (25%): Chat interface + multi-agent autonomous decisions
- Product Completeness (25%): Full frontend, analytics, strategy marketplace, tests

---

## License

MIT
