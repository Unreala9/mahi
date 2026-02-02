import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingDown,
  Calculator,
  BarChart3,
  Brain,
  Clock,
} from "lucide-react";

interface Game {
  gmid: string;
}

interface DTL20ProGameProps {
  game: Game;
}

interface Bet {
  zone: string;
  amount: number;
  odds: string;
  implied: number;
}

interface CardFrequency {
  rank: string;
  count: number;
  percentage: number;
  isHot: boolean;
}

interface HistoryEntry {
  id: number;
  dragon: { card: string; value: number };
  tiger: { card: string; value: number };
  result: string;
  lowCard: boolean;
}

const BETTING_ZONES = [
  {
    id: "dragon",
    label: "Dragon",
    odds: "1:1",
    color: "from-red-600 to-red-800",
  },
  {
    id: "tiger",
    label: "Tiger",
    odds: "1:1",
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "tie",
    label: "Tie",
    odds: "11:1",
    color: "from-purple-600 to-purple-800",
  },
  {
    id: "suited",
    label: "Suited",
    odds: "3:1",
    color: "from-pink-600 to-pink-800",
  },
  {
    id: "lowbonus",
    label: "Low Bonus",
    odds: "5:1",
    color: "from-cyan-600 to-cyan-800",
  },
];

const CARD_FREQUENCIES: CardFrequency[] = [
  { rank: "A", count: 28, percentage: 87.5, isHot: true },
  { rank: "2", count: 24, percentage: 75.0, isHot: true },
  { rank: "3", count: 20, percentage: 62.5, isHot: true },
  { rank: "4", count: 18, percentage: 56.3, isHot: false },
  { rank: "5", count: 16, percentage: 50.0, isHot: false },
  { rank: "6", count: 14, percentage: 43.8, isHot: false },
  { rank: "7", count: 12, percentage: 37.5, isHot: false },
  { rank: "8", count: 10, percentage: 31.3, isHot: false },
  { rank: "9", count: 8, percentage: 25.0, isHot: false },
  { rank: "10", count: 6, percentage: 18.8, isHot: false },
];

const WIN_RATES = {
  dragon: 48.2,
  tiger: 47.8,
  tie: 4.0,
};

const HISTORY: HistoryEntry[] = [
  {
    id: 1,
    dragon: { card: "3♥", value: 3 },
    tiger: { card: "K♠", value: 13 },
    result: "Tiger",
    lowCard: true,
  },
  {
    id: 2,
    dragon: { card: "A♦", value: 1 },
    tiger: { card: "5♣", value: 5 },
    result: "Tiger",
    lowCard: true,
  },
  {
    id: 3,
    dragon: { card: "Q♠", value: 12 },
    tiger: { card: "2♥", value: 2 },
    result: "Dragon",
    lowCard: true,
  },
  {
    id: 4,
    dragon: { card: "7♦", value: 7 },
    tiger: { card: "7♣", value: 7 },
    result: "Tie",
    lowCard: false,
  },
  {
    id: 5,
    dragon: { card: "4♠", value: 4 },
    tiger: { card: "6♥", value: 6 },
    result: "Tiger",
    lowCard: true,
  },
];

const CHIP_VALUES = [100, 500, 1000, 5000, 10000];

