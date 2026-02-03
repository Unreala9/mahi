import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const BETTING_PANELS = [
  {
    id: "below7",
    name: "Below 7",
    color: "from-blue-700 to-blue-900",
    textColor: "text-blue-400",
    odds: 1.95,
  },
  {
    id: "exactly7",
    name: "Exactly 7",
    color: "from-yellow-600 to-yellow-800",
    textColor: "text-yellow-400",
    odds: 11.0,
  },
  {
    id: "above7",
    name: "Above 7",
    color: "from-red-700 to-red-900",
    textColor: "text-red-400",
    odds: 1.95,
  },
  {
    id: "even",
    name: "Even",
    color: "from-green-700 to-green-900",
    textColor: "text-green-400",
    odds: 2.0,
  },
];

export default function Lucky7EU() {
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
    gameType: "lucky7eu",
    gameName: "Lucky 7 EU",
  });

  const [countdown, setCountdown] = useState(20);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({
    below7: 0,
    exactly7: 0,
    above7: 0,
    even: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          setTimeout(() => setIsRevealing(false), 4000);
          return 20;
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
      BETTING_PANELS.forEach((panel) => {
        const stake = bets[panel.id as keyof typeof bets];
        if (stake > 0) {
          betPromises.push(
            bettingService.placeBet({
              gameType: "CASINO",
              gameId: "lucky7eu",
              gameName: "Lucky 7 European",
              marketId: panel.id,
              marketName: panel.name,
              selection: panel.name,
              odds: panel.odds,
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
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-900">
        {/* European Stars Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <Star
              key={i}
              className="absolute text-yellow-500"
              style={{
                left: `${i * 8 + 5}%`,
                top: `${(i * 7) % 60}%`,
                width: "20px",
                height: "20px",
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="bg-slate-900/90 border-b border-blue-800 backdrop-blur-sm sticky top-0 z-10">
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
                <h1 className="text-2xl font-bold text-yellow-500 mb-1">
                  Lucky 7 European
                </h1>
                <div className="bg-blue-900/50 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full transition-all duration-1000" />
                </div>
                <p className="text-blue-400 text-sm mt-1">
                  {countdown}s remaining
                </p>
              </div>
              <Badge className="bg-red-600 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Area */}
            <div className="lg:col-span-3">
              {/* Card Reveal Area */}
              <Card className="bg-gradient-to-br from-blue-900/50 to-indigo-900/30 border-yellow-500/30 p-8 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]"></div>
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Star className="w-6 h-6 text-yellow-500 animate-pulse" />
                    <h3 className="text-yellow-400 font-bold text-2xl">
                      CARD REVEAL
                    </h3>
                    <Star className="w-6 h-6 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="inline-block">
                    <PlayingCard
                      card={isRevealing ? "7HH" : ""}
                      flipped={isRevealing}
                      className="w-32 h-44"
                    />
                  </div>
                </div>
              </Card>

              {/* Betting Panels */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {BETTING_PANELS.map((panel) => (
                  <Card
                    key={panel.id}
                    className={cn(
                      "cursor-pointer transition-all border-2 overflow-hidden",
                      bets[panel.id as keyof typeof bets] > 0
                        ? `bg-gradient-to-br ${panel.color} border-yellow-400 scale-105`
                        : `bg-gradient-to-br ${panel.color} border-gray-600 hover:scale-105`,
                    )}
                    onClick={() => placeBet(panel.id as keyof typeof bets)}
                  >
                    <div className="p-4">
                      <div className="text-center mb-3">
                        <h3 className="text-white font-bold text-lg mb-2">
                          {panel.name}
                        </h3>
                        <Badge className="bg-white/20 text-white">
                          {panel.odds}x
                        </Badge>
                      </div>
                      {bets[panel.id as keyof typeof bets] > 0 && (
                        <div className="bg-white/20 rounded p-2 animate-pulse">
                          <p className="text-white font-bold text-center">
                            ₹{bets[panel.id as keyof typeof bets]}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Controls */}
              <Card className="bg-slate-800/50 border-blue-800/30 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm font-bold">
                    Select Chip:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      amount={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
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
                    2x
                  </Button>
                  <Button
                    onClick={handlePlaceBets}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 font-bold"
                  >
                    Place Bet
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-300 text-xs">Potential Win</p>
                      <p className="text-yellow-400 font-bold text-2xl">
                        ₹{potentialWin.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-blue-800/30 p-4">
                <h3 className="text-yellow-400 font-bold mb-4 text-center">
                  Recent Results
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/50 rounded p-3 border border-blue-700/30"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-blue-600 text-white font-bold">
                          {item.value}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            item.result === "Below"
                              ? "bg-blue-700"
                              : item.result === "Exact"
                                ? "bg-yellow-600"
                                : "bg-red-700",
                          )}
                        >
                          {item.result}
                        </Badge>
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
