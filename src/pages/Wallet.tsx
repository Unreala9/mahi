import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  Wallet as WalletIcon,
  Plus,
  Minus,
  CreditCard,
  Landmark,
  History,
  CreditCard as CardIcon,
  ShieldCheck,
  Download,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

const Wallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [selectedGateway, setSelectedGateway] = useState<
    "stripe" | "razorpay" | "paypal" | "bank_transfer"
  >("razorpay");
  const [withdrawStep, setWithdrawStep] = useState<"amount" | "bank">("amount");
  const [bankDetails, setBankDetails] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchWalletData(session.user.id);
        fetchTransactions(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchWalletData = async (userId: string) => {
    try {
      const { data, error } = await (supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle() as any);

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error fetching wallet:", error);
        toast({
          title: "⚠️ Wallet Error",
          description: "Failed to load wallet data. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      if (data) setWalletData(data);
    } catch (err) {
      console.error("❌ Unexpected error:", err);
    }
  };

  const fetchTransactions = async (userId: string) => {
    // Fetch deposit/withdrawal transactions
    const { data: txData } = await (supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50) as any); // Increased limit to show more history

    // Fetch bet history
    const { data: betData } = await (supabase
      .from("bets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50) as any);

    // Combine and format all activities
    const allActivities = [
      ...(txData || []).map((tx: any) => ({
        ...tx,
        activity_type: tx.type, // 'deposit' or 'withdraw'
        display_amount: tx.amount,
      })),
      ...(betData || []).map((bet: any) => ({
        ...bet,
        activity_type:
          bet.status === "won" ? "win" : bet.status === "lost" ? "loss" : "bet",
        display_amount: bet.status === "won" ? bet.potential_win : bet.stake,
        gateway_provider: "betting",
        description: `Bet on ${bet.match_name || "Match"}`,
      })),
    ];

    // Sort by created_at
    allActivities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    setTransactions(allActivities.slice(0, 50)); // Show top 50 activities
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (selectedGateway === "stripe") {
        const { data, error } = await supabase.functions.invoke(
          "create-payment-intent",
          {
            body: {
              amount: parseFloat(depositAmount),
              currency: "INR",
              provider: "stripe",
            },
          },
        );

        if (error) throw error;
        toast({
          title: "Initiating Stripe",
          description: "Redirecting to payment gateway...",
        });
      } else if (selectedGateway === "razorpay") {
        const { data, error } = await supabase.functions.invoke(
          "create-payment-intent",
          {
            body: {
              amount: parseFloat(depositAmount),
              currency: "INR",
              provider: "razorpay",
            },
          },
        );
        if (error) throw error;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: "MahiExchange",
          description: "Wallet Deposit",
          order_id: data.order_id,
          handler: function (response: any) {
            verifyPayment(response, "razorpay");
          },
          prefill: {
            name: user?.user_metadata?.full_name,
            email: user?.email,
          },
          theme: { color: "#d4af37" }, // Gold color
        };

        if (!(window as any).Razorpay) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://checkout.razorpay.com/v1/checkout.js";
            s.onload = () => resolve();
            s.onerror = () =>
              reject(new Error("Failed to load Razorpay script"));
            document.head.appendChild(s);
          });
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else if (selectedGateway === "bank_transfer") {
        toast({
          title: "Bank Transfer",
          description:
            "Please transfer to the account shown and contact support.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      if (selectedGateway !== "paypal") setLoading(false);
    }
  };

  const verifyPayment = async (response: any, provider: string) => {
    try {
      const { error } = await supabase.functions.invoke("handle-webhook", {
        body: { ...response, provider },
      });
      if (error) throw error;
      toast({ title: "Success", description: "Deposit successful!" });
      fetchWalletData(user!.id);
      fetchTransactions(user!.id);
      setDepositAmount("");
    } catch (err) {
      toast({
        title: "Error",
        description: "Payment verification failed",
        variant: "destructive",
      });
    }
  };

  const createPayPalOrder = async () => {
    const { data, error } = await supabase.functions.invoke(
      "create-payment-intent",
      {
        body: {
          amount: parseFloat(depositAmount),
          currency: "INR",
          provider: "paypal",
        },
      },
    );
    if (error) throw error;
    return data.order_id;
  };

  const onPayPalApprove = async (data: any) => {
    await verifyPayment(
      { purchase_units: [{ reference_id: data.orderID }] },
      "paypal",
    );
  };

  const handleWithdrawAmountSubmit = () => {
    const amount = parseFloat(withdrawAmount);

    // Validate Amount
    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      toast({
        title: "⚠️ Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }


        variant: "destructive",
      });
      return;
    }

    // Call Secure RPC with UPI details
    try {
      setLoading(true);

      // Store bank details in transaction description/metadata
      const bankInfo = `Bank: ${bankAccountDetails.bankName} | A/C: ${bankAccountDetails.accountNumber} | IFSC: ${bankAccountDetails.ifscCode} | Holder: ${bankAccountDetails.accountHolderName}`;

      const { data, error } = await supabase.rpc("request_withdrawal", {
        p_user_id: user?.id,
        p_amount: amount,
        p_upi_id: upiId,
      });

      if (error) throw error;

      // Optionally store bank details separately
      await supabase
        .from("wallet_transactions")
        .update({
          description: `Withdrawal Request - ${bankInfo}`,
        })
        .eq("id", data.transaction_id);

      toast({
        title: "Success",
        description: "Withdrawal request submitted. Admin will process UPI payment within 24 hours.",
      });

      // Reset form
      setWithdrawAmount("");
      setUpiId("");
      fetchTransactions(user!.id);
      fetchWalletData(user!.id);
    } catch (err: any) {
      toast({
        title: "❌ Withdrawal Failed",
        description:
          err.message || "Failed to request withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="font-black text-2xl text-foreground uppercase tracking-tight">
                Cashier
              </h1>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">
                Balance Management & History
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-border hover:bg-muted/50 text-muted-foreground rounded-none uppercase text-xs font-bold tracking-wider h-9"
            >
              <History className="w-3 h-3 mr-2" /> History
            </Button>
            <Button
              variant="outline"
              className="border-border hover:bg-muted/50 text-foreground rounded-none uppercase text-xs font-bold tracking-wider h-9"
            >
              <ShieldCheck className="w-3 h-3 mr-2" /> Limits
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
          {/* Main Action Area */}
          <div className="lg:col-span-8 space-y-1">
            {/* Balance Card */}
            <div className="bg-card border border-border p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Landmark className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Total Funds
                  </p>
                  <h2 className="text-5xl font-black text-primary font-display tracking-tight leading-none">
                    <ChipAmount amount={walletData?.balance ?? 0} size="lg" className="text-5xl" />
                  </h2>
                  <p className="text-[10px] text-green-500 font-bold uppercase mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
                    Active & Verified
                  </p>
                </div>

                <div className="flex gap-1 w-full md:w-auto">
                  {/* Tabs */}
                  <Button
                    onClick={() => setActiveTab("deposit")}
                    className={cn(
                      "flex-1 md:flex-none w-32 h-12 rounded-none text-sm font-black uppercase tracking-wider border transition-all",
                      activeTab === "deposit"
                        ? "bg-primary text-black border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-foreground",
                    )}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Deposit
                  </Button>
                  <Button
                    onClick={() => setActiveTab("withdraw")}
                    className={cn(
                      "flex-1 md:flex-none w-32 h-12 rounded-none text-sm font-black uppercase tracking-wider border transition-all",
                      activeTab === "withdraw"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground",
                    )}
                  >
                    <Minus className="w-4 h-4 mr-2" /> Withdraw
                  </Button>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-card p-8 border border-border min-h-[400px]">
              {activeTab === "deposit" ? (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Enter Deposit Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg font-bold">
                        
                      </span>
                      <Input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="h-14 pl-10 text-xl font-bold bg-input/20 border-border rounded-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[500, 1000, 2000, 5000].map((amt) => (
                        <Button
                          key={amt}
                          variant="outline"
                          size="sm"
                          className="border-border bg-card/50 text-muted-foreground hover:bg-primary hover:text-black rounded-none text-xs font-bold h-7"
                          onClick={() => setDepositAmount(amt.toString())}
                        >
                          + {amt}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                      Select Payment Gateway
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        {
                          id: "razorpay",
                          name: "Razorpay",
                          icon: CreditCard,
                        },
                        {
                          id: "stripe",
                          name: "Stripe",
                          icon: CardIcon,
                        },
                        {
                          id: "paypal",
                          name: "PayPal",
                          icon: WalletIcon,
                        },
                        {
                          id: "bank_transfer",
                          name: "Bank Wire",
                          icon: Landmark,
                        },
                      ].map((gateway) => (
                        <div
                          key={gateway.id}
                          onClick={() => setSelectedGateway(gateway.id as any)}
                          className={cn(
                            "cursor-pointer p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-2 group relative overflow-hidden",
                            selectedGateway === gateway.id
                              ? "bg-primary/5 border-primary"
                              : "bg-card/20 border-border hover:bg-card/40 hover:border-primary/50",
                          )}
                        >
                          {selectedGateway === gateway.id && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-primary" />
                          )}
                          <gateway.icon
                            className={cn(
                              "w-6 h-6 transition-transform group-hover:scale-110",
                              selectedGateway === gateway.id
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span
                            className={cn(
                              "font-bold text-xs uppercase tracking-wider",
                              selectedGateway === gateway.id
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {gateway.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedGateway === "paypal" ? (
                    <div className="bg-white p-4 border border-border">
                      <PayPalScriptProvider
                        options={{
                          clientId:
                            import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
                        }}
                      >
                        <PayPalButtons
                          style={{ layout: "horizontal" }}
                          createOrder={createPayPalOrder}
                          onApprove={onPayPalApprove}
                        />
                      </PayPalScriptProvider>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      className="w-full h-12 text-sm font-black uppercase tracking-widest bg-primary text-black hover:bg-white transition-all rounded-none shadow-[0_0_20px_rgba(255,255,60,0.2)]"
                      onClick={handleDeposit}
                      disabled={loading}
                    >
                      {loading
                        ? "Processing Securely..."
                        : `Proceed to Secure Pay`}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-yellow-500 uppercase">
                        UPI Withdrawal
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Admin will send money to your UPI ID within 24 hours. Make sure your UPI ID is correct.
                      </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 flex items-start gap-3">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          <strong className="text-blue-500">Limits:</strong> Min
                          ₹1,000 | Max ₹10,000 per transaction
                        </p>
                      </div>
                    </div>

                    {walletData?.balance < 1000 && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-red-500">
                            Insufficient balance. Your current balance is ₹
                            {walletData?.balance?.toLocaleString() || 0}.
                            Minimum withdrawal is ₹1,000.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Withdrawal Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg font-bold">
                        
                      </span>
                      <Input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="h-14 pl-10 text-xl font-bold bg-input/20 border-border rounded-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[1000, 2000, 5000, 10000].map((amt) => (
                        <Button
                          key={amt}
                          variant="outline"
                          size="sm"
                          className="border-border bg-card/50 text-muted-foreground hover:bg-primary hover:text-black rounded-none text-xs font-bold h-7"
                          onClick={() => setWithdrawAmount(amt.toString())}
                        >
                          {amt}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Your UPI ID
                    </label>
                    <Input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="h-12 text-lg bg-input/20 border-border rounded-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                      placeholder="username@paytm or 9876543210@ybl"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter your UPI ID (PhonePe, GPay, Paytm, etc.)
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="w-full h-12 text-sm font-black uppercase tracking-widest bg-foreground text-background hover:bg-muted transition-all rounded-none"
                    onClick={handleWithdraw}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Request UPI Payout"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Transactions */}
          <div className="lg:col-span-4 bg-card border border-border h-fit">
            <div className="p-4 border-b border-border flex items-center justify-between bg-card/10">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Recent Activity
              </h3>
              <Download className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isDeposit = tx.activity_type === "deposit";
                  const isWithdraw = tx.activity_type === "withdraw";
                  const isWin = tx.activity_type === "win";
                  const isLoss = tx.activity_type === "loss";
                  const isBet = tx.activity_type === "bet";
                  const isPending = tx.status === "pending";

                  return (
                    <div
                      key={tx.id}
                      className={cn(
                        "p-4 transition-colors group",
                        isPending && isWithdraw
                          ? "bg-yellow-500/5 border-l-4 border-yellow-500"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isDeposit && (
                              <Plus className="w-4 h-4 text-green-500" />
                            )}
                            {isWithdraw && (
                              <Minus className="w-4 h-4 text-orange-500" />
                            )}
                            {isWin && (
                              <span className="text-green-500">🏆</span>
                            )}
                            {(isLoss || isBet) && (
                              <span className="text-muted-foreground">🎲</span>
                            )}
                            <span className="font-bold text-xs text-foreground uppercase tracking-wide">
                              {isDeposit && "Deposit"}
                              {isWithdraw && "Withdrawal"}
                              {isWin && "Bet Won"}
                              {isLoss && "Bet Lost"}
                              {isBet && "Bet Placed"}
                            </span>
                          </div>
                          {tx.description && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {tx.description}
                            </p>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="opacity-50">
                              {new Date(tx.created_at).toLocaleString()}
                            </span>
                            {(isDeposit || isWithdraw) &&
                              tx.gateway_provider && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium uppercase">
                                    via {tx.gateway_provider}
                                  </span>
                                </>
                              )}
                          </div>
                          {isPending && isWithdraw && (
                            <div className="mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1 text-[10px] text-yellow-600 flex items-center gap-1">
                              <History className="w-3 h-3" />
                              <span>
                                Pending admin approval - Processing within 24
                                hours
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={cn(
                              "font-black font-mono text-sm whitespace-nowrap",
                              isDeposit || isWin
                                ? "text-green-500"
                                : isWithdraw || isLoss || isBet
                                  ? "text-red-500"
                                  : "text-foreground",
                            )}
                          >
                            {(isDeposit || isWin) ? "+" : "-"} <ChipAmount amount={tx.display_amount || tx.amount} size="sm" />
                          </span>
                          {tx.status && (
                            <span
                              className={cn(
                                "px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                                tx.status === "completed" || tx.status === "won"
                                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                                  : tx.status === "pending"
                                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    : "bg-red-500/10 text-red-500 border-red-500/20",
                              )}
                            >
                              {tx.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground text-xs uppercase tracking-wider">
                  No transactions found.
                </div>
              )}
            </div>
            <div className="p-3 border-t border-border bg-card/5 text-center">
              <Button
                variant="link"
                className="text-primary text-xs uppercase font-bold tracking-widest h-auto p-0"
              >
                View All History
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Wallet;
