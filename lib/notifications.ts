// ─── Notification System ─────────────────────────────────────────────────────

export type NotificationEventType =
  | "swap:completed"
  | "opportunity:found"
  | "risk:rejected"
  | "rebalance:triggered"
  | "gas:spike";

export interface NotificationEvent {
  type: NotificationEventType;
  timestamp: number;
  agentId?: string;
  data: Record<string, any>;
}

const MAX_LOG_SIZE = 500;
const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

// ─── NotificationService ──────────────────────────────────────────────────────

export class NotificationService {
  private readonly webhookUrl?: string;
  private readonly eventLog: NotificationEvent[] = [];

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl;
  }

  async send(event: NotificationEvent): Promise<void> {
    // Always record to in-memory log
    this.eventLog.push(event);
    if (this.eventLog.length > MAX_LOG_SIZE) {
      this.eventLog.splice(0, this.eventLog.length - MAX_LOG_SIZE);
    }

    if (!this.webhookUrl) return;

    const body = JSON.stringify(event);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(this.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        if (res.ok) return;

        console.warn(
          `[NotificationService] Webhook returned ${res.status} on attempt ${attempt}/${MAX_RETRIES}`,
        );
      } catch (err) {
        console.warn(
          `[NotificationService] Webhook error on attempt ${attempt}/${MAX_RETRIES}:`,
          err,
        );
      }

      if (attempt < MAX_RETRIES) {
        const delay = BACKOFF_MS[attempt - 1];
        console.log(`[NotificationService] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    console.error(
      `[NotificationService] Failed to deliver webhook after ${MAX_RETRIES} attempts for event: ${event.type}`,
    );
  }

  getLog(): NotificationEvent[] {
    return this.eventLog;
  }
}

// ─── Module-level singleton ───────────────────────────────────────────────────

export const notificationService = new NotificationService(
  process.env.WEBHOOK_URL,
);
