import { useMyBets } from "@/hooks/api/useBets";
import { MainLayout } from "@/components/layout/MainLayout";
import { format } from "date-fns";
import {
  Loader2,
  Trophy,
  XCircle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  RefreshCcw,
  Activity,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  settlementMonitor,
  settleSportsBets,
  settleCasinoBets,
} from "@/services/autoSettlementService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ChipAmount } from "@/components/ui/CasinoChip";

const Bets = () => {
  const { data: bets = [], isLoading, error, refetch } = useMyBets();
  const { toast } = useToast();
  const [isSettling, setIsSettling] = useState(false);

  const handleManualSettlement = async () => {
    setIsSettling(true);
    toast({
      title: "System Alert",
      description: "Initiating Settlement Protocol...",
    });

    try {
      const pendingBets = bets.filter((b: any) => b.status === "pending");
      const eventIds = new Set(
        pendingBets.filter((b: any) => b.event_id).map((b: any) => b.event_id),
      );
      const gameIds = new Set(
        pendingBets.filter((b: any) => b.sport).map((b: any) => b.sport),
      );

      let settledCount = 0;
      let wonCount = 0;
      let totalWinnings = 0;

      for (const eventId of eventIds) {
        const results = await settleSportsBets(Number(eventId));
        settledCount += results.length;
        wonCount += results.filter((r) => r.status === "won").length;
        totalWinnings += results
          .filter((r) => r.status === "won")
          .reduce((sum, r) => sum + (r.payout || 0), 0);
      }

      for (const gameId of gameIds) {
        const results = await settleCasinoBets(String(gameId));
        settledCount += results.length;
        wonCount += results.filter((r) => r.status === "won").length;
        totalWinnings += results
          .filter((r) => r.status === "won")
          .reduce((sum, r) => sum + (r.payout || 0), 0);
      }

      await refetch();

      if (wonCount > 0) {
        toast({
          title: "Result Confirmed",
          description: `Win detected: +₹${totalWinnings.toLocaleString()}`,
        });
      } else {
        toast({
          title: "Settlement Complete",
          description: "All positions updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Settlement Failed",
        variant: "destructive",
      });
    } finally {
      setIsSettling(false);
    }
  };

  const stats = {
    total: bets.length,
    won: bets.filter((b: any) => b.status === "won" || b.status === "win")
      .length,
    lost: bets.filter((b: any) => b.status === "lost" || b.status === "loss")
      .length,
    wagered: bets.reduce(
      (acc: number, b: any) => acc + (Number(b.stake) || 0),
      0,
    ),
    totalWinnings: bets
      .filter((b: any) => b.status === "won" || b.status === "win")
      .reduce((acc: number, b: any) => acc + (Number(b.payout) || 0), 0),
    totalLosses: bets
      .filter((b: any) => b.status === "lost" || b.status === "loss")
      .reduce((acc: number, b: any) => acc + (Number(b.stake) || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 bg-[#050b14]/50 min-h-screen -m-4 md:p-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a1120] p-6 border border-white/5 relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

        <div className="relative z-10">
          <h1 className="font-black text-2xl md:text-3xl text-white uppercase tracking-[0.2em] font-display flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Open<span className="text-primary">Positions</span>
          </h1>
          <p className="text-[10px] md:text-xs text-gray-500 font-mono uppercase tracking-widest mt-1 pl-11">
            Real-time Transaction Monitor
          </p>
        </div>

        <div className="relative z-10 flex gap-2">
          <Button
            onClick={() => refetch()}
            className="bg-[#050b14] border border-white/10 hover:border-primary/50 text-gray-400 hover:text-white h-10 px-4 rounded-none text-xs font-bold uppercase tracking-wider transition-all"
          >
            <RefreshCcw className="w-3 h-3 mr-2" /> Sync
          </Button>
          <Button
            onClick={handleManualSettlement}
            disabled={isSettling}
            className="bg-primary hover:bg-white text-black h-10 px-4 rounded-none text-xs font-bold uppercase tracking-wider transition-all"
          >
            {isSettling ? (
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
            ) : (
              <Terminal className="w-3 h-3 mr-2" />
            )}
            {isSettling ? "Processing..." : "Force Settle"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Volume" value={stats.total} />
        <StatCard
          label="Successful"
          value={stats.won}
          color="text-green-500 hidden-glow-green"
        />
        <StatCard
          label="Liabilities"
          value={stats.lost}
          color="text-red-500 hidden-glow-red"
        />
        <StatCard
          label="Total Exposure"
          value={`₹${stats.wagered.toLocaleString()}`}
        />
        <StatCard
          label="Net Profit"
          value={`₹${stats.totalWinnings.toLocaleString()}`}
          color="text-green-500 hidden-glow-green"
        />
        <StatCard
          label="Realized Loss"
          value={`₹${stats.totalLosses.toLocaleString()}`}
          color="text-red-500 hidden-glow-red"
        />
      </div>

      {/* Bets Monitor */}
      <div className="bg-[#0a1120] border border-white/5 relative min-h-[500px]">
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20" />

        <div className="p-4 border-b border-white/5 bg-[#050b14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Live Feed
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-600">
            LAST_UPDATE: {new Date().toLocaleTimeString()}
          </span>
        </div>

        {isLoading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : bets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-600">
            <History className="w-16 h-16 opacity-20 mb-4" />
            <p className="text-xs uppercase tracking-widest font-mono">
              No Active Positions
            </p>
            <Link
              to="/sports"
              className="mt-4 px-6 py-2 border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
            >
              Initiate Trade
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {bets.map((bet: any) => (
              <div
                key={bet.id}
                className="p-4 md:p-6 flex flex-col md:flex-row gap-6 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Status Indicator */}
                <div className="w-1 bg-white/10 group-hover:bg-primary transition-colors self-stretch rounded-full" />

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border",
                        bet.status === "won"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : bet.status === "lost"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-primary/10 text-primary border-primary/20",
                      )}
                    >
                      {bet.status}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(bet.created_at), "HH:mm:ss · dd MMM")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white uppercase font-display tracking-tight mb-1">
                    {bet.event_name || "Unknown Event"}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-primary rounded-full" />
                      {bet.market_name || "Match Winner"}
                    </span>
                    <span className="text-white">
                      Target:{" "}
                      <span className="text-primary font-bold">
                        {bet.selection_name || "Team A"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between md:justify-center items-end gap-2 md:gap-0 min-w-[120px] text-right">
                  <div className="mb-1">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Stake
                    </div>
                    <div className="font-mono font-bold text-white text-lg">
                      ₹{bet.stake}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Odds
                    </div>
                    <div className="font-mono font-bold text-primary">
                      @{bet.odds}
                    </div>
                  </div>
                  {bet.payout > 0 && (
                    <div className="mt-2 text-green-500 font-bold font-mono text-sm">
                      +₹{Number(bet.payout).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color = "text-white" }: any) => (
  <div className="bg-[#0a1120] border border-white/5 p-4 relative group hover:border-white/10 transition-colors">
    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={cn("text-xl font-black font-mono tracking-tighter", color)}>
      {value}
    </p>
    <div className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-transparent border-r-white/10 group-hover:border-r-primary/50 transition-all" />
  </div>
);

export default Bets;
