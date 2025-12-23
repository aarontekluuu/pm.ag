import { NextRequest, NextResponse } from "next/server";
import {
  getTotalFees,
  getTotalVolume,
  getTotalTrades,
  getActiveUsers,
  getUserTrades,
} from "@/lib/database/queries";
import { getCorsHeaders, addSecurityHeaders } from "@/lib/security";

/**
 * GET /api/admin/metrics
 * 
 * Get operational metrics for the dashboard
 * 
 * Query params:
 * - userAddress: Optional, get metrics for specific user
 * 
 * Response:
 * {
 *   totalFees: string,
 *   totalVolume: string,
 *   totalTrades: number,
 *   activeUsers: number,
 *   userMetrics?: {...}
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization check
    // For now, allow anyone (should be admin-only in production)
    
    const { searchParams } = request.nextUrl;
    const userAddress = searchParams.get("userAddress");

    // Get system-wide metrics
    const [totalFees, totalVolume, totalTrades, activeUsers] = await Promise.all([
      getTotalFees(),
      getTotalVolume(),
      getTotalTrades(),
      getActiveUsers(),
    ]);

    const response: any = {
      totalFees,
      totalVolume,
      totalTrades,
      activeUsers,
    };

    // If user address provided, get user-specific metrics
    if (userAddress) {
      const userTrades = await getUserTrades(userAddress, 10);
      response.userMetrics = {
        address: userAddress,
        recentTrades: userTrades,
      };
    }

    const jsonResponse = NextResponse.json(response, {
      headers: getCorsHeaders(),
    });
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Failed to fetch metrics",
      },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

