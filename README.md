# AGORA

AGORA is a Next.js + viem project targeting X Layer, with agent workflows and a real Uniswap Trading API execution path.

## Uniswap Testnet Flow

The repo now supports a real X Layer testnet verification flow that:

1. Reads wallet and chain config from `.env`
2. Checks ERC-20 balance and allowance
3. Requests a live Uniswap Trading API quote
4. Builds the executable swap transaction
5. Broadcasts only when `UNISWAP_EXECUTE=true`

Default mode is a dry run, so it does not spend funds.

Important: Uniswap Trading API supports X Layer mainnet (`196`), but not X Layer testnet (`1952`). If you keep the app on `1952`, the verifier will fail fast with that exact reason instead of attempting a broken quote flow.

## Required Environment

Copy `.env.example` into `.env` and set:

- `PRIVATE_KEY`
- `UNISWAP_API_KEY`
- `NEXT_PUBLIC_CHAIN_ID=1952`
- `NEXT_PUBLIC_RPC_URL=https://testrpc.xlayer.tech/terigon`

For live Uniswap Trading API verification on X Layer, use chain `196`.

Optional overrides:

- `UNISWAP_TOKEN_IN`
- `UNISWAP_TOKEN_OUT`
- `UNISWAP_AMOUNT_IN`
- `UNISWAP_TOKEN_IN_DECIMALS`
- `UNISWAP_SLIPPAGE_TOLERANCE`
- `UNISWAP_PROTOCOLS`
- `UNISWAP_ROUTING_PREFERENCE`
- `UNISWAP_EXECUTE`

## Commands

```bash
npm run uniswap:verify
npm run uniswap:execute
npm run agent:run
```

`npm run uniswap:verify` uses the live Uniswap Trading API and X Layer RPC, but stays in dry-run mode unless `UNISWAP_EXECUTE=true`.

## Notes

- X Layer testnet is chain ID `1952`.
- The Prime Agent now continues to work for Uniswap execution even if AGORA contract deployment addresses are still empty.
- If contract addresses are later deployed into `deployments/addresses.json`, bookkeeping and payment flows will resume automatically.
