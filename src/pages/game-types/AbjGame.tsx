import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Crown, Zap, TrendingUp, Sparkles, Clock } from "lucide-react";

interface Game {
  gmid: string;
}

interface AbjGameProps {
  game: Game;
}

interface Bet {
  side: "andar" | "bahar";
  amount: number;
  baseOdds: string;
}

interface JokerEffect {
  suit: string;
  effect: string;
  multiplier: number;
  description: string;
  icon: string;
}

interface HistoryEntry {
  id: number;
  joker: string;
  winningSide: "andar" | "bahar";
  matchCard: string;
  totalCards: number;
  multiplier: number;
}

const JOKER_EFFECTS: JokerEffect[] = [
  {
    suit: "♠️ Spades",
    effect: "Andar Boost",
    multiplier: 2.5,
    description: "2.5x multiplier on all Andar bets",
    icon: "🖤",
  },
  {
    suit: "♥️ Hearts",
    effect: "Bahar Boost",
    multiplier: 2.5,
    description: "2.5x multiplier on all Bahar bets",
    icon: "❤️",
  },
  {
    suit: "♣️ Clubs",
    effect: "Double Win",
    multiplier: 2,
    description: "2x multiplier on both sides",
    icon: "💚",
  },
  {
    suit: "♦️ Diamonds",
    effect: "Triple Chance",
    multiplier: 3,
    description: "3x multiplier + bonus card",
    icon: "💎",
  },
];

const CHIP_VALUES = [100, 500, 1000, 5000, 10000];

const JOKER_HISTORY: HistoryEntry[] = [
  {
    id: 1,
    joker: "7♠",
    winningSide: "andar",
    matchCard: "7♣",
    totalCards: 9,
    multiplier: 2.5,
  },
  {
    id: 2,
    joker: "K♥",
    winningSide: "bahar",
    matchCard: "K♦",
    totalCards: 15,
    multiplier: 2.5,
  },
  {
    id: 3,
    joker: "A♣",
    winningSide: "andar",
    matchCard: "A♠",
    totalCards: 7,
    multiplier: 2,
  },
  {
    id: 4,
    joker: "Q♦",
    winningSide: "bahar",
    matchCard: "Q♥",
    totalCards: 11,
    multiplier: 3,
  },
];

