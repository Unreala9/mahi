import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const NUMBER_PANELS = [
  {
    id: "0",
    name: "0",
    odds: 9.5,
    color: "from-red-600 to-red-800",
    frequency: 12,
  },
  {
    id: "1",
    name: "1",
    odds: 9.5,
    color: "from-blue-600 to-blue-800",
    frequency: 8,
  },
  {
    id: "2",
    name: "2",
    odds: 9.5,
    color: "from-green-600 to-green-800",
    frequency: 15,
  },
  {
    id: "3",
    name: "3",
    odds: 9.5,
    color: "from-purple-600 to-purple-800",
    frequency: 10,
  },
  {
    id: "4",
    name: "4",
    odds: 9.5,
    color: "from-yellow-600 to-yellow-800",
    frequency: 7,
  },
  {
    id: "5",
    name: "5",
    odds: 9.5,
    color: "from-pink-600 to-pink-800",
    frequency: 11,
  },
  {
    id: "6",
    name: "6",
    odds: 9.5,
    color: "from-indigo-600 to-indigo-800",
    frequency: 9,
  },
  {
    id: "7",
    name: "7",
    odds: 9.5,
    color: "from-orange-600 to-orange-800",
    frequency: 14,
  },
  {
    id: "8",
    name: "8",
    odds: 9.5,
    color: "from-cyan-600 to-cyan-800",
    frequency: 6,
  },
  {
    id: "9",
    name: "9",
    odds: 9.5,
    color: "from-teal-600 to-teal-800",
    frequency: 13,
  },
];

const COMBO_PANELS = [
  { id: "even", name: "EVEN", odds: 1.95, color: "from-blue-700 to-blue-900" },
  { id: "odd", name: "ODD", odds: 1.95, color: "from-red-700 to-red-900" },
  { id: "low", name: "0-4", odds: 1.95, color: "from-green-700 to-green-900" },
  {
    id: "high",
    name: "5-9",
    odds: 1.95,
    color: "from-purple-700 to-purple-900",
  },
];

const SPECIAL_COMBOS = [
  { id: "combo_0_5", name: "0+5", odds: 45.0, numbers: [0, 5] },
  { id: "combo_1_6", name: "1+6", odds: 45.0, numbers: [1, 6] },
  { id: "combo_2_7", name: "2+7", odds: 45.0, numbers: [2, 7] },
  { id: "combo_3_8", name: "3+8", odds: 45.0, numbers: [3, 8] },
  { id: "combo_4_9", name: "4+9", odds: 45.0, numbers: [4, 9] },
];

