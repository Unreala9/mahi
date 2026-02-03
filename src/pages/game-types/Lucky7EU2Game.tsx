import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Crown, Sparkles, Clock, Info } from "lucide-react";

interface Game {
  gmid: string;
}

interface Lucky7EU2GameProps {
  game?: Game;
}

interface Bet {
  zone: string;
  amount: number;
  odds: string;
}

interface HistoryEntry {
  id: number;
  card: string;
  value: number;
  result: string;
  playerName: string;
}

const BETTING_ZONES = [
  {
    id: "below7",
    label: "Below 7",
    odds: "1:1",
    color: "from-blue-700 to-indigo-800",
    fractional: "Evens",
  },
  {
    id: "exactly7",
    label: "Exactly 7",
    odds: "11:1",
    color: "from-purple-700 to-pink-800",
    fractional: "11/1",
  },
  {
    id: "above7",
    label: "Above 7",
    odds: "1:1",
    color: "from-red-700 to-rose-800",
    fractional: "Evens",
  },
];

const EUROPEAN_SIDE_BETS = [
  {
    id: "suited",
    label: "Suited Card",
    odds: "3:1",
    fractional: "3/1",
    multiplier: 3,
    description: "Win if card matches suit bonus",
  },
  {
    id: "redblack",
    label: "Red/Black Bonus",
    odds: "2:1",
    fractional: "2/1",
    multiplier: 2,
    description: "Double payout on color match",
  },
  {
    id: "facecard",
    label: "Face Card Bonus",
    odds: "4:1",
    fractional: "4/1",
    multiplier: 4,
    description: "J, Q, K pays 4x",
  },
  {
    id: "aceking",
    label: "Ace or King",
    odds: "5:1",
    fractional: "5/1",
    multiplier: 5,
    description: "Special premium payout",
  },
];

const CHIP_VALUES = [100, 500, 1000, 5000, 10000];

const HISTORY: HistoryEntry[] = [
  {
    id: 1,
    card: "K♠",
    value: 13,
    result: "Above 7",
    playerName: "Giovanni M.",
  },
  { id: 2, card: "3♥", value: 3, result: "Below 7", playerName: "François L." },
  {
    id: 3,
    card: "7♦",
    value: 7,
    result: "Exactly 7",
    playerName: "Isabella R.",
  },
  { id: 4, card: "9♣", value: 9, result: "Above 7", playerName: "Wilhelm K." },
  {
    id: 5,
    card: "5♠",
    value: 5,
    result: "Below 7",
    playerName: "Anastasia P.",
  },
];

