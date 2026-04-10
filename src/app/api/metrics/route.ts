import { NextResponse } from "next/server";

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = (Date.now() - startTime) / 1000;
  const now = new Date().toISOString();

  const metrics = [
    // Counter
    `# HELP http_requests_total Total number of HTTP requests`,
    `# TYPE http_requests_total counter`,
    `http_requests_total{method="get",endpoint="/api/metrics"} 1`,

    // Histogram
    `# HELP http_request_duration_seconds HTTP request duration in seconds`,
    `# TYPE http_request_duration_seconds histogram`,
    `http_request_duration_seconds_bucket{le="0.005"} 0`,
    `http_request_duration_seconds_bucket{le="0.01"} 0`,
    `http_request_duration_seconds_bucket{le="0.025"} 0`,
    `http_request_duration_seconds_bucket{le="0.05"} 0`,
    `http_request_duration_seconds_bucket{le="0.1"} 0`,
    `http_request_duration_seconds_bucket{le="0.25"} 0`,
    `http_request_duration_seconds_bucket{le="0.5"} 0`,
    `http_request_duration_seconds_bucket{le="1"} 0`,
    `http_request_duration_seconds_bucket{le="2.5"} 0`,
    `http_request_duration_seconds_bucket{le="5"} 0`,
    `http_request_duration_seconds_bucket{le="10"} 0`,
    `http_request_duration_seconds_bucket{le="+Inf"} 0`,
    `http_request_duration_seconds_sum 0`,
    `http_request_duration_seconds_count 0`,

    // Gauge
    `# HELP process_uptime_seconds Process uptime in seconds`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${uptimeSeconds.toFixed(3)}`,
  ].join("\n");

  return new NextResponse(metrics, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
