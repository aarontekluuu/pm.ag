import { NextRequest, NextResponse } from "next/server";
import { handleIndexerRequest } from "@/lib/indexer";
import { getCorsHeaders, addSecurityHeaders } from "@/lib/security";

/**
 * POST /api/indexer
 * 
 * Trigger event indexing for smart contracts
 * 
 * This endpoint can be called:
 * - Manually for testing
 * - By Vercel Cron Job (scheduled)
 * - By external monitoring service
 * 
 * Query params:
 * - contractAddress: TradeRouter contract address (required)
 * 
 * Response:
 * {
 *   success: boolean,
 *   indexedBlocks?: number,
 *   lastBlock?: string,
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get contract address from query params or body
    const { searchParams } = request.nextUrl;
    const contractAddress = searchParams.get("contractAddress") as `0x${string}` | null;

    if (!contractAddress) {
      return NextResponse.json(
        {
          error: "MISSING_PARAM",
          message: "contractAddress is required",
        },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate address format
    if (!contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        {
          error: "INVALID_PARAM",
          message: "Invalid contract address format",
        },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Run indexer
    const result = await handleIndexerRequest(contractAddress);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "INDEXING_FAILED",
          message: result.error || "Indexing failed",
        },
        { status: 500, headers: getCorsHeaders() }
      );
    }

    return NextResponse.json(result, { headers: getCorsHeaders() });
  } catch (error) {
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Internal server error",
      },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

/**
 * GET /api/indexer
 * 
 * Get indexer status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const contractAddress = searchParams.get("contractAddress");

  return NextResponse.json(
    {
      status: "running",
      contractAddress: contractAddress || "not specified",
      message: "Use POST to trigger indexing",
    },
    { headers: getCorsHeaders() }
  );
}

