import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";
const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const BET_PANELS = [
  {
    id: "below7",
    name: "Below 7",
    odds: "1.95x",
    color: "from-blue-600 to-blue-800",
    borderColor: "border-blue-500",
  },
  {
    id: "exactly7",
    name: "Exactly 7",
    odds: "11x",
    color: "from-yellow-600 to-yellow-800",
    borderColor: "border-yellow-500",
  },
  {
    id: "above7",
    name: "Above 7",
    odds: "1.95x",
    color: "from-red-600 to-red-800",
    borderColor: "border-red-500",
  },
];

const HISTORY = [
  {
    card: { suit: "hearts" as const, value: "K" },
    result: "above",
    pool: "₹4200",
  },
  {
    card: { suit: "diamonds" as const, value: "3" },
    result: "below",
    pool: "₹3800",
  },
  {
    card: { suit: "spades" as const, value: "7" },
    result: "exactly",
    pool: "₹12400",
  },
  {
    card: { suit: "clubs" as const, value: "Q" },
    result: "above",
    pool: "₹5100",
  },
  {
    card: { suit: "hearts" as const, value: "2" },
    result: "below",
    pool: "₹2900",
  },
  {
    card: { suit: "diamonds" as const, value: "9" },
    result: "above",
    pool: "₹4600",
  },
  {
    card: { suit: "spades" as const, value: "5" },
    result: "below",
    pool: "₹3400",
  },
  {
    card: { suit: "clubs" as const, value: "A" },
    result: "below",
    pool: "₹2800",
  },
  {
    card: { suit: "hearts" as const, value: "10" },
    result: "above",
    pool: "₹5200",
  },
  {
    card: { suit: "diamonds" as const, value: "6" },
    result: "below",
    pool: "₹3700",
  },
];

