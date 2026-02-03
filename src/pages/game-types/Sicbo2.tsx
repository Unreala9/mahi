import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const MAIN_BETS = [
  { id: "small", name: "Small (4-10)", odds: 1.95 },
  { id: "big", name: "Big (11-17)", odds: 1.95 },
  { id: "total7", name: "Total 7", odds: 12.0 },
  { id: "total10", name: "Total 10", odds: 6.0 },
  { id: "total11", name: "Total 11", odds: 6.0 },
  { id: "total12", name: "Total 12", odds: 6.0 },
];

const HISTORY = Array.from({ length: 10 }, () => [
  Math.floor(Math.random() * 6) + 1,
  Math.floor(Math.random() * 6) + 1,
  Math.floor(Math.random() * 6) + 1,
]);

export default function Sicbo2() {
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
    gameType: "sicbo2",
    gameName: "Sicbo 2",
  });

  const [countdown, setCountdown] = useState(25);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [dice, setDice] = useState([1, 1, 1]);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRolling(true);
          setTimeout(() => {
            setDice([
              Math.floor(Math.random() * 6) + 1,
              Math.floor(Math.random() * 6) + 1,
              Math.floor(Math.random() * 6) + 1,
            ]);
            setTimeout(() => setIsRolling(false), 1500);
          }, 1500);
          return 25;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBets = async () => {
    const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      Object.entries(bets).forEach(([betId, stake]) => {
        if (stake > 0) {
          const bet = MAIN_BETS.find((b) => b.id === betId);
          if (bet) {
            betPromises.push(
              bettingService.placeBet({
                gameType: "CASINO",
                gameId: "sicbo2",
                gameName: "Sicbo 2",
                marketId: betId,
                marketName: bet.name,
                selection: bet.name,
                odds: bet.odds,
                stake,
                betType: "BACK",
              }),
            );
          }
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-purple-700 sticky top-0 z-10">
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
              <div className="text-center">
                <h1 className="text-2xl font-bold text-purple-500 mb-1">
                  <Dices className="inline w-6 h-6 mr-2" />
                  Sic Bo 2 - Fast
                </h1>
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-400 font-bold">
                    {countdown}s
                  </span>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse">
                Live
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Dice Display */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border-purple-700 p-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                {dice.map((die, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-20 h-20 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center text-4xl font-bold text-purple-900 shadow-2xl border-2 border-purple-500",
                      isRolling && "animate-spin",
                    )}
                  >
                    {die}
                  </div>
                ))}
              </div>
              {!isRolling && (
                <Badge className="bg-purple-600 text-lg px-6 py-2">
                  Total: {dice.reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </div>
          </Card>

          {/* Main Betting Grid */}
          <Card className="bg-slate-800/50 border-purple-700/30 p-4 mb-4">
            <h3 className="text-purple-400 font-bold mb-3 text-center">
              Popular Bets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MAIN_BETS.map((bet) => (
                <Card
                  key={bet.id}
                  className={cn(
                    "cursor-pointer transition-all p-4 border-2",
                    bets[bet.id] > 0
                      ? "border-purple-400 bg-purple-900/50 scale-105 shadow-lg shadow-purple-500/50"
                      : "border-slate-600 bg-slate-900 hover:border-purple-500",
                  )}
                  onClick={() => placeBet(bet.id)}
                >
                  <div className="text-center">
                    <p className="text-white font-bold mb-2">{bet.name}</p>
                    <Badge className="bg-purple-600 mb-2">{bet.odds}x</Badge>
                    {bets[bet.id] > 0 && (
                      <Badge className="bg-yellow-500 text-black w-full">
                        ₹{bets[bet.id]}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Controls */}
          <Card className="bg-slate-800/50 border-purple-700/30 p-4 mb-4">
            <div className="flex gap-2 mb-4 flex-wrap justify-center">
              {CHIP_VALUES.map((value) => (
                <BettingChip
                  key={value}
                  amount={value}
                  selected={selectedChip === value}
                  onClick={() => setSelectedChip(value)}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                variant="outline"
                onClick={clearBets}
                className="border-red-600 text-red-500 hover:bg-red-600/20"
              >
                Clear
              </Button>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-500 hover:bg-blue-600/20"
              >
                2x
              </Button>
              <Button
                onClick={handlePlaceBets}
                className="bg-purple-600 hover:bg-purple-700 font-bold"
              >
                Place Bet
              </Button>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Stake</p>
                <p className="text-white font-bold">₹{totalStake}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Potential</p>
                <p className="text-purple-400 font-bold">
                  ₹{potentialWin.toFixed(0)}
                </p>
              </div>
            </div>
          </Card>

          {/* History Strip */}
          <Card className="bg-slate-800/50 border-purple-700/30 p-3">
            <h3 className="text-purple-400 font-bold text-sm mb-2">
              Recent Results
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {HISTORY.map((roll, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 bg-slate-900/50 rounded p-2 flex gap-1"
                >
                  {roll.map((die, dieIdx) => (
                    <div
                      key={dieIdx}
                      className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-slate-900"
                    >
                      {die}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
