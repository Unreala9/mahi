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

    // Remove global 401 check so we can allow public actions
    // if (!user) ...

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // MOCK DATA implementation
    const isMock = Deno.env.get("MOCK_PROVIDER") === "true";

    if (action === "games") {
      const games = isMock
        ? [
            {
              id: "1",
              name: "Dragon's Fortune",
              category: "Slots",
              image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop",
              rating: 4.9,
              players: "12.5K",
              hot: true,
            },
            {
              id: "2",
              name: "Blackjack Pro",
              category: "Card Games",
              image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=300&fit=crop",
              rating: 4.8,
              players: "8.2K",
              hot: false,
            },
            {
              id: "3",
              name: "Lucky Roulette",
              category: "Table Games",
              image: "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&h=300&fit=crop",
              rating: 4.7,
              players: "15.1K",
              hot: true,
            },
            {
              id: "4",
              name: "Crypto Crash",
              category: "Crash Games",
              image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
              rating: 4.9,
              players: "20.3K",
              hot: true,
            },
            {
              id: "5",
              name: "Live Dealer",
              category: "Live Casino",
              image: "https://images.unsplash.com/photo-1606185540834-d6e7483ee1a4?w=400&h=300&fit=crop",
              rating: 4.9,
              players: "22.1K",
              hot: true,
            },
          ]
        : [];

      return new Response(JSON.stringify(games), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (action === "launch" && req.method === "POST") {
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      const { gameId } = await req.json();

      // Mock launch URL or call provider
      const launchUrl = isMock ? `https://example.com/play/${gameId}` : "";

      // Log session
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await serviceClient.from("casino_sessions").insert({
        user_id: user.id,
        game_id: gameId,
        launch_url: launchUrl,
      });

      await serviceClient.from("api_logs").insert({
        user_id: user.id,
        area: "casino",
        endpoint: "launch",
        request_json: { gameId },
        response_json: { launchUrl },
        status_code: 200,
        latency_ms: 150,
      });

      return new Response(JSON.stringify({ launchUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
