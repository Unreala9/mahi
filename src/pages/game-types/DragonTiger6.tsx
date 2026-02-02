import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";

const CHIP_VALUES = [50, 100, 500, 1000, 5000];

const HISTORY = Array.from({ length: 20 }, (_, i) => {
  const outcomes = ["D", "T", "Tie"];
  return outcomes[Math.floor(Math.random() * outcomes.length)];
});

export default function DragonTiger6() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({ dragon: 0, tiger: 0, tie: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          setTimeout(() => setIsRevealing(false), 3000);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = (betType: keyof typeof bets) => {
    setBets((prev) => ({ ...prev, [betType]: prev[betType] + selectedChip }));
  };

  const clearBets = () => setBets({ dragon: 0, tiger: 0, tie: 0 });
  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);

  const handlePlaceBets = async () => {
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      if (bets.dragon > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "dt6",
            gameName: "Dragon Tiger 6",
            marketId: "dragon",
            marketName: "Dragon",
            selection: "Dragon",
            odds: 1.95,
            stake: bets.dragon,
            betType: "BACK",
          }),
        );
      }
      if (bets.tiger > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "dt6",
            gameName: "Dragon Tiger 6",
            marketId: "tiger",
            marketName: "Tiger",
            selection: "Tiger",
            odds: 1.95,
            stake: bets.tiger,
            betType: "BACK",
          }),
        );
      }
      if (bets.tie > 0) {
        betPromises.push(
          bettingService.placeBet({
            gameType: "CASINO",
            gameId: "dt6",
            gameName: "Dragon Tiger 6",
            marketId: "tie",
            marketName: "Tie",
            selection: "Tie",
            odds: 11,
            stake: bets.tie,
            betType: "BACK",
          }),
        );
      }

      await Promise.all(betPromises);
      setBets({ dragon: 0, tiger: 0, tie: 0 });
    } catch (error) {
      console.error("Failed to place bets:", error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black">
        {/* Ultra-Compact Header */}
        <div className="bg-gray-900 border-b border-gray-800 py-2 px-3">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/casino")}
              className="text-gray-400 hover:text-white h-8 px-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-yellow-500" />
              <span className="text-yellow-500 font-bold">{countdown}s</span>
            </div>
            <Badge className="bg-red-600 h-5 text-xs">Live</Badge>
          </div>
        </div>

        {/* Main Game - Optimized for Portrait */}
        <div className="max-w-md mx-auto">
          {/* Dragon Zone (Top Half) */}
          <div
            className={cn(
              "min-h-[40vh] bg-gradient-to-b from-red-700 to-red-900 p-6 flex flex-col items-center justify-center border-b-4 border-black transition-all",
              bets.dragon > 0 && "ring-4 ring-yellow-500 ring-inset",
            )}
            onClick={() => countdown > 0 && placeBet("dragon")}
          >
            <h2 className="text-white font-bold text-4xl mb-4">🐉 DRAGON</h2>
            <div className="mb-4">
              <PlayingCard
                suit={isRevealing ? "hearts" : undefined}
                value={isRevealing ? "K" : undefined}
                faceDown={!isRevealing}
                size="xl"
                flipped={isRevealing}
              />
            </div>
            <Badge className="bg-white/20 text-white text-lg px-6 py-2 mb-2">
              1.95x
            </Badge>
            {bets.dragon > 0 && (
              <div className="bg-white/20 rounded-lg px-6 py-2">
                <p className="text-white font-bold text-xl">₹{bets.dragon}</p>
              </div>
            )}
          </div>

          {/* Tie Zone (Center) */}
          <div
            className={cn(
              "bg-gradient-to-r from-yellow-700 to-yellow-900 py-3 px-6 flex items-center justify-between border-y border-black/50 transition-all",
              bets.tie > 0 && "ring-4 ring-white ring-inset",
            )}
            onClick={() => countdown > 0 && placeBet("tie")}
          >
            <span className="text-white font-bold text-xl">TIE (11x)</span>
            {bets.tie > 0 && (
              <Badge className="bg-white/20 text-white font-bold">
                ₹{bets.tie}
              </Badge>
            )}
          </div>

          {/* Tiger Zone (Bottom Half) */}
          <div
            className={cn(
              "min-h-[40vh] bg-gradient-to-b from-blue-700 to-blue-900 p-6 flex flex-col items-center justify-center transition-all",
              bets.tiger > 0 && "ring-4 ring-yellow-500 ring-inset",
            )}
            onClick={() => countdown > 0 && placeBet("tiger")}
          >
            <h2 className="text-white font-bold text-4xl mb-4">🐯 TIGER</h2>
            <div className="mb-4">
              <PlayingCard
                suit={isRevealing ? "spades" : undefined}
                value={isRevealing ? "A" : undefined}
                faceDown={!isRevealing}
                size="xl"
                flipped={isRevealing}
              />
            </div>
            <Badge className="bg-white/20 text-white text-lg px-6 py-2 mb-2">
              1.95x
            </Badge>
            {bets.tiger > 0 && (
              <div className="bg-white/20 rounded-lg px-6 py-2">
                <p className="text-white font-bold text-xl">₹{bets.tiger}</p>
              </div>
            )}
          </div>

          {/* Bottom Controls - Ultra Compact */}
          <div className="bg-gray-900 p-3 border-t border-gray-800">
            {/* Chip Bar */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {CHIP_VALUES.map((value) => (
                <BettingChip
                  key={value}
                  value={value}
                  selected={selectedChip === value}
                  onClick={() => setSelectedChip(value)}
                  size="sm"
                />
              ))}
            </div>

            {/* One-line Summary & Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Stake</p>
                <p className="text-white font-bold">₹{totalStake}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={clearBets}
                className="border-red-600 text-red-500 h-8 text-xs"
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-600 text-blue-500 h-8 text-xs"
              >
                Repeat
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-500 h-8 text-xs"
              >
                2x
              </Button>
              <Button
                size="sm"
                onClick={handlePlaceBets}
                className="bg-green-600 hover:bg-green-700 h-8 text-xs font-bold"
              >
                Place Bet
              </Button>
            </div>
          </div>

          {/* History Strip */}
          <div className="bg-gray-900 p-2 border-t border-gray-800">
            <div className="flex items-center gap-1 overflow-x-auto">
              {HISTORY.map((result, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    result === "D"
                      ? "bg-red-600 text-white"
                      : result === "T"
                        ? "bg-blue-600 text-white"
                        : "bg-yellow-600 text-white",
                  )}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
