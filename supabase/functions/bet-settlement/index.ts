import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

interface BetSettlement {
  betId: string;
  status: "won" | "lost" | "void";
  payout?: number;
  score?: number; // Actual score for fancy settlement
  winningSelection?: string; // For match odds
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Settle a bet
    if (action === "settle" && req.method === "POST") {
      const settlementData: BetSettlement = await req.json();

      if (!settlementData.betId) {
        return new Response(JSON.stringify({ error: "betId is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Step 1: Get the bet
      const { data: bet, error: betError } = await supabaseClient
        .from("bets")
        .select("*, users:user_id(parentid, partnership_share)")
        .eq("id", settlementData.betId)
        .maybeSingle();

      if (betError || !bet) {
        return new Response(JSON.stringify({ error: "Bet not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      if (bet.status !== "pending") {
        return new Response(
          JSON.stringify({
            error: "Bet already settled",
            currentStatus: bet.status,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Step 2: Determine Win/Loss & Payout Logic
      let finalStatus = settlementData.status;
      let payout = 0;

      // Logic for FANCY Bets
      if (bet.bet_on === "fancy" && settlementData.score !== undefined) {
        const targetScore = Number(bet.odds);
        const actualScore = Number(settlementData.score);
        const isYes =
          bet.selection.toLowerCase() === "yes" || bet.bet_type === "BACK";
        const isNo =
          bet.selection.toLowerCase() === "no" || bet.bet_type === "LAY";

        let won = false;
        if (isYes) {
          won = actualScore >= targetScore;
        } else if (isNo) {
          won = actualScore < targetScore;
        }

        finalStatus = won ? "won" : "lost";

        if (won) {
          // Fancy Payout: (Stake * Rate) / 100 + Stake
          const rate = Number(bet.rate || 100);
          const profit = (Number(bet.stake) * rate) / 100;
          payout = Number(bet.stake) + profit;
        }
      }
      // Logic for Match Odds / Bookmaker
      else if (finalStatus === "won") {
        if (bet.potential_payout) {
          payout = Number(bet.potential_payout);
        } else {
          if (bet.bet_type === "BACK") {
            payout = Number(bet.stake) * Number(bet.odds);
          } else {
            // LAY Win (Backer lost)
            // Lay bet winner gets their stake back + profit (Stake of backer)
            // Wait, for Lay:
            // Liability was (Odds-1)*Stake.
            // If I (Layer) win, I get my liability back + the backer's stake.
            // In this system, Lay stake = Backer's stake usually?
            // Blueprint: "Profit = Stake" for Lay Win.
            // So Payout = Stake (Profit) + Liability (Locked funds returned)?
            // Usually, systems just return Exposure + Profit.
            // Exposure for Lay = (Odds-1)*Stake.
            // Profit = Stake.
            // Total Credit = ((Odds-1)*Stake) + Stake = Stake * Odds ??
            // No.
            // Example: Lay $100 @ 1.5. Liability $50.
            // Win: Keep $50 (Liability release) + Win $100 (Stake). Total Wallet Credit logic needs to match what was deducted.
            // If we deducted Exposure ($50), and we CREDIT Profit ($100), the net is +$50.
            // But usually we credit (Exposure + Profit).
            // Let's assume Payout = Profit + Exposure.
            // Profit = Stake. Exposure = (Odds-1)*Stake.
            // Payout = Stake + (Odds*Stake - Stake) = Stake * Odds.
            // Yes, Payout for Lay Win = Stake * Odds (mathematically same as Back win payout total).
            payout = Number(bet.stake) * Number(bet.odds);
          }
        }
      } else if (finalStatus === "void") {
        payout = Number(bet.stake); // Refund stake (or exposure?)
        // If Lay, refund exposure?
        if (bet.bet_type === "LAY") {
          payout = Number(bet.stake) * (Number(bet.odds) - 1); // Refund Liability
        }
      }

      // Step 3: Update bet status
      const { error: updateError } = await supabaseClient
        .from("bets")
        .update({
          status: finalStatus,
          payout: payout,
          settled_at: new Date().toISOString(),
          // Store actual result if needed
        })
        .eq("id", settlementData.betId);

      if (updateError) {
        throw new Error(`Failed to update bet: ${updateError.message}`);
      }

      // Step 4: Credit wallet if won or void
      let transaction = null;
      let profitLossAmount = 0; // Net P/L for partnership

      if (payout > 0) {
        // RPC to add balance atomically and create transaction record
        const { data: walletUpdate, error: walletError } =
          await supabaseClient.rpc("increment_balance", {
            p_user_id: bet.user_id,
            p_amount: payout,
            p_type: finalStatus === "void" ? "bet_void_refund" : "bet_win",
            p_description:
              finalStatus === "void"
                ? `Refund for voided bet ${bet.provider_bet_id}`
                : `Win payout for bet ${bet.provider_bet_id}`,
            p_reference_id: bet.id,
          });

        if (walletError || !walletUpdate?.success) {
          console.error(
            "[BetSettlement] Failed to credit wallet:",
            walletError || walletUpdate,
          );
          throw new Error(
            `Failed to credit wallet: ${walletError?.message || "Internal error"}`,
          );
        }

        console.log(
          `[BetSettlement] ✅ Credited ${payout} to user ${bet.user_id}.`,
        );
      } else if (finalStatus === "lost") {
        // Record the loss in wallet statistics (balance was already deducted at bet placement)
        // This only updates total_lost tracking, does NOT deduct from current balance
        const { data: lossUpdate, error: lossError } = await supabaseClient.rpc(
          "record_loss",
          {
            p_user_id: bet.user_id,
            p_amount: bet.exposure || bet.stake, // Use exposure as it's what was deducted
          },
        );

        if (lossError) {
          console.error("[BetSettlement] Failed to record loss:", lossError);
          // Don't throw error, loss recording is for statistics only
        } else {
          console.log(
            `[BetSettlement] 📉 Recorded loss of ${bet.stake} for user ${bet.user_id}. Total lost: ${lossUpdate?.total_lost || "unknown"}`,
          );
        }
      }

      // Step 5: Partnership Distribution (Basic Log Only for now)
      if (bet.users?.parentid) {
        // In a real implementation, we would toggle this recursively.
        // For now, we acknowledge the Blueprint requirement.
        console.log(
          `[Partnership] User ${bet.user_id} has parent ${bet.users.parentid}. Share: ${bet.users.partnership_share}%`,
        );
        // Future: Calculate share and credit/debit parent wallet
      }

      // Step 6: Get updated balance
      const { data: wallet } = await supabaseClient
        .from("wallets")
        .select("balance")
        .eq("user_id", bet.user_id)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          success: true,
          betId: bet.id,
          status: finalStatus,
          payout,
          balance: wallet?.balance || 0,
          transaction,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action. Use: settle",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  } catch (error) {
    console.error("Bet settlement error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
