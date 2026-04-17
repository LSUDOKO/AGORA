import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xLayerTestnet } from "viem/chains";

const testUsdcAbi = parseAbi([
  "function mint(address to, uint256 amount) external"
]);

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
    if (!privateKey) {
      return NextResponse.json({ error: "Server missing PRIVATE_KEY" }, { status: 500 });
    }

    const testUsdcAddress = process.env.NEXT_PUBLIC_TEST_USDC as `0x${string}`;
    if (!testUsdcAddress) {
      return NextResponse.json({ error: "Server missing NEXT_PUBLIC_TEST_USDC address" }, { status: 500 });
    }

    const account = privateKeyToAccount(privateKey);
    const transport = http(process.env.NEXT_PUBLIC_RPC_URL || "https://xlayertestrpc.okx.com");
    
    const client = createWalletClient({
      account,
      chain: xLayerTestnet,
      transport,
    });
    
    const publicClient = createPublicClient({
      chain: xLayerTestnet,
      transport,
    });

    const amountToMint = parseUnits("1000", 6); // Mint 1000 tUSDC

    // Call mint function on TestUSDC (onlyOwner)
    const { request } = await publicClient.simulateContract({
      account,
      address: testUsdcAddress,
      abi: testUsdcAbi,
      functionName: "mint",
      args: [address as `0x${string}`, amountToMint],
    });

    const hash = await client.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({ success: true, hash, amount: "1000" });
  } catch (error) {
    console.error("Faucet error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error processing faucet request" },
      { status: 500 }
    );
  }
}
