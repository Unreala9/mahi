import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";

interface Game {
  gmid?: string;
  gname?: string;
}

export default function BeachRouletteGame({ game }: { game?: Game }) {
  const [bets, setBets] = useState<any[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);

  const gameId = game?.gmid || "roulette12";
  const gameName = game?.gname || "Beach Roulette";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    // keep timer if backend supplies lt
  }, [gameData]);

  const handlePlaceBet = async () => {
    if (bets.length === 0)
      return toast({ title: "No bets placed", variant: "destructive" });
    try {
      for (const b of bets) {
        await casinoBettingService.placeCasinoBet({
          gameId: gameId,
          gameName: gameName,
          roundId: gameData?.mid?.toString() || "",
          marketId: (b.sid || b.nat || b.id).toString(),
          marketName: b.nat || b.label || b.id,
          selection: b.nat || b.label || b.id,
          odds: b.odds || 2,
          stake: b.stake || selectedChip,
          betType: "BACK",
        });
      }
      toast({ title: "✅ Bets placed" });
      setBets([]);
    } catch (err: any) {
      toast({
        title: "❌ Bet failed",
        description: err?.message || String(err),
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div
        className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-orange-300 text-white p-6"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(8,145,178,0.12) 0%, rgba(255,165,79,0.06) 100%)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3 shadow-md">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  className="text-yellow-300 fill-current"
                >
                  <circle cx="12" cy="8" r="3" />
                  <path d="M2 20c3-4 7-6 10-6s7 2 10 6H2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Beach Roulette
                </h1>
                <p className="text-emerald-100 text-sm">
                  Seaside VIP • European
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">Round</div>
              <div className="font-mono font-bold">
                {gameData?.mid || "DEMO-BEACH"}
              </div>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <section className="relative">
              {/* stylized wheel frame */}
              <div
                className="mx-auto mb-6 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  background: "linear-gradient(180deg,#fff,#f9f6f2)",
                  border: "6px solid rgba(255,215,140,0.18)",
                }}
              >
                <div
                  className="h-80 flex items-center justify-center"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 20%), linear-gradient(180deg,#ffd89b, #f9b24a)`,
                  }}
                >
                  <div
                    className="w-56 h-56 bg-white rounded-full shadow-inner flex items-center justify-center"
                    style={{ border: "8px solid #f5c876" }}
                  >
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-600 to-black"></div>
                  </div>
                </div>
                <div
                  className="p-4 bg-wood-pattern/70"
                  style={{ backgroundColor: "rgba(31,41,55,0.4)" }}
                >
                  <div className="rounded-xl p-4 bg-black/30 backdrop-blur-sm">
                    {/* betting grid placeholder */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {Array.from({ length: 36 }).map((_, i) => {
                        const num = i + 1;
                        return (
                          <button
                            key={num}
                            onClick={() => {
                              setBets([
                                ...bets,
                                { nat: num.toString(), stake: selectedChip },
                              ]);
                              toast({ title: `Added ${num}` });
                            }}
                            className="bg-white/5 rounded py-3 hover:bg-white/10 transition"
                          >
                            <div className="text-center font-bold">{num}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* controls floating on deck */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {[25, 50, 100, 500, 1000].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedChip(c)}
                      className={`px-4 py-2 rounded-lg font-bold ${selectedChip === c ? "bg-yellow-400 text-black" : "bg-white/10"}`}
                    >
                      ₹{c}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => setBets([])} className="bg-red-600">
                    Clear
                  </Button>
                  <Button onClick={handlePlaceBet} className="bg-emerald-600">
                    Place Bet
                  </Button>
                </div>
              </div>
            </section>

            <aside>
              <div className="bg-white/5 rounded-xl p-4 shadow-lg sticky top-6">
                <h3 className="text-lg font-bold">Bet Slip</h3>
                <div className="text-sm text-white/80 mt-2">
                  {bets.length === 0
                    ? "No bets"
                    : bets.map((b, i) => (
                        <div key={i} className="flex justify-between">
                          {" "}
                          <span>{b.nat}</span> <span>₹{b.stake}</span>
                        </div>
                      ))}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handlePlaceBet}
                    className="w-full bg-yellow-400 text-black"
                  >
                    Place All
                  </Button>
                </div>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
