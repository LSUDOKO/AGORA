# Frontend Full Integration - Requirements

## Overview
Transform the AGORA frontend from a mix of mock and real data to a fully functional, real-time integrated application where every button, chart, and data display connects to live on-chain data and backend services.

## User Stories

### 1. Marketplace Page Integration
**As a user**, I want to see real skills from the SkillsRegistry contract and hire them with actual on-chain transactions.

**Acceptance Criteria:**
- 1.1 Marketplace loads skills dynamically from SkillsRegistry contract
- 1.2 Each skill displays real provider address, price, and hire count
- 1.3 "Hire via x402" button executes real USDC approval + hireSkill transaction
- 1.4 Transaction status updates in real-time with success/error messages
- 1.5 Hired skills appear in transaction history immediately
- 1.6 Strategy builder saves/loads from localStorage and applies filters to skill display

### 2. Dashboard Real-Time Data
**As a user**, I want the dashboard to display live agent metrics, not static mock data.

**Acceptance Criteria:**
- 2.1 Agent card shows real agentId from AgentRegistry.ownerToAgentId()
- 2.2 "Deploy My Agent" button registers agent on-chain and updates UI
- 2.3 Latest x402 Receipt displays actual receipt data from PaymentRouter
- 2.4 Activity charts pull from multiAgent telemetry (real events)
- 2.5 P&L tracker shows real portfolio snapshots from portfolioTracker
- 2.6 Skill metrics derive from actual agent event history
- 2.7 Transaction history filters work with real event data

### 3. Leaderboard Live Rankings
**As a user**, I want to see real agent rankings based on on-chain activity.

**Acceptance Criteria:**
- 3.1 Leaderboard fetches data from LeaderboardTracker.getTopAgents()
- 3.2 Rankings update every 10 seconds with new on-chain data
- 3.3 Sort controls (earnings, txCount, successRate) work with real data
- 3.4 Agent addresses link to block explorer
- 3.5 TVL calculation aggregates real USDC balances

### 4. Activity Feed Live Events
**As a user**, I want to see real-time on-chain events as they happen.

**Acceptance Criteria:**
- 4.1 Activity feed subscribes to SkillHired events via WebSocket
- 4.2 Activity feed subscribes to SkillCompleted events
- 4.3 New events appear at top of feed with "just now" timestamp
- 4.4 Event details show real agent IDs, skill IDs, amounts
- 4.5 Fallback to HTTP polling if WebSocket unavailable

### 5. Analytics Real Metrics
**As a user**, I want analytics charts to show actual performance data.

**Acceptance Criteria:**
- 5.1 Performance chart displays real telemetry time series
- 5.2 Skill usage chart shows actual skill hire counts
- 5.3 ROI calculation uses real earnings from AgentRegistry
- 5.4 Gas cost tracking integrates with gasOptimizer skill
- 5.5 CSV export contains real data, not mock values

### 6. AI Chat Integration
**As a user**, I want the AI chat to execute real agent operations.

**Acceptance Criteria:**
- 6.1 "find opportunities" command calls real yieldFinder skill
- 6.2 "check portfolio" returns real portfolio balances
- 6.3 "audit <address>" executes real riskAuditor analysis
- 6.4 "set risk" updates agent configuration
- 6.5 Chat history persists across page reloads
- 6.6 OpenAI integration enhances responses (when API key present)

### 7. Wallet Connection Flow
**As a user**, I want seamless wallet connection with proper error handling.

**Acceptance Criteria:**
- 7.1 Connect button triggers MetaMask/injected wallet
- 7.2 Wrong network prompts user to switch to X Layer testnet
- 7.3 Disconnected state disables transaction buttons with clear messaging
- 7.4 Address displays in xko format (X Layer native format)
- 7.5 Balance updates after transactions complete

### 8. Agent Registration Flow
**As a user**, I want to register my agent and see it reflected everywhere.

**Acceptance Criteria:**
- 8.1 "Deploy My Agent" checks if already registered
- 8.2 Registration transaction broadcasts to AgentRegistry
- 8.3 Success updates agentId across all components
- 8.4 Agent appears in leaderboard after first transaction
- 8.5 Error states handled gracefully with retry option

### 9. Transaction Monitoring
**As a user**, I want to track all my transactions with real status updates.

**Acceptance Criteria:**
- 9.1 Transaction history shows all agent events from telemetry
- 9.2 Filters (type, status) work with real event data
- 9.3 Each transaction links to block explorer
- 9.4 Status badges reflect actual completion state
- 9.5 Auto-refresh every 5 seconds

### 10. Error Handling & Loading States
**As a user**, I want clear feedback when things are loading or fail.

**Acceptance Criteria:**
- 10.1 All buttons show loading state during transactions
- 10.2 Contract read failures show "Deploy contracts first" message
- 10.3 Network errors display with retry button
- 10.4 Empty states guide user to next action
- 10.5 Toast notifications for transaction success/failure

## Technical Requirements

### Contract Integration
- All contract addresses loaded from deployments/addresses.testnet.json
- Wagmi hooks used for all contract reads/writes
- Proper ABI imports from lib/contracts.ts
- Transaction receipts awaited before UI updates

### Real-Time Updates
- WebSocket connections for event streaming where available
- HTTP polling fallback with 5-10 second intervals
- Optimistic UI updates with rollback on error
- React state management for live data

### Data Flow
- Agent telemetry from multiAgent.ts getTelemetry()
- Portfolio data from portfolioTracker.ts
- Skill metrics derived from event history
- Chat commands execute real agent skills

### Performance
- Debounced API calls to prevent spam
- Memoized contract reads
- Efficient re-render strategies
- Lazy loading for heavy components

## Out of Scope
- Mainnet deployment (testnet only)
- Mobile responsive optimization (desktop-first)
- Advanced analytics (keep current charts)
- Multi-agent management (single agent focus)

## Success Metrics
- Zero mock data in production build
- All buttons execute real transactions
- Real-time updates within 10 seconds
- Error rate < 5% for contract interactions
- User can complete full flow: connect → register → hire → execute
