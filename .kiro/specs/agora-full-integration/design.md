# AGORA Full Integration - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User / Judge                             │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (Wagmi + Viem)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │ Marketplace  │  │  Activity    │         │
│  │  Page        │  │  Page        │  │  Feed        │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    X Layer Blockchain (Chain 1952/196)          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AgentRegistry│  │ SkillsRegistry│ │ x402Payment  │         │
│  │              │  │              │  │ Router       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐                                               │
│  │ Leaderboard  │                                               │
│  │ Tracker      │                                               │
│  └──────────────┘                                               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Prime Agent (TypeScript)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Main Loop (every 30s):                                  │  │
│  │  1. scanForYield() → Onchain OS                          │  │
│  │  2. hireRiskAuditor() → x402 Payment                     │  │
│  │  3. executeSwap() → Uniswap Trading API                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Onchain OS   │  │  Uniswap     │                            │
│  │ CLI          │  │  Trading API │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Contract Deployment System

**Purpose:** Deploy and verify all 4 contracts on X Layer testnet

**Implementation:**
- Use Hardhat with ethers.js
- Deploy in sequence: TestUSDC → AgentRegistry → SkillsRegistry → LeaderboardTracker → x402PaymentRouter
- Predict router address using nonce calculation for LeaderboardTracker constructor
- Write addresses to deployments/addresses.json
- Verify on OKLink using @okxweb3/hardhat-explorer-verify

**Key Files:**
- `scripts/deploy.ts` - Main deployment script
- `scripts/seedSkills.ts` - Register 6 default skills
- `scripts/verify.ts` - Verify contracts on OKLink
- `hardhat.config.ts` - Network configuration

### 2. Yield Finder (Real Integration)

**Purpose:** Discover real yield opportunities on X Layer using Onchain OS

**Status:** ✅ COMPLETE - Real Onchain OS CLI integration working

**Implementation:**
```typescript
// agent/skills/yieldFinder.ts
export async function findYield(rpcUrl: string): Promise<YieldOpportunity[]> {
  // 1. Determine chain from RPC URL
  const chain = getChainFromRpc(rpcUrl);
  
  // 2. Use Onchain OS CLI to get liquidity pools
  const pools = await execOnchainOS([
    'token', 'liquidity',
    '--address', USDC_ADDRESS[chain.id],
    '--chain', chain.id === 196 ? 'xlayer' : 'xlayer'
  ]);
  
  // 3. For each pool, get price info
  const opportunities = await Promise.all(
    pools.map(async (pool) => {
      const priceInfo = await execOnchainOS([
        'token', 'price-info',
        '--address', pool.poolAddress,
        '--chain', chain.id === 196 ? 'xlayer' : 'xlayer'
      ]);
      
      // 4. Calculate APY from reserves and fees
      const apy = calculateAPY(pool, priceInfo);
      
      return {
        poolAddress: pool.poolAddress,
        token0: pool.token0,
        token1: pool.token1,
        estimatedAPY: apy,
        liquidity: BigInt(pool.liquidityUsd),
        amount: parseUnits("1", 6) // 1 USDC
      };
    })
  );
  
  // 5. Sort by APY descending
  return opportunities.sort((a, b) => b.estimatedAPY - a.estimatedAPY);
}
```

**Onchain OS Commands Used:**
- `onchainos token liquidity --address <USDC> --chain xlayer`
- `onchainos token price-info --address <pool> --chain xlayer`

### 3. Risk Auditor (Real Integration)

**Purpose:** Audit pools using real on-chain risk data

**Status:** ✅ COMPLETE - Full Onchain OS risk analysis implemented

