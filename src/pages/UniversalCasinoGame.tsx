

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  Users,
  Trophy,
  Info,
} from "lucide-react";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useCasinoWebSocket } from "@/services/casinoWebSocket";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

interface GameData {
  mid: string; // Round ID
  lt: number; // Last update time
  ft: number; // First time
  card: string; // Card data
  gtype: string;
  remark: string;
  grp: number;
  gname?: string;
  sub: Market[];
}

interface Market {
  sid: number;
  nat: string; // Market name
  b: number; // Back odds
  bs: number; // Back size
  l?: number; // Lay odds
  ls?: number; // Lay size
  sr: number;
  gstatus: "ACTIVE" | "SUSPENDED";
  min: number;
  max: number;
  subtype: string;
  etype: string;
}

interface ResultData {
  res: Array<{ mid: string; win: string }>;
  res1?: { cname: string };
}

interface PlacedBet {
  marketName: string;
  selection: string;
  stake: number;
  odds: number;
}

import { mapGameId } from "@/data/gameRouteMapping";

export default function UniversalCasinoGame() {
  const { gmid } = useParams<{ gmid: string }>();
  const navigate = useNavigate();

  // Map the URL parameter ID to the correct API ID (e.g., t20 -> dt20)
  const apiGmid = gmid ? mapGameId(gmid) : "";

  // State
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [selectedStake, setSelectedStake] = useState(100);
  const [countdown, setCountdown] = useState(0);

  // Use WebSocket hook for real-time game data
  const {
    data: wsGameData,
    status: wsStatus,
    error: wsError,
  } = useCasinoWebSocket(apiGmid);

  // Log any WS/Polling errors
  useEffect(() => {
    if (wsError) {
      console.error("[UniversalGame] WS/Polling Error:", wsError);
      setError(`Connection Error: ${wsError}`);
    }
  }, [wsError]);

  const stakes = [10, 50, 100, 500, 1000, 5000];

  // Local state to hold displayed data (from WS or fallback)
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync WS data to local state
  useEffect(() => {
    if (wsGameData) {
      console.log("[UniversalGame] Received WS Data:", wsGameData);
      setGameData(wsGameData as unknown as GameData); // Cast because types might slightly differ, check types!
      setIsLoading(false);

      // Update countdown
      if (wsGameData.timer !== undefined) {
        setCountdown(wsGameData.timer);
      } else if (wsGameData.timestamp) {
        // Fallback logic if needed, but service should provide timer or ft/lt
        // The service maps apiData (which has ft/lt) to `timer`.
      }
    }
  }, [wsGameData]);

  // Fetch results manually for now (or could use resultWebSocket service)
  useEffect(() => {
    if (!apiGmid) return;

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `${API_HOST}/casino/result?type=${apiGmid}&key=${API_KEY}`,
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setResultData(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching results:", err);
      }
    };

    fetchResults();
    const resultInterval = setInterval(fetchResults, 3000);

    return () => clearInterval(resultInterval);
  }, [apiGmid]);

  // Timeout for loading state if WS doesn't connect
  useEffect(() => {
    if (wsStatus === "connected" || wsStatus === "polling") {
      setIsLoading(false);
    }

    const timeout = setTimeout(() => {
      if (isLoading && !gameData) {
        setError("Connecting to game server...");
        // Don't error out completely, keep trying
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [wsStatus, isLoading, gameData]);

  // Countdown timer local tick (optional, if WS provides absolute time, rely on that, but smoother to tick locally)
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Place bet handler
  const handlePlaceBet = async (market: Market) => {
    if (!gameData || !gmid) return;

    if (market.gstatus === "SUSPENDED") {
      toast({
        title: "Market Suspended",
        description: "This market is currently suspended",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await casinoBettingService.placeCasinoBet({
        gameId: apiGmid,
        gameName: gameData.gname || gmid,
        roundId: gameData.mid,
        marketId: market.sid.toString(),
        marketName: market.nat,
        selection: market.nat,
        odds: market.b,
        stake: selectedStake,
        betType: "BACK",
      });

      if (result.success) {
        setPlacedBets([
          ...placedBets,
          {
            marketName: market.nat,
            selection: market.nat,
            stake: selectedStake,
            odds: market.b,
          },
        ]);

        toast({
          title: "✅ Bet Placed",
          description: `₹${selectedStake} on ${market.nat} @ ${market.b.toFixed(2)}`,
        });
      }
    } catch (error) {
      console.error("Bet placement error:", error);
      toast({
        title: "Bet Failed",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-white text-xl">Loading {gmid}...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !gameData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-2xl font-bold text-red-500">Game Unavailable</h2>
          <p className="text-white text-center">
            {error ||
              "Unable to load game data. The game might be temporarily offline."}
          </p>
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
            <Button onClick={() => navigate("/casino")} variant="outline">
              Back to Casino
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalStake = placedBets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialWin = placedBets.reduce(
    (sum, bet) => sum + bet.stake * bet.odds,
    0,
  );
  const recentResults = resultData?.res?.slice(0, 10) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
        {/* Header */}
        <div className="bg-slate-900/80 border-b border-blue-500/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/casino")}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {gameData.gname || gmid?.toUpperCase()}
                  </h1>
                  <p className="text-sm text-gray-400">Round: {gameData.mid}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {countdown > 0 && (
                  <Badge className="bg-blue-600 text-white font-bold">
                    <Clock className="w-3 h-3 mr-1" />
                    {countdown}s
                  </Badge>
                )}
                <Badge className="bg-green-600 animate-pulse">
                  <Users className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Recent Results */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-slate-800/50 border-blue-500/20 p-4">
                <h3 className="text-blue-400 font-bold mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Recent Results
                </h3>
                <div className="space-y-2">
                  {recentResults.length > 0 ? (
                    recentResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/50 rounded p-2 border border-slate-700"
                      >
                        <p className="text-white text-sm font-semibold">
                          {result.win}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Round: {result.mid}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No results yet</p>
                  )}
                </div>
              </Card>

              {/* Placed Bets Summary */}
              {placedBets.length > 0 && (
                <Card className="bg-slate-800/50 border-green-500/20 p-4">
                  <h3 className="text-green-400 font-bold mb-3">Your Bets</h3>
                  <div className="space-y-2">
                    {placedBets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/50 rounded p-2 text-sm"
                      >
                        <p className="text-white font-semibold">
                          {bet.marketName}
                        </p>
                        <p className="text-gray-400">
                          ₹{bet.stake} @ {bet.odds.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="border-t border-slate-700 pt-2 mt-2">
                      <p className="text-white">
                        Total Stake:{" "}
                        <span className="font-bold">₹{totalStake}</span>
                      </p>
                      <p className="text-green-400">
                        Potential Win:{" "}
                        <span className="font-bold">
                          ₹{potentialWin.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Center - Markets */}
            <div className="lg:col-span-3 space-y-4">
              {/* Stake Selection */}
              <Card className="bg-slate-800/50 border-blue-500/20 p-4">
                <h3 className="text-blue-400 font-bold mb-3">Select Stake</h3>
                <div className="flex flex-wrap gap-2">
                  {stakes.map((stake) => (
                    <button
                      key={stake}
                      onClick={() => setSelectedStake(stake)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-semibold transition-all",
                        selectedStake === stake
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600",
                      )}
                    >
                      ₹{stake}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Markets Grid */}
              <Card className="bg-slate-800/50 border-blue-500/20 p-4">
                <h3 className="text-blue-400 font-bold mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Markets & Odds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gameData.sub && gameData.sub.length > 0 ? (
                    gameData.sub.map((market) => (
                      <div
                        key={market.sid}
                        className={cn(
                          "bg-slate-900/50 rounded-lg p-4 border transition-all",
                          market.gstatus === "ACTIVE"
                            ? "border-green-500/30 hover:border-green-500/50"
                            : "border-red-500/30 opacity-60",
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">
                            {market.nat}
                          </h4>
                          {market.gstatus === "SUSPENDED" && (
                            <Badge variant="destructive" className="text-xs">
                              Suspended
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handlePlaceBet(market)}
                            disabled={market.gstatus === "SUSPENDED"}
                            className={cn(
                              "flex-1 py-3 rounded-lg font-bold transition-all",
                              market.gstatus === "ACTIVE"
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                : "bg-gray-700 text-gray-500 cursor-not-allowed",
                            )}
                          >
                            <div className="text-sm">BACK</div>
                            <div className="text-xl">{market.b.toFixed(2)}</div>
                            <div className="text-xs opacity-75">
                              ₹{market.bs}
                            </div>
                          </button>
                          {market.l && (
                            <div className="flex-1 py-3 rounded-lg bg-pink-600/20 border border-pink-500/30">
                              <div className="text-sm text-pink-400">LAY</div>
                              <div className="text-xl text-white">
                                {market.l.toFixed(2)}
                              </div>
                              <div className="text-xs text-pink-400">
                                ₹{market.ls}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Min: ₹{market.min} | Max: ₹{market.max}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <Info className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                      <p className="text-gray-400">
                        No markets available at the moment
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Card Display (if available) */}
              {gameData.card && (
                <Card className="bg-slate-800/50 border-blue-500/20 p-4">
                  <h3 className="text-blue-400 font-bold mb-3">Cards</h3>
                  <div className="flex gap-2 flex-wrap">
                    {gameData.card.split(",").map((card, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg px-4 py-6 text-2xl font-bold shadow-lg"
                      >
                        {card.trim() || "?"}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
