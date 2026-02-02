import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { placeCasinoBet } from "@/services/casino";
import { bettingService } from "@/services/bettingService";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Wifi,
  WifiOff,
  Clock,
  DollarSign,
  Flame,
  Zap,
  History,
  Target,
} from "lucide-react";

interface DragonTigerGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export function DragonTigerGame({ game }: DragonTigerGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [placedBets, setPlacedBets] = useState<any[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [pulseTimer, setPulseTimer] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const { gameData, resultData, isConnected } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000, 25000];

  // Get user ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  // Function to fetch placed bets
  const fetchPlacedBets = async () => {
    if (!userId) return;
    try {
      console.log(
        "[DragonTiger] Fetching placed bets for user:",
        userId,
        "Game:",
        game.gmid,
      );
      const allBets = await bettingService.getMyBets(50, 0);
      console.log("[DragonTiger] All fetched bets:", allBets);

      // Filter for this specific game only
      const thisGameBets = allBets.filter((bet) => {
        const isCasino =
          bet.game_type === "CASINO" ||
          bet.sport === "CASINO" ||
          bet.gameType === "CASINO";
        const isThisGame =
          bet.game_id === game.gmid ||
          bet.gameId === game.gmid ||
          bet.game === game.gname;
        return isCasino && isThisGame;
      });

      console.log(
        "[DragonTiger] Filtered bets for game",
        game.gmid,
        ":",
        thisGameBets,
      );
      setPlacedBets(thisGameBets);
    } catch (error) {
      console.error("[DragonTiger] Error fetching placed bets:", error);
    }
  };

  // Fetch placed bets when user is authenticated
  useEffect(() => {
    if (userId) {
      fetchPlacedBets();
    }
  }, [userId]);

  useEffect(() => {
    const timer = gameData?.lt || 0;
    setPulseTimer(timer <= 10 && timer > 0);
  }, [gameData?.lt]);

  const handleMarketClick = (market: any) => {
    if (market.gstatus === "SUSPENDED") {
      toast({
        title: "⚠️ Market Suspended",
        description: "This market is currently not accepting bets",
        variant: "destructive",
      });
      return;
    }

    const existingBet = bets.find((b) => b.sid === market.sid);
    if (existingBet) {
      setBets(
        bets.map((b) =>
          b.sid === market.sid ? { ...b, stake: b.stake + selectedChip } : b,
        ),
      );
      toast({
        title: "✅ Bet Updated",
        description: `${market.nat}: ₹${existingBet.stake + selectedChip}`,
      });
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
      toast({
        title: "✅ Bet Added",
        description: `${market.nat}: ₹${selectedChip}`,
      });
    }
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) {
      toast({
        title: "No Bets",
        description: "Please select at least one market",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const bet of bets) {
        await placeCasinoBet({
          type: game.gmid,
          mid: gameData?.mid,
          sid: bet.sid,
          stake: bet.stake,
        });
      }

      const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
      const potentialWin = bets.reduce(
        (sum, bet) => sum + bet.stake * bet.odds,
        0,
      );

      toast({
        title: "🎉 Bets Placed Successfully!",
        description: `${bets.length} bet(s) • ₹${totalStake} stake • Potential: ₹${potentialWin.toFixed(2)}`,
        duration: 5000,
      });

      setBets([]);
      // Fetch placed bets to update "My Bets" section
      setTimeout(() => fetchPlacedBets(), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place bets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cards = gameData?.card?.split(",") || [];
  const dragonCard = cards[0];
  const tigerCard = cards[1];

  const mainMarkets =
    gameData?.sub?.filter((m: any) =>
      ["Dragon", "Tiger", "Tie", "Pair"].includes(m.nat),
    ) || [];

  const dragonSideMarkets =
    gameData?.sub?.filter(
      (m: any) => m.nat.includes("Dragon") && !["Dragon"].includes(m.nat),
    ) || [];

  const tigerSideMarkets =
    gameData?.sub?.filter(
      (m: any) => m.nat.includes("Tiger") && !["Tiger"].includes(m.nat),
    ) || [];

  const timer = gameData?.lt || 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-lg">{game.gname}</h1>
              <p className="text-slate-400 text-sm">
                Round ID: {gameData?.mid || "---"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-slate-400 text-xs">Time Left</p>
                <p className="text-2xl font-bold text-yellow-400">{timer}s</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0">
          {/* Main Game Area */}
          <div className="p-6">
            {/* Cards Display */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Dragon */}
              <Card className="bg-gradient-to-br from-red-900 to-red-950 border-red-700 p-6">
                <h3 className="text-white text-xl font-bold mb-4 text-center">
                  DRAGON
                </h3>
                <div className="flex justify-center">
                  {dragonCard ? (
                    <div className="w-24 h-32 bg-white rounded-lg shadow-xl flex items-center justify-center text-4xl">
                      {dragonCard}
                    </div>
                  ) : (
                    <div className="w-24 h-32 bg-slate-700 rounded-lg shadow-xl flex items-center justify-center">
                      <div className="w-16 h-20 border-4 border-dashed border-slate-500 rounded"></div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Tiger */}
              <Card className="bg-gradient-to-br from-blue-900 to-blue-950 border-blue-700 p-6">
                <h3 className="text-white text-xl font-bold mb-4 text-center">
                  TIGER
                </h3>
                <div className="flex justify-center">
                  {tigerCard ? (
                    <div className="w-24 h-32 bg-white rounded-lg shadow-xl flex items-center justify-center text-4xl">
                      {tigerCard}
                    </div>
                  ) : (
                    <div className="w-24 h-32 bg-slate-700 rounded-lg shadow-xl flex items-center justify-center">
                      <div className="w-16 h-20 border-4 border-dashed border-slate-500 rounded"></div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Main Markets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {mainMarkets.map((market: any) => (
                <Button
                  key={market.sid}
                  onClick={() => handleMarketClick(market)}
                  disabled={market.gstatus === "SUSPENDED"}
                  className={`h-24 flex flex-col items-center justify-center text-lg font-bold ${
                    market.nat === "Dragon"
                      ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      : market.nat === "Tiger"
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        : market.nat === "Tie"
                          ? "bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          : "bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  } ${market.gstatus === "SUSPENDED" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-white">{market.nat}</span>
                  <span className="text-yellow-300 text-sm mt-1">
                    {market.b || market.bs || "0.00"}
                  </span>
                  {bets.find((b) => b.sid === market.sid) && (
                    <span className="text-white text-xs mt-1">
                      ₹{bets.find((b) => b.sid === market.sid)?.stake}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Side Markets */}
            <div className="grid grid-cols-2 gap-6">
              {/* Dragon Side Markets */}
              <div>
                <h4 className="text-white font-semibold mb-3">
                  Dragon Markets
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {dragonSideMarkets.map((market: any) => (
                    <Button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      disabled={market.gstatus === "SUSPENDED"}
                      className="h-16 flex flex-col items-center justify-center bg-red-900 hover:bg-red-800"
                      variant="outline"
                    >
                      <span className="text-white text-sm">
                        {market.nat.replace("Dragon ", "")}
                      </span>
                      <span className="text-yellow-300 text-xs">
                        {market.b || market.bs || "0.00"}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tiger Side Markets */}
              <div>
                <h4 className="text-white font-semibold mb-3">Tiger Markets</h4>
                <div className="grid grid-cols-2 gap-2">
                  {tigerSideMarkets.map((market: any) => (
                    <Button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      disabled={market.gstatus === "SUSPENDED"}
                      className="h-16 flex flex-col items-center justify-center bg-blue-900 hover:bg-blue-800"
                      variant="outline"
                    >
                      <span className="text-white text-sm">
                        {market.nat.replace("Tiger ", "")}
                      </span>
                      <span className="text-yellow-300 text-xs">
                        {market.b || market.bs || "0.00"}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Last Results */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Last Results</h4>
              <div className="flex gap-2">
                {resultData?.res
                  ?.slice(0, 10)
                  .map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        result.win === "1"
                          ? "bg-red-600 text-white"
                          : result.win === "2"
                            ? "bg-blue-600 text-white"
                            : "bg-green-600 text-white"
                      }`}
                    >
                      {result.win === "1"
                        ? "D"
                        : result.win === "2"
                          ? "T"
                          : "T"}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Bet Slip Sidebar */}
          <div className="bg-slate-800 border-l border-slate-700 p-4">
            <h3 className="text-white font-bold text-lg mb-4">Bet Slip</h3>

            {/* Chip Selection */}
            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-2">Select Chip Value</p>
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

            {/* Bets List */}
            <div className="space-y-2 mb-4">
              {bets.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No bets selected
                </p>
              ) : (
                bets.map((bet, index) => (
                  <Card
                    key={index}
                    className="p-3 bg-slate-700 border-slate-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-semibold">
                        {bet.nat}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== index))
                        }
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Odds:</span>
                      <span className="text-yellow-400">{bet.odds}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Stake:</span>
                      <span className="text-white">₹{bet.stake}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-slate-600">
                      <span className="text-slate-400">Returns:</span>
                      <span className="text-green-400">
                        ₹{(bet.stake * bet.odds).toFixed(2)}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Total */}
            {bets.length > 0 && (
              <Card className="p-3 bg-slate-900 border-slate-600 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total Stake:</span>
                  <span className="text-yellow-400">
                    ₹{bets.reduce((sum, bet) => sum + bet.stake, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-400 mt-1">
                  <span>Potential Win:</span>
                  <span className="text-green-400">
                    ₹
                    {bets
                      .reduce((sum, bet) => sum + bet.stake * bet.odds, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </Card>
            )}

            {/* Place Bet Button */}
            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
            >
              Place Bet{bets.length > 1 ? "s" : ""}
            </Button>

            <Button
              onClick={() => setBets([])}
              variant="outline"
              className="w-full mt-2"
            >
              Clear All
            </Button>

            {/* My Bets Section */}
            {userId && (
              <div className="mt-6 pt-6 border-t-2 border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-white font-bold">My Bets</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={fetchPlacedBets}
                    className="ml-auto h-6 text-xs text-slate-400 hover:text-white"
                  >
                    Refresh
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {placedBets.length === 0 ? (
                    <Card className="bg-slate-700/50 border-slate-600 p-4 text-center">
                      <Target className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs">
                        No bets placed yet
                      </p>
                    </Card>
                  ) : (
                    placedBets.map((bet, index) => (
                      <Card
                        key={bet.id || index}
                        className="p-2 bg-slate-700 border-slate-600 hover:border-slate-500 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <p className="text-white font-semibold text-xs">
                              {bet.selection || bet.selection_name}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {bet.market_name || bet.market}
                            </p>
                          </div>
                          <div
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              bet.status === "pending"
                                ? "bg-yellow-600/20 text-yellow-400"
                                : bet.status === "won" || bet.status === "win"
                                  ? "bg-green-600/20 text-green-400"
                                  : bet.status === "lost" ||
                                      bet.status === "loss"
                                    ? "bg-red-600/20 text-red-400"
                                    : "bg-slate-600/20 text-slate-400"
                            }`}
                          >
                            {bet.status?.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">
                            ₹{bet.stake} @ {bet.odds}
                          </span>
                          {bet.potential_return && (
                            <span className="text-green-400 font-semibold">
                              ₹{bet.potential_return.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
