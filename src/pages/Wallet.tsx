import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// Removed Stripe and PayPal imports - only using Razorpay
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
  Terminal,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

import { ChipAmount } from "@/components/ui/CasinoChip";

// Removed Stripe initialization - only using Razorpay

const Wallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [depositMethod, setDepositMethod] = useState<"bank" | "upi" | "qr">(
    "bank",
  );
  const [depositStep, setDepositStep] = useState<number>(1);

  // Dynamic Settings State
  const [settings, setSettings] = useState({
    bank: {
      bankName: "Loading...",
      accountHolder: "Loading...",
      accountNumber: "Loading...",
      ifsc: "Loading...",
    },
    upi: { upiId: "Loading..." },
    qr: { url: "" },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchWalletData(session.user.id);
        fetchTransactions(session.user.id);
        fetchSystemSettings(); // Fetch dynamic settings
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

  const fetchSystemSettings = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("*")
      .in("key", ["bank_details", "upi_details", "qr_code"]);

    if (data) {
      const newSettings = { ...settings };
      data.forEach((item) => {
        if (item.key === "bank_details") newSettings.bank = item.value;
        if (item.key === "upi_details") newSettings.upi = item.value;
        if (item.key === "qr_code") newSettings.qr = item.value;
      });
      setSettings(newSettings);
    }
  };

  const fetchWalletData = async (userId: string) => {
    try {
      const { data, error } = await (supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle() as any);

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error fetching wallet:", error);
        return;
      }
      if (data) setWalletData(data);
    } catch (err) {
      console.error("❌ Unexpected error:", err);
    }
  };

  const fetchTransactions = async (userId: string) => {
    const { data: txData } = await (supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50) as any);

    const { data: betData } = await (supabase
      .from("bets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50) as any);

    const allActivities = [
      ...(txData || []).map((tx: any) => ({
        ...tx,
        activity_type: tx.type,
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

    allActivities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    setTransactions(allActivities.slice(0, 50));
  };

  const handleManualDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    if (!transactionId) {
      toast({
        title: "Missing Transaction ID",
        description: "Please enter the bank/UPI transaction ID.",
        variant: "destructive",
      });
      return;
    }
    if (!screenshot) {
      toast({
        title: "Missing Screenshot",
        description: "Please upload the payment screenshot.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const fileExt = screenshot.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      // Upload Screenshot
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("deposit_proofs")
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      const screenshotUrl = uploadData?.path; // Or get public URL if needed

      // Create Transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user?.id,
        type: "deposit",
        amount: parseFloat(depositAmount),
        status: "pending",
        description: "Manual Deposit",
        provider: "manual",
        provider_ref_id: transactionId,
        screenshot_url: screenshotUrl,
        payment_details: `Manual Deposit - ${depositMethod.toUpperCase()}`,
      });

      if (txError) throw txError;

      toast({
        title: "Deposit Requested",
        description: "Your deposit request has been submitted for approval.",
      });

      setDepositAmount("");
      setTransactionId("");
      setScreenshot(null);
      fetchTransactions(user!.id);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit deposit request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !upiId) {
      toast({
        title: "Required",
        description: "Amount and UPI ID required",
        variant: "destructive",
      });
      return;
    }
    // Simulation
    toast({ title: "Request Sent", description: "Payout processing via UPI" });
    setWithdrawAmount("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a1120] p-6 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Landmark className="w-48 h-48 text-white" />
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-[#050b14] border border-white/10 flex items-center justify-center relative group">
            <Terminal className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h1 className="font-black text-3xl text-white uppercase tracking-[0.2em] font-display">
              Cashier<span className="text-primary">.SYS</span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />{" "}
                SECURE_CONNECTION
              </span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>ID: {user?.id?.slice(0, 8).toUpperCase() || "DEMO"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Actions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Balance Display */}
          <div className="bg-[#0a1120] border border-white/5 p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Available Balance
                </p>
                <h2 className="text-6xl font-black text-white font-mono tracking-tighter leading-none flex items-baseline gap-2">
                  <span className="text-2xl text-gray-600">₹</span>
                  <ChipAmount
                    amount={walletData?.balance ?? 0}
                    size="lg"
                    className="text-6xl text-white shadow-none"
                  />
                </h2>
              </div>

              <div className="flex gap-px bg-[#050b14] border border-white/10 p-1">
                <Button
                  onClick={() => {
                     setActiveTab("deposit");
                     setDepositStep(1);
                  }}
                  className={cn(
                    "h-12 w-32 rounded-none text-xs font-bold uppercase tracking-widest transition-all",
                    activeTab === "deposit"
                      ? "bg-primary text-black hover:bg-white"
                      : "bg-transparent text-gray-500 hover:text-white",
                  )}
                >
                  <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit
                </Button>
                <div className="w-px bg-white/10" />
                <Button
                  onClick={() => setActiveTab("withdraw")}
                  className={cn(
                    "h-12 w-32 rounded-none text-xs font-bold uppercase tracking-widest transition-all",
                    activeTab === "withdraw"
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-transparent text-gray-500 hover:text-white",
                  )}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
                </Button>
              </div>
            </div>
          </div>

          {/* Transaction Form */}
          <div className="bg-[#0a1120] border border-white/5 p-8 min-h-[400px] relative">
            {/* Grid Texture */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />

            {activeTab === "deposit" ? (
              <div className="relative z-10 space-y-8 animate-in slide-in-from-left duration-300">
                {/* STEP 1: AMOUNT INPUT */}
                {!depositStep || depositStep === 1 ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                        Enter Amount to Deposit
                      </label>
                      <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-light">
                          ₹
                        </span>
                        <Input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="h-20 pl-12 text-5xl font-black bg-[#050b14] border-white/10 rounded-none focus:border-primary/50 focus:ring-0 text-white placeholder:text-gray-800 font-mono"
                          placeholder="0"
                          autoFocus
                        />
                      </div>
                      {/* Quick Amount Chips */}
                      <div className="flex gap-2 flex-wrap mt-2">
                        {[500, 1000, 5000, 10000, 50000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setDepositAmount(amt.toString())}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-gray-400 font-mono transition-colors"
                          >
                            +₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full h-16 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-none transition-all"
                      onClick={() => {
                        if (!depositAmount || parseFloat(depositAmount) <= 0) {
                          toast({
                            description: "Please enter a valid amount",
                            variant: "destructive",
                          });
                          return;
                        }
                        setDepositStep(2);
                      }}
                    >
                      Make Payment <ArrowDownLeft className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  /* STEP 2: PAYMENT METHOD & PROOF */
                  <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    {/* Header with Back Button */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                          Depositing
                        </p>
                        <h2 className="text-2xl font-black text-white font-mono">
                          ₹{depositAmount}
                        </h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-white"
                        onClick={() => setDepositStep(1)}
                      >
                        Change Amount
                      </Button>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setDepositMethod("bank")}
                        className={cn(
                          "p-3 text-xs font-bold uppercase tracking-wider border transition-all",
                          depositMethod === "bank"
                            ? "bg-primary text-black border-primary"
                            : "bg-[#050b14] text-gray-400 border-white/10 hover:border-white/30",
                        )}
                      >
                        Bank Transfer
                      </button>
                      <button
                        onClick={() => setDepositMethod("upi")}
                        className={cn(
                          "p-3 text-xs font-bold uppercase tracking-wider border transition-all",
                          depositMethod === "upi"
                            ? "bg-primary text-black border-primary"
                            : "bg-[#050b14] text-gray-400 border-white/10 hover:border-white/30",
                        )}
                      >
                        UPI Apps
                      </button>
                      <button
                        onClick={() => setDepositMethod("qr")}
                        className={cn(
                          "p-3 text-xs font-bold uppercase tracking-wider border transition-all",
                          depositMethod === "qr"
                            ? "bg-primary text-black border-primary"
                            : "bg-[#050b14] text-gray-400 border-white/10 hover:border-white/30",
                        )}
                      >
                        QR Code
                      </button>
                    </div>

                    {/* DYNAMIC PAYMENT DETAILS SECTION */}
                    {/* Bank Details */}
                    {depositMethod === "bank" && (
                      <div className="bg-[#050b14] p-6 border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                          <Landmark className="w-5 h-5 text-primary" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Bank Transfer Details
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-mono text-gray-400">
                          <div>
                            <p className="text-[10px] text-gray-600 uppercase">
                              Bank Name
                            </p>
                            <p className="text-white">
                              {settings.bank.bankName}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-600 uppercase">
                              Account Holder
                            </p>
                            <p className="text-white">
                              {settings.bank.accountHolder}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-600 uppercase">
                              Account Number
                            </p>
                            <p className="text-white select-all">
                              {settings.bank.accountNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-600 uppercase">
                              IFSC Code
                            </p>
                            <p className="text-white select-all">
                              {settings.bank.ifsc}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI Details */}
                    {depositMethod === "upi" && (
                      <div className="bg-[#050b14] p-6 border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            UPI Payment
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-gray-600 uppercase mb-1">
                              Official UPI ID
                            </p>
                            <div className="flex items-center gap-2 bg-black/30 p-3 border border-white/10 rounded">
                              <span className="text-white font-mono text-lg select-all">
                                {settings.upi.upiId}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto h-8 text-xs text-primary hover:text-white"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    settings.upi.upiId,
                                  );
                                  toast({ description: "UPI ID Copied" });
                                }}
                              >
                                COPY
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Open any UPI app (GPay, PhonePe, Paytm) and pay to
                            the VPA above.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* QR Code Details */}
                    {depositMethod === "qr" && (
                      <div className="bg-[#050b14] p-6 border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-black" />
                          </div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Scan QR Code
                          </h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          <div className="w-48 h-48 bg-white p-2 shrink-0">
                            {settings.qr.url ? (
                              <img
                                src={settings.qr.url}
                                alt="Pay via QR"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full border-2 border-dashed border-gray-900 flex items-center justify-center bg-gray-100">
                                <p className="text-center text-xs font-bold text-gray-900 uppercase">
                                  No QR Configured
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4 text-sm text-gray-400">
                            <p>
                              <strong className="text-white">Step 1:</strong>{" "}
                              Open your payment app.
                            </p>
                            <p>
                              <strong className="text-white">Step 2:</strong>{" "}
                              Scan QR code.
                            </p>
                            <p>
                              <strong className="text-white">Step 3:</strong>{" "}
                              Pay exactly{" "}
                              <span className="text-white font-bold">
                                ₹{depositAmount}
                              </span>
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction Proof Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                          Transaction ID / UTR
                        </label>
                        <Input
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="bg-[#050b14] border-white/10 text-white font-mono"
                          placeholder="e.g. 302041234567"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                          Upload Screenshot
                        </label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setScreenshot(e.target.files?.[0] || null)
                          }
                          className="bg-[#050b14] border-white/10 text-white font-mono file:text-primary file:bg-transparent file:border-0 hover:file:underline"
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full h-16 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-none transition-all"
                      onClick={handleManualDeposit}
                      disabled={loading}
                    >
                      {loading ? "Submitting Proof..." : "Submit Payment Proof"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Withdrawal Section (unchanged block start) */
              <div className="relative z-10 space-y-8 animate-in slide-in-from-right duration-300">
                <div className="p-4 bg-yellow-500/5 border-l-2 border-yellow-500">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-yellow-500 uppercase tracking-wider mb-2">
                    <Info className="w-4 h-4" /> Withdrawal Protocol
                  </h4>
                  <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                    Requests are processed within 24 hours via IMPS/UPI. Ensure
                    beneficiary details match KYC records.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-light">
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="h-20 pl-12 text-5xl font-black bg-[#050b14] border-white/10 rounded-none focus:border-white/50 focus:ring-0 text-white placeholder:text-gray-800 font-mono"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Beneficiary UPI ID
                  </label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="h-14 bg-[#050b14] border-white/10 rounded-none focus:border-white/50 text-white font-mono tracking-wide"
                    placeholder="username@upi"
                  />
                </div>

                <Button
                  className="w-full h-16 bg-white hover:bg-gray-200 text-black font-black uppercase tracking-[0.2em] text-sm rounded-none transition-all"
                  onClick={handleWithdraw}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Confirm Withdrawal"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-4 bg-[#0a1120] border border-white/5 flex flex-col h-[800px]">
          <div className="p-4 border-b border-white/5 bg-[#050b14] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Ledger
            </h3>
            <Download className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
            {transactions.map((tx, i) => {
              const isWin = tx.activity_type === "win";
              const isDeposit = tx.activity_type === "deposit";
              const isPositive = isWin || isDeposit;

              return (
                <div
                  key={i}
                  className="p-3 bg-[#050b14] hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${isPositive ? "text-green-500" : "text-red-500"}`}
                    >
                      {tx.activity_type}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {new Date(tx.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[150px]">
                      {tx.description || "System Transaction"}
                    </span>
                    <span
                      className={`font-mono font-bold text-sm ${isPositive ? "text-white" : "text-gray-500"}`}
                    >
                      {isPositive ? "+" : "-"}{" "}
                      <ChipAmount amount={tx.display_amount} size="sm" />
                    </span>
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                <History className="w-8 h-8 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest">
                  No Records Found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