export default function DTL20ProGame({ game }: DTL20ProGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [dragonCard, setDragonCard] = useState<string | null>(null);
  const [tigerCard, setTigerCard] = useState<string | null>(null);
  const [shoePenetration, setShoePenetration] = useState(42);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [aiConfidence, setAiConfidence] = useState<
    "dragon" | "tiger" | "balanced"
  >("balanced");

  const { gameData, resultData } = useCasinoWebSocket(game.gmid);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 20));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const shoeTimer = setInterval(() => {
      setShoePenetration((prev) => (prev < 100 ? prev + 1 : 0));
    }, 5000);
    return () => clearInterval(shoeTimer);
  }, []);

  const handleBet = (zone: string, odds: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Cards are being dealt",
        variant: "destructive",
      });
      return;
    }

    const implied =
      parseFloat(odds.split(":")[0]) > 1
        ? (1 / (parseFloat(odds.split(":")[0]) + 1)) * 100
        : 50;
    const newBet: Bet = {
      zone,
      amount: selectedChip,
      odds,
      implied,
    };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet(
      game.gmid,
      gameData?.mid || "",
      "",
      zone,
      selectedChip.toString(),
      selectedChip,
      "0",
      "0",
      "0",
    );

    toast({
      title: "Bet Placed!",
      description: `₹${selectedChip} on ${zone} (${odds})`,
    });
  };

  const getTotalStake = () => {
    return bets.reduce((sum, b) => sum + b.amount, 0);
  };

  const getTotalExposure = () => {
    return bets.reduce((sum, b) => {
      const multiplier = parseFloat(b.odds.split(":")[0]);
      return sum + b.amount * multiplier;
    }, 0);
  };

  const getCardColor = (card: string) => {
    if (!card) return "text-gray-900";
    const suit = card.slice(-1);
    return suit === "♥" || suit === "♦" ? "text-red-600" : "text-gray-900";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 p-4">
        <div className="max-w-[1900px] mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900/60 via-cyan-900/60 to-blue-900/60 backdrop-blur-md border-4 border-cyan-500/60 rounded-3xl p-6 mb-4 shadow-2xl shadow-cyan-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Brain className="w-12 h-12 text-cyan-400 animate-pulse" />
                <div>
                  <div className="text-cyan-300 text-sm uppercase tracking-wide">
                    Advanced Analytics
                  </div>
                  <div className="text-white font-bold text-3xl">DTL20 Pro</div>
                  <div className="text-green-400 text-sm mt-1">
                    🔥 AI Prediction:{" "}
                    <span className="font-bold uppercase">{aiConfidence}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-cyan-300 text-sm">Round #</div>
                  <div className="text-white font-mono text-2xl font-bold">
                    {gameData?.mid || "PRO8472"}
                  </div>
                </div>

                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-gradient-to-br from-cyan-600 to-blue-600 text-white border-cyan-400"
                  }`}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Analytics Dashboard - Left */}
            <div className="lg:col-span-1 space-y-4">
              {/* Card Frequency Heatmap */}
              <div className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Card Frequency
                </h3>
                <div className="space-y-2">
                  {CARD_FREQUENCIES.map((card) => (
                    <div
                      key={card.rank}
                      className="bg-black/40 rounded-lg p-2 border border-cyan-500/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-lg">
                          {card.rank}
                        </span>
                        <span
                          className={`text-xs font-bold ${card.isHot ? "text-orange-400" : "text-cyan-400"}`}
                        >
                          {card.isHot ? "🔥 HOT" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              card.isHot
                                ? "bg-gradient-to-r from-orange-500 to-red-500"
                                : "bg-gradient-to-r from-cyan-500 to-blue-500"
                            }`}
                            style={{ width: `${card.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-xs font-bold w-12">
                          {card.count}/32
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {card.percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Win Rate by Bet Type */}
              <div className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Win Rates
                </h3>
                <div className="space-y-3">
                  <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-400 font-semibold">Dragon</span>
                      <span className="text-white font-bold text-xl">
                        {WIN_RATES.dragon}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-700 h-full rounded-full"
                        style={{ width: `${WIN_RATES.dragon}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-3 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-semibold">Tiger</span>
                      <span className="text-white font-bold text-xl">
                        {WIN_RATES.tiger}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-700 h-full rounded-full"
                        style={{ width: `${WIN_RATES.tiger}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-3 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-400 font-semibold">Tie</span>
                      <span className="text-white font-bold text-xl">
                        {WIN_RATES.tie}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-700 h-full rounded-full"
                        style={{ width: `${WIN_RATES.tie}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shoe Penetration */}
              <div className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Shoe Status
                </h3>
                <div className="bg-black/40 rounded-lg p-4 border border-cyan-500/30">
                  <div className="text-center mb-3">
                    <div className="text-white font-bold text-5xl">
                      {shoePenetration}%
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Cards Dealt
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        shoePenetration > 75
                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                          : shoePenetration > 50
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-green-500 to-cyan-500"
                      }`}
                      style={{ width: `${shoePenetration}%` }}
                    ></div>
                  </div>
                  <div className="text-gray-400 text-xs mt-2 text-center">
                    {shoePenetration > 75 ? "⚠️ New shoe soon" : "✓ Fresh deck"}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Board - Center */}
            <div className="lg:col-span-3 space-y-4">
              {/* Prediction Engine */}
              <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-xl mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-pink-400" />
                  AI Prediction Engine
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`rounded-xl p-4 text-center ${
                      aiConfidence === "dragon"
                        ? "bg-red-600 border-4 border-yellow-400 shadow-2xl shadow-red-500/50"
                        : "bg-black/40 border border-red-500/30"
                    }`}
                  >
                    <div className="text-white font-bold text-2xl mb-2">
                      Dragon
                    </div>
                    <div className="text-yellow-400 font-bold text-4xl mb-2">
                      {aiConfidence === "dragon" ? "HIGH" : "Medium"}
                    </div>
                    <div className="text-white text-xs">
                      {aiConfidence === "dragon"
                        ? "🔥 Confidence: 72%"
                        : "Confidence: 48%"}
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-4 text-center ${
                      aiConfidence === "balanced"
                        ? "bg-purple-600 border-4 border-yellow-400 shadow-2xl shadow-purple-500/50"
                        : "bg-black/40 border border-purple-500/30"
                    }`}
                  >
                    <div className="text-white font-bold text-2xl mb-2">
                      Balanced
                    </div>
                    <div className="text-yellow-400 font-bold text-4xl mb-2">
                      {aiConfidence === "balanced" ? "ACTIVE" : "—"}
                    </div>
                    <div className="text-white text-xs">
                      {aiConfidence === "balanced" ? "📊 No edge" : "—"}
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-4 text-center ${
                      aiConfidence === "tiger"
                        ? "bg-blue-600 border-4 border-yellow-400 shadow-2xl shadow-blue-500/50"
                        : "bg-black/40 border border-blue-500/30"
                    }`}
                  >
                    <div className="text-white font-bold text-2xl mb-2">
                      Tiger
                    </div>
                    <div className="text-yellow-400 font-bold text-4xl mb-2">
                      {aiConfidence === "tiger" ? "HIGH" : "Medium"}
                    </div>
                    <div className="text-white text-xs">
                      {aiConfidence === "tiger"
                        ? "🔥 Confidence: 68%"
                        : "Confidence: 47%"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Reveal Areas */}
              <div className="grid grid-cols-2 gap-4">
                {/* Dragon */}
                <div className="bg-gradient-to-br from-red-800/80 to-red-950/80 backdrop-blur-md border-4 border-red-500/50 rounded-3xl p-8 shadow-2xl min-h-[300px] flex flex-col items-center justify-center">
                  <div className="text-red-300 font-bold text-3xl mb-4">
                    🐉 DRAGON
                  </div>
                  {dragonCard ? (
                    <div className="w-40 h-56 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-red-400">
                      <div
                        className={`text-8xl font-bold ${getCardColor(dragonCard)}`}
                      >
                        {dragonCard}
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 h-56 bg-red-900 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-red-700">
                      <div className="text-white text-6xl">🎴</div>
                    </div>
                  )}
                </div>

                {/* Tiger */}
                <div className="bg-gradient-to-br from-blue-800/80 to-blue-950/80 backdrop-blur-md border-4 border-blue-500/50 rounded-3xl p-8 shadow-2xl min-h-[300px] flex flex-col items-center justify-center">
                  <div className="text-blue-300 font-bold text-3xl mb-4">
                    🐅 TIGER
                  </div>
                  {tigerCard ? (
                    <div className="w-40 h-56 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-blue-400">
                      <div
                        className={`text-8xl font-bold ${getCardColor(tigerCard)}`}
                      >
                        {tigerCard}
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 h-56 bg-blue-900 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-blue-700">
                      <div className="text-white text-6xl">🎴</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Betting Zones */}
              <div className="grid grid-cols-5 gap-3">
                {BETTING_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => handleBet(zone.id, zone.odds)}
                    className={`bg-gradient-to-br ${zone.color} hover:opacity-90 rounded-xl p-4 shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-all`}
                  >
                    <div className="text-white font-bold text-lg mb-2">
                      {zone.label}
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-2 py-1 text-white text-sm font-bold">
                      {zone.odds}
                    </div>
                  </button>
                ))}
              </div>

              {/* History with Hot/Cold Indicators */}
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-md border-2 border-gray-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-gray-300 font-bold text-xl mb-4">
                  Last 30 Results
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-black/40 rounded-lg p-3 border border-gray-500/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-3xl ${getCardColor(entry.dragon.card)}`}
                        >
                          {entry.dragon.card}
                        </span>
                        <span className="text-gray-400">vs</span>
                        <span
                          className={`text-3xl ${getCardColor(entry.tiger.card)}`}
                        >
                          {entry.tiger.card}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {entry.lowCard && (
                          <span className="text-cyan-400 text-xs">⭐ LOW</span>
                        )}
                        <div
                          className={`px-3 py-1 rounded-lg font-bold text-sm ${
                            entry.result === "Dragon"
                              ? "bg-red-600 text-white"
                              : entry.result === "Tiger"
                                ? "bg-blue-600 text-white"
                                : "bg-purple-600 text-white"
                          }`}
                        >
                          {entry.result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <div className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-xl mb-4">
                  Bet Slip
                </h3>
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-cyan-300">
                    <div className="text-5xl mb-2">🎯</div>
                    <div className="text-sm">Place your bets</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 rounded-lg p-3 border border-cyan-500/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold text-sm">
                            {bet.zone}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-cyan-300 text-xs">
                              {bet.odds}
                            </span>
                            <span className="text-gray-400 text-xs">
                              ({bet.implied.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="text-yellow-400 font-bold">
                          ₹{bet.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bets.length > 0 && (
                  <div className="space-y-3 border-t border-cyan-500/30 pt-3">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Total Stake</span>
                      <span className="font-bold text-yellow-400">
                        ₹{getTotalStake()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Total Exposure</span>
                      <span className="font-bold text-green-400">
                        ₹{getTotalExposure().toFixed(0)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setBets([])}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 text-sm rounded-lg"
                      >
                        Clear
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm rounded-lg">
                        Repeat
                      </Button>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-4 text-lg font-bold rounded-xl shadow-2xl">
                      Place Bet
                    </Button>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4">
                  Chip Value
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-4 font-bold text-lg shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-yellow-300 scale-105"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      ₹{value >= 1000 ? `${value / 1000}K` : value}
                      {selectedChip === value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Analytics */}
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl"
              >
                {showAnalytics ? "Hide" : "Show"} Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
