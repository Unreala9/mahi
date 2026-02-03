import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const HISTORY = [
  { result: "Player", war: false },
  { result: "Dealer", war: false },
  { result: "Player", war: true },
  { result: "Tie", war: false },
  { result: "Dealer", war: false },
  { result: "Player", war: false },
  { result: "Player", war: true },
  { result: "Dealer", war: false },
];

export default function CasinoWar() {
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
    gameType: "casinowar",
    gameName: "Casino War",
  });

  const [countdown, setCountdown] = useState(18);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isWar, setIsWar] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({
    war: 0,
    surrender: 0,
    tie: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          const warTrigger = Math.random() > 0.7;
          setIsWar(warTrigger);
          setTimeout(() => {
            setIsRevealing(false);
            setIsWar(false);
          }, 5000);
          return 18;
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
    setBets({ war: 0, surrender: 0, tie: 0 });
  };

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
  const potentialWin = bets.war * 2 + bets.surrender * 0.5 + bets.tie * 11;

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
                <h1 className="text-2xl font-bold text-red-400 mb-1 flex items-center justify-center gap-2">
                  <Swords className="w-6 h-6" />
                  Casino War
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
            {/* Game Board */}
            <div className="lg:col-span-3">
              {/* War Banner */}
              {isWar && (
                <div className="bg-gradient-to-r from-red-600 via-yellow-600 to-red-600 p-4 rounded-lg mb-6 animate-pulse border-4 border-yellow-500">
                  <div className="text-center">
                    <Swords className="w-12 h-12 mx-auto mb-2 text-white" />
                    <h2 className="text-white font-bold text-3xl">
                      ⚔️ WAR DECLARED! ⚔️
                    </h2>
                  </div>
                </div>
              )}

              {/* Card Zones */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Player Card */}
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-600/50 p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-blue-400 mb-2">
                      PLAYER
                    </h2>
                  </div>
                  <div className="flex justify-center mb-4">
                    <PlayingCard
                      suit={isRevealing ? "hearts" : undefined}
                      value={isRevealing ? "K" : undefined}
                      faceDown={!isRevealing}
                      size="xl"
                      flipped={isRevealing}
                    />
                  </div>
                  {isRevealing && (
                    <div className="text-center">
                      <Badge className="bg-blue-600 text-lg px-4 py-1">
                        King
                      </Badge>
                    </div>
                  )}
                </Card>

                {/* Dealer Card */}
                <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-600/50 p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-red-400 mb-2">
                      DEALER
                    </h2>
                  </div>
                  <div className="flex justify-center mb-4">
                    <PlayingCard
                      suit={isRevealing ? "spades" : undefined}
                      value={isRevealing ? "K" : undefined}
                      faceDown={!isRevealing}
                      size="xl"
                      flipped={isRevealing}
                    />
                  </div>
                  {isRevealing && (
                    <div className="text-center">
                      <Badge className="bg-red-600 text-lg px-4 py-1">
                        King
                      </Badge>
                    </div>
                  )}
                </Card>
              </div>

              {/* Betting Areas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* War Bet */}
                <Card
                  className={cn(
                    "bg-gradient-to-br from-red-600 to-red-800 border-red-500 p-6 cursor-pointer transition-all hover:scale-105",
                    bets.war > 0 &&
                      "ring-4 ring-yellow-500 ring-offset-2 ring-offset-gray-900",
                  )}
                  onClick={() => placeBet("war")}
                >
                  <div className="text-center">
                    <Swords className="w-8 h-8 mx-auto mb-2 text-white" />
                    <h3 className="text-white font-bold text-2xl mb-2">WAR</h3>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-3">
                      1:1 Payout
                    </Badge>
                    {bets.war > 0 && (
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-white font-bold">₹{bets.war}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Surrender Bet */}
                <Card
                  className={cn(
                    "bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500 p-6 cursor-pointer transition-all hover:scale-105",
                    bets.surrender > 0 &&
                      "ring-4 ring-yellow-500 ring-offset-2 ring-offset-gray-900",
                  )}
                  onClick={() => placeBet("surrender")}
                >
                  <div className="text-center">
                    <h3 className="text-white font-bold text-2xl mb-2">
                      SURRENDER
                    </h3>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-3">
                      0.5:1 Payout
                    </Badge>
                    {bets.surrender > 0 && (
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-white font-bold">
                          ₹{bets.surrender}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Tie Bet */}
                <Card
                  className={cn(
                    "bg-gradient-to-br from-green-600 to-green-800 border-green-500 p-6 cursor-pointer transition-all hover:scale-105",
                    bets.tie > 0 &&
                      "ring-4 ring-yellow-500 ring-offset-2 ring-offset-gray-900",
                  )}
                  onClick={() => placeBet("tie")}
                >
                  <div className="text-center">
                    <h3 className="text-white font-bold text-2xl mb-2">TIE</h3>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-3">
                      10:1 Payout
                    </Badge>
                    {bets.tie > 0 && (
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-white font-bold">₹{bets.tie}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Controls */}
              <Card className="bg-gray-800/50 border-red-600/20 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm font-bold">
                    Select Chip:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      value={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20 font-bold"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-500 hover:bg-blue-600/20 font-bold"
                  >
                    Repeat
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-500 hover:bg-green-600/20 font-bold"
                  >
                    Double
                  </Button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-red-600/30">
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
                        ₹{potentialWin.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* History Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-red-600/20 p-4">
                <h3 className="text-red-400 font-bold mb-4 text-center">
                  History
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded border-2 transition-all",
                        result.result === "Player"
                          ? "bg-blue-900/30 border-blue-600"
                          : result.result === "Dealer"
                            ? "bg-red-900/30 border-red-600"
                            : "bg-green-900/30 border-green-600",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          className={cn(
                            result.result === "Player"
                              ? "bg-blue-600"
                              : result.result === "Dealer"
                                ? "bg-red-600"
                                : "bg-green-600",
                          )}
                        >
                          {result.result}
                        </Badge>
                        {result.war && (
                          <Badge className="bg-yellow-600 text-xs flex items-center gap-1">
                            <Swords className="w-3 h-3" />
                            War
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
