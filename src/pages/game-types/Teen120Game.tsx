import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Zap, Settings, TrendingUp, BarChart3, Gauge } from "lucide-react";

interface Game {
  gmid: string;
  gname?: string;
}

interface Teen120GameProps {
  game?: Game;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  status: "active" | "folded" | "all-in";
  currentBet: number;
  angle: number;
}

interface Bet {
  type: string;
  amount: number;
}

interface GameConfig {
  bootAmount: number;
  chaalMultiplier: string;
  potCap: string;
  blindEscalation: boolean;
}

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Alex",
    avatar: "⚡",
    chips: 450000,
    status: "active",
    currentBet: 0,
    angle: 0,
  },
  {
    id: 2,
    name: "Blake",
    avatar: "🎯",
    chips: 380000,
    status: "active",
    currentBet: 0,
    angle: 60,
  },
  {
    id: 3,
    name: "You",
    avatar: "💥",
    chips: 520000,
    status: "active",
    currentBet: 0,
    angle: 120,
  },
  {
    id: 4,
    name: "Dana",
    avatar: "⚔️",
    chips: 290000,
    status: "active",
    currentBet: 0,
    angle: 180,
  },
  {
    id: 5,
    name: "Echo",
    avatar: "🔥",
    chips: 410000,
    status: "active",
    currentBet: 0,
    angle: 240,
  },
  {
    id: 6,
    name: "Felix",
    avatar: "💎",
    chips: 550000,
    status: "active",
    currentBet: 0,
    angle: 300,
  },
];

const CHIP_VALUES = [10000, 50000, 100000, 500000, 1000000];

const BOOT_OPTIONS = [50000, 100000, 250000, 500000, 1000000, 0]; // 0 = Unlimited
const CHAAL_MULTIPLIERS = ["3x", "5x", "10x", "Unlimited"];
const POT_CAPS = ["500K", "1M", "5M", "Uncapped"];

