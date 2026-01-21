import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Verify Razorpay signature
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
  const body = orderId + "|" + paymentId;
  const expectedSignature = createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Webhook received body:", body);
    
    // Extract Razorpay payment data
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing required Razorpay parameters", received: body }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    console.log("Signature valid:", isValid);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Find transaction by Razorpay order ID
    console.log("Looking for transaction with razorpay_order_id:", razorpay_order_id);
    const { data: transaction, error: txError } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    console.log("Transaction found:", transaction, "Error:", txError);

    if (txError || !transaction) {
      // Try to find all transactions to debug
      const { data: allTx } = await supabaseClient
        .from("transactions")
        .select("id, razorpay_order_id")
        .limit(5);
      
      return new Response(
        JSON.stringify({ 
          error: "Transaction not found",
          searched_for: razorpay_order_id,
          tx_error: txError,
          recent_transactions: allTx
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    if (transaction.status === "completed") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment already processed" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Update transaction status
    await supabaseClient
      .from("transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    // Get or create wallet
    let { data: wallet } = await supabaseClient
      .from("wallets")
      .select("balance")
      .eq("user_id", transaction.user_id)
      .single();

    if (!wallet) {
      await supabaseClient
        .from("wallets")
        .insert({
          user_id: transaction.user_id,
          balance: 0,
        });
      wallet = { balance: 0 };
    }

    // Update wallet balance
    const newBalance = Number(wallet.balance) + Number(transaction.amount);
    
    await supabaseClient
      .from("wallets")
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString() 
      })
      .eq("user_id", transaction.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and wallet credited",
        amount: transaction.amount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
