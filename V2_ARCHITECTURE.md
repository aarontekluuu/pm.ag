# v2.0 Architecture: Smart Contracts & Fee System

## Executive Summary

**Goal:** Enable users to execute trades on Opinion.trade through our platform while collecting fees and tracking all activity.

**Key Decisions:**
- **Fee Collection**: Smart contract proxy/router (most decentralized)
- **Order Execution**: Backend API using Opinion CLOB SDK (simpler to start)
- **Data Storage**: Hybrid (on-chain events + off-chain database)
- **Frontend**: EIP712 signing with wagmi hooks

---

## Opinion.trade Integration

### How Opinion.trade Works

1. **OpenAPI** (Current): Read-only market data
2. **CLOB SDK** (Python): Trading with EIP712 signing
3. **Smart Contracts**: On BNB Chain for execution
4. **Fee Model**: 0-2% taker fees, makers free, $5 min order, $0.5 min fee

### Can We Create Orders on External Sites?

**Yes, with these approaches:**

#### Approach 1: Backend Proxy (Recommended for MVP)
```
User → Our Frontend → Our API → Opinion CLOB SDK → Opinion Contracts
                          ↓
                    Fee Collection
                          ↓
                    Our Contract (records trade)
```

**Pros:**
- Simpler implementation
- Can use Python CLOB SDK directly
- Easier error handling
- Faster to ship

**Cons:**
- Less decentralized
- Requires backend service
- Single point of failure

#### Approach 2: Direct Contract Integration (Future)
```
User → Frontend (EIP712 sign) → Our Contract → Opinion Contracts
                                    ↓
                              Fee Collection
```

**Pros:**
- Fully decentralized
- No backend needed
- More transparent

**Cons:**
- Need to reverse-engineer EIP712 structure
- More complex
- Harder to handle errors

**Recommendation:** Start with Approach 1, migrate to Approach 2 later.

---

## Smart Contract Architecture

### Contract 1: TradeRouter

**Purpose:** Route trades to Opinion contracts + collect fees

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOpinionExchange {
    function executeOrder(
        uint256 marketId,
        bool side,
        uint256 amount,
        bytes calldata signature
    ) external returns (bool);
}

contract TradeRouter {
    address public immutable opinionExchange;
    address public feeWallet;
    uint256 public feeBasisPoints; // 50 = 0.5%
    uint256 public tradeCounter;
    
    struct Trade {
        address user;
        uint256 marketId;
        bool side; // true = YES, false = NO
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        bool executed;
    }
    
    mapping(address => uint256[]) public userTrades;
    mapping(uint256 => Trade) public trades;
    
    event TradeExecuted(
        uint256 indexed tradeId,
        address indexed user,
        uint256 marketId,
        bool side,
        uint256 amount,
        uint256 fee
    );
    
    event FeeCollected(
        address indexed user,
        uint256 amount
    );
    
    constructor(address _opinionExchange, address _feeWallet, uint256 _feeBasisPoints) {
        opinionExchange = _opinionExchange;
        feeWallet = _feeWallet;
        feeBasisPoints = _feeBasisPoints;
    }
    
    function executeTrade(
        uint256 marketId,
        bool side,
        uint256 amount,
        bytes calldata signature
    ) external returns (uint256 tradeId) {
        require(amount >= 5e18, "Minimum order $5"); // $5 in wei (assuming 18 decimals)
        
        // Calculate fee (0.5% default)
        uint256 fee = (amount * feeBasisPoints) / 10000;
        require(fee >= 5e17, "Minimum fee $0.5"); // $0.5 minimum
        
        uint256 amountAfterFee = amount - fee;
        
        // Execute trade on Opinion
        bool success = IOpinionExchange(opinionExchange).executeOrder(
            marketId,
            side,
            amountAfterFee,
            signature
        );
        
        require(success, "Trade execution failed");
        
        // Record trade
        tradeId = ++tradeCounter;
        trades[tradeId] = Trade({
            user: msg.sender,
            marketId: marketId,
            side: side,
            amount: amount,
            fee: fee,
            timestamp: block.timestamp,
            executed: true
        });
        
        userTrades[msg.sender].push(tradeId);
        
        // Transfer fee to fee wallet
        (bool feeSent, ) = feeWallet.call{value: fee}("");
        require(feeSent, "Fee transfer failed");
        
        emit TradeExecuted(tradeId, msg.sender, marketId, side, amount, fee);
        emit FeeCollected(msg.sender, fee);
        
        return tradeId;
    }
    
    function getUserTrades(address user) external view returns (uint256[] memory) {
        return userTrades[user];
    }
    
    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }
}
```

### Contract 2: FeeTracker (Optional - can combine with TradeRouter)

**Purpose:** Aggregate fee statistics

```solidity
contract FeeTracker {
    mapping(address => uint256) public feesByUser;
    uint256 public totalFeesCollected;
    uint256 public totalTrades;
    
    event FeeRecorded(address indexed user, uint256 amount);
    
    function recordFee(address user, uint256 amount) external {
        feesByUser[user] += amount;
        totalFeesCollected += amount;
        totalTrades++;
        emit FeeRecorded(user, amount);
    }
    
    function getUserFeeTotal(address user) external view returns (uint256) {
        return feesByUser[user];
    }
}
```

---

## Backend Implementation

### File: `lib/opinionCLOB.ts`

```typescript
/**
 * Opinion CLOB SDK Wrapper
 * 
 * This wraps the Python CLOB SDK functionality in TypeScript.
 * In production, this would call a Python service or use a Node.js SDK.
 */