export default function AbjGame({ game }: AbjGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [jokerCard, setJokerCard] = useState<string>("7♠");
  const [currentJokerEffect, setCurrentJokerEffect] = useState<JokerEffect>(
    JOKER_EFFECTS[0],
  );
  const [andarCards, setAndarCards] = useState<string[]>(["A♠", "K♦", "Q♥"]);
  const [baharCards, setBaharCards] = useState<string[]>([
    "J♣",
    "10♠",
    "9♦",
    "8♥",
  ]);
  const [isDealing, setIsDealing] = useState(false);

  const { gameData, resultData } = useCasinoWebSocket(game.gmid);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 20));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Update Joker effect based on suit
    const suit = jokerCard.slice(-1);
    if (suit === "♠") setCurrentJokerEffect(JOKER_EFFECTS[0]);
    else if (suit === "♥") setCurrentJokerEffect(JOKER_EFFECTS[1]);
    else if (suit === "♣") setCurrentJokerEffect(JOKER_EFFECTS[2]);
    else if (suit === "♦") setCurrentJokerEffect(JOKER_EFFECTS[3]);
  }, [jokerCard]);

  const handleBet = (side: "andar" | "bahar") => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Cards are being dealt",
        variant: "destructive",
      });
      return;
    }

    const baseOdds = "0.9:1";
    const newBet: Bet = {
      side,
      amount: selectedChip,
      baseOdds,
    };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet(
      game.gmid,
      gameData?.mid || "",
      "",
      side,
      selectedChip.toString(),
      selectedChip,
      "0",
      "0",
      "0",
    );

    toast({
      title: "Bet Placed!",
      description: `₹${selectedChip} on ${side.toUpperCase()}`,
    });
  };

  const simulateDeal = () => {
    setIsDealing(true);

    setTimeout(() => {
      const winningSide = Math.random() > 0.5 ? "andar" : "bahar";
      setIsDealing(false);
      setTimeRemaining(20);

      toast({
        title: `${winningSide.toUpperCase()} WINS!`,
        description: `Multiplier: ${currentJokerEffect.multiplier}x`,
      });
    }, 3000);
  };

  const getTotalStake = () => {
    return bets.reduce((sum, b) => sum + b.amount, 0);
  };

  const calculatePotentialReturn = () => {
    if (bets.length === 0) return 0;

    const andarBets = bets
      .filter((b) => b.side === "andar")
      .reduce((s, b) => s + b.amount, 0);
    const baharBets = bets
      .filter((b) => b.side === "bahar")
      .reduce((s, b) => s + b.amount, 0);

    const andarMultiplier =
      currentJokerEffect.effect === "Andar Boost" ||
      currentJokerEffect.effect === "Double Win"
        ? currentJokerEffect.multiplier
        : 1;
    const baharMultiplier =
      currentJokerEffect.effect === "Bahar Boost" ||
      currentJokerEffect.effect === "Double Win"
        ? currentJokerEffect.multiplier
        : 1;

    const andarReturn = andarBets * 0.9 * andarMultiplier;
    const baharReturn = baharBets * 0.9 * baharMultiplier;

    return Math.max(andarReturn, baharReturn);
  };

  const getAndarBetTotal = () => {
    return bets
      .filter((b) => b.side === "andar")
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const getBaharBetTotal = () => {
    return bets
      .filter((b) => b.side === "bahar")
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const getCardColor = (card: string) => {
    const suit = card.slice(-1);
    return suit === "♥" || suit === "♦" ? "text-red-600" : "text-gray-900";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-950 to-gray-900 p-4">
        <div className="max-w-[1900px] mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/60 via-red-900/60 to-purple-900/60 backdrop-blur-md border-4 border-purple-500/60 rounded-3xl p-6 mb-4 shadow-2xl shadow-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="w-12 h-12 text-yellow-400 animate-bounce" />
                <div>
                  <div className="text-purple-300 text-sm uppercase tracking-wide">
                    Andar Bahar Joker
                  </div>
                  <div className="text-white font-bold text-3xl">
                    Special Multipliers Active
                  </div>
                  <div className="text-yellow-400 text-sm mt-1">
                    {currentJokerEffect.icon} {currentJokerEffect.effect} -{" "}
                    {currentJokerEffect.multiplier}x
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-purple-300 text-sm">Round #</div>
                  <div className="text-white font-mono text-2xl font-bold">
                    {gameData?.mid || "3847"}
                  </div>
                </div>

                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-400"
                  }`}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Joker Mechanics - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Joker Effects
                </h3>
                <div className="space-y-3">
                  {JOKER_EFFECTS.map((effect) => (
                    <div
                      key={effect.suit}
                      className={`rounded-xl p-4 border-2 transition-all ${
                        effect.suit === currentJokerEffect.suit
                          ? "bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/30"
                          : "bg-black/40 border-purple-500/30"
                      }`}
                    >
                      <div className="text-2xl mb-1">{effect.icon}</div>
                      <div className="text-white font-bold text-sm mb-1">
                        {effect.suit}
                      </div>
                      <div className="text-yellow-400 font-semibold text-xs mb-1">
                        {effect.effect}
                      </div>
                      <div className="text-purple-200 text-xs mb-2">
                        {effect.description}
                      </div>
                      <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                        {effect.multiplier}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multiplier Tracker */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Active Multiplier
                </h3>
                <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-center shadow-2xl shadow-yellow-500/40 border-2 border-yellow-400">
                  <div className="text-6xl mb-2">{currentJokerEffect.icon}</div>
                  <div className="text-white font-bold text-3xl mb-1">
                    {currentJokerEffect.multiplier}x
                  </div>
                  <div className="text-yellow-100 text-sm">
                    {currentJokerEffect.effect}
                  </div>
                </div>

                <div className="mt-4 bg-black/40 rounded-lg p-3 border border-purple-500/30">
                  <div className="text-purple-300 text-xs mb-2">
                    Payout Calculation:
                  </div>
                  <div className="text-white text-xs font-mono">
                    Base Odds: 0.9:1
                    <br />× Joker Multiplier: {currentJokerEffect.multiplier}x
                    <br />= Final Payout:{" "}
                    {(0.9 * currentJokerEffect.multiplier).toFixed(2)}:1
                  </div>
                </div>
              </div>
            </div>

            {/* Game Board - Center */}
            <div className="lg:col-span-3 space-y-4">
              {/* Joker Card Display */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-4 border-yellow-500/60 rounded-3xl p-8 shadow-2xl shadow-yellow-500/30 text-center">
                <div className="text-yellow-400 font-bold text-2xl mb-4 flex items-center justify-center gap-2">
                  <Crown className="w-8 h-8 animate-bounce" />
                  JOKER CARD
                  <Crown className="w-8 h-8 animate-bounce" />
                </div>
                <div className="flex justify-center">
                  <div className="w-40 h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-8 border-yellow-500">
                    <div
                      className={`text-9xl font-bold ${getCardColor(jokerCard)}`}
                    >
                      {jokerCard}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-purple-300 text-lg">
                  Match this card to win! Current effect:{" "}
                  <span className="text-yellow-400 font-bold">
                    {currentJokerEffect.effect}
                  </span>
                </div>
              </div>

              {/* Andar vs Bahar Betting Areas */}
              <div className="grid grid-cols-2 gap-6">
                {/* Andar (Left) */}
                <div>
                  <button
                    onClick={() => handleBet("andar")}
                    disabled={timeRemaining <= 2}
                    className="w-full bg-gradient-to-br from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 border-4 border-blue-400 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <div className="text-white font-bold text-4xl mb-3">
                      ANDAR
                    </div>
                    <div className="text-blue-200 text-sm mb-2">
                      Left Side | Base Odds: 0.9:1
                    </div>
                    {currentJokerEffect.effect === "Andar Boost" && (
                      <div className="bg-yellow-500 text-black px-3 py-2 rounded-lg font-bold text-lg mb-2 inline-block animate-pulse">
                        🔥 {currentJokerEffect.multiplier}x ACTIVE!
                      </div>
                    )}
                    {getAndarBetTotal() > 0 && (
                      <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 text-yellow-300 font-bold text-xl mt-2">
                        Total Bet: ₹{getAndarBetTotal()}
                      </div>
                    )}
                  </button>

                  {/* Andar Cards Display */}
                  <div className="mt-4 bg-black/40 rounded-2xl p-4 border-2 border-blue-500/40">
                    <div className="text-blue-300 font-semibold text-sm mb-3">
                      Andar Cards
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {andarCards.map((card, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-300"
                        >
                          <span
                            className={`text-3xl font-bold ${getCardColor(card)}`}
                          >
                            {card}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bahar (Right) */}
                <div>
                  <button
                    onClick={() => handleBet("bahar")}
                    disabled={timeRemaining <= 2}
                    className="w-full bg-gradient-to-br from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 border-4 border-red-400 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <div className="text-white font-bold text-4xl mb-3">
                      BAHAR
                    </div>
                    <div className="text-red-200 text-sm mb-2">
                      Right Side | Base Odds: 0.9:1
                    </div>
                    {currentJokerEffect.effect === "Bahar Boost" && (
                      <div className="bg-yellow-500 text-black px-3 py-2 rounded-lg font-bold text-lg mb-2 inline-block animate-pulse">
                        🔥 {currentJokerEffect.multiplier}x ACTIVE!
                      </div>
                    )}
                    {getBaharBetTotal() > 0 && (
                      <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 text-yellow-300 font-bold text-xl mt-2">
                        Total Bet: ₹{getBaharBetTotal()}
                      </div>
                    )}
                  </button>

                  {/* Bahar Cards Display */}
                  <div className="mt-4 bg-black/40 rounded-2xl p-4 border-2 border-red-500/40">
                    <div className="text-red-300 font-semibold text-sm mb-3">
                      Bahar Cards
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {baharCards.map((card, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-300"
                        >
                          <span
                            className={`text-3xl font-bold ${getCardColor(card)}`}
                          >
                            {card}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Deal Button */}
              <Button
                onClick={simulateDeal}
                disabled={isDealing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-2xl font-bold rounded-2xl shadow-2xl disabled:opacity-50"
              >
                {isDealing ? "🎴 Dealing..." : "🎴 Deal Cards"}
              </Button>
            </div>

            {/* Bet Slip & History - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-xl mb-4">
                  Bet Slip
                </h3>
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-purple-300">
                    <div className="text-5xl mb-2">🎴</div>
                    <div className="text-sm">Place your bets</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto mb-4">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-3 border-2 ${
                          bet.side === "andar"
                            ? "bg-blue-900/40 border-blue-500/50"
                            : "bg-red-900/40 border-red-500/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold text-sm uppercase">
                            {bet.side}
                          </span>
                          <span className="text-purple-300 text-xs">
                            {bet.baseOdds}
                          </span>
                        </div>
                        <div className="text-yellow-400 font-bold text-lg">
                          ₹{bet.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bets.length > 0 && (
                  <div className="space-y-3 border-t border-purple-500/30 pt-3">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Total Stake</span>
                      <span className="font-bold text-yellow-400">
                        ₹{getTotalStake()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Active Multiplier</span>
                      <span className="font-bold text-yellow-400">
                        {currentJokerEffect.multiplier}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Max Return</span>
                      <span className="font-bold text-green-400">
                        ₹{calculatePotentialReturn().toFixed(0)}
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
                        Double
                      </Button>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-4 text-lg font-bold rounded-xl shadow-2xl">
                      Place Bet
                    </Button>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4">
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

              {/* Joker History */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl max-h-[350px] overflow-y-auto">
                <h3 className="text-purple-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Joker History
                </h3>
                <div className="space-y-2">
                  {JOKER_HISTORY.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-black/40 rounded-lg p-3 border border-purple-500/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl ${getCardColor(entry.joker)}`}
                          >
                            {entry.joker}
                          </span>
                          <span className="text-white text-xs">→</span>
                          <span
                            className={`text-2xl ${getCardColor(entry.matchCard)}`}
                          >
                            {entry.matchCard}
                          </span>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            entry.winningSide === "andar"
                              ? "bg-blue-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {entry.winningSide.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {entry.totalCards} cards
                        </span>
                        <span className="text-yellow-400 font-bold">
                          {entry.multiplier}x
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
