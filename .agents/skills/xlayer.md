# XLAYER_SKILL.md
# X Layer Developer Skill — AGORA Hackathon Reference

Use this file as your single source of truth when building on X Layer.
Read it before writing any contract, frontend, or deployment code.

---

## 1. CHAIN IDENTITY

| Property | Mainnet | Testnet |
|---|---|---|
| Chain ID (decimal) | 196 | 1952 |
| Chain ID (hex) | 0xC4 | 0x7A0 |
| Gas token | OKB | OKB |
| Block time | ~1 second | ~1 second |
| Max TPS | 5,000 | 5,000 |

**What this means for AGORA:** Deploy AgentRegistry, SkillsMarketplace, and x402 payment contracts on Chain ID 196 (mainnet) or 1952 (testnet). Always hardcode chain ID checks in your contracts.

---

## 2. RPC ENDPOINTS

### Mainnet
```
https://rpc.xlayer.tech
https://xlayerrpc.okx.com
wss://xlayerws.okx.com        ← use this for real-time agent activity feed
wss://ws.xlayer.tech
```

### Testnet
```
https://testrpc.xlayer.tech/terigon
https://xlayertestrpc.okx.com/terigon
```

**Rate limit:** 100 requests/second per IP on both networks.

**For production / high-volume agents:** Use a dedicated RPC from QuickNode, Blockdaemon, Getblock, ZAN, Chainstack, Unifra, or BlockPI.

### Quick health check
```bash
# Check latest block on testnet
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  -H "Content-Type: application/json" \
  https://testrpc.xlayer.tech/terigon
```

---

## 3. ADDRESS FORMATS

X Layer supports two address formats — both point to the same on-chain account.

| Format | Example |
|---|---|
| Standard EVM | `0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625` |
| XKO prefix | `XKO70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625` |

### Rules
- XKO prefix is case-insensitive (`XKO`, `xko`, `Xko` all valid)
- NEVER use XKO format inside transactions — always convert to standard 20-byte EVM before signing/sending
- Do NOT write `XKO0x...` — that is invalid

### JavaScript conversion (use this in AGORA frontend)
```bash
npm install js-sha3
```
```javascript
const { toEvmAddress, fromEvmAddress } = require('./multiAddress.js');

// Display XKO format in UI
const xkoAddr = fromEvmAddress('0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625');
// → XKO70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625

// Convert back before sending any transaction
const evmAddr = toEvmAddress('XKO70586beeb7b7aa2e7966df9c8493c6cbfd75c625');
// → 0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625
```

### Python conversion
```bash
pip install eth-utils
```
```python
from multi_address import to_evm_address, from_evm_address
evm = to_evm_address('XKO70586beeb7b7aa2e7966df9c8493c6cbfd75c625')
xko = from_evm_address('0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625')
```

---

## 4. KEY CONTRACT ADDRESSES

### Layer 1 (Ethereum) — for bridging

| Contract | Purpose | Mainnet | Sepolia Testnet |
|---|---|---|---|
| OptimismPortal | Entry point for L1→L2 messages | `0x64057ad1DdAc804d0D26A7275b193D9DACa19993` | `0x1529a34331D7d85C8868Fc88EC730aE56d3Ec9c0` |
| L1CrossDomainMessenger | High-level L1↔L2 messaging | `0xF94B553F3602a03931e5D10CaB343C0968D793e3` | `0xEf40d5432D37B3935a11710c73F395e2c9921295` |
| SystemConfig | Network config + contract registry | `0x5065809Af286321a05fBF85713B5D5De7C8f0433` | `0x06BE4b4A9a28fF8EED6da09447Bc5DAA676efac3` |
| DisputeGameFactory | Deploy dispute games | `0x9D4c8FAEadDdDeeE1Ed0c92dAbAD815c2484f675` | `0x80388586ab4580936BCb409Cc2dC6BC0221e1B6F` |

### Layer 2 (X Layer) — predeploys, always available

| Contract | Purpose | L2 Address |
|---|---|---|
| L2CrossDomainMessenger | L2 side messaging | `0x4200000000000000000000000000000000000007` |
| L2ToL1MessagePasser | Send messages L2→L1 | `0x4200000000000000000000000000000000000016` |
| L1Block | Access latest L1 block info | `0x4200000000000000000000000000000000000015` |
| GasPriceOracle | Get L1 fee for gas estimation | `0x420000000000000000000000000000000000000F` |
| EAS | Ethereum Attestation Service | `0x4200000000000000000000000000000000000021` |

