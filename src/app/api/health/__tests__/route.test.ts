import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("should return 200 status", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("should return JSON with status ok and timestamp", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("timestamp");
    // Verify timestamp is valid ISO string
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  it("should return a recent timestamp (within last 5 seconds)", async () => {
    const before = Date.now();
    const response = await GET();
    const after = Date.now();
    const data = await response.json();

    const responseTime = new Date(data.timestamp).getTime();
    expect(responseTime).toBeGreaterThanOrEqual(before - 1000);
    expect(responseTime).toBeLessThanOrEqual(after + 1000);
  });
});
