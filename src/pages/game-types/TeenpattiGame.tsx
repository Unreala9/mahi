import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketActive } from "@/lib/casinoUtils";
import { useCasinoBetting } from "@/services/casinoBettingService";
import { useWalletBalance } from "@/hooks/api/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface TeenpattiGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function TeenpattiGame({ game }: TeenpattiGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [userId, setUserId] = useState<string | undefined>();
  const { gameData, resultData, isConnected } = useCasinoWebSocket(game.gmid);
  const { placeBet } = useCasinoBetting();
  const { data: walletBalance = 0, refetch: refetchBalance } =
    useWalletBalance();

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

  // Get user ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  // Update selected chip if it becomes invalid
  useEffect(() => {
    if (chips.length > 0 && !chips.includes(selectedChip)) {
      setSelectedChip(chips[0]);
    }
  }, [chips, selectedChip]);

  const handleMarketClick = (market: any) => {
    if (market.gstatus === "SUSPENDED") {
      toast({
        title: "Market Suspended",
        description: "This market is currently suspended",
        variant: "destructive",
      });
      return;
    }

    // Toggle bet - remove if already exists
    const existingBetIndex = bets.findIndex((b) => b.sid === market.sid);

    if (existingBetIndex !== -1) {
      // Remove bet
      const updatedBets = bets.filter((b) => b.sid !== market.sid);
      setBets(updatedBets);
      toast({
        title: "❌ Bet Removed",
        description: `${market.nat} removed from bet slip`,
      });
    } else {
      // Add new bet
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
        description: "Please add bets before placing",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "Please login to place bets",
        variant: "destructive",
      });
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const bet of bets) {
        try {
          await placeBet({
            gameType: game.gmid,
            roundId: gameData?.mid || "",
            marketId: bet.sid.toString(),
            marketName: bet.nat,
            stake: bet.stake,
            odds: bet.odds,
            userId: userId,
          });
          successCount++;
        } catch (error) {
          console.error("[TeenpattiGame] Bet failed:", error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "✅ Bets Placed",
          description: `${successCount} bet(s) placed successfully`,
          duration: 5000,
        });
        setBets([]);
        refetchBalance();
      }

      if (failCount > 0) {
        toast({
          title: "Some Bets Failed",
          description: `${failCount} bet(s) could not be placed`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error placing bets",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const cards = gameData?.card?.split(",") || [];
  const playerACards = cards.slice(0, 3);
  const playerBCards = cards.slice(3, 6);

  const mainMarkets =
    gameData?.sub?.filter((m: any) =>
      ["Player A", "Player B", "Tie"].some((name) => m.nat.includes(name)),
    ) || [];

  const sideMarkets =
    gameData?.sub?.filter(
      (m: any) =>
        !["Player A", "Player B", "Tie"].some((name) => m.nat === name),
    ) || [];

  const timer = gameData?.lt || 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-lg">{game.gname}</h1>
              <p className="text-slate-400 text-sm">
                Round ID: {gameData?.mid || "---"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Time Left</p>
              <p className="text-2xl font-bold text-yellow-400">{timer}s</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0">
          {/* Main Game Area */}
          <div className="p-6">
            {/* Cards Display */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Player A */}
              <Card className="bg-gradient-to-br from-blue-900 to-blue-950 border-blue-700 p-6">
                <h3 className="text-white text-xl font-bold mb-4 text-center">
                  PLAYER A
                </h3>
                <div className="flex justify-center gap-2">
                  {playerACards.length > 0
                    ? playerACards.map((card, i) => (
                        <div
                          key={i}
                          className="w-16 h-24 bg-white rounded-lg shadow-xl flex items-center justify-center text-2xl"
                        >
                          {card}
                        </div>
                      ))
                    : [0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-16 h-24 bg-slate-700 rounded-lg shadow-xl flex items-center justify-center"
                        >
                          <div className="w-12 h-16 border-2 border-dashed border-slate-500 rounded"></div>
                        </div>
                      ))}
                </div>
              </Card>

              {/* Player B */}
              <Card className="bg-gradient-to-br from-red-900 to-red-950 border-red-700 p-6">
                <h3 className="text-white text-xl font-bold mb-4 text-center">
                  PLAYER B
                </h3>
                <div className="flex justify-center gap-2">
                  {playerBCards.length > 0
                    ? playerBCards.map((card, i) => (
                        <div
                          key={i}
                          className="w-16 h-24 bg-white rounded-lg shadow-xl flex items-center justify-center text-2xl"
                        >
                          {card}
                        </div>
                      ))
                    : [0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-16 h-24 bg-slate-700 rounded-lg shadow-xl flex items-center justify-center"
                        >
                          <div className="w-12 h-16 border-2 border-dashed border-slate-500 rounded"></div>
                        </div>
                      ))}
                </div>
              </Card>
            </div>

            {/* Main Markets */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {mainMarkets.slice(0, 3).map((market: any) => (
                <Button
                  key={market.sid}
                  onClick={() => handleMarketClick(market)}
                  disabled={market.gstatus === "SUSPENDED"}
                  className={`h-24 flex flex-col items-center justify-center text-lg font-bold ${
                    market.nat.includes("Player A")
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      : market.nat.includes("Player B")
                        ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        : "bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
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
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Side Markets</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {sideMarkets.map((market: any) => (
                  <Button
                    key={market.sid}
                    onClick={() => handleMarketClick(market)}
                    disabled={market.gstatus === "SUSPENDED"}
                    className="h-16 flex flex-col items-center justify-center bg-slate-700 hover:bg-slate-600"
                    variant="outline"
                  >
                    <span className="text-white text-xs text-center">
                      {market.nat}
                    </span>
                    <span className="text-yellow-300 text-xs">
                      {market.b || market.bs || "0.00"}
                    </span>
                  </Button>
                ))}
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
                          ? "bg-blue-600 text-white"
                          : result.win === "2"
                            ? "bg-red-600 text-white"
                            : "bg-green-600 text-white"
                      }`}
                    >
                      {result.win === "1"
                        ? "A"
                        : result.win === "2"
                          ? "B"
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
            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
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
                      <span className="text-white font-semibold text-sm">
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
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Odds:</span>
                      <span className="text-yellow-400">{bet.odds}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Stake:</span>
                      <span className="text-white">₹{bet.stake}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold mt-2 pt-2 border-t border-slate-600">
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
