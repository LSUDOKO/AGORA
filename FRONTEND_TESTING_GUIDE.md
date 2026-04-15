# AGORA Frontend Testing Guide

## Prerequisites

1. **MetaMask Installed**: Install MetaMask browser extension
2. **X Layer Testnet Configured**: Add X Layer testnet to MetaMask
3. **Test OKB**: Get testnet OKB for gas fees from faucet
4. **Test USDC**: You should have tUSDC from the mint script (1,000,000 tUSDC)

## X Layer Testnet Configuration

Add this network to MetaMask:

- **Network Name**: X Layer Testnet
- **RPC URL**: `https://xlayertestrpc.okx.com`
- **Chain ID**: `1952`
- **Currency Symbol**: OKB
- **Block Explorer**: `https://www.oklink.com/x-layer-testnet`

## Frontend Server

The frontend is now running at: **http://localhost:3000**

## Task 7.1: ✅ Update .env with deployed contract addresses

**Status**: COMPLETE

All contract addresses are already configured in `.env`:
- `NEXT_PUBLIC_AGENT_REGISTRY=0x9FCe359ab7A590d0491666B1f0873036f119Ef1d`
- `NEXT_PUBLIC_SKILLS_REGISTRY=0xc24759ec6A8E9006B47a5e7BdA6e13e589D8b841`
- `NEXT_PUBLIC_PAYMENT_ROUTER=0x1d449F519D73e6A65cD65F0A29D4771b42f46CaE`
- `NEXT_PUBLIC_LEADERBOARD=0x1C1D38899909A1DAa23c58DB5A798823E31f2ed2`

## Task 7.2: Test Wallet Connection

**Steps**:
1. Open http://localhost:3000 in your browser
2. Click "Connect Wallet" button in the navbar
3. Select MetaMask from the wallet options
4. Approve the connection in MetaMask
5. Verify your wallet address appears in the navbar
6. Verify the chain shows "X Layer Testnet (1952)"

**Expected Results**:
- ✅ Wallet connects successfully
- ✅ Address is displayed (shortened format: 0x554e...e3e3)
- ✅ Chain ID is detected correctly
- ✅ No console errors

**Troubleshooting**:
- If wrong chain: Click the chain indicator and switch to X Layer Testnet
- If connection fails: Refresh page and try again
- Check browser console for errors

## Task 7.3: Test Agent Registration

