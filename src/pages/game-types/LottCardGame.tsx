import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Ticket, Gift, Sparkles, Zap, Star, Crown } from "lucide-react";

interface LottCardGameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const CARD_GRID = [
  {
    id: 1,
    suit: "♠️",
    value: "A",
    color: "text-blue-400",
    bg: "bg-blue-900/30",
  },
  { id: 2, suit: "♥️", value: "K", color: "text-red-400", bg: "bg-red-900/30" },
  {
    id: 3,
    suit: "♦️",
    value: "Q",
    color: "text-orange-400",
    bg: "bg-orange-900/30",
  },
  {
    id: 4,
    suit: "♣️",
    value: "J",
    color: "text-green-400",
    bg: "bg-green-900/30",
  },
  {
    id: 5,
    suit: "♠️",
    value: "10",
    color: "text-purple-400",
    bg: "bg-purple-900/30",
  },
  {
    id: 6,
    suit: "♥️",
    value: "9",
    color: "text-pink-400",
    bg: "bg-pink-900/30",
  },
  {
    id: 7,
    suit: "♦️",
    value: "8",
    color: "text-yellow-400",
    bg: "bg-yellow-900/30",
  },
  {
    id: 8,
    suit: "♣️",
    value: "7",
    color: "text-cyan-400",
    bg: "bg-cyan-900/30",
  },
  {
    id: 9,
    suit: "♠️",
    value: "6",
    color: "text-indigo-400",
    bg: "bg-indigo-900/30",
  },
];

export default function LottCardGame({ game }: LottCardGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const gameId = game?.gmid || "lottcard";
  const gameName = game?.gname || "Lott Card";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🎫 Draw Closed!", variant: "destructive" });
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

  const handleCardFlip = (cardId: number) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) return;
    try {
      for (const bet of bets) {
        await casinoBettingService.placeCasinoBet({
          gameId: gameId,
          gameName: gameName,
          roundId: gameData?.mid?.toString() || "",
          marketId: bet.sid.toString(),
          marketName: bet.nat,
          selection: bet.nat,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "🎫 Lottery Tickets Purchased!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex flex-col font-sans">
        {/* Lottery Header */}
        <div className="bg-black/80 border-b border-cyan-400/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-cyan-400 font-black text-xl uppercase tracking-wider">
                  {gameName}
                </h1>
                <p className="text-purple-300 text-sm">
                  🎫 Card Lottery Hybrid • Flip & Win! 🎫
                </p>
              </div>
            </div>
            <div className="text-center bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2 rounded-full text-black font-bold">
              <Gift className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xl font-black">{gameData?.lt || 0}s</div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Card Grid Lottery */}
          <div className="bg-gradient-to-r from-black/60 via-purple-900/40 to-black/60 border-2 border-cyan-400/30 rounded-3xl p-6 mb-6 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-2 rounded-full text-black font-bold mb-4">
                <Sparkles className="w-4 h-4" />
                <span>LOTT CARD DRAW #{gameData?.mid}</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-purple-300 text-sm">
                Click cards to flip and reveal winning combinations!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {CARD_GRID.slice(0, 9).map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardFlip(card.id)}
                  className="relative cursor-pointer group"
                >
                  <div
                    className={`w-20 h-28 rounded-xl border-2 border-cyan-400/50 transition-all duration-500 transform hover:scale-110 ${
                      flippedCards.has(card.id)
                        ? `${card.bg} border-cyan-400`
                        : "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600"
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {flippedCards.has(card.id) ? (
                        <div className={`text-center ${card.color}`}>
                          <div className="text-3xl mb-1">{card.suit}</div>
                          <div className="font-bold text-lg">{card.value}</div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <div className="text-2xl mb-1">🎴</div>
                          <div className="text-xs font-bold">FLIP</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {flippedCards.has(card.id) && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                      <Star className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <div className="inline-flex items-center gap-2 text-cyan-400 font-bold">
                <Zap className="w-4 h-4" />
                {flippedCards.size}/9 Cards Revealed
                <Zap className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Lottery Markets */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-cyan-400 font-bold text-lg flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Lottery Betting Markets
              </h2>

              <div className="grid gap-3">
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  return (
                    <div
                      key={market.sid}
                      className="bg-gradient-to-r from-black/50 via-purple-900/30 to-black/50 border border-cyan-400/20 rounded-xl p-4 backdrop-blur-sm hover:border-cyan-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-xl">
                            🎫
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">
                              {market.nat}
                            </div>
                            <div className="text-purple-300 text-sm">
                              Lottery Market
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-cyan-400 font-mono text-3xl font-bold">
                            {market.b || market.bs}
                          </div>
                          <button
                            onClick={() => handleMarketClick(market)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                              activeBet
                                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-xl"
                                : "bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-500 hover:to-cyan-500"
                            }`}
                          >
                            {activeBet ? `₹${activeBet.stake}` : "BUY TICKET"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Winning History */}
              <div className="bg-black/60 border border-cyan-400/20 rounded-xl p-4 mt-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-cyan-400 font-bold">Lucky Winners</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-purple-800/50 to-cyan-800/50 border border-cyan-400/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-cyan-400 text-xs font-bold mb-1">
                        Draw {r.mid || i + 1}
                      </div>
                      <div className="text-2xl mb-1">🎫</div>
                      <div className="text-white font-bold text-sm">
                        {r.val || r.res || "?"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lottery Slip */}
            <div className="lg:col-span-4">
              <div className="bg-black/80 border border-cyan-400/30 rounded-xl p-4 sticky top-4 backdrop-blur-sm">
                <h3 className="text-cyan-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Lottery Slip
                </h3>

                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black"
                          : "bg-purple-800 text-purple-200 border border-cyan-400/20"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-gradient-to-r from-purple-800/50 to-cyan-800/50 border border-cyan-400/20 rounded-lg p-3"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-red-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-purple-300">@ {bet.odds}</span>
                        <span className="text-cyan-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-purple-400 text-center py-4 text-sm">
                      No tickets selected
                    </p>
                  )}
                </div>

                <div className="bg-purple-800/50 border border-cyan-400/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Ticket Cost</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300">Jackpot Prize</span>
                    <span className="text-cyan-400 font-bold">
                      ₹
                      {bets
                        .reduce((s, b) => s + b.stake * b.odds, 0)
                        .toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:via-purple-400 hover:to-pink-400 text-black font-bold h-12 text-lg"
                  >
                    Buy Lottery Tickets
                  </Button>
                  <Button
                    onClick={() => setBets([])}
                    variant="outline"
                    className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Clear Slip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
