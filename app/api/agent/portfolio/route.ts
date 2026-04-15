import { NextResponse } from "next/server";
import { getProfitLoss, getSnapshots } from "../../../../agent/skills/portfolioTracker";

export async function GET() {
  try {
    const profitLoss = getProfitLoss();
    const snapshots = getSnapshots();
    return NextResponse.json({ profitLoss, snapshots });
  } catch (error) {
    console.error("Portfolio route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
