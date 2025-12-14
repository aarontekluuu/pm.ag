"use client";

import type { MarketEdge } from "@/types";

interface MarketCardProps {
  market: MarketEdge;
}

export function MarketCard({ market }: MarketCardProps) {
  const hasEdge = market.edge > 0;
  const edgePercent = market.edge * 100;
  const edgeColor =
    edgePercent >= 3
      ? "text-terminal-accent"
      : edgePercent >= 1
        ? "text-terminal-warn"
        : "text-terminal-dim";

  const formatPrice = (price: number) => `${(price * 100).toFixed(1)}¢`;
  const formatVolume = (vol: number) => {
    if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
    if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };
  const formatEdge = (edge: number) => `${(edge * 100).toFixed(2)}%`;

  return (
    <div
      className={`
      relative bg-terminal-surface border rounded-lg overflow-hidden
      transition-all duration-200 hover:border-terminal-muted group
      ${hasEdge ? "border-terminal-accent/30 edge-glow" : "border-terminal-border"}
    `}
    >
      {/* Edge Badge */}
      {hasEdge && (
        <div className="absolute top-0 right-0">
          <div
            className={`
            px-2 py-1 text-[10px] font-bold tracking-wider
            bg-terminal-accent/20 ${edgeColor} rounded-bl
          `}
          >
            +{formatEdge(market.edge)} EDGE
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-terminal-text leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {market.marketTitle}
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-border text-terminal-dim uppercase tracking-wider">
            #{market.marketId}
          </span>
          <span className="text-[10px] text-terminal-dim">
            24h: {formatVolume(market.volume24h)}
          </span>
        </div>
      </div>

      {/* Price Grid */}
      <div className="border-t border-terminal-border">
        <div className="grid grid-cols-2 divide-x divide-terminal-border">
          {/* YES */}
          <div className="p-3 text-center">
            <div className="text-[10px] text-terminal-dim mb-1 tracking-wider">
              YES
            </div>
            <div className="text-lg font-semibold text-terminal-accent">
              {formatPrice(market.yes.price)}
            </div>
          </div>

          {/* NO */}
          <div className="p-3 text-center">
            <div className="text-[10px] text-terminal-dim mb-1 tracking-wider">
              NO
            </div>
            <div className="text-lg font-semibold text-terminal-danger">
              {formatPrice(market.no.price)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-terminal-border px-4 py-2 flex items-center justify-between bg-terminal-bg/50">
        <div className="flex items-center gap-3">
          <div className="text-[10px]">
            <span className="text-terminal-dim">SUM: </span>
            <span
              className={
                market.sum !== 1
                  ? "text-terminal-warn font-medium"
                  : "text-terminal-text"
              }
            >
              {(market.sum * 100).toFixed(1)}¢
            </span>
          </div>
        </div>
        {hasEdge && (
          <div
            className={`text-xs font-bold ${edgeColor} flex items-center gap-1`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {formatEdge(market.edge)}
          </div>
        )}
      </div>
    </div>
  );
}
