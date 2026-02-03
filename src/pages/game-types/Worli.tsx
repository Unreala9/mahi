import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BettingChip } from "@/components/casino/BettingChip";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const NUMBER_PANELS = [
  { id: "0", name: "0", odds: "9.5x", color: "from-red-600 to-red-800" },
  { id: "1", name: "1", odds: "9.5x", color: "from-blue-600 to-blue-800" },
  { id: "2", name: "2", odds: "9.5x", color: "from-green-600 to-green-800" },
  { id: "3", name: "3", odds: "9.5x", color: "from-purple-600 to-purple-800" },
  { id: "4", name: "4", odds: "9.5x", color: "from-yellow-600 to-yellow-800" },
  { id: "5", name: "5", odds: "9.5x", color: "from-pink-600 to-pink-800" },
  { id: "6", name: "6", odds: "9.5x", color: "from-indigo-600 to-indigo-800" },
  { id: "7", name: "7", odds: "9.5x", color: "from-orange-600 to-orange-800" },
  { id: "8", name: "8", odds: "9.5x", color: "from-cyan-600 to-cyan-800" },
  { id: "9", name: "9", odds: "9.5x", color: "from-teal-600 to-teal-800" },
];

const COMBO_PANELS = [
  {
    id: "even",
    name: "EVEN",
    odds: "1.95x",
    color: "from-blue-700 to-blue-900",
  },
  { id: "odd", name: "ODD", odds: "1.95x", color: "from-red-700 to-red-900" },
  {
    id: "low",
    name: "0-4",
    odds: "1.95x",
    color: "from-green-700 to-green-900",
  },
  {
    id: "high",
    name: "5-9",
    odds: "1.95x",
    color: "from-purple-700 to-purple-900",
  },
];

const HISTORY = [
  { round: "#4582", number: "7", winning: ["7", "odd", "high"], pool: "₹8400" },
  { round: "#4581", number: "2", winning: ["2", "even", "low"], pool: "₹6200" },
  { round: "#4580", number: "9", winning: ["9", "odd", "high"], pool: "₹7800" },
  { round: "#4579", number: "0", winning: ["0", "even", "low"], pool: "₹5900" },
  { round: "#4578", number: "5", winning: ["5", "odd", "high"], pool: "₹9200" },
  { round: "#4577", number: "3", winning: ["3", "odd", "low"], pool: "₹7100" },
  {
    round: "#4576",
    number: "8",
    winning: ["8", "even", "high"],
    pool: "₹8600",
  },
  { round: "#4575", number: "1", winning: ["1", "odd", "low"], pool: "₹6800" },
];

