import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const CARD_SEQUENCE = [
  { side: "A", card: "🂳" },
  { side: "B", card: "🃇" },
  { side: "A", card: "🃙" },
  { side: "B", card: "🂢" },
  { side: "A", card: "🂻" },
];

const HISTORY = [
  { winner: "A", cards: 7 },
  { winner: "B", cards: 11 },
  { winner: "A", cards: 5 },
  { winner: "B", cards: 9 },
  { winner: "A", cards: 6 },
];

export default function AndarBaharJ() {
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
    gameType: "abj",
    gameName: "Andar Bahar J",
  });

  const [countdown, setCountdown] = useState(20);
  const [isDealing, setIsDealing] = useState(false);
  const [jokerCard] = useState("🃎");
  const [selectedChip, setSelectedChip] = useState(100);
  const [selectedSide, setSelectedSide] = useState<"andar" | "bahar" | null>(
    null,
  );
  const [bets, setBets] = useState({ andar: 0, bahar: 0 });

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

  const handlePlaceBets = async () => {
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      if (bets.andar > 0) {
        betPromises.push(
          casinoBettingService.placeCasinoBet({
            gameId: "abj",
            gameName: "Andar Bahar Joker",
            roundId: "1",
            marketId: "andar",
            marketName: "Andar",
            selection: "Andar",
            odds: 1.9,
            stake: bets.andar,
            betType: "BACK",
          }),
        );
      }
      if (bets.bahar > 0) {
        betPromises.push(
          casinoBettingService.placeCasinoBet({
            gameId: "abj",
            gameName: "Andar Bahar Joker",
            roundId: "1",
            marketId: "bahar",
            marketName: "Bahar",
            selection: "Bahar",
            odds: 1.9,
            stake: bets.bahar,
            betType: "BACK",
          }),
        );
      }

      await Promise.all(betPromises);
      toast({ title: "Bets placed successfully!" });
      setBets({ andar: 0, bahar: 0 });
      setSelectedSide(null);
    } catch (error) {
      console.error("Failed to place bets:", error);
      toast({ title: "Failed to place bets", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-purple-600/30 backdrop-blur-sm sticky top-0 z-10">
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
                <h1 className="text-2xl font-bold text-purple-400 mb-1">
                  Andar Bahar Judgement
                </h1>
                <div className="bg-purple-900/50 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-1000"
                    style={{ width: `${(countdown / 20) * 100}%` }}
                  />
                </div>
                <p className="text-purple-400 text-sm mt-1">
                  {countdown}s remaining
                </p>
              </div>
              <Badge className="bg-purple-600 animate-pulse">
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
              {/* Joker Card with Glow */}
              <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 border-purple-500 p-8 mb-6 relative overflow-hidden">
                {/* Particle Effects Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)] animate-pulse"></div>

                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <h3 className="text-purple-400 font-bold text-xl">
                      JOKER CARD
                    </h3>
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                  </div>

                  <div className="relative inline-block">
                    {/* Glowing Frame */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl blur-lg opacity-75 animate-pulse"></div>

                    {/* Card */}
                    <div className="relative w-40 h-56 bg-white rounded-2xl flex items-center justify-center text-8xl shadow-2xl border-4 border-purple-500">
                      {jokerCard}
                    </div>
                  </div>

                  <p className="text-purple-300 text-sm mt-4">
                    Match this card to win!
                  </p>
                </div>
              </Card>

              {/* Betting Lanes */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Andar Lane */}
                <Card
                  className={cn(
                    "bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500 p-6 cursor-pointer transition-all duration-300",
                    selectedSide === "andar" &&
                      "ring-4 ring-blue-400 ring-offset-2 ring-offset-gray-900 scale-105",
                    bets.andar > 0 && "bg-blue-900/70",
                  )}
                  onClick={() => countdown > 0 && placeBet("andar")}
                >
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-blue-400 mb-2">
                      ANDAR
                    </h2>
                    <Badge className="bg-blue-600 text-white text-lg px-4 py-1">
                      1.90x
                    </Badge>
                  </div>

                  {bets.andar > 0 && (
                    <div className="bg-blue-600/30 rounded-lg p-4 mb-4 border border-blue-400 animate-pulse">
                      <p className="text-blue-300 text-xs mb-1">My Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{bets.andar}
                      </p>
                      <p className="text-blue-300 text-xs mt-1">
                        Win: ₹{(bets.andar * 1.9).toFixed(0)}
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-950/50 rounded-lg p-3">
                    <p className="text-blue-400 text-xs mb-2">Andar Cards:</p>
                    <div className="flex flex-wrap gap-1">
                      {CARD_SEQUENCE.filter((c) => c.side === "A").map(
                        (card, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-14 bg-white rounded flex items-center justify-center text-2xl border-2 border-blue-400"
                          >
                            {card.card}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </Card>

                {/* Bahar Lane */}
                <Card
                  className={cn(
                    "bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500 p-6 cursor-pointer transition-all duration-300",
                    selectedSide === "bahar" &&
                      "ring-4 ring-green-400 ring-offset-2 ring-offset-gray-900 scale-105",
                    bets.bahar > 0 && "bg-green-900/70",
                  )}
                  onClick={() => countdown > 0 && placeBet("bahar")}
                >
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-green-400 mb-2">
                      BAHAR
                    </h2>
                    <Badge className="bg-green-600 text-white text-lg px-4 py-1">
                      1.90x
                    </Badge>
                  </div>

                  {bets.bahar > 0 && (
                    <div className="bg-green-600/30 rounded-lg p-4 mb-4 border border-green-400 animate-pulse">
                      <p className="text-green-300 text-xs mb-1">My Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{bets.bahar}
                      </p>
                      <p className="text-green-300 text-xs mt-1">
                        Win: ₹{(bets.bahar * 1.9).toFixed(0)}
                      </p>
                    </div>
                  )}

                  <div className="bg-green-950/50 rounded-lg p-3">
                    <p className="text-green-400 text-xs mb-2">Bahar Cards:</p>
                    <div className="flex flex-wrap gap-1">
                      {CARD_SEQUENCE.filter((c) => c.side === "B").map(
                        (card, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-14 bg-white rounded flex items-center justify-center text-2xl border-2 border-green-400"
                          >
                            {card.card}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Card Sequence Timeline */}
              <Card className="bg-gray-900/50 border-purple-600/20 p-4 mb-4">
                <h3 className="text-purple-400 font-bold mb-3">
                  Dealing Sequence
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {CARD_SEQUENCE.map((card, idx) => (
                    <div key={idx} className="flex-shrink-0">
                      <div className="w-16 h-24 bg-white rounded flex items-center justify-center text-4xl border-4 border-purple-500">
                        {card.card}
                      </div>
                      <p
                        className={cn(
                          "text-center text-xs font-bold mt-1",
                          card.side === "A"
                            ? "text-blue-500"
                            : "text-green-500",
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
                  <span className="text-gray-400 text-sm font-bold">
                    Chips:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={cn(
                        "w-14 h-14 rounded-full font-bold text-sm border-4 transition-all hover:scale-110",
                        selectedChip === value
                          ? "bg-yellow-600 border-yellow-400 text-white ring-2 ring-yellow-300"
                          : "bg-gray-700 border-gray-600 text-gray-300",
                      )}
                    >
                      ₹{value}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20 font-bold"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-500 hover:bg-blue-600/20 font-bold"
                  >
                    Repeat
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-500 hover:bg-green-600/20 font-bold"
                  >
                    2x
                  </Button>
                  <Button
                    onClick={handlePlaceBets}
                    className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 font-bold"
                  >
                    Place Bet
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-300 text-xs">Potential Win</p>
                      <p className="text-green-400 font-bold text-2xl">
                        ₹{potentialWin.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* History Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <h3 className="text-purple-400 font-bold mb-4 text-center">
                  Recent History
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded border-2 transition-all hover:scale-105",
                        result.winner === "A"
                          ? "bg-blue-900/30 border-blue-600"
                          : "bg-green-900/30 border-green-600",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            result.winner === "A"
                              ? "bg-blue-600"
                              : "bg-green-600"
                          }
                        >
                          {result.winner === "A" ? "Andar" : "Bahar"}
                        </Badge>
                        <Badge className="bg-purple-600 text-xs">
                          {result.cards} cards
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
