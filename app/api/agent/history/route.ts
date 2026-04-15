import { NextRequest, NextResponse } from "next/server";
import { getTelemetry } from "../../../../agent/multiAgent";

function deriveStatus(event: string): string {
  if (event === "swap:completed") return "completed";
  if (event === "opportunity:rejected") return "failed";
  return "completed";
}

function matchesType(event: string, type: string): boolean {
  if (type === "all" || !type) return true;
  if (type === "swap") return event.startsWith("swap");
  if (type === "audit") return event.startsWith("opportunity");
  if (type === "hire") return event.startsWith("hire");
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type") ?? "all";
    const status = searchParams.get("status") ?? "all";
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

    const events = getTelemetry();

    const filtered = events
      .filter((e) => matchesType(e.event, type))
      .map((e) => ({ ...e, status: deriveStatus(e.event) }))
      .filter((e) => status === "all" || e.status === status)
      .slice(-limit)
      .reverse();

    return NextResponse.json({ events: filtered, total: filtered.length });
  } catch (error) {
    console.error("History route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