**Implementation:**
```typescript
// agent/skills/riskAuditor.ts
export async function auditPool(poolAddress: string, rpcUrl: string): Promise<AuditResult> {
  const chain = getChainFromRpc(rpcUrl);
  
  // 1. Get advanced token info (risk level, dev stats)
  const advancedInfo = await execOnchainOS([
    'token', 'advanced-info',
    '--address', poolAddress,
    '--chain', chain.id === 196 ? 'xlayer' : 'xlayer'
  ]);
  
  // 2. Get holder distribution
  const holders = await execOnchainOS([
    'token', 'holders',
    '--address', poolAddress,
    '--chain', chain.id === 196 ? 'xlayer' : 'xlayer'
  ]);
  
  // 3. Get cluster analysis
  const cluster = await execOnchainOS([
    'token', 'cluster-overview',
    '--address', poolAddress,
    '--chain', chain.id === 196 ? 'xlayer' : 'xlayer'
  ]);
  
  // 4. Calculate risk score
  let score = 50;
  const reasons: string[] = [];
  
  // Risk level check
  if (advancedInfo.riskControlLevel <= 2) {
    score += 20;
    reasons.push("Low to medium risk level detected");
  } else {
    score -= 20;
    reasons.push("High risk level detected");
  }
  
  // Holder concentration check
  if (parseFloat(advancedInfo.top10HoldPercent) < 50) {
    score += 15;
    reasons.push("Healthy holder distribution");
  } else {
    reasons.push("High holder concentration risk");
  }
  
  // Cluster risk check
  if (parseFloat(cluster.rugPullPercent) < 20) {
    score += 15;
    reasons.push("Low rug pull risk");
  } else {
    score -= 15;
    reasons.push("Elevated rug pull risk");
  }
  
  return {
    score,
    passed: score >= 75,
    reasons,
    liquidity: BigInt(advancedInfo.liquidity || 0),
    reserve0: 0n,
    reserve1: 0n
  };
}
```

**Onchain OS Commands Used:**
- `onchainos token advanced-info --address <pool> --chain xlayer`
- `onchainos token holders --address <pool> --chain xlayer`
- `onchainos token cluster-overview --address <pool> --chain xlayer`

### 4. Uniswap Swap Execution (Real Integration)

**Purpose:** Execute real swaps on X Layer mainnet

**Status:** ⚠️ READY - UniswapClient implemented, needs mainnet testing
**Note:** Uniswap Trading API only supports mainnet (196), not testnet (1952)

**Implementation:**
```typescript
// agent/primeAgent.ts - executeSwap method
async executeSwap(opportunity: Opportunity, auditResult: AuditResult): Promise<void> {
  // Note: Uniswap Trading API only supports mainnet (196), not testnet (1952)
  if (this.chain.id === 1952) {
    console.log("Skipping swap on testnet - Uniswap API only supports mainnet");
    return;
  }
  
  const tokenIn = opportunity.token0;
  const tokenOut = opportunity.token1;
  const amountIn = opportunity.amount;
  
  // 1. Check approval
  const approvalData = await this.uniswapClient.checkApproval(
    tokenIn,
    amountIn.toString(),
    this.account.address,
    this.chain.id
  );
  
  if (approvalData.approval) {
    // 2. Send approval transaction
    const approveHash = await this.walletClient.sendTransaction({
      to: approvalData.approval.to,
      data: approvalData.approval.data,
      value: BigInt(approvalData.approval.value || 0),
      account: this.account
    });
    await this.publicClient.waitForTransactionReceipt({ hash: approveHash });
  }
  
  // 3. Get quote
  const quote = await this.uniswapClient.getQuote({
    tokenIn,
    tokenOut,
    amount: amountIn.toString(),
    type: "EXACT_INPUT",
    swapper: this.account.address,
    protocols: ["V3"],
    chainId: this.chain.id
  });
  
  // 4. Get swap transaction
  const swapData = await this.uniswapClient.getSwap({
    quote: quote.quote
  });
  
  // 5. Execute swap
  const swapHash = await this.walletClient.sendTransaction({
    to: swapData.swap.to,
    data: swapData.swap.data,
    value: BigInt(swapData.swap.value || 0),
    account: this.account
  });
  
  await this.publicClient.waitForTransactionReceipt({ hash: swapHash });
  
  // 6. Update on-chain metrics
  await this.updateMetrics(swapHash);
}
```

**Uniswap API Endpoints:**
- POST /v1/check_approval - Check if approval needed
- POST /v1/quote - Get swap quote
- POST /v1/swap - Get swap transaction data

