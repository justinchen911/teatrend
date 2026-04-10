import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("logger", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should output JSON formatted log for info level", async () => {
    const { logger } = await import("@/lib/logger");
    logger.info("test message");

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const output = consoleLogSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed).toHaveProperty("timestamp");
    expect(parsed).toHaveProperty("level", "info");
    expect(parsed).toHaveProperty("traceId");
    expect(parsed).toHaveProperty("message", "test message");
  });

  it("should output JSON formatted log for error level", async () => {
    const { logger } = await import("@/lib/logger");
    logger.error("error message");

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const output = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("error message");
  });

  it("should output JSON formatted log for warn level", async () => {
    const { logger } = await import("@/lib/logger");
    logger.warn("warn message");

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const output = consoleWarnSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.level).toBe("warn");
    expect(parsed.message).toBe("warn message");
  });

  it("should include meta fields in log entry", async () => {
    const { logger } = await import("@/lib/logger");
    logger.info("with meta", { userId: 123, action: "login" });

    const output = consoleLogSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.userId).toBe(123);
    expect(parsed.action).toBe("login");
  });

  it("should have valid ISO timestamp", async () => {
    const { logger } = await import("@/lib/logger");
    logger.info("timestamp test");

    const output = consoleLogSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
  });

  describe("logger.child()", () => {
    it("should create child logger with fixed traceId", async () => {
      const { logger } = await import("@/lib/logger");
      const childLogger = logger.child("my-trace-id-123");

      childLogger.info("child message");

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.traceId).toBe("my-trace-id-123");
      expect(parsed.message).toBe("child message");
    });

    it("child logger should use the same traceId for multiple calls", async () => {
      const { logger } = await import("@/lib/logger");
      const childLogger = logger.child("fixed-trace");

      childLogger.info("first");
      childLogger.info("second");

      const first = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      const second = JSON.parse(consoleLogSpy.mock.calls[1][0]);

      expect(first.traceId).toBe("fixed-trace");
      expect(second.traceId).toBe("fixed-trace");
    });

    it("child logger error should use console.error", async () => {
      const { logger } = await import("@/lib/logger");
      const childLogger = logger.child("err-trace");

      childLogger.error("child error");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe("error");
      expect(parsed.traceId).toBe("err-trace");
    });

    it("child logger warn should use console.warn", async () => {
      const { logger } = await import("@/lib/logger");
      const childLogger = logger.child("warn-trace");

      childLogger.warn("child warn");

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const output = consoleWarnSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe("warn");
    });
  });
});
