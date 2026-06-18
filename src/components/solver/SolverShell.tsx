"use client";

import { useState, useCallback, useRef } from "react";
import type { AlgorithmKey, LogEntry } from "@/types/solver";
import { ALGORITHM_CONFIG } from "@/lib/algorithm-config";
import { createLogger } from "@/lib/algorithms/logger";
import LogOutput from "@/components/solver/LogOutput";
import AlgorithmForm from "@/components/solver/AlgorithmForm";

interface SolverShellProps {
  method: AlgorithmKey;
}

export default function SolverShell({ method }: SolverShellProps) {
  const cfg = ALGORITHM_CONFIG[method];
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleRun = useCallback(
    (params: Record<string, string>) => {
      setIsRunning(true);
      setTimeout(() => {
        try {
          // Parse numeric epsilon/tol fields
          const parsed = { ...params };
          for (const k of ["epsilon", "tol"]) {
            if (parsed[k] !== undefined) {
              const v = parseFloat(parsed[k]);
              if (!isNaN(v)) parsed[k] = String(v);
            }
          }
          const logger = createLogger();
          cfg.run(parsed, logger);
          setLogEntries(logger.entries);
          if (outputRef.current) outputRef.current.scrollTop = 0;
        } catch (err) {
          const logger = createLogger();
          logger.error("Lỗi không xác định: " + (err as Error).message);
          setLogEntries(logger.entries);
        } finally {
          setIsRunning(false);
        }
      }, 20);
    },
    [cfg],
  );

  const handleClear = useCallback(() => {
    setLogEntries([]);
  }, []);

  return (
    <div className="solver-shell">
      {/* Topbar */}
      <header className="solver-topbar">
        <div className="topbar-left">
          <h1 className="page-title">{cfg.title}</h1>
          <span className="page-subtitle">{cfg.subtitle}</span>
        </div>
        <div className="topbar-right">
          <button
            className="btn-clear"
            onClick={handleClear}
            title="Xóa output"
          >
            🗑 Xóa
          </button>
          <button
            className={`btn-run ${isRunning ? "btn-run--loading" : ""}`}
            disabled={isRunning}
            title="Chạy thuật toán"
            onClick={() => {
              // Triggered via form submit from AlgorithmForm
              document
                .getElementById("solver-form")
                ?.dispatchEvent(
                  new Event("submit", { bubbles: true, cancelable: true }),
                );
            }}
          >
            {isRunning ? "⏳ Đang chạy..." : "▶ Chạy"}
          </button>
        </div>
      </header>

      {/* Panels */}
      <div className="solver-panels">
        {/* Input Panel */}
        <section className="panel panel-input" aria-label="Input">
          <div className="panel-header">
            <span className="panel-icon">📥</span>
            <h2>Input</h2>
          </div>
          <div className="panel-body">
            <AlgorithmForm
              method={method}
              defaultValues={cfg.defaultValues}
              onSubmit={handleRun}
            />{" "}
          </div>
        </section>

        {/* Output Panel */}
        <section className="panel panel-output" aria-label="Output">
          <div className="panel-header">
            <span className="panel-icon">📤</span>
            <h2>Output</h2>{" "}
          </div>
          <div className="panel-body log-container" ref={outputRef}>
            <LogOutput entries={logEntries} />
          </div>
        </section>
      </div>
    </div>
  );
}
