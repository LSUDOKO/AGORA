import { config as loadEnv } from "dotenv";
import { formatUnits } from "viem";
import { UniswapExecutionService } from "../lib/uniswapExecution";

loadEnv();

async function main() {
  const service = new UniswapExecutionService();
  const env = service.getEnvironment();

  console.log(`--- Uniswap Testnet Verification (${env.chainId === 1952 ? "X Layer Testnet" : "Unsupported"}) ---`);
  console.log(`Account: ${env.accountAddress}`);
  console.log(`RPC: ${env.rpcUrl}`);
  console.log(`Token In: ${env.tokenIn}`);
  console.log(`Token Out: ${env.tokenOut}`);
  console.log(`Amount In: ${formatUnits(env.amountIn, env.amountInDecimals)}`);
  console.log(`Pool Fee: ${env.fee}`);
  console.log(`Mode: ${env.mode}`);
  console.log(`Execution Enabled: ${env.execute}`);

  const prepared = await service.prepareSwap();

  console.log("\nStep 1: Balance and approval check");
  console.log(`Token In Balance: ${prepared.formattedTokenInBalance}`);
  console.log(prepared.approval ? "Approval Transaction: required" : "Approval Transaction: not required");

  console.log("\nStep 2: Quote received");
  console.log(`Quoted Amount Out: ${prepared.quoteAmountOut}`);
  console.log(`Minimum Amount Out: ${prepared.minAmountOut.toString()}`);

  console.log("\nStep 3: Swap transaction prepared");
  console.log(`Target: ${prepared.swapTarget}`);
  console.log(`Call Data Bytes: ${prepared.swapCalldata.length / 2 - 1}`);
  console.log(`Value: 0`);

  if (env.execute) {
    console.log("\nStep 4: Broadcasting approval/swap transactions");
    const receipt = await service.executePreparedSwap(prepared);
    console.log(`Swap confirmed in block ${receipt.blockNumber}`);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
  } else {
    console.log("\nDry run complete. Set UNISWAP_EXECUTE=true only when you want to broadcast on-chain.");
  }
}

main().catch((error) => {
  console.error("Verification FAILED:", error);
  process.exitCode = 1;
});
