/**
 * Result WebSocket Service
 * Monitors API for bet results and triggers automatic settlement
 */

import { diamondApi } from "./diamondApi";
import { fetchCasinoResult } from "./casino";
import { settleCasinoBets, settleSportsBets } from "./autoSettlementService";

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST
  : API_PROTOCOL
    ? `${API_PROTOCOL}://${API_HOST}`
    : `http://${API_HOST}`;
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

interface ResultUpdate {
  type: "sports" | "casino";
  eventId?: number;
  gameId?: string;
  roundId?: string;
  winner?: string | number;
  result?: any;
  timestamp: number;
}

type ResultCallback = (update: ResultUpdate) => void;

class ResultWebSocketService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private subscribers: Set<ResultCallback> = new Set();
  private checkedResults: Set<string> = new Set(); // Track already processed results
  private pollInterval = 5000; // 5 seconds
  private lastSportsCheck: Map<number, number> = new Map(); // eventId -> timestamp
  private lastCasinoCheck: Map<string, string> = new Map(); // gameType -> last roundId

  /**
   * Start monitoring for results
   */
  start() {
    if (this.isRunning) {
      console.log("[ResultWS] Already running");
      return;
    }

    console.log("[ResultWS] Starting result monitoring...");
    this.isRunning = true;

    // Start polling for results
    this.pollingInterval = setInterval(() => {
      this.checkForResults();
    }, this.pollInterval);

    // Initial check
    this.checkForResults();
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isRunning = false;
      console.log("[ResultWS] Stopped");
    }
  }

  /**
   * Subscribe to result updates
   */
  subscribe(callback: ResultCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(update: ResultUpdate) {
    this.subscribers.forEach((callback) => {
      try {
        callback(update);
      } catch (error) {
        console.error("[ResultWS] Subscriber error:", error);
      }
    });
  }

  /**
   * Check for new results from API
   */
  private async checkForResults() {
    try {
      console.log("[ResultWS] Polling for new results...");
      // Check casino results for common game types
      await this.checkCasinoResults();

      // Check sports results
      await this.checkSportsResults();
    } catch (error) {
      console.error("[ResultWS] Error checking results:", error);
    }
  }

  /**
   * Check casino game results
   */
  private async checkCasinoResults() {
    const casinoGameTypes = [
      // Teen Patti Variants
      "teen20",
      "teen20v1",
      "teen20b",
      "teen20c",
      "teen1",
      "teen3",
      "teen6",
      "teen8",
      "teen9",
      "teen32",
      "teen33",
      "teen41",
      "teen42",
      "teen120",
      "teenpatti",
      "teen",
      "t20",
      "teenmuf",
      "teenmuf2",
      "muflismax",
      "patti2",
      "trio",
      "queen",
      "poison",
      "poison20",
      "mogambo",
      "teenpatti1day",
      "vippatti1day",

      // Dragon Tiger Variants
      "dt20",
      "dt6",
      "dt1",
      "dt202",
      "dtl20",
      "dtlavanced",
      "dtl20pro",

      // Poker Variants
      "poker",
      "poker20",
      "poker6",

      // Baccarat Variants
      "baccarat",
      "baccarat2",
      "btable",
      "btable2",
      "baccarat29",

      // Roulette Variants
      "ourroullete",
      "uniqueroulette",
      "goldenroulette",
      "goldrroulette",

      // Andar Bahar Variants
      "ab20",
      "abj",

      // Lucky 7 Variants
      "lucky7",
      "lucky7eu",
      "lucky7eu2",
      "lucky7g",

      // 32 Cards Variants
      "card32",
      "card32eu",

      // 3 Card Judgement
      "3cardj",

      // Casino War
      "war",

      // Joker Games
      "joker20",
      "joker120",
      "joker1",

      // Number/Lottery Games
      "kbc",
      "notenum",
      "lottcard",
      "lottcard2",
      "worli",
      "worli2",
      "worli3",
      "matkamarket",
      "matka",

      // Dice Games
      "sicbo",
      "sicbo2",

      // Cricket Betting
      "cmatch20",
      "cmeter",
      "cmeter1",
      "cricketv3",
      "cricketline",
      "cricketline2",
      "cricketladder",
      "superover3",
      "superover2",
      "ballbyball",

      // Virtual Racing
      "race20",
      "race17",
      "race2",
      "raceadvanced",
      "race-pro",
      "trap",
      "trap20",
      "thetrap",
      "aaa",
      "aaa2",

      // Football/Soccer
      "goal",
      "footballlive",
      "soccerpro",

      // Festival/Themed Games
      "dolidana",
      "dolidana2",
      "bollywood",

      // Other Games
      "dum10",
    ];

    for (const gameType of casinoGameTypes) {
      try {
        const result = await fetchCasinoResult(gameType);

        if (result?.data?.res && result.data.res.length > 0) {
          const latestResult = result.data.res[0];
          const roundId = latestResult.mid?.toString();
          const winner = latestResult.win;

          // Check if this is a new result
          const lastChecked = this.lastCasinoCheck.get(gameType);
          if (roundId && roundId !== lastChecked) {
            console.log(
              `[ResultWS] New casino result for ${gameType}: Round ${roundId}, Winner ${winner}`,
            );

            this.lastCasinoCheck.set(gameType, roundId);

            // Notify subscribers
            this.notifySubscribers({
              type: "casino",
              gameId: gameType,
              roundId,
              winner,
              result: latestResult,
              timestamp: Date.now(),
            });

            // Trigger settlement
            try {
              const settled = await settleCasinoBets(gameType);
              if (settled.length > 0) {
                console.log(
                  `[ResultWS] Auto-settled ${settled.length} bets for ${gameType}`,
                );
              }
            } catch (err) {
              console.error(
                `[ResultWS] Settlement error for ${gameType}:`,
                err,
              );
            }
          }
        }
      } catch (error) {
        // Silent fail for individual game types
      }
    }
  }

  /**
   * Check sports match results
   */
  private async checkSportsResults() {
    try {
      // Get placed bets to know which events to check
      const placedBets = await this.getPlacedBets();

      if (!placedBets || placedBets.length === 0) {
        return;
      }

      // Extract unique event IDs
      const eventIds = new Set<number>();
      placedBets.forEach((bet: any) => {
        const eventId = bet.event_id || bet.eventId;
        if (eventId) {
          eventIds.add(parseInt(eventId.toString()));
        }
      });

      // Check results for each event
      for (const eventId of eventIds) {
        try {
          // Find a bet for this event to get details
          const sampleBet = placedBets.find(
            (b: any) =>
              parseInt((b.event_id || b.eventId).toString()) === eventId,
          );

          if (!sampleBet) continue;

          const resultData = {
            event_id: eventId,
            event_name:
              sampleBet.event_name ||
              sampleBet.eventName ||
              sampleBet.event ||
              "Match",
            market_id: parseInt(
              (sampleBet.market_id || sampleBet.marketId || "1").toString(),
            ),
            market_name:
              sampleBet.market_name ||
              sampleBet.marketName ||
              sampleBet.market ||
              "Match Odds",
          };

          const result = await diamondApi.getResult(resultData);

          if (result?.data?.winner || result?.data?.result) {
            const resultKey = `sports_${eventId}_${result.data.winner || result.data.result}`;

            // Check if we've already processed this result
            if (!this.checkedResults.has(resultKey)) {
              console.log(
                `[ResultWS] New sports result for event ${eventId}:`,
                result.data,
              );

              this.checkedResults.add(resultKey);

              // Notify subscribers
              this.notifySubscribers({
                type: "sports",
                eventId,
                winner: result.data.winner || result.data.result,
                result: result.data,
                timestamp: Date.now(),
              });

              // Trigger settlement
              try {
                const winner = result.data.winner || result.data.result;
                const winnerId =
                  typeof winner === "number"
                    ? winner
                    : parseInt(winner?.toString() || "0");
                const settled = await settleSportsBets(eventId, winnerId);
                if (settled.length > 0) {
                  console.log(
                    `[ResultWS] Auto-settled ${settled.length} sports bets for event ${eventId}`,
                  );
                }
              } catch (err) {
                console.error(
                  `[ResultWS] Settlement error for event ${eventId}:`,
                  err,
                );
              }
            }
          }
        } catch (error) {
          // Silent fail for individual events
        }
      }
    } catch (error) {
      console.error("[ResultWS] Error checking sports results:", error);
    }
  }

  /**
   * Get all placed bets from API
   */
  private async getPlacedBets(): Promise<any[]> {
    try {
      const url = `${BASE_URL}/get_placed_bets?key=${API_KEY}`;
      const response = await fetch(url, {
        headers: { Accept: "*/*" },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error("[ResultWS] Error fetching placed bets:", error);
      return [];
    }
  }

  /**
   * Get detailed casino result
   */
  async getCasinoDetailResult(type: string, mid: string): Promise<any> {
    try {
      const url = `${BASE_URL}/casino/detail_result?type=${type}&mid=${mid}&key=${API_KEY}`;
      const response = await fetch(url, {
        headers: { Accept: "*/*" },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch casino detail result: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[ResultWS] Error fetching casino detail result:`, error);
      throw error;
    }
  }
}

export const resultWebSocket = new ResultWebSocketService();
