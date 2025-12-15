/**
 * URL generation utilities for external platforms
 */

/**
 * Opinion.trade base URL
 */
const OPINION_BASE_URL = "https://app.opinion.trade";

/**
 * Generate Opinion.trade market URL from marketId or topicId
 * 
 * Format: https://app.opinion.trade/detail?topicId={id}&type=multi
 * 
 * Prefers topicId if available, falls back to marketId
 */
export function getOpinionMarketUrl(
  marketId: number | string,
  topicId?: number | string
): string {
  // Use topicId if provided, otherwise use marketId
  const id = topicId !== undefined ? topicId : marketId;
  return `${OPINION_BASE_URL}/detail?topicId=${id}&type=multi`;
}

/**
 * Generate Opinion.trade order placement URL
 * 
 * Redirects to market detail page. User can place order on platform.
 * If Opinion.trade supports pre-filling order side via URL params, add them here.
 */
export function getOpinionOrderUrl(
  marketId: number | string,
  side: "yes" | "no",
  topicId?: number | string
): string {
  // Start with market detail URL
  const baseUrl = getOpinionMarketUrl(marketId, topicId);
  
  // Note: Opinion.trade may not support pre-filling order side via URL params
  // If it does, add: &side=yes or &action=buy&side=yes
  // For now, just link to market page and user clicks order there
  return baseUrl;
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
