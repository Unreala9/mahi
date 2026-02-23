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
  settleSingleCasinoBet,
} from "@/services/autoSettlementService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ChipAmount } from "@/components/ui/CasinoChip";
import { useQueryClient } from "@tanstack/react-query";

const Bets = () => {
  const { data: bets = [], isLoading, error, refetch } = useMyBets();
  const { toast } = useToast();
  const [isSettling, setIsSettling] = useState(false);
  const queryClient = useQueryClient();

  const handleManualSettlement = async () => {
    console.log("[Bets] ========== SETTLE BUTTON CLICKED ==========");
    console.log("[Bets] Total bets:", bets.length);
    console.log("[Bets] All bets:", bets);

    setIsSettling(true);
    toast({
      title: "System Alert",
      description: "Initiating Settlement Protocol...",
    });

    try {
      const pendingBets = bets.filter((b: any) => b.status === "pending");

      console.log("[Bets] Total pending bets:", pendingBets.length);
      console.log("[Bets] Pending bets details:", pendingBets);

      if (pendingBets.length === 0) {
        console.log("[Bets] ⚠️ No pending bets found! Exiting settlement.");
        toast({
          title: "No Pending Bets",
          description: "All bets are already settled.",
        });
        setIsSettling(false);
        return;
      }

      console.log("[Bets] Sample bet:", pendingBets[0]);

      // Log ALL pending bets structure for debugging
      pendingBets.forEach((bet: any, i: number) => {
        console.log(`[Bets] Bet ${i + 1}:`, {
          sport: bet.sport,
          event: bet.event,
          market: bet.market,
          market_id: bet.market_id,
          event_name: bet.event_name,
          bet_on: bet.bet_on,
        });
      });

      // Separate casino and sports bets
      const sportsBets = pendingBets.filter(
        (b: any) =>
          b.event_id &&
          b.sport !== "CASINO" &&
          b.sport !== "casino" &&
          b.bet_on !== "fancy",
      );

      // Casino bets: sport='casino' OR bet_on='fancy' only
      const casinoBets = pendingBets.filter(
        (b: any) =>
          b.sport === "CASINO" ||
          b.sport === "casino" ||
          b.bet_on === "fancy",
      );

      console.log("[Bets] Sports bets:", sportsBets.length);
      console.log("[Bets] Casino bets:", casinoBets.length);
      console.log("[Bets] Casino bets:", casinoBets.length);
      console.log("[Bets] Sample casino bet:", casinoBets[0]);

      const eventIds = new Set(sportsBets.map((b: any) => b.event_id));

      // For casino bets with sport='casino', we can't determine game type from bet alone
      // We'll settle them all together by calling a different settlement method
      console.log("[Bets] Settling casino bets by round IDs...");

      let settledCount = 0;
      let wonCount = 0;
      let totalWinnings = 0;

      // Settle sports bets
      for (const eventId of eventIds) {
        const results = await settleSportsBets(Number(eventId));
        settledCount += results.length;
        wonCount += results.filter((r) => r.status === "won").length;
        totalWinnings += results
          .filter((r) => r.status === "won")
          .reduce((sum, r) => sum + (r.payout || 0), 0);
      }

      // Settle casino bets - settle each bet individually by checking its round
      if (casinoBets.length > 0) {
        console.log(
          `[Bets] Processing ${casinoBets.length} casino bets individually...`,
        );
        console.log(`[Bets] Casino bets to settle:`, casinoBets.map(b => ({
          id: b.id.slice(0, 8),
          event_name: b.event_name,
          event: b.event,
          status: b.status
        })));

        for (const bet of casinoBets) {
          try {
            console.log(`[Bets] ========== Starting settlement for bet ${bet.id.slice(0, 8)} ==========`);
            // Call settlement for each bet by ID
            const results = await settleSingleCasinoBet(bet.id);
            console.log(`[Bets] Settlement for bet ${bet.id}:`, results);

            if (results.length > 0) {
              console.log(`[Bets] ✅ Bet ${bet.id.slice(0, 8)} settled:`, results[0].status);
              settledCount += results.length;
              wonCount += results.filter((r) => r.status === "won").length;
              totalWinnings += results
                .filter((r) => r.status === "won")
                .reduce((sum, r) => sum + (r.payout || 0), 0);
            } else {
              console.log(`[Bets] ⚠️ No results returned for bet ${bet.id.slice(0, 8)}`);
            }
          } catch (err) {
            console.error(`[Bets] ❌ Failed to settle bet ${bet.id}:`, err);
          }
        }

        console.log(`[Bets] ========== Finished settling all casino bets ==========`);
      }

      // Force data refresh using hook's refetch function
      console.log("[Bets] Refetching fresh data from database...");

      // Wait a bit for database to process all updates
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Invalidate cache first
      queryClient.invalidateQueries({ queryKey: ["my-bets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });

      // Use the refetch function from the hook - this updates the hook's internal state
      const result = await refetch();

      console.log("[Bets] Data refreshed successfully");
      console.log("[Bets] Fresh bets count:", result.data?.length || 0);
      console.table(
        result.data?.map((b) => ({
          id: b.id.slice(0, 8),
          status: b.status,
          sport: b.sport,
          event_name: b.event_name?.slice(0, 30),
          stake: b.stake,
          payout: b.payout || 0,
        })),
      );

      console.log(`[Bets] ===== SETTLEMENT SUMMARY =====`);
      console.log(`[Bets] Total Settled: ${settledCount}`);
      console.log(`[Bets] Won: ${wonCount}`);
      console.log(`[Bets] Total Winnings: ₹${totalWinnings}`);
      console.log(`[Bets] ================================`);

      if (settledCount === 0) {
        const hasPendingCasino = casinoBets.length > 0;
        const hasPendingSports = eventIds.size > 0;

        let message = "No results available yet.";
        if (hasPendingCasino && !hasPendingSports) {
          message =
            "Casino round results not available yet. Please wait for the round to finish and try again in 1-2 minutes.";
        } else if (hasPendingSports && !hasPendingCasino) {
          message =
            "Sports match results not available yet. Check back after the match ends.";
        } else {
          message = "Results not available yet. Please wait and try again.";
        }

        toast({
          title: "No Settlement",
          description: message,
          variant: "destructive",
        });
      } else if (wonCount > 0) {
        toast({
          title: "Result Confirmed",
          description: `Win detected: +₹${totalWinnings.toLocaleString()}`,
        });
      } else {
        toast({
          title: "Settlement Complete",
          description: `${settledCount} bet(s) settled - All lost. Check your bet history below.`,
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

  // Debug: Log all bets and their status
  console.log(
    "[Bets] All bets:",
    bets.map((b: any) => ({ id: b.id, status: b.status, stake: b.stake })),
  );

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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 bg-[#f3f4f6] min-h-screen -m-4 md:p-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-gray-200 shadow-sm rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-black text-2xl md:text-3xl text-gray-900 uppercase tracking-[0.2em] font-display flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#1a472a]" />
            Open<span className="text-[#1a472a]">Positions</span>
          </h1>
          <p className="text-[10px] md:text-xs text-gray-500 font-mono uppercase tracking-widest mt-1 pl-11">
            Real-time Transaction Monitor
          </p>
        </div>

        <div className="relative z-10 flex gap-2">
          <Button
            onClick={() => refetch()}
            className="bg-white border border-gray-200 hover:border-gray-300 shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-10 px-4 rounded-none text-xs font-bold uppercase tracking-wider transition-all"
          >
            <RefreshCcw className="w-3 h-3 mr-2" /> Sync
          </Button>
          {/* Manual settlement button */}
          <Button
            onClick={handleManualSettlement}
            disabled={isSettling}
            className="bg-[#1a472a]/10 hover:bg-[#1a472a]/20 text-[#1a472a] border border-[#1a472a]/30 h-10 px-4 rounded-none text-xs font-bold uppercase tracking-wider transition-all"
            title="Manually settle pending bets"
          >
            <Terminal className="w-3 h-3 mr-2" />
            {isSettling ? "Settling..." : "Settle"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Volume" value={stats.total} />
        <StatCard
          label="Successful"
          value={stats.won}
          color="text-green-600"
        />
        <StatCard
          label="Liabilities"
          value={stats.lost}
          color="text-red-600"
        />
        <StatCard
          label="Total Exposure"
          value={`₹${stats.wagered.toLocaleString()}`}
        />
        <StatCard
          label="Net Profit"
          value={`₹${stats.totalWinnings.toLocaleString()}`}
          color="text-green-600"
        />
        <StatCard
          label="Realized Loss"
          value={`₹${stats.totalLosses.toLocaleString()}`}
          color="text-red-600"
        />
      </div>

      {/* Bets Monitor */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl relative min-h-[500px] overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
              Live Feed
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">
            LAST_UPDATE: {new Date().toLocaleTimeString()}
          </span>
        </div>

        {isLoading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-[#1a472a] w-8 h-8" />
          </div>
        ) : bets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
            <History className="w-16 h-16 opacity-30 mb-4" />
            <p className="text-xs uppercase tracking-widest font-mono">
              No Active Positions
            </p>
            <Link
              to="/sports"
              className="mt-4 px-6 py-2 border border-[#1a472a]/30 text-[#1a472a] hover:bg-[#1a472a] hover:text-white transition-all text-xs font-bold uppercase tracking-wider rounded"
            >
              Initiate Trade
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bets.map((bet: any) => (
              <div
                key={bet.id}
                className="p-4 md:p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 transition-colors group"
              >
                {/* Status Indicator */}
                <div className="w-1 bg-gray-200 group-hover:bg-[#1a472a] transition-colors self-stretch rounded-full" />

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-sm",
                        bet.status === "won"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : bet.status === "lost"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200",
                      )}
                    >
                      {bet.status}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(bet.created_at), "HH:mm:ss · dd MMM")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 uppercase font-display tracking-tight mb-1">
                    {bet.event_name || "Unknown Event"}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#f28729] rounded-full" />
                      {bet.market_name || "Match Winner"}
                    </span>
                    <span className="text-gray-500">
                      Target:{" "}
                      <span className="text-[#1a472a] font-bold">
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
                    <div className="font-mono font-bold text-gray-900 text-lg">
                      ₹{bet.stake}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Odds
                    </div>
                    <div className="font-mono font-bold text-[#f28729]">
                      @{bet.odds}
                    </div>
                  </div>
                  {bet.payout > 0 && (
                    <div className="mt-2 text-green-600 font-bold font-mono text-sm">
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

const StatCard = ({ label, value, color = "text-gray-900" }: any) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 relative group hover:border-gray-300 transition-colors">
    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={cn("text-xl font-black font-mono tracking-tighter", color)}>
      {value}
    </p>
  </div>
);

export default Bets;
