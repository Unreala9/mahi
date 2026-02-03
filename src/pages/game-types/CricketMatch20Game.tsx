import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const TEAMS = [
  { name: "India", flag: "🇮🇳", color: "from-orange-600 to-orange-800" },
  { name: "Pakistan", flag: "🇵🇰", color: "from-green-600 to-green-800" },
];

const BETTING_MARKETS = [
  { id: 1, name: "Match Winner", type: "winner" },
  { id: 2, name: "Top Batsman", type: "batsman" },
  { id: 3, name: "Man of the Match", type: "motm" },
  { id: 4, name: "Highest Score", type: "score" },
];

const RECENT_RESULTS = [
  { date: "Yesterday", team: "India", margin: "By 5 wickets" },
  { date: "2 days ago", team: "Pakistan", margin: "By 18 runs" },
  { date: "3 days ago", team: "India", margin: "By 7 runs" },
];

export default function CricketMatch20Game() {
  const navigate = useNavigate();
  // ✅ LIVE API INTEGRATION
  const {
    gameData,
    result,
    isConnected,
    markets,
    roundId,
    placeBet,
    placedBets,
    clearBets,
    totalStake,
    potentialWin,
    isSuspended,
  } = useUniversalCasinoGame({
    gameType: "cricket20",
    gameName: "Cricket Match 20",
  });

  const [countdown, setCountdown] = useState(420); // 7 minutes
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedMarket, setSelectedMarket] = useState(1);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<Record<number, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 420 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlaceBet = () => {
    if (!selectedTeam) {
      toast({ title: "⚠️ Select a team", variant: "destructive" });
      return;
    }
    setBets((prev) => ({
      ...prev,
      [selectedTeam]: (prev[selectedTeam] || 0) + selectedChip,
    }));
    toast({
      title: `✅ ₹${selectedChip} placed on ${TEAMS[selectedTeam].name}`,
    });
  };

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/60 to-blue-900/60 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/casino")}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-wide">
                    Cricket Match 20-20
                  </h1>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="bg-red-600">
                      <Clock className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                    <Badge className="bg-blue-600">India vs Pakistan</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-yellow-400 tabular-nums">
                  {formatTime(countdown)}
                </div>
                <p className="text-xs text-gray-400">Match Starts</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Main Betting Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Team Selection */}
              <div className="grid grid-cols-2 gap-4">
                {TEAMS.map((team, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTeam(idx)}
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-6 border-4 transition-all duration-300",
                      selectedTeam === idx
                        ? "ring-4 ring-yellow-400 scale-105 border-yellow-400"
                        : "border-gray-600 hover:border-gray-500",
                    )}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${team.color}`}
                    ></div>
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]"></div>
                    <div className="relative">
                      <div className="text-6xl mb-2">{team.flag}</div>
                      <div className="text-white text-3xl font-black">
                        {team.name}
                      </div>
                      <div className="text-yellow-300 text-2xl font-bold mt-2">
                        @1.98
                      </div>
                      {bets[idx] > 0 && (
                        <Badge className="mt-3 bg-yellow-500 text-black text-base px-3 py-1">
                          ₹{bets[idx]}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Markets */}
              <Card className="bg-gray-800/50 border-blue-600/20 p-4">
                <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Betting Markets
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {BETTING_MARKETS.map((market) => (
                    <button
                      key={market.id}
                      onClick={() => setSelectedMarket(market.id)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-sm font-bold",
                        selectedMarket === market.id
                          ? "bg-blue-600 border-blue-400 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500",
                      )}
                    >
                      {market.name}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Chip Selector */}
              <Card className="bg-gray-800/50 border-blue-600/20 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm font-bold">
                    Chips:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={cn(
                        "w-14 h-14 rounded-full font-bold text-sm border-4 transition-all hover:scale-110",
                        selectedChip === value
                          ? "bg-yellow-600 border-yellow-400 text-white ring-2 ring-yellow-300"
                          : "bg-gray-700 border-gray-600 text-gray-300",
                      )}
                    >
                      ₹{value}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setBets({})}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handlePlaceBet}
                    disabled={!selectedTeam}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg"
                  >
                    Place Bet (₹{selectedChip})
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Bet Summary */}
              <Card className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border-yellow-600/30 p-4">
                <h3 className="text-yellow-400 font-bold mb-3">Bet Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Bets:</span>
                    <span className="text-yellow-300 font-bold">
                      ₹{totalBet}
                    </span>
                  </div>
                  {TEAMS.map(
                    (team, idx) =>
                      bets[idx] > 0 && (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-400">{team.name}:</span>
                          <span className="text-blue-300 font-bold">
                            ₹{bets[idx]}
                          </span>
                        </div>
                      ),
                  )}
                  {totalBet > 0 && (
                    <div className="border-t border-yellow-600/30 pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Potential Win:</span>
                        <span className="text-green-400 font-bold">
                          ₹{Math.round(totalBet * 1.98)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Results */}
              <Card className="bg-gray-800/50 border-blue-600/20 p-4">
                <h3 className="text-blue-400 font-bold mb-3">Recent Results</h3>
                <div className="space-y-2">
                  {RECENT_RESULTS.map((result, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded bg-gray-700/50 border border-gray-600 text-xs"
                    >
                      <div>
                        <Badge
                          className={
                            result.team === "India"
                              ? "bg-orange-600 mb-1"
                              : "bg-green-600 mb-1"
                          }
                        >
                          {result.team}
                        </Badge>
                        <p className="text-gray-400">{result.margin}</p>
                      </div>
                      <span className="text-gray-500">{result.date}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Info Box */}
              <Card className="bg-blue-900/30 border-blue-600/30 p-4">
                <p className="text-xs text-blue-300 text-center">
                  🏏 Live odds update every 30 seconds
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
