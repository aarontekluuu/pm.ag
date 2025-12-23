import { NextRequest, NextResponse } from "next/server";
import { executeOpinionOrder } from "@/lib/opinionCLOB";
import { getClientIdentifier, apiRateLimiter } from "@/lib/rateLimit";
import { getCorsHeaders, addSecurityHeaders, sanitizeError } from "@/lib/security";
import { validateAlphanumeric } from "@/lib/validation";

/**
 * POST /api/trades
 * 
 * Execute a trade on Opinion.trade through our platform
 * 
 * Body:
 * {
 *   marketId: number,
 *   side: "yes" | "no",
 *   amount: string, // In wei (18 decimals)
 *   signature: string, // EIP712 signature
 *   nonce?: number
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   orderId?: string,
 *   txHash?: string,
 *   tradeId?: number, // Our contract trade ID
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    if (!apiRateLimiter.isAllowed(clientId)) {
      const response = NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
        { status: 429, headers: getCorsHeaders() }
      );
      response.headers.set("X-RateLimit-Limit", "60");
      response.headers.set("X-RateLimit-Remaining", "0");
      return addSecurityHeaders(response);
    }

    // Parse request body
    const body = await request.json();
    const { marketId, side, amount, signature, nonce } = body;

    // Validate input
    if (!marketId || typeof marketId !== "number") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "marketId is required and must be a number" },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!side || (side !== "yes" && side !== "no")) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "side must be 'yes' or 'no'" },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!amount || typeof amount !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "amount is required and must be a string" },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate amount format (should be numeric string)
    const amountNum = BigInt(amount);
    const minOrder = BigInt("5000000000000000000"); // $5 in wei (18 decimals)
    if (amountNum < minOrder) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Minimum order amount is $5" },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!signature || typeof signature !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "signature is required" },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate signature format (basic check)
    if (!validateAlphanumeric(signature) || signature.length < 130) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Invalid signature format" },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Check API configuration
    const apiKey = process.env.OPINION_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API_NOT_CONFIGURED",
          message: "Opinion API not configured",
        },
        { status: 503, headers: getCorsHeaders() }
      );
    }

    // Execute order on Opinion.trade
    const orderResult = await executeOpinionOrder(
      {
        marketId,
        side,
        amount,
        signature,
        nonce,
      },
      apiKey
    );

    if (!orderResult.success) {
      return NextResponse.json(
        {
          error: "ORDER_FAILED",
          message: orderResult.error || "Order execution failed",
        },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // TODO: Record trade in our smart contract
    // TODO: Index trade event to database
    // TODO: Update user metrics

    // For now, return success with order details
    const response = NextResponse.json(
      {
        success: true,
        orderId: orderResult.orderId,
        txHash: orderResult.txHash,
        message: "Order executed successfully",
      },
      { headers: getCorsHeaders() }
    );
    response.headers.set("X-RateLimit-Limit", "60");
    response.headers.set(
      "X-RateLimit-Remaining",
      String(apiRateLimiter.getRemaining(clientId))
    );
    return addSecurityHeaders(response);
  } catch (error) {
    const errorMessage = sanitizeError(error);
    
    if (process.env.NODE_ENV === "development") {
      console.error("[/api/trades] Error:", errorMessage);
    }

    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Internal server error. Please try again later.",
      },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  const response = new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
  return addSecurityHeaders(response);
}

