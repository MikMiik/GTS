"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ALGORITHM_CONFIG, SIDEBAR_SECTIONS } from "@/lib/algorithm-config";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (group: string, method: string) => {
    return pathname.includes(`/${group}/${method}`);
  };

  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
      aria-label="Algorithm Navigation"
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">∑</span>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">GTS</span>
              <span className="sidebar-logo-sub">Giải Tích Số</span>
            </div>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? "→" : "☰"}
        </button>
      </div>

      {/* Navigation sections */}
      <nav className="sidebar-nav">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.group} className="sidebar-section">
            {!collapsed && (
              <div className="sidebar-section-label">{section.label}</div>
            )}
            <ul className="algo-list" role="list">
              {section.methods.map((method) => {
                const cfg = ALGORITHM_CONFIG[method];
                const active = isActive(section.group, method);
                return (
                  <li key={method}>
                    <Link
                      href={`/${section.group}/${method}`}
                      className={`algo-btn ${active ? "algo-btn--active" : ""}`}
                      title={collapsed ? cfg.title : undefined}
                    >
                      <span className="algo-icon">{cfg.icon}</span>
                      {!collapsed && (
                        <div className="algo-info">
                          <span className="algo-name">{cfg.title.replace("Phương Pháp ", "")}</span>
                          <span className="algo-desc">{cfg.subtitle.split("—")[0].trim()}</span>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
