import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import type { CasinoGame } from "@/types/casino";

interface Teenmuf2GameProps {
  game: CasinoGame;
}

export default function Teenmuf2Game({ game }: Teenmuf2GameProps) {
  const [bets, setBets] = useState<any[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);
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
          gameId: game.gmid,
          gameName: game.gname || "Teen Muflis 2",
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Teen Muflis 2 (Reverse)
              </h1>
              <p className="text-lg text-gray-300 mt-2">
                Lowest Hand Wins • Reverse Rankings
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Round ID</div>
              <div className="text-2xl font-mono font-bold">
                {gameData?.mid || "DEMO-MUFLIS"}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main betting area */}
            <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">
                Place Your Bets (Lowest Wins!)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {["Player A", "Player B"].map((player) => (
                  <button
                    key={player}
                    onClick={() => handlePlaceBet(player, 1.95)}
                    className="bg-gradient-to-br from-gray-700 to-slate-800 hover:from-gray-600 hover:to-slate-700 rounded-lg p-8 transition-all transform hover:scale-105 border-2 border-gray-600"
                  >
                    <div className="text-2xl font-bold">{player}</div>
                    <div className="text-4xl font-extrabold mt-2 text-blue-400">
                      1.95
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      Lowest Hand
                    </div>
                  </button>
                ))}
              </div>

              {/* Side bets */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handlePlaceBet("High Card", 3.5)}
                  className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg p-4 transition-all"
                >
                  <div className="font-bold">High Card</div>
                  <div className="text-2xl font-extrabold mt-1">3.50</div>
                </button>
                <button
                  onClick={() => handlePlaceBet("Pair (Lowest)", 8.0)}
                  className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg p-4 transition-all"
                >
                  <div className="font-bold">Pair (Low)</div>
                  <div className="text-2xl font-extrabold mt-1">8.00</div>
                </button>
                <button
                  onClick={() => handlePlaceBet("Color", 2.0)}
                  className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded-lg p-4 transition-all"
                >
                  <div className="font-bold">Color</div>
                  <div className="text-2xl font-extrabold mt-1">2.00</div>
                </button>
              </div>

              {/* Chip selector */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">Select Chip Value</h3>
                <div className="flex gap-3">
                  {[25, 50, 100, 500, 1000, 2500].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`px-6 py-3 rounded-lg font-bold transition-all ${
                        selectedChip === chip
                          ? "bg-blue-400 text-black scale-110"
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
                        <div className="font-bold text-blue-400">
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
              <div className="text-4xl font-extrabold text-blue-400">
                {resultData.result || "No result yet"}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
