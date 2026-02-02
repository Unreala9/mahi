import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketActive } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Lucky7GameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function Lucky7Game({ game }: Lucky7GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);

  const gameId = game?.gmid || "lucky5";
  const gameName = game?.gname || "Lucky 7";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  // Generate chip values based on available markets' min/max limits
  const generateChipValues = () => {
    if (!gameData?.sub || gameData.sub.length === 0) {
      return [100, 500, 1000, 5000, 10000];
    }

    const activeMarkets = gameData.sub.filter(isMarketActive);
    if (activeMarkets.length === 0) {
      return [100, 500, 1000, 5000, 10000];
    }

    const minLimit = Math.min(...activeMarkets.map((m: any) => m.min));
    const maxLimit = Math.max(...activeMarkets.map((m: any) => m.max));

    const chips: number[] = [minLimit];
    if (minLimit * 5 <= maxLimit) chips.push(minLimit * 5);
    if (minLimit * 10 <= maxLimit) chips.push(minLimit * 10);
    if (minLimit * 50 <= maxLimit) chips.push(minLimit * 50);
    if (minLimit * 100 <= maxLimit) chips.push(minLimit * 100);
    if (maxLimit > chips[chips.length - 1] * 1.5) chips.push(maxLimit);

    return chips.slice(0, 6);
  };

  const chips = generateChipValues();

  // Update selected chip if it becomes invalid
  useEffect(() => {
    if (chips.length > 0 && !chips.includes(selectedChip)) {
      setSelectedChip(chips[0]);
    }
  }, [chips, selectedChip]);

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
      toast({ title: "Bets Placed Successfully" });
      setBets([]);
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const cards = gameData?.card?.split(",") || [];
  const drawnCard = cards[0];

  // Get main betting markets (Low, 7, High)
  const mainMarkets =
    gameData?.sub?.filter((m: any) => ["Low", "7", "High"].includes(m.nat)) ||
    [];

  // Get other markets
  const otherMarkets =
    gameData?.sub?.filter((m: any) => !["Low", "7", "High"].includes(m.nat)) ||
    [];

  const getBetColor = (marketName: string) => {
    if (marketName === "Low") return "from-blue-600 to-blue-700";
    if (marketName === "7") return "from-green-600 to-green-700";
    if (marketName === "High") return "from-red-600 to-red-700";
    return "from-purple-600 to-purple-700";
  };

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialWin = bets.reduce((sum, bet) => sum + bet.stake * bet.odds, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black">
        {/* Header with Countdown */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white font-bold text-2xl flex items-center gap-3">
                  <span className="text-4xl">🎲</span>
                  LUCKY 7
                </h1>
                <p className="text-purple-300 text-sm">
                  Round ID: {gameData?.mid || "---"}
                </p>
              </div>
              {/* Countdown Bar */}
              <div className="text-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="rgba(139, 92, 246, 0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - (gameData?.lt || 0) / 30)}`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {gameData?.lt || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            {/* Main Game Area */}
            <div className="space-y-6">
              {/* Card Reveal Area */}
              <div className="text-center">
                <h3 className="text-purple-300 font-semibold text-lg mb-4 uppercase tracking-wider">
                  Drawn Card
                </h3>
                <div className="inline-block perspective-1000">
                  {drawnCard ? (
                    <div className="relative">
                      <div className="w-40 h-56 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-purple-500 transform hover:scale-105 transition-transform duration-300">
                        <span className="text-7xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {drawnCard}
                        </span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-40 h-56 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-purple-500/30 border-dashed">
                      <div className="text-center">
                        <div className="text-6xl mb-2">❓</div>
                        <p className="text-purple-400 text-sm">Waiting...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Betting Panels - Below 7, Exactly 7, Above 7 */}
              <div className="grid grid-cols-3 gap-4">
                {mainMarkets.map((market: any) => {
                  const bet = bets.find((b) => b.sid === market.sid);
                  return (
                    <button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      disabled={market.gstatus === "SUSPENDED"}
                      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                        market.gstatus === "SUSPENDED"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-105 cursor-pointer"
                      } ${bet ? "ring-4 ring-yellow-400" : ""}`}
                    >
                      {/* Background Gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${getBetColor(market.nat)} opacity-90`}
                      ></div>

                      {/* Glow Effect */}
                      {bet && (
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent animate-pulse"></div>
                      )}

                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <div className="text-5xl mb-3">
                          {market.nat === "Low"
                            ? "⬇️"
                            : market.nat === "7"
                              ? "7️⃣"
                              : "⬆️"}
                        </div>
                        <h4 className="text-white font-bold text-2xl mb-2">
                          {market.nat === "Low"
                            ? "BELOW 7"
                            : market.nat === "7"
                              ? "EXACTLY 7"
                              : "ABOVE 7"}
                        </h4>
                        <div className="bg-black/30 rounded-lg p-2 mb-2">
                          <p className="text-yellow-300 text-sm">Odds</p>
                          <p className="text-white font-bold text-xl">
                            {market.b || market.bs || "0.00"}x
                          </p>
                        </div>
                        {bet && (
                          <div className="bg-yellow-400 text-black font-bold rounded-lg py-2 px-3">
                            Your Bet: ₹{bet.stake}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Additional Markets */}
              {otherMarkets.length > 0 && (
                <div>
                  <h4 className="text-purple-300 font-semibold mb-3">
                    Additional Bets
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {otherMarkets.map((market: any) => {
                      const bet = bets.find((b) => b.sid === market.sid);
                      return (
                        <button
                          key={market.sid}
                          onClick={() => handleMarketClick(market)}
                          disabled={market.gstatus === "SUSPENDED"}
                          className={`bg-gradient-to-br from-gray-800 to-gray-900 hover:from-purple-800 hover:to-purple-900 rounded-xl p-4 border-2 ${
                            bet ? "border-yellow-400" : "border-purple-500/30"
                          } transition-all`}
                        >
                          <p className="text-white font-semibold text-sm">
                            {market.nat}
                          </p>
                          <p className="text-yellow-300 text-lg font-bold">
                            {market.b || market.bs || "0.00"}x
                          </p>
                          {bet && (
                            <p className="text-yellow-400 text-xs mt-1">
                              ₹{bet.stake}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Results History */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                <h4 className="text-purple-300 font-semibold mb-3">
                  Recent Results
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {resultData?.res
                    ?.slice(0, 15)
                    .map((result: any, index: number) => {
                      const value = result.win;
                      const isLow = value === "1";
                      const is7 = value === "2";
                      const isHigh = value === "3";
                      return (
                        <div
                          key={index}
                          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                            isLow
                              ? "bg-blue-600"
                              : is7
                                ? "bg-green-600"
                                : "bg-red-600"
                          }`}
                        >
                          {isLow ? "L" : is7 ? "7" : "H"}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Bet Slip Sidebar */}
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 h-fit sticky top-4">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Bet Slip
              </h3>

              {/* Chip Selector */}
              <div className="mb-6">
                <p className="text-purple-300 text-sm mb-3">Select Chip</p>
                <div className="grid grid-cols-3 gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`py-3 px-2 rounded-lg font-bold transition-all ${
                        selectedChip === chip
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black scale-105"
                          : "bg-gradient-to-br from-purple-700 to-purple-900 text-white hover:scale-105"
                      }`}
                    >
                      ₹{chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bets List */}
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-purple-400">
                    <p className="text-4xl mb-2">🎯</p>
                    <p>No bets placed</p>
                  </div>
                ) : (
                  bets.map((bet, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-3 border border-purple-500/30"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-semibold">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((_, i) => i !== idx))
                          }
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">Stake:</span>
                        <span className="text-white font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">Odds:</span>
                        <span className="text-yellow-300 font-bold">
                          {bet.odds}x
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-purple-500/30">
                        <span className="text-purple-300">Returns:</span>
                        <span className="text-green-400 font-bold">
                          ₹{(bet.stake * bet.odds).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary */}
              {bets.length > 0 && (
                <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-purple-200">Total Stake:</span>
                    <span className="text-white font-bold text-lg">
                      ₹{totalStake}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Potential Win:</span>
                    <span className="text-green-400 font-bold text-lg">
                      ₹{potentialWin.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg"
                >
                  Place Bet{bets.length > 1 ? "s" : ""}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setBets([])}
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-900/30"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handlePlaceBets}
                    variant="outline"
                    className="border-yellow-500 text-yellow-300 hover:bg-yellow-900/30"
                  >
                    Repeat
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
