import type { MarketEdge, Platform } from "./types";

/**
 * Platform metadata
 */
export interface PlatformInfo {
  name: string;
  displayName: string;
  url: string;
  chainId: number;
  color: string;
}

/**
 * Platform metadata map
 */
export const platformInfo: Record<Platform, PlatformInfo> = {
  opinion: {
    name: "opinion",
    displayName: "Opinion.trade",
    url: "https://app.opinion.trade",
    chainId: 56, // BNB Chain
    color: "terminal-warn",
  },
  kalshi: {
    name: "kalshi",
    displayName: "Kalshi",
    url: "https://kalshi.com",
    chainId: 1, // Ethereum (for now, may change)
    color: "terminal-cyan",
  },
  polymarket: {
    name: "polymarket",
    displayName: "Polymarket",
    url: "https://polymarket.com",
    chainId: 137, // Polygon
    color: "terminal-purple",
  },
};

/**
 * Get platform for a market
 * For now, all markets are Opinion.trade
 * Future: Detect based on market data or API response
 */
export function getMarketPlatform(market: MarketEdge): Platform {
  // TODO: When Kalshi/Polymarket integration is added, detect based on:
  // - Market source field from API
  // - Token ID patterns
  // - Chain ID
  return "opinion";
}

/**
 * Get platform info
 */
export function getPlatformInfo(platform: Platform): PlatformInfo {
  return platformInfo[platform];
}