### 5. WebSocket Real-time Feed

**Purpose:** Stream contract events in real-time

**Status:** 📝 NEEDS TESTING - Component implemented, needs verification

**Implementation:**
```typescript
// components/LiveActivityFeed.tsx
const publicClient = useMemo(() => {
  const wsUrl = process.env.NEXT_PUBLIC_WSS_URL;
  if (wsUrl) {
    return createPublicClient({
      chain: ACTIVE_CHAIN,
      transport: webSocket(wsUrl)
    });
  }
  return createPublicClient({
    chain: ACTIVE_CHAIN,
    transport: http(ACTIVE_CHAIN.rpcUrls.default.http[0])
  });
}, []);

useEffect(() => {
  const unwatch = publicClient.watchContractEvent({
    address: addresses.paymentRouter,
    abi: paymentRouterAbi,
    eventName: "SkillHired",
    onLogs: (logs) => {
      // Update feed with new events
      setItems(prev => [...newItems, ...prev].slice(0, 20));
    }
  });
  
  return () => unwatch();
}, [publicClient]);
```

**WebSocket Endpoints:**
- Testnet: wss://xlayertestws.okx.com
- Mainnet: wss://xlayerws.okx.com

### 6. Environment Configuration

**Required Environment Variables:**
```bash
# Deployment
PRIVATE_KEY=0x...
OKLINK_API_KEY=...

# Uniswap (mainnet only)
UNISWAP_API_KEY=...

# Frontend
NEXT_PUBLIC_CHAIN_ID=1952  # or 196 for mainnet
NEXT_PUBLIC_RPC_URL=https://testrpc.xlayer.tech/terigon
NEXT_PUBLIC_WSS_URL=wss://xlayertestws.okx.com
NEXT_PUBLIC_BUILDER_CODE=...  # Optional for Builder Code attribution

# Contract addresses (populated by deploy script)
NEXT_PUBLIC_AGENT_REGISTRY=0x...
NEXT_PUBLIC_SKILLS_REGISTRY=0x...
NEXT_PUBLIC_PAYMENT_ROUTER=0x...
NEXT_PUBLIC_LEADERBOARD=0x...
```

## Data Flow

### Earn-Pay-Earn Loop

1. **Scan Phase**
   - Prime Agent calls `findYield()`
   - Onchain OS CLI queries X Layer pools
   - Returns top opportunities sorted by APY

2. **Audit Phase**
   - Prime Agent calls `hireRiskAuditor()`
   - Approves USDC for x402PaymentRouter
   - Calls `hireSkill()` on-chain
   - Risk Auditor uses Onchain OS for analysis
   - Returns pass/fail decision

3. **Execute Phase**
   - If audit passes, Prime Agent calls `executeSwap()`
   - Uniswap Trading API generates swap transaction
   - Agent signs and broadcasts to X Layer
   - Updates AgentRegistry metrics

4. **Track Phase**
   - x402PaymentRouter emits SkillHired event
   - LeaderboardTracker records activity
   - Frontend WebSocket receives event
   - Activity feed updates in real-time

## Testing Strategy

### Unit Tests
- Test yieldFinder with mocked Onchain OS responses
- Test riskAuditor with mocked risk data
- Test UniswapClient with mocked API responses

### Integration Tests
- Deploy contracts to testnet
- Register test agent
- Hire skill and verify receipt
- Check leaderboard updates

### End-to-End Tests
- Run Prime Agent on testnet
- Verify it discovers pools (may be limited on testnet)
- Verify it hires Risk Auditor
- Verify metrics update on-chain
- Note: Swap execution only works on mainnet

## Deployment Checklist

- [x] Compile all contracts
- [x] Deploy to X Layer testnet
- [x] Verify contracts on OKLink
- [x] Seed 6 default skills
- [x] Update .env with deployed addresses
- [ ] Test frontend wallet connection
- [ ] Test agent registration
- [ ] Test skill hiring
- [ ] Test WebSocket feed
- [ ] Deploy frontend to Vercel
- [ ] Record demo video
- [ ] Update README with addresses
- [ ] Submit to hackathon