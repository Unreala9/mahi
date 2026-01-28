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

// ✅ Default Sport ID (cricket)
const DEFAULT_SID = Number(import.meta.env.VITE_DIAMOND_DEFAULT_SID || 4);

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
    home: { name: string; score: string; overs?: string };
    away: { name: string; score: string; overs?: string };
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

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text || text.trim().startsWith("<")) {
    return { ok: false, json: null as any, raw: text };
  }
  try {
    return { ok: true, json: JSON.parse(text), raw: text };
  } catch {
    return { ok: false, json: null as any, raw: text };
  }
}

class EnhancedSportsService {
  private scoreSubscribers: Map<number, Set<(score: LiveScore) => void>> =
    new Map();
  private oddsSubscribers: Map<number, Set<(odds: MatchOdds) => void>> =
    new Map();

  private scoreIntervals: Map<number, ReturnType<typeof setInterval>> =
    new Map();
  private oddsIntervals: Map<number, ReturnType<typeof setInterval>> =
    new Map();

  async getAllSports(): Promise<any[]> {
    try {
      const url = `${BASE_URL}/allSportid?key=${API_KEY}`;
      const response = await fetch(url, { headers: { Accept: "*/*" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error(`[Enhanced Sports] Error fetching sports:`, error);
      return [];
    }
  }

  async getMatchTree(): Promise<any> {
    try {
      const url = `${BASE_URL}/tree?key=${API_KEY}`;
      const response = await fetch(url, { headers: { Accept: "*/*" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error(`[Enhanced Sports] Error fetching match tree:`, error);
      return {};
    }
  }

  async getMatchesBySport(sportId: number): Promise<SportEvent[]> {
    try {
      const url = `${BASE_URL}/esid?sid=${sportId}&key=${API_KEY}`;
      const response = await fetch(url, { headers: { Accept: "*/*" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (!result.data) return [];

      if (Array.isArray(result.data)) {
        return result.data.map((m: any) => this.transformMatchData(m, sportId));
      }

      if (result.data.eventdata) {
        return result.data.eventdata.map((m: any) =>
          this.transformMatchData(m, sportId),
        );
      }

      return [];
    } catch (error) {
      console.error(
        `[Enhanced Sports] Error fetching matches by sport:`,
        error,
      );
      return [];
    }
  }

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

  async getMatchOdds(gmid: number, sid: number): Promise<MatchOdds | null> {
    try {
      const url = `${BASE_URL}/getPriveteData?gmid=${gmid}&sid=${sid}&key=${API_KEY}`;
      const response = await fetch(url, { headers: { Accept: "*/*" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (!result.data) return null;
      return this.transformOddsData(result.data);
    } catch (error) {
      console.error(`[Enhanced Sports] Error fetching match odds:`, error);
      return null;
    }
  }

  private transformOddsData(data: any): MatchOdds {
    const odds: MatchOdds = {
      mid: data.mid || data.market_id || "",
      match_odds: [],
      bookmaker: [],
      fancy: [],
      toss: [],
    };

    if (Array.isArray(data.match_odds)) {
      odds.match_odds = data.match_odds.map((r: any) =>
        this.transformRunner(r),
      );
    }
    if (Array.isArray(data.bookmaker)) {
      odds.bookmaker = data.bookmaker.map((r: any) => this.transformRunner(r));
    }
    if (Array.isArray(data.fancy)) {
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
    if (Array.isArray(data.toss)) {
      odds.toss = data.toss.map((r: any) => this.transformRunner(r));
    }

    return odds;
  }

  private transformRunner(runner: any): MarketOdds {
    return {
      runner_name: runner.runner_name || runner.nation || runner.nat,
      selectionId: runner.selectionId || runner.sid || 0,
      back: this.transformOddsArray(runner.back || runner.b1),
      lay: this.transformOddsArray(runner.lay || runner.l1),
      status: this.getStatus(runner.gstatus || runner.status),
    };
  }

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

  private getStatus(status: any): "ACTIVE" | "SUSPENDED" | "CLOSED" {
    if (status === "1" || status === "ACTIVE" || status === true)
      return "ACTIVE";
    if (status === "0" || status === "SUSPENDED" || status === false)
      return "SUSPENDED";
    return "CLOSED";
  }

  async getLiveScore(gmid: number): Promise<LiveScore | null> {
    try {
      const url = `${SCORE_API_BASE}${SCORE_API_PATH}?gmid=${gmid}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) return await this.getFallbackScore(gmid, DEFAULT_SID);

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return await this.getFallbackScore(gmid, DEFAULT_SID);
      }

      const parsed = await safeJson(response);
      if (!parsed.ok || !parsed.json)
        return await this.getFallbackScore(gmid, DEFAULT_SID);

      const result = parsed.json;
      if (result.success && result.data)
        return this.transformScoreData(gmid, result.data);

      return await this.getFallbackScore(gmid, DEFAULT_SID);
    } catch (error) {
      console.error(`[Enhanced Sports] Error fetching live score:`, error);
      return await this.getFallbackScore(gmid, DEFAULT_SID);
    }
  }

  /**
   * ✅ FIX: matchDetails endpoint tumhare BASE_URL me 404 hai
   * so fallback tries multiple endpoints:
   * - getDetailsData (most common)
   * - matchDetails (if exists)
   */
  private async getFallbackScore(
    gmid: number,
    sid: number,
  ): Promise<LiveScore | null> {
    const candidates = [
      `${BASE_URL}/getDetailsData?gmid=${gmid}&sid=${sid}&key=${API_KEY}`,
      `${BASE_URL}/getDetailsData?gmid=${gmid}&key=${API_KEY}`, // some providers ignore sid
      `${BASE_URL}/matchDetails?gmid=${gmid}&sid=${sid}&key=${API_KEY}`,
      `${BASE_URL}/matchDetails?gmid=${gmid}&key=${API_KEY}`,
    ];

    for (const url of candidates) {
      try {
        const resp = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!resp.ok) continue;

        const ct = resp.headers.get("content-type") || "";
        if (!ct.includes("application/json")) continue;

        const parsed = await safeJson(resp);
        if (!parsed.ok || !parsed.json) continue;

        const result = parsed.json;
        const data = result?.data ?? result;

        // try resolve match object in any format
        const match = Array.isArray(data)
          ? data[0]
          : Array.isArray(data?.eventdata)
            ? data.eventdata[0]
            : data;

        if (!match) continue;

        const teams = String(match.ename || match.name || "").split(" v ");
        const team1 = teams[0] || "Team 1";
        const team2 = teams[1] || "Team 2";

        return {
          gmid,
          score: {
            home: { name: team1, score: "0", overs: undefined },
            away: { name: team2, score: "0", overs: undefined },
          },
          status: match.iplay ? "Live" : "Scheduled",
          timestamp: Date.now(),
        };
      } catch {
        // try next candidate
      }
    }

    return null;
  }

  private transformScoreData(gmid: number, data: any): LiveScore {
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

  subscribeToScore(
    gmid: number,
    callback: (score: LiveScore) => void,
  ): () => void {
    if (!this.scoreSubscribers.has(gmid))
      this.scoreSubscribers.set(gmid, new Set());
    this.scoreSubscribers.get(gmid)!.add(callback);

    this.startScorePolling(gmid);
    return () => this.unsubscribeFromScore(gmid, callback);
  }

  private unsubscribeFromScore(
    gmid: number,
    callback: (score: LiveScore) => void,
  ) {
    const callbacks = this.scoreSubscribers.get(gmid);
    if (!callbacks) return;

    callbacks.delete(callback);
    if (callbacks.size === 0) this.stopScorePolling(gmid);
  }

  private startScorePolling(gmid: number) {
    if (this.scoreIntervals.has(gmid)) return;

    const poll = async () => {
      const score = await this.getLiveScore(gmid);
      if (score) this.notifyScoreSubscribers(gmid, score);
    };

    poll();
    const interval = setInterval(poll, 5000);
    this.scoreIntervals.set(gmid, interval);
  }

  private stopScorePolling(gmid: number) {
    const interval = this.scoreIntervals.get(gmid);
    if (!interval) return;
    clearInterval(interval);
    this.scoreIntervals.delete(gmid);
  }

  private notifyScoreSubscribers(gmid: number, score: LiveScore) {
    const callbacks = this.scoreSubscribers.get(gmid);
    if (!callbacks) return;

    callbacks.forEach((cb) => {
      try {
        cb(score);
      } catch (e) {
        console.error("[Enhanced Sports] score callback error:", e);
      }
    });
  }

  subscribeToOdds(
    gmid: number,
    sid: number,
    callback: (odds: MatchOdds) => void,
  ): () => void {
    if (!this.oddsSubscribers.has(gmid))
      this.oddsSubscribers.set(gmid, new Set());
    this.oddsSubscribers.get(gmid)!.add(callback);

    this.startOddsPolling(gmid, sid);
    return () => this.unsubscribeFromOdds(gmid, callback);
  }

  private unsubscribeFromOdds(
    gmid: number,
    callback: (odds: MatchOdds) => void,
  ) {
    const callbacks = this.oddsSubscribers.get(gmid);
    if (!callbacks) return;

    callbacks.delete(callback);
    if (callbacks.size === 0) this.stopOddsPolling(gmid);
  }

  private startOddsPolling(gmid: number, sid: number) {
    if (this.oddsIntervals.has(gmid)) return;

    const poll = async () => {
      const odds = await this.getMatchOdds(gmid, sid);
      if (odds) this.notifyOddsSubscribers(gmid, odds);
    };

    poll();
    const interval = setInterval(poll, 2000);
    this.oddsIntervals.set(gmid, interval);
  }

  private stopOddsPolling(gmid: number) {
    const interval = this.oddsIntervals.get(gmid);
    if (!interval) return;
    clearInterval(interval);
    this.oddsIntervals.delete(gmid);
  }

  private notifyOddsSubscribers(gmid: number, odds: MatchOdds) {
    const callbacks = this.oddsSubscribers.get(gmid);
    if (!callbacks) return;

    callbacks.forEach((cb) => {
      try {
        cb(odds);
      } catch (e) {
        console.error("[Enhanced Sports] odds callback error:", e);
      }
    });
  }

  getLiveStreamUrl(gmid: string): string {
    return `${LIVE_STREAM_BASE}?gmid=${gmid}&key=${API_KEY}`;
  }

  async placeBet(betRequest: BetRequest): Promise<any> {
    const url = `${BASE_URL}/placed_bets?key=${API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { Accept: "*/*", "Content-Type": "application/json" },
      body: JSON.stringify(betRequest),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`HTTP ${response.status}: ${txt}`);
    }

    return await response.json();
  }

  async getPlacedBets(eventId: number): Promise<any[]> {
    try {
      const url = `${BASE_URL}/get_placed_bets?event_id=${eventId}&key=${API_KEY}`;
      const response = await fetch(url, { headers: { Accept: "*/*" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error(`[Enhanced Sports] Error getting placed bets:`, error);
      return [];
    }
  }

  cleanup() {
    this.scoreIntervals.forEach((i) => clearInterval(i));
    this.scoreIntervals.clear();
    this.oddsIntervals.forEach((i) => clearInterval(i));
    this.oddsIntervals.clear();
    this.scoreSubscribers.clear();
    this.oddsSubscribers.clear();
  }
}

export const enhancedSportsService = new EnhancedSportsService();

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    enhancedSportsService.cleanup();
  });
}
