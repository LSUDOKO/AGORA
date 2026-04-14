# AGORA Full Integration - Tasks

## 1. Environment Setup

- [ ] 1.1 Create .env file from .env.example
- [ ] 1.2 Add PRIVATE_KEY for deployment wallet
- [ ] 1.3 Add OKLINK_API_KEY for contract verification
- [ ] 1.4 Add UNISWAP_API_KEY for Trading API (mainnet only)
- [ ] 1.5 Install onchainos CLI: `curl -sSL https://raw.githubusercontent.com/okx/onchainos-skills/latest/install.sh | sh`

## 2. Contract Deployment

- [ ] 2.1 Compile contracts: `npm run contracts:compile`
- [ ] 2.2 Deploy to testnet: `npm run contracts:deploy:testnet`
- [ ] 2.3 Verify deployments/addresses.json has all contract addresses
- [ ] 2.4 Seed skills: `npm run contracts:seed:testnet`
- [ ] 2.5 Verify contracts on OKLink: `npm run contracts:verify:script:testnet`

## 3. Yield Finder Real Integration

- [ ] 3.1 Create helper function to execute onchainos CLI commands
  - Use Node.js `child_process.execSync`
  - Parse JSON output
  - Handle errors gracefully

- [ ] 3.2 Update findYield() to use onchainos token liquidity
  - Get USDC liquidity pools on X Layer
  - Parse pool addresses and reserves
  - Calculate real APY from pool data

- [ ] 3.3 Add price fetching with onchainos market price
  - Get token prices for APY calculation
  - Handle missing price data

- [ ] 3.4 Test yieldFinder on testnet
  - Run standalone: `tsx agent/skills/yieldFinder.ts`
  - Verify it returns real pool data

## 4. Risk Auditor Real Integration

- [ ] 4.1 Update auditPool() to use onchainos token advanced-info
  - Get risk level, dev stats, token tags
  - Parse risk indicators

- [ ] 4.2 Add holder analysis with onchainos token holders
  - Get top 100 holders
  - Calculate concentration metrics

- [ ] 4.3 Add cluster analysis with onchainos token cluster-overview
  - Get rug pull probability
  - Get new address percentage
  - Get same-fund-source percentage

- [ ] 4.4 Implement comprehensive risk scoring
  - Weight different risk factors
  - Set threshold at 75 for pass/fail

- [ ] 4.5 Test riskAuditor on testnet
  - Run standalone with test pool address
  - Verify risk scores are realistic

## 5. Uniswap Integration Testing

- [ ] 5.1 Test UniswapClient.checkApproval() on mainnet
  - Use real USDC address
  - Verify approval detection works

- [ ] 5.2 Test UniswapClient.getQuote() on mainnet
  - Get quote for USDC → OKB swap
  - Verify quote response format

- [ ] 5.3 Test UniswapClient.getSwap() on mainnet
  - Generate swap transaction data
  - Verify transaction format

- [ ] 5.4 Update primeAgent.ts executeSwap()
  - Add testnet check (skip swap on testnet)
  - Implement full approval + swap flow
  - Add error handling and retries

- [ ] 5.5 Test full swap execution on mainnet (small amount)
  - Run Prime Agent with real funds
  - Verify swap completes successfully

## 6. Prime Agent Integration

- [ ] 6.1 Update primeAgent.ts to use real yieldFinder
  - Remove mock data fallbacks
  - Handle empty results gracefully

- [ ] 6.2 Update primeAgent.ts to use real riskAuditor
  - Integrate new risk scoring
  - Log audit details

- [ ] 6.3 Test full agent loop on testnet
  - Run: `npm run agent:run`
  - Verify it discovers pools
  - Verify it hires Risk Auditor
  - Verify x402 payment works
  - Verify metrics update on-chain

- [ ] 6.4 Test agent loop on mainnet (optional)
  - Use small amounts
  - Verify full earn-pay-earn cycle

## 7. Frontend Integration

- [ ] 7.1 Update .env with deployed contract addresses
  - Copy from deployments/addresses.json
  - Set NEXT_PUBLIC_* variables

- [ ] 7.2 Test wallet connection
  - Run: `npm run dev`
  - Connect MetaMask to X Layer testnet
  - Verify chain detection works

- [ ] 7.3 Test agent registration
  - Click "Deploy My Agent" button
  - Verify transaction succeeds
  - Verify agent appears in dashboard

- [ ] 7.4 Test skill hiring
  - Navigate to marketplace
  - Click "Hire via x402" on any skill
  - Approve USDC if needed
  - Verify hire transaction succeeds

- [ ] 7.5 Test WebSocket activity feed
  - Navigate to activity page
  - Hire a skill from another tab
  - Verify event appears in feed immediately

- [ ] 7.6 Test leaderboard
  - Navigate to leaderboard page
  - Verify agent appears with correct metrics
  - Verify auto-refresh works

## 8. Documentation

- [ ] 8.1 Update README.md with deployed addresses
  - Add contract addresses table
  - Add OKLink explorer links

- [ ] 8.2 Document Onchain OS integration
  - List CLI commands used
  - Explain data flow

- [ ] 8.3 Document Uniswap integration
  - List API endpoints used
  - Note mainnet-only limitation

- [ ] 8.4 Add architecture diagram to README
  - ASCII art or image
  - Show all components and data flow

- [ ] 8.5 Add local development instructions
  - Prerequisites
  - Installation steps
  - Running the agent
  - Running the frontend

- [ ] 8.6 Add demo video section
  - Record 2-3 minute walkthrough
  - Upload to YouTube
  - Add link to README

## 9. Final Testing

- [ ] 9.1 Full end-to-end test on testnet
  - Deploy fresh contracts
  - Register agent
  - Run agent for 5 minutes
  - Verify all metrics update

- [ ] 9.2 Verify all contract events emit correctly
  - Check AgentRegistered
  - Check SkillHired
  - Check ActivityRecorded

- [ ] 9.3 Test frontend on mobile
  - Verify responsive design
  - Test wallet connection

- [ ] 9.4 Performance check
  - Verify WebSocket doesn't leak memory
  - Verify agent loop doesn't crash

## 10. Deployment & Submission

- [ ] 10.1 Deploy frontend to Vercel
  - Connect GitHub repo
  - Set environment variables
  - Verify deployment works

- [ ] 10.2 Record demo video
  - Show dashboard
  - Show agent registration
  - Show skill hiring
  - Show activity feed
  - Show leaderboard

- [ ] 10.3 Prepare submission materials
  - GitHub repo link
  - Deployed frontend URL
  - Demo video link
  - Contract addresses
  - X/Twitter post

- [ ] 10.4 Submit to hackathon
  - Fill out Google Form
  - Submit before deadline (April 15, 23:59 UTC)

## Notes

- Tasks 3 and 4 (Onchain OS integration) can be done in parallel
- Task 5 (Uniswap) requires mainnet and API key
- Task 6 depends on tasks 3, 4, and 5
- Task 7 depends on task 2 (deployed contracts)
- Tasks 8-10 are final polish and submission