# AGORA Full Integration - Requirements

## Overview
Complete the AGORA project for X Layer Build-X Hackathon submission with real Onchain OS and Uniswap integrations (no mocks).

## User Stories

### US-1: Deploy Contracts to X Layer
**As a** developer
**I want to** deploy all 4 smart contracts to X Layer testnet
**So that** the frontend can interact with real on-chain contracts

**Acceptance Criteria:**
1. All 4 contracts deploy successfully to X Layer testnet (chain 1952)
2. deployments/addresses.json contains real deployed addresses
3. 6 skills are registered on-chain via seedSkills.ts
4. Contracts are verified on OKLink explorer

### US-2: Real Yield Finder Integration
**As a** Prime Agent
**I want to** discover real yield opportunities on X Layer
**So that** I can make data-driven investment decisions

**Acceptance Criteria:**
1. yieldFinder.ts uses Onchain OS CLI (`onchainos token liquidity`) to fetch real pools
2. APY is calculated from real pool reserves and fees
3. Returns sorted opportunities by estimated yield
4. Works on both testnet and mainnet

### US-3: Real Risk Auditor Integration
**As a** Prime Agent
**I want to** audit pools using real on-chain risk data
**So that** I can avoid risky investments

**Acceptance Criteria:**
1. riskAuditor.ts uses `onchainos token advanced-info` for risk assessment
2. Uses `onchainos token holders` for holder concentration analysis
3. Uses `onchainos token cluster-overview` for cluster risk
4. Returns real risk scores (0-100) with pass/fail threshold at 75

### US-4: Real Uniswap Swap Execution
**As a** Prime Agent
**I want to** execute real swaps on X Layer via Uniswap
**So that** the earn-pay-earn loop produces real on-chain transactions

**Acceptance Criteria:**
1. UniswapClient integrates with Uniswap Trading API
2. Supports quote, approval, and swap execution
3. Works on X Layer mainnet (chain 196)
4. Note: Uniswap API does not support testnet (1952)

### US-5: Real-time Activity Feed
**As a** hackathon judge
**I want to** see real-time agent activity
**So that** I can verify the economy loop is working

**Acceptance Criteria:**
1. LiveActivityFeed connects to X Layer WebSocket
2. Subscribes to SkillHired and SkillCompleted events
3. Updates feed in real-time without polling
4. Shows transaction hashes with OKLink links

### US-6: Complete Documentation
**As a** hackathon judge
**I want to** understand how AGORA works
**So that** I can evaluate the submission

**Acceptance Criteria:**
1. README.md has complete architecture overview
2. Lists all deployed contract addresses
3. Documents Onchain OS and Uniswap integration points
4. Provides local development setup instructions

## Technical Requirements

### TR-1: Environment Configuration
- PRIVATE_KEY for deployment
- UNISWAP_API_KEY for Trading API
- OKLINK_API_KEY for contract verification
- NEXT_PUBLIC_CHAIN_ID (1952 for testnet, 196 for mainnet)
- NEXT_PUBLIC_RPC_URL and NEXT_PUBLIC_WSS_URL

### TR-2: Onchain OS CLI Integration
- Install onchainos CLI from https://github.com/okx/onchainos-skills
- Use `onchainos token liquidity --chain xlayer` for pool discovery
- Use `onchainos token advanced-info --chain xlayer` for risk data
- Use `onchainos market price --chain xlayer` for token prices

### TR-3: Uniswap Trading API
- Base URL: https://trade-api.gateway.uniswap.org/v1
- Endpoints: /quote, /swap, /check_approval
- Requires API key in x-api-key header
- Only supports mainnet chains (not testnet)

### TR-4: X Layer Constants
- Testnet RPC: https://testrpc.xlayer.tech/terigon
- Mainnet RPC: https://rpc.xlayer.tech
- WebSocket: wss://xlayerws.okx.com (mainnet), wss://xlayertestws.okx.com (testnet)
- USDC Mainnet: 0x74b7F16337b8972027F6196A17a631aC6dE26d22