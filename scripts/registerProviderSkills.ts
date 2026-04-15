import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xlayerTestnet } from "../lib/chain";
import { addresses, skillsRegistryAbi } from "../lib/contracts";

// Skills to register: name, description, priceUSDC (in 6-decimal units)
const SKILLS = [
  {
    name: "Risk Auditor",
    description: "Audits DeFi pools for risk using Onchain OS data",
    priceUSDC: 500000n, // 0.5 USDC
  },
  {
    name: "Yield Finder",
    description: "Scans for yield opportunities across protocols",
    priceUSDC: 300000n, // 0.3 USDC
  },
  {
    name: "Gas Optimizer",
    description: "Monitors gas prices and recommends optimal execution times",
    priceUSDC: 100000n, // 0.1 USDC
  },
  {
    name: "Liquidity Monitor",
    description: "Tracks pool liquidity and alerts on significant changes",
    priceUSDC: 200000n, // 0.2 USDC
  },
];

async function main() {
  const providerPrivateKey = process.env.PROVIDER_PRIVATE_KEY as `0x${string}` | undefined;
  if (!providerPrivateKey) {
    throw new Error(
      "PROVIDER_PRIVATE_KEY is not set. Run `npx ts-node scripts/generateProviderWallet.ts` to generate one."
    );
  }

  const account = privateKeyToAccount(providerPrivateKey);

  const publicClient = createPublicClient({
    chain: xlayerTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: xlayerTestnet,
    transport: http(),
  });

  console.log("=".repeat(60));
  console.log("  REGISTERING PROVIDER SKILLS");
  console.log("=".repeat(60));
  console.log(`  Provider:        ${account.address}`);
  console.log(`  SkillsRegistry:  ${addresses.skillsRegistry}`);
  console.log("=".repeat(60));

  for (const skill of SKILLS) {
    console.log(`\nRegistering "${skill.name}" @ ${Number(skill.priceUSDC) / 1e6} USDC...`);

    try {
      const hash = await walletClient.writeContract({
        address: addresses.skillsRegistry,
        abi: skillsRegistryAbi,
        functionName: "registerSkill",
        args: [skill.name, skill.description, skill.priceUSDC],
      });

      console.log(`  Tx submitted: ${hash}`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`  ✅ Confirmed in block ${receipt.blockNumber}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Failed: ${message}`);
    }
  }

  // Print final skill count
  const skillCount = await publicClient.readContract({
    address: addresses.skillsRegistry,
    abi: skillsRegistryAbi,
    functionName: "skillCount",
  });

  console.log(`\nTotal skills registered on-chain: ${skillCount}`);
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