export default function Teen120Game({ game }: Teen120GameProps) {
  const gameId = game?.gmid || "teen120";
  const gameName = game?.gname || "Teen 120";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100000);
  const [timeRemaining, setTimeRemaining] = useState(7);
  const [mainPot, setMainPot] = useState(1250000);
  const [showConfig, setShowConfig] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    bootAmount: 100000,
    chaalMultiplier: "5x",
    potCap: "Uncapped",
    blindEscalation: false,
  });
  const [currentBlindLevel, setCurrentBlindLevel] = useState(1);
  const [potHistory, setPotHistory] = useState([
    850000, 920000, 1050000, 1180000, 1250000,
  ]);

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-fold on timeout in ultra-fast mode
          toast({
            title: "Time Out!",
            description: "Auto-folded due to inaction",
            variant: "destructive",
          });
          return 7;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [toast]);

  const handleBet = (type: string) => {
    const newBet: Bet = { type, amount: selectedChip };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet({
      gameId: gameId,
      gameName: gameName,
      roundId: gameData?.mid || "",
      marketId: type,
      marketName: type,
      selection: type,
      odds: 2.0,
      stake: selectedChip,
      betType: "BACK",
    });

    toast({
      title: "⚡ Quick Bet",
      description: `${type.toUpperCase()}: ₹${(selectedChip / 1000).toFixed(0)}K`,
    });
  };

  const calculateVariance = () => {
    if (potHistory.length < 2) return 0;
    const avg = potHistory.reduce((a, b) => a + b, 0) / potHistory.length;
    const variance =
      potHistory.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      potHistory.length;
    return Math.sqrt(variance);
  };

  const getVarianceTrend = () => {
    const variance = calculateVariance();
    if (variance > 200000)
      return { label: "High Volatility", color: "text-red-400", icon: "📈" };
    if (variance > 100000)
      return { label: "Medium Swing", color: "text-yellow-400", icon: "📊" };
    return { label: "Stable", color: "text-green-400", icon: "📉" };
  };

  const varianceTrend = getVarianceTrend();

  return (
    <MainLayout>
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          {/* Minimalist Header */}
          <div className="bg-gray-950 border border-white/10 rounded-xl p-4 mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-white font-bold text-2xl tracking-tight">
                  TEEN120
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-gray-500 text-sm font-mono">
                  ULTRA-FAST • UNLIMITED
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-bold ${
                    timeRemaining <= 2
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-white text-black"
                  }`}
                >
                  {timeRemaining}
                </div>

                <Button
                  onClick={() => setShowConfig(!showConfig)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Config Panel */}
          {showConfig && (
            <div className="bg-gray-950 border border-white/10 rounded-xl p-6 mb-4 shadow-2xl">
              <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Unlimited Config Panel
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Boot Amount */}
                <div>
                  <div className="text-gray-400 text-sm mb-2 uppercase tracking-wide">
                    Boot Amount
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BOOT_OPTIONS.map((boot) => (
                      <button
                        key={boot}
                        onClick={() =>
                          setGameConfig({ ...gameConfig, bootAmount: boot })
                        }
                        className={`p-3 rounded text-sm font-bold border transition-all ${
                          gameConfig.bootAmount === boot
                            ? "bg-white text-black border-white"
                            : "bg-gray-900 text-gray-400 border-gray-700 hover:border-white/30"
                        }`}
                      >
                        {boot === 0 ? "∞" : `₹${(boot / 1000).toFixed(0)}K`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chaal Multiplier */}
                <div>
                  <div className="text-gray-400 text-sm mb-2 uppercase tracking-wide">
                    Chaal Multiplier
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CHAAL_MULTIPLIERS.map((mult) => (
                      <button
                        key={mult}
                        onClick={() =>
                          setGameConfig({
                            ...gameConfig,
                            chaalMultiplier: mult,
                          })
                        }
                        className={`p-3 rounded text-sm font-bold border transition-all ${
                          gameConfig.chaalMultiplier === mult
                            ? "bg-white text-black border-white"
                            : "bg-gray-900 text-gray-400 border-gray-700 hover:border-white/30"
                        }`}
                      >
                        {mult}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pot Cap */}
                <div>
                  <div className="text-gray-400 text-sm mb-2 uppercase tracking-wide">
                    Pot Cap
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {POT_CAPS.map((cap) => (
                      <button
                        key={cap}
                        onClick={() =>
                          setGameConfig({ ...gameConfig, potCap: cap })
                        }
                        className={`p-3 rounded text-sm font-bold border transition-all ${
                          gameConfig.potCap === cap
                            ? "bg-white text-black border-white"
                            : "bg-gray-900 text-gray-400 border-gray-700 hover:border-white/30"
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blind Escalation */}
                <div>
                  <div className="text-gray-400 text-sm mb-2 uppercase tracking-wide">
                    Blind Escalation
                  </div>
                  <button
                    onClick={() =>
                      setGameConfig({
                        ...gameConfig,
                        blindEscalation: !gameConfig.blindEscalation,
                      })
                    }
                    className={`w-full p-3 rounded text-sm font-bold border transition-all ${
                      gameConfig.blindEscalation
                        ? "bg-white text-black border-white"
                        : "bg-gray-900 text-gray-400 border-gray-700 hover:border-white/30"
                    }`}
                  >
                    {gameConfig.blindEscalation ? "Enabled" : "Disabled"}
                  </button>
                  {gameConfig.blindEscalation && (
                    <div className="mt-2 text-white text-xs bg-gray-900 rounded p-2 border border-white/10">
                      Current Level:{" "}
                      <span className="font-bold">{currentBlindLevel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Table Variance Calculator - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-950 border border-white/10 rounded-xl p-5 shadow-2xl">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Variance
                </h3>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Pot Trend</span>
                    <span
                      className={`text-sm font-bold ${varianceTrend.color}`}
                    >
                      {varianceTrend.icon} {varianceTrend.label}
                    </span>
                  </div>
                  <div className="h-24 flex items-end justify-between gap-1">
                    {potHistory.map((pot, idx) => {
                      const maxPot = Math.max(...potHistory);
                      const height = (pot / maxPot) * 100;
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-gray-900 rounded-lg p-3 border border-white/10">
                    <div className="text-gray-400 text-xs mb-1">Avg Pot</div>
                    <div className="text-white font-bold text-lg">
                      ₹
                      {(
                        potHistory.reduce((a, b) => a + b, 0) /
                        potHistory.length /
                        1000
                      ).toFixed(0)}
                      K
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 border border-white/10">
                    <div className="text-gray-400 text-xs mb-1">Peak Pot</div>
                    <div className="text-white font-bold text-lg">
                      ₹{(Math.max(...potHistory) / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 border border-white/10">
                    <div className="text-gray-400 text-xs mb-1">Volatility</div>
                    <div className="text-white font-bold text-lg">
                      {(calculateVariance() / 1000).toFixed(0)}K σ
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Config Display */}
              <div className="bg-gray-950 border border-white/10 rounded-xl p-5 shadow-2xl">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Active Rules
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-gray-900 rounded p-2 border border-white/10">
                    <span className="text-gray-400">Boot:</span>
                    <span className="text-white font-bold">
                      {gameConfig.bootAmount === 0
                        ? "Unlimited"
                        : `₹${(gameConfig.bootAmount / 1000).toFixed(0)}K`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 rounded p-2 border border-white/10">
                    <span className="text-gray-400">Chaal:</span>
                    <span className="text-white font-bold">
                      {gameConfig.chaalMultiplier}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 rounded p-2 border border-white/10">
                    <span className="text-gray-400">Pot Cap:</span>
                    <span className="text-white font-bold">
                      {gameConfig.potCap}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 rounded p-2 border border-white/10">
                    <span className="text-gray-400">Blinds:</span>
                    <span className="text-white font-bold">
                      {gameConfig.blindEscalation
                        ? `L${currentBlindLevel}`
                        : "Fixed"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              {/* Minimalist Game Table */}
              <div className="relative bg-gray-950 border-2 border-white/20 rounded-2xl p-8 shadow-2xl min-h-[550px]">
                {/* Players - Minimalist Layout */}
                {PLAYERS.map((player) => {
                  const radius = 200;
                  const angleRad = (player.angle - 90) * (Math.PI / 180);
                  const x = radius * Math.cos(angleRad);
                  const y = radius * Math.sin(angleRad);

                  return (
                    <div
                      key={player.id}
                      className="absolute min-w-[120px]"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className={`rounded-lg p-3 border transition-all ${
                          player.status === "active"
                            ? "bg-gray-900 border-white/30"
                            : player.status === "folded"
                              ? "bg-gray-900/40 border-gray-700/30 opacity-40"
                              : "bg-gray-900 border-red-600"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-1">{player.avatar}</div>
                          <div className="text-white font-bold text-xs mb-1">
                            {player.name}
                          </div>
                          <div className="text-white font-mono text-sm">
                            {(player.chips / 1000).toFixed(0)}K
                          </div>
                          {player.currentBet > 0 && (
                            <div className="bg-white/10 border border-white/30 rounded px-2 py-1 text-white text-xs font-mono mt-1">
                              {(player.currentBet / 1000).toFixed(0)}K
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Center Pot - Ultra Minimal */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-white rounded-xl p-6 shadow-2xl border-4 border-black">
                    <div className="text-center">
                      <div className="text-black font-bold text-5xl font-mono">
                        {(mainPot / 1000).toFixed(0)}K
                      </div>
                      <div className="text-gray-600 text-xs font-semibold uppercase mt-1 tracking-wider">
                        POT
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ultra-Fast Controls - Large Tap Targets */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <Button
                  onClick={() => handleBet("fold")}
                  className="bg-red-600 hover:bg-red-700 text-white py-10 text-2xl font-bold rounded-lg border-2 border-white/20 transform active:scale-95 transition-all"
                >
                  FOLD
                </Button>
                <Button
                  onClick={() => handleBet("call")}
                  className="bg-white hover:bg-gray-200 text-black py-10 text-2xl font-bold rounded-lg border-2 border-black transform active:scale-95 transition-all"
                >
                  CALL
                </Button>
                <Button
                  onClick={() => handleBet("raise")}
                  className="bg-white hover:bg-gray-200 text-black py-10 text-2xl font-bold rounded-lg border-2 border-black transform active:scale-95 transition-all"
                >
                  RAISE
                </Button>
                <Button
                  onClick={() => handleBet("allin")}
                  className="bg-black hover:bg-gray-900 text-white py-10 text-2xl font-bold rounded-lg border-2 border-white transform active:scale-95 transition-all"
                >
                  ALL-IN
                </Button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Chip Selector - Minimal */}
              <div className="bg-gray-950 border border-white/10 rounded-xl p-5 shadow-2xl">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Bet
                </h3>
                <div className="space-y-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`w-full p-4 rounded-lg font-bold text-lg border-2 transition-all transform active:scale-95 ${
                        selectedChip === value
                          ? "bg-white text-black border-white scale-105"
                          : "bg-gray-900 text-white border-gray-700 hover:border-white/30"
                      }`}
                    >
                      {value >= 1000000
                        ? `${(value / 1000000).toFixed(0)}M`
                        : `${(value / 1000).toFixed(0)}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hand History - Terse */}
              <div className="bg-gray-950 border border-white/10 rounded-xl p-5 shadow-2xl">
                <h3 className="text-white font-bold text-lg mb-4">Recent</h3>
                <div className="space-y-2">
                  {[
                    { id: 127, w: "Felix", pot: 1250 },
                    { id: 126, w: "You", pot: 1180 },
                    { id: 125, w: "Echo", pot: 1050 },
                    { id: 124, w: "Blake", pot: 920 },
                    { id: 123, w: "Alex", pot: 850 },
                  ].map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gray-900 rounded-lg p-2 flex items-center justify-between border border-white/10"
                    >
                      <div className="text-white text-sm font-mono">
                        #{entry.id}
                      </div>
                      <div className="text-gray-400 text-xs">{entry.w}</div>
                      <div className="text-white font-bold text-sm">
                        {entry.pot}K
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speed Indicator */}
              <div className="bg-gradient-to-br from-red-600 to-orange-600 border-2 border-white rounded-xl p-4 shadow-2xl text-center">
                <Zap className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-white font-bold text-xl">ULTRA-FAST</div>
                <div className="text-white/80 text-xs mt-1">5-8s Decisions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
