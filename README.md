# 🌐 AGORA — Autonomous Agent Economy on X Layer

> **Fully autonomous DeFi agents that scan, audit, trade, and pay each other — all on-chain.**

AGORA is a production-ready autonomous agent system built on X Layer (OKX's EVM chain). Agents discover yield opportunities using Onchain OS MCP skills, execute risk-weighted swaps via Uniswap Trading API (testnet), and pay each other for services using the x402 payment protocol. The entire economy runs autonomously with multi-agent coordination, real-time analytics, and a complete web interface.

**Built for Build X Hackathon** — targeting all four prize categories:
- 🏆 Best x402 Application (500 USDT)
- 🤖 Most Active Agent (500 USDT)  
- 🔌 Best MCP Integration (500 USDT)
- 💰 Best Economy Loop (500 USDT)

Demo Vedio : https://youtu.be/uALkA53vXjo
---

## 📋 Table of Contents

- [Deployed Contracts](#-deployed-contracts)
- [Problem & Solution](#-problem--solution)
- [Architecture](#-architecture)
- [Smart Contracts](#-smart-contracts)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Frontend Pages](#-frontend-pages)
- [Agent System](#-agent-system)
- [Onchain OS Skills](#-onchain-os-skills)
- [Development](#-development)
- [Testing](#-testing)
- [Hackathon Scoring](#-hackathon-scoring)
- [License](#-license)

---

## 🚀 Deployed Contracts

### X Layer Testnet (Chain ID: 1952)

| Contract | Address | Explorer Link |
|----------|---------|---------------|
| **AgentRegistry** | `0x9FCe359ab7A590d0491666B1f0873036f119Ef1d` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0x9FCe359ab7A590d0491666B1f0873036f119Ef1d) |
| **SkillsRegistry** | `0xc24759ec6A8E9006B47a5e7BdA6e13e589D8b841` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0xc24759ec6A8E9006B47a5e7BdA6e13e589D8b841) |
| **x402PaymentRouter** | `0x1d449F519D73e6A65cD65F0A29D4771b42f46CaE` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0x1d449F519D73e6A65cD65F0A29D4771b42f46CaE) |
| **LeaderboardTracker** | `0x1C1D38899909A1DAa23c58DB5A798823E31f2ed2` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0x1C1D38899909A1DAa23c58DB5A798823E31f2ed2) |
| **TestUSDC (tUSDC)** | `0x70799d35aC43AD21e106270E14365a9B96BDc993` | [View on OKLink](https://www.oklink.com/x-layer-testnet/address/0x70799d35aC43AD21e106270E14365a9B96BDc993) |

**Deployer Address:** [`0x554e528cF22aD648Aae791AD67AD62BeD106e3e3`](https://www.oklink.com/x-layer-testnet/address/0x554e528cF22aD648Aae791AD67AD62BeD106e3e3)  
**Deployment Date:** April 14, 2026  
**Network:** X Layer Testnet  
**Chain ID:** 1952  
**RPC URL:** `https://testrpc.xlayer.tech/terigon`  
**Block Explorer:** https://www.oklink.com/x-layer-testnet

---

## 🎯 Problem & Solution

### The Problem

Traditional DeFi requires constant manual monitoring and execution:
- **Manual Yield Hunting:** Users must constantly scan multiple protocols for opportunities
- **Risk Assessment Overhead:** Evaluating pool safety requires checking multiple data sources
- **Timing Challenges:** Optimal execution windows are missed due to human reaction time
- **Gas Cost Inefficiency:** Transactions executed at suboptimal gas prices
- **Isolated Operations:** No coordination between different trading strategies
- **Trust Issues:** Centralized bots require trusting third parties with funds

### The AGORA Solution

AGORA solves these problems with a fully autonomous, trustless agent economy:

#### 1. **Autonomous Yield Discovery**
- Agents continuously scan Onchain OS for liquidity pools and yield opportunities
- Multi-factor analysis: APY, liquidity depth, holder distribution, price trends
- No manual intervention required — agents operate 24/7

#### 2. **Comprehensive Risk Management**
- **4-Factor Risk Scoring System:**
  - Liquidity Depth (30%): Ensures sufficient pool reserves
  - Holder Distribution (25%): Detects concentration risk
  - Price Volatility (25%): Measures historical stability
  - Cluster Risk (20%): Identifies potential rug pulls
- Weighted score (0-100) with configurable pass threshold (default: 65)
- Real-time risk monitoring with automatic rejection of unsafe pools

#### 3. **Intelligent Execution**
- **Gas Optimization:** Monitors gas prices and delays execution during spikes
- **Network-Aware Routing:**
  - Testnet (Chain 1952): Uniswap Trading API
  - Mainnet (Chain 196): OKX DEX Aggregator
- **Slippage Protection:** Configurable tolerance with automatic quote validation
- **Transaction Batching:** Combines operations to minimize gas costs

#### 4. **Multi-Agent Coordination**
- **Specialized Agents:**
  - `YieldHunterAgent`: Discovers opportunities
  - `RiskManagerAgent`: Audits safety
  - `ExecutionAgent`: Executes trades
  - `MonitorAgent`: Tracks performance
- Event-driven architecture with message bus
- Parallel processing for maximum efficiency

#### 5. **x402 Payment Economy**
- Agents pay each other for specialized skills
- On-chain payment receipts with completion tracking
- Self-hire prevention at contract level
- Transparent payment flow: Agent → x402Router → Skill Provider

#### 6. **Automated Portfolio Management**
- **Rebalancing Engine:** Maintains target allocation
- **Drift Detection:** Triggers rebalancing when allocation exceeds threshold
- **P&L Tracking:** Real-time profit/loss calculation
- **Multi-Token Support:** Manages diverse portfolios

#### 7. **Real-Time Monitoring & Analytics**
- Live activity dashboard with WebSocket updates
- Performance charts: ROI, gas costs, success rates
- Transaction history with filtering and export
- Skill usage metrics and leaderboard

### Key Differentiators

| Feature | Traditional Bots | AGORA |
|---------|-----------------|-------|
| **Autonomy** | Manual triggers | Fully autonomous |
| **Risk Assessment** | Basic checks | 4-factor weighted scoring |
| **Coordination** | Isolated | Multi-agent orchestration |
| **Payment Model** | Subscription fees | Pay-per-use (x402) |
| **Transparency** | Closed source | On-chain receipts |
| **Network Support** | Single chain | Dual network (testnet/mainnet) |
| **Gas Optimization** | Fixed settings | Dynamic monitoring |
| **Extensibility** | Vendor lock-in | Open skill marketplace |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Frontend Layer (Next.js 16)                      │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────────┐   │
│  │Dashboard │ │ Analytics │ │   Chat   │ │Strategy Marketplace │   │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └──────────┬──────────┘   │
│       │             │             │                   │              │
│       └─────────────┴─────────────┴───────────────────┘              │
│                              │                                       │
│                    API Routes (REST + WebSocket)                     │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                      Multi-Agent System                               │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ┌─────────┐ │
│  │YieldHunter  │  │RiskManager   │  │ExecutionAgent │  │Monitor  │ │
│  │Agent        │  │Agent         │  │               │  │Agent    │ │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  └────┬────┘ │
│         │                │                   │                │      │
│         └────────────────┴───────────────────┴────────────────┘      │
│                              │                                       │
│                    EventEmitter Message Bus                          │
│         (opportunity:found, opportunity:approved, swap:completed)    │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                    Skills Layer (Onchain OS MCP)                      │
│  ┌──────────────┐ ┌─────────────────┐ ┌──────────────────────────┐  │
│  │GasOptimizer  │ │PortfolioTracker │ │MarketSentiment           │  │
│  │              │ │                 │ │                          │  │
│  └──────────────┘ └─────────────────┘ └──────────────────────────┘  │
│  ┌──────────────┐ ┌─────────────────┐ ┌──────────────────────────┐  │
│  │LiquidityMon  │ │RiskAuditor      │ │YieldFinder               │  │
│  │              │ │                 │ │                          │  │
│  └──────────────┘ └─────────────────┘ └──────────────────────────┘  │
│                              │                                       │
│                    Onchain OS CLI Wrapper                            │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                  DEX Router (Network-Aware)                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  IF chainId === 1952 (Testnet)                               │   │
│  │    → Uniswap Trading API                                     │   │
│  │    → Universal Router V2: 0x3013d50F2C2c2f7b494B4E858D64a... │   │
│  │    → Quoter: 0xe62BaA3B73809CDea9e7019E7581B8511E948332     │   │
│  │                                                               │   │
│  │  IF chainId === 196 (Mainnet)                                │   │
│  │    → OKX DEX Aggregator API                                  │   │
│  │    → Best route across multiple DEXes                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│              AGORA Smart Contracts (X Layer Testnet)                  │
│  ┌────────────────┐ ┌─────────────────┐ ┌────────────────────────┐  │
│  │AgentRegistry   │ │SkillsRegistry   │ │x402PaymentRouter       │  │
│  │                │ │                 │ │                        │  │
│  │- registerAgent │ │- registerSkill  │ │- hireSkill             │  │
│  │- incrementTx   │ │- getSkill       │ │- markCompleted         │  │
│  │- recordEarnings│ │- totalSkills    │ │- getReceipt            │  │
│  └────────────────┘ └─────────────────┘ └────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │LeaderboardTracker                                              │  │
│  │- getTopAgents, recordActivity                                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

### Agent Execution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Agent Cycle Start                            │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ GasOptimizer   │
                    │ Check gas price│
                    └────────┬───────┘
                             │
                    ┌────────▼────────┐
                    │ Gas > threshold?│
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
              YES│                       │NO
                 ▼                       ▼
        ┌────────────────┐      ┌────────────────┐
        │ Delay execution│      │ YieldHunter    │
        │ Skip this cycle│      │ Scan Onchain OS│
        └────────────────┘      └────────┬───────┘
                                         │
                                         ▼
                                ┌────────────────┐
                                │ Found pools?   │
                                └────────┬───────┘
                                         │
                             ┌───────────┴───────────┐
                             │                       │
                          YES│                       │NO
                             ▼                       ▼
                    ┌────────────────┐      ┌────────────────┐
                    │ RiskManager    │      │ End cycle      │
                    │ Audit pool     │      │ Wait for next  │
                    └────────┬───────┘      └────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Risk score ≥ 65?│
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
              YES│                       │NO
                 ▼                       ▼
        ┌────────────────┐      ┌────────────────┐
        │ ExecutionAgent │      │ Reject pool    │
        │ Get quote      │      │ Log reason     │
        └────────┬───────┘      └────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Execute swap   │
        │ Broadcast tx   │
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ MonitorAgent   │
        │ Record metrics │
        │ Update P&L     │
        │ Check rebalance│
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ Update on-chain│
        │ AgentRegistry  │
        │ LeaderboardTrkr│
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ Trigger webhooks│
        │ Send notifications│
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ Cycle complete │
        └────────────────┘
```

### Data Flow Diagram

```
User Wallet ──────► Frontend ──────► API Routes ──────► Agent System
                                                              │
                                                              ▼
                                                    ┌─────────────────┐
                                                    │ Onchain OS CLI  │
                                                    │ (MCP Skills)    │
                                                    └────────┬────────┘
                                                             │
                    ┌────────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────────────────────┐
    │ Skill Execution (e.g., Risk Auditor)                       │
    │                                                             │
    │ 1. Agent calls hireRiskAuditor()                           │
    │ 2. Check: Agent wallet ≠ Provider wallet                   │
    │ 3. Transfer tUSDC: Agent → x402Router → Provider           │
    │ 4. Emit PaymentCompleted event                             │
    │ 5. Execute skill logic (risk scoring)                      │
    │ 6. Return result to agent                                  │
    └───────────────────────────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────────────────────┐
    │ If approved: Execute Swap                                  │
    │                                                             │
    │ 1. Get quote from DEX Router (Uniswap/OKX)                │
    │ 2. Check token approval                                    │
    │ 3. Build swap transaction                                  │
    │ 4. Sign and broadcast                                      │
    │ 5. Wait for confirmation                                   │
    └───────────────────────────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────────────────────┐
    │ Update On-Chain State                                      │
    │                                                             │
    │ 1. AgentRegistry.incrementTxCount(agentId)                │
    │ 2. AgentRegistry.recordEarnings(agentId, amount)          │
    │ 3. LeaderboardTracker.recordActivity(...)                 │
    └───────────────────────────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────────────────────┐
    │ Frontend Updates (Real-Time)                               │
    │                                                             │
    │ 1. WebSocket push to connected clients                     │
    │ 2. Update activity chart                                   │
    │ 3. Refresh P&L tracker                                     │
    │ 4. Update transaction history                              │
    │ 5. Refresh leaderboard                                     │
    └───────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts

### 1. AgentRegistry.sol

**Purpose:** Registers autonomous agents and tracks their on-chain activity.

**Key Functions:**
```solidity
function registerAgent(string memory name) external returns (uint256 agentId)
function incrementTxCount(uint256 agentId) external
function recordEarnings(uint256 agentId, uint256 amount) external
function getAgent(uint256 agentId) external view returns (Agent memory)
function ownerToAgentId(address owner) external view returns (uint256)
```

**State Variables:**
- `agents`: Mapping of agent ID to Agent struct
- `ownerToAgentId`: Mapping of owner address to agent ID
- `nextAgentId`: Counter for agent IDs

**Events:**
```solidity
event AgentRegistered(uint256 indexed agentId, address indexed owner, string name)
event TxCountIncremented(uint256 indexed agentId, uint256 newCount)
event EarningsRecorded(uint256 indexed agentId, uint256 amount, uint256 totalEarnings)
```

**Explorer:** [View Contract](https://www.oklink.com/x-layer-testnet/address/0x9FCe359ab7A590d0491666B1f0873036f119Ef1d)

---

### 2. SkillsRegistry.sol

**Purpose:** Registers skills that agents can hire, with pricing in USDC.

**Key Functions:**
```solidity
function registerSkill(string memory name, string memory description, uint256 priceUSDC) 
    external returns (uint256 skillId)
function getSkill(uint256 skillId) external view returns (Skill memory)
function totalSkills() external view returns (uint256)
function incrementHireCount(uint256 skillId) external
```

**State Variables:**
- `skills`: Mapping of skill ID to Skill struct
- `nextSkillId`: Counter for skill IDs

**Skill Struct:**
```solidity
struct Skill {
    address provider;
    string name;
    string description;
    uint256 priceUSDC;
    uint256 totalHires;
    bool active;
}
```

**Events:**
```solidity
event SkillRegistered(uint256 indexed skillId, address indexed provider, string name, uint256 priceUSDC)
event SkillHired(uint256 indexed skillId, uint256 newHireCount)
```

**Explorer:** [View Contract](https://www.oklink.com/x-layer-testnet/address/0xc24759ec6A8E9006B47a5e7BdA6e13e589D8b841)

---

### 3. x402PaymentRouter.sol

**Purpose:** Handles x402 payment protocol for skill hiring between agents.

**Key Functions:**
```solidity
function hireSkill(uint256 agentId, uint256 skillId) external returns (uint256 receiptId)
function markCompleted(uint256 receiptId) external
function getReceipt(uint256 receiptId) external view returns (Receipt memory)
function totalReceipts() external view returns (uint256)
```

**State Variables:**
- `receipts`: Mapping of receipt ID to Receipt struct
- `nextReceiptId`: Counter for receipt IDs
- `paymentToken`: Address of tUSDC token

**Receipt Struct:**
```solidity
struct Receipt {
    uint256 agentId;
    uint256 skillId;
    address agent;
    address skillProvider;
    uint256 amount;
    uint256 timestamp;
    bool completed;
}
```

**Security Features:**
- ✅ Self-hire prevention: `require(agentOwner != skillProvider)`
- ✅ Balance validation before transfer
- ✅ Reentrancy protection
- ✅ Only skill provider can mark completed

**Events:**
```solidity
event SkillHired(uint256 indexed receiptId, uint256 indexed agentId, uint256 indexed skillId, uint256 amount)
event PaymentCompleted(uint256 indexed receiptId)
```

**Explorer:** [View Contract](https://www.oklink.com/x-layer-testnet/address/0x1d449F519D73e6A65cD65F0A29D4771b42f46CaE)

---

### 4. LeaderboardTracker.sol

**Purpose:** Tracks agent performance metrics for the public leaderboard.

**Key Functions:**
```solidity
function recordActivity(uint256 agentId, uint256 txCount, uint256 usdcPaid) external
function getTopAgents(uint256 limit) external view returns (AgentStats[] memory)
function getAgentStats(uint256 agentId) external view returns (AgentStats memory)
```

**State Variables:**
- `agentStats`: Mapping of agent ID to AgentStats struct

**AgentStats Struct:**
```solidity
struct AgentStats {
    uint256 agentId;
    uint256 txCount;
    uint256 usdcPaid;
    uint256 lastActivity;
}
```

**Events:**
```solidity
event ActivityRecorded(uint256 indexed agentId, uint256 txCount, uint256 usdcPaid)
```

**Explorer:** [View Contract](https://www.oklink.com/x-layer-testnet/address/0x1C1D38899909A1DAa23c58DB5A798823E31f2ed2)

---

### 5. TestUSDC.sol

**Purpose:** ERC-20 test token for payments on testnet.

**Key Functions:**
```solidity
function mint(address to, uint256 amount) external
function transfer(address to, uint256 amount) external returns (bool)
function approve(address spender, uint256 amount) external returns (bool)
function balanceOf(address account) external view returns (uint256)
```

**Token Details:**
- **Name:** Test USDC
- **Symbol:** tUSDC
- **Decimals:** 6
- **Total Supply:** Unlimited (mintable)

**Explorer:** [View Contract](https://www.oklink.com/x-layer-testnet/address/0x70799d35aC43AD21e106270E14365a9B96BDc993)

---

### Contract Interaction Flow

```
1. User registers agent:
   AgentRegistry.registerAgent("MyAgent") → agentId = 1

2. Provider registers skill:
   SkillsRegistry.registerSkill("Risk Auditor", "...", 100000) → skillId = 1

3. Agent hires skill:
   x402PaymentRouter.hireSkill(agentId=1, skillId=1)
   ├─► Check: agent.owner != skill.provider ✓
   ├─► Transfer: 0.1 tUSDC from agent to provider
   ├─► Emit: SkillHired event
   └─► Return: receiptId = 1

4. Skill execution completes:
   x402PaymentRouter.markCompleted(receiptId=1)
   └─► Emit: PaymentCompleted event

5. Agent executes swap:
   (Off-chain via Uniswap Trading API)

6. Update on-chain metrics:
   AgentRegistry.incrementTxCount(agentId=1)
   AgentRegistry.recordEarnings(agentId=1, amount=50000)
   LeaderboardTracker.recordActivity(agentId=1, txCount=1, usdcPaid=100000)
```

---

## ✨ Features

### 🔐 x402 Payment Economy

**Two-Wallet Architecture:**
- **Agent Wallet** (`PRIVATE_KEY`): Runs the autonomous agent, hires skills
- **Provider Wallet** (`PROVIDER_PRIVATE_KEY`): Registers skills, receives payments

**Payment Flow:**
```
Agent Wallet ──[hireSkill()]──► x402PaymentRouter ──[transfer()]──► Provider Wallet
     │                                  │
     │                                  ├─► Validate: agent ≠ provider
     │                                  ├─► Transfer tUSDC
     │                                  └─► Emit PaymentCompleted event
     │
     └─► Receive skill execution result
```

**Security Features:**
- ✅ Self-hire prevention at contract level
- ✅ Balance validation before transfer
- ✅ On-chain payment receipts
- ✅ Completion tracking

**Setup:**
```bash
# Generate provider wallet
npx tsx scripts/generateProviderWallet.ts

# Fund provider wallet with OKB (gas) and tUSDC

# Register skills from provider wallet
npx tsx scripts/registerProviderSkills.ts
```

---

### 🧠 Onchain OS Skills (MCP Integration)
All skills use the Onchain OS CLI (`onchainos`) via MCP (Model Context Protocol):

| Skill | File | Purpose | Onchain OS Commands |
|-------|------|---------|---------------------|
| **Gas Optimizer** | `agent/skills/gasOptimizer.ts` | Monitors gas prices and trends | `eth_gasPrice` RPC call |
| **Portfolio Tracker** | `agent/skills/portfolioTracker.ts` | Tracks multi-token balances and P&L | `token balance`, `token price-info` |
| **Market Sentiment** | `agent/skills/marketSentiment.ts` | Analyzes market sentiment (-100 to +100) | `token advanced-info`, `token holders` |
| **Liquidity Monitor** | `agent/skills/liquidityMonitor.ts` | Monitors pool health and reserves | `token liquidity`, `token price-info` |
| **Risk Auditor** | `agent/skills/riskAuditor.ts` | 4-factor risk scoring (0-100) | `token advanced-info`, `token holders`, `cluster-overview` |
| **Yield Finder** | `agent/skills/yieldFinder.ts` | Discovers yield opportunities | `token liquidity`, `token price-info` |

**Skill Details:**

#### 1. Gas Optimizer
- **Input:** None (reads current network state)
- **Output:** `{ gasPrice: number, trend: 'rising' | 'falling' | 'stable', recommendation: 'execute' | 'delay' }`
- **Logic:** Tracks last 10 gas price readings, classifies as low/medium/high, recommends delay if high and rising

#### 2. Portfolio Tracker
- **Input:** `walletAddress: string, tokens: string[]`
- **Output:** `{ balances: TokenBalance[], totalValueUSD: number, profitLoss: number }`
- **Logic:** Queries ERC-20 balances, fetches USD prices, calculates total value and P&L since last snapshot

#### 3. Market Sentiment
- **Input:** `tokenAddress: string`
- **Output:** `{ score: number, confidence: number, label: 'bullish' | 'neutral' | 'bearish' }`
- **Logic:** Aggregates holder concentration, rug risk signals, price trends into a -100 to +100 score

#### 4. Liquidity Monitor
- **Input:** `poolAddress: string`
- **Output:** `{ reserves: [bigint, bigint], healthScore: number, alert: boolean }`
- **Logic:** Polls pool reserves, compares to last reading, alerts if change > 20%, computes health score

#### 5. Risk Auditor (Most Complex)
- **Input:** `tokenAddress: string, chainId: number`
- **Output:** `{ score: number, passed: boolean, factors: RiskFactors }`
- **Weighted Scoring:**
  - **Liquidity Depth (30%):** Higher reserves = lower risk
  - **Holder Distribution (25%):** More distributed = lower risk
  - **Price Volatility (25%):** Lower volatility = lower risk
  - **Cluster Risk (20%):** No rug pull signals = lower risk
- **Pass Threshold:** 65 (configurable)

#### 6. Yield Finder
- **Input:** `chainId: number, minLiquidity: number`
- **Output:** `{ opportunities: YieldOpportunity[] }`
- **Logic:** Scans Onchain OS liquidity data, filters by minimum liquidity, sorts by APY

---

### 🤖 Multi-Agent System
Enable with `MULTI_AGENT=true`. Uses Node.js `EventEmitter` as an in-process message bus.

**Agent Roles:**

| Agent | Responsibility | Emits | Listens To |
|-------|---------------|-------|------------|
| **YieldHunterAgent** | Scans for yield opportunities | `opportunity:found` | - |
| **RiskManagerAgent** | Audits pool safety | `opportunity:approved`, `opportunity:rejected` | `opportunity:found` |
| **ExecutionAgent** | Executes swaps | `swap:completed`, `swap:failed` | `opportunity:approved` |
| **MonitorAgent** | Tracks metrics, triggers webhooks | - | All events |

**Message Bus Events:**
```typescript
type AgentEvent = 
  | { type: 'opportunity:found', data: { pool: string, apy: number } }
  | { type: 'opportunity:approved', data: { pool: string, riskScore: number } }
  | { type: 'opportunity:rejected', data: { pool: string, reason: string } }
  | { type: 'swap:completed', data: { txHash: string, amountOut: bigint } }
  | { type: 'swap:failed', data: { error: string } }
```

**Coordination Flow:**
```
YieldHunterAgent
    │
    ├─► Scans Onchain OS for pools
    │
    └─► emit('opportunity:found', { pool, apy })
            │
            ▼
    RiskManagerAgent
            │
            ├─► Audits pool with Risk Auditor skill
            │
            ├─► IF score >= 65:
            │       emit('opportunity:approved', { pool, riskScore })
            │
            └─► ELSE:
                    emit('opportunity:rejected', { pool, reason })
                        │
                        ▼
                ExecutionAgent
                        │
                        ├─► Get quote from DEX Router
                        │
                        ├─► Execute swap
                        │
                        └─► emit('swap:completed', { txHash, amountOut })
                                │
                                ▼
                        MonitorAgent
                                │
                                ├─► Record to telemetry
                                │
                                ├─► Update on-chain metrics
                                │
                                ├─► Trigger webhooks
                                │
                                └─► Check rebalancing thresholds
```

---

### ⚖️ Automated Portfolio Rebalancing
Configure target portfolio allocation and drift threshold. The rebalancer checks after each cycle and queues trades if any token drifts beyond the threshold.

**Configuration:**
```env
REBALANCE_THRESHOLD=5                          # Trigger rebalancing if drift > 5%
TARGET_ALLOCATION={"USDC":50,"WOKB":30,"ETH":20}  # Target percentages
MIN_TRADE_SIZE=1000000                         # Minimum 1 USDC trade size
```

**Rebalancing Logic:**
```typescript
1. Calculate current allocation:
   currentAllocation = {
     USDC: (usdcBalance * usdcPrice) / totalPortfolioValue * 100,
     WOKB: (wokbBalance * wokbPrice) / totalPortfolioValue * 100,
     ...
   }

2. Calculate drift for each token:
   drift = abs(currentAllocation[token] - targetAllocation[token])

3. IF any drift > threshold:
   - Calculate required trades to restore target allocation
   - Queue trades (sell overweight tokens, buy underweight tokens)
   - Execute trades via DEX Router

4. Update portfolio snapshot
```

**Example:**
```
Target: { USDC: 50%, WOKB: 50% }
Current: { USDC: 60%, WOKB: 40% }
Drift: USDC = 10%, WOKB = 10%
Threshold: 5%

Action: Sell 10% of portfolio value in USDC, buy WOKB
```

---

### 🔔 Notification System
Webhook delivery with 3 retries and exponential backoff (1s → 2s → 4s). Fires on `swap:completed`, `risk:rejected`, and `gas:spike`.

**Configuration:**
```env
WEBHOOK_URL=https://your-webhook.example.com/events
WEBHOOK_EVENTS=swap:completed,risk:rejected,gas:spike
```

**Webhook Payload:**
```json
{
  "event": "swap:completed",
  "timestamp": "2026-04-18T12:34:56.789Z",
  "agentId": "1",
  "data": {
    "txHash": "0x1234...",
    "tokenIn": "0x7079...",
    "tokenOut": "0x2720...",
    "amountIn": "100000",
    "amountOut": "50000000000000000",
    "gasUsed": "150000"
  }
}
```

**Retry Logic:**
```typescript
async function sendWebhook(event: NotificationEvent, attempt = 1): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })
  } catch (error) {
    if (attempt < 3) {
      const delay = Math.pow(2, attempt - 1) * 1000  // 1s, 2s, 4s
      await sleep(delay)
      return sendWebhook(event, attempt + 1)
    }
    // Log failure after 3 attempts
    console.error('Webhook delivery failed after 3 attempts')
  }
}
```

---

### 🌐 Network-Aware DEX Routing

**Testnet (Chain 1952):** Uniswap Trading API
```typescript
const router = new UniswapDexRouter(process.env.UNISWAP_API_KEY)
const quote = await router.getQuote({
  tokenIn: '0x7079...',  // tUSDC
  tokenOut: '0x2720...', // WOKB
  amountIn: parseUnits('0.1', 6),
  slippageTolerance: 0.5
})
```

**Mainnet (Chain 196):** OKX DEX Aggregator
```typescript
const router = new OkxDexRouter(process.env.OK_API_KEY)
const quote = await router.getQuote({
  tokenIn: '0x74b7...',  // USDC
  tokenOut: '0xe538...', // WOKB
  amountIn: parseUnits('100', 6),
  slippageTolerance: 0.5
})
```

**Automatic Selection:**
```typescript
// lib/agentConfig.ts
export function createDexRouter(): DexRouter {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID)
  
  if (chainId === 1952) {
    // Testnet: Uniswap Trading API
    return new UniswapDexRouter(process.env.UNISWAP_API_KEY!)
  } else if (chainId === 196) {
    // Mainnet: OKX DEX Aggregator
    return new OkxDexRouter(process.env.OK_API_KEY!)
  } else {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}
```

**Uniswap Testnet Addresses:**
- Universal Router V2: `0x3013d50F2C2c2f7b494B4E858D64a02568e647B7`
- Swap Router: `0x91F566085a66a7b39922e30777176E3661608466`
- Quoter: `0xe62BaA3B73809CDea9e7019E7581B8511E948332`
- WOKB: `0x2720d209E992B8D009386D4948A31E13B03623C2`

---

## 🚀 Quick Start

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
