import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Star, Play, Film, Music, Sparkles, Award } from "lucide-react";

interface BollywoodGameSuiteProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const BOLLYWOOD_GAMES = [
  {
    id: 1,
    name: "Shah Rukh Slot",
    icon: "🎬",
    color: "from-red-500 to-orange-500",
    celebrity: "SRK",
    status: "HOT",
  },
  {
    id: 2,
    name: "Deepika Roulette",
    icon: "🎭",
    color: "from-pink-500 to-rose-500",
    celebrity: "DP",
    status: "NEW",
  },
  {
    id: 3,
    name: "Ranveer Poker",
    icon: "🎪",
    color: "from-yellow-500 to-red-500",
    celebrity: "RS",
    status: "LIVE",
  },
  {
    id: 4,
    name: "Priyanka Baccarat",
    icon: "💎",
    color: "from-purple-500 to-pink-500",
    celebrity: "PC",
    status: "VIP",
  },
  {
    id: 5,
    name: "Salman Blackjack",
    icon: "🎯",
    color: "from-blue-500 to-cyan-500",
    celebrity: "SK",
    status: "CLASSIC",
  },
  {
    id: 6,
    name: "Alia Teen Patti",
    icon: "🃏",
    color: "from-green-500 to-teal-500",
    celebrity: "AB",
    status: "TRENDING",
  },
];

export default function BollywoodGameSuite({ game }: BollywoodGameSuiteProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [activeGame, setActiveGame] = useState(1);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🎬 Action Cut!", variant: "destructive" });
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
        await casinoBettingService.placeCasinoBet({
          gameId: game.gmid,
          gameName: game.gname,
          roundId: gameData?.mid?.toString() || "",
          marketId: bet.sid.toString(),
          marketName: bet.nat,
          selection: bet.nat,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "🎬 Bollywood Bets Live!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex flex-col font-sans">
        {/* Bollywood Header */}
        <div className="bg-black/80 border-b border-yellow-400/40 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Film className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-yellow-400 font-black text-2xl uppercase tracking-wider">
                  {game.gname}
                </h1>
                <p className="text-pink-300 text-sm">
                  ✨ Celebrity Casino Collection ✨
                </p>
              </div>
            </div>
            <div className="text-center bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2 rounded-full text-black font-bold">
              <Sparkles className="w-4 h-4 mx-auto mb-1" />
              <div className="text-lg font-black">{gameData?.lt || 0}s</div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Game Selection Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {BOLLYWOOD_GAMES.map((bgame) => (
              <div
                key={bgame.id}
                onClick={() => setActiveGame(bgame.id)}
                className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 transform hover:scale-105 ${
                  activeGame === bgame.id
                    ? "border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 shadow-2xl"
                    : "border-white/20 bg-black/40 hover:border-pink-400"
                }`}
              >
                <div
                  className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${
                    bgame.status === "HOT"
                      ? "bg-red-500 text-white"
                      : bgame.status === "NEW"
                        ? "bg-green-500 text-white"
                        : bgame.status === "LIVE"
                          ? "bg-blue-500 text-white"
                          : bgame.status === "VIP"
                            ? "bg-purple-500 text-white"
                            : bgame.status === "TRENDING"
                              ? "bg-pink-500 text-white"
                              : "bg-gray-500 text-white"
                  }`}
                >
                  {bgame.status}
                </div>

                <div className="text-center">
                  <div className="text-4xl mb-2">{bgame.icon}</div>
                  <div className="text-white font-bold text-sm mb-1">
                    {bgame.name}
                  </div>
                  <div
                    className={`text-xs font-bold bg-gradient-to-r ${bgame.color} bg-clip-text text-transparent`}
                  >
                    {bgame.celebrity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Celebrity Showcase & Markets */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-gradient-to-r from-black/60 via-purple-900/40 to-black/60 border border-yellow-400/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">
                    {BOLLYWOOD_GAMES[activeGame - 1]?.icon}
                  </div>
                  <h2 className="text-yellow-400 font-black text-2xl mb-2">
                    {BOLLYWOOD_GAMES[activeGame - 1]?.name}
                  </h2>
                  <p className="text-pink-300">
                    Featuring {BOLLYWOOD_GAMES[activeGame - 1]?.celebrity} •
                    Round #{gameData?.mid}
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <div className="bg-black/50 rounded-lg p-3 text-center border border-yellow-400/20">
                    <Music className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-white text-xs font-bold">MUSIC</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 text-center border border-pink-400/20">
                    <Star className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                    <div className="text-white text-xs font-bold">GLAM</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 text-center border border-orange-400/20">
                    <Award className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <div className="text-white text-xs font-bold">AWARDS</div>
                  </div>
                </div>
              </div>

              <h3 className="text-yellow-400 font-bold text-lg flex items-center gap-2">
                <Play className="w-5 h-5" />
                Celebrity Markets
              </h3>

              <div className="grid gap-3">
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  return (
                    <div
                      key={market.sid}
                      className="bg-gradient-to-r from-black/50 via-purple-900/30 to-black/50 border border-pink-400/20 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                            ⭐
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">
                              {market.nat}
                            </div>
                            <div className="text-pink-300 text-sm">
                              Celebrity Market
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-yellow-400 font-mono text-3xl font-bold">
                            {market.b || market.bs}
                          </div>
                          <button
                            onClick={() => handleMarketClick(market)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                              activeBet
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-xl"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
                            }`}
                          >
                            {activeBet ? `₹${activeBet.stake}` : "STAR BET"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Box Office History */}
              <div className="bg-black/60 border border-yellow-400/20 rounded-xl p-4 mt-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-yellow-400 font-bold">Box Office Hits</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 border border-yellow-400/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-yellow-400 text-xs font-bold mb-1">
                        #{r.mid || i + 1}
                      </div>
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-white font-bold text-sm">
                        {r.val || r.res || "?"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bollywood Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-black/80 border border-yellow-400/30 rounded-xl p-4 sticky top-4 backdrop-blur-sm">
                <h3 className="text-yellow-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Star Slip
                </h3>

                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                          : "bg-purple-800 text-purple-200 border border-pink-400/20"
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
                      className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 border border-pink-400/20 rounded-lg p-3"
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
                        <span className="text-pink-300">@ {bet.odds}</span>
                        <span className="text-yellow-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-pink-400 text-center py-4 text-sm">
                      No star bets selected
                    </p>
                  )}
                </div>

                <div className="bg-purple-800/50 border border-pink-400/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-pink-300">Total Investment</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-pink-300">Blockbuster Return</span>
                    <span className="text-yellow-400 font-bold">
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
                    className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 hover:from-yellow-300 hover:via-pink-400 hover:to-red-400 text-black font-bold h-12 text-lg"
                  >
                    Action! Place Bets
                  </Button>
                  <Button
                    onClick={() => setBets([])}
                    variant="outline"
                    className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Cut! Clear Slip
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
