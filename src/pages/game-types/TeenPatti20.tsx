import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Clock, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";
import { fetchCasinoResult } from "@/services/casino";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const HAND_RANKINGS = [
  { name: "Trail", desc: "Three of a kind", icon: "🔥" },
  { name: "Pure Sequence", desc: "Straight flush", icon: "💎" },
  { name: "Sequence", desc: "Straight", icon: "📊" },
  { name: "Color", desc: "Flush", icon: "🎨" },
  { name: "Pair", desc: "Two of a kind", icon: "👥" },
  { name: "High Card", desc: "Highest card", icon: "🃏" },
];

export default function TeenPatti20() {
  const navigate = useNavigate();
  // ✅ LIVE API INTEGRATION
  const {
    gameData,
    result,
    isConnected,
    isLoading,
    error,
    markets,
    roundId,
    placeBet,
    placedBets,
    clearBets,
    totalStake,
    potentialWin,
    isSuspended,
  } = useUniversalCasinoGame({
    gameType: "teen20",
    gameName: "Teen Patti 20",
  });

  const [countdown, setCountdown] = useState(15);
  const [potAmount, setPotAmount] = useState(2400);
  const [bootAmount] = useState(100);
  const [chaalAmount, setChaalAmount] = useState([200]);
  const [myCards] = useState(["🂡", "🂮", "🃋"]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Fetch live results from API
  const { data: apiResults } = useQuery({
    queryKey: ["casino-results", "teen20"],
    queryFn: () => fetchCasinoResult("teen20"),
    refetchInterval: 5000, // Refresh every 5 seconds
    retry: 1,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBet = async () => {
    if (chaalAmount[0] === 0) {
      toast({ title: "Please select bet amount", variant: "destructive" });
      return;
    }

    try {
      await bettingService.placeBet({
        gameType: "CASINO",
        gameId: "teen20",
        gameName: "Teen Patti 20",
        marketId: "chaal",
        marketName: "Chaal",
        selection: "Chaal",
        odds: 2.0,
        stake: chaalAmount[0],
        betType: "BACK",
      });
      setChaalAmount([bootAmount * 2]);
    } catch (error) {
      console.error("Failed to place bet:", error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900/20 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mb-4"></div>
            <p className="text-white text-xl">Loading Teen Patti 20...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error || !gameData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900/20 to-black flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-2xl font-bold text-yellow-500">
            Game Unavailable
          </h2>
          <p className="text-white text-center">
            {error ||
              "Unable to load game data. The game might be temporarily offline."}
          </p>
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-yellow-600 hover:bg-yellow-700"
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900/20 to-black">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-yellow-600/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-600 text-black font-bold">
                  <Clock className="w-3 h-3 mr-1" />
                  {countdown}s
                </Badge>
                <Badge className="bg-green-600 animate-pulse">
                  <Users className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Sidebar - Hand Rankings */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-gray-800/50 border-yellow-600/20 p-4">
                <h3 className="text-yellow-500 font-bold mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Hand Rankings
                </h3>
                <div className="space-y-2">
                  {HAND_RANKINGS.map((hand, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900/50 rounded p-2 border border-gray-700 hover:border-yellow-600/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{hand.icon}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">
                            {hand.name}
                          </p>
                          <p className="text-gray-400 text-xs">{hand.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Hand History */}
              <Card className="bg-gray-800/50 border-yellow-600/20 p-4">
                <h3 className="text-yellow-500 font-bold mb-3">Recent Hands</h3>
                <div className="space-y-2">
                  {HISTORY_HANDS.map((hand, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900/50 rounded p-2 border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">
                          {hand.round}
                        </span>
                        <span className="text-yellow-500 text-xs font-bold">
                          ₹{hand.amount}
                        </span>
                      </div>
                      <p className="text-white text-sm mt-1">{hand.winner}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Main Table Area */}
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-br from-green-900/40 via-green-800/30 to-gray-900/40 border-yellow-600/30 p-6 relative overflow-hidden">
                {/* Decorative felt texture */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                {/* Oval Table Layout */}
                <div className="relative min-h-[600px]">
                  {/* Center Pot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full p-6 shadow-2xl shadow-yellow-600/50 border-4 border-yellow-500/50">
                      <div className="text-center">
                        <p className="text-yellow-200 text-xs mb-1">POT</p>
                        <p className="text-white font-bold text-3xl">
                          ₹{potAmount}
                        </p>
                        <p className="text-yellow-200 text-xs mt-1">
                          Boot: ₹{bootAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Player Seats (Oval Layout) */}
                  {PLAYER_SEATS.map((player, idx) => {
                    const angle = (idx * 360) / PLAYER_SEATS.length - 90;
                    const radius = 42;
                    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                    return (
                      <div
                        key={player.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                      >
                        <div className="bg-gray-900/90 rounded-lg p-3 border-2 border-gray-700 hover:border-yellow-600 transition-colors min-w-[140px]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{player.avatar}</span>
                            <div className="flex-1">
                              <p className="text-white text-sm font-semibold">
                                {player.username}
                              </p>
                              <p className="text-yellow-500 text-xs font-bold">
                                ₹{player.chips}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs w-full justify-center",
                              player.lastAction === "Pack"
                                ? "bg-red-900/50 border-red-600"
                                : player.lastAction === "Chaal"
                                  ? "bg-green-900/50 border-green-600"
                                  : "bg-blue-900/50 border-blue-600",
                            )}
                          >
                            {player.lastAction}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}

                  {/* My Cards & Controls - Bottom */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl">
                    <Card className="bg-gray-900/95 border-yellow-600/50 p-6">
                      {/* My Cards */}
                      <div className="flex justify-center gap-3 mb-6">
                        {myCards.map((card, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg w-20 h-28 flex items-center justify-center text-5xl shadow-2xl transform hover:scale-105 transition-transform cursor-pointer"
                          >
                            {card}
                          </div>
                        ))}
                      </div>

                      {/* Chaal Slider */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">
                            Chaal Amount
                          </span>
                          <span className="text-yellow-500 font-bold text-lg">
                            ₹{chaalAmount[0]}
                          </span>
                        </div>
                        <Slider
                          value={chaalAmount}
                          onValueChange={setChaalAmount}
                          min={bootAmount}
                          max={bootAmount * 10}
                          step={bootAmount}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>₹{bootAmount}</span>
                          <span>₹{bootAmount * 10}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedAction("pack")}
                          className={cn(
                            "border-red-600 text-red-500 hover:bg-red-600 hover:text-white",
                            selectedAction === "pack" &&
                              "bg-red-600 text-white",
                          )}
                        >
                          Pack
                        </Button>
                        <Button
                          onClick={() => setSelectedAction("chaal")}
                          className={cn(
                            "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
                            selectedAction === "chaal" &&
                              "ring-2 ring-green-400",
                          )}
                        >
                          Chaal
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedAction("sideshow")}
                          className={cn(
                            "border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white",
                            selectedAction === "sideshow" &&
                              "bg-blue-600 text-white",
                          )}
                        >
                          Side Show
                        </Button>
                        <Button
                          onClick={() => setSelectedAction("show")}
                          className={cn(
                            "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700",
                            selectedAction === "show" &&
                              "ring-2 ring-yellow-400",
                          )}
                        >
                          Show
                        </Button>
                      </div>

                      {/* Quick Chaal Buttons */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setChaalAmount([bootAmount * 2])}
                          className="border-yellow-600/50 text-yellow-500"
                        >
                          2x
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setChaalAmount([bootAmount * 4])}
                          className="border-yellow-600/50 text-yellow-500"
                        >
                          4x
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setChaalAmount([bootAmount * 8])}
                          className="border-yellow-600/50 text-yellow-500"
                        >
                          8x
                        </Button>
                      </div>
                      <Button
                        onClick={handlePlaceBet}
                        className="w-full mt-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 font-bold"
                      >
                        PLACE BET (₹{chaalAmount[0]})
                      </Button>
                    </Card>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
