/**
 * Property tests for NotificationService.
 *
 * **Validates: Requirements 11.1, 11.5**
 *
 * Property: For any sequence of send() calls where the webhook always fails,
 * the retry count per event never exceeds 3.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { NotificationService, type NotificationEvent, type NotificationEventType } from "./notifications";

// Speed up tests by replacing setTimeout with an immediate resolver
vi.mock("./notifications", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./notifications")>();
  return mod;
});

describe("NotificationService – retry count property", () => {
  beforeEach(() => {
    // Replace global setTimeout so backoff delays don't slow tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const eventTypeArb = fc.constantFrom<NotificationEventType>(
    "swap:completed",
    "opportunity:found",
    "risk:rejected",
    "rebalance:triggered",
    "gas:spike",
  );

  const eventArb = fc.record<NotificationEvent>({
    type: eventTypeArb,
    timestamp: fc.integer({ min: 0, max: Date.now() }),
    agentId: fc.option(fc.hexaString({ minLength: 1, maxLength: 10 }), { nil: undefined }),
    data: fc.constant({}),
  });

  it("fetch is called at most MAX_RETRIES (3) times per event when webhook always fails", async () => {
    await fc.assert(
      fc.asyncProperty(eventArb, async (event) => {
        let callCount = 0;

        // Mock fetch to always fail
        const fetchMock = vi.fn().mockImplementation(() => {
          callCount++;
          return Promise.resolve({ ok: false, status: 500 });
        });
        vi.stubGlobal("fetch", fetchMock);

        const service = new NotificationService("https://example.com/webhook");

        // Run send and advance all timers to skip backoff delays
        const sendPromise = service.send(event);
        await vi.runAllTimersAsync();
        await sendPromise;

        expect(callCount).toBeLessThanOrEqual(3);
        expect(callCount).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 30 },
    );
  });

  it("fetch is called at most 3 times when webhook throws network errors", async () => {
    await fc.assert(
      fc.asyncProperty(eventArb, async (event) => {
        let callCount = 0;

        const fetchMock = vi.fn().mockImplementation(() => {
          callCount++;
          return Promise.reject(new Error("Network error"));
        });
        vi.stubGlobal("fetch", fetchMock);

        const service = new NotificationService("https://example.com/webhook");

        const sendPromise = service.send(event);
        await vi.runAllTimersAsync();
        await sendPromise;

        expect(callCount).toBeLessThanOrEqual(3);
        expect(callCount).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 30 },
    );
  });

  it("event is always added to the in-memory log regardless of webhook outcome", async () => {
    await fc.assert(
      fc.asyncProperty(eventArb, async (event) => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

        const service = new NotificationService("https://example.com/webhook");

        const sendPromise = service.send(event);
        await vi.runAllTimersAsync();
        await sendPromise;

        const log = service.getLog();
        expect(log.length).toBeGreaterThanOrEqual(1);
        expect(log[log.length - 1].type).toBe(event.type);
      }),
      { numRuns: 20 },
    );
  });

  it("no fetch calls are made when no webhook URL is configured", async () => {
    await fc.assert(
      fc.asyncProperty(eventArb, async (event) => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const service = new NotificationService(); // no URL
        await service.send(event);

        expect(fetchMock).not.toHaveBeenCalled();
      }),
      { numRuns: 20 },
    );
  });
});
