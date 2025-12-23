import { NextRequest, NextResponse } from "next/server";
import { getUserTrades, getUserMetrics } from "@/lib/database/queries";
import { getCorsHeaders, addSecurityHeaders } from "@/lib/security";

/**
 * GET /api/portfolio
 * 
 * Get user's portfolio data (trades, metrics)
 * 
 * Query params:
 * - userAddress: User's wallet address (required)
 * 
 * Response:
 * {
 *   trades: Trade[],
 *   portfolioValue: string,
 *   totalFees: string,
 *   totalTrades: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        {
          error: "MISSING_PARAM",
          message: "userAddress is required",
        },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        {
          error: "INVALID_PARAM",
          message: "Invalid address format",
        },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Get user trades and metrics
    const [trades, metrics] = await Promise.all([
      getUserTrades(userAddress, 100),
      getUserMetrics(userAddress),
    ]);

    // Calculate portfolio value (for now, just sum of trade amounts)
    // TODO: Calculate actual portfolio value based on current market prices
    const portfolioValue = metrics?.totalVolume || "0";
    const totalFees = metrics?.totalFees || "0";
    const totalTrades = metrics?.totalTrades || 0;

    const response = NextResponse.json(
      {
        trades: trades.map((trade: any) => ({
          id: trade.id,
          tradeId: trade.tradeId.toString(),
          marketId: trade.marketId,
          topicId: trade.topicId,
          side: trade.side,
          amount: trade.amount.toString(),
          fee: trade.fee.toString(),
          price: trade.price?.toString(),
          txHash: trade.txHash,
          timestamp: trade.timestamp.toISOString(),
        })),
        portfolioValue,
        totalFees,
        totalTrades,
      },
      { headers: getCorsHeaders() }
    );
    return addSecurityHeaders(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Failed to fetch portfolio",
      },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

