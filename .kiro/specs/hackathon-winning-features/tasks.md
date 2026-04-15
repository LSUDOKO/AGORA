# Implementation Tasks: Hackathon Winning Features

## Phase 1: Foundation (High Priority)

- [x] 1. Testnet-Only DEX Router (Uniswap)
  - [x] 1.1 Create `lib/dexRouter.ts` with `DexRouter` interface and `UniswapDexRouter` implementation wrapping existing `UniswapClient`
  - [x] 1.2 Add guard in `createDexRouter()` that throws if `CHAIN_ID !== 1952` to enforce testnet-only Uniswap usage
  - [x] 1.3 Add `createDexRouter()` factory in `lib/agentConfig.ts` that returns `UniswapDexRouter` for testnet (chain 1952) only
  - [x] 1.4 Update `lib/uniswapExecution.ts` to use `DexRouter` instead of calling `UniswapClient` directly
  - [x] 1.5 Update `agent/primeAgent.ts` `executeSwap()` to use the new `DexRouter`

- [x] 2. Fix x402 Self-Hire Issue
  - [x] 2.1 Create `scripts/generateProviderWallet.ts` that generates a new keypair and prints the address and private key
  - [x] 2.2 Create `scripts/registerProviderSkills.ts` that registers all skills from `PROVIDER_PRIVATE_KEY` wallet
  - [x] 2.3 Add `PROVIDER_PRIVATE_KEY` to `.env.example` with instructions
  - [x] 2.4 Update `agent/primeAgent.ts` `hireRiskAuditor()` to use the real x402 payment flow when `PROVIDER_PRIVATE_KEY` is set and provider differs from agent owner

- [x] 3. Testnet Deployment Support
  - [x] 3.1 Create `deployments/addresses.testnet.json` as a canonical copy of current `deployments/addresses.json`
  - [x] 3.2 Update `lib/contracts.ts` to load from `deployments/addresses.testnet.json` and assert `chainId === 1952` on startup
  - [x] 3.3 Update `scripts/deploy.ts` to write output to `deployments/addresses.testnet.json`
  - [x] 3.4 Verify `contracts:deploy:testnet` npm script works end-to-end on X Layer testnet

## Phase 2: New Skills

- [x] 4. Enhance Gas Price Optimizer Skill
  - [x] 4.1 Update `agent/skills/gasOptimizer.ts` to track last 10 gas readings in memory for trend analysis
  - [x] 4.2 Add `getTrend()` method returning "rising", "falling", or "stable"
  - [x] 4.3 Add `shouldDelay()` method that returns true when gas is "high" and trend is "rising"
  - [x] 4.4 Export `GasAnalysis` type with `gasPriceGwei`, `executionBand`, `trend`, `shouldDelay` fields

- [x] 5. Enhance Portfolio Tracker Skill
  - [x] 5.1 Update `agent/skills/portfolioTracker.ts` to track multiple tokens (USDC, WOKB, and any swapped tokens)
  - [x] 5.2 Add snapshot storage (last 100 snapshots in memory) with timestamps
  - [x] 5.3 Add `getProfitLoss()` method comparing current value to first snapshot
  - [x] 5.4 Add USD value computation using Onchain OS price data
  - [x] 5.5 Export `PortfolioSnapshot` type with `tokens`, `totalUsd`, `timestamp`, `profitLoss` fields

- [x] 6. Enhance Market Sentiment Analyzer Skill
  - [x] 6.1 Update `agent/skills/marketSentiment.ts` to aggregate signals from Onchain OS `advanced-info` and `cluster-overview`
  - [x] 6.2 Compute sentiment score in range [-100, 100] from holder concentration, rug risk, and price trend
  - [x] 6.3 Add confidence level (0-1) based on data availability
  - [x] 6.4 Export `SentimentResult` type with `score`, `label`, `confidence`, `signals` fields

