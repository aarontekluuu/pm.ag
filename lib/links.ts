/**
 * URL generation utilities for external platforms
 */

/**
 * Opinion.trade base URL
 */
const OPINION_BASE_URL = "https://app.opinion.trade";

/**
 * Generate Opinion.trade market URL from topicId
 * 
 * IMPORTANT: market_id from API is NOT the same as topicId in URLs.
 * Only use topicId if available from API. Otherwise, use search URL.
 * 
 * @param marketId - Market ID from API (for reference only, not used in URL)
 * @param topicId - Topic ID from API (required for correct URL)
 * @param marketTitle - Market title (used for search fallback)
 * @returns Opinion.trade URL
 */
export function getOpinionMarketUrl(
  marketId: number | string,
  topicId?: number | string,
  marketTitle?: string
): string {
  // Only use topicId if explicitly provided
  // DO NOT use marketId as fallback - they are different!
  if (topicId !== undefined && topicId !== null) {
    return `${OPINION_BASE_URL}/detail?topicId=${topicId}&type=multi`;
  }
  
  // If no topicId, use search URL as fallback
  // This is safer than using marketId which would point to wrong market
  if (marketTitle) {
    return getOpinionSearchUrl(marketTitle);
  }
  
  // Last resort: return base URL
  return OPINION_BASE_URL;
}

/**
 * Generate Opinion.trade order placement URL
 * 
 * Redirects to market detail page. User can place order on platform.
 */
export function getOpinionOrderUrl(
  marketId: number | string,
  side: "yes" | "no",
  topicId?: number | string,
  marketTitle?: string
): string {
  // Start with market detail URL
  return getOpinionMarketUrl(marketId, topicId, marketTitle);
}

/**
 * Get the Opinion.trade base URL (for fallback navigation)
 */
export function getOpinionBaseUrl(): string {
  return OPINION_BASE_URL;
}

/**
 * Generate a search URL on Opinion.trade (fallback if direct link fails)
 */
export function getOpinionSearchUrl(query: string): string {
  return `${OPINION_BASE_URL}/markets?search=${encodeURIComponent(query)}`;
}

/**
 * Platform-specific market URL generators
 */
export const platformUrls = {
  opinion: getOpinionMarketUrl,
  
  // Kalshi uses event tickers
  kalshi: (eventTicker: string) => `https://kalshi.com/markets/${eventTicker}`,
  
  // Polymarket uses slug-based URLs
  polymarket: (slug: string) => `https://polymarket.com/event/${slug}`,
};

/**
 * Platform-specific order URL generators
 */
export const platformOrderUrls = {
  opinion: getOpinionOrderUrl,
  
  // Future: Kalshi order URLs
  kalshi: (eventTicker: string, side: "yes" | "no") => 
    `https://kalshi.com/markets/${eventTicker}?side=${side}`,
  
  // Future: Polymarket order URLs
  polymarket: (slug: string, side: "yes" | "no") => 
    `https://polymarket.com/event/${slug}?side=${side}`,
};

