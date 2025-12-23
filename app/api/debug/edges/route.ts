import { NextRequest, NextResponse } from "next/server";
import { fetchMarkets, fetchTokenPrices } from "@/lib/opinionClient";
import { computeEdges } from "@/lib/edge";
import type { Market } from "@/lib/types";

/**
 * Debug endpoint to inspect raw API responses and edge computation
 * GET /api/debug/edges?limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Fetch markets
    const opinionMarkets = await fetchMarkets(limit);
    
    // Convert to internal Market type
    const markets: Market[] = opinionMarkets.map((m) => ({
      marketId: m.marketId,
      topicId: (m as any).topic_id ?? (m as any).topicId ?? (m.questionId && /^\d+$/.test(String(m.questionId)) ? Number(m.questionId) : undefined) ?? undefined,
      marketTitle: m.marketTitle,
      yesTokenId: m.yesTokenId,
      noTokenId: m.noTokenId,
      volume24h: m.volume24h,
      statusEnum: m.statusEnum || String(m.status),
    }));

    // Collect token IDs
    const tokenIds = markets.flatMap((m) => [m.yesTokenId, m.noTokenId]);
    const uniqueTokenIds = [...new Set(tokenIds)];

    // Fetch prices
    const opinionPrices = await fetchTokenPrices(uniqueTokenIds);

    // Convert to internal TokenPrice type
    const pricesByToken: Record<string, { tokenId: string; price: string; timestamp: number }> = {};
    for (const [tokenId, price] of Object.entries(opinionPrices)) {
      pricesByToken[tokenId] = {
        tokenId: price.token_id,
        price: price.price,
        timestamp: price.timestamp,
      };
    }

    // Compute edges
    const edges = computeEdges(markets, pricesByToken);

    // Calculate statistics
    const stats = {
      markets: {
        fetched: opinionMarkets.length,
        converted: markets.length,
        withTopicId: markets.filter(m => m.topicId !== undefined).length,
      },
      prices: {
        tokenIdsRequested: uniqueTokenIds.length,
        pricesFetched: Object.keys(opinionPrices).length,
        missingPrices: uniqueTokenIds.length - Object.keys(opinionPrices).length,
        missingTokenIds: uniqueTokenIds.filter(id => !opinionPrices[id]),
      },
      edges: {
        total: edges.length,
        withArbitrage: edges.filter(e => e.edge > 0).length,
        maxEdge: edges.length > 0 ? Math.max(...edges.map(e => e.edge)) : 0,
        avgEdge: edges.length > 0 ? (edges.reduce((sum, e) => sum + e.edge, 0) / edges.length) : 0,
        marketsLost: markets.length - edges.length,
      },
      filtering: {
        marketsWithBothPrices: markets.filter(m => 
          pricesByToken[m.yesTokenId] && pricesByToken[m.noTokenId]
        ).length,
        marketsMissingPrices: markets.filter(m => 
          !pricesByToken[m.yesTokenId] || !pricesByToken[m.noTokenId]
        ).length,
      },
    };

    return NextResponse.json({
      success: true,
      limit,
      stats,
      data: {
        rawMarkets: opinionMarkets.slice(0, 3), // First 3 for inspection
        markets: markets.slice(0, 3), // First 3 converted markets
        samplePrices: Object.entries(pricesByToken).slice(0, 5).map(([id, price]) => ({
          tokenId: id,
          price: price.price,
          timestamp: price.timestamp,
        })),
        sampleEdges: edges.slice(0, 5), // First 5 edges
        missingTokenIds: stats.prices.missingTokenIds.slice(0, 10),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

