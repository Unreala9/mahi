import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { placeCasinoBet } from "@/services/casino";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Lucky7GameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export function Lucky7Game({ game }: Lucky7GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (market.gstatus === "SUSPENDED") {
      toast({ title: "Market Suspended", variant: "destructive" });
      return;
    }

    const existingBet = bets.find((b) => b.sid === market.sid);
    if (existingBet) {
      setBets(
        bets.map((b) =>
          b.sid === market.sid ? { ...b, stake: b.stake + selectedChip } : b,
        ),
      );
    } else {
      setBets([
        ...bets,
        {
          sid: market.sid,
          nat: market.nat,
          stake: selectedChip,
          odds: market.b || market.bs || 0,
        },
      ]);
    }
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) return;
    try {
      for (const bet of bets) {
        await placeCasinoBet({
          type: game.gmid,
          mid: gameData?.mid || "",
          sid: bet.sid,
          stake: bet.stake,
        });
      }
      toast({ title: "Bets Placed Successfully" });
      setBets([]);
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const cards = gameData?.card?.split(",") || [];
  const drawnCard = cards[0];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-lg">LUCKY 7</h1>
              <p className="text-slate-400 text-sm">
                Round: {gameData?.mid || "---"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-400">
                {gameData?.lt || 0}s
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]">
          <div className="p-6">
            {/* Lucky 7 Wheel */}
            <div className="text-center mb-6">
              <h3 className="text-yellow-400 font-bold text-2xl mb-4">
                DRAWN CARD
              </h3>
              {drawnCard ? (
                <div className="inline-block w-32 h-44 bg-white rounded-lg shadow-2xl flex items-center justify-center text-6xl border-4 border-yellow-400">
                  {drawnCard}
                </div>
              ) : (
                <div className="inline-block w-32 h-44 bg-slate-700 rounded-lg shadow-2xl flex items-center justify-center">
                  <div className="w-24 h-32 border-4 border-dashed border-slate-500 rounded"></div>
                </div>
              )}
            </div>

            {/* Main Betting Options */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {gameData?.sub
                ?.filter((m: any) => ["Low", "7", "High"].includes(m.nat))
                .map((market: any) => (
                  <Button
                    key={market.sid}
                    onClick={() => handleMarketClick(market)}
                    disabled={market.gstatus === "SUSPENDED"}
                    className={`h-32 text-3xl font-bold ${
                      market.nat === "Low"
                        ? "bg-blue-600"
                        : market.nat === "7"
                          ? "bg-green-600"
                          : "bg-red-600"
                    }`}
                  >
                    <div>
                      <div>{market.nat}</div>
                      <div className="text-lg text-yellow-200">
                        {market.b || market.bs}
                      </div>
                    </div>
                  </Button>
                ))}
            </div>

            {/* Side Markets */}
            <div className="grid grid-cols-4 gap-2">
              {gameData?.sub
                ?.filter((m: any) => !["Low", "7", "High"].includes(m.nat))
                .map((market: any) => (
                  <Button
                    key={market.sid}
                    onClick={() => handleMarketClick(market)}
                    disabled={market.gstatus === "SUSPENDED"}
                    className="h-16 bg-slate-700"
                    variant="outline"
                  >
                    <div className="text-center">
                      <div className="text-white text-xs">{market.nat}</div>
                      <div className="text-yellow-400 text-xs">
                        {market.b || market.bs}
                      </div>
                    </div>
                  </Button>
                ))}
            </div>

            {/* Last Results */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Last Results</h4>
              <div className="flex gap-2">
                {resultData?.res?.slice(0, 10).map((r: any, i: number) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      r.win === "1"
                        ? "bg-blue-600"
                        : r.win === "2"
                          ? "bg-green-600"
                          : "bg-red-600"
                    } text-white`}
                  >
                    {r.win === "1" ? "L" : r.win === "2" ? "7" : "H"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="bg-slate-800 border-l border-slate-700 p-4">
            <h3 className="text-white font-bold text-lg mb-4">Bet Slip</h3>

            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-2">Select Chip</p>
              <div className="grid grid-cols-3 gap-2">
                {chips.map((chip) => (
                  <Button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    variant={selectedChip === chip ? "default" : "outline"}
                    className="h-12"
                  >
                    ₹{chip}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {bets.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No bets</p>
              ) : (
                bets.map((bet, idx) => (
                  <Card key={idx} className="p-3 bg-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-semibold text-sm">
                        {bet.nat}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== idx))
                        }
                        className="h-6 w-6 p-0 text-red-400"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Odds: {bet.odds}</span>
                      <span className="text-white">₹{bet.stake}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {bets.length > 0 && (
              <Card className="p-3 bg-slate-900 mb-4">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-yellow-400">
                    ₹{bets.reduce((s, b) => s + b.stake, 0)}
                  </span>
                </div>
              </Card>
            )}

            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0}
              className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold"
            >
              Place Bets
            </Button>

            <Button
              onClick={() => setBets([])}
              variant="outline"
              className="w-full mt-2"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
