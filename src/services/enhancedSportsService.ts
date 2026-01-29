/**
 * Enhanced Sports Betting Service with comprehensive API integration
 * Supports match data, odds, live scores, and betting operations
 */

const API_HOST =
  import.meta.env.VITE_DIAMOND_API_HOST || "130.250.191.174:3009";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST
  : `${API_PROTOCOL}://${API_HOST}`;
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

// Score API - Multiple endpoints for redundancy
export const SCORE_API_BASE = "https://score.akamaized.uk";
export const SCORE_API_PATH = "/diamond-live-score";
export const LIVE_STREAM_BASE = "https://live.cricketid.xyz/directStream";

export interface SportEvent {
  gmid: number;
  sid: number;
  sname: string;
  name: string;
  is_live: boolean;
  start_date: string;
  cname?: string;
  srno?: number;
}

export interface MatchOdds {
  mid: string;
  match_odds?: MarketOdds[];
  bookmaker?: MarketOdds[];
  fancy?: FancyOdds[];
  toss?: MarketOdds[];
}

export interface MarketOdds {
  runner_name: string;
  selectionId: number;
  back: OddsValue[];
  lay: OddsValue[];
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
}

export interface FancyOdds {
  runner_name: string;
  selectionId: number;
  runs?: number;
  yes: OddsValue[];
  no: OddsValue[];
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  min_stake?: number;
  max_stake?: number;
}

export interface OddsValue {
  price: number;
  size: number;
}

export interface LiveScore {
  gmid: number;
  score: {
    home: {
      name: string;
      score: string;
      overs?: string;
    };
    away: {
      name: string;
      score: string;
      overs?: string;
    };
  };
  status: string;
  current_innings?: string;
  recent_overs?: string[];
  last_wicket?: string;
  partnership?: string;
  required_run_rate?: number;
  timestamp: number;
}

export interface BetRequest {
  event_id: number;
  event_name: string;
  market_id: number;
  market_name: string;
  market_type: "MATCH_ODDS" | "BOOKMAKER" | "FANCY" | "TOSS";
  selection: string;
  selection_id: number;
  odds: number;
  stake: number;
  bet_type: "BACK" | "LAY";
  is_lay?: boolean;
}

class EnhancedSportsService {
  private scoreSubscribers: Map<number, Set<(score: LiveScore) => void>> =
    new Map();
  private oddsSubscribers: Map<number, Set<(odds: MatchOdds) => void>> =
    new Map();
  private scoreIntervals: Map<number, NodeJS.Timeout> = new Map();
  private oddsIntervals: Map<number, NodeJS.Timeout> = new Map();

