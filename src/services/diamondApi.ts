// Use environment variables with fallback to proxied relative path
// If `VITE_DIAMOND_API_HOST` starts with '/', treat it as a relative proxy path
const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST
  : API_PROTOCOL
  ? `${API_PROTOCOL}://${API_HOST}`
  : `http://${API_HOST}`;
export const CASINO_IMG_BASE_URL = "/game-image";
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
// Tunables for performance
const CONCURRENCY = Number(import.meta.env.VITE_DIAMOND_CONCURRENCY ?? 8);
const CACHE_TTL_MS = Number(import.meta.env.VITE_DIAMOND_CACHE_TTL ?? 5000);

// Lightweight in-memory caches (per-session)
const oddsCache: Map<number, { value: OddsData; expires: number }> = new Map();
const detailsCache: Map<
  number,
  { value: MatchEvent & Partial<MatchDetails>; expires: number }
> = new Map();

// Concurrency helper: process tasks with a fixed parallelism
async function mapWithConcurrency<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  limit: number,
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(items.length).fill(null);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      try {
        results[i] = await mapper(items[i], i);
      } catch (e) {
        console.warn("[Diamond API] Concurrency task failed", e);
        results[i] = null;
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, limit) }, worker);
  await Promise.all(workers.map((w) => w()));
  return results;
}

export interface SportId {
  sid: number;
  name: string;
  icon?: string;
}

export interface MatchEvent {
  gmid: number;
  sid: number;
  sname: string;
  name: string;
  is_live: boolean;
  start_date?: string;
  cname?: string;
  srno?: number;
}

export interface MatchDetails {
  gmid: number;
  sid: number;
  name: string;
  is_live: boolean;
  start_date: string;
  gtv?: number;
  teams?: {
    home: string;
    away: string;
  };
}

export interface OddsData {
  match_odds?: Array<{
    runner_name: string;
    odds?: any[];
    back?: { price: number; size?: number } | null;
    lay?: { price: number; size?: number } | null;
  }>;
  bookmaker?: Array<{
    runner_name: string;
    odds?: any[];
    back?: { price: number; size?: number } | null;
    lay?: { price: number; size?: number } | null;
  }>;
  fancy?: Array<{
    runner_name: string;
    runs?: number;
    odds?: any[];
    back?: { price: number; size?: number } | null;
    lay?: { price: number; size?: number } | null;
  }>;
}

export interface CasinoTable {
  id: string | number;
  name: string;
  gmid: string;
  imgpath: string;
}

export interface CasinoData {
  mid?: number;
  data?: any;
  odds?: any[];
}