import "server-only";

export interface OpinionOrder {
  marketId: number;
  side: "yes" | "no";
  amount: string; // In wei or token units
  price?: string; // For limit orders
  signature: string; // EIP712 signature
}

export interface OpinionOrderResponse {
  success: boolean;
  orderId?: string;
  txHash?: string;
  error?: string;
}

/**
 * Execute order using Opinion CLOB SDK
 * 
 * In production, this would:
 * 1. Call Python service that uses CLOB SDK
 * 2. Or use a Node.js wrapper if available
 * 3. Submit signed order to Opinion API
 */
export async function executeOpinionOrder(
  order: OpinionOrder,
  apiKey: string
): Promise<OpinionOrderResponse> {
  // TODO: Implement actual CLOB SDK integration
  // For now, this is a placeholder
  
  const baseUrl = process.env.OPINION_OPENAPI_BASE_URL;
  if (!baseUrl) {
    throw new Error("OPINION_OPENAPI_BASE_URL not configured");
  }
  
  // This endpoint may not exist - need to check CLOB SDK docs
  const response = await fetch(`${baseUrl}/order/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      market_id: order.marketId,
      side: order.side,
      amount: order.amount,
      signature: order.signature,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    return {
      success: false,
      error: error.message || "Order execution failed",
    };
  }
  
  const data = await response.json();
  return {
    success: true,
    orderId: data.order_id,
    txHash: data.tx_hash,
  };
}
```

### File: `app/api/trades/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { executeOpinionOrder } from "@/lib/opinionCLOB";
import { getClientIdentifier, apiRateLimiter } from "@/lib/rateLimit";
import { getCorsHeaders, addSecurityHeaders } from "@/lib/security";

/**
 * POST /api/trades
 * 
 * Execute a trade on Opinion.trade
 * 
 * Body:
 * {
 *   marketId: number,
 *   side: "yes" | "no",
 *   amount: string, // In wei
 *   signature: string // EIP712 signature
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    if (!apiRateLimiter.isAllowed(clientId)) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", message: "Too many requests" },
        { status: 429, headers: getCorsHeaders() }
      );
    }
    
    const body = await request.json();
    const { marketId, side, amount, signature } = body;
    
    // Validate input
    if (!marketId || !side || !amount || !signature) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Missing required fields" },
        { status: 400, headers: getCorsHeaders() }
      );
    }
    
    // Get API key
    const apiKey = process.env.OPINION_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API_NOT_CONFIGURED", message: "Opinion API not configured" },
        { status: 503, headers: getCorsHeaders() }
      );
    }
    
    // Execute order
    const result = await executeOpinionOrder(
      { marketId, side, amount, signature },
      apiKey
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: "ORDER_FAILED", message: result.error },
        { status: 400, headers: getCorsHeaders() }
      );
    }
    
    // TODO: Record trade in our contract
    // TODO: Index trade event
    
    return NextResponse.json(
      {
        success: true,
        orderId: result.orderId,
        txHash: result.txHash,
      },
      { headers: getCorsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Internal server error" },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}
```

---

## Frontend Implementation

### File: `components/OrderForm.tsx`

```typescript
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { signTypedData } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";

interface OrderFormProps {
  market: {
    marketId: number;
    topicId?: number;
    marketTitle: string;
    yes: { price: number };
    no: { price: number };
  };
  onOrderPlaced?: () => void;
}

export function OrderForm({ market, onOrderPlaced }: OrderFormProps) {
  const { address, isConnected, chain } = useAccount();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate fee (0.5% of amount)
  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * 0.005; // 0.5%
  const minFee = 0.5; // $0.5 minimum
  const actualFee = Math.max(fee, minFee);
  const totalCost = amountNum + actualFee;
  
  const handlePlaceOrder = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet");
      return;
    }
    
    if (amountNum < 5) {
      setError("Minimum order is $5");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create EIP712 message
      const domain = {
        name: "Opinion.Arb",
        version: "1",
        chainId: chain?.id || 56, // BNB Chain
        verifyingContract: "0x...", // Opinion contract address
      };
      
      const types = {
        Order: [
          { name: "marketId", type: "uint256" },
          { name: "side", type: "bool" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };
      
      const message = {
        marketId: market.marketId,
        side: side === "yes",
        amount: BigInt(Math.floor(amountNum * 1e18)), // Convert to wei
        nonce: Date.now(),
      };
      
      // 2. Sign with wallet
      const signature = await signTypedData(wagmiConfig, {
        domain,
        types,
        primaryType: "Order",
        message,
      });
      
      // 3. Submit to our API
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: market.marketId,
          side,
          amount: message.amount.toString(),
          signature,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Order failed");
      }
      
      // Success!
      onOrderPlaced?.();
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Side Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setSide("yes")}
          className={`flex-1 py-2 rounded border ${
            side === "yes"
              ? "bg-terminal-accent/20 border-terminal-accent text-terminal-accent"
              : "bg-terminal-bg border-terminal-border text-terminal-dim"
          }`}
        >
          YES
        </button>
        <button
          onClick={() => setSide("no")}
          className={`flex-1 py-2 rounded border ${
            side === "no"
              ? "bg-terminal-danger/20 border-terminal-danger text-terminal-danger"
              : "bg-terminal-bg border-terminal-border text-terminal-dim"
          }`}
        >
          NO
        </button>
      </div>
      
      {/* Amount Input */}
      <div>
        <label className="text-xs text-terminal-dim mb-1 block">Amount ($)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="5"
          step="0.01"
          className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-terminal-text"
          placeholder="5.00"
        />
      </div>
      
      {/* Fee Calculation */}
      <div className="bg-terminal-bg border border-terminal-border rounded p-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-terminal-dim">Order Amount:</span>
          <span className="text-terminal-text">${amountNum.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-dim">Fee (0.5%):</span>
          <span className="text-terminal-text">${actualFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-terminal-border pt-1 font-medium">
          <span className="text-terminal-dim">Total:</span>
          <span className="text-terminal-accent">${totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="text-xs text-terminal-danger bg-terminal-danger/10 border border-terminal-danger/30 rounded p-2">
          {error}
        </div>
      )}
      
      {/* Submit Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading || !isConnected || amountNum < 5}
        className="w-full py-3 bg-terminal-accent text-terminal-bg font-medium rounded-lg hover:bg-terminal-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "PLACING ORDER..." : "PLACE ORDER"}
      </button>
    </div>
  );
}
```

---

## Database Schema

### File: `lib/database/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Trade {
  id          String   @id @default(cuid())
  tradeId     BigInt   @unique // From smart contract
  userAddress String   @db.VarChar(42) // Ethereum address
  marketId    Int
  topicId     Int?
  side        String   // "yes" | "no"
  amount      Decimal  @db.Decimal(18, 8) // In wei
  fee         Decimal  @db.Decimal(18, 8)
  price       Decimal? @db.Decimal(18, 8) // Entry price
  txHash      String?  @db.VarChar(66)
  blockNumber BigInt?
  timestamp   DateTime
  createdAt   DateTime @default(now())
  
  @@index([userAddress])
  @@index([marketId])
  @@index([timestamp])
}

model Fee {
  id          String   @id @default(cuid())
  userAddress String   @db.VarChar(42)
  amount      Decimal  @db.Decimal(18, 8)
  tradeId     BigInt
  txHash      String?  @db.VarChar(66)
  timestamp   DateTime
  createdAt   DateTime @default(now())
  
  @@index([userAddress])
  @@index([timestamp])
}

model UserMetrics {
  id          String   @id @default(cuid())
  userAddress String   @unique @db.VarChar(42)
  totalTrades Int      @default(0)
  totalVolume Decimal  @default(0) @db.Decimal(18, 8)
  totalFees   Decimal  @default(0) @db.Decimal(18, 8)
  lastTradeAt DateTime?
  updatedAt   DateTime @updatedAt
  
  @@index([totalVolume])
}

model SystemMetrics {
  id              String   @id @default(cuid())
  date            DateTime @unique @db.Date
  totalTrades     Int      @default(0)
  totalVolume     Decimal  @default(0) @db.Decimal(18, 8)
  totalFees       Decimal  @default(0) @db.Decimal(18, 8)
  activeUsers     Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([date])
}
```

---

## Event Indexer

### File: `lib/indexer.ts`

```typescript
/**
 * Event Indexer
 * 
 * Listens to smart contract events and syncs to database
 */

import { createPublicClient, http, parseAbi } from "viem";
import { bsc } from "viem/chains";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TRADE_ROUTER_ABI = parseAbi([
  "event TradeExecuted(uint256 indexed tradeId, address indexed user, uint256 marketId, bool side, uint256 amount, uint256 fee)",
  "event FeeCollected(address indexed user, uint256 amount)",
]);

export async function indexTradeEvents(
  contractAddress: `0x${string}`,
  fromBlock: bigint = 0n
) {
  const client = createPublicClient({
    chain: bsc,
    transport: http(),
  });
  
  // Get latest block
  const latestBlock = await client.getBlockNumber();
  
  // Get events
  const logs = await client.getLogs({
    address: contractAddress,
    event: TRADE_ROUTER_ABI[0], // TradeExecuted
    fromBlock,
    toBlock: latestBlock,
  });
  
  // Process events
  for (const log of logs) {
    const { tradeId, user, marketId, side, amount, fee } = log.args;
    
    // Save to database
    await prisma.trade.create({
      data: {
        tradeId: tradeId.toString(),
        userAddress: user,
        marketId: Number(marketId),
        side: side ? "yes" : "no",
        amount: amount.toString(),
        fee: fee.toString(),
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: new Date(Number(log.blockNumber) * 3000), // Approximate
      },
    });
    
    // Update user metrics
    await prisma.userMetrics.upsert({
      where: { userAddress: user },
      create: {
        userAddress: user,
        totalTrades: 1,
        totalVolume: amount.toString(),
        totalFees: fee.toString(),
        lastTradeAt: new Date(),
      },
      update: {
        totalTrades: { increment: 1 },
        totalVolume: { increment: amount.toString() },
        totalFees: { increment: fee.toString() },
        lastTradeAt: new Date(),
      },
    });
  }
  
  return latestBlock;
}
```

---

## Operational Dashboard

### File: `app/admin/dashboard/page.tsx`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchMetrics() {
  const res = await fetch("/api/admin/metrics");
  return res.json();
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 30000, // 30s
  });
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">OPERATIONAL DASHBOARD</h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Fees"
          value={`$${data?.totalFees?.toFixed(2) || "0.00"}`}
        />
        <MetricCard
          label="Total Trades"
          value={data?.totalTrades || 0}
        />
        <MetricCard
          label="Total Volume"
          value={`$${data?.totalVolume?.toFixed(2) || "0.00"}`}
        />
        <MetricCard
          label="Active Users"
          value={data?.activeUsers || 0}
        />
      </div>
      
      {/* Recent Trades Table */}
      <div className="bg-terminal-surface border border-terminal-border rounded-lg">
        <h2 className="p-4 border-b border-terminal-border font-medium">
          RECENT TRADES
        </h2>
        {/* Trade list */}
      </div>
    </div>
  );
}
```

---

## Fee Collection Strategy

### Recommended: 0.5% Fee

**Rationale:**
- Opinion.trade charges 0-2% (avg ~1%)
- Our 0.5% is competitive
- Still profitable at scale
- Users save vs direct trading

### Fee Distribution Options

1. **100% to Platform** (Simple)
2. **Revenue Share** (e.g., 80% platform, 20% referrer)
3. **Token Rewards** (Future: distribute tokens to users)

**Recommendation:** Start with 100% to platform, add revenue share later.

---

## Implementation Phases

### Phase 1: MVP (Weeks 1-4)
- [ ] Research Opinion CLOB SDK
- [ ] Deploy simple TradeRouter contract to testnet
- [ ] Build backend API for order execution
- [ ] Create basic order form
- [ ] Test end-to-end flow

### Phase 2: Integration (Weeks 5-8)
- [ ] Connect to Opinion CLOB SDK
- [ ] Implement EIP712 signing
- [ ] Deploy contracts to mainnet
- [ ] Build event indexer
- [ ] Set up database

### Phase 3: Dashboard (Weeks 9-12)
- [ ] Build admin dashboard
- [ ] Add trade history
- [ ] Implement metrics API
- [ ] Add real-time updates
- [ ] Security audit

---

## Security Checklist

- [ ] Smart contract audit (critical!)
- [ ] Reentrancy guards
- [ ] Access control
- [ ] Input validation
- [ ] Fee calculation server-side
- [ ] Event verification
- [ ] Rate limiting on API
- [ ] EIP712 signature verification

---

## Questions to Answer

1. **Opinion.trade Partnership**: Do we need permission?
2. **Fee Currency**: BNB, USDT, or native token?
3. **Minimum Fee**: Match Opinion's $0.5 or different?
4. **Gas Coverage**: Do we cover gas fees?
5. **KYC/AML**: Required for compliance?

---

## Next Immediate Steps

1. **Get CLOB SDK Access**: Request from Opinion team
2. **Study EIP712 Structure**: Reverse-engineer or get docs
3. **Deploy Test Contract**: Simple fee collection on testnet
4. **Build MVP API**: Test order execution flow
5. **Create Order Form**: Basic UI with EIP712 signing

