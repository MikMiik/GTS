"use client";

import { type LogEntry } from "@/types/solver";

interface LogOutputProps {
  entries: LogEntry[];
}

export default function LogOutput({ entries }: LogOutputProps) {
  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔬</div>
        <p>
          Nhập tham số và nhấn <strong>▶ Chạy</strong> để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <>
      {entries.map((entry, idx) => {
        const delay = `${Math.min(idx * 8, 200)}ms`;

        if (entry.type === "separator") {
          return <hr key={idx} className="log-separator" />;
        }

        if (entry.type === "section") {
          return (
            <div key={idx} className="log-section">
              ▸ {entry.content as string}
            </div>
          );
        }

        if (entry.type === "table") {
          const data = entry.content as Record<string, unknown>[];
          if (!data || data.length === 0) return null;
          const headers = Object.keys(data[0]);
          return (
            <div
              key={idx}
              className="log-entry"
              style={{ animationDelay: delay }}
            >
              <div className="log-table-wrapper">
                <table className="log-table">
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, ri) => (
                      <tr key={ri}>
                        {headers.map((h) => (
                          <td
                            key={h}
                            style={
                              typeof row[h] === "string" &&
                              (row[h] as string).includes("\n")
                                ? { whiteSpace: "pre" }
                                : undefined
                            }
                          >
                            {row[h] !== null && row[h] !== undefined
                              ? String(row[h])
                              : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        const classMap: Record<string, string> = {
          text: "log-text",
          info: "log-info",
          success: "log-success",
          warn: "log-warn",
          error: "log-error-text",
          step: "log-step",
          formula: "log-formula",
          result: "log-result",
        };

        return (
          <div
            key={idx}
            className={`log-entry ${classMap[entry.type] || "log-text"}`}
            style={{
              animationDelay: delay,
              whiteSpace:
                typeof entry.content === "string" &&
                (entry.content as string).includes("\n")
                  ? "pre"
                  : undefined,
            }}
          >
            {entry.content as string}
          </div>
        );
      })}
    </>
  );
}
