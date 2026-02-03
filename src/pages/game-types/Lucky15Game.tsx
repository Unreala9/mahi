import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, TrendingUp } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { supabase } from "@/lib/supabase";

interface BettingOption {
  id: string;
  label: string;
  value: string;
  odds: number | null;
  min: number;
  max: number;
}

const BETTING_OPTIONS: BettingOption[] = [
  { id: "0runs", label: "0 Runs", value: "0", odds: null, min: 50, max: 25000 },
  { id: "1runs", label: "1 Runs", value: "1", odds: null, min: 50, max: 25000 },
  { id: "2runs", label: "2 Runs", value: "2", odds: null, min: 50, max: 25000 },
  { id: "4runs", label: "4 Runs", value: "4", odds: null, min: 50, max: 25000 },
  { id: "6runs", label: "6 Runs", value: "6", odds: null, min: 50, max: 25000 },
  {
    id: "wicket",
    label: "Wicket",
    value: "W",
    odds: null,
    min: 50,
    max: 25000,
  },
];

const Lucky15Game = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"game" | "placed">("game");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>("100");
  const [placedBets, setPlacedBets] = useState<any[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [balance, setBalance] = useState<number>(1500);

  const { data: gameData, isConnected, error } = useCasinoWebSocket("lucky15");

  const roundId = gameData?.roundId || "161260203014745";
  const lastResults = gameData?.lastResults || [
    "1",
    "4",
    "W",
    "2",
    "1",
    "6",
    "6",
    "4",
    "1",
    "2",
  ];

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", user.id)
          .single();
        if (profile) {
          setBalance(profile.balance || 0);
        }
      }
    };
    fetchBalance();
  }, []);

  // Fetch placed bets
  useEffect(() => {
    const fetchBets = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: bets } = await supabase
          .from("bets")
          .select("*")
          .eq("user_id", user.id)
          .eq("gmid", "lucky15")
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        if (bets) {
          setPlacedBets(bets);
        }
      }
    };
    fetchBets();
  }, []);

  const handlePlaceBet = async (option: BettingOption) => {
    const amount = parseFloat(betAmount);
    if (!amount || amount < option.min || amount > option.max) {
      toast.error(
        `Bet amount must be between ₹${option.min} and ₹${option.max.toLocaleString()}`,
      );
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsPlacingBet(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to place bets");
        navigate("/auth");
        return;
      }

      const result = await casinoBettingService.placeCasinoBet({
        gmid: "lucky15",
        marketId: "runs",
        selectionId: option.id,
        odds: option.odds || 2.0,
        stake: amount,
        betType: "back",
        roundId: roundId,
      });

      if (result.success) {
        toast.success(`Bet placed: ${option.label} - ₹${amount}`);
        setBalance((prev) => prev - amount);
        setPlacedBets((prev) => [result.bet, ...prev]);
        setSelectedOption(null);
        setBetAmount("100");
      } else {
        toast.error(result.error || "Failed to place bet");
      }
    } catch (error: any) {
      console.error("Bet placement error:", error);
      toast.error(error.message || "Failed to place bet");
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getResultColor = (result: string) => {
    if (result === "W") return "bg-red-600 text-white";
    if (result === "6") return "bg-green-600 text-white";
    if (result === "4") return "bg-blue-600 text-white";
    return "bg-amber-600 text-zinc-900";
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Game Title and Tabs */}
        <Card className="bg-zinc-850 border-zinc-800 shadow-2xl">
          <CardHeader className="border-b border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-amber-500" />
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                  LUCKY 15
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-400">Round ID:</span>
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono"
                >
                  {roundId}
                </Badge>
                {!isConnected && (
                  <Badge
                    variant="outline"
                    className="bg-red-500/10 text-red-400 border-red-500/30"
                  >
                    Disconnected
                  </Badge>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={activeTab === "game" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("game")}
                className={
                  activeTab === "game"
                    ? "bg-amber-500 text-zinc-900 hover:bg-amber-600 font-semibold"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                }
              >
                GAME
              </Button>
              <Button
                variant={activeTab === "placed" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("placed")}
                className={
                  activeTab === "placed"
                    ? "bg-amber-500 text-zinc-900 hover:bg-amber-600 font-semibold"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                }
              >
                PLACED BET ({placedBets.length})
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {activeTab === "game" ? (
              <>
                {/* Betting Options */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-zinc-300 mb-4">
                    Runs
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {BETTING_OPTIONS.map((option) => (
                      <Card
                        key={option.id}
                        className={`bg-zinc-800 border-2 transition-all cursor-pointer hover:scale-105 ${
                          selectedOption === option.id
                            ? "border-amber-500 ring-2 ring-amber-500/50"
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                        onClick={() => setSelectedOption(option.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-zinc-300">
                              {option.label}
                            </span>
                            <Badge className="bg-amber-600 text-zinc-900 text-xs px-2 py-0.5">
                              Back
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-zinc-200 mb-2">
                              {option.odds || "-"}
                            </div>
                            <div className="text-xs text-zinc-400">
                              <div>Min: ₹{option.min.toFixed(2)}</div>
                              <div>Max: ₹{(option.max / 1000).toFixed(0)}K</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Bet Amount Input */}
                {selectedOption && (
                  <div className="mb-8 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                      <div className="flex-1">
                        <label className="text-sm text-zinc-400 mb-2 block">
                          Bet Amount (₹)
                        </label>
                        <Input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="bg-zinc-900 border-zinc-700 text-white"
                          min={50}
                          max={25000}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount("100")}
                          className="bg-zinc-700 border-zinc-600 text-zinc-200"
                        >
                          ₹100
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount("500")}
                          className="bg-zinc-700 border-zinc-600 text-zinc-200"
                        >
                          ₹500
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount("1000")}
                          className="bg-zinc-700 border-zinc-600 text-zinc-200"
                        >
                          ₹1K
                        </Button>
                      </div>
                      <Button
                        onClick={() => {
                          const option = BETTING_OPTIONS.find(
                            (o) => o.id === selectedOption,
                          );
                          if (option) handlePlaceBet(option);
                        }}
                        disabled={isPlacingBet}
                        className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-semibold"
                      >
                        {isPlacingBet ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Placing...
                          </>
                        ) : (
                          "Place Bet"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Last Results */}
                <Card className="bg-zinc-850 border-zinc-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-zinc-300">
                        Last Result
                      </h3>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate("/casino-results/lucky15")}
                        className="text-amber-400 hover:text-amber-300 p-0 h-auto"
                      >
                        View All →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {lastResults.map((result, index) => (
                        <Badge
                          key={index}
                          className={`${getResultColor(
                            result,
                          )} min-w-[40px] h-10 flex items-center justify-center text-base font-bold`}
                        >
                          {result}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="space-y-3">
                {placedBets.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400">
                    <p>No bets placed yet</p>
                  </div>
                ) : (
                  placedBets.map((bet) => (
                    <Card key={bet.id} className="bg-zinc-800 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">
                              {bet.selection_id}
                            </div>
                            <div className="text-sm text-zinc-400">
                              Round: {bet.round_id}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-amber-400">
                              ₹{bet.stake}
                            </div>
                            <div className="text-sm text-zinc-400">
                              Odds: {bet.odds}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Lucky15Game;