export default function Lucky7EU2Game({ game }: Lucky7EU2GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState(25);
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const gmid = game?.gmid || "lucky7eu2";
  const { gameData, resultData } = useCasinoWebSocket(gmid);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBet = (zone: string, odds: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Card is being revealed",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = {
      zone,
      amount: selectedChip,
      odds,
    };
    setBets([...bets, newBet]);

    void casinoBettingService.placeCasinoBet({
      gameId: gmid,
      gameName: gameData?.gtype || "Lucky 7",
      roundId: gameData?.mid || "",
      marketId: zone,
      marketName: zone,
      selection: zone,
      odds: parseFloat(odds.split(":")[0]) || 1,
      stake: selectedChip,
      betType: "BACK",
    });

    toast({
      title: "Bet Placed!",
      description: `₹${selectedChip} on ${zone} (${odds})`,
    });
  };

  const simulateReveal = () => {
    setIsFlipping(true);
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = [
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
    const randomCard =
      ranks[Math.floor(Math.random() * ranks.length)] +
      suits[Math.floor(Math.random() * suits.length)];

    setTimeout(() => {
      setCurrentCard(randomCard);
      setIsFlipping(false);
      setTimeRemaining(25);
      toast({
        title: "Card Revealed!",
        description: `Result: ${randomCard}`,
      });
    }, 2000);
  };

  const getTotalStake = () => {
    return bets.reduce((sum, b) => sum + b.amount, 0);
  };

  const getCardColor = (card: string) => {
    if (!card) return "text-gray-900";
    const suit = card.slice(-1);
    return suit === "♥" || suit === "♦" ? "text-red-600" : "text-gray-900";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 p-4 relative overflow-hidden">
        {/* Marble Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi0yLTQtMi00LTItNCAyLTIgMi00IDItMiA0LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>

        <div className="max-w-[1900px] mx-auto relative z-10">
          {/* Header */}
          <div
            className="bg-gradient-to-r from-blue-900/80 via-purple-900/80 to-blue-900/80 backdrop-blur-md border-4 border-gold-500/60 rounded-3xl p-6 mb-4 shadow-2xl"
            style={{ borderColor: "#FFD700" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown
                  className="w-12 h-12 text-yellow-400 animate-pulse"
                  style={{ filter: "drop-shadow(0 0 10px #FFD700)" }}
                />
                <div>
                  <div
                    className="text-blue-300 text-sm uppercase tracking-wide"
                    style={{ fontFamily: "serif" }}
                  >
                    European Premium Edition
                  </div>
                  <div
                    className="text-white font-bold text-3xl"
                    style={{ fontFamily: "serif" }}
                  >
                    Lucky 7 Royal
                  </div>
                  <div className="text-yellow-400 text-sm mt-1">
                    ⭐ Enhanced odds & exclusive side bets
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div
                    className="text-blue-300 text-sm"
                    style={{ fontFamily: "serif" }}
                  >
                    Draw #
                  </div>
                  <div className="text-white font-mono text-2xl font-bold">
                    {gameData?.mid || "EU7482"}
                  </div>
                </div>

                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                  }`}
                  style={{
                    borderColor: timeRemaining <= 5 ? "#EF4444" : "#FFD700",
                  }}
                >
                  <Clock className="w-8 h-8 mr-2" />
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Betting Area - Center */}
            <div className="lg:col-span-3 space-y-4">
              {/* Card Flip Area */}
              <div
                className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-md border-4 rounded-3xl p-8 shadow-2xl text-center min-h-[400px] flex flex-col items-center justify-center relative"
                style={{
                  borderColor: "#C0C0C0",
                  boxShadow: "0 0 30px rgba(192, 192, 192, 0.3)",
                }}
              >
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => setShowInfo(!showInfo)}
                    className="bg-blue-600/60 hover:bg-blue-700/60 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Rules
                  </Button>
                </div>

                {showInfo && (
                  <div
                    className="absolute top-20 right-4 bg-black/90 backdrop-blur-xl rounded-2xl p-6 border-2 max-w-md z-20"
                    style={{ borderColor: "#FFD700" }}
                  >
                    <h4
                      className="text-yellow-400 font-bold text-lg mb-3"
                      style={{ fontFamily: "serif" }}
                    >
                      European Betting Customs
                    </h4>
                    <div className="text-white text-sm space-y-2 mb-4">
                      <p>• Fractional odds display available</p>
                      <p>• Premium side bets with multipliers</p>
                      <p>• Responsible gaming limits: Max ₹50,000/round</p>
                      <p>• European player names in history</p>
                    </div>
                    <Button
                      onClick={() => setShowInfo(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Close
                    </Button>
                  </div>
                )}

                <div
                  className="text-blue-300 font-bold text-2xl mb-6"
                  style={{ fontFamily: "serif" }}
                >
                  <Sparkles className="w-6 h-6 inline-block mr-2 text-yellow-400" />
                  Premium Card Reveal
                </div>

                {currentCard ? (
                  <div
                    className="w-64 h-96 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-8 animate-[wiggle_0.5s_ease-in-out]"
                    style={{ borderColor: "#FFD700" }}
                  >
                    <div
                      className={`text-9xl font-bold ${getCardColor(currentCard)}`}
                    >
                      {currentCard}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-64 h-96 rounded-3xl shadow-2xl flex items-center justify-center border-8 ${isFlipping ? "animate-spin" : ""}`}
                    style={{
                      background:
                        "linear-gradient(135deg, #1e3a8a 0%, #7e22ce 100%)",
                      borderColor: "#C0C0C0",
                    }}
                  >
                    <div className="text-white text-6xl">🎴</div>
                  </div>
                )}

                <Button
                  onClick={simulateReveal}
                  disabled={isFlipping}
                  className="mt-8 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl disabled:opacity-50"
                  style={{ fontFamily: "serif" }}
                >
                  {isFlipping ? "Revealing..." : "Reveal Card"}
                </Button>
              </div>

              {/* Main Betting Zones */}
              <div className="grid grid-cols-3 gap-4">
                {BETTING_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => handleBet(zone.id, zone.odds)}
                    disabled={timeRemaining <= 2}
                    className={`bg-gradient-to-br ${zone.color} hover:opacity-90 rounded-2xl p-8 shadow-2xl border-4 transform hover:scale-105 transition-all disabled:opacity-50`}
                    style={{ borderColor: "#FFD700" }}
                  >
                    <div
                      className="text-white font-bold text-3xl mb-3"
                      style={{ fontFamily: "serif" }}
                    >
                      {zone.label}
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 mb-2">
                      <div className="text-yellow-400 font-bold text-4xl">
                        {zone.odds}
                      </div>
                      <div className="text-white text-sm mt-1">
                        ({zone.fractional})
                      </div>
                    </div>
                    <div
                      className="text-white/80 text-sm"
                      style={{ fontFamily: "serif" }}
                    >
                      {zone.id === "below7" && "Cards 2-6"}
                      {zone.id === "exactly7" && "Lucky 7 only"}
                      {zone.id === "above7" && "Cards 8-K"}
                    </div>
                  </button>
                ))}
              </div>

              {/* European Tier Side Bets */}
              <div
                className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md border-4 rounded-2xl p-6 shadow-2xl"
                style={{ borderColor: "#FFD700" }}
              >
                <h3
                  className="text-purple-300 font-bold text-2xl mb-4 flex items-center gap-2"
                  style={{ fontFamily: "serif" }}
                >
                  <Crown className="w-6 h-6 text-yellow-400" />
                  European Exclusive Tier
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {EUROPEAN_SIDE_BETS.map((bet) => (
                    <button
                      key={bet.id}
                      onClick={() => handleBet(bet.id, bet.odds)}
                      disabled={timeRemaining <= 2}
                      className="bg-black/40 hover:bg-purple-600/60 rounded-xl p-5 border-2 transition-all hover:scale-105 disabled:opacity-50 text-left"
                      style={{ borderColor: "#C0C0C0" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-white font-bold text-lg"
                          style={{ fontFamily: "serif" }}
                        >
                          {bet.label}
                        </span>
                        <div className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm">
                          {bet.multiplier}x
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold text-2xl mb-2">
                        {bet.odds}{" "}
                        <span className="text-sm">({bet.fractional})</span>
                      </div>
                      <div className="text-purple-200 text-xs">
                        {bet.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* European Odds Display Panel */}
              <div
                className="bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-md border-2 rounded-2xl p-5 shadow-2xl"
                style={{ borderColor: "#C0C0C0" }}
              >
                <h3
                  className="text-blue-300 font-bold text-lg mb-3"
                  style={{ fontFamily: "serif" }}
                >
                  📊 Odds Format Comparison
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="text-gray-400 text-xs mb-1">Decimal</div>
                    <div className="text-white font-bold text-2xl">2.00</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="text-gray-400 text-xs mb-1">Fractional</div>
                    <div className="text-white font-bold text-2xl">1/1</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="text-gray-400 text-xs mb-1">Implied %</div>
                    <div className="text-green-400 font-bold text-2xl">50%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bet Slip & History - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <div
                className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-md border-2 rounded-2xl p-5 shadow-2xl"
                style={{ borderColor: "#FFD700" }}
              >
                <h3
                  className="text-blue-300 font-bold text-xl mb-4"
                  style={{ fontFamily: "serif" }}
                >
                  Bet Slip
                </h3>
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-blue-300">
                    <div className="text-5xl mb-2">🎴</div>
                    <div className="text-sm" style={{ fontFamily: "serif" }}>
                      Place your bets
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 rounded-lg p-3 border"
                        style={{ borderColor: "#C0C0C0" }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold text-sm">
                            {bet.zone}
                          </span>
                          <span className="text-purple-300 text-xs">
                            {bet.odds}
                          </span>
                        </div>
                        <div className="text-yellow-400 font-bold">
                          ₹{bet.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bets.length > 0 && (
                  <div
                    className="space-y-3 border-t pt-3"
                    style={{ borderColor: "#C0C0C0" }}
                  >
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>Total Stake</span>
                      <span className="text-yellow-400">
                        ₹{getTotalStake()}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      Potential returns depend on outcome
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setBets([])}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 text-xs rounded-lg"
                      >
                        Clear
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs rounded-lg">
                        Repeat
                      </Button>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-4 text-lg font-bold rounded-xl shadow-2xl">
                      Place Bet
                    </Button>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div
                className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-md border-2 rounded-2xl p-5 shadow-2xl"
                style={{ borderColor: "#C0C0C0" }}
              >
                <h3
                  className="text-blue-300 font-bold text-lg mb-4"
                  style={{ fontFamily: "serif" }}
                >
                  Chip Value
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-4 font-bold text-lg shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white scale-105"
                          : "bg-gray-800 text-gray-400"
                      }`}
                      style={{
                        borderColor:
                          selectedChip === value ? "#FFD700" : "#4B5563",
                      }}
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

              {/* History */}
              <div
                className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-md border-2 rounded-2xl p-5 shadow-2xl max-h-[400px] overflow-y-auto"
                style={{ borderColor: "#C0C0C0" }}
              >
                <h3
                  className="text-blue-300 font-bold text-lg mb-4"
                  style={{ fontFamily: "serif" }}
                >
                  Recent Results
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-black/40 rounded-lg p-3 border"
                      style={{ borderColor: "#C0C0C0" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-4xl ${getCardColor(entry.card)}`}
                        >
                          {entry.card}
                        </span>
                        <div className="text-right">
                          <div className="text-white font-semibold text-sm">
                            {entry.result}
                          </div>
                          <div
                            className="text-gray-400 text-xs"
                            style={{ fontFamily: "serif" }}
                          >
                            {entry.playerName}
                          </div>
                        </div>
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
