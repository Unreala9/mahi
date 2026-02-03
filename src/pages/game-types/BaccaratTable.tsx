import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const BEAD_ROAD = Array.from({ length: 30 }, () => {
  const outcomes = ["P", "B", "T"];
  return outcomes[Math.floor(Math.random() * outcomes.length)];
});

export default function BaccaratTable() {
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
    gameType: "baccarat",
    gameName: "Baccarat Table",
  });

  const [countdown, setCountdown] = useState(25);
  const [isDealing, setIsDealing] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [bets, setBets] = useState({
    player: 0,
    banker: 0,
    tie: 0,
    playerPair: 0,
    bankerPair: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsDealing(true);
          setTimeout(() => setIsDealing(false), 4000);
          return 25;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBets = async () => {
    const totalStakeAmount = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStakeAmount === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      const betConfig = [
        { key: "player", name: "Player", odds: 2.0 },
        { key: "banker", name: "Banker", odds: 1.95 },
        { key: "tie", name: "Tie", odds: 9.0 },
        { key: "playerPair", name: "Player Pair", odds: 12.0 },
        { key: "bankerPair", name: "Banker Pair", odds: 12.0 },
      ];

      betConfig.forEach(({ key, name, odds }) => {
        const stake = bets[key as keyof typeof bets];
        if (stake > 0) {
          betPromises.push(
            bettingService.placeBet({
              gameType: "CASINO",
              gameId: "btable",
              gameName: "Baccarat Table",
              marketId: key,
              marketName: name,
              selection: name,
              odds,
              stake,
              betType: "BACK",
            }),
          );
        }
      });

      await Promise.all(betPromises);
      clearBets();
    } catch (error) {
      console.error("Failed to place bets:", error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Compact Header */}
        <div className="bg-slate-900/90 border-b border-slate-700 sticky top-0 z-10">
          <div className="container mx-auto px-3 py-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino")}
                className="text-gray-400 hover:text-white h-8"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-blue-500 font-bold text-sm">
                  {countdown}s
                </span>
                <Badge className="bg-red-600 h-5 text-xs ml-2">Live</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 py-4 max-w-5xl">
          {/* Main Betting Area */}
          <div className="grid grid-cols-1 gap-3 mb-3">
            {/* Primary Bets Row */}
            <div className="grid grid-cols-3 gap-3">
              {/* Player */}
              <Card
                className={cn(
                  "cursor-pointer transition-all p-4 bg-gradient-to-br from-blue-600 to-blue-800 border-2",
                  bets.player > 0
                    ? "border-yellow-400 ring-2 ring-yellow-400"
                    : "border-blue-500",
                )}
                onClick={() => placeBet("player")}
              >
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl mb-2">PLAYER</h3>
                  <Badge className="bg-white/20 text-white mb-2">2.00x</Badge>
                  {bets.player > 0 && (
                    <div className="bg-white/20 rounded px-3 py-1">
                      <p className="text-white font-bold">₹{bets.player}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Tie */}
              <Card
                className={cn(
                  "cursor-pointer transition-all p-4 bg-gradient-to-br from-green-600 to-green-800 border-2",
                  bets.tie > 0
                    ? "border-yellow-400 ring-2 ring-yellow-400"
                    : "border-green-500",
                )}
                onClick={() => placeBet("tie")}
              >
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl mb-2">TIE</h3>
                  <Badge className="bg-white/20 text-white mb-2">9.00x</Badge>
                  {bets.tie > 0 && (
                    <div className="bg-white/20 rounded px-3 py-1">
                      <p className="text-white font-bold">₹{bets.tie}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Banker */}
              <Card
                className={cn(
                  "cursor-pointer transition-all p-4 bg-gradient-to-br from-red-600 to-red-800 border-2",
                  bets.banker > 0
                    ? "border-yellow-400 ring-2 ring-yellow-400"
                    : "border-red-500",
                )}
                onClick={() => placeBet("banker")}
              >
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl mb-2">BANKER</h3>
                  <Badge className="bg-white/20 text-white mb-2">1.95x</Badge>
                  {bets.banker > 0 && (
                    <div className="bg-white/20 rounded px-3 py-1">
                      <p className="text-white font-bold">₹{bets.banker}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Side Bets Row */}
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={cn(
                  "cursor-pointer transition-all p-2 bg-slate-800 border",
                  bets.playerPair > 0
                    ? "border-yellow-400"
                    : "border-slate-600",
                )}
                onClick={() => placeBet("playerPair")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-bold">
                      Player Pair
                    </p>
                    <Badge className="bg-blue-600/20 text-blue-400 text-xs">
                      12x
                    </Badge>
                  </div>
                  {bets.playerPair > 0 && (
                    <Badge className="bg-yellow-500 text-black">
                      ₹{bets.playerPair}
                    </Badge>
                  )}
                </div>
              </Card>

              <Card
                className={cn(
                  "cursor-pointer transition-all p-2 bg-slate-800 border",
                  bets.bankerPair > 0
                    ? "border-yellow-400"
                    : "border-slate-600",
                )}
                onClick={() => placeBet("bankerPair")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 text-sm font-bold">
                      Banker Pair
                    </p>
                    <Badge className="bg-red-600/20 text-red-400 text-xs">
                      12x
                    </Badge>
                  </div>
                  {bets.bankerPair > 0 && (
                    <Badge className="bg-yellow-500 text-black">
                      ₹{bets.bankerPair}
                    </Badge>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Roadmap Strip */}
          <Card className="bg-slate-800/50 border-slate-700 p-2 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs font-bold">Bead Road</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowRoadmap(!showRoadmap)}
                className="h-6 text-xs"
              >
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform",
                    showRoadmap && "rotate-180",
                  )}
                />
              </Button>
            </div>
            <div
              className={cn(
                "flex gap-1 overflow-x-auto pb-1",
                showRoadmap ? "flex-wrap" : "",
              )}
            >
              {BEAD_ROAD.slice(0, showRoadmap ? 30 : 15).map((result, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    result === "P"
                      ? "bg-blue-600 text-white"
                      : result === "B"
                        ? "bg-red-600 text-white"
                        : "bg-green-600 text-white",
                  )}
                >
                  {result}
                </div>
              ))}
            </div>
          </Card>

          {/* Controls */}
          <Card className="bg-slate-800/50 border-slate-700 p-3">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-gray-400 text-xs font-bold">Chips:</span>
              {CHIP_VALUES.map((value) => (
                <BettingChip
                  key={value}
                  amount={value}
                  selected={selectedChip === value}
                  onClick={() => setSelectedChip(value)}
                />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={clearBets}
                className="border-red-600 text-red-500 hover:bg-red-600/20 text-xs"
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-600 text-blue-500 hover:bg-blue-600/20 text-xs"
              >
                Repeat
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-500 hover:bg-green-600/20 text-xs"
              >
                2x
              </Button>
              <Button
                size="sm"
                onClick={handlePlaceBets}
                className="bg-green-600 hover:bg-green-700 text-xs font-bold"
              >
                Place Bet
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900/50 rounded p-2">
                <p className="text-gray-400 text-xs">Total Stake</p>
                <p className="text-white font-bold">₹{totalStake}</p>
              </div>
              <div className="bg-slate-900/50 rounded p-2">
                <p className="text-gray-400 text-xs">Potential Win</p>
                <p className="text-green-400 font-bold">
                  ₹{potentialWin.toFixed(0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
