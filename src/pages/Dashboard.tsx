import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Gamepad2,
  Trophy,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  TrendingUp,
  History,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChipAmount } from "@/components/ui/CasinoChip";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Live data state
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [recentBets, setRecentBets] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWins: 0,
    winRate: "0%",
    totalProfit: 0,
  });

  async function fetchWalletData(userId: string) {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.warn('[Dashboard] Wallet fetch error:', error.message);
      }

      setWalletBalance((data as any)?.balance ?? 0);
    } catch (e) {
      console.warn('[Dashboard] Failed to fetch wallet:', e);
      setWalletBalance(0);
    }
  }

  async function fetchRecentBets(userId: string) {
    try {
      // Fetch actual BETS from bets table
      const { data: betsData } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      const bets = (betsData as any) ?? [];

      // Calculate real stats from bets
      const totalBets = bets.length;
      const totalWins = bets.filter((b: any) => b.status === "won").length;
      const totalLosses = bets.filter((b: any) => b.status === "lost").length;
      const activeBets = bets.filter((b: any) => b.status === "pending").length;

      const totalProfit = bets.reduce((acc: number, b: any) => {
        if (b.status === "won") return acc + (b.potential_win || 0) - (b.stake || 0);
        if (b.status === "lost") return acc - (b.stake || 0);
        return acc;
      }, 0);

      const winRate = totalBets > 0 ? `${Math.round((totalWins / totalBets) * 100)}%` : "0%";

      setRecentBets(bets);
      setStats({ totalBets, totalWins, winRate, totalProfit });
    } catch (e) {
      console.error("[Dashboard] Error fetching bets:", e);
      setRecentBets([]);
      setStats({ totalBets: 0, totalWins: 0, winRate: "0%", totalProfit: 0 });
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchWalletData(session.user.id);
        fetchRecentBets(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return null;

  return (
    <MainLayout>
      <div className="w-full space-y-1">
        {/* Status Bar */}
        <div className="flex items-center justify-between bg-card border border-border p-2 px-4 mb-4">
          <div className="flex items-center gap-4 text-xs font-mono uppercase">
            <span className="text-muted-foreground">System Status:</span>
            <span className="text-green-500 font-bold">ONLINE</span>
            <span className="text-border px-2">|</span>
            <span className="text-muted-foreground">Server Time:</span>
            <span className="text-foreground">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="text-xs font-bold text-primary uppercase animate-pulse">
            Live Markets Open
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-1 h-[calc(100vh-180px)]">
          {/* Left Column: Wallet & Stats */}
          <div className="col-span-12 lg:col-span-3 space-y-1">
            {/* Wallet Info */}
            <div className="bg-card border border-border p-6 flex flex-col justify-center h-48">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">
                Main Balance
              </span>
              <div className="text-4xl font-black text-foreground tracking-tighter mb-4">
                <ChipAmount amount={walletBalance ?? 0} size="lg" className="text-4xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="h-10 bg-primary text-black font-bold uppercase rounded-none border-none hover:bg-white text-xs">
                  Deposit
                </Button>
                <Button className="h-10 bg-secondary text-white font-bold uppercase rounded-none border-none hover:bg-white hover:text-black text-xs">
                  Withdraw
                </Button>
              </div>
            </div>

            {/* Account KPIs */}
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-card border border-border p-4 h-32 flex flex-col justify-between">
                <Trophy className="w-5 h-5 text-green-500" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Total Profit
                  </span>
                  <span className="text-xl font-bold text-green-500">
                    <ChipAmount amount={stats.totalProfit} size="md" className="text-xl" />
                  </span>
                </div>
              </div>
              <div className="bg-card border border-border p-4 h-32 flex flex-col justify-between">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Win Rate
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {stats.winRate}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-4 flex-1">
              <h3 className="text-xs font-bold text-foreground uppercase mb-4 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => navigate("/wallet")}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50 hover:text-primary transition-colors flex justify-between uppercase"
                >
                  Deposit <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => navigate("/wallet")}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50 hover:text-primary transition-colors flex justify-between uppercase"
                >
                  Withdraw <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => navigate("/bets")}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50 hover:text-primary transition-colors flex justify-between uppercase"
                >
                  My Bets <History className="w-3 h-3" />
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50 hover:text-primary transition-colors flex justify-between uppercase"
                >
                  Profile <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column: Activity Feed */}
          <div className="col-span-12 lg:col-span-9 bg-card border border-border flex flex-col">
            <div className="h-10 border-b border-border flex items-center px-4 justify-between bg-muted/30">
              <span className="text-xs font-bold text-foreground uppercase">
                Recent Bets & Activity
              </span>
              <span className="text-[10px] text-primary font-mono cursor-pointer hover:underline">
                VIEW ALL
              </span>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-background text-[10px] uppercase text-muted-foreground font-bold sticky top-0">
                  <tr>
                    <th className="p-3 border-b border-border w-24">Type</th>
                    <th className="p-3 border-b border-border">Description</th>
                    <th className="p-3 border-b border-border text-right">
                      Amount
                    </th>
                    <th className="p-3 border-b border-border w-24 text-center">
                      Status
                    </th>
                    <th className="p-3 border-b border-border text-right">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium font-mono">
                  {recentBets.map((bet) => (
                    <tr
                      key={bet.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                            bet.status === "won"
                              ? "text-green-400 bg-green-900/20"
                              : bet.status === "lost"
                                ? "text-red-400 bg-red-900/20"
                                : "text-yellow-400 bg-yellow-900/20"
                          }`}
                        >
                          {bet.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-3 text-foreground/80 truncate max-w-[200px]">
                        {bet.match_name || bet.selection || "Bet"}
                      </td>
                      <td
                        className={`p-3 text-right font-bold ${
                          bet.status === "won"
                            ? "text-green-500"
                            : bet.status === "lost"
                              ? "text-red-500"
                              : "text-foreground"
                        }`}
                      >
                        <ChipAmount amount={bet.stake || 0} size="sm" />
                      </td>
                      <td className="p-3 text-center">
                        <StatusIndicator status={bet.status} />
                      </td>
                      <td className="p-3 text-right text-muted-foreground">
                        {new Date(bet.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentBets.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <History className="w-8 h-8 mb-2" />
                  <span className="text-xs uppercase font-bold">
                    No Data Available
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </MainLayout>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  let color = "bg-gray-500";
  if (s === "won" || s === "win") color = "bg-green-500";
  if (s === "lost" || s === "loss") color = "bg-red-500";
  if (s === "pending") color = "bg-yellow-500";

  return (
    <div className="flex justify-center">
      <div className={`w-2 h-2 ${color} rounded-none transform rotate-45`} />
    </div>
  );
};

export default Dashboard;