### Token Addresses (X Layer Mainnet)

| Token | Address |
|---|---|
| WOKB | `0xe538905cf8410324e03A5A23C1c177a474D59b2b` |
| WETH | `0x5A77f1443D16ee5761d310e38b62f77f726bC71c` |
| USDC | `0x74b7F16337b8972027F6196A17a631aC6dE26d22` ← **use this for x402 payments** |
| USDC.e | `0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035` |
| USDT | `0x1E4a5963aBFD975d8c9021ce480b42188849D41d` |
| WBTC | `0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1` |
| DAI | `0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4` |

**For AGORA x402 payments: always use USDC at `0x74b7F16337b8972027F6196A17a631aC6dE26d22`**

### USDC vs USDC.e — which to use?
- **USDC** (`0x74b7...`) = Circle's native bridged USDC standard. Recommended. Supported by OKX Exchange and official bridge.
- **USDC.e** (`0xA8CE...`) = bridged from Ethereum by X Layer itself. Legacy. Avoid for new projects.

---

## 5. ARCHITECTURE — HOW X LAYER WORKS

X Layer uses the OP Stack (Optimism) + AggLayer for cross-chain finality.

### Bridging L1 → X Layer (deposit)
```
User sends to L1 bridge contract
  → Bridge Service detects event on L1
    → Bridge Service sends L2 mint transaction via RPC
      → Sequencer includes tx in L2 block (1-second blocks)
        → User balance updated on X Layer
```

### Withdrawing X Layer → L1
```
User sends L2 withdrawal tx
  → Sequencer generates blocks
    → L2BridgeSyncer + L1InfoTreeSyncer persist data
      → aggsender prepares certificate
        → AggLayer receives certificate
          → agglayer-prover generates ZK proof
            → AggLayer submits proof + public inputs to L1
              → L1 verifies → FINALITY (7-day challenge window)
```

### Key properties to know
- L2 block time: **1 second** (use this when polling for tx confirmation)
- L1 finality for withdrawals: **7-day challenge period** (optimistic rollup)
- All L2 data published to L1: fully trustless, censorship-resistant
- EVM-equivalent: deploy any Solidity contract with zero changes

---

## 6. DEPLOYING WITH HARDHAT

### Setup
```bash
npm init -y
npm install --save-dev hardhat
npm install @nomicfoundation/hardhat-toolbox
npx hardhat   # choose "Create a JavaScript project"
```

