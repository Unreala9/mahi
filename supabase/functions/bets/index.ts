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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (action === "place" && req.method === "POST") {
      const body = await req.json();
      const { sportId, eventId, marketId, selectionId, odds, stake } = body;

      // In real scenario, call provider API here to place bet
      // For now, allow everything
      const providerBetId = `bet_${Date.now()}`;

      const { data, error } = await serviceClient
        .from("bets")
        .insert({
          user_id: user.id,
          provider_bet_id: providerBetId,
          sport: sportId,
          event: eventId,
          market: marketId,
          selection: selectionId,
          odds: odds,
          stake: stake,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Log transaction too? Maybe later

      await serviceClient.from("api_logs").insert({
        user_id: user.id,
        area: "bets",
        endpoint: "place",
        request_json: body,
        response_json: data,
        status_code: 200,
        latency_ms: 50,
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (action === "my") {
      const { data, error } = await supabaseClient
        .from("bets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
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
