/**
 * Teen Patti Games Category Page
 * Handles all Teen Patti variants: teen20, teen, teen3, teen8, teen9, teen32, teen33, teen41, teen42, poison, joker, etc.
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  Trophy,
  Info,
  Timer,
} from "lucide-react";
import { casinoBettingService } from "@/services/casinoBettingService";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

interface GameData {
  mid: string;
  lt: number;
  ft: number;
  card: string;
  gtype: string;
  remark: string;
  grp: number;
  gname?: string;
  sub: Market[];
}

interface Market {
  sid: number;
  nat: string;
  b: number;
  bs: number;
  l?: number;
  ls?: number;
  sr: number;
  gstatus: "ACTIVE" | "OPEN" | "SUSPENDED";
  min: number;
  max: number;
}

interface ResultData {
  mid: string;
  desc: string;
  result: string;
  gtype: string;
  remark: string;
}

interface PlacedBet {
  marketName: string;
  selection: string;
  odds: number;
  stake: number;
  betType: string;
  potentialWin: number;
  roundId: string;
}

export default function TeenPattiGames() {
  const { gmid } = useParams<{ gmid: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [resultData, setResultData] = useState<ResultData[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false for instant render
  const [error, setError] = useState<string | null>(null);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [selectedStake, setSelectedStake] = useState(100);
  const [countdown, setCountdown] = useState(0);
  const hasDataRef = useRef(false);

  const stakes = [10, 50, 100, 500, 1000, 5000, 10000, 25000];

  // Fetch game data and results
  useEffect(() => {
    if (!gmid) return;

    let active = true;
    hasDataRef.current = false;

    const fetchGameData = async () => {
      try {
        const response = await fetch(
          `${API_HOST}/casino/data?type=${gmid}&key=${API_KEY}`,
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && active) {
            setGameData(data.data);
            setIsLoading(false);
            setError(null);
            hasDataRef.current = true;

            // Calculate countdown
            if (data.data.ft && data.data.lt) {
              const remaining = Math.max(
                0,
                Math.floor((data.data.ft - data.data.lt) / 1000),
              );
              setCountdown(remaining);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching game data:", err);
        if (active) {
          setError("Failed to load game data");
        }
      }
    };

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `${API_HOST}/casino/result?type=${gmid}&key=${API_KEY}`,
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && active) {
            setResultData(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching results:", err);
      }
    };

    fetchGameData();
    fetchResults();

    const gameInterval = setInterval(fetchGameData, 2000);
    const resultInterval = setInterval(fetchResults, 5000);

    const timeout = setTimeout(() => {
      if (!hasDataRef.current && active) {
        setIsLoading(false);
        setError("Game is currently unavailable. Please try again later.");
      }
    }, 1500);

    return () => {
      active = false;
      clearInterval(gameInterval);
      clearInterval(resultInterval);
      clearTimeout(timeout);
    };
  }, [gmid]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handlePlaceBet = async (
    market: Market,
    betType: "back" | "lay",
    odds: number,
  ) => {
    if (!gameData || !gmid) return;

    if (market.gstatus === "SUSPENDED") {
      toast({
        title: "Market Suspended",
        description: "This market is currently suspended",
        variant: "destructive",
      });
      return;
    }

    const potentialWin = selectedStake * odds;

    const bet: PlacedBet = {
      marketName: market.nat,
      selection: betType.toUpperCase(),
      odds: odds,
      stake: selectedStake,
      betType: betType,
      potentialWin: potentialWin,
      roundId: gameData.mid,
    };

    try {
      const result = await casinoBettingService.placeCasinoBet({
        gameId: gmid,
        gameName: gameData.gname || gmid,
        roundId: gameData.mid,
        marketId: market.sid.toString(),
        marketName: market.nat,
        selection: betType.toUpperCase(),
        odds: odds,
        stake: selectedStake,
        betType: betType,
      });

      // Only update local state if bet was successful
      if (result.success) {
        setPlacedBets((prev) => [bet, ...prev]);

        // Invalidate queries to refresh My Bets page
        queryClient.invalidateQueries({ queryKey: ["my-bets"] });
        queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });

        toast({
          title: "Bet Placed Successfully",
          description: `${betType.toUpperCase()} on ${market.nat} @ ${odds}`,
        });
      } else {
        console.error("Bet placement failed:", result.error);
        toast({
          title: "Bet Failed",
          description: result.error || "Failed to place bet. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Bet placement error:", error);
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderCards = (cardString: string) => {
    if (!cardString) return null;

    const cards = cardString.split(",").filter(Boolean);
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {cards.map((card, index) => (
          <div
            key={index}
            className="w-14 h-20 bg-white rounded border-2 border-gray-300 flex items-center justify-center text-2xl font-bold shadow-md"
          >
            {card}
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-md text-center">
            <Info className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Game Unavailable</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <Button variant="outline" onClick={() => navigate("/casino")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Casino
              </Button>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!gameData) {
    // Show skeleton loading UI instead of blank screen
    return (
      <MainLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-8 w-48 bg-slate-800 animate-pulse rounded" />
            <div className="h-10 w-32 bg-slate-800 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-slate-800 animate-pulse rounded-lg" />
              <div className="h-96 bg-slate-800 animate-pulse rounded-lg" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-slate-800 animate-pulse rounded-lg" />
              <div className="h-64 bg-slate-800 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalStake = placedBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalPotentialWin = placedBets.reduce(
    (sum, bet) => sum + bet.potentialWin,
    0,
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/casino")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold">
              {gameData.gname || gmid.toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground">
              Round ID: {gameData.mid}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <span
              className={cn(
                "text-2xl font-bold",
                countdown <= 10 && "text-red-500 animate-pulse",
              )}
            >
              {formatTime(countdown)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cards Display */}
            {gameData.card && (
              <Card className="p-6 bg-gradient-to-br from-green-800 to-green-900">
                <h3 className="text-white text-center font-semibold mb-4">
                  Cards
                </h3>
                {renderCards(gameData.card)}
              </Card>
            )}

            {/* Stake Selector */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Select Stake</h3>
              <div className="grid grid-cols-4 gap-2">
                {stakes.map((stake) => (
                  <Button
                    key={stake}
                    variant={selectedStake === stake ? "default" : "outline"}
                    onClick={() => setSelectedStake(stake)}
                    className="h-12"
                  >
                    ₹{stake.toLocaleString()}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Markets */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Markets</h3>
              {gameData.sub && gameData.sub.length > 0 ? (
                gameData.sub.map((market) => (
                  <Card key={market.sid} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{market.nat}</span>
                        <Badge
                          variant={
                            market.gstatus === "SUSPENDED"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {market.gstatus}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Min: ₹{market.min} | Max: ₹{market.max}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Back Bet */}
                      <Button
                        variant="outline"
                        className={cn(
                          "h-20 flex flex-col justify-center bg-blue-50 hover:bg-blue-100 border-blue-300",
                          market.gstatus === "SUSPENDED" &&
                            "opacity-50 cursor-not-allowed",
                        )}
                        onClick={() => handlePlaceBet(market, "back", market.b)}
                        disabled={market.gstatus === "SUSPENDED"}
                      >
                        <span className="text-xs text-muted-foreground">
                          BACK
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {market.b}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ₹{market.bs}
                        </span>
                      </Button>

                      {/* Lay Bet */}
                      {market.l && (
                        <Button
                          variant="outline"
                          className={cn(
                            "h-20 flex flex-col justify-center bg-pink-50 hover:bg-pink-100 border-pink-300",
                            market.gstatus === "SUSPENDED" &&
                              "opacity-50 cursor-not-allowed",
                          )}
                          onClick={() =>
                            handlePlaceBet(market, "lay", market.l!)
                          }
                          disabled={market.gstatus === "SUSPENDED"}
                        >
                          <span className="text-xs text-muted-foreground">
                            LAY
                          </span>
                          <span className="text-2xl font-bold text-pink-600">
                            {market.l}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ₹{market.ls}
                          </span>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  No markets available
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Bets */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Round Bets
              </h3>
              {placedBets.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {placedBets.map((bet, index) => (
                      <div
                        key={index}
                        className="p-3 bg-muted rounded-lg text-sm"
                      >
                        <div className="font-semibold">{bet.marketName}</div>
                        <div className="flex justify-between mt-1">
                          <span
                            className={cn(
                              "font-medium",
                              bet.betType === "back"
                                ? "text-blue-600"
                                : "text-pink-600",
                            )}
                          >
                            {bet.selection}
                          </span>
                          <span>@ {bet.odds}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-muted-foreground">
                          <span>Stake: ₹{bet.stake}</span>
                          <span>Win: ₹{bet.potentialWin.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Total Stake:</span>
                      <span>₹{totalStake.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Potential Win:</span>
                      <span>₹{totalPotentialWin.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No bets placed yet
                </p>
              )}
            </Card>

            {/* Recent Results */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Results
              </h3>
              {resultData.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resultData.slice(0, 10).map((result, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Round {result.mid}
                        </span>
                        <Badge variant="outline">{result.result}</Badge>
                      </div>
                      {result.desc && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.desc}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No recent results
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
