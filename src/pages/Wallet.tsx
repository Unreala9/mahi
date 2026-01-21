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
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [selectedGateway, setSelectedGateway] = useState<
    "stripe" | "razorpay" | "paypal" | "bank_transfer"
  >("razorpay");

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
    const { data } = await (supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle() as any);

    if (data) setWalletData(data);
  };

  const fetchTransactions = async (userId: string) => {
    const { data } = await (supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10) as any);

    if (data) setTransactions(data);
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

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (walletData && parseFloat(withdrawAmount) > walletData.balance) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: user?.id,
      type: "withdraw",
      amount: parseFloat(withdrawAmount),
      status: "pending",
      gateway_provider: "bank_transfer",
      description: "Withdrawal request",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create withdrawal request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Withdrawal request submitted for approval",
      });
      setWithdrawAmount("");
      fetchTransactions(user!.id);
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
                    ₹ {walletData?.balance?.toLocaleString() ?? "0.00"}
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
                      Enter Deposit Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg font-bold">
                        ₹
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
                          + ₹{amt}
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
                        Pro Tip
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Withdrawals are processed within 24 hours. Ensure your
                        KYC is verified for faster processing.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Withdrawal Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg font-bold">
                        ₹
                      </span>
                      <Input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="h-14 pl-10 text-xl font-bold bg-input/20 border-border rounded-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="w-full h-12 text-sm font-black uppercase tracking-widest bg-foreground text-background hover:bg-muted transition-all rounded-none"
                    onClick={handleWithdraw}
                  >
                    Request Payout
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
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-foreground uppercase tracking-wide">
                        {tx.type} via {tx.gateway_provider}
                      </span>
                      <span
                        className={cn(
                          "font-black font-mono text-sm",
                          tx.type === "deposit"
                            ? "text-green-500"
                            : "text-red-500",
                        )}
                      >
                        {tx.type === "deposit" ? "+" : "-"} {tx.amount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span className="text-[10px] font-mono opacity-50">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                          tx.status === "completed"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : tx.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20",
                        )}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
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
