"use client";

const MOCK_TRADES = [
  {
    id: 1,
    market: "Will Bitcoin exceed $100K by end of 2025?",
    platform: "Opinion.trade",
    side: "YES",
    price: 0.62,
    quantity: 100,
    value: 62.0,
    pnl: 8.50,
    pnlPercent: 13.7,
    timestamp: "2025-01-14T10:30:00Z",
  },
  {
    id: 2,
    market: "US Federal Reserve rate cut in Q1 2025?",
    platform: "Opinion.trade",
    side: "NO",
    price: 0.71,
    quantity: 50,
    value: 35.5,
    pnl: -2.25,
    pnlPercent: -6.3,
    timestamp: "2025-01-13T15:45:00Z",
  },
  {
    id: 3,
    market: "SpaceX Starship successful orbital flight by March?",
    platform: "Opinion.trade",
    side: "YES",
    price: 0.45,
    quantity: 200,
    value: 90.0,
    pnl: 22.00,
    pnlPercent: 24.4,
    timestamp: "2025-01-12T09:15:00Z",
  },
  {
    id: 4,
    market: "Apple announces AR glasses at WWDC 2025?",
    platform: "Opinion.trade",
    side: "NO",
    price: 0.82,
    quantity: 75,
    value: 61.5,
    pnl: 5.25,
    pnlPercent: 8.5,
    timestamp: "2025-01-11T14:20:00Z",
  },
  {
    id: 5,
    market: "ChatGPT-5 release before July 2025?",
    platform: "Opinion.trade",
    side: "YES",
    price: 0.38,
    quantity: 150,
    value: 57.0,
    pnl: -4.50,
    pnlPercent: -7.9,
    timestamp: "2025-01-10T11:00:00Z",
  },
];

const PORTFOLIO_VALUE = 306.0;
const TOTAL_PNL = 29.0;
const TOTAL_PNL_PERCENT = 9.5;

export default function PortfolioPage() {
  const formatDate = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-terminal-text flex items-center gap-2">
          <span className="text-terminal-purple">&gt;</span>
          PORTFOLIO
          <span className="cursor-blink" />
        </h1>
        <p className="text-sm text-terminal-dim mt-1">
          Track your positions and performance across all platforms
        </p>
      </div>

      {/* Portfolio Value Card */}
      <div className="bg-terminal-surface border border-terminal-accent/30 rounded-lg p-8 mb-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-[10px] text-terminal-dim tracking-wider uppercase mb-2">
            TOTAL PORTFOLIO VALUE
          </div>
          <div className="text-5xl font-bold text-terminal-text mb-4">
            ${PORTFOLIO_VALUE.toFixed(2)}
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              TOTAL_PNL >= 0
                ? "bg-terminal-accent/10 text-terminal-accent"
                : "bg-terminal-danger/10 text-terminal-danger"
            }`}
          >
            <span className="text-lg font-semibold">
              {TOTAL_PNL >= 0 ? "+" : ""}${TOTAL_PNL.toFixed(2)}
            </span>
            <span className="text-sm">
              ({TOTAL_PNL_PERCENT >= 0 ? "+" : ""}{TOTAL_PNL_PERCENT.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-terminal-border">
          <div className="text-center">
            <div className="text-[10px] text-terminal-dim tracking-wider uppercase mb-1">
              POSITIONS
            </div>
            <div className="text-2xl font-semibold text-terminal-text">
              {MOCK_TRADES.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-terminal-dim tracking-wider uppercase mb-1">
              WINNING
            </div>
            <div className="text-2xl font-semibold text-terminal-accent">
              {MOCK_TRADES.filter((t) => t.pnl > 0).length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-terminal-dim tracking-wider uppercase mb-1">
              LOSING
            </div>
            <div className="text-2xl font-semibold text-terminal-danger">
              {MOCK_TRADES.filter((t) => t.pnl < 0).length}
            </div>
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div className="bg-terminal-surface border border-terminal-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-terminal-border">
          <h2 className="text-sm font-medium text-terminal-text flex items-center gap-2">
            <span className="text-terminal-accent">&gt;</span>
            OPEN POSITIONS
          </h2>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-terminal-bg/50 text-[10px] text-terminal-dim tracking-wider uppercase border-b border-terminal-border">
          <div className="col-span-4">Market</div>
          <div className="col-span-1 text-center">Side</div>
          <div className="col-span-1 text-right">Price</div>
          <div className="col-span-1 text-right">Qty</div>
          <div className="col-span-2 text-right">Value</div>
          <div className="col-span-2 text-right">P&L</div>
          <div className="col-span-1 text-right">Date</div>
        </div>

        {/* Trades */}
        <div className="divide-y divide-terminal-border">
          {MOCK_TRADES.map((trade) => (
            <div
              key={trade.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-terminal-border/30 transition-colors"
            >
              {/* Market */}
              <div className="col-span-4">
                <div className="text-sm text-terminal-text line-clamp-1">
                  {trade.market}
                </div>
                <div className="text-[10px] text-terminal-dim mt-0.5">
                  {trade.platform}
                </div>
              </div>

              {/* Side */}
              <div className="col-span-1 flex items-center justify-center">
                <span
                  className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                    trade.side === "YES"
                      ? "bg-terminal-accent/20 text-terminal-accent"
                      : "bg-terminal-danger/20 text-terminal-danger"
                  }`}
                >
                  {trade.side}
                </span>
              </div>

              {/* Price */}
              <div className="col-span-1 text-right text-sm text-terminal-text">
                {(trade.price * 100).toFixed(0)}¢
              </div>

              {/* Quantity */}
              <div className="col-span-1 text-right text-sm text-terminal-dim">
                {trade.quantity}
              </div>

              {/* Value */}
              <div className="col-span-2 text-right text-sm text-terminal-text">
                ${trade.value.toFixed(2)}
              </div>

              {/* P&L */}
              <div className="col-span-2 text-right">
                <div
                  className={`text-sm font-medium ${
                    trade.pnl >= 0 ? "text-terminal-accent" : "text-terminal-danger"
                  }`}
                >
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                </div>
                <div
                  className={`text-[10px] ${
                    trade.pnl >= 0 ? "text-terminal-accent/70" : "text-terminal-danger/70"
                  }`}
                >
                  {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
                </div>
              </div>

              {/* Date */}
              <div className="col-span-1 text-right text-[10px] text-terminal-dim">
                {formatDate(trade.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Data Notice */}
      <div className="mt-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-warn/10 border border-terminal-warn/30 rounded text-xs text-terminal-warn">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          DISPLAYING MOCK DATA — CONNECT WALLET TO VIEW REAL POSITIONS
        </span>
      </div>
    </div>
  );
}

