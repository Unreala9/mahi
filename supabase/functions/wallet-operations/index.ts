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

      // Start with wallet balance or 0
      let balance = wallet?.balance ? Number(wallet.balance) : 0;

      // Get all completed transactions
      const { data: transactions, error: txError } = await serviceClient
        .from("transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (txError) {
        console.error("Error fetching transactions:", txError);
      }

      // Calculate final balance
      if (transactions) {
        transactions.forEach((tx) => {
          const amount = Number(tx.amount);
          if (["deposit", "win", "bonus"].includes(tx.type)) {
            balance += amount;
          } else if (["withdraw", "bet"].includes(tx.type)) {
            balance -= amount;
          }
        });
      }

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

      // Check current balance first
      const { data: wallet } = await serviceClient
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      let balance = wallet?.balance ? Number(wallet.balance) : 0;

      const { data: transactions } = await serviceClient
        .from("transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (transactions) {
        transactions.forEach((tx) => {
          const amt = Number(tx.amount);
          if (["deposit", "win", "bonus"].includes(tx.type)) {
            balance += amt;
          } else if (["withdraw", "bet"].includes(tx.type)) {
            balance -= amt;
          }
        });
      }

      if (balance < amount) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Insufficient balance",
            balance,
            required: amount,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Create deduction transaction
      const { data: transaction, error: txError } = await serviceClient
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "bet",
          amount: amount,
          status: "completed",
          provider: "internal",
          provider_ref_id: reference || `bet_${Date.now()}`,
          description: description || "Bet placed",
        })
        .select()
        .single();

      if (txError) {
        throw new Error(`Transaction failed: ${txError.message}`);
      }

      const newBalance = balance - amount;

      return new Response(
        JSON.stringify({
          success: true,
          balance: newBalance,
          transaction,
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

      const validTypes = ["deposit", "win", "bonus"];
      if (!validTypes.includes(type)) {
        return new Response(
          JSON.stringify({ error: "Invalid transaction type" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Create addition transaction
      const { data: transaction, error: txError } = await serviceClient
        .from("transactions")
        .insert({
          user_id: user.id,
          type: type,
          amount: amount,
          status: "completed",
          provider: "internal",
          provider_ref_id: reference || `${type}_${Date.now()}`,
          description: description || `${type} transaction`,
        })
        .select()
        .single();

      if (txError) {
        throw new Error(`Transaction failed: ${txError.message}`);
      }

      // Get new balance
      const { data: wallet } = await serviceClient
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      let balance = wallet?.balance ? Number(wallet.balance) : 0;

      const { data: transactions } = await serviceClient
        .from("transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (transactions) {
        transactions.forEach((tx) => {
          const amt = Number(tx.amount);
          if (["deposit", "win", "bonus"].includes(tx.type)) {
            balance += amt;
          } else if (["withdraw", "bet"].includes(tx.type)) {
            balance -= amt;
          }
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          balance,
          transaction,
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
