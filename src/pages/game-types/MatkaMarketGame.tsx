import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import type { CasinoGame } from "@/types/casino";

interface MatkaMarketGameProps {
  game: CasinoGame;
}

export default function MatkaMarketGame({ game }: MatkaMarketGameProps) {
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
          gameName: game.gname || "Matka Market",
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

  const matkaNumbers = Array.from({ length: 10 }, (_, i) => i);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Matka Market
              </h1>
              <p className="text-lg text-orange-200 mt-2">
                Open / Close • Traditional Satta
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Market ID</div>
              <div className="text-2xl font-mono font-bold">
                {gameData?.mid || "DEMO-MATKA"}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main betting area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Open Market */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-orange-400">
                  Open Market
                </h2>
                <div className="grid grid-cols-5 gap-3">
                  {matkaNumbers.map((num) => (
                    <button
                      key={`open-${num}`}
                      onClick={() => handlePlaceBet(`Open-${num}`, 9.0)}
                      className="bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-lg p-4 transition-all transform hover:scale-105"
                    >
                      <div className="text-3xl font-extrabold">{num}</div>
                      <div className="text-sm mt-1">9.00x</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Market */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-pink-400">
                  Close Market
                </h2>
                <div className="grid grid-cols-5 gap-3">
                  {matkaNumbers.map((num) => (
                    <button
                      key={`close-${num}`}
                      onClick={() => handlePlaceBet(`Close-${num}`, 9.0)}
                      className="bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 rounded-lg p-4 transition-all transform hover:scale-105"
                    >
                      <div className="text-3xl font-extrabold">{num}</div>
                      <div className="text-sm mt-1">9.00x</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chip selector */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-bold mb-3">Select Chip Value</h3>
                <div className="flex gap-3 flex-wrap">
                  {[10, 25, 50, 100, 500, 1000].map((chip) => (
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