  /**
   * Get all sports
   */
  async getAllSports(): Promise<any[]> {
    try {
      const url = `${BASE_URL}/allSportid?key=${API_KEY}`;
      console.log(`[Enhanced Sports] Fetching all sports`);

      const response = await fetch(url, {
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error(`[Enhanced Sports] Error fetching sports:`, error);
      return [];
    }
  }

  /**
   * Get all matches (tree structure)
   */
  async getMatchTree(): Promise<any> {
    try {
      const url = `${BASE_URL}/tree?key=${API_KEY}`;
      console.log(`[Enhanced Sports] Fetching match tree`);

      const response = await fetch(url, {
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error(`[Enhanced Sports] Error fetching match tree:`, error);
      return {};
    }
  }

  /**
   * Get matches by sport ID
   */
  async getMatchesBySport(sportId: number): Promise<SportEvent[]> {
    try {
      const url = `${BASE_URL}/esid?sid=${sportId}&key=${API_KEY}`;
      console.log(`[Enhanced Sports] Fetching matches for sport: ${sportId}`);

      const response = await fetch(url, {
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data) return [];

      // Transform the data
      const matches: SportEvent[] = [];

      // Handle different response structures
      if (Array.isArray(result.data)) {
        return result.data.map((match: any) =>
          this.transformMatchData(match, sportId),
        );
      } else if (result.data.eventdata) {
        return result.data.eventdata.map((match: any) =>
          this.transformMatchData(match, sportId),
        );
      }

      return matches;
    } catch (error) {
      console.error(
        `[Enhanced Sports] Error fetching matches by sport:`,
        error,
      );
      return [];
    }
  }

  /**
   * Transform match data to consistent format
   */
  private transformMatchData(match: any, sportId: number): SportEvent {
    return {
      gmid: match.gmid || match.event_id,
      sid: sportId,
      sname: match.sname || match.sport_name || "",
      name: match.name || match.event_name || "",
      is_live:
        match.is_live === 1 || match.is_live === true || match.inplay === 1,
      start_date:
        match.start_date || match.open_date || new Date().toISOString(),
      cname: match.cname || match.competition_name,
      srno: match.srno || 0,
    };
  }

  /**
   * Get match odds and data
   */
  async getMatchOdds(gmid: number, sid: number): Promise<MatchOdds | null> {
    try {
      const url = `${BASE_URL}/getPriveteData?gmid=${gmid}&sid=${sid}&key=${API_KEY}`;
      console.log(`[Enhanced Sports] Fetching odds for match: ${gmid}`);

      const response = await fetch(url, {
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data) return null;

      return this.transformOddsData(result.data);
    } catch (error) {
      console.error(`[Enhanced Sports] Error fetching match odds:`, error);
      return null;
    }
  }

  /**
   * Transform odds data to consistent format
   */
  private transformOddsData(data: any): MatchOdds {
    const odds: MatchOdds = {
      mid: data.mid || data.market_id || "",
      match_odds: [],
      bookmaker: [],
      fancy: [],
      toss: [],
    };

    // Transform match odds
    if (data.match_odds && Array.isArray(data.match_odds)) {
      odds.match_odds = data.match_odds.map((runner: any) =>
        this.transformRunner(runner),
      );
    }

    // Transform bookmaker
    if (data.bookmaker && Array.isArray(data.bookmaker)) {
      odds.bookmaker = data.bookmaker.map((runner: any) =>
        this.transformRunner(runner),
      );
    }

    // Transform fancy
    if (data.fancy && Array.isArray(data.fancy)) {
      odds.fancy = data.fancy.map((runner: any) => ({
        runner_name: runner.runner_name || runner.nation || runner.nat,
        selectionId: runner.selectionId || runner.sid || 0,
        runs: runner.runs || runner.run || 0,
        yes: this.transformOddsArray(runner.yes || runner.b1 || runner.back),
        no: this.transformOddsArray(runner.no || runner.l1 || runner.lay),
        status: this.getStatus(runner.gstatus || runner.status),
        min_stake: runner.min || 100,
        max_stake: runner.max || 100000,
      }));
    }

    // Transform toss
    if (data.toss && Array.isArray(data.toss)) {
      odds.toss = data.toss.map((runner: any) => this.transformRunner(runner));
    }

    return odds;
  }

  /**
   * Transform runner data
   */
  private transformRunner(runner: any): MarketOdds {
    return {
      runner_name: runner.runner_name || runner.nation || runner.nat,
      selectionId: runner.selectionId || runner.sid || 0,
      back: this.transformOddsArray(runner.back || runner.b1),
      lay: this.transformOddsArray(runner.lay || runner.l1),
      status: this.getStatus(runner.gstatus || runner.status),
    };
  }

  /**
   * Transform odds array
   */
  private transformOddsArray(oddsData: any): OddsValue[] {
    if (!oddsData) return [];

    if (Array.isArray(oddsData)) {
      return oddsData
        .filter((odd) => odd && (odd.price || odd.rate || odd.odds))
        .map((odd) => ({
          price: parseFloat(odd.price || odd.rate || odd.odds || 0),
          size: parseFloat(odd.size || odd.volume || 0),
        }));
    }

    // Single odds object
    if (oddsData.price || oddsData.rate || oddsData.odds) {
      return [
        {
          price: parseFloat(
            oddsData.price || oddsData.rate || oddsData.odds || 0,
          ),
          size: parseFloat(oddsData.size || oddsData.volume || 0),
        },
      ];
    }

    return [];
  }

  /**
   * Get status from various formats
   */
  private getStatus(status: any): "ACTIVE" | "SUSPENDED" | "CLOSED" {
    if (status === "1" || status === "ACTIVE" || status === true) {
      return "ACTIVE";
    } else if (status === "0" || status === "SUSPENDED" || status === false) {
      return "SUSPENDED";
    }
    return "CLOSED";
  }

  /**
   * Get live score for a match
   */
  async getLiveScore(gmid: number): Promise<LiveScore | null> {
    try {
      // Try primary score API
      const url = `${SCORE_API_BASE}${SCORE_API_PATH}?gmid=${gmid}`;
      console.log(`[Enhanced Sports] Fetching live score for match: ${gmid}`);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn(
          `[Enhanced Sports] Score API returned ${response.status}, trying fallback. Response: ${text}`,
        );
        return await this.getFallbackScore(gmid);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn(
          `[Enhanced Sports] Score API non-JSON response: ${contentType}. Response: ${text}`
        );
        return await this.getFallbackScore(gmid);
      }

      const result = await response.json();
      console.log(`[Enhanced Sports] Score API response:`, result);

      if (result.success && result.data) {
        return this.transformScoreData(gmid, result.data);
      }

      // Try fallback if no data
      return await this.getFallbackScore(gmid);
    } catch (error) {
      console.error(`[Enhanced Sports] Error fetching live score:`, error);
      return await this.getFallbackScore(gmid);
    }
  }

  /**
   * Get fallback score from match details API
   */
  private async getFallbackScore(gmid: number): Promise<LiveScore | null> {
    try {
      console.log(
        `[Enhanced Sports] Using fallback score source for match: ${gmid}`,
      );

      // Try to get match details which might have score info
      const url = `${BASE_URL}/matchDetails?gmid=${gmid}&key=${API_KEY}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn(
          `[Enhanced Sports] Fallback score failed: ${response.status} ${response.statusText}`,
        );
        return null;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn(`[Enhanced Sports] Fallback expected JSON but got: ${contentType}. Response: ${text}`);
        return null;
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const match = result.data[0];

        // Create a basic score structure from match details
        return {
          gmid,
          score: {
            home: {
              name: match.ename?.split(" v ")[0] || "Team 1",
              score: "0",
              overs: undefined,
            },
            away: {
              name: match.ename?.split(" v ")[1] || "Team 2",
              score: "0",
              overs: undefined,
            },
          },
          status: match.iplay ? "Live" : "Scheduled",
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error(`[Enhanced Sports] Fallback score also failed:`, error);
      return null;
    }
  }

  /**
   * Transform score data
   */
  private transformScoreData(gmid: number, data: any): LiveScore {
    // Handle various response formats
    const homeTeam =
      data.team1 || data.home_team || data.t1 || data.home || "Team 1";
    const awayTeam =
      data.team2 || data.away_team || data.t2 || data.away || "Team 2";
    const homeScore =
      data.team1_score ||
      data.home_score ||
      data.t1_score ||
      data.score1 ||
      "0";
    const awayScore =
      data.team2_score ||
      data.away_score ||
      data.t2_score ||
      data.score2 ||
      "0";
    const homeOvers =
      data.team1_overs || data.home_overs || data.t1_overs || data.overs1;
    const awayOvers =
      data.team2_overs || data.away_overs || data.t2_overs || data.overs2;

    return {
      gmid,
      score: {
        home: {
          name: String(homeTeam),
          score: String(homeScore),
          overs: homeOvers ? String(homeOvers) : undefined,
        },
        away: {
          name: String(awayTeam),
          score: String(awayScore),
          overs: awayOvers ? String(awayOvers) : undefined,
        },
      },
      status: data.status || data.match_status || "In Progress",
      current_innings: data.current_innings,
      recent_overs: data.recent_overs || [],
      last_wicket: data.last_wicket,
      partnership: data.partnership,
      required_run_rate: data.required_run_rate || data.rrr,
      timestamp: Date.now(),
    };
  }

  /**
   * Subscribe to live score updates
   */
  subscribeToScore(
    gmid: number,
    callback: (score: LiveScore) => void,
  ): () => void {
    console.log(`[Enhanced Sports] Subscribing to score updates: ${gmid}`);

    if (!this.scoreSubscribers.has(gmid)) {
      this.scoreSubscribers.set(gmid, new Set());
    }
    this.scoreSubscribers.get(gmid)!.add(callback);

    this.startScorePolling(gmid);

    return () => {
      this.unsubscribeFromScore(gmid, callback);
    };
  }

  /**
   * Unsubscribe from score updates
   */
  private unsubscribeFromScore(
    gmid: number,
    callback: (score: LiveScore) => void,
  ) {
    const callbacks = this.scoreSubscribers.get(gmid);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.stopScorePolling(gmid);
      }
    }
  }

  /**
   * Start polling for score updates
   */
  private startScorePolling(gmid: number) {
    if (this.scoreIntervals.has(gmid)) return;

    const poll = async () => {
      try {
        const score = await this.getLiveScore(gmid);
        if (score) {
          this.notifyScoreSubscribers(gmid, score);
        }
      } catch (error) {
        console.error(
          `[Enhanced Sports] Score polling error for ${gmid}:`,
          error,
        );
      }
    };

    // Initial fetch
    poll();

    // Poll every 5 seconds (reduced from 3 to avoid rate limiting)
    const interval = setInterval(poll, 5000);
    this.scoreIntervals.set(gmid, interval);
  }

  /**
   * Stop polling for score updates
   */
  private stopScorePolling(gmid: number) {
    const interval = this.scoreIntervals.get(gmid);
    if (interval) {
      clearInterval(interval);
      this.scoreIntervals.delete(gmid);
    }
  }

  /**
   * Notify score subscribers
   */
  private notifyScoreSubscribers(gmid: number, score: LiveScore) {
    const callbacks = this.scoreSubscribers.get(gmid);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(score);
        } catch (error) {
          console.error(`[Enhanced Sports] Error in score callback:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to odds updates
   */
  subscribeToOdds(
    gmid: number,
    sid: number,
    callback: (odds: MatchOdds) => void,
  ): () => void {
    console.log(`[Enhanced Sports] Subscribing to odds updates: ${gmid}`);

    if (!this.oddsSubscribers.has(gmid)) {
      this.oddsSubscribers.set(gmid, new Set());
    }
    this.oddsSubscribers.get(gmid)!.add(callback);

    this.startOddsPolling(gmid, sid);

    return () => {
      this.unsubscribeFromOdds(gmid, callback);
    };
  }

  /**
   * Unsubscribe from odds updates
   */
  private unsubscribeFromOdds(
    gmid: number,
    callback: (odds: MatchOdds) => void,
  ) {
    const callbacks = this.oddsSubscribers.get(gmid);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.stopOddsPolling(gmid);
      }
    }
  }

  /**
   * Start polling for odds updates
   */
  private startOddsPolling(gmid: number, sid: number) {
    if (this.oddsIntervals.has(gmid)) return;

    const poll = async () => {
      const odds = await this.getMatchOdds(gmid, sid);
      if (odds) {
        this.notifyOddsSubscribers(gmid, odds);
      }
    };

    poll();
    const interval = setInterval(poll, 2000); // Poll every 2 seconds
    this.oddsIntervals.set(gmid, interval);
  }

  /**
   * Stop polling for odds updates
   */
  private stopOddsPolling(gmid: number) {
    const interval = this.oddsIntervals.get(gmid);
    if (interval) {
      clearInterval(interval);
      this.oddsIntervals.delete(gmid);
    }
  }

  /**
   * Notify odds subscribers
   */
  private notifyOddsSubscribers(gmid: number, odds: MatchOdds) {
    const callbacks = this.oddsSubscribers.get(gmid);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(odds);
        } catch (error) {
          console.error(`[Enhanced Sports] Error in odds callback:`, error);
        }
      });
    }
  }

  /**
   * Get live stream URL for a match
   */
  getLiveStreamUrl(gmid: string): string {
    return `${LIVE_STREAM_BASE}?gmid=${gmid}&key=${API_KEY}`;
  }

  /**
   * Place a bet
   */
  async placeBet(betRequest: BetRequest): Promise<any> {
    try {
      const url = `${BASE_URL}/placed_bets?key=${API_KEY}`;
      console.log(`[Enhanced Sports] Placing bet:`, betRequest);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(betRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
      }

      const result = await response.json();
      console.log(`[Enhanced Sports] Bet placed successfully:`, result);
      return result;
    } catch (error) {
      console.error(`[Enhanced Sports] Error placing bet:`, error);
      throw error;
    }
  }

  /**
   * Get result for a market
   */
  async getResult(request: {
    event_id: number;
    event_name: string;
    market_id: number;
    market_name: string;
  }): Promise<any> {
    try {
      const url = `${BASE_URL}/get-result?key=${API_KEY}`;
      console.log(`[Enhanced Sports] Getting result:`, request);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[Enhanced Sports] Result fetched:`, result);
      return result;
    } catch (error) {
      console.error(`[Enhanced Sports] Error getting result:`, error);
      throw error;
    }
  }

  /**
   * Get all placed bets for an event
   */
  async getPlacedBets(eventId: number): Promise<any[]> {
    try {
      const url = `${BASE_URL}/get_placed_bets?event_id=${eventId}&key=${API_KEY}`;
      console.log(
        `[Enhanced Sports] Getting placed bets for event: ${eventId}`,
      );

      const response = await fetch(url, {
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error(`[Enhanced Sports] Error getting placed bets:`, error);
      return [];
    }
  }

  /**
   * Cleanup all connections and intervals
   */
  cleanup() {
    this.scoreIntervals.forEach((interval) => clearInterval(interval));
    this.scoreIntervals.clear();

    this.oddsIntervals.forEach((interval) => clearInterval(interval));
    this.oddsIntervals.clear();

    this.scoreSubscribers.clear();
    this.oddsSubscribers.clear();
  }
}

// Export singleton instance
export const enhancedSportsService = new EnhancedSportsService();

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    enhancedSportsService.cleanup();
  });
}
