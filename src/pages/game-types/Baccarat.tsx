import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, HelpCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const ROADMAP_HISTORY = [
  { winner: "B", natural: true },
  { winner: "P", natural: false },
  { winner: "B", natural: false },
  { winner: "T", natural: false },
  { winner: "B", natural: true },
  { winner: "P", natural: false },
  { winner: "B", natural: false },
  { winner: "B", natural: false },
  { winner: "P", natural: true },
  { winner: "B", natural: false },
  { winner: "T", natural: false },
  { winner: "B", natural: false },
];

export default function Baccarat() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [showHelp, setShowHelp] = useState(false);
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
          setIsRevealing(true);
          setTimeout(() => setIsRevealing(false), 5000);
          return 30;
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
    setBets({ player: 0, banker: 0, tie: 0, playerPair: 0, bankerPair: 0 });
  };

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
  const potentialWin =
    bets.player * 2 +
    bets.banker * 1.95 +
    bets.tie * 9 +
    bets.playerPair * 12 +
    bets.bankerPair * 12;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900/20 to-gray-900">
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
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-yellow-500 mb-1">
                  Baccarat
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-lg">
                    {countdown}s
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-gray-400 hover:text-white"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
                <Badge className="bg-yellow-600 animate-pulse">
                  <Clock className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="bg-yellow-900/20 border-b border-yellow-600/30 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-blue-900/30 p-3 rounded border border-blue-600/50">
                  <span className="font-bold text-blue-400">Player (1:1)</span>{" "}
                  - Bet on player's hand to win
                </div>
                <div className="bg-red-900/30 p-3 rounded border border-red-600/50">
                  <span className="font-bold text-red-400">
                    Banker (0.95:1)
                  </span>{" "}
                  - Bet on banker's hand to win
                </div>
                <div className="bg-green-900/30 p-3 rounded border border-green-600/50">
                  <span className="font-bold text-green-400">Tie (8:1)</span> -
                  Bet on both hands having same value
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Baccarat Table */}
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-yellow-600/30 p-8">
                {/* Shoe & Burn Card Indicator */}
                <div className="flex justify-end mb-4">
                  <div className="bg-gray-900/50 px-4 py-2 rounded border border-yellow-600/30">
                    <div className="flex items-center gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Shoe:</span>
                        <span className="text-white font-bold ml-2">5/8</span>
                      </div>
                      <div className="w-px h-4 bg-gray-700"></div>
                      <div>
                        <span className="text-gray-400">Burn:</span>
                        <span className="text-yellow-500 font-bold ml-2">
                          7
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Layout */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Player Section */}
                  <div className="space-y-4">
                    <Card className="bg-blue-900/30 border-blue-600/50 p-4">
                      <h3 className="text-center font-bold text-blue-400 text-xl mb-3">
                        PLAYER
                      </h3>

                      {/* Player Cards */}
                      <div className="flex justify-center gap-2 mb-4">
                        <PlayingCard
                          suit="hearts"
                          value="K"
                          size="lg"
                          flipped={isRevealing}
                        />
                        <PlayingCard
                          suit="diamonds"
                          value="5"
                          size="lg"
                          flipped={isRevealing}
                        />
                      </div>

                      {/* Player Bet Button */}
                      <button
                        onClick={() => placeBet("player")}
                        disabled={countdown <= 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-400"
                      >
                        BET PLAYER (1:1)
                        {bets.player > 0 && (
                          <span className="block text-sm mt-1">
                            ₹{bets.player}
                          </span>
                        )}
                      </button>

                      {/* Player Pair Side Bet */}
                      <button
                        onClick={() => placeBet("playerPair")}
                        disabled={countdown <= 0}
                        className="w-full mt-2 bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 rounded transition-all hover:scale-105 disabled:opacity-50 text-sm"
                      >
                        Player Pair (11:1)
                        {bets.playerPair > 0 && ` ₹${bets.playerPair}`}
                      </button>
                    </Card>
                  </div>

                  {/* Tie Section */}
                  <div className="space-y-4">
                    <Card className="bg-green-900/30 border-green-600/50 p-4">
                      <h3 className="text-center font-bold text-green-400 text-xl mb-3">
                        TIE
                      </h3>

                      {/* Center Pot Display */}
                      <div className="bg-yellow-600/20 rounded-lg p-4 mb-4 border-2 border-yellow-600/50">
                        <div className="text-center">
                          <p className="text-gray-400 text-xs mb-1">
                            Current Score
                          </p>
                          <div className="flex items-center justify-center gap-3 text-2xl font-bold">
                            <span className="text-blue-400">5</span>
                            <span className="text-gray-500">-</span>
                            <span className="text-red-400">5</span>
                          </div>
                        </div>
                      </div>

                      {/* Tie Bet Button */}
                      <button
                        onClick={() => placeBet("tie")}
                        disabled={countdown <= 0}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-400"
                      >
                        BET TIE (8:1)
                        {bets.tie > 0 && (
                          <span className="block text-sm mt-1">
                            ₹{bets.tie}
                          </span>
                        )}
                      </button>
                    </Card>
                  </div>

                  {/* Banker Section */}
                  <div className="space-y-4">
                    <Card className="bg-red-900/30 border-red-600/50 p-4">
                      <h3 className="text-center font-bold text-red-400 text-xl mb-3">
                        BANKER
                      </h3>

                      {/* Banker Cards */}
                      <div className="flex justify-center gap-2 mb-4">
                        <PlayingCard
                          suit="clubs"
                          value="A"
                          size="lg"
                          flipped={isRevealing}
                        />
                        <PlayingCard
                          suit="spades"
                          value="4"
                          size="lg"
                          flipped={isRevealing}
                        />
                      </div>

                      {/* Banker Bet Button */}
                      <button
                        onClick={() => placeBet("banker")}
                        disabled={countdown <= 0}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-400"
                      >
                        BET BANKER (0.95:1)
                        {bets.banker > 0 && (
                          <span className="block text-sm mt-1">
                            ₹{bets.banker}
                          </span>
                        )}
                      </button>

                      {/* Banker Pair Side Bet */}
                      <button
                        onClick={() => placeBet("bankerPair")}
                        disabled={countdown <= 0}
                        className="w-full mt-2 bg-red-800 hover:bg-red-900 text-white font-bold py-2 rounded transition-all hover:scale-105 disabled:opacity-50 text-sm"
                      >
                        Banker Pair (11:1)
                        {bets.bankerPair > 0 && ` ₹${bets.bankerPair}`}
                      </button>
                    </Card>
                  </div>
                </div>

                {/* Roadmap Section */}
                <Card className="bg-gray-900/50 border-yellow-600/30 p-4">
                  <h3 className="text-yellow-400 font-bold mb-3">
                    Roadmap (Bead Road)
                  </h3>
                  <div className="grid grid-cols-12 gap-1">
                    {ROADMAP_HISTORY.map((result, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "aspect-square rounded-full border-2 flex items-center justify-center text-xs font-bold",
                          result.winner === "B"
                            ? "bg-red-600 border-red-400 text-white"
                            : result.winner === "P"
                              ? "bg-blue-600 border-blue-400 text-white"
                              : "bg-green-600 border-green-400 text-white",
                          result.natural && "ring-2 ring-yellow-500",
                        )}
                      >
                        {result.winner}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                      <span>
                        Player:{" "}
                        {ROADMAP_HISTORY.filter((r) => r.winner === "P").length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-red-600"></div>
                      <span>
                        Banker:{" "}
                        {ROADMAP_HISTORY.filter((r) => r.winner === "B").length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-green-600"></div>
                      <span>
                        Tie:{" "}
                        {ROADMAP_HISTORY.filter((r) => r.winner === "T").length}
                      </span>
                    </div>
                  </div>
                </Card>
              </Card>
            </div>

            {/* Right Panel - Controls & Chips */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-yellow-600/20 p-4 mb-4">
                <h3 className="text-yellow-400 font-bold mb-3 text-center">
                  Select Chip
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      value={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                    />
                  ))}
                </div>
              </Card>

              <Card className="bg-gray-800/50 border-yellow-600/20 p-4 mb-4">
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

                <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-600/30">
                  <div className="mb-3">
                    <p className="text-gray-400 text-xs">Total Stake</p>
                    <p className="text-white font-bold text-2xl">
                      ₹{totalStake}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs">Potential Win</p>
                    <p className="text-green-500 font-bold text-2xl">
                      ₹{potentialWin.toFixed(0)}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 font-bold text-lg py-6"
                    disabled={totalStake === 0 || countdown <= 0}
                  >
                    PLACE BET
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
