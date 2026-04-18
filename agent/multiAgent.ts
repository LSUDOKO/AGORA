import { EventEmitter } from "events";
import { findYield, YieldOpportunity } from "./skills/yieldFinder";
import { auditPool, AuditResult } from "./skills/riskAuditor";
import { createDexRouter } from "../lib/agentConfig";
import { notificationService } from "../lib/notifications";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TelemetryEvent = {
  event: string;
  timestamp: number;
  data: Record<string, any>;
};

const MAX_TELEMETRY = 1000;

// Module-level telemetry store shared across all MonitorAgent instances
const telemetryStore: TelemetryEvent[] = [];

export function getTelemetry(): TelemetryEvent[] {
  return telemetryStore;
}

export function pushTelemetry(event: string, data: Record<string, any> = {}): TelemetryEvent {
  const timestamp = Date.now();
  
  // Basic normalization for JSON safety
  const normalizedData = JSON.parse(JSON.stringify(data, (_, v) => 
    typeof v === 'bigint' ? v.toString() : v
  ));

  const entry: TelemetryEvent = { event, timestamp, data: normalizedData };
  telemetryStore.push(entry);

  if (telemetryStore.length > MAX_TELEMETRY) {
    telemetryStore.splice(0, telemetryStore.length - MAX_TELEMETRY);
  }

  return entry;
}

// ─── YieldHunterAgent ────────────────────────────────────────────────────────

export class YieldHunterAgent {
  constructor(private readonly bus: EventEmitter) {}

  async scan(rpcUrl: string): Promise<void> {
    console.log("[YieldHunterAgent] Scanning for yield opportunities...");
    const opportunities = await findYield(rpcUrl);

    if (opportunities.length === 0) {
      console.log("[YieldHunterAgent] No opportunities found.");
      return;
    }

    // Emit the best opportunity (already sorted by estimatedAPY desc)
    const best = opportunities[0];
    console.log(`[YieldHunterAgent] Best opportunity: pool ${best.poolAddress} APY ${best.estimatedAPY}%`);
    this.bus.emit("opportunity:found", best, rpcUrl);
  }
}

// ─── RiskManagerAgent ────────────────────────────────────────────────────────

export class RiskManagerAgent {
  constructor(private readonly bus: EventEmitter) {
    this.bus.on("opportunity:found", this.onOpportunityFound.bind(this));
  }

  private async onOpportunityFound(opportunity: YieldOpportunity, rpcUrl: string): Promise<void> {
    console.log(`[RiskManagerAgent] Auditing pool ${opportunity.poolAddress}...`);
    const auditResult: AuditResult = await auditPool(opportunity.poolAddress, rpcUrl);

    if (auditResult.passed) {
      console.log(`[RiskManagerAgent] Pool approved (score: ${auditResult.score})`);
      this.bus.emit("opportunity:approved", opportunity, auditResult, rpcUrl);
    } else {
      console.log(`[RiskManagerAgent] Pool rejected (score: ${auditResult.score})`);
      this.bus.emit("opportunity:rejected", opportunity, auditResult);
    }
  }
}

// ─── ExecutionAgent ──────────────────────────────────────────────────────────

export class ExecutionAgent {
  constructor(private readonly bus: EventEmitter) {
    this.bus.on("opportunity:approved", this.onOpportunityApproved.bind(this));
  }

  private async onOpportunityApproved(
    opportunity: YieldOpportunity,
    auditResult: AuditResult,
    rpcUrl: string,
  ): Promise<void> {
    console.log(`[ExecutionAgent] Executing swap for pool ${opportunity.poolAddress}...`);

    const dryRun = process.env.UNISWAP_EXECUTE !== "true";
    if (dryRun) {
      console.log("[ExecutionAgent] Dry-run mode (set UNISWAP_EXECUTE=true to execute)");
    }

    try {
      // Note: Uniswap API doesn't support X Layer (chain 1952) yet
      console.log("[ExecutionAgent] Note: Uniswap API doesn't support X Layer (chain 1952)");
      console.log("[ExecutionAgent] Simulating swap for demonstration purposes");
      console.log(`[ExecutionAgent] Token In: ${opportunity.token0}`);
      console.log(`[ExecutionAgent] Token Out: ${opportunity.token1}`);
      console.log(`[ExecutionAgent] Amount: ${opportunity.amount.toString()}`);
      console.log(`[ExecutionAgent] Pool: ${opportunity.poolAddress}`);
      console.log(`[ExecutionAgent] Expected APY: ${opportunity.apy}%`);
      
      // Simulate successful execution
      const result = { 
        opportunity, 
        quoteResult: { quote: "simulated", outputAmount: "0" }, 
        swapResult: null, 
        dryRun: true,
        simulated: true 
      };
      this.bus.emit("swap:completed", result);
    } catch (err) {
      console.error("[ExecutionAgent] Swap failed:", err);
      this.bus.emit("swap:completed", { opportunity, error: String(err), dryRun: true });
    }
  }
}

// ─── MonitorAgent ────────────────────────────────────────────────────────────

export class MonitorAgent {
  constructor(private readonly bus: EventEmitter) {
    const events = [
      "opportunity:found",
      "opportunity:approved",
      "opportunity:rejected",
      "swap:completed",
    ] as const;

    for (const event of events) {
      this.bus.on(event, (...args: any[]) => this.record(event, args));
    }
  }

  private record(event: string, args: any[]): void {
    const data = this.serializeArgs(args);
    const timestamp = Date.now();

    const entry: TelemetryEvent = { event, timestamp, data };

    telemetryStore.push(entry);

    // Keep store bounded at MAX_TELEMETRY entries
    if (telemetryStore.length > MAX_TELEMETRY) {
      telemetryStore.splice(0, telemetryStore.length - MAX_TELEMETRY);
    }

    console.log(`[MonitorAgent] Recorded event: ${event} (total: ${telemetryStore.length})`);

    // Fire notifications for key events
    if (event === "swap:completed" || event === "opportunity:rejected") {
      const notifType = event === "swap:completed" ? "swap:completed" : "risk:rejected";
      notificationService
        .send({ type: notifType, timestamp, data })
        .catch((err) => console.error("[MonitorAgent] Notification error:", err));
    }
  }

  private serializeArgs(args: any[]): Record<string, any> {
    try {
      // Convert BigInt values to strings for JSON compatibility
      return JSON.parse(
        JSON.stringify(args, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value,
        ),
      );
    } catch {
      return { raw: String(args) };
    }
  }
}

// ─── AgentOrchestrator ───────────────────────────────────────────────────────

export class AgentOrchestrator {
  readonly bus: EventEmitter;
  readonly yieldHunter: YieldHunterAgent;
  readonly riskManager: RiskManagerAgent;
  readonly executionAgent: ExecutionAgent;
  readonly monitorAgent: MonitorAgent;

  constructor() {
    this.bus = new EventEmitter();
    // Increase max listeners to avoid Node.js warnings with multiple agents
    this.bus.setMaxListeners(20);

    // Agents wire themselves up in their constructors
    this.yieldHunter = new YieldHunterAgent(this.bus);
    this.riskManager = new RiskManagerAgent(this.bus);
    this.executionAgent = new ExecutionAgent(this.bus);
    this.monitorAgent = new MonitorAgent(this.bus);
  }

  async start(rpcUrl: string): Promise<void> {
    console.log("[AgentOrchestrator] Starting multi-agent system...");
    await this.yieldHunter.scan(rpcUrl);
  }
}
