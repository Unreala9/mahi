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
      },
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (action === "balance") {
      // First, check if there's a wallet record with a balance
      const { data: wallet } = await serviceClient
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      // If wallet record exists with balance, use it as starting point
      let balance = wallet?.balance ? Number(wallet.balance) : 0;

      // Then add/subtract from transactions
      const { data: transactions } = await serviceClient
        .from("wallet_transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .eq("status", "completed");

      transactions?.forEach((tx) => {
        if (["deposit", "win", "bonus"].includes(tx.type)) {
          balance += Number(tx.amount);
        } else if (["withdraw", "bet"].includes(tx.type)) {
          balance -= Number(tx.amount);
        }
      });

      return new Response(JSON.stringify({ balance }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (action === "deposit" && req.method === "POST") {
      const { amount } = await req.json();
      const { data, error } = await serviceClient
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          type: "deposit",
          amount: amount,
          status: "completed", // Auto-complete for test
          reference: `dep_${Date.now()}`,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (action === "withdraw" && req.method === "POST") {
      const { amount } = await req.json();
      const { data, error } = await serviceClient
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          type: "withdraw",
          amount: amount,
          status: "pending",
          reference: `wd_${Date.now()}`,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (action === "transactions") {
      const { data, error } = await supabaseClient
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (action === "deduct" && req.method === "POST") {
      // Deduct bet amount from wallet
      const { amount, reference, description } = await req.json();

      // Check balance first
      const { data: transactions } = await serviceClient
        .from("wallet_transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .eq("status", "completed");

      let balance = 0;
      transactions?.forEach((tx) => {
        if (["deposit", "win", "bonus"].includes(tx.type)) {
          balance += Number(tx.amount);
        } else if (["withdraw", "bet"].includes(tx.type)) {
          balance -= Number(tx.amount);
        }
      });

      if (balance < amount) {
        return new Response(
          JSON.stringify({ error: "Insufficient balance", balance }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      const { data, error } = await serviceClient
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          type: "bet",
          amount: amount,
          status: "completed",
          reference: reference || `bet_${Date.now()}`,
          description: description || "Bet placed",
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          transaction: data,
          balance: balance - amount,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else if (action === "credit" && req.method === "POST") {
      // Credit winnings to wallet
      const { amount, reference, description } = await req.json();

      const { data, error } = await serviceClient
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          type: "win",
          amount: amount,
          status: "completed",
          reference: reference || `win_${Date.now()}`,
          description: description || "Bet won",
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, transaction: data }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
