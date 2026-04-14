import { config } from "dotenv";
import { createPublicClient, formatEther, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xlayerTestnet } from "../frontend/lib/chain";

config();

async function main() {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const client = createPublicClient({
    chain: xlayerTestnet,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL),
  });

  const balance = await client.getBalance({ address: account.address });
  console.log(`Account: ${account.address}`);
  console.log(`Balance: ${formatEther(balance)} OKB`);
}

main().catch(console.error);
