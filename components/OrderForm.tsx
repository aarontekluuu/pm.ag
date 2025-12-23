"use client";

import { useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import type { MarketEdge } from "@/lib/types";

interface OrderFormProps {
  market: MarketEdge;
  onOrderPlaced?: () => void;
  onCancel?: () => void;
}

export function OrderForm({ market, onOrderPlaced, onCancel }: OrderFormProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate fee (0.5% of amount, minimum $0.5)
  const amountNum = parseFloat(amount) || 0;
  const feePercent = 0.005; // 0.5%
  const calculatedFee = amountNum * feePercent;
  const minFee = 0.5;
  const actualFee = Math.max(calculatedFee, minFee);
  const totalCost = amountNum + actualFee;

  const handlePlaceOrder = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    if (amountNum < 5) {
      setError("Minimum order amount is $5");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Create EIP712 domain and types
      // NOTE: These values need to match Opinion.trade's actual EIP712 structure
      // This is a placeholder - actual values need to be obtained from CLOB SDK docs
      const domain = {
        name: "Opinion Exchange",
        version: "1",
        chainId: chainId || 56, // BNB Chain mainnet
        verifyingContract: "0x0000000000000000000000000000000000000000" as `0x${string}`, // TODO: Get actual Opinion contract address
      };

      const types = {
        Order: [
          { name: "marketId", type: "uint256" },
          { name: "side", type: "bool" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "expiry", type: "uint256" },
        ],
      };

      const nonce = Date.now();
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry

      const message = {
        marketId: BigInt(market.marketId),
        side: side === "yes",
        amount: BigInt(Math.floor(amountNum * 1e18)), // Convert to wei (18 decimals)
        nonce: BigInt(nonce),
        expiry: BigInt(expiry),
      };

      // 2. Sign with wallet using EIP712
      if (!walletClient || !address) {
        throw new Error("Wallet not connected");
      }

      // Note: EIP712 signing structure needs to match Opinion.trade's actual format
      // This is a placeholder - actual domain/types need to be obtained from CLOB SDK docs
      const signature = await walletClient.signTypedData({
        domain,
        types: types as any,
        primaryType: "Order",
        message: message as any,
      });

      // 3. Submit to our API
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketId: market.marketId,
          side,
          amount: message.amount.toString(),
          signature,
          nonce,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Order failed");
      }

      // Success!
      setSuccess(true);
      onOrderPlaced?.();
      
      // Reset form after delay
      setTimeout(() => {
        setAmount("");
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Market Info */}
      <div className="bg-terminal-bg border border-terminal-border rounded-lg p-4">
        <div className="text-xs text-terminal-dim mb-1">MARKET</div>
        <div className="text-sm text-terminal-text line-clamp-2">{market.marketTitle}</div>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div>
            <span className="text-terminal-dim">YES: </span>
            <span className="text-terminal-accent">{(market.yes.price * 100).toFixed(1)}¢</span>
          </div>
          <div>
            <span className="text-terminal-dim">NO: </span>
            <span className="text-terminal-danger">{(market.no.price * 100).toFixed(1)}¢</span>
          </div>
        </div>
      </div>

      {/* Side Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setSide("yes")}
          disabled={loading}
          className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
            side === "yes"
              ? "bg-terminal-accent/20 border-terminal-accent text-terminal-accent"
              : "bg-terminal-bg border-terminal-border text-terminal-dim hover:text-terminal-text hover:border-terminal-muted"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          YES
        </button>
        <button
          onClick={() => setSide("no")}
          disabled={loading}
          className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
            side === "no"
              ? "bg-terminal-danger/20 border-terminal-danger text-terminal-danger"
              : "bg-terminal-bg border-terminal-border text-terminal-dim hover:text-terminal-text hover:border-terminal-muted"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          NO
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label className="text-xs text-terminal-dim mb-1 block">ORDER AMOUNT ($)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="5"
          step="0.01"
          disabled={loading}
          className="w-full px-4 py-3 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text font-mono focus:outline-none focus:border-terminal-accent disabled:opacity-50"
          placeholder="5.00"
        />
        <div className="text-[10px] text-terminal-dim mt-1">
          Minimum: $5.00
        </div>
      </div>

      {/* Fee Calculation */}
      {amountNum > 0 && (
        <div className="bg-terminal-bg border border-terminal-border rounded-lg p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-terminal-dim">Order Amount:</span>
            <span className="text-terminal-text font-mono">{formatCurrency(amountNum)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-dim">Platform Fee (0.5%):</span>
            <span className="text-terminal-text font-mono">{formatCurrency(actualFee)}</span>
          </div>
          <div className="flex justify-between border-t border-terminal-border pt-2 font-medium">
            <span className="text-terminal-dim">Total Cost:</span>
            <span className="text-terminal-accent font-mono">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-terminal-danger/10 border border-terminal-danger/30 rounded-lg p-3 text-xs text-terminal-danger">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-terminal-accent/10 border border-terminal-accent/30 rounded-lg p-3 text-xs text-terminal-accent">
          ✓ Order placed successfully! Check your portfolio for updates.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 bg-terminal-bg border border-terminal-border text-terminal-dim rounded-lg hover:text-terminal-text hover:border-terminal-muted transition-colors disabled:opacity-50"
          >
            CANCEL
          </button>
        )}
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !isConnected || amountNum < 5}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            loading || !isConnected || amountNum < 5
              ? "bg-terminal-border text-terminal-dim cursor-not-allowed"
              : "bg-terminal-accent text-terminal-bg hover:bg-terminal-accent/90"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              PLACING ORDER...
            </span>
          ) : !isConnected ? (
            "CONNECT WALLET"
          ) : (
            "PLACE ORDER"
          )}
        </button>
      </div>

      {/* Info */}
      <div className="text-[10px] text-terminal-dim text-center">
        Order will be executed on Opinion.trade. You'll be prompted to sign with your wallet.
      </div>
    </div>
  );
}

