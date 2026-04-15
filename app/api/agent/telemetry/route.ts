import { NextResponse } from "next/server";
import { getTelemetry } from "../../../../agent/multiAgent";

function buildTimeSeries(events: ReturnType<typeof getTelemetry>) {
  // Group last 50 events by minute
  const last50 = events.slice(-50);
  const buckets: Record<string, { events: number; swaps: number }> = {};

  for (const e of last50) {
    const d = new Date(e.timestamp);
    const key = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { events: 0, swaps: 0 };
    buckets[key].events += 1;
    if (e.event === "swap:completed") buckets[key].swaps += 1;
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, counts]) => ({ time, ...counts }));
}

export async function GET() {
  try {
    const events = getTelemetry();
    const timeSeries = buildTimeSeries(events);

    return NextResponse.json({
      timeSeries,
      total: events.length,
      latest: events.slice(-10),
    });
  } catch (error) {
    console.error("Telemetry error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