export default function Worli3() {
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
    gameType: "worli3",
    gameName: "Worli 3",
  });

  const [countdown, setCountdown] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnNumber, setDrawnNumber] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsDrawing(true);
          setDrawnNumber(Math.floor(Math.random() * 10).toString());
          setTimeout(() => {
            setIsDrawing(false);
            setDrawnNumber(null);
          }, 4000);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const quickSelect = (type: string) => {
    const newBets: Record<string, number> = {};
    if (type === "hot") {
      [2, 7, 9].forEach((num) => (newBets[num.toString()] = selectedChip));
    } else if (type === "all-odd") {
      [1, 3, 5, 7, 9].forEach(
        (num) => (newBets[num.toString()] = selectedChip),
      );
    } else if (type === "all-even") {
      [0, 2, 4, 6, 8].forEach(
        (num) => (newBets[num.toString()] = selectedChip),
      );
    }
    setBets(newBets);
  };

  const handlePlaceBets = async () => {
    const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      Object.entries(bets).forEach(([panelId, stake]) => {
        if (stake > 0) {
          const panel = [
            ...NUMBER_PANELS,
            ...COMBO_PANELS,
            ...SPECIAL_COMBOS,
          ].find((p) => p.id === panelId);
          if (panel) {
            betPromises.push(
              bettingService.placeBet({
                gameType: "CASINO",
                gameId: "worli3",
                gameName: "Worli 3",
                marketId: panelId,
                marketName: panel.name,
                selection: panel.name,
                odds: panel.odds,
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
                  Worli 3 - Advanced
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

        <div className="container mx-auto px-4 py-6">
          {/* Quick Select Shortcuts */}
          <Card className="bg-slate-800/50 border-purple-700/30 p-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-purple-400 text-sm font-bold">
                Quick Select:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => quickSelect("hot")}
                className="border-orange-600 text-orange-500 hover:bg-orange-600/20"
              >
                <Flame className="w-3 h-3 mr-1" />
                Hot Numbers
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => quickSelect("all-odd")}
                className="border-red-600 text-red-500 hover:bg-red-600/20"
              >
                All ODD
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => quickSelect("all-even")}
                className="border-blue-600 text-blue-500 hover:bg-blue-600/20"
              >
                All EVEN
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className="border-purple-600 text-purple-500 hover:bg-purple-600/20"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Heatmap
              </Button>
            </div>
          </Card>

          {/* Result Display */}
          {isDrawing && drawnNumber && (
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500 p-8 mb-4 text-center animate-pulse">
              <h2 className="text-purple-400 font-bold text-xl mb-3">
                Winning Number
              </h2>
              <div className="text-8xl font-bold text-white">{drawnNumber}</div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Number Grid */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-slate-800/50 border-purple-700/30 p-4">
                <h3 className="text-purple-400 font-bold mb-3">Number Bets</h3>
                <div className="grid grid-cols-5 gap-3">
                  {NUMBER_PANELS.map((panel) => {
                    const hotness =
                      panel.frequency > 12
                        ? "hot"
                        : panel.frequency < 8
                          ? "cold"
                          : "normal";
                    return (
                      <Card
                        key={panel.id}
                        className={cn(
                          "cursor-pointer transition-all p-4 border-2 relative",
                          bets[panel.id] > 0
                            ? `bg-gradient-to-br ${panel.color} border-yellow-400 scale-105`
                            : `bg-gradient-to-br ${panel.color} border-slate-600 hover:scale-105`,
                        )}
                        onClick={() => placeBet(panel.id)}
                      >
                        {showHeatmap && hotness === "hot" && (
                          <Flame className="absolute top-1 right-1 w-4 h-4 text-orange-500 animate-pulse" />
                        )}
                        <div className="text-center">
                          <p className="text-white font-bold text-3xl mb-1">
                            {panel.name}
                          </p>
                          <Badge className="bg-white/20 text-white text-xs mb-1">
                            {panel.odds}x
                          </Badge>
                          {showHeatmap && (
                            <p className="text-white/60 text-xs">
                              {panel.frequency}%
                            </p>
                          )}
                          {bets[panel.id] > 0 && (
                            <Badge className="bg-yellow-500 text-black w-full mt-1">
                              ₹{bets[panel.id]}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>

              {/* Combo Bets */}
              <Card className="bg-slate-800/50 border-purple-700/30 p-4">
                <h3 className="text-purple-400 font-bold mb-3">
                  Combination Bets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COMBO_PANELS.map((panel) => (
                    <Card
                      key={panel.id}
                      className={cn(
                        "cursor-pointer transition-all p-3 border-2",
                        bets[panel.id] > 0
                          ? `bg-gradient-to-br ${panel.color} border-yellow-400`
                          : `bg-gradient-to-br ${panel.color} border-slate-600 hover:border-purple-500`,
                      )}
                      onClick={() => placeBet(panel.id)}
                    >
                      <div className="text-center">
                        <p className="text-white font-bold mb-1">
                          {panel.name}
                        </p>
                        <Badge className="bg-white/20 text-white text-xs">
                          {panel.odds}x
                        </Badge>
                        {bets[panel.id] > 0 && (
                          <p className="text-yellow-400 text-sm mt-1">
                            ₹{bets[panel.id]}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Special Combos */}
              <Card className="bg-slate-800/50 border-purple-700/30 p-4">
                <h3 className="text-purple-400 font-bold mb-3">
                  Special Combinations (2 Numbers)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {SPECIAL_COMBOS.map((combo) => (
                    <Card
                      key={combo.id}
                      className={cn(
                        "cursor-pointer transition-all p-3 border-2",
                        bets[combo.id] > 0
                          ? "bg-gradient-to-br from-yellow-700 to-yellow-900 border-yellow-400"
                          : "bg-gradient-to-br from-slate-700 to-slate-900 border-slate-600 hover:border-yellow-500",
                      )}
                      onClick={() => placeBet(combo.id)}
                    >
                      <div className="text-center">
                        <p className="text-white font-bold text-sm mb-1">
                          {combo.name}
                        </p>
                        <Badge className="bg-yellow-600 text-xs">
                          {combo.odds}x
                        </Badge>
                        {bets[combo.id] > 0 && (
                          <p className="text-yellow-400 text-xs mt-1">
                            ₹{bets[combo.id]}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>

            {/* Controls Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-slate-800/50 border-purple-700/30 p-4">
                <h3 className="text-purple-400 font-bold mb-3">Controls</h3>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      amount={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20 text-sm"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-500 hover:bg-blue-600/20 text-sm"
                  >
                    2x
                  </Button>
                </div>

                <Button
                  onClick={handlePlaceBets}
                  className="w-full bg-purple-600 hover:bg-purple-700 font-bold mb-4"
                >
                  Place Bets
                </Button>

                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Stake:</span>
                    <span className="text-white font-bold">₹{totalStake}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Potential:</span>
                    <span className="text-purple-400 font-bold">
                      ₹{potentialWin.toFixed(0)}
                    </span>
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
