"use client";

import { useState, useRef, useEffect } from "react";
import { useAppState } from "@/app/context";

const MOCK_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

const SUPPORTED_CHAINS = [
  { name: "BNB Chain", platform: "Opinion.trade", color: "terminal-warn" },
  { name: "Polygon", platform: "Polymarket", color: "terminal-purple" },
  { name: "Solana", platform: "Kalshi", color: "terminal-cyan" },
];

export function ConnectWallet() {
  const { isConnected, setIsConnected, walletAddress, setWalletAddress } =
    useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = () => {
    // Mock connection for MVP
    setIsConnected(true);
    setWalletAddress(MOCK_ADDRESS);
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium
          border transition-all
          ${
            isConnected
              ? "border-terminal-accent/50 bg-terminal-accent/10 text-terminal-accent hover:bg-terminal-accent/20"
              : "border-terminal-border bg-terminal-surface text-terminal-dim hover:text-terminal-text hover:border-terminal-muted"
          }
        `}
      >
        {isConnected && walletAddress ? (
          <>
            <span className="w-2 h-2 rounded-full bg-terminal-accent" />
            <span className="font-mono">{truncateAddress(walletAddress)}</span>
          </>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="hidden sm:inline">CONNECT</span>
          </>
        )}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-terminal-surface border border-terminal-border rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-terminal-border bg-terminal-bg/50">
            <div className="text-xs font-medium text-terminal-text mb-1">
              MULTICHAIN WALLET
            </div>
            <div className="text-[10px] text-terminal-dim">
              Connect to trade across platforms
            </div>
          </div>

          {/* Supported Chains */}
          <div className="px-4 py-3 border-b border-terminal-border">
            <div className="text-[10px] text-terminal-dim tracking-wider uppercase mb-2">
              SUPPORTED CHAINS
            </div>
            <div className="space-y-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <div
                  key={chain.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${chain.color}`} />
                    <span className="text-terminal-text">{chain.name}</span>
                  </div>
                  <span className="text-terminal-dim">{chain.platform}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {!isConnected ? (
            <div className="p-3 space-y-2">
              <button
                onClick={handleConnect}
                className="w-full px-4 py-3 text-left text-xs bg-terminal-accent/10 border border-terminal-accent/30 rounded-lg hover:bg-terminal-accent/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terminal-warn animate-pulse" />
                    <span className="text-terminal-text font-medium">
                      Connect Wallet
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-terminal-warn/20 text-terminal-warn rounded">
                    COMING SOON
                  </span>
                </div>
                <div className="text-[10px] text-terminal-dim mt-1 ml-4">
                  BNB + Polygon + Solana
                </div>
              </button>
              <p className="text-[10px] text-terminal-dim text-center px-2">
                Wallet integration in development. Click to preview mock connection.
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-terminal-border">
                <div className="text-[10px] text-terminal-dim mb-1">
                  CONNECTED WALLET
                </div>
                <div className="text-xs text-terminal-text font-mono">
                  {walletAddress ? truncateAddress(walletAddress) : ""}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[9px] px-1.5 py-0.5 bg-terminal-accent/20 text-terminal-accent rounded">
                    MOCK
                  </span>
                  <span className="text-[10px] text-terminal-dim">
                    Real wallet integration coming soon
                  </span>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-3 text-left text-xs text-terminal-danger hover:bg-terminal-danger/10 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Disconnect
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
