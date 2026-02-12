// src/utils/marketIdExtractor.ts
/**
 * Utility functions for extracting correct market IDs and names from JSON data
 * Based on market type (MATCH_ODDS, Bookmaker, FANCY)
 */

export type MarketType = "MATCH_ODDS" | "BOOKMAKER" | "FANCY" | "TOSS";

export interface MarketData {
  gmid: number;
  mid?: number;
  mname?: string;
  status?: string;
  section?: Array<{
    sid: number;
    nat: string;
    gstatus?: string;
  }>;
}

export interface EventData {
  gmid: number;
  name: string;
}

export interface ResultRequest {
  event_id: number;
  event_name: string;
  market_id: number;
  market_name: string;
}

/**
 * Extract market_id based on market type
 *
 * Rules:
 * - MATCH_ODDS/Bookmaker: Use `mid` from market data
 * - FANCY: Use `section.sid` from the specific fancy line
 *
 * @param marketData - Market data from JSON
 * @param marketType - Type of market
 * @param sectionIndex - For FANCY markets, which section/line to use (default: 0)
 * @returns market_id or null if not found
 */
export function extractMarketId(
  marketData: MarketData,
  marketType: MarketType,
  sectionIndex: number = 0,
): number | null {
  try {
    if (
      marketType === "MATCH_ODDS" ||
      marketType === "BOOKMAKER" ||
      marketType === "TOSS"
    ) {
      // For main markets, use mid
      if (marketData.mid) {
        return marketData.mid;
      }
      console.warn(
        "[MarketIdExtractor] No mid found for MATCH_ODDS/Bookmaker market",
      );
      return null;
    }

    if (marketType === "FANCY") {
      // For fancy markets, use section.sid
      if (marketData.section && Array.isArray(marketData.section)) {
        const section = marketData.section[sectionIndex];
        if (section && section.sid) {
          return section.sid;
        }
        console.warn(
          `[MarketIdExtractor] No sid found in section[${sectionIndex}] for FANCY market`,
        );
        return null;
      }
      console.warn(
        "[MarketIdExtractor] No section array found for FANCY market",
      );
      return null;
    }

    console.warn(`[MarketIdExtractor] Unknown market type: ${marketType}`);
    return null;
  } catch (error) {
    console.error("[MarketIdExtractor] Error extracting market_id:", error);
    return null;
  }
}

/**
 * Extract market_name based on market type
 *
 * Rules:
 * - MATCH_ODDS/Bookmaker: Use `mname` from market data
 * - FANCY: Use `section.nat` from the specific fancy line
 *
 * @param marketData - Market data from JSON
 * @param marketType - Type of market
 * @param sectionIndex - For FANCY markets, which section/line to use (default: 0)
 * @returns market_name or null if not found
 */
export function extractMarketName(
  marketData: MarketData,
  marketType: MarketType,
  sectionIndex: number = 0,
): string | null {
  try {
    if (
      marketType === "MATCH_ODDS" ||
      marketType === "BOOKMAKER" ||
      marketType === "TOSS"
    ) {
      // For main markets, use mname
      if (marketData.mname) {
        return marketData.mname;
      }
      console.warn(
        "[MarketIdExtractor] No mname found for MATCH_ODDS/Bookmaker market",
      );
      return null;
    }

    if (marketType === "FANCY") {
      // For fancy markets, use section.nat
      if (marketData.section && Array.isArray(marketData.section)) {
        const section = marketData.section[sectionIndex];
        if (section && section.nat) {
          return section.nat;
        }
        console.warn(
          `[MarketIdExtractor] No nat found in section[${sectionIndex}] for FANCY market`,
        );
        return null;
      }
      console.warn(
        "[MarketIdExtractor] No section array found for FANCY market",
      );
      return null;
    }

    console.warn(`[MarketIdExtractor] Unknown market type: ${marketType}`);
    return null;
  } catch (error) {
    console.error("[MarketIdExtractor] Error extracting market_name:", error);
    return null;
  }
}

/**
 * Validate market data before fetching results
 *
 * Checks:
 * - Market status is OPEN
 * - Selection status is ACTIVE (for FANCY)
 * - Required fields exist
 *
 * @param marketData - Market data from JSON
 * @param marketType - Type of market
 * @param sectionIndex - For FANCY markets, which section/line to validate
 * @returns true if valid, false otherwise
 */
export function validateMarketData(
  marketData: MarketData,
  marketType: MarketType,
  sectionIndex: number = 0,
): boolean {
  try {
    // Check if market is OPEN
    if (marketData.status && marketData.status !== "OPEN") {
      console.warn(
        `[MarketIdExtractor] Market status is ${marketData.status}, not OPEN`,
      );
      return false;
    }

    // For FANCY markets, also check section status
    if (marketType === "FANCY") {
      if (marketData.section && Array.isArray(marketData.section)) {
        const section = marketData.section[sectionIndex];
        if (section && section.gstatus && section.gstatus !== "ACTIVE") {
          console.warn(
            `[MarketIdExtractor] Section status is ${section.gstatus}, not ACTIVE`,
          );
          return false;
        }
      }
    }

    // Check if we can extract market_id and market_name
    const marketId = extractMarketId(marketData, marketType, sectionIndex);
    const marketName = extractMarketName(marketData, marketType, sectionIndex);

    if (!marketId || !marketName) {
      console.warn(
        "[MarketIdExtractor] Cannot extract market_id or market_name",
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[MarketIdExtractor] Error validating market data:", error);
    return false;
  }
}

/**
 * Build a complete result request object
 *
 * @param marketData - Market data from JSON
 * @param eventData - Event data (gmid and name)
 * @param marketType - Type of market
 * @param sectionIndex - For FANCY markets, which section/line to use
 * @returns ResultRequest object or null if validation fails
 */
export function buildResultRequest(
  marketData: MarketData,
  eventData: EventData,
  marketType: MarketType,
  sectionIndex: number = 0,
): ResultRequest | null {
  try {
    // Validate first
    if (!validateMarketData(marketData, marketType, sectionIndex)) {
      console.warn("[MarketIdExtractor] Market data validation failed");
      return null;
    }

    const marketId = extractMarketId(marketData, marketType, sectionIndex);
    const marketName = extractMarketName(marketData, marketType, sectionIndex);

    if (!marketId || !marketName) {
      console.error(
        "[MarketIdExtractor] Failed to extract market_id or market_name",
      );
      return null;
    }

    const request: ResultRequest = {
      event_id: eventData.gmid,
      event_name: eventData.name,
      market_id: marketId,
      market_name: marketName,
    };

    console.log("[MarketIdExtractor] Built result request:", request);
    return request;
  } catch (error) {
    console.error("[MarketIdExtractor] Error building result request:", error);
    return null;
  }
}

/**
 * Extract all FANCY market requests from a market data object
 * Useful when you want to fetch results for all fancy lines at once
 *
 * @param marketData - Market data from JSON (FANCY type)
 * @param eventData - Event data (gmid and name)
 * @returns Array of ResultRequest objects
 */
export function buildAllFancyRequests(
  marketData: MarketData,
  eventData: EventData,
): ResultRequest[] {
  const requests: ResultRequest[] = [];

  if (!marketData.section || !Array.isArray(marketData.section)) {
    console.warn("[MarketIdExtractor] No sections found for FANCY market");
    return requests;
  }

  marketData.section.forEach((section, index) => {
    const request = buildResultRequest(marketData, eventData, "FANCY", index);
    if (request) {
      requests.push(request);
    }
  });

  console.log(`[MarketIdExtractor] Built ${requests.length} FANCY requests`);
  return requests;
}
