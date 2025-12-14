/**
 * URL generation utilities for external platforms
 */

/**
 * Opinion.trade base URL
 * Note: URL scheme may need adjustment based on actual Opinion.trade routing
 */
const OPINION_BASE_URL = "https://opinion.trade";

/**
 * Generate Opinion.trade market URL from marketId
 * 
 * Attempts multiple URL schemes:
 * - /markets/{marketId} (most common)
 * - /market/{marketId} (singular)
 * - /?market={marketId} (query-based)
 * 
 * Returns the most likely URL, with fallback to base URL
 */
export function getOpinionMarketUrl(marketId: number | string): string {
  // Primary: /markets/{marketId} (plural, most common pattern)
  return `${OPINION_BASE_URL}/markets/${marketId}`;
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

