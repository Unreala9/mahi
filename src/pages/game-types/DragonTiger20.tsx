import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const HISTORY = [
  { winner: "D", suited: false },
  { winner: "T", suited: true },
  { winner: "D", suited: false },
  { winner: "Tie", suited: false },
  { winner: "T", suited: false },
  { winner: "D", suited: true },
  { winner: "T", suited: false },
  { winner: "D", suited: false },
  { winner: "T", suited: false },
  { winner: "D", suited: false },
];

export default function DragonTiger20() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(20);
  const [isRevealing, setIsRevealing] = useState(false);
  const [dragonCard, setDragonCard] = useState("🂠");
  const [tigerCard, setTigerCard] = useState("🂠");
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({
    dragon: 0,
    tiger: 0,
    tie: 0,
    dragonSuited: 0,
    tigerSuited: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          setDragonCard("🂮");
          setTigerCard("🂫");
          setTimeout(() => {
            setIsRevealing(false);
            setDragonCard("🂠");
            setTigerCard("🂠");
          }, 3000);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = (betType: keyof typeof bets) => {
    setBets((prev) => ({ ...prev, [betType]: prev[betType] + selectedChip }));
  };

  const clearBets = () => {
    setBets({ dragon: 0, tiger: 0, tie: 0, dragonSuited: 0, tigerSuited: 0 });
  };

  const handlePlaceBets = async () => {
    const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      if (bets.dragon > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "dt20",
            gameName: "Dragon Tiger 20",
            marketId: "dragon",
            marketName: "Dragon",
            selection: "Dragon",
            odds: 1.95,
            stake: bets.dragon,
            betType: "BACK",
          }),
        );
      }
      if (bets.tiger > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "dt20",
            gameName: "Dragon Tiger 20",
            marketId: "tiger",
            marketName: "Tiger",
            selection: "Tiger",
            odds: 1.95,
            stake: bets.tiger,
            betType: "BACK",
          }),
        );
      }
      if (bets.tie > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "dt20",
            gameName: "Dragon Tiger 20",
            marketId: "tie",
            marketName: "Tie",
            selection: "Tie",
            odds: 11,
            stake: bets.tie,
            betType: "BACK",
          }),
        );
      }
      if (bets.dragonSuited > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "dt20",
            gameName: "Dragon Tiger 20",
            marketId: "dragonSuited",
            marketName: "Dragon Suited",
            selection: "Dragon Suited",
            odds: 5.0,
            stake: bets.dragonSuited,
            betType: "BACK",
          }),
        );
      }
      if (bets.tigerSuited > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "dt20",
            gameName: "Dragon Tiger 20",
            marketId: "tigerSuited",
            marketName: "Tiger Suited",
            selection: "Tiger Suited",
            odds: 5.0,
            stake: bets.tigerSuited,
            betType: "BACK",
          }),
        );
      }

      await Promise.all(betPromises);
      clearBets();
    } catch (error) {
      console.error("Failed to place bets:", error);
    }
  };

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900/10 to-gray-900">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-red-600/30 backdrop-blur-sm sticky top-0 z-10">
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
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  <span className="text-red-500">Dragon</span> vs{" "}
                  <span className="text-blue-500">Tiger</span> 20
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-lg">
                    {countdown}s
                  </span>
                </div>
              </div>
              <Badge className="bg-red-600 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* History Column (Left) */}
            <div className="lg:col-span-1 order-last lg:order-first">
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <h3 className="text-purple-400 font-bold mb-4 text-center">
                  History
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg flex items-center justify-between border-2",
                        result.winner === "D"
                          ? "bg-red-900/30 border-red-600"
                          : result.winner === "T"
                            ? "bg-blue-900/30 border-blue-600"
                            : "bg-yellow-900/30 border-yellow-600",
                      )}
                    >
                      <span
                        className={cn(
                          "font-bold text-xl",
                          result.winner === "D"
                            ? "text-red-500"
                            : result.winner === "T"
                              ? "text-blue-500"
                              : "text-yellow-500",
                        )}
                      >
                        {result.winner}
                      </span>
                      {result.suited && (
                        <Badge className="bg-purple-600 text-xs">Suited</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Game Board (Center) */}
            <div className="lg:col-span-3">
              {/* Split Screen Battle Area */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Dragon Side (Left - Red) */}
                <Card className="bg-gradient-to-br from-red-950/50 to-red-900/30 border-red-600/50 p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-red-500 mb-2">
                      🐉 DRAGON
                    </h2>
                    <Badge className="bg-red-600 text-white">1.95x</Badge>
                  </div>

                  {/* Card Reveal Area */}
                  <div
                    className={cn(
                      "aspect-[3/4] max-w-xs mx-auto bg-white rounded-xl flex items-center justify-center text-9xl shadow-2xl border-4 border-red-500 transition-all duration-500",
                      isRevealing && "rotate-y-180 scale-110",
                    )}
                  >
                    {dragonCard}
                  </div>

                  {/* Bet Button */}
                  <button
                    onClick={() => placeBet("dragon")}
                    disabled={countdown <= 0}
                    className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-6 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-400"
                  >
                    BET DRAGON
                    {bets.dragon > 0 && (
                      <span className="block text-sm mt-1">₹{bets.dragon}</span>
                    )}
                  </button>

                  {/* Suited Bet */}
                  <button
                    onClick={() => placeBet("dragonSuited")}
                    disabled={countdown <= 0}
                    className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Dragon Suited (11x)
                    {bets.dragonSuited > 0 && (
                      <span className="block text-xs mt-1">
                        ₹{bets.dragonSuited}
                      </span>
                    )}
                  </button>
                </Card>

                {/* Tiger Side (Right - Blue) */}
                <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-blue-600/50 p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-blue-500 mb-2">
                      🐯 TIGER
                    </h2>
                    <Badge className="bg-blue-600 text-white">1.95x</Badge>
                  </div>

                  {/* Card Reveal Area */}
                  <div
                    className={cn(
                      "aspect-[3/4] max-w-xs mx-auto bg-white rounded-xl flex items-center justify-center text-9xl shadow-2xl border-4 border-blue-500 transition-all duration-500",
                      isRevealing && "rotate-y-180 scale-110",
                    )}
                  >
                    {tigerCard}
                  </div>

                  {/* Bet Button */}
                  <button
                    onClick={() => placeBet("tiger")}
                    disabled={countdown <= 0}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-6 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-400"
                  >
                    BET TIGER
                    {bets.tiger > 0 && (
                      <span className="block text-sm mt-1">₹{bets.tiger}</span>
                    )}
                  </button>

                  {/* Suited Bet */}
                  <button
                    onClick={() => placeBet("tigerSuited")}
                    disabled={countdown <= 0}
                    className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiger Suited (11x)
                    {bets.tigerSuited > 0 && (
                      <span className="block text-xs mt-1">
                        ₹{bets.tigerSuited}
                      </span>
                    )}
                  </button>
                </Card>
              </div>

              {/* Tie Bet (Center) */}
              <Card className="bg-gradient-to-r from-yellow-900/30 via-yellow-800/30 to-yellow-900/30 border-yellow-600/50 p-4 mb-4">
                <button
                  onClick={() => placeBet("tie")}
                  disabled={countdown <= 0}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xl py-4 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400"
                >
                  TIE (11:1)
                  {bets.tie > 0 && <span className="ml-3">₹{bets.tie}</span>}
                </button>
              </Card>

              {/* Controls */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm">Chips:</span>
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={cn(
                        "w-12 h-12 rounded-full font-bold text-xs border-4 transition-all hover:scale-110",
                        selectedChip === value
                          ? "bg-yellow-600 border-yellow-400 text-white ring-2 ring-yellow-300"
                          : "bg-gray-700 border-gray-600 text-gray-300",
                      )}
                    >
                      ₹{value}
                    </button>
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
                    Repeat
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-500 hover:bg-green-600/20"
                  >
                    Double
                  </Button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-600/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Potential Win</p>
                      <p className="text-green-500 font-bold text-2xl">
                        ₹
                        {bets.dragon * 1.95 +
                          bets.tiger * 1.95 +
                          bets.tie * 11 +
                          bets.dragonSuited * 11 +
                          bets.tigerSuited * 11}
                      </p>
                    </div>
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
