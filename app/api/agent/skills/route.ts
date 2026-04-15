import { NextResponse } from "next/server";
import { getTelemetry } from "../../../../agent/multiAgent";

export async function GET() {
  try {
    const events = getTelemetry();

    // Derive skill stats from opportunity:approved vs opportunity:rejected events
    let approved = 0;
    let rejected = 0;
    let swaps = 0;

    for (const e of events) {
      if (e.event === "opportunity:approved") approved++;
      else if (e.event === "opportunity:rejected") rejected++;
      else if (e.event === "swap:completed") swaps++;
    }

    const total = approved + rejected;
    const skills = [
      {
        name: "RiskAuditor",
        usageCount: total,
        successRate: total > 0 ? approved / total : 0,
      },
      {
        name: "YieldFinder",
        usageCount: approved + rejected,
        successRate: total > 0 ? approved / total : 0,
      },
      {
        name: "ExecutionAgent",
        usageCount: swaps,
        successRate: approved > 0 ? swaps / approved : 0,
      },
    ].filter((s) => s.usageCount > 0);

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Skills route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
