import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const sportId = searchParams.get("sportId");
    const eventId = searchParams.get("eventId");

    // REAL DATA IMPLEMENTATION
    const SPORTBEX_API_KEY =
      Deno.env.get("SPORTBEX_API_KEY") ||
      Deno.env.get("VITE_SPORTBEX_API_KEY") ||
      "shiZvksuvSPpLCBSlVpOEFyLeQi4pjIC1jWl1GT1";
    const BASE_URL = "https://trial-api.sportbex.com/api";

    const fetchSportBex = async (
      endpoint: string,
      method = "GET",
      body: any = null
    ) => {
      try {
        const options: RequestInit = {
          method,
          headers: {
            "sportbex-api-key": SPORTBEX_API_KEY,
            "Content-Type": "application/json",
          },
        };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(`${BASE_URL}${endpoint}`, options);
        if (!res.ok) {
          console.error(`SportBex Error: ${res.status} ${await res.text()}`);
          return null;
        }
        return await res.json();
      } catch (e) {
        console.error("Fetch Error:", e);
        return null;
      }
    };

    const SPORT_IDS: Record<string, string> = {
      soccer: "1",
      tennis: "2",
      cricket: "4",
    };

    let result: any = null;

    if (action === "sports") {
      // Static list for now as per SportBex constraints
      result = [
        { id: "soccer", name: "Soccer", sportId: "1" },
        { id: "tennis", name: "Tennis", sportId: "2" },
        { id: "cricket", name: "Cricket", sportId: "4" },
      ];
    } else if (action === "events") {
      const sportNumericId = SPORT_IDS[sportId || ""] || "1";

      // Step 1: Get Competitions
      const competitions = await fetchSportBex(
        `/betfair/competitions/${sportNumericId}`
      );

      const allMatches: any[] = [];

      if (Array.isArray(competitions)) {
        // Limit to top 5 competitions to ensure speed
        const topComps = competitions.slice(0, 5);

        // Step 2: Get Matches for each competition in parallel
        const matchPromises = topComps.map(async (comp: any) => {
          const compId = comp.competition?.id || comp.id;
          // Try primary match endpoint
          const matches = await fetchSportBex(
            `/betfair/events?competitionId=${compId}`
          );
          if (Array.isArray(matches)) {
            return matches.map((m: any) => ({
              id: m.event?.id || m.id,
              name: m.event?.name || m.name || "Unknown Match",
              startTime: m.event?.openDate || new Date().toISOString(),
              sportId: sportId,
              competitionName: comp.competition?.name || "League",
            }));
          }
          return [];
        });

        const results = await Promise.all(matchPromises);
        results.forEach((arr) => allMatches.push(...arr));
      }

      result = allMatches;
    } else if (action === "markets") {
      if (!eventId) throw new Error("eventId required");

      // Fetch odds using POST
      const oddsData = await fetchSportBex(`/betfair/market_odds`, "POST", {
        eventId,
      });

      // Transform to simplified structure if needed, or return raw
      // Frontend typically expects: id, name, outcomes: [{id, name, odds}]

      if (Array.isArray(oddsData)) {
        result = oddsData.map((market: any) => ({
          id: market.marketId,
          name: market.marketName,
          outcomes:
            market.runners?.map((runner: any) => ({
              id: runner.selectionId,
              name: runner.runnerName,
              odds: runner.lastPriceTraded || 0,
            })) || [],
        }));
      } else {
        result = [];
      }
    } else {
      throw new Error("Invalid action");
    }

    // Fallback to empty array if null
    if (!result) result = [];

    // Log to api_logs
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await serviceClient.from("api_logs").insert({
      user_id: user?.id || null, // Allow unauthenticated log if user is null (for public sports)
      area: "sports",
      endpoint: action,
      request_json: { sportId, eventId },
      response_json: Array.isArray(result) ? "List" : "Object", // Don't log full list
      status_code: 200,
      latency_ms: 100,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
