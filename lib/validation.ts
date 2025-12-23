/**
 * Input validation utilities
 */

/**
 * Validate alphanumeric string (for signatures, addresses, etc.)
 */
export function validateAlphanumeric(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }
  // Allow hex strings (0x prefix) and alphanumeric
  return /^[0-9a-fA-Fx]+$/.test(value);
}

/**
 * Validate token ID format
 * Token IDs should be alphanumeric with hyphens/underscores, max 100 chars
 */
export function validateTokenId(tokenId: string): boolean {
  if (!tokenId || typeof tokenId !== "string") {
    return false;
  }

  // Check length to prevent resource exhaustion
  if (tokenId.length > 100) {
    return false;
  }

  // Allow alphanumeric, hyphens, underscores, dots
  return /^[a-zA-Z0-9._-]+$/.test(tokenId);
}

/**
 * Validate market ID or topic ID
 */
export function validateMarketId(id: number | string): boolean {
  const num = typeof id === "string" ? parseInt(id, 10) : id;
  
  if (!Number.isFinite(num)) {
    return false;
  }

  // Must be positive integer within safe range
  return num > 0 && num < Number.MAX_SAFE_INTEGER;
}

/**
 * Sanitize string to prevent XSS
 * Simple HTML entity encoding for basic protection
 */
export function sanitizeHtml(str: string): string {
  if (typeof str !== "string") {
    return "";
  }

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Validate limit parameter length before parsing
 */
export function validateLimitParam(limitParam: string | null): boolean {
  if (limitParam === null) {
    return true; // Will use default
  }

  // Reject suspiciously long input
  if (limitParam.length > 10) {
    return false;
  }

  return true;
}

