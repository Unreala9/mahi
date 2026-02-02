import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Volume2, VolumeX, Palmtree, Waves, Sun, Shell } from "lucide-react";

interface Game {
  gmid: string;
}

interface Lucky7GGameProps {
  game: Game;
}

interface Bet {
  zone: string;
  amount: number;
}

interface HistoryEntry {
  card: string;
  result: string;
  icon: string;
  color: string;
}

const BETTING_ZONES = [
  {
    id: "below7",
    label: "Below 7",
    range: "A-6",
    icon: "🏄",
    color: "from-blue-500 to-cyan-400",
    payout: "1:1",
  },
  {
    id: "lucky7",
    label: "Lucky 7",
    range: "7",
    icon: "🌺",
    color: "from-pink-500 to-rose-400",
    payout: "11:1",
  },
  {
    id: "above7",
    label: "Above 7",
    range: "8-K",
    icon: "🥥",
    color: "from-orange-500 to-amber-400",
    payout: "1:1",
  },
];

const CHIP_VALUES = [10, 25, 50, 100, 250, 500];

const CARD_SYMBOLS = [
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
const CARD_SUITS = ["♥", "♦", "♠", "♣"];

export default function Lucky7GGame({ game }: Lucky7GGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [currentCard, setCurrentCard] = useState<{
    symbol: string;
    suit: string;
  } | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    { card: "K♠", result: "above7", icon: "🥥", color: "text-orange-400" },
    { card: "7♦", result: "lucky7", icon: "🌺", color: "text-pink-400" },
    { card: "3♥", result: "below7", icon: "🏄", color: "text-cyan-400" },
    { card: "9♣", result: "above7", icon: "🥥", color: "text-orange-400" },
    { card: "5♦", result: "below7", icon: "🏄", color: "text-cyan-400" },
  ]);
  const [timeRemaining, setTimeRemaining] = useState(20);

  const { gameData, resultData } = useCasinoWebSocket(game.gmid);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 20));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTotalBetForZone = (zoneId: string) => {
    return bets
      .filter((b) => b.zone === zoneId)
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const handleZoneClick = (zoneId: string) => {
    if (timeRemaining <= 3) {
      toast({
        title: "Betting Closed",
        description: "Please wait for the next round",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = { zone: zoneId, amount: selectedChip };
    setBets([...bets, newBet]);

    // Place bet via service
    casinoBettingService.placeCasinoBet(
      game.gmid,
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
      title: "Bet Placed",
      description: `₹${selectedChip} on ${BETTING_ZONES.find((z) => z.id === zoneId)?.label}`,
    });
  };

  const handleClear = () => {
    setBets([]);
    toast({
      title: "Bets Cleared",
      description: "All bets have been removed",
    });
  };

  const simulateCardFlip = () => {
    setIsFlipping(true);

    setTimeout(() => {
      const randomSymbol =
        CARD_SYMBOLS[Math.floor(Math.random() * CARD_SYMBOLS.length)];
      const randomSuit =
        CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
      setCurrentCard({ symbol: randomSymbol, suit: randomSuit });

      // Determine result zone
      let resultZone = "";
      let resultIcon = "";
      let resultColor = "";
      const cardValue = ["A", "2", "3", "4", "5", "6"].includes(randomSymbol)
        ? "below7"
        : randomSymbol === "7"
          ? "lucky7"
          : "above7";

      if (cardValue === "below7") {
        resultZone = "below7";
        resultIcon = "🏄";
        resultColor = "text-cyan-400";
      } else if (cardValue === "lucky7") {
        resultZone = "lucky7";
        resultIcon = "🌺";
        resultColor = "text-pink-400";
      } else {
        resultZone = "above7";
        resultIcon = "🥥";
        resultColor = "text-orange-400";
      }

      setHistory([
        {
          card: `${randomSymbol}${randomSuit}`,
          result: resultZone,
          icon: resultIcon,
          color: resultColor,
        },
        ...history.slice(0, 4),
      ]);

      setIsFlipping(false);
      setTimeRemaining(20);
    }, 2000);
  };

  const getCardColor = (suit: string) => {
    return suit === "♥" || suit === "♦" ? "text-red-500" : "text-gray-900";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-amber-200 p-4 overflow-hidden relative">
        {/* Animated Beach Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-200/50 to-transparent"></div>
          <Sun className="absolute top-10 right-10 w-20 h-20 text-yellow-300 animate-pulse" />
          <Waves
            className="absolute bottom-20 left-10 w-12 h-12 text-blue-400/40 animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <Palmtree className="absolute top-1/4 left-5 w-16 h-16 text-green-600/30" />
          <Palmtree className="absolute bottom-1/4 right-10 w-20 h-20 text-green-700/30" />
          <Shell className="absolute top-1/3 right-1/4 w-8 h-8 text-pink-300/40 animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header with Sound Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                <span className="text-5xl">🌴</span>
                Beach Lucky 7<span className="text-5xl">🏖️</span>
              </h1>
              <p className="text-blue-100 text-lg mt-1 drop-shadow">
                Tropical Card Paradise
              </p>
            </div>

            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white" />
              )}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timer and Status */}
              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl ${
                          timeRemaining <= 5
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                        }`}
                      >
                        {timeRemaining}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white font-semibold drop-shadow">
                        ⏳ Time
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-100 uppercase tracking-wide">
                        Round Status
                      </div>
                      <div className="text-2xl font-bold text-white drop-shadow">
                        {timeRemaining > 3
                          ? "🎯 Place Your Bets!"
                          : "🚫 Betting Closed"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-blue-100 uppercase tracking-wide">
                      Match ID
                    </div>
                    <div className="text-lg font-mono text-white drop-shadow">
                      {gameData?.mid || "Loading..."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Flip Area */}
              <div className="bg-gradient-to-br from-blue-600/30 via-purple-500/30 to-pink-500/30 backdrop-blur-md border-4 border-white/40 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col items-center justify-center min-h-[320px] relative">
                  <div className="text-white/80 text-xl mb-4 drop-shadow flex items-center gap-2">
                    🎴 Card Reveal Zone 🎴
                  </div>

                  {!currentCard ? (
                    <div className="w-48 h-64 bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white/50 transform hover:scale-105 transition-transform">
                      <div className="text-white text-6xl animate-pulse">
                        🌊
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-48 h-64 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4 border-yellow-400 ${
                        isFlipping ? "animate-spin" : "animate-bounce"
                      }`}
                      style={{ animationDuration: isFlipping ? "0.5s" : "2s" }}
                    >
                      <div
                        className={`text-7xl font-bold ${getCardColor(currentCard.suit)}`}
                      >
                        {currentCard.symbol}
                      </div>
                      <div
                        className={`text-5xl ${getCardColor(currentCard.suit)}`}
                      >
                        {currentCard.suit}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={simulateCardFlip}
                    disabled={isFlipping}
                    className="mt-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-6 text-xl rounded-2xl shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFlipping ? "🎴 Flipping..." : "🎴 Flip Card"}
                  </Button>
                </div>
              </div>

              {/* Betting Zones */}
              <div className="grid grid-cols-3 gap-4">
                {BETTING_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneClick(zone.id)}
                    disabled={timeRemaining <= 3}
                    className={`relative bg-gradient-to-br ${zone.color} rounded-3xl p-6 shadow-2xl border-4 border-white/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed group`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">{zone.icon}</div>
                      <div className="text-white font-bold text-xl drop-shadow-lg mb-1">
                        {zone.label}
                      </div>
                      <div className="text-white/90 text-sm font-semibold mb-2">
                        {zone.range}
                      </div>
                      <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-xs font-bold backdrop-blur-sm mb-2">
                        Pays {zone.payout}
                      </div>

                      {getTotalBetForZone(zone.id) > 0 && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 rounded-full px-3 py-1 text-sm font-bold shadow-lg animate-pulse">
                          ₹{getTotalBetForZone(zone.id)}
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-3xl transition-all"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Chip Selector */}
              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2 drop-shadow">
                  <Shell className="w-6 h-6" />
                  Select Chip
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm shadow-xl transform hover:scale-110 transition-all ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white ring-4 ring-yellow-300 scale-110"
                          : "bg-gradient-to-br from-amber-700 to-yellow-800 text-yellow-100 hover:from-amber-600 hover:to-yellow-700"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xs">₹</div>
                        <div>{value}</div>
                      </div>

                      {selectedChip === value && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Summary */}
              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-xl drop-shadow">
                    Your Bets
                  </h3>
                  <Button
                    onClick={handleClear}
                    disabled={bets.length === 0}
                    className="bg-red-500/80 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    Clear All
                  </Button>
                </div>

                {bets.length === 0 ? (
                  <div className="text-center py-8 text-blue-100">
                    <div className="text-5xl mb-2">🏝️</div>
                    <div>No bets placed yet</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {BETTING_ZONES.map((zone) => {
                      const zoneBets = bets.filter((b) => b.zone === zone.id);
                      if (zoneBets.length === 0) return null;

                      return (
                        <div
                          key={zone.id}
                          className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{zone.icon}</span>
                              <span className="text-white font-semibold">
                                {zone.label}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-yellow-300 font-bold">
                                ₹{getTotalBetForZone(zone.id)}
                              </div>
                              <div className="text-xs text-blue-100">
                                {zoneBets.length} bet
                                {zoneBets.length > 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t border-white/30 pt-3 mt-3">
                      <div className="flex items-center justify-between text-white font-bold text-lg">
                        <span>Total</span>
                        <span className="text-yellow-300">
                          ₹{bets.reduce((sum, b) => sum + b.amount, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* History */}
              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-white font-bold text-xl mb-4 drop-shadow flex items-center gap-2">
                  <Waves className="w-6 h-6" />
                  Recent Results
                </h3>
                <div className="space-y-2">
                  {history.map((entry, index) => (
                    <div
                      key={index}
                      className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{entry.icon}</span>
                        <span
                          className={`text-2xl font-bold ${entry.color} drop-shadow`}
                        >
                          {entry.card}
                        </span>
                      </div>
                      <div className="text-white/80 text-sm font-semibold">
                        {
                          BETTING_ZONES.find((z) => z.id === entry.result)
                            ?.label
                        }
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
