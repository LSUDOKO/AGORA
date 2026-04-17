# Frontend Full Integration - Tasks

## 1. Core Infrastructure Setup
- [ ] 1.1 Create AgentContext provider for global agent state
- [ ] 1.2 Install and configure SWR for API data fetching
- [ ] 1.3 Install and configure react-toastify for notifications
- [ ] 1.4 Create error boundary components
- [ ] 1.5 Create loading skeleton components

## 2. Marketplace Page Integration
- [ ] 2.1 Implement real skill loading from SkillsRegistry contract
- [ ] 2.2 Remove all mock skill data and unused imports
- [ ] 2.3 Add strategy filter UI with localStorage persistence
- [ ] 2.4 Integrate strategy filtering logic with loaded skills
- [ ] 2.5 Add empty state when no skills registered
- [ ] 2.6 Test HireSkillButton with real transactions
- [ ] 2.7 Add transaction success/error toast notifications

## 3. Dashboard Page Real Data
- [ ] 3.1 Replace static STATS with real agent metrics
- [ ] 3.2 Integrate AgentContext for agentId and agentData
- [ ] 3.3 Replace ACTION_QUEUE with real telemetry events
- [ ] 3.4 Update LatestReceipt to show real x402 data
- [ ] 3.5 Remove all mock data constants
- [ ] 3.6 Add loading states for all data sections
- [ ] 3.7 Test DeployAgentButton registration flow

## 4. Leaderboard Real Rankings
- [ ] 4.1 Remove MOCK_ROWS fallback logic
- [ ] 4.2 Add empty state UI for zero agents
- [ ] 4.3 Implement real TVL calculation from contract
- [ ] 4.4 Add block explorer links for agent addresses
- [ ] 4.5 Test sort controls with real data
- [ ] 4.6 Add auto-refresh every 10 seconds

## 5. Activity Page Live Feed
- [ ] 5.1 Replace INITIAL_ROWS with API data
- [ ] 5.2 Remove fake row generation interval
- [ ] 5.3 Implement real-time event fetching
- [ ] 5.4 Add event type icons mapping
- [ ] 5.5 Format timestamps as relative time
- [ ] 5.6 Add empty state for no events

## 6. Analytics Real Metrics
- [ ] 6.1 Create /api/agent/gas-costs route
- [ ] 6.2 Remove GAS_MOCK_DATA constant
- [ ] 6.3 Remove MOCK_ROI constant
- [ ] 6.4 Implement real ROI calculation
- [ ] 6.5 Connect gas chart to real data
- [ ] 6.6 Update CSV export with real data
- [ ] 6.7 Add data loading indicators

## 7. LiveActivityFeed Enhancement
- [ ] 7.1 Add AgentRegistered event subscription
- [ ] 7.2 Add AgentEarningsRecorded event subscription
- [ ] 7.3 Add AgentTxCountIncremented event subscription
- [ ] 7.4 Test WebSocket connection stability
- [ ] 7.5 Verify HTTP polling fallback works

## 8. API Routes Enhancement
- [ ] 8.1 Create /api/agent/gas-costs/route.ts
- [ ] 8.2 Enhance /api/agent/portfolio with contract earnings
- [ ] 8.3 Add agentId parameter support to portfolio route
- [ ] 8.4 Add error handling to all API routes
- [ ] 8.5 Add request validation

## 9. Chat Integration Testing
- [ ] 9.1 Test "find opportunities" with real yieldFinder
- [ ] 9.2 Test "check portfolio" with real balances
- [ ] 9.3 Test "audit <address>" with real riskAuditor
- [ ] 9.4 Test "set risk" configuration updates
- [ ] 9.5 Add chat history persistence
- [ ] 9.6 Test OpenAI integration (when API key present)

## 10. Error Handling & UX
- [ ] 10.1 Add error boundaries to all major pages
- [ ] 10.2 Implement contract read error UI
- [ ] 10.3 Implement transaction error handling
- [ ] 10.4 Add "Connect Wallet" prompts on protected actions
- [ ] 10.5 Add "Register Agent" prompts when needed
- [ ] 10.6 Add "Wrong Network" detection and switch prompt
- [ ] 10.7 Test all error scenarios

## 11. Loading States
- [ ] 11.1 Add skeleton loaders for marketplace grid
- [ ] 11.2 Add skeleton loaders for dashboard cards
- [ ] 11.3 Add skeleton loaders for leaderboard table
- [ ] 11.4 Add skeleton loaders for activity feed
- [ ] 11.5 Add skeleton loaders for analytics charts
- [ ] 11.6 Add button loading states (spinners)

## 12. Transaction Flow Testing
- [ ] 12.1 Test full registration flow
- [ ] 12.2 Test skill hiring with USDC approval
- [ ] 12.3 Test transaction confirmation waiting
- [ ] 12.4 Test UI updates after transaction success
- [ ] 12.5 Test transaction failure recovery
- [ ] 12.6 Test concurrent transaction handling

## 13. Real-Time Updates
- [ ] 13.1 Verify telemetry updates every 5 seconds
- [ ] 13.2 Verify portfolio updates every 5 seconds
- [ ] 13.3 Verify leaderboard updates every 10 seconds
- [ ] 13.4 Verify activity feed updates in real-time
- [ ] 13.5 Test WebSocket reconnection logic
- [ ] 13.6 Test polling interval cleanup on unmount

## 14. Data Consistency
- [ ] 14.1 Ensure agentId consistent across all components
- [ ] 14.2 Ensure transaction counts match contract
- [ ] 14.3 Ensure earnings match contract
- [ ] 14.4 Ensure skill hire counts accurate
- [ ] 14.5 Verify no stale data displayed

## 15. Performance Optimization
- [ ] 15.1 Memoize expensive calculations
- [ ] 15.2 Debounce rapid API calls
- [ ] 15.3 Lazy load heavy chart components
- [ ] 15.4 Optimize contract read batching
- [ ] 15.5 Profile and fix re-render issues

## 16. Documentation
- [ ] 16.1 Update README with setup instructions
- [ ] 16.2 Document environment variables
- [ ] 16.3 Document contract deployment requirements
- [ ] 16.4 Create user guide for frontend features
- [ ] 16.5 Document API routes

## 17. Testing & QA
- [ ] 17.1 Test on fresh wallet (no agent registered)
- [ ] 17.2 Test on wallet with registered agent
- [ ] 17.3 Test with no skills in marketplace
- [ ] 17.4 Test with multiple skills hired
- [ ] 17.5 Test network switching
- [ ] 17.6 Test wallet disconnection
- [ ] 17.7 Test page refresh persistence

## 18. Final Cleanup
- [ ] 18.1 Remove all console.log statements
- [ ] 18.2 Remove all commented-out code
- [ ] 18.3 Remove unused imports
- [ ] 18.4 Remove unused components
- [ ] 18.5 Fix all TypeScript errors
- [ ] 18.6 Fix all ESLint warnings

## 19. Deployment Preparation
- [ ] 19.1 Verify all env vars documented
- [ ] 19.2 Test production build
- [ ] 19.3 Verify contract addresses correct
- [ ] 19.4 Test with deployed contracts
- [ ] 19.5 Verify WebSocket URLs correct
- [ ] 19.6 Create deployment checklist

## 20. User Acceptance Testing
- [ ] 20.1 Complete full user flow end-to-end
- [ ] 20.2 Verify all buttons functional
- [ ] 20.3 Verify all charts show real data
- [ ] 20.4 Verify all transactions execute
- [ ] 20.5 Verify error handling works
- [ ] 20.6 Get user feedback and iterate
