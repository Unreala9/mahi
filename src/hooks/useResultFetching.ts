// src/hooks/useResultFetching.ts
/**
 * React Hook for Result Fetching
 *
 * Provides easy-to-use interface for fetching sports betting results
 * in React components with automatic state management and cleanup.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { resultFetchingService } from '@/services/resultFetchingService';
import type {
  ResultRequest,
  MarketResult,
  EventResults
} from '@/types/sports-betting';

interface UseResultFetchingOptions {
  autoPolling?: boolean;
  pollingInterval?: number; // in milliseconds
  eventId?: number;
}

interface UseResultFetchingReturn {
  // Data
  marketResult: MarketResult | null;
  eventResults: EventResults | null;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchResult: (request: ResultRequest) => Promise<MarketResult | null>;
  fetchEventResults: (eventId: number) => Promise<EventResults | null>;
  fetchBatchResults: (requests: ResultRequest[]) => Promise<MarketResult[]>;
  startPolling: (eventId: number, interval?: number) => void;
  stopPolling: () => void;
  clearResults: () => void;
}

/**
 * Hook for fetching sports betting results
 *
 * @param options - Configuration options
 * @returns Result fetching interface
 *
 * @example
 * ```tsx
 * const { fetchResult, marketResult, isLoading } = useResultFetching();
 *
 * const handleFetchResult = async () => {
 *   await fetchResult({
 *     event_id: 856162940,
 *     event_name: "SA W vs PAK W",
 *     market_id: 6273906464321,
 *     market_name: "MATCH_ODDS"
 *   });
 * };
 * ```
 *
 * @example Auto-polling
 * ```tsx
 * const { eventResults, startPolling, stopPolling } = useResultFetching({
 *   autoPolling: true,
 *   pollingInterval: 30000,
 *   eventId: 856162940
 * });
 * ```
 */
export function useResultFetching(
  options: UseResultFetchingOptions = {}
): UseResultFetchingReturn {
  const { autoPolling = false, pollingInterval = 30000, eventId } = options;

  // State
  const [marketResult, setMarketResult] = useState<MarketResult | null>(null);
  const [eventResults, setEventResults] = useState<EventResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch result for a specific market
   */
  const fetchResult = useCallback(async (request: ResultRequest): Promise<MarketResult | null> => {
    setIsFetching(true);
    setError(null);

    try {
      const result = await resultFetchingService.fetchMarketResult(request);

      if (isMountedRef.current) {
        setMarketResult(result);
        setIsFetching(false);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch result';

      if (isMountedRef.current) {
        setError(errorMessage);
        setIsFetching(false);
      }

      console.error('[useResultFetching] Error fetching result:', err);
      return null;
    }
  }, []);

  /**
   * Fetch results for all markets of an event
   */
  const fetchEventResults = useCallback(async (eventId: number): Promise<EventResults | null> => {
    setIsFetching(true);
    setError(null);

    try {
      const results = await resultFetchingService.fetchEventResults(eventId);

      if (isMountedRef.current) {
        setEventResults(results);
        setIsFetching(false);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event results';

      if (isMountedRef.current) {
        setError(errorMessage);
        setIsFetching(false);
      }

      console.error('[useResultFetching] Error fetching event results:', err);
      return null;
    }
  }, []);

  /**
   * Fetch results for multiple markets in parallel
   */
  const fetchBatchResults = useCallback(async (requests: ResultRequest[]): Promise<MarketResult[]> => {
    setIsFetching(true);
    setError(null);

    try {
      const results = await resultFetchingService.fetchBatchResults(requests);

      if (isMountedRef.current) {
        setIsFetching(false);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch batch results';

      if (isMountedRef.current) {
        setError(errorMessage);
        setIsFetching(false);
      }

      console.error('[useResultFetching] Error fetching batch results:', err);
      return [];
    }
  }, []);

  /**
   * Start auto-polling for event results
   */
  const startPolling = useCallback((eventId: number, interval?: number) => {
    console.log(`[useResultFetching] Starting polling for event ${eventId}`);

    // Stop existing polling if any
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Start new polling
    const cleanup = resultFetchingService.startAutoPolling(
      eventId,
      (results) => {
        if (isMountedRef.current) {
          setEventResults(results);
        }
      },
      interval || pollingInterval
    );

    cleanupRef.current = cleanup;
  }, [pollingInterval]);

  /**
   * Stop auto-polling
   */
  const stopPolling = useCallback(() => {
    console.log('[useResultFetching] Stopping polling');

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    setMarketResult(null);
    setEventResults(null);
    setError(null);
  }, []);

  // Auto-polling effect
  useEffect(() => {
    if (autoPolling && eventId) {
      setIsLoading(true);
      startPolling(eventId, pollingInterval);

      // Mark as loaded after first fetch
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
        stopPolling();
      };
    }
  }, [autoPolling, eventId, pollingInterval, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    // Data
    marketResult,
    eventResults,

    // Loading states
    isLoading,
    isFetching,

    // Error state
    error,

    // Actions
    fetchResult,
    fetchEventResults,
    fetchBatchResults,
    startPolling,
    stopPolling,
    clearResults,
  };
}
