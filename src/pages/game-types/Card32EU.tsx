import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";
const PANELS = [
  {
    id: "A",
    name: "Panel A",
    color: "from-red-600 to-red-800",
    borderColor: "border-red-500",
    textColor: "text-red-500",
  },
  {
    id: "B",
    name: "Panel B",
    color: "from-blue-600 to-blue-800",
    borderColor: "border-blue-500",
    textColor: "text-blue-500",
  },
  {
    id: "C",
    name: "Panel C",
    color: "from-green-600 to-green-800",
    borderColor: "border-green-500",
    textColor: "text-green-500",
  },
  {
    id: "D",
    name: "Panel D",
    color: "from-purple-600 to-purple-800",
    borderColor: "border-purple-500",
    textColor: "text-purple-500",
  },
];

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

export default function Card32EU() {
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
    gameType: "card32eu",
    gameName: "Card 32 EU",
  });

  const [countdown, setCountdown] = useState(15);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedCards, setRevealedCards] = useState({
    A: "🂠",
    B: "🂠",
    C: "🂠",
    D: "🂠",
  });
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          setRevealedCards({
            A: "🂮",
            B: "🂫",
            C: "🃋",
            D: "🂷",
          });
          setTimeout(() => {
            setIsRevealing(false);
            setRevealedCards({
              A: "🂠",
              B: "🂠",
              C: "🂠",
              D: "🂠",
            });
          }, 4000);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBets = async () => {
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      const panelOdds: Record<string, number> = {
        A: 2.5,
        B: 2.8,
        C: 3.0,
        D: 3.2,
      };

      Object.entries(bets).forEach(([panelId, stake]) => {
        if (stake > 0) {
          const panel = PANELS.find((p) => p.id === panelId);
          betPromises.push(
            bettingService.placeBet({
              gameType: "CASINO",
              gameId: "card32eu",
              gameName: "32 Cards EU",
              marketId: panelId,
              marketName: panel?.name || `Panel ${panelId}`,
              selection: panel?.name || `Panel ${panelId}`,
              odds: panelOdds[panelId],
              stake: stake,
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900/10 to-gray-900">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-indigo-600/30 backdrop-blur-sm sticky top-0 z-10">
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
                  32 Cards EU
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-xl">
                    {countdown}s
                  </span>
                </div>
              </div>
              <Badge className="bg-indigo-600 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Board (Center-Left) */}
            <div className="lg:col-span-3">
              {/* Four Betting Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {PANELS.map((panel) => (
                  <Card
                    key={panel.id}
                    className={cn(
                      "bg-gradient-to-br p-6 border-4 transition-all hover:scale-[1.02]",
                      panel.color,
                      panel.borderColor,
                    )}
                  >
                    <div className="text-center mb-4">
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {panel.name}
                      </h2>
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        3.8x Payout
                      </Badge>
                    </div>

                    {/* Card Reveal Area */}
                    <div
                      className={cn(
                        "aspect-[3/4] max-w-[200px] mx-auto bg-white rounded-xl flex items-center justify-center text-9xl shadow-2xl border-4 transition-all duration-700",
                        panel.borderColor,
                        isRevealing && "rotate-y-180 scale-110",
                      )}
                    >
                      {revealedCards[panel.id as keyof typeof revealedCards]}
                    </div>

                    {/* Bet Button */}
                    <button
                      onClick={() =>
                        placeBet(panel.id as "A" | "B" | "C" | "D")
                      }
                      disabled={countdown <= 0}
                      className={cn(
                        "w-full mt-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold text-xl py-6 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/40 shadow-lg",
                      )}
                    >
                      BET {panel.name.split(" ")[1]}
                      {bets[panel.id as keyof typeof bets] > 0 && (
                        <span className="block text-sm mt-1 font-bold">
                          ₹{bets[panel.id as keyof typeof bets]}
                        </span>
                      )}
                    </button>
                  </Card>
                ))}
              </div>

              {/* Controls */}
              <Card className="bg-gray-800/50 border-indigo-600/20 p-4 mb-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm font-bold">
                    Select Chip:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={cn(
                        "w-16 h-16 rounded-full font-bold text-sm border-4 transition-all hover:scale-110",
                        selectedChip === value
                          ? "bg-yellow-600 border-yellow-400 text-white ring-4 ring-yellow-300"
                          : "bg-gray-700 border-gray-600 text-gray-300",
                      )}
                    >
                      ₹{value}
                    </button>
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
                    className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 font-bold"
                  >
                    Place Bet
                  </Button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-indigo-600/30">
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {PANELS.map((panel) => (
                      <div key={panel.id} className="text-center">
                        <p className={cn("text-xs font-bold", panel.textColor)}>
                          {panel.id}
                        </p>
                        <p className="text-white font-bold">
                          ₹{bets[panel.id as keyof typeof bets]}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
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

            {/* History Panel (Right) */}
            <div className="lg:col-span-1 order-last">
              <Card className="bg-gray-800/50 border-indigo-600/20 p-4">
                <h3 className="text-indigo-400 font-bold mb-4 text-center">
                  Last 10 Results
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((result, idx) => {
                    const panel = PANELS.find((p) => p.id === result.winner);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all hover:scale-105",
                          `bg-gradient-to-r ${panel?.color}`,
                          panel?.borderColor,
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-lg">
                            Panel {result.winner}
                          </span>
                          <div className="text-3xl">{result.card}</div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-white/20 backdrop-blur-sm text-white text-xs">
                            {result.payout}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