- [x] 7. Enhance Liquidity Monitor Skill
  - [x] 7.1 Update `agent/skills/liquidityMonitor.ts` to store previous reserve readings
  - [x] 7.2 Add `detectSignificantChange()` that returns true when reserves change >20% from last reading
  - [x] 7.3 Add `computeHealthScore()` returning 0-100 based on reserve depth and change rate
  - [x] 7.4 Export `LiquidityAlert` type with `poolAddress`, `healthScore`, `changePercent`, `isRisky` fields

## Phase 3: Multi-Agent System

- [x] 8. Build Multi-Agent Orchestrator
  - [x] 8.1 Create `agent/multiAgent.ts` with `AgentOrchestrator` class using Node.js `EventEmitter` as message bus
  - [x] 8.2 Implement `YieldHunterAgent` class that wraps `findYield()` and emits `opportunity:found`
  - [x] 8.3 Implement `RiskManagerAgent` class that listens to `opportunity:found`, runs audit, emits `opportunity:approved` or `opportunity:rejected`
  - [x] 8.4 Implement `ExecutionAgent` class that listens to `opportunity:approved`, executes swap via `DexRouter`, emits `swap:completed`
  - [x] 8.5 Implement `MonitorAgent` class that listens to all events and records metrics to telemetry store
  - [x] 8.6 Update `agent/primeAgent.ts` to optionally use `AgentOrchestrator` when `MULTI_AGENT=true` env var is set

- [x] 9. Advanced Risk Scoring
  - [x] 9.1 Update `agent/skills/riskAuditor.ts` to use weighted scoring: liquidity depth (30%), holder distribution (25%), price volatility (25%), cluster risk (20%)
  - [x] 9.2 Add historical price volatility check using Onchain OS price history data
  - [x] 9.3 Lower pass threshold from 75 to 65 to allow more agent activity
  - [x] 9.4 Return component breakdown in `AuditResult` with individual scores per factor

- [x] 10. Automated Portfolio Rebalancing
  - [x] 10.1 Create `agent/rebalancer.ts` with `PortfolioRebalancer` class
  - [x] 10.2 Implement `checkDrift()` that compares current allocation to target and returns drift percentage per token
  - [x] 10.3 Implement `computeRebalanceTrades()` that returns list of trades needed to restore target allocation
  - [x] 10.4 Implement `execute()` that runs trades via `DexRouter` respecting minimum trade size
  - [x] 10.5 Add `REBALANCE_THRESHOLD` and `TARGET_ALLOCATION` to `.env.example`

## Phase 4: Notifications

- [x] 11. Notification System
  - [x] 11.1 Create `lib/notifications.ts` with `NotificationService` class
  - [x] 11.2 Implement `send()` method that POSTs event payload to configured webhook URL
  - [x] 11.3 Add retry logic: 3 attempts with 1s, 2s, 4s backoff
  - [x] 11.4 Add in-memory event log (last 500 events) with `getLog()` method
  - [x] 11.5 Add `WEBHOOK_URL` to `.env.example`
  - [x] 11.6 Wire `NotificationService` into `MonitorAgent` to fire on `swap:completed`, `risk:rejected`, `gas:spike`

## Phase 5: Enhanced Frontend

- [x] 12. Network Badge Component
  - [x] 12.1 Create `components/NetworkBadge.tsx` that reads `NEXT_PUBLIC_CHAIN_ID` and displays "Testnet" or "Mainnet" with color coding

- [x] 13. Real-Time Activity Chart
  - [x] 13.1 Add `recharts` to dependencies
  - [x] 13.2 Create `components/ActivityChart.tsx` with a line chart polling `/api/agent/telemetry` every 5 seconds
  - [x] 13.3 Enhance `app/api/agent/telemetry/route.ts` to return time-series data (last 50 events)

