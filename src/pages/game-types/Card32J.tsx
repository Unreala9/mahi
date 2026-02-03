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
import { bettingService } from "@/services/bettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const GROUPS = [
  {
    id: "8",
    name: "8 CARDS",
    odds: "3.2x",
    color: "from-red-600 to-red-800",
    textColor: "text-red-400",
    cards: "A♠ A♥ A♦ A♣ 6♠ 6♥ 6♦ 6♣",
  },
  {
    id: "9",
    name: "9 CARDS",
    odds: "2.8x",
    color: "from-blue-600 to-blue-800",
    textColor: "text-blue-400",
    cards: "2♠ 2♥ 2♦ 2♣ 7♠ 7♥ 7♦ 7♣ J♦",
  },
  {
    id: "10",
    name: "10 CARDS",
    odds: "2.5x",
    color: "from-green-600 to-green-800",
    textColor: "text-green-400",
    cards: "3♠ 3♥ 3♦ 3♣ 8♠ 8♥ 8♦ 8♣ Q♦ K♦",
  },
  {
    id: "11",
    name: "11 CARDS",
    odds: "2.3x",
    color: "from-purple-600 to-purple-800",
    textColor: "text-purple-400",
    cards: "4♠ 4♥ 4♦ 4♣ 5♠ 5♥ 5♦ 5♣ 9♠ 10♠ J♠",
  },
];

export default function Card32J() {
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
    gameType: "card32j",
    gameName: "Card 32 J",
  });

  const [countdown, setCountdown] = useState(15);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedCard] = useState({ suit: "hearts" as const, value: "7" });
  const [winningGroup] = useState("9");
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<Record<string, number>>({
    "8": 0,
    "9": 0,
    "10": 0,
    "11": 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          setTimeout(() => setIsRevealing(false), 4000);
          return 15;
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
      const groupOdds: Record<string, number> = {
        "8": 3.2,
        "9": 2.8,
        "10": 2.5,
        "11": 2.3,
      };

      Object.entries(bets).forEach(([groupId, stake]) => {
        if (stake > 0) {
          const group = GROUPS.find((g) => g.id === groupId);
          betPromises.push(
            bettingService.placeBet({
              gameType: "CASINO",
              gameId: "card32",
              gameName: "32 Cards",
              marketId: groupId,
              marketName: group?.name || `${groupId} Cards`,
              selection: group?.name || `${groupId} Cards`,
              odds: groupOdds[groupId],
              stake: stake,
              betType: "BACK",
            }),
          );
        }
      });

      await Promise.all(betPromises);
      setBets({ "8": 0, "9": 0, "10": 0, "11": 0 });
    } catch (error) {
      console.error("Failed to place bets:", error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
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
                <h1 className="text-2xl font-bold text-white mb-1">
                  32 Cards Judgement
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-500 font-bold">{countdown}s</span>
                </div>
              </div>
              <Badge className="bg-red-600">Live</Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Game */}
            <div className="lg:col-span-3">
              {/* Card Reveal Section */}
              <Card className="bg-gray-900 border-gray-700 p-8 mb-6">
                <div className="text-center">
                  <h3 className="text-gray-400 text-sm font-bold mb-6">
                    REVEALED CARD
                  </h3>
                  <div className="inline-block relative">
                    <PlayingCard
                      suit={isRevealing ? revealedCard.suit : undefined}
                      value={isRevealing ? revealedCard.value : undefined}
                      faceDown={!isRevealing}
                      size="xl"
                      flipped={isRevealing}
                    />
                  </div>
                  {isRevealing && (
                    <div className="mt-6">
                      <Badge
                        className={cn(
                          "text-2xl py-2 px-6",
                          GROUPS.find((g) => g.id === winningGroup)?.textColor,
                        )}
                      >
                        {GROUPS.find((g) => g.id === winningGroup)?.name} WINS!
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Betting Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {GROUPS.map((group) => (
                  <Card
                    key={group.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 border-2 overflow-hidden relative",
                      bets[group.id] > 0
                        ? `bg-gradient-to-br ${group.color} border-white ring-4 ring-yellow-500 scale-105`
                        : `bg-gradient-to-br ${group.color} border-gray-600 hover:scale-105 hover:border-white`,
                    )}
                    onClick={() => countdown > 0 && placeBet(group.id)}
                  >
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <h3 className="text-white font-bold text-xl mb-2">
                          {group.name}
                        </h3>
                        <Badge className="bg-white/20 text-white text-lg px-4 py-1">
                          {group.odds}
                        </Badge>
                      </div>

                      <div className="bg-black/30 rounded-lg p-3 mb-3">
                        <p className="text-white/70 text-xs mb-1">Cards:</p>
                        <p className="text-white text-xs leading-relaxed">
                          {group.cards}
                        </p>
                      </div>

                      {bets[group.id] > 0 && (
                        <div className="bg-white/20 rounded-lg p-3 animate-pulse">
                          <p className="text-white/70 text-xs">My Bet</p>
                          <p className="text-white font-bold text-xl">
                            ₹{bets[group.id]}
                          </p>
                        </div>
                      )}
                    </div>

                    {bets[group.id] > 0 && (
                      <div className="absolute top-2 right-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Controls */}
              <Card className="bg-gray-900 border-gray-700 p-4">
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
                    Double
                  </Button>
                  <Button
                    onClick={handlePlaceBets}
                    className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 font-bold"
                  >
                    Place Bet
                  </Button>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Total Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Potential Win</p>
                      <p className="text-green-400 font-bold text-2xl">
                        ₹{potentialWin.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-gray-700 p-4">
                <h3 className="text-white font-bold mb-4 text-center">
                  Last 12 Results
                </h3>
                <div className="space-y-2">
                  {/* History will be populated from live API data */}
                  <p className="text-gray-400 text-sm text-center">
                    No history available
                  </p>
                  {/*
                    {HISTORY.map((result, idx) => {
                      const group = GROUPS.find((g) => g.id === result.group);
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded border-2 transition-all hover:scale-105 bg-gradient-to-r",
                            group?.color,
                            "border-gray-600",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-bold text-sm">
                                {group?.name}
                              </p>
                              <p className="text-white/70 text-xs">
                                {result.card}
                              </p>
                            </div>
                            <Badge className="bg-white/20 text-white text-xs">
                              {group?.odds}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  */}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