**Steps**:
1. Navigate to Dashboard page (http://localhost:3000/dashboard)
2. If you don't have an agent registered, you'll see "Deploy My Agent" button
3. Click "Deploy My Agent"
4. Enter an agent name (e.g., "Prime Agent")
5. Approve the transaction in MetaMask
6. Wait for transaction confirmation
7. Verify agent appears in the dashboard

**Expected Results**:
- ✅ Transaction is sent successfully
- ✅ Agent ID is assigned (should be 1 if first agent)
- ✅ Agent name is displayed
- ✅ Agent stats show: 0 transactions, 0 USDC earned
- ✅ Transaction hash is shown with OKLink link

**Note**: You already have Agent ID 1 registered, so you should see your agent details immediately.

**Troubleshooting**:
- If transaction fails: Check you have enough OKB for gas
- If agent doesn't appear: Refresh the page
- Check OKLink explorer for transaction status

## Task 7.4: Test Skill Hiring

**Steps**:
1. Navigate to Marketplace page (http://localhost:3000/marketplace)
2. You should see 6 skills listed:
   - Yield Finder (10 USDC)
   - Risk Auditor (5 USDC)
   - Gas Optimizer (3 USDC)
   - Onchain Analyst (8 USDC)
   - Arb Scanner (12 USDC)
   - Liquidation Watch (15 USDC)
3. Click "Hire via x402" on any skill
4. First transaction: Approve USDC spending (if not already approved)
5. Second transaction: Hire the skill
6. Wait for confirmation
7. Verify receipt appears

**Expected Results**:
- ✅ Approval transaction succeeds (first time only)
- ✅ Hire transaction succeeds
- ✅ Receipt ID is generated
- ✅ USDC is transferred from your wallet
- ✅ Skill hire count increments
- ✅ Transaction appears in activity feed

**Known Limitation**: 
⚠️ You cannot hire skills that you registered yourself (same wallet). This is a security feature in the x402PaymentRouter contract. In production, skills would be registered by different providers.

**Troubleshooting**:
- If approval fails: Check you have tUSDC balance
- If hire fails: Check the error message (might be self-hire restriction)
- Check OKLink for transaction details

## Task 7.5: Test WebSocket Activity Feed

**Steps**:
1. Navigate to Activity page (http://localhost:3000/activity)
2. Open a second browser tab with the marketplace
3. In the second tab, hire a skill
4. Switch back to the activity page
5. Verify the new hire event appears immediately (without refresh)

**Expected Results**:
- ✅ Activity feed loads with recent events
- ✅ New events appear in real-time
- ✅ Events show: Agent ID, Skill name, Amount, Timestamp
- ✅ Transaction hashes link to OKLink
- ✅ No page refresh needed

**Troubleshooting**:
- If events don't appear: Check browser console for WebSocket errors
- If WebSocket fails: The component falls back to HTTP polling
- Verify WSS_URL is set correctly in .env

## Task 7.6: Test Leaderboard

**Steps**:
1. Navigate to Leaderboard page (http://localhost:3000/leaderboard)
2. Verify your agent appears in the list
3. Check the metrics:
   - Agent ID
   - Total Transactions
   - Total USDC Paid
4. Wait 30 seconds and verify auto-refresh works

**Expected Results**:
- ✅ Leaderboard loads successfully
- ✅ Your agent (ID: 1) appears
- ✅ Metrics are accurate
- ✅ Leaderboard auto-refreshes every 30 seconds
- ✅ Agents are sorted by total USDC paid (descending)

**Troubleshooting**:
- If leaderboard is empty: Make sure you've hired at least one skill
- If metrics are wrong: Check the LeaderboardTracker contract on OKLink
- Refresh the page manually if auto-refresh fails

## Testing Checklist

- [ ] Task 7.1: .env configured ✅
- [ ] Task 7.2: Wallet connection works
- [ ] Task 7.3: Agent registration works (or agent already exists)
- [ ] Task 7.4: Skill hiring works (or note self-hire limitation)
- [ ] Task 7.5: Activity feed updates in real-time
- [ ] Task 7.6: Leaderboard displays and auto-refreshes

## Common Issues

### Issue: "Wrong Network" Error
**Solution**: Switch to X Layer Testnet (Chain ID 1952) in MetaMask

### Issue: "Insufficient Funds" Error
**Solution**: Get testnet OKB from faucet for gas fees

### Issue: "Cannot Hire Skill" Error
**Solution**: This is expected if you're trying to hire your own skills. The contract prevents self-hiring for security.

### Issue: WebSocket Connection Failed
**Solution**: The app will fall back to HTTP polling. Check that WSS_URL is correct in .env.

### Issue: Transaction Pending Forever
**Solution**: Check OKLink explorer for transaction status. May need to increase gas price.

## Next Steps

After completing frontend testing:
1. Update README.md with deployed addresses (Task 8.1)
2. Document the integration (Tasks 8.2-8.6)
3. Perform final end-to-end testing (Tasks 9.1-9.4)
4. Deploy to Vercel and submit (Tasks 10.1-10.4)

## Useful Links

- **Frontend**: http://localhost:3000
- **OKLink Explorer**: https://www.oklink.com/x-layer-testnet
- **Agent Registry**: https://www.oklink.com/x-layer-testnet/address/0x9FCe359ab7A590d0491666B1f0873036f119Ef1d
- **Your Wallet**: https://www.oklink.com/x-layer-testnet/address/0x554e528cF22aD648Aae791AD67AD62BeD106e3e3

---

**Last Updated**: 2026-04-14
**Status**: Frontend server running, ready for testing
