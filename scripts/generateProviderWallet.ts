import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

function main() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  console.log("=".repeat(60));
  console.log("  NEW PROVIDER WALLET GENERATED");
  console.log("=".repeat(60));
  console.log(`  Address:     ${account.address}`);
  console.log(`  Private Key: ${privateKey}`);
  console.log("=".repeat(60));
  console.log("");
  console.log("⚠️  WARNING: Fund this wallet with OKB (for gas) and");
  console.log("   tUSDC (for skill registration) before use.");
  console.log("");
  console.log("Add to your .env file:");
  console.log(`  PROVIDER_PRIVATE_KEY=${privateKey}`);
  console.log("=".repeat(60));
}

main();