export const diamondApi = {
  // Helper for API calls
  _fetch: async (endpoint: string, options: RequestInit = {}) => {
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${BASE_URL}${endpoint}${separator}key=${API_KEY}`;

    try {
      console.log(`[Diamond API] Fetching: ${endpoint}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const isKnownOddsEndpoint =
          endpoint.includes("/getPriveteData") ||
          endpoint.includes("/getDetailsData");
        const msg = `[Diamond API] Error ${response.status}: ${response.statusText}`;
        if (response.status === 400 && isKnownOddsEndpoint) {
          console.warn(msg, `Endpoint: ${endpoint}`);
          return null;
        }
        console.error(msg, `Endpoint: ${endpoint}`);
        return null;
      }

      const data = await response.json();
      console.log(`[Diamond API] Success:`, data);
      return data;
    } catch (error) {
      console.error("[Diamond API] Network Error:", error);
      return null;
    }
  },

  // Get all sport IDs
  getAllSportIds: async (): Promise<SportId[]> => {
    const data = await diamondApi._fetch("/allSportid");
    console.log("[Diamond API] getAllSportIds raw response:", data);

    if (!data || !data.data) {
      console.warn("[Diamond API] No data returned from /allSportid");
      return [];
    }

    // Some APIs may not provide 'active'; include all by default
    return (Array.isArray(data.data) ? data.data : [])
      .filter((sport: any) => sport.active !== false)
      .map((sport: any) => ({
        sid: Number(sport.eid),
        name: sport.ename || sport.name || String(sport.eid),
        icon: getSportIcon(Number(sport.eid)),
      }));
  },

  // Get all matches for all sports (tree endpoint)
  getAllMatches: async (): Promise<MatchEvent[]> => {
    const data = await diamondApi._fetch("/tree");
    console.log("[Diamond API] getAllMatches raw response:", data);

    if (!data || !data.data) {
      console.warn("[Diamond API] No data returned from /tree");
      return [];
    }

    const allMatches: MatchEvent[] = [];

    // Process t1 (main matches with odds)
    if (data.data.t1 && Array.isArray(data.data.t1)) {
      data.data.t1.forEach((sport: any) => {
        const sportId = sport.etid;
        const sportName = sport.name;

        if (sport.children && Array.isArray(sport.children)) {
          sport.children.forEach((competition: any) => {
            const competitionName = competition.name;

            if (competition.children && Array.isArray(competition.children)) {
              competition.children.forEach((match: any) => {
                allMatches.push({
                  gmid: match.gmid,
                  sid: sportId,
                  sname: sportName,
                  name: match.name || match.ename,
                  is_live: match.iplay || false,
                  start_date: match.stime,
                  cname: competitionName,
                  srno: match.srno || 0,
                });
              });
            }
          });
        }
      });
    }

    // Process t2 (additional matches - virtual/special)
    if (data.data.t2 && Array.isArray(data.data.t2)) {
      data.data.t2.forEach((match: any) => {
        allMatches.push({
          gmid: match.gmid,
          sid: match.etid,
          sname: match.cname || "Virtual",
          name: match.ename,
          is_live: match.iplay || false,
          start_date: match.stime,
          cname: match.cname,
          srno: 0,
        });
      });
    }

    console.log("[Diamond API] Total matches parsed:", allMatches.length);
    return allMatches;
  },

  // Get matches by sport ID
  getMatchesBySport: async (sportId: number): Promise<MatchEvent[]> => {
    const data = await diamondApi._fetch(`/esid?sid=${sportId}`);
    console.log(
      `[Diamond API] getMatchesBySport(${sportId}) raw response:`,
      data,
    );

    if (!data || !data.data) {
      console.warn(`[Diamond API] No data returned from /esid?sid=${sportId}`);
      return [];
    }

    const matches: MatchEvent[] = [];

    // Process t1 (main matches with odds)
    if (data.data.t1 && Array.isArray(data.data.t1)) {
      data.data.t1.forEach((match: any) => {
        matches.push({
          gmid: match.gmid,
          sid: match.etid,
          sname: match.cname,
          name: match.ename,
          is_live: match.iplay || false,
          start_date: match.stime,
          cname: match.cname,
          srno: 0,
        });
      });
    }

    // Process t2 (additional matches)
    if (data.data.t2 && Array.isArray(data.data.t2)) {
      data.data.t2.forEach((match: any) => {
        matches.push({
          gmid: match.gmid,
          sid: match.etid,
          sname: match.cname,
          name: match.ename,
          is_live: match.iplay || false,
          start_date: match.stime,
          cname: match.cname,
          srno: 0,
        });
      });
    }

    console.log(
      `[Diamond API] Total matches for sport ${sportId}:`,
      matches.length,
    );
    return matches;
  },

  // Get match details
  getMatchDetails: async (
    gmid: number,
    sid: number,
  ): Promise<MatchDetails | null> => {
    // Validate parameters
    if (!gmid || !sid || gmid <= 0 || sid <= 0) {
      console.warn(
        `[Diamond API] Invalid parameters for getMatchDetails: gmid=${gmid}, sid=${sid}`,
      );
      return null;
    }

    const data = await diamondApi._fetch(
      `/getDetailsData?gmid=${gmid}&sid=${sid}`,
    );
    console.log(
      `[Diamond API] getMatchDetails(${gmid}, ${sid}) raw response:`,
      data,
    );

    if (!data || !data.data) {
      console.warn(`[Diamond API] No details data returned for match ${gmid}`);
      return null;
    }

    const raw = Array.isArray(data.data) ? data.data[0] : data.data;
    if (!raw) {
      console.warn(`[Diamond API] Empty details data for match ${gmid}`);
      return null;
    }

    const name = raw.name || raw.ename || "";
    const teams = parseTeamNames(name);

    const result = {
      gmid: Number(raw.gmid) || gmid,
      sid: Number(raw.sid || raw.etid) || sid,
      name,
      is_live: Boolean(raw.is_live || raw.iplay),
      start_date: raw.start_date || raw.stime || "",
      gtv: Number(raw.gtv) || undefined,
      teams,
    };

    console.log(`[Diamond API] Parsed match details:`, result);
    return result;
  },

  // Get match odds, bookmaker and fancy (parse array markets)
  getMatchOdds: async (gmid: number, sid: number): Promise<OddsData | null> => {
    // Validate parameters before making API call
    if (!gmid || !sid || gmid <= 0 || sid <= 0) {
      console.warn(
        `[Diamond API] Invalid parameters for getMatchOdds: gmid=${gmid}, sid=${sid}`,
      );
      return null;
    }

    // Check cache first
    const cacheKey = gmid;
    const cached = oddsCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      console.log(`[Diamond API] Returning cached odds for match ${gmid}`);
      return cached.value;
    }

    const data = await diamondApi._fetch(
      `/getPriveteData?gmid=${gmid}&sid=${sid}`,
    );
    console.log(
      `[Diamond API] getMatchOdds(${gmid}, ${sid}) raw response:`,
      data,
    );

    if (!data || !data.data) {
      console.warn(`[Diamond API] No odds data returned for match ${gmid}`);
      return null;
    }

    const markets: any[] = Array.isArray(data.data) ? data.data : [];
    console.log(
      `[Diamond API] Markets found:`,
      markets.length,
      markets.map((m) => m?.mname),
    );

    const getMarket = (name: string) =>
      markets.find(
        (m) => (m?.mname || "").toUpperCase() === name.toUpperCase(),
      );

    const normalizeSection = (sec: any) => {
      const odds: any[] = Array.isArray(sec?.odds) ? sec.odds : [];
      const bestBack = odds
        .filter((o) => o.otype === "back")
        .sort((a, b) => b.odds - a.odds)[0];
      const bestLay = odds
        .filter((o) => o.otype === "lay")
        .sort((a, b) => a.odds - b.odds)[0];
      return {
        runner_name: sec.nat || sec.runner_name || sec.name || "Runner",
        odds: odds, // Include all odds for debugging
        back: bestBack
          ? { price: Number(bestBack.odds), size: bestBack.size }
          : null,
        lay: bestLay
          ? { price: Number(bestLay.odds), size: bestLay.size }
          : null,
      };
    };

    const toArray = (market: any | undefined) => {
      if (!market?.section) {
        console.log(`[Diamond API] No section found in market:`, market?.mname);
        return [];
      }
      return Array.isArray(market.section)
        ? market.section.map(normalizeSection)
        : [];
    };

    const matchMarket = getMarket("MATCH_ODDS");
    const bookmakerMarket = getMarket("BOOKMAKER");
    const fancyMarket = getMarket("NORMAL");

    console.log(`[Diamond API] Match Odds Market:`, matchMarket);
    console.log(`[Diamond API] Bookmaker Market:`, bookmakerMarket);

    const normalizeFancy = (sec: any) => {
      const base = normalizeSection(sec);
      return {
        ...base,
        runs: typeof sec.runs === "number" ? sec.runs : undefined,
      };
    };

    const result = {
      match_odds: toArray(matchMarket),
      bookmaker: toArray(bookmakerMarket),
      fancy: Array.isArray(fancyMarket?.section)
        ? fancyMarket.section.map(normalizeFancy)
        : [],
    };

    console.log(`[Diamond API] Parsed odds result:`, result);

    // Cache the result
    oddsCache.set(cacheKey, {
      value: result,
      expires: Date.now() + CACHE_TTL_MS,
    });

    return result;
  },

  // Get score iframe URL
  getScoreUrl: (gtv: number, sid: number): string => {
    return `${BASE_URL}/score?gtv=${gtv}&sid=${sid}&key=${API_KEY}`;
  },

  // Casino endpoints
  getCasinoTables: async (): Promise<CasinoTable[]> => {
    const data = await diamondApi._fetch("/casino/tableid");
    if (!data || !data.data) return [];

    // API response contains tables in 't1' array, and sometimes 't2'
    const tables = data.data.t1 || [];
    if (data.data.t2) {
      tables.push(...data.data.t2);
    }

    if (!Array.isArray(tables)) {
      console.warn(
        "[Diamond API] Expected array in data.data.t1, got:",
        tables,
      );
      return [];
    }

    return tables.map((table: any) => ({
      id: table.gmid || table.id || table.cid, // Prefer gmid as unique string ID, fallback to others
      name: table.gname || table.name,
      gmid: table.gmid,
      imgpath: table.imgpath,
    }));
  },

  getCasinoData: async (type: string | number): Promise<CasinoData | null> => {
    const data = await diamondApi._fetch(`/casino/data?type=${type}`);
    if (!data || !data.data) return null;

    return {
      mid: data.data.mid,
      data: data.data,
      odds: data.data.odds || [],
    };
  },

  getCasinoLastResult: async (type: string | number): Promise<any> => {
    const data = await diamondApi._fetch(`/casino/result?type=${type}`);
    return data?.data || null;
  },

  getCasinoDetailedResult: async (
    type: string | number,
    mid: number,
  ): Promise<any> => {
    const data = await diamondApi._fetch(
      `/casino/detail_result?type=${type}&mid=${mid}`,
    );
    return data?.data || null;
  },

  // Bet placement
  placeBet: async (betData: {
    event_id: number;
    event_name: string;
    market_id: number;
    market_name: string;
    market_type: string;
  }): Promise<any> => {
    const data = await diamondApi._fetch("/placed_bets", {
      method: "POST",
      body: JSON.stringify(betData),
    });
    return data;
  },

  // Get result
  getResult: async (resultData: {
    event_id: number;
    event_name: string;
    market_id: number;
    market_name: string;
  }): Promise<any> => {
    const data = await diamondApi._fetch("/get-result", {
      method: "POST",
      body: JSON.stringify(resultData),
    });
    return data;
  },

  // Get all placed bets results
  getPlacedBetsResults: async (eventId: number): Promise<any> => {
    const data = await diamondApi._fetch(
      `/get_placed_bets?event_id=${eventId}`,
    );
    return data?.data || [];
  },

  // Bulk fetch: odds for matches in a sport (limited by `max`)
  getAllMatchOddsBySport: async (
    sportId: number,
    max: number = 20,
  ): Promise<Record<number, OddsData>> => {
    const matches = await diamondApi.getMatchesBySport(sportId);
    if (!matches || matches.length === 0) return {};

    const slice = matches.slice(0, Math.max(0, max));
    const out: Record<number, OddsData> = {};

    const now = Date.now();
    const results = await mapWithConcurrency(
      slice,
      async (m) => {
        const cached = oddsCache.get(m.gmid);
        if (cached && cached.expires > now) {
          return cached.value;
        }
        const odds = await diamondApi.getMatchOdds(m.gmid, m.sid);
        if (odds) {
          oddsCache.set(m.gmid, { value: odds, expires: now + CACHE_TTL_MS });
        }
        return odds ?? null;
      },
      CONCURRENCY,
    );

    results.forEach((odds, i) => {
      const m = slice[i];
      if (odds) out[m.gmid] = odds;
    });

    return out;
  },

  // Bulk fetch: match details for a sport
  getAllMatchDetailsBySport: async (
    sportId: number,
    max: number = 20,
  ): Promise<Array<MatchEvent & Partial<MatchDetails>>> => {
    const matches = await diamondApi.getMatchesBySport(sportId);
    if (!matches || matches.length === 0) return [];

    const slice = matches.slice(0, Math.max(0, max));
    const now = Date.now();

    const results = await mapWithConcurrency(
      slice,
      async (m) => {
        const cached = detailsCache.get(m.gmid);
        if (cached && cached.expires > now) {
          return cached.value;
        }
        try {
          const details = await diamondApi.getMatchDetails(m.gmid, m.sid);
          const combined = {
            ...m,
            gtv: details?.gtv,
            teams: details?.teams,
            start_date: details?.start_date || m.start_date,
            is_live: details?.is_live ?? m.is_live,
            name: details?.name || m.name,
          };
          detailsCache.set(m.gmid, {
            value: combined,
            expires: now + CACHE_TTL_MS,
          });
          return combined;
        } catch (e) {
          console.warn("[Diamond API] Bulk details failed for", m.gmid, e);
          return m;
        }
      },
      CONCURRENCY,
    );

    return results.filter(Boolean) as Array<MatchEvent & Partial<MatchDetails>>;
  },

  // Aggregate: sports list, matches by sport, bulk details, bulk odds
  getSportAggregate: async (
    sportId: number,
    max: number = 20,
  ): Promise<{
    sports: SportId[];
    matches: MatchEvent[];
    details: Array<MatchEvent & Partial<MatchDetails>>;
    detailsByGmid: Record<number, MatchEvent & Partial<MatchDetails>>;
    oddsByGmid: Record<number, OddsData>;
  }> => {
    const sports = await diamondApi.getAllSportIds();
    const matches = await diamondApi.getMatchesBySport(sportId);
    const details = await diamondApi.getAllMatchDetailsBySport(sportId, max);
    const oddsByGmid = await diamondApi.getAllMatchOddsBySport(sportId, max);

    const detailsByGmid: Record<number, MatchEvent & Partial<MatchDetails>> =
      {};
    for (const d of details) {
      detailsByGmid[d.gmid] = d;
    }

    return { sports, matches, details, detailsByGmid, oddsByGmid };
  },
};

// Helper functions
function getSportIcon(sid: number): string {
  const icons: Record<number, string> = {
    1: "⚽", // Soccer
    2: "🎾", // Tennis
    4: "🏏", // Cricket
    5: "🏀", // Basketball
    6: "🏈", // American Football
    7: "🏐", // Volleyball
    8: "🏒", // Ice Hockey
    9: "🥊", // Boxing
    10: "🏉", // Rugby
  };
  return icons[sid] || "🏆";
}

function parseTeamNames(matchName: string): { home: string; away: string } {
  const separators = [" vs ", " v ", " VS ", " V "];

  for (const sep of separators) {
    if (matchName.includes(sep)) {
      const [home, away] = matchName.split(sep);
      return { home: home.trim(), away: away.trim() };
    }
  }

  return { home: matchName, away: "TBD" };
}