- [x] 14. Profit/Loss Tracker
  - [x] 14.1 Create `components/ProfitLossTracker.tsx` showing cumulative P&L from portfolio snapshots
  - [x] 14.2 Add `/api/agent/portfolio/route.ts` that returns portfolio history from `PortfolioTracker` snapshots

- [x] 15. Skill Performance Metrics
  - [x] 15.1 Create `components/SkillMetrics.tsx` showing skill usage count, success rate, and earnings per skill
  - [x] 15.2 Add `/api/agent/skills/route.ts` that returns skill stats from telemetry store

- [x] 16. Transaction History with Filters
  - [x] 16.1 Create `components/TransactionHistory.tsx` with filter controls (date range, type, status)
  - [x] 16.2 Add `/api/agent/history/route.ts` that returns filtered transaction history

- [x] 17. Enhanced Dashboard Page
  - [x] 17.1 Update `app/dashboard/page.tsx` to include `ActivityChart`, `ProfitLossTracker`, `SkillMetrics`, `NetworkBadge`
  - [x] 17.2 Add auto-refresh without full page reload using React state and `setInterval`

## Phase 6: AI Chat Interface

- [x] 18. Chat API Route
  - [x] 18.1 Create `app/api/chat/route.ts` with intent parser for commands: find opportunities, check portfolio, audit pool, set risk threshold, get status
  - [x] 18.2 Add optional OpenAI integration when `OPENAI_API_KEY` is set for richer natural language responses
  - [x] 18.3 Maintain conversation history in server-side session (last 20 messages)

- [x] 19. Chat Interface Component
  - [x] 19.1 Create `components/ChatInterface.tsx` with message list and input box
  - [x] 19.2 Add `app/chat/page.tsx` that renders the chat interface
  - [x] 19.3 Add chat link to `components/Navbar.tsx`

## Phase 7: Analytics & Strategy

- [x] 20. Analytics Dashboard
  - [x] 20.1 Create `app/analytics/page.tsx` with performance charts (recharts)
  - [x] 20.2 Add performance over time chart (line), skill usage chart (bar), gas cost chart (area)
  - [x] 20.3 Add ROI calculation: `(totalEarned - totalGasCost) / initialCapital * 100`
  - [x] 20.4 Add CSV export button that downloads telemetry data

- [x] 21. Strategy Marketplace
  - [x] 21.1 Create `lib/strategies.ts` with `Strategy` type and localStorage CRUD operations
  - [x] 21.2 Update `app/marketplace/page.tsx` to show strategy cards with import/export buttons
  - [x] 21.3 Add strategy creation form with risk threshold, token whitelist, and protocol preference fields

- [x] 22. Enhanced Leaderboard
  - [x] 22.1 Update `app/leaderboard/page.tsx` to support sorting by earnings, tx count, and success rate
  - [x] 22.2 Add reputation score column: `(earnings * 0.4) + (txCount * 0.3) + (successRate * 0.3)`
  - [x] 22.3 Add `components/NetworkBadge.tsx` to leaderboard header

## Phase 8: Testing

- [x] 23. Setup Testing Framework
  - [x] 23.1 Add `vitest` and `fast-check` to devDependencies
  - [x] 23.2 Add `vitest.config.ts` with test file patterns
  - [x] 23.3 Add `test` script to `package.json`

- [x] 24. Unit Tests for DEX Router
  - [x] 24.1 Create `lib/dexRouter.test.ts` with tests for network routing logic
  - [x] 24.2 Test that `createDexRouter()` returns `UniswapDexRouter` for chain 1952
  - [x] 24.3 Test that `createDexRouter()` returns `OkxDexRouter` for chain 196

- [x] 25. Property Tests
  - [x] 25.1 Create `agent/skills/riskAuditor.test.ts` with fast-check property: risk score always in [0, 100]
  - [x] 25.2 Create `agent/rebalancer.test.ts` with fast-check property: after rebalancing, drift is below threshold
  - [x] 25.3 Create `lib/notifications.test.ts` with fast-check property: retry count never exceeds 3
