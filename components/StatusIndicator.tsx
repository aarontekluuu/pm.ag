"use client";

import { useAppState } from "@/app/context";

export function StatusIndicator() {
  const { autoRefresh } = useAppState();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider
        border backdrop-blur-sm transition-all
        ${
          autoRefresh
            ? "bg-terminal-accent/10 border-terminal-accent/30 text-terminal-accent"
            : "bg-terminal-surface/80 border-terminal-border text-terminal-dim"
        }
      `}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            autoRefresh ? "bg-terminal-accent animate-pulse" : "bg-terminal-muted"
          }`}
        />
        {autoRefresh ? "LIVE" : "PAUSED"}
      </div>
    </div>
  );
}

