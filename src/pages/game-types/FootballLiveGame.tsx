import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import type { CasinoGame } from "@/types/casino";

interface FootballLiveGameProps {
  game: CasinoGame;
}

export default function FootballLiveGame({ game }: FootballLiveGameProps) {
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
          gameName: game.gname || "Football Live",
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
      <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Football Live - Soccer Pro
              </h1>
              <p className="text-lg text-green-200 mt-2">
                Live Soccer Betting • Real-time Odds
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Match ID</div>
              <div className="text-2xl font-mono font-bold">
                {gameData?.mid || "DEMO-SOCCER"}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main betting area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Match Winner */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-green-400">
                  Match Winner
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handlePlaceBet("Team A", 2.1)}
                    className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 rounded-lg p-8 transition-all transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold">Team A</div>
                    <div className="text-4xl font-extrabold mt-2">2.10</div>
                  </button>
                  <button
                    onClick={() => handlePlaceBet("Draw", 3.2)}
                    className="bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-400 hover:to-gray-600 rounded-lg p-8 transition-all transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold">Draw</div>
                    <div className="text-4xl font-extrabold mt-2">3.20</div>
                  </button>
                  <button
                    onClick={() => handlePlaceBet("Team B", 2.8)}
                    className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 rounded-lg p-8 transition-all transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold">Team B</div>
                    <div className="text-4xl font-extrabold mt-2">2.80</div>
                  </button>
                </div>
              </div>

              {/* Total Goals */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                  Total Goals (Over/Under 2.5)
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePlaceBet("Over 2.5", 1.85)}
                    className="bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 rounded-lg p-8 transition-all transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold">Over 2.5</div>
                    <div className="text-4xl font-extrabold mt-2">1.85</div>
                  </button>
                  <button
                    onClick={() => handlePlaceBet("Under 2.5", 1.95)}
                    className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-lg p-8 transition-all transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold">Under 2.5</div>
                    <div className="text-4xl font-extrabold mt-2">1.95</div>
                  </button>
                </div>
              </div>

              {/* Both Teams to Score */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">
                  Both Teams to Score
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePlaceBet("Yes - Both Score", 1.75)}
                    className="bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 rounded-lg p-8 transition-all transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold">Yes</div>
                    <div className="text-4xl font-extrabold mt-2">1.75</div>
                  </button>
                  <button
                    onClick={() => handlePlaceBet("No - Not Both", 2.05)}
                    className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 rounded-lg p-8 transition-all transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold">No</div>
                    <div className="text-4xl font-extrabold mt-2">2.05</div>
                  </button>
                </div>
              </div>

              {/* Chip selector */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-bold mb-3">Select Chip Value</h3>
                <div className="flex gap-3 flex-wrap">
                  {[50, 100, 250, 500, 1000, 2000].map((chip) => (
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
            <aside className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-2xl sticky top-6 h-fit">
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
                        <div className="text-sm text-green-400">
                          Win: ₹{(bet.stake * bet.odds).toFixed(0)}
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
