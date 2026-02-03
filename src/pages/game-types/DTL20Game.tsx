import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Clock, TrendingDown, BarChart3 } from "lucide-react";

interface Game {
  gmid: string;
}

interface DTL20GameProps {
  game?: Game;
}

interface Bet {
  zone: string;
  amount: number;
  odds: string;
}

interface HistoryEntry {
  id: number;
  dragon: { card: string; value: number };
  tiger: { card: string; value: number };
  result: string;
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
    id: "bothlow",
    label: "Both Low",
    odds: "5:1",
    color: "from-cyan-600 to-cyan-800",
  },
  {
    id: "lowestcard",
    label: "Lowest Card",
    odds: "3:1",
    color: "from-teal-600 to-teal-800",
  },
];

const LOW_CARD_BONUSES = [
  { card: "A", bonus: "5x", description: "Ace wins = 5x multiplier" },
  { card: "2", bonus: "4x", description: "2 wins = 4x multiplier" },
  { card: "3", bonus: "3x", description: "3 wins = 3x multiplier" },
  { card: "4", bonus: "2.5x", description: "4 wins = 2.5x multiplier" },
  { card: "5", bonus: "2x", description: "5 wins = 2x multiplier" },
];

const CHIP_VALUES = [100, 500, 1000, 5000, 10000];

const CARD_SUITS = ["♥", "♦", "♠", "♣"];

