import type { LogEntry, Logger } from "@/types/solver";

export function createLogger(): Logger {
  const entries: LogEntry[] = [];
  const push = (type: LogEntry["type"], content: unknown) =>
    entries.push({ type, content });

  return {
    entries,
    text: (msg: string) => push("text", msg),
    info: (msg: string) => push("info", msg),
    success: (msg: string) => push("success", msg),
    warn: (msg: string) => push("warn", msg),
    error: (msg: string) => push("error", msg),
    step: (msg: string) => push("step", msg),
    formula: (msg: string) => push("formula", msg),
    result: (msg: string) => push("result", msg),
    section: (msg: string) => push("section", msg),
    separator: () => push("separator", null),
    table: (data: Record<string, unknown>[]) => push("table", data),
  };
}