### hardhat.config.js for X Layer
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    xlayer_testnet: {
      url: "https://testrpc.xlayer.tech/terigon",
      chainId: 1952,
      accounts: [process.env.PRIVATE_KEY]
    },
    xlayer_mainnet: {
      url: "https://rpc.xlayer.tech",
      chainId: 196,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Deploy command
```bash
# Testnet
npx hardhat run scripts/deploy.js --network xlayer_testnet

# Mainnet
npx hardhat run scripts/deploy.js --network xlayer_mainnet
```

### Deploy script template (for AGORA contracts)
```javascript
const hre = require("hardhat");

async function main() {
  const ContractFactory = await hre.ethers.getContractFactory("YourContract");
  const contract = await ContractFactory.deploy(/* constructor args */);
  await contract.deployed();
  console.log(`Deployed to: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 7. VERIFYING CONTRACTS (REQUIRED FOR HACKATHON)

Judges will check your verified contract on OKLink. Do this for every deployed contract.

### Method 1 — OKX Plugin (Recommended)
```bash
npm install @okxweb3/hardhat-explorer-verify
```

Add to `hardhat.config.js`:
```javascript
import '@okxweb3/hardhat-explorer-verify';

// inside module.exports:
okxweb3explorer: {
  apiKey: process.env.OKLINK_API_KEY,  // get free at oklink.com → My Account → API Management
}
```

Verify:
```bash
npx hardhat okverify --network xlayer_testnet <YOUR_CONTRACT_ADDRESS>
```

For proxy contracts:
```bash
npx hardhat okxverify --network xlayer_testnet --contract contracts/MyContract.sol:MyContract --proxy <PROXY_ADDRESS>
```

### Method 2 — Standard Hardhat etherscan plugin
```javascript
etherscan: {
  apiKey: process.env.OKLINK_API_KEY,
  customChains: [
    {
      network: "xlayer_testnet",
      chainId: 1952,
      urls: {
        apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER_TESTNET",
        browserURL: "https://www.oklink.com/xlayer-test"
      }
    },
    {
      network: "xlayer_mainnet",
      chainId: 196,
      urls: {
        apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER",
        browserURL: "https://www.oklink.com/xlayer"
      }
    }
  ]
}
```

Verify:
```bash
# Wait at least 1 minute after deploy, then:
npx hardhat verify --contract contracts/MyContract.sol:MyContract <ADDRESS> <CONSTRUCTOR_ARG1> --network xlayer_testnet
```

---

## 8. WEBSOCKET — REAL-TIME AGENT FEED

Use WebSocket for AGORA's live activity feed (agents hiring agents, swaps, x402 payments).

```javascript
// Subscribe to new blocks (trigger agent scanner)
ws.send(JSON.stringify({
  "id": 1,
  "method": "eth_subscribe",
  "params": ["newHeads"]
}));

// Subscribe to specific contract events (e.g., your SkillsMarketplace HireEvent)
ws.send(JSON.stringify({
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": [
    "logs",
    {
      "address": "YOUR_SKILLS_MARKETPLACE_CONTRACT",
      "topics": ["YOUR_HIRE_EVENT_TOPIC_HASH"]
    }
  ],
  "id": 2
}));

// Unsubscribe
ws.send(JSON.stringify({
  "id": 3,
  "method": "eth_unsubscribe",
  "params": ["SUBSCRIPTION_ID"]
}));
```

**Mainnet WSS:** `wss://xlayerws.okx.com` or `wss://ws.xlayer.tech`

---

## 9. VIEM / WAGMI FRONTEND SETUP

Use this for AGORA's React frontend when connecting user wallets.

### Install
```bash
npm install viem wagmi ox
```

### Chain definitions
```typescript
// chain.ts — copy this exactly
import { defineChain } from "viem";

export const xlayer = defineChain({
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xlayer.tech"] },
  },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/xlayer" },
  },
});

export const xlayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testrpc.xlayer.tech"] },
  },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/x-layer-testnet" },
  },
});
```

### Viem wallet client (with Builder Code attribution)
```typescript
// client.ts
import { createWalletClient, custom } from "viem";
import { Attribution } from "ox/erc8021";
import { xlayer } from "./chain";

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["YOUR-BUILDER-CODE"],  // get from web3.okx.com/onchainos/dev-portal
});

export const walletClient = createWalletClient({
  chain: xlayer,
  transport: custom(window.ethereum),
  dataSuffix: DATA_SUFFIX,  // auto-appended to every tx for attribution
});

// Send a transaction
const [account] = await walletClient.requestAddresses();
const hash = await walletClient.sendTransaction({
  account,
  to: "RECIPIENT_ADDRESS",
});
```

### Wagmi config (for React apps)
```typescript
// config.ts
import { Attribution } from "ox/erc8021";
import { createClient, custom } from "viem";
import { createConfig, createConnector, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { xlayer } from "./chain";

const DATA_SUFFIX = Attribution.toDataSuffix({ codes: ["YOUR-BUILDER-CODE"] });

function injectedWithAttribution() {
  const base = injected();
  return createConnector((config) => {
    const connector = base(config);
    return {
      ...connector,
      async getClient({ chainId } = {}) {
        const id = chainId ?? (await connector.getChainId());
        const chain = config.chains.find((c) => c.id === id);
        const provider = await connector.getProvider({ chainId: id });
        const [account] = await connector.getAccounts();
        return createClient({
          account, chain,
          dataSuffix: DATA_SUFFIX,
          transport: (opts) => custom(provider)({ ...opts, retryCount: 0 }),
        });
      },
    };
  });
}

export const wagmiConfig = createConfig({
  chains: [xlayer],
  connectors: [injectedWithAttribution()],
  transports: { [xlayer.id]: http() },
});
```

---

## 10. BUILDER CODE ATTRIBUTION (MANDATORY FOR HACKATHON POINTS)

Every transaction from AGORA should carry your Builder Code. This earns you attribution points with OKX and judges can verify it on-chain.

### Get your Builder Code
- **Testnet:** Connect wallet → call `registerAuto` on `0x00a3b805dbf39e5d54f9d09c130ff2132b4a0a21` on X Layer testnet
- **Mainnet:** Go to [web3.okx.com/onchainos/dev-portal](https://web3.okx.com/onchainos/dev-portal), verify address, create Builder Code

### How it works
The Builder Code is appended as `dataSuffix` to transaction calldata. It does not change contract behavior — it's just attribution metadata.

```typescript
// Per-transaction (if you need granular control)
import { Attribution } from "ox/erc8021";
const DATA_SUFFIX = Attribution.toDataSuffix({ codes: ["YOUR-BUILDER-CODE"] });

sendTransaction({
  to: SKILLS_MARKETPLACE_CONTRACT,
  dataSuffix: DATA_SUFFIX,
});
```

### Track attribution
Monitor your Builder Code stats at [web3.okx.com/onchainos/dev-portal](https://web3.okx.com/onchainos/dev-portal):
- Attributed transaction count
- New users acquired
- Conversion metrics

---

## 11. KEY JSON-RPC METHODS (USEFUL FOR AGENT CODE)

These are the RPC calls your agents will use most:

```javascript
// Get current block
eth_blockNumber

// Get account balance (OKB)
eth_getBalance

// Estimate gas before sending
eth_estimateGas

// Send signed transaction
eth_sendRawTransaction

// Poll for transaction receipt (check if tx mined)
eth_getTransactionReceipt

// Get logs (for reading contract events without WebSocket)
eth_getLogs

// Read contract state (no gas)
eth_call

// Get nonce for transaction ordering
eth_getTransactionCount
```

### Example: read contract state from agent
```javascript
const response = await fetch("https://testrpc.xlayer.tech/terigon", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{
      to: SKILLS_MARKETPLACE_CONTRACT,
      data: ENCODED_FUNCTION_CALL
    }, "latest"],
    id: 1
  })
});
const { result } = await response.json();
```

---

## 12. SELF-HOSTED RPC NODE (OPTIONAL — FOR HACKATHON DEMO)

If you want to show judges a self-hosted node setup:

```bash
# One-command setup (mainnet reth node)
curl -sSf https://raw.githubusercontent.com/okx/xlayer-toolkit/main/rpc-setup/one-click-setup.sh | bash
```

Default ports after setup:

| Service | Port | Use |
|---|---|---|
| HTTP RPC | 8545 | `http://localhost:8545` |
| WebSocket | 8546 | `ws://localhost:8546` |
| Engine API | 8552 | Internal |
| Op-Node RPC | 9545 | Consensus layer |

```bash
make status   # check if running
make stop     # stop (keeps data)
make run      # restart
docker compose logs -f  # view logs
```

---

## 13. AGORA-SPECIFIC IMPLEMENTATION CHECKLIST

Use this checklist when building. Check off each item before submitting.

### Contracts
- [ ] AgentRegistry deployed on X Layer (testnet first, then mainnet)
- [ ] SkillsMarketplace contract deployed — handles x402 USDC micropayments
- [ ] Each contract verified on OKLink via `npx hardhat okverify`
- [ ] Agentic Wallet created as project's on-chain identity
- [ ] All contracts use USDC `0x74b7F16337b8972027F6196A17a631aC6dE26d22` for payments

### Frontend
- [ ] Viem chain config uses Chain ID 196 (mainnet) / 1952 (testnet)
- [ ] Builder Code `dataSuffix` applied to all wallet client transactions
- [ ] XKO address display format used in UI (convert to EVM before any tx)
- [ ] WebSocket subscription active for live activity feed (`wss://xlayerws.okx.com`)

### README (mandatory for submission)
- [ ] Project intro
- [ ] Architecture overview diagram
- [ ] Deployed contract addresses (OKLink links)
- [ ] Onchain OS / Uniswap skill usage documented
- [ ] Working mechanics (earn-pay-earn loop)
- [ ] Team members listed
- [ ] X Layer ecosystem positioning statement

### Submission
- [ ] Code pushed to public GitHub repo
- [ ] Google Form submitted before April 15, 23:59 UTC
- [ ] Demo video 1–3 min uploaded to YouTube / Google Drive (bonus)
- [ ] X post with `#XLayerHackathon` and `#onchainos` (bonus)

---

## 14. USEFUL LINKS

| Resource | URL |
|---|---|
| X Layer Explorer (mainnet) | https://www.oklink.com/xlayer |
| X Layer Explorer (testnet) | https://www.oklink.com/xlayer-test |
| Testnet Faucet (OKB) | https://www.okx.com/xlayer/faucet |
| OKLink API Key | https://www.oklink.com → My Account → API Management |
| Builder Code Portal | https://web3.okx.com/onchainos/dev-portal |
| XLayer SDK (address utils) | https://github.com/okx/xlayer-sdk |
| XLayer Toolkit (RPC node) | https://github.com/okx/xlayer-toolkit |
| Hackathon Submission Form | Google Form (linked on hackathon page) |
| Hackathon Page | https://web3.okx.com/xlayer/build-x-hackathon |