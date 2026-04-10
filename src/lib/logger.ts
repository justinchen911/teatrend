import fs from "node:fs";
import path from "node:path";

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  traceId: string;
  message: string;
  [key: string]: unknown;
}

let traceIdCounter = 0;

function generateTraceId(): string {
  return `${Date.now().toString(36)}-${(traceIdCounter++).toString(36)}`;
}

function getCurrentTraceId(): string {
  return generateTraceId();
}

const LOG_DIR = path.resolve(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

// Ensure log directory exists
try {
  fs.mkdirSync(LOG_DIR, { recursive: true });
} catch {
  // ignore
}

function writeToFile(entry: string) {
  try {
    fs.appendFileSync(LOG_FILE, entry + "\n", "utf-8");
  } catch {
    // silently fail if file not writable (e.g. in edge runtime)
  }
}

function formatEntry(level: LogLevel, traceId: string, message: string, meta?: Record<string, unknown>): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    traceId,
    message,
    ...meta,
  };
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const traceId = getCurrentTraceId();
  const entry = formatEntry(level, traceId, message, meta);

  // stdout
  if (level === "error") {
    console.error(entry);
  } else if (level === "warn") {
    console.warn(entry);
  } else {
    console.log(entry);
  }

  // file
  writeToFile(entry);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),

  /**
   * Create a child logger with a fixed traceId for request tracing
   */
  child(traceId: string) {
    return {
      debug: (message: string, meta?: Record<string, unknown>) => {
        const entry = formatEntry("debug", traceId, message, meta);
        console.log(entry);
        writeToFile(entry);
      },
      info: (message: string, meta?: Record<string, unknown>) => {
        const entry = formatEntry("info", traceId, message, meta);
        console.log(entry);
        writeToFile(entry);
      },
      warn: (message: string, meta?: Record<string, unknown>) => {
        const entry = formatEntry("warn", traceId, message, meta);
        console.warn(entry);
        writeToFile(entry);
      },
      error: (message: string, meta?: Record<string, unknown>) => {
        const entry = formatEntry("error", traceId, message, meta);
        console.error(entry);
        writeToFile(entry);
      },
    };
  },
};