export default function DTL20Game({ game }: DTL20GameProps) {
  const gmid = game?.gmid || "dtl20";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(1000);
  const [timeRemaining, setTimeRemaining] = useState(18);
  const [dragonCard, setDragonCard] = useState<{
    card: string;
    suit: string;
  } | null>(null);
  const [tigerCard, setTigerCard] = useState<{
    card: string;
    suit: string;
  } | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 10,
      dragon: { card: "A♥", value: 1 },
      tiger: { card: "3♠", value: 3 },
      result: "tiger",
    },
    {
      id: 9,
      dragon: { card: "5♦", value: 5 },
      tiger: { card: "2♣", value: 2 },
      result: "dragon",
    },
    {
      id: 8,
      dragon: { card: "4♥", value: 4 },
      tiger: { card: "4♦", value: 4 },
      result: "tie",
    },
    {
      id: 7,
      dragon: { card: "A♠", value: 1 },
      tiger: { card: "K♣", value: 13 },
      result: "tiger",
    },
    {
      id: 6,
      dragon: { card: "2♥", value: 2 },
      tiger: { card: "A♦", value: 1 },
      result: "dragon",
    },
    {
      id: 5,
      dragon: { card: "3♠", value: 3 },
      tiger: { card: "5♥", value: 5 },
      result: "tiger",
    },
    {
      id: 4,
      dragon: { card: "A♣", value: 1 },
      tiger: { card: "2♠", value: 2 },
      result: "tiger",
    },
    {
      id: 3,
      dragon: { card: "5♦", value: 5 },
      tiger: { card: "4♣", value: 4 },
      result: "dragon",
    },
    {
      id: 2,
      dragon: { card: "2♥", value: 2 },
      tiger: { card: "3♦", value: 3 },
      result: "tiger",
    },
    {
      id: 1,
      dragon: { card: "A♥", value: 1 },
      tiger: { card: "A♠", value: 1 },
      result: "tie",
    },
  ]);

  const { gameData, resultData } = useCasinoWebSocket(gmid);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 18));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBet = (zoneId: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Wait for next draw",
        variant: "destructive",
      });
      return;
    }

    const zone = BETTING_ZONES.find((z) => z.id === zoneId);
    if (!zone) return;

    const newBet: Bet = { zone: zoneId, amount: selectedChip, odds: zone.odds };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet(
      gmid,
      gameData?.mid || "",
      "",
      zoneId,
      selectedChip.toString(),
      selectedChip,
      "0",
      "0",
      "0",
    );

    toast({
      title: "Bet Placed!",
      description: `₹${selectedChip} on ${zone.label} (${zone.odds})`,
    });
  };

  const getTotalBetForZone = (zoneId: string) => {
    return bets
      .filter((b) => b.zone === zoneId)
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const calculateLowCardFrequency = () => {
    let lowCount = 0;
    let totalCards = 0;
    history.forEach((entry) => {
      if (entry.dragon.value <= 5) lowCount++;
      if (entry.tiger.value <= 5) lowCount++;
      totalCards += 2;
    });
    return totalCards > 0 ? ((lowCount / totalCards) * 100).toFixed(1) : "0.0";
  };

  const getCardColor = (suit: string) => {
    return suit === "♥" || suit === "♦" ? "text-red-500" : "text-gray-900";
  };

  const simulateReveal = () => {
    setIsRevealing(true);
    const cards = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];
    const randomDragonCard = cards[Math.floor(Math.random() * cards.length)];
    const randomDragonSuit =
      CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
    const randomTigerCard = cards[Math.floor(Math.random() * cards.length)];
    const randomTigerSuit =
      CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];

    setTimeout(() => {
      setDragonCard({ card: randomDragonCard, suit: randomDragonSuit });
      setTigerCard({ card: randomTigerCard, suit: randomTigerSuit });
      setIsRevealing(false);
      setTimeRemaining(18);
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-blue-950 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with Timer */}
          <div className="bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-4 mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingDown className="w-8 h-8 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Dragon Tiger Low - DTL20
                  </h1>
                  <p className="text-cyan-300 text-sm">
                    Low card bonuses & special payouts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-cyan-300 text-sm">Draw ID</div>
                  <div className="text-white font-mono text-lg font-bold">
                    {gameData?.mid || "#DTL-8472"}
                  </div>
                </div>

                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                  }`}
                >
                  <Clock className="absolute w-6 h-6 text-white/50" />
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Low Card Bonus Panel - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-xl mb-4 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6" />
                  Low Card Bonuses
                </h3>
                <div className="space-y-3">
                  {LOW_CARD_BONUSES.map((bonus) => (
                    <div
                      key={bonus.card}
                      className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-2 border-cyan-400/40 rounded-xl p-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-bold text-3xl">
                          {bonus.card}
                        </div>
                        <div className="bg-yellow-500/30 text-yellow-300 font-bold text-xl px-3 py-1 rounded-lg border border-yellow-400">
                          {bonus.bonus}
                        </div>
                      </div>
                      <div className="text-cyan-200 text-xs">
                        {bonus.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Card Frequency Tracker */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Low Card Frequency
                </h3>
                <div className="text-center">
                  <div className="text-6xl font-bold text-cyan-400 mb-2">
                    {calculateLowCardFrequency()}%
                  </div>
                  <div className="text-cyan-300 text-sm">
                    Low cards (A-5) in last 10 draws
                  </div>
                  <div className="mt-4 bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30">
                    <div className="text-xs text-cyan-200 mb-2">
                      Distribution
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${calculateLowCardFrequency()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              {/* Card Reveal Areas */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Dragon */}
                <div className="bg-gradient-to-br from-red-900/40 to-red-700/40 backdrop-blur-md border-4 border-red-500/50 rounded-3xl p-8 shadow-2xl">
                  <div className="text-center">
                    <div className="text-red-300 font-bold text-2xl mb-4 flex items-center justify-center gap-2">
                      🐉 DRAGON
                    </div>
                    {!dragonCard ? (
                      <div className="w-full h-64 bg-gradient-to-br from-red-800 to-red-600 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-red-400">
                        <div className="text-white text-6xl animate-pulse">
                          🐉
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-full h-64 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4 ${
                          dragonCard.card &&
                          ["A", "2", "3", "4", "5"].includes(dragonCard.card)
                            ? "border-yellow-400 animate-pulse"
                            : "border-red-400"
                        }`}
                      >
                        <div
                          className={`text-8xl font-bold ${getCardColor(dragonCard.suit)}`}
                        >
                          {dragonCard.card}
                        </div>
                        <div
                          className={`text-6xl ${getCardColor(dragonCard.suit)}`}
                        >
                          {dragonCard.suit}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tiger */}
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/40 backdrop-blur-md border-4 border-blue-500/50 rounded-3xl p-8 shadow-2xl">
                  <div className="text-center">
                    <div className="text-blue-300 font-bold text-2xl mb-4 flex items-center justify-center gap-2">
                      🐯 TIGER
                    </div>
                    {!tigerCard ? (
                      <div className="w-full h-64 bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-blue-400">
                        <div className="text-white text-6xl animate-pulse">
                          🐯
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-full h-64 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4 ${
                          tigerCard.card &&
                          ["A", "2", "3", "4", "5"].includes(tigerCard.card)
                            ? "border-yellow-400 animate-pulse"
                            : "border-blue-400"
                        }`}
                      >
                        <div
                          className={`text-8xl font-bold ${getCardColor(tigerCard.suit)}`}
                        >
                          {tigerCard.card}
                        </div>
                        <div
                          className={`text-6xl ${getCardColor(tigerCard.suit)}`}
                        >
                          {tigerCard.suit}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Betting Zones */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                {BETTING_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => handleBet(zone.id)}
                    disabled={timeRemaining <= 2}
                    className={`relative bg-gradient-to-br ${zone.color} hover:opacity-90 rounded-2xl p-6 shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-center">
                      <div className="text-white font-bold text-lg mb-1">
                        {zone.label}
                      </div>
                      <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm font-bold">
                        {zone.odds}
                      </div>
                      {getTotalBetForZone(zone.id) > 0 && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full px-3 py-1 text-sm font-bold shadow-lg animate-pulse">
                          ₹{getTotalBetForZone(zone.id)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Reveal Button */}
              <Button
                onClick={simulateReveal}
                disabled={isRevealing}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-6 text-xl font-bold rounded-2xl shadow-2xl disabled:opacity-50"
              >
                {isRevealing ? "🎴 Revealing..." : "🎴 Reveal Cards"}
              </Button>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4">
                  Bet Slip
                </h3>
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-cyan-300">
                    <div className="text-4xl mb-2">🎲</div>
                    <div className="text-sm">No bets placed</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {BETTING_ZONES.map((zone) => {
                      const zoneBets = bets.filter((b) => b.zone === zone.id);
                      if (zoneBets.length === 0) return null;

                      return (
                        <div
                          key={zone.id}
                          className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-semibold text-sm">
                              {zone.label}
                            </span>
                            <span className="text-cyan-300 text-xs">
                              {zone.odds}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-400 text-xs">
                              {zoneBets.length} bet
                              {zoneBets.length > 1 ? "s" : ""}
                            </span>
                            <span className="text-yellow-400 font-bold">
                              ₹{getTotalBetForZone(zone.id)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t border-cyan-500/30 pt-3 mt-3 space-y-2">
                      <div className="flex items-center justify-between text-white font-bold">
                        <span>Total Stake</span>
                        <span className="text-yellow-400">
                          ₹{bets.reduce((sum, b) => sum + b.amount, 0)}
                        </span>
                      </div>
                      <div className="bg-cyan-600/20 rounded-lg p-2 text-center">
                        <div className="text-cyan-300 text-xs">
                          Potential Return
                        </div>
                        <div className="text-white font-bold text-lg">
                          Depends on outcome
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setBets([])}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4">
                  Select Chip
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-3 font-bold text-lg shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-yellow-300 scale-105"
                          : "bg-gradient-to-br from-cyan-800 to-blue-900 text-cyan-100 border-cyan-600/50"
                      }`}
                    >
                      ₹{value.toLocaleString()}
                      {selectedChip === value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* History Strip */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4">
                  Last 10 Draws
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-cyan-900/30 rounded-lg p-2 border border-cyan-500/30 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400">#{entry.id}</span>
                        <span
                          className={`font-bold ${
                            entry.result === "dragon"
                              ? "text-red-400"
                              : entry.result === "tiger"
                                ? "text-blue-400"
                                : "text-purple-400"
                          }`}
                        >
                          {entry.result.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-white">
                        <span>
                          🐉 {entry.dragon.card}{" "}
                          {entry.dragon.value <= 5 && (
                            <span className="text-yellow-400">⭐</span>
                          )}
                        </span>
                        <span>vs</span>
                        <span>
                          {entry.tiger.value <= 5 && (
                            <span className="text-yellow-400">⭐</span>
                          )}{" "}
                          {entry.tiger.card} 🐯
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
