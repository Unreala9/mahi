import { Sport, Fixture } from "@/types/sportbex";

const BASE_URL = "https://trial-api.sportbex.com/api";
const API_KEY = import.meta.env.VITE_SPORTBEX_API_KEY;

// Sport IDs from SportBex (Common ones)
const SPORT_IDS: Record<string, string> = {
  soccer: "1",
  tennis: "2",
  cricket: "4",
};

export const sportBexService = {
  // Helper for requests
  _fetch: async (
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: any
  ) => {
    if (!API_KEY) {
      console.warn("[SportBex] API Key missing! Cannot fetch real data.");
      return null;
    }

    const url = `${BASE_URL}${endpoint}`;
    console.log(`[SportBex] ${method} Fetching: ${url}`);

    try {
      const options: RequestInit = {
        method,
        headers: {
          "sportbex-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);

      console.log(`[SportBex] Status: ${res.status}`);

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      console.log(
        `[SportBex] Success. Records:`,
        Array.isArray(json) ? json.length : "Object"
      );
      return json;
    } catch (error) {
      console.error("[SportBex] Net Error:", error);
      return null;
    }
  },

  getSports: async (): Promise<Sport[]> => {
    // Static navigation list
    return [
      { id: "1", name: "Soccer", icon: "⚽", count: 0 },
      { id: "2", name: "Tennis", icon: "🎾", count: 0 },
      { id: "4", name: "Cricket", icon: "🏏", count: 0 },
    ];
  },

  getFixtures: async (sportId: string = "1"): Promise<Fixture[]> => {
    let numericId = SPORT_IDS[sportId] || sportId;
    if (numericId === "all") numericId = "1";

    // FETCH COMPETITIONS (Leagues)
    const data = await sportBexService._fetch(
      `/betfair/competitions/${numericId}`
    );

    if (!data || !Array.isArray(data)) {
      return [];
    }

    try {
      const mapped: Fixture[] = data.map((item: any) => ({
        id: item.competition?.id?.toString() || item.id?.toString(),
        sportId: numericId,
        league: {
          id: item.competition?.id || "0",
          name: item.competition?.region || "Region",
          country: "",
        },
        participants: {
          home: { name: `🏆 ${item.competition?.name || "League"}` },
          away: { name: `(Tap to View Matches)` },
        },
        startTime: new Date().toISOString(), // No time for leagues
        status: "prematch",
        markets: [],
        isLeague: true,
      }));

      return mapped;
    } catch (e) {
      console.error("Map Error", e);
      return [];
    }
  },

  getMatches: async (competitionId: string): Promise<Fixture[]> => {
    console.log(
      `[SportBex] Fetching Matches for Competition: ${competitionId}`
    );

    // STRATEGY: Try multiple likely endpoints since documentation is ambiguous.
    const strategies = [
      `/betfair/competitions/${competitionId}/matches`,
      `/betfair/events/by-competition/${competitionId}`,
      `/betfair/events?competitionId=${competitionId}`,
      `/betfair/competitions/${competitionId}/events`, // Keep as backup
    ];

    for (const endpoint of strategies) {
      console.log(`[SportBex] Trying Endpoint: ${endpoint}`);
      const data = await sportBexService._fetch(endpoint);

      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`[SportBex] Success with endpoint: ${endpoint}`);
        console.log(
          "[SportBex] RAW MATCH DATA:",
          JSON.stringify(data[0], null, 2)
        );

        // Map the successful data
        try {
          return data.map((item: any) => ({
            id: item.event?.id || item.id,
            sportId: "1",
            league: {
              id: competitionId,
              name: item.competition?.name || "League",
              country: "",
            },
            participants: {
              home: {
                name: item.event?.name?.split(" v ")[0] || item.event?.name,
              },
              away: { name: item.event?.name?.split(" v ")[1] || "Away" },
            },
            startTime: item.event?.openDate,
            status: "prematch",
            markets: [],
          }));
        } catch (e) {
          console.error("Match mapping error", e);
          return [];
        }
      }
    }

    console.warn("[SportBex] All match endpoints failed or returned empty.");
    return [];
  },

  // New: Fetch Odds
  getMarketOdds: async (eventId: string, sportId: string = "1") => {
    const data = await sportBexService._fetch(`/betfair/market_odds`, "POST", {
      eventId: eventId,
    });
    return data;
  },
};
