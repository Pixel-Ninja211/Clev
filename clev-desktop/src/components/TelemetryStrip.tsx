// ============================================================
// TelemetryStrip — REAL OS hardware metrics via Tauri `sysinfo`
// (replaces the old simulated web telemetry panels).
// Polls the Rust command `get_hardware_metrics` every 3 seconds.
// ============================================================
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { HardwareMetrics } from "../types";

const fmtUp = (s: number) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
};

function Bar({ label, pct, value, accent }: { label: string; pct: number; value: string; accent: string }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between text-[9px] opacity-70 mb-0.5">
        <span>{label}</span><span className="tabular-nums">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%`, background: accent, boxShadow: `0 0 6px ${accent}` }} />
      </div>
    </div>
  );
}

export default function TelemetryStrip({ hackerMode }: { hackerMode: boolean }) {
  const [m, setM] = useState<HardwareMetrics | null>(null);
  const accent = hackerMode ? "#22c55e" : "#22d3ee";

  useEffect(() => {
    let alive = true;
    const pull = () =>
      invoke<HardwareMetrics>("get_hardware_metrics")
        .then((r) => alive && setM(r))
        .catch(() => {/* running in plain browser dev — strip just stays empty */});
    pull();
    const id = setInterval(pull, 3000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (!m) return <div className="h-8" />;

  const memPct = (m.mem_used_gb / Math.max(0.1, m.mem_total_gb)) * 100;
  const diskPct = (m.disk_used_gb / Math.max(0.1, m.disk_total_gb)) * 100;

  return (
    <div className="flex gap-3 px-3 py-2 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md text-white/85 w-full" style={{ fontFamily: "ui-monospace, monospace" }}>
      <Bar label={`CPU·${m.core_count}`} pct={m.cpu_percent} value={`${m.cpu_percent.toFixed(0)}%`} accent={accent} />
      <Bar label="RAM" pct={memPct} value={`${m.mem_used_gb.toFixed(1)}/${m.mem_total_gb.toFixed(0)}G`} accent="#a78bfa" />
      <Bar label="DISK" pct={diskPct} value={`${m.disk_used_gb.toFixed(0)}/${m.disk_total_gb.toFixed(0)}G`} accent="#f472b6" />
      <div className="flex flex-col justify-center text-[9px] opacity-70 whitespace-nowrap">
        <span>UP</span><span className="tabular-nums">{fmtUp(m.uptime_secs)}</span>
      </div>
    </div>
  );
}
