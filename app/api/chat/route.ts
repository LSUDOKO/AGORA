import { NextRequest, NextResponse } from "next/server";
import { findYield } from "../../../agent/skills/yieldFinder";
import { getProfitLoss } from "../../../agent/skills/portfolioTracker";
import { auditPool } from "../../../agent/skills/riskAuditor";
import { getTelemetry } from "../../../agent/multiAgent";

// Module-level config
const agentConfig = { riskThreshold: 65 };

// Conversation history (last 20 messages)
const conversationHistory: { role: "user" | "assistant"; content: string; timestamp: number }[] = [];

export function getHistory() {
  return conversationHistory;
}

function addToHistory(role: "user" | "assistant", content: string) {
  conversationHistory.push({ role, content, timestamp: Date.now() });
  if (conversationHistory.length > 20) conversationHistory.shift();
}

async function buildOpenAIResponse(userMessage: string, data: unknown, structuredReply: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return structuredReply;

  const messages = [
    {
      role: "system",
      content:
        "You are an AI assistant for AGORA, an on-chain agent economy platform. " +
        "Respond concisely and helpfully about DeFi operations, yield opportunities, and portfolio management. " +
        "When given structured data, summarize it in natural language.",
    },
    ...conversationHistory.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user",
      content: `${userMessage}\n\nAgent data: ${JSON.stringify(data)}`,
    },
  ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: "gpt-3.5-turbo", messages, max_tokens: 300 }),
    });

    if (!res.ok) return structuredReply;
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? structuredReply;
  } catch {
    return structuredReply;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    addToHistory("user", message);

    const lower = message.toLowerCase();
    let reply = "";
    let data: unknown = undefined;

    // Intent: find opportunities / yield / scan
    if (lower.includes("find opportunities") || lower.includes("yield") || lower.includes("scan")) {
      const rpcUrl = process.env.RPC_URL || "https://testrpc.xlayer.tech";
      const opportunities = await findYield(rpcUrl);
      data = opportunities;
      const structuredReply =
        opportunities.length > 0
          ? `Found ${opportunities.length} yield opportunity(ies):\n` +
            opportunities
              .map((o) => `• Pool ${o.poolAddress.slice(0, 10)}… — APY: ${o.estimatedAPY}%`)
              .join("\n")
          : "No yield opportunities found at this time.";
      reply = await buildOpenAIResponse(message, data, structuredReply);
    }

    // Intent: check portfolio / portfolio / balance
    else if (lower.includes("check portfolio") || lower.includes("portfolio") || lower.includes("balance")) {
      const pl = getProfitLoss();
      data = { profitLoss: pl };
      const structuredReply = `Portfolio P&L: ${pl >= 0 ? "+" : ""}${pl.toFixed(4)} USD`;
      reply = await buildOpenAIResponse(message, data, structuredReply);
    }

    // Intent: audit <address>
    else if (lower.includes("audit")) {
      const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
      if (!addressMatch) {
        reply = "Please provide a pool address to audit. Example: audit 0x1234...";
        data = null;
      } else {
        const rpcUrl = process.env.RPC_URL || "https://testrpc.xlayer.tech";
        const result = await auditPool(addressMatch[0], rpcUrl);
        data = result;
        const structuredReply =
          `Audit result for ${addressMatch[0].slice(0, 10)}…:\n` +
          `• Score: ${result.score}/100\n` +
          `• Status: ${result.passed ? "✅ PASSED" : "❌ FAILED"}\n` +
          `• Reasons: ${result.reasons.slice(0, 3).join("; ")}`;
        reply = await buildOpenAIResponse(message, data, structuredReply);
      }
    }

    // Intent: set risk <number>
    else if (lower.includes("set risk")) {
      const numMatch = message.match(/\d+(\.\d+)?/);
      if (!numMatch) {
        reply = "Please provide a number. Example: set risk 70";
        data = null;
      } else {
        const value = parseFloat(numMatch[0]);
        agentConfig.riskThreshold = value;
        data = { riskThreshold: value };
        reply = `Risk threshold updated to ${value}.`;
      }
    }

    // Intent: status / help
    else if (lower.includes("status") || lower.includes("help")) {
      const telemetry = getTelemetry();
      data = {
        riskThreshold: agentConfig.riskThreshold,
        totalEvents: telemetry.length,
        latestEvent: telemetry[telemetry.length - 1] ?? null,
      };
      const structuredReply =
        `AGORA Agent Status:\n` +
        `• Risk threshold: ${agentConfig.riskThreshold}\n` +
        `• Total events recorded: ${telemetry.length}\n` +
        `• Commands: "find opportunities", "check portfolio", "audit <address>", "set risk <number>", "status"`;
      reply = await buildOpenAIResponse(message, data, structuredReply);
    }

    // Fallback
    else {
      reply = `I didn't understand that. Try: "find opportunities", "check portfolio", "audit 0x...", "set risk 70", or "status".`;
      data = null;
    }

    addToHistory("assistant", reply);

    return NextResponse.json({ reply, data });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
