import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { ACTIVE_CHAIN } from "../../../../lib/chain";
import { skillsRegistryAbi, addresses } from "../../../../lib/contracts";

const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ACTIVE_CHAIN.rpcUrls.default.http[0]),
});

export async function GET() {
  try {
    // Get total skill count first
    const count = await publicClient.readContract({
      address: addresses.skillsRegistry,
      abi: skillsRegistryAbi,
      functionName: "skillCount",
    });

    const total = Number(count || 0);
    const skills = [];

    // Iterate through each skill using getSkill (which exists on the deployed contract)
    for (let i = 1; i <= total; i++) {
      try {
        const [provider, name, priceUSDC, totalHires] = (await publicClient.readContract({
          address: addresses.skillsRegistry,
          abi: skillsRegistryAbi,
          functionName: "getSkill",
          args: [BigInt(i)],
        })) as [string, string, bigint, bigint];

        skills.push({
          name,
          usageCount: Number(totalHires),
          successRate: Number(totalHires) > 0 ? 0.95 : 0,
        });
      } catch {
        // skip invalid skill IDs
      }
    }

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Skills route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
