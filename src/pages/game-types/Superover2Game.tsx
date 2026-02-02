import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import type { CasinoGame } from "@/types/casino";

interface Superover2GameProps {
  game?: CasinoGame;
}

export default function Superover2Game({ game }: Superover2GameProps) {
  const [bets, setBets] = useState<any[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);

  const gameId = game?.gmid || "superover2";
  const gameName = game?.gname || "Super Over 2";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handlePlaceBet = async (selection: string, odds: number) => {
    const newBet = { selection, odds, stake: selectedChip };
    setBets([...bets, newBet]);
    toast({ title: `Bet placed: ${selection}` });
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) {
      toast({ title: "No bets placed", variant: "destructive" });
      return;
    }

    try {
      for (const bet of bets) {
        await casinoBettingService.placeCasinoBet({
          gameId: gameId,
          gameName: gameName,
          roundId: gameData?.mid?.toString() || "",
          marketId: bet.selection,
          marketName: bet.selection,
          selection: bet.selection,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "✅ All bets placed successfully" });
      setBets([]);
    } catch (err: any) {
      toast({
        title: "❌ Bet placement failed",
        description: err?.message || String(err),
        variant: "destructive",
      });
    }
  };

  const outcomes = [
    { label: "0 Runs", odds: 12.0, color: "from-gray-600 to-gray-800" },
    { label: "1-5 Runs", odds: 3.5, color: "from-blue-600 to-blue-800" },
    { label: "6-10 Runs", odds: 2.5, color: "from-green-600 to-green-800" },
    { label: "11+ Runs", odds: 4.0, color: "from-red-600 to-red-800" },
    { label: "Wicket", odds: 6.0, color: "from-orange-600 to-orange-800" },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Super Over 2
              </h1>
              <p className="text-lg text-teal-200 mt-2">
                Extended Edition • 6 Balls
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Over ID</div>
              <div className="text-2xl font-mono font-bold">
                {gameData?.mid || "DEMO-SO2"}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">
                Predict Super Over Outcome
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {outcomes.map((outcome) => (
                  <button
                    key={outcome.label}
                    onClick={() => handlePlaceBet(outcome.label, outcome.odds)}
                    className={`bg-gradient-to-br ${outcome.color} hover:opacity-90 rounded-lg p-8 transition-all transform hover:scale-105`}
                  >
                    <div className="text-2xl font-bold">{outcome.label}</div>
                    <div className="text-4xl font-extrabold mt-2">
                      {outcome.odds.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">Select Chip Value</h3>
                <div className="flex gap-3">
                  {[25, 50, 100, 250, 500, 1000].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`px-6 py-3 rounded-lg font-bold transition-all ${
                        selectedChip === chip
                          ? "bg-yellow-400 text-black scale-110"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      ₹{chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-2xl sticky top-6">
              <h3 className="text-2xl font-bold mb-4">Bet Slip</h3>
              {bets.length === 0 ? (
                <p className="text-white/60 text-center py-8">
                  No bets placed yet
                </p>
              ) : (
                <div className="space-y-3">
                  {bets.map((bet, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold">{bet.selection}</div>
                        <div className="text-sm text-white/70">
                          Odds: {bet.odds}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-400">
                          ₹{bet.stake}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-white/20">
                    <div className="flex justify-between mb-2">
                      <span>Total Stakes:</span>
                      <span className="font-bold">
                        ₹{bets.reduce((sum, b) => sum + b.stake, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 space-y-2">
                <Button
                  onClick={handlePlaceBets}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                  disabled={bets.length === 0}
                >
                  Place All Bets
                </Button>
                <Button
                  onClick={() => setBets([])}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  disabled={bets.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </aside>
          </div>

          {resultData && (
            <div className="mt-8 bg-green-900/30 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4">Latest Result</h3>
              <div className="text-4xl font-extrabold text-yellow-400">
                {resultData.result || "No result yet"}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
