import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/metrics/route";

describe("GET /api/metrics", () => {
  it("should return 200 status", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("should return content-type text/plain with Prometheus version", async () => {
    const response = await GET();
    const contentType = response.headers.get("Content-Type");

    expect(contentType).toContain("text/plain");
    expect(contentType).toContain("version=0.0.4");
  });

  it("should return Prometheus format text with HELP and TYPE annotations", async () => {
    const response = await GET();
    const text = await response.text();

    // Prometheus exposition format requires # HELP and # TYPE lines
    expect(text).toContain("# HELP");
    expect(text).toContain("# TYPE");

    // Check for expected metrics
    expect(text).toContain("http_requests_total");
    expect(text).toContain("http_request_duration_seconds");
    expect(text).toContain("process_uptime_seconds");
  });

  it("should include counter metric type", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("# TYPE http_requests_total counter");
  });

  it("should include histogram metric type", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("# TYPE http_request_duration_seconds histogram");
  });

  it("should include gauge metric type", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("# TYPE process_uptime_seconds gauge");
  });

  it("should have numeric value for process_uptime_seconds", async () => {
    const response = await GET();
    const text = await response.text();

    // Extract the gauge value
    const match = text.match(/process_uptime_seconds (\d+\.?\d*)/);
    expect(match).not.toBeNull();
    const value = parseFloat(match![1]);
    expect(value).toBeGreaterThanOrEqual(0);
  });

  it("should include cache-control no-cache header", async () => {
    const response = await GET();
    const cacheControl = response.headers.get("Cache-Control");

    expect(cacheControl).toContain("no-cache");
  });
});
