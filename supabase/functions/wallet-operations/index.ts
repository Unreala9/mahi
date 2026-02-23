import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

interface WalletTransaction {
  user_id: string;
  type: "deposit" | "withdraw" | "bet" | "win" | "bonus";
  amount: number;
  status: "pending" | "completed" | "failed";
  reference?: string;
  description?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Service role client for admin operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Get wallet balance
    if (action === "get-balance") {
      // Get wallet record
      const { data: wallet, error: walletError } = await serviceClient
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (walletError) {
        console.error("Error fetching wallet:", walletError);
      }

      // Use wallet balance from DB as source of truth
      const balance = wallet?.balance ? Number(wallet.balance) : 0;

      return new Response(
        JSON.stringify({ success: true, balance, userId: user.id }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Deduct from wallet (for bets)
    if (action === "deduct" && req.method === "POST") {
      const { amount, reference, description } = await req.json();

      if (!amount || amount <= 0) {
        return new Response(JSON.stringify({ error: "Invalid amount" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Use atomic RPC for deduction and transaction creation
      const { data, error: rpcError } = await serviceClient.rpc(
        "deduct_balance",
        {
          p_user_id: user.id,
          p_amount: amount,
          p_type: "bet_place",
          p_description: description || "Bet placed",
          p_reference_id: reference || `bet_${Date.now()}`,
        },
      );

      if (rpcError || !data?.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: data?.message || rpcError?.message || "Deduction failed",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          balance: data.new_balance,
          transactionId: data.transaction_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Add to wallet (for wins/deposits)
    if (action === "add" && req.method === "POST") {
      const { amount, type, reference, description } = await req.json();

      if (!amount || amount <= 0) {
        return new Response(JSON.stringify({ error: "Invalid amount" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const validTypes = ["deposit", "bet_win", "bonus"];
      if (!validTypes.includes(type)) {
        return new Response(
          JSON.stringify({ error: "Invalid transaction type" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Use atomic RPC for addition and transaction creation
      const { data, error: rpcError } = await serviceClient.rpc(
        "increment_balance",
        {
          p_user_id: user.id,
          p_amount: amount,
          p_type: type,
          p_description: description || `${type} transaction`,
          p_reference_id: reference || `${type}_${Date.now()}`,
        },
      );

      if (rpcError || !data?.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: rpcError?.message || "Increment failed",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Fetch final balance to return
      const { data: wallet } = await serviceClient
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          balance: wallet?.balance ? Number(wallet.balance) : 0,
          transactionId: data.transaction_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Get transaction history
    if (action === "transactions") {
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      const { data: transactions, error: txError } = await serviceClient
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (txError) {
        throw new Error(`Failed to fetch transactions: ${txError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          transactions,
          count: transactions?.length || 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action. Use: get-balance, deduct, add, transactions",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  } catch (error) {
    console.error("Wallet operation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
