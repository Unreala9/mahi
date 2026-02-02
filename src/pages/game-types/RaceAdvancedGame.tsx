import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import type { CasinoGame } from "@/types/casino";

interface RaceAdvancedGameProps {
  game: CasinoGame;
}

export default function RaceAdvancedGame({ game }: RaceAdvancedGameProps) {
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
          gameName: game.gname || "Race Advanced",
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

  const horses = [
    { name: "Thunder", color: "from-red-600 to-red-800", odds: 2.5 },
    { name: "Lightning", color: "from-blue-600 to-blue-800", odds: 3.2 },
    { name: "Storm", color: "from-green-600 to-green-800", odds: 4.0 },
    { name: "Phoenix", color: "from-yellow-600 to-yellow-800", odds: 5.5 },
    { name: "Shadow", color: "from-purple-600 to-purple-800", odds: 6.0 },
    { name: "Blaze", color: "from-orange-600 to-orange-800", odds: 7.0 },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Race Advanced Pro
              </h1>
              <p className="text-lg text-green-200 mt-2">
                Professional Horse Racing • Live Odds
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Race ID</div>
              <div className="text-2xl font-mono font-bold">
                {gameData?.mid || "DEMO-RACE-PRO"}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main betting area */}
            <div className="lg:col-span-2 space-y-4">
              {horses.map((horse) => (
                <div
                  key={horse.name}
                  className="bg-black/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${horse.color} flex items-center justify-center font-bold text-2xl`}
                      >
                        {horse.name[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{horse.name}</h3>
                        <p className="text-sm text-white/70">
                          Professional Racehorse
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePlaceBet(horse.name, horse.odds)}
                      className={`bg-gradient-to-br ${horse.color} hover:opacity-80 rounded-lg px-8 py-4 transition-all transform hover:scale-105`}
                    >
                      <div className="text-sm">Win</div>
                      <div className="text-3xl font-extrabold">
                        {horse.odds.toFixed(2)}
                      </div>
                    </button>
                  </div>
                </div>
              ))}

              {/* Chip selector */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-bold mb-3">Select Chip Value</h3>
                <div className="flex gap-3 flex-wrap">
                  {[50, 100, 250, 500, 1000, 2500].map((chip) => (
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
                    <div className="flex justify-between text-green-400">
                      <span>Potential Win:</span>
                      <span className="font-bold">
                        ₹
                        {bets
                          .reduce((sum, b) => sum + b.stake * b.odds, 0)
                          .toFixed(0)}
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