export default function Worli() {
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
    gameType: "worli",
    gameName: "Worli",
  });

  const [countdown, setCountdown] = useState(20);
  const [currentRound, setCurrentRound] = useState("#4583");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnNumber, setDrawnNumber] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsDrawing(true);
          setDrawnNumber(Math.floor(Math.random() * 10).toString());
          setTimeout(() => {
            setIsDrawing(false);
            setDrawnNumber(null);
            setCurrentRound(`#${parseInt(currentRound.slice(1)) + 1}`);
          }, 5000);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentRound]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900/20 to-black">
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
                <h1 className="text-2xl font-bold text-indigo-400 mb-1">
                  Worli Number Game
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <Badge className="bg-indigo-600 text-lg px-4 py-1">
                    Round {currentRound}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-500 font-bold text-lg">
                      {countdown}s
                    </span>
                  </div>
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
            {/* Game Board */}
            <div className="lg:col-span-3">
              {/* Number Draw Area */}
              <Card className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border-indigo-600/30 p-8 mb-6">
                <div className="text-center">
                  <h2 className="text-indigo-400 font-bold text-xl mb-4">
                    Drawn Number
                  </h2>
                  <div
                    className={cn(
                      "w-32 h-32 mx-auto rounded-full border-8 border-yellow-500 flex items-center justify-center transition-all duration-1000",
                      isDrawing &&
                        "animate-pulse scale-110 bg-gradient-to-br from-yellow-500 to-orange-600",
                      !isDrawing && "bg-gray-800",
                    )}
                  >
                    {isDrawing && drawnNumber ? (
                      <span className="text-white font-bold text-6xl">
                        {drawnNumber}
                      </span>
                    ) : (
                      <span className="text-gray-600 font-bold text-4xl">
                        ?
                      </span>
                    )}
                  </div>
                  {isDrawing && drawnNumber && (
                    <Badge className="mt-4 bg-yellow-600 text-lg px-6 py-2 animate-pulse">
                      Winner: {drawnNumber}
                    </Badge>
                  )}
                </div>
              </Card>

              {/* Number Panels */}
              <h3 className="text-indigo-400 font-bold text-lg mb-3">
                Single Numbers (9.5x)
              </h3>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {NUMBER_PANELS.map((panel) => (
                  <Card
                    key={panel.id}
                    className={cn(
                      "bg-gradient-to-br p-4 border-4 transition-all hover:scale-105 cursor-pointer",
                      panel.color,
                      "border-white/30",
                      bets[panel.id] > 0 &&
                        "ring-4 ring-yellow-500 ring-offset-2 ring-offset-gray-900",
                    )}
                    onClick={() => placeBet(panel.id)}
                  >
                    <div className="text-center">
                      <h3 className="text-white font-bold text-4xl mb-2">
                        {panel.name}
                      </h3>
                      <Badge className="bg-white/20 backdrop-blur-sm text-white text-xs">
                        {panel.odds}
                      </Badge>
                      {bets[panel.id] > 0 && (
                        <div className="mt-2 bg-white/10 rounded p-1">
                          <p className="text-white text-xs font-bold">
                            ₹{bets[panel.id]}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Combo Panels */}
              <h3 className="text-indigo-400 font-bold text-lg mb-3">
                Combinations (1.95x)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {COMBO_PANELS.map((panel) => (
                  <Card
                    key={panel.id}
                    className={cn(
                      "bg-gradient-to-br p-6 border-4 transition-all hover:scale-105 cursor-pointer",
                      panel.color,
                      "border-white/30",
                      bets[panel.id] > 0 &&
                        "ring-4 ring-yellow-500 ring-offset-2 ring-offset-gray-900",
                    )}
                    onClick={() => placeBet(panel.id)}
                  >
                    <div className="text-center">
                      <h3 className="text-white font-bold text-2xl mb-2">
                        {panel.name}
                      </h3>
                      <Badge className="bg-white/20 backdrop-blur-sm text-white">
                        {panel.odds}
                      </Badge>
                      {bets[panel.id] > 0 && (
                        <div className="mt-3 bg-white/10 rounded p-2">
                          <p className="text-white text-sm font-bold">
                            ₹{bets[panel.id]}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Controls */}
              <Card className="bg-gray-800/50 border-indigo-600/20 p-4">
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

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20 font-bold"
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-500 hover:bg-blue-600/20 font-bold"
                  >
                    Repeat Last
                  </Button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-indigo-600/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-400 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Active Bets</p>
                      <p className="text-indigo-400 font-bold text-2xl">
                        {Object.keys(bets).length}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold text-lg py-6"
                    disabled={totalStake === 0 || countdown <= 0}
                  >
                    PLACE BETS
                  </Button>
                </div>
              </Card>
            </div>

            {/* History Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-indigo-600/20 p-4">
                <h3 className="text-indigo-400 font-bold mb-4 text-center">
                  Draw History
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((result, idx) => {
                    const panel = NUMBER_PANELS.find(
                      (p) => p.id === result.number,
                    );
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all hover:scale-105",
                          `bg-gradient-to-r ${panel?.color}`,
                          "border-white/30",
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-white/20 backdrop-blur-sm text-white text-xs">
                            {result.round}
                          </Badge>
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <span className="text-gray-900 font-bold text-lg">
                              {result.number}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {result.winning.map((win, i) => (
                            <Badge key={i} className="bg-green-600 text-xs">
                              {win}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-white text-xs text-right font-bold">
                          {result.pool}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Pattern Stats */}
                <div className="mt-4 bg-gray-900/50 p-3 rounded border border-indigo-600/30">
                  <h4 className="text-indigo-400 font-bold text-sm mb-3">
                    Last 8 Rounds
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Even:</span>
                      <span className="text-white font-bold">
                        {
                          HISTORY.filter((h) => parseInt(h.number) % 2 === 0)
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Odd:</span>
                      <span className="text-white font-bold">
                        {
                          HISTORY.filter((h) => parseInt(h.number) % 2 !== 0)
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Low (0-4):</span>
                      <span className="text-white font-bold">
                        {HISTORY.filter((h) => parseInt(h.number) <= 4).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">High (5-9):</span>
                      <span className="text-white font-bold">
                        {HISTORY.filter((h) => parseInt(h.number) >= 5).length}
                      </span>
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