export default function Lucky7() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedCard, setRevealedCard] = useState<{
    suit: "hearts" | "diamonds" | "clubs" | "spades";
    value: string;
  } | null>(null);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({
    below7: 0,
    exactly7: 0,
    above7: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          setRevealedCard({ suit: "diamonds", value: "K" });
          setTimeout(() => {
            setIsRevealing(false);
            setRevealedCard(null);
          }, 4000);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = (betType: keyof typeof bets) => {
    setBets((prev) => ({ ...prev, [betType]: prev[betType] + selectedChip }));
  };

  const handlePlaceBets = async () => {
    const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      if (bets.below7 > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "lucky7",
            gameName: "Lucky 7",
            marketId: "below7",
            marketName: "Below 7",
            selection: "Below 7",
            odds: 1.95,
            stake: bets.below7,
            betType: "BACK",
          }),
        );
      }
      if (bets.exactly7 > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "lucky7",
            gameName: "Lucky 7",
            marketId: "exactly7",
            marketName: "Exactly 7",
            selection: "Exactly 7",
            odds: 11,
            stake: bets.exactly7,
            betType: "BACK",
          }),
        );
      }
      if (bets.above7 > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "lucky7",
            gameName: "Lucky 7",
            marketId: "above7",
            marketName: "Above 7",
            selection: "Above 7",
            odds: 1.95,
            stake: bets.above7,
            betType: "BACK",
          }),
        );
      }

      await Promise.all(betPromises);
      clearBets();
    } catch (error) {
      console.error("Failed to place bets:", error);
    }
  };

  const clearBets = () => {
    setBets({ below7: 0, exactly7: 0, above7: 0 });
  };

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
  const potentialWin =
    bets.below7 * 1.95 + bets.exactly7 * 11 + bets.above7 * 1.95;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black">
        {/* Header with Countdown */}
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
                <h1 className="text-2xl font-bold text-purple-400 mb-2">
                  Lucky 7
                </h1>
                {/* Countdown Bar */}
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-800 rounded-full h-3 overflow-hidden border border-purple-500/30">
                    <div
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 h-full transition-all duration-1000"
                      style={{ width: `${(countdown / 15) * 100}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-1">
                    Next card in {countdown}s
                  </p>
                </div>
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
              {/* Card Reveal Area */}
              <Card className="bg-gray-900/50 border-purple-600/30 p-8 mb-6">
                <div className="text-center">
                  <h2 className="text-purple-400 font-bold text-xl mb-6">
                    Next Card
                  </h2>
                  <div className="flex justify-center">
                    <div
                      className={cn(
                        "transition-all duration-700",
                        isRevealing && "animate-flip scale-110",
                      )}
                    >
                      {revealedCard ? (
                        <PlayingCard
                          suit={revealedCard.suit}
                          value={revealedCard.value}
                          size="xl"
                        />
                      ) : (
                        <PlayingCard faceDown size="xl" />
                      )}
                    </div>
                  </div>
                  {isRevealing && revealedCard && (
                    <div className="mt-6 animate-pulse">
                      <Badge className="bg-purple-600 text-lg px-6 py-2">
                        {revealedCard.value === "7"
                          ? "Exactly 7!"
                          : parseInt(revealedCard.value) > 7 ||
                              ["J", "Q", "K", "A"].includes(revealedCard.value)
                            ? "Above 7!"
                            : "Below 7!"}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Betting Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {BET_PANELS.map((panel) => (
                  <Card
                    key={panel.id}
                    className={cn(
                      "bg-gradient-to-br p-6 border-4 transition-all hover:scale-[1.02] cursor-pointer",
                      panel.color,
                      panel.borderColor,
                      bets[panel.id as keyof typeof bets] > 0 &&
                        "ring-4 ring-white ring-offset-2 ring-offset-gray-900",
                    )}
                    onClick={() => placeBet(panel.id as keyof typeof bets)}
                  >
                    <div className="text-center">
                      <h3 className="text-white font-bold text-2xl mb-2">
                        {panel.name}
                      </h3>
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-lg px-4 py-1 mb-4">
                        {panel.odds}
                      </Badge>

                      {/* My Bet */}
                      {bets[panel.id as keyof typeof bets] > 0 && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-4 border border-white/20">
                          <p className="text-white/80 text-xs mb-1">My Bet</p>
                          <p className="text-white font-bold text-xl">
                            ₹{bets[panel.id as keyof typeof bets]}
                          </p>
                        </div>
                      )}

                      {/* Tap to Bet Button */}
                      <Button
                        disabled={countdown <= 0}
                        className="w-full mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-6 text-lg border-2 border-white/40"
                      >
                        TAP TO BET
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Controls */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
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

                <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-600/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Potential Win</p>
                      <p className="text-green-500 font-bold text-2xl">
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
                  Recent Results
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all hover:scale-105",
                        result.result === "below"
                          ? "bg-blue-900/30 border-blue-600"
                          : result.result === "exactly"
                            ? "bg-yellow-900/30 border-yellow-600"
                            : "bg-red-900/30 border-red-600",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <PlayingCard
                            suit={result.card.suit}
                            value={result.card.value}
                            size="sm"
                          />
                        </div>
                        <div className="text-right flex-1">
                          <Badge
                            className={cn(
                              "text-xs",
                              result.result === "below"
                                ? "bg-blue-600"
                                : result.result === "exactly"
                                  ? "bg-yellow-600"
                                  : "bg-red-600",
                            )}
                          >
                            {result.result === "below"
                              ? "< 7"
                              : result.result === "exactly"
                                ? "= 7"
                                : "> 7"}
                          </Badge>
                          <p className="text-white text-xs mt-1 font-bold">
                            {result.pool}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-4 bg-gray-900/50 p-3 rounded border border-purple-600/30">
                  <h4 className="text-purple-400 font-bold text-sm mb-3">
                    Last 10 Stats
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-400">Below 7:</span>
                      <span className="text-white font-bold">
                        {HISTORY.filter((h) => h.result === "below").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-400">Exactly 7:</span>
                      <span className="text-white font-bold">
                        {HISTORY.filter((h) => h.result === "exactly").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Above 7:</span>
                      <span className="text-white font-bold">
                        {HISTORY.filter((h) => h.result === "above").length}
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
