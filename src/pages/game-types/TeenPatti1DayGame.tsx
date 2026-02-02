import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import type { CasinoGame } from "@/types/casino";

interface TeenPatti1DayGameProps {
  game?: CasinoGame;
}

export default function TeenPatti1DayGame({ game }: TeenPatti1DayGameProps) {
  const [bets, setBets] = useState<any[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);

  // Use provided game or default to teen62
  const gameId = game?.gmid || "teen62";
  const gameName = game?.gname || "V VIP Teenpatti 1-day";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handlePlaceBet = async (selection: string, odds: number) => {
    const newBet = {
      selection,
      odds,
      stake: selectedChip,
    };
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Teen Patti 1 Day - VIP Tournament
              </h1>
              <p className="text-lg text-purple-200 mt-2">
                High Roller • Daily Championship
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Round ID</div>
              <div className="text-2xl font-mono font-bold">
                {gameData?.mid || "DEMO-TP1DAY"}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main betting area */}
            <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Place Your Bets</h2>
              <div className="grid grid-cols-3 gap-4">
                {["Player A", "Player B", "Player C"].map((player) => (
                  <button
                    key={player}
                    onClick={() => handlePlaceBet(player, 2.0)}
                    className="bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 rounded-lg p-6 transition-all transform hover:scale-105"
                  >
                    <div className="text-xl font-bold">{player}</div>
                    <div className="text-3xl font-extrabold mt-2">2.00</div>
                  </button>
                ))}
              </div>

              {/* Chip selector */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">Select Chip Value</h3>
                <div className="flex gap-3">
                  {[25, 50, 100, 500, 1000, 5000].map((chip) => (
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

            {/* Bet Slip */}
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

          {/* Results section */}
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
