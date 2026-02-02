import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const CARD_TIMELINE = [
  { side: "A", card: "🂡" },
  { side: "B", card: "🂮" },
  { side: "A", card: "🃋" },
  { side: "B", card: "🂫" },
  { side: "A", card: "🃁" },
  { side: "B", card: "🂷" },
  { side: "A", card: "🃑" },
];

const HISTORY = [
  { winner: "A", cards: 8 },
  { winner: "B", cards: 12 },
  { winner: "A", cards: 5 },
  { winner: "B", cards: 9 },
  { winner: "A", cards: 7 },
  { winner: "B", cards: 11 },
  { winner: "A", cards: 6 },
  { winner: "B", cards: 10 },
];

export default function AndarBahar20() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(20);
  const [isDealing, setIsDealing] = useState(false);
  const [jokerCard, setJokerCard] = useState("🂮");
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({
    andar: 0,
    bahar: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsDealing(true);
          setTimeout(() => setIsDealing(false), 5000);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = (betType: "andar" | "bahar") => {
    setBets((prev) => ({ ...prev, [betType]: prev[betType] + selectedChip }));
  };

  const clearBets = () => {
    setBets({ andar: 0, bahar: 0 });
  };

  const totalStake = bets.andar + bets.bahar;
  const potentialWin = bets.andar * 1.9 + bets.bahar * 1.9;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/10 to-gray-900">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-blue-600/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino-lobby")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  <span className="text-blue-500">Andar</span> Bahar <span className="text-green-500">20</span>
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-lg">{countdown}s</span>
                </div>
              </div>
              <Badge className="bg-green-600 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* History Panel (Left) */}
            <div className="lg:col-span-1 order-last lg:order-first">
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <h3 className="text-purple-400 font-bold mb-4 text-center">History</h3>
                <div className="space-y-2">
                  {HISTORY.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border-2",
                        result.winner === "A"
                          ? "bg-blue-900/30 border-blue-600"
                          : "bg-green-900/30 border-green-600"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "font-bold text-xl",
                            result.winner === "A" ? "text-blue-500" : "text-green-500"
                          )}
                        >
                          {result.winner === "A" ? "Andar" : "Bahar"}
                        </span>
                        <Badge
                          className={cn(
                            result.winner === "A" ? "bg-blue-600" : "bg-green-600"
                          )}
                        >
                          {result.cards} cards
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Game Board (Center) */}
            <div className="lg:col-span-3">
              {/* Joker Card at Top */}
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-600/50 p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-purple-400 font-bold text-lg mb-4">JOKER CARD</h3>
                  <div
                    className={cn(
                      "aspect-[3/4] max-w-[150px] mx-auto bg-white rounded-xl flex items-center justify-center text-8xl shadow-2xl border-4 border-purple-500 transition-all duration-500",
                      isDealing && "scale-110 animate-pulse"
                    )}
                  >
                    {jokerCard}
                  </div>
                  <p className="text-gray-400 text-sm mt-3">Match this card to win!</p>
                </div>
              </Card>

              {/* Betting Areas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Andar (Left) */}
                <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-blue-600/50 p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-blue-500 mb-2">ANDAR</h2>
                    <Badge className="bg-blue-600 text-white">1.90x</Badge>
                  </div>

                  <button
                    onClick={() => placeBet("andar")}
                    disabled={countdown <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xl py-8 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-blue-400 shadow-lg shadow-blue-600/50"
                  >
                    TAP TO BET
                    {bets.andar > 0 && (
                      <span className="block text-lg mt-2">₹{bets.andar}</span>
                    )}
                  </button>

                  {/* Card Timeline - Andar Side */}
                  <div className="mt-6 space-y-2">
                    <p className="text-blue-400 text-sm font-bold">Andar Cards:</p>
                    <div className="flex flex-wrap gap-1">
                      {CARD_TIMELINE.filter((c) => c.side === "A").map((card, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-14 bg-white rounded flex items-center justify-center text-2xl border-2 border-blue-500"
                        >
                          {card.card}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Bahar (Right) */}
                <Card className="bg-gradient-to-br from-green-950/50 to-green-900/30 border-green-600/50 p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-green-500 mb-2">BAHAR</h2>
                    <Badge className="bg-green-600 text-white">1.90x</Badge>
                  </div>

                  <button
                    onClick={() => placeBet("bahar")}
                    disabled={countdown <= 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-2xl py-8 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-green-400 shadow-lg shadow-green-600/50"
                  >
                    TAP TO BET
                    {bets.bahar > 0 && (
                      <span className="block text-lg mt-2">₹{bets.bahar}</span>
                    )}
                  </button>

                  {/* Card Timeline - Bahar Side */}
                  <div className="mt-6 space-y-2">
                    <p className="text-green-400 text-sm font-bold">Bahar Cards:</p>
                    <div className="flex flex-wrap gap-1">
                      {CARD_TIMELINE.filter((c) => c.side === "B").map((card, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-14 bg-white rounded flex items-center justify-center text-2xl border-2 border-green-500"
                        >
                          {card.card}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Vertical Card Timeline (Full) */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4 mb-4">
                <h3 className="text-purple-400 font-bold mb-3">Card Timeline</h3>
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {CARD_TIMELINE.map((card, idx) => (
                    <div key={idx} className="flex-shrink-0">
                      <div
                        className={cn(
                          "w-16 h-24 bg-white rounded flex items-center justify-center text-4xl border-4 transition-all hover:scale-105",
                          card.side === "A" ? "border-blue-500" : "border-green-500"
                        )}
                      >
                        {card.card}
                      </div>
                      <p
                        className={cn(
                          "text-center text-xs font-bold mt-1",
                          card.side === "A" ? "text-blue-500" : "text-green-500"
                        )}
                      >
                        {card.side === "A" ? "Andar" : "Bahar"}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Controls */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm">Chips:</span>
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={cn(
                        "w-14 h-14 rounded-full font-bold text-sm border-4 transition-all hover:scale-110",
                        selectedChip === value
                          ? "bg-yellow-600 border-yellow-400 text-white ring-2 ring-yellow-300"
                          : "bg-gray-700 border-gray-600 text-gray-300"
                      )}
                    >
                      ₹{value}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20"
                  >
                    Clear
                  </Button>
                  <Button variant="outline" className="border-blue-600 text-blue-500 hover:bg-blue-600/20">
                    Repeat
                  </Button>
                  <Button variant="outline" className="border-green-600 text-green-500 hover:bg-green-600/20">
                    Double
                  </Button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-600/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-2xl">₹{totalStake}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Potential Win</p>
                      <p className="text-green-500 font-bold text-2xl">₹{potentialWin.toFixed(0)}</p>
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
