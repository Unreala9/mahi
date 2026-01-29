import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { useCasinoBetting } from "@/services/casinoBettingService";
import { useWalletBalance } from "@/hooks/api/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Wifi,
  WifiOff,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
} from "lucide-react";

interface GenericCardGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export function GenericCardGame({ game }: GenericCardGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [pulseTimer, setPulseTimer] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [isDemo, setIsDemo] = useState(false);
  const [demoBalance, setDemoBalance] = useState(0);

  const { gameData, resultData, isConnected, error } = useCasinoWebSocket(
    game.gmid,
  );
  const { placeBet } = useCasinoBetting();
  const {
    data: walletBalance = 0,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useWalletBalance({
    enabled: true,
  });

  const chips = [100, 500, 1000, 5000, 10000, 25000];

  // Get user ID and check demo mode
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
      console.log("[Casino] User ID:", session?.user?.id);
      console.log("[Casino] Is authenticated:", !!session?.user?.id);
    });

    // Check for demo mode
    const demoSession = localStorage.getItem("demo_session") === "true";
    setIsDemo(demoSession);
    console.log("[Casino] Is demo mode:", demoSession);

    if (demoSession) {
      // Get demo balance from localStorage
      try {
        const stored = localStorage.getItem("demo_state");
        if (stored) {
          const parsed = JSON.parse(stored);
          setDemoBalance(Number(parsed?.balance ?? 10000));
          console.log("[Casino] Demo balance:", parsed?.balance);
        } else {
          setDemoBalance(10000);
        }
      } catch {
        setDemoBalance(10000);
      }
    }
  }, []);

  // Debug wallet balance
  useEffect(() => {
    console.log("[Casino] Wallet balance:", walletBalance);
    console.log("[Casino] Is loading balance:", isLoadingBalance);
  }, [walletBalance, isLoadingBalance]);

  // Use demo balance if in demo mode, otherwise use wallet balance
  const balance = isDemo ? demoBalance : walletBalance;

  console.log("[Casino] Final balance used:", balance, "Demo:", isDemo);

  // Pulse animation for timer
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

    // Check if bet already exists
    const existingBetIndex = bets.findIndex((b) => b.sid === market.sid);

    if (existingBetIndex !== -1) {
      // Remove the bet if clicking on it again (toggle off)
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

    if (!isDemo && !userId) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to place bets",
        variant: "destructive",
      });
      return;
    }

    try {
      const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);

      // Check balance
      if (totalStake > balance) {
        toast({
          title: "Insufficient Balance",
          description: `You need ₹${totalStake} but have ₹${balance.toFixed(2)}`,
          variant: "destructive",
        });
        return;
      }

      const potentialWin = bets.reduce(
        (sum, bet) => sum + bet.stake * bet.odds,
        0,
      );

      // Handle demo mode
      if (isDemo) {
        const { demoStore } = await import("@/services/demoStore");

        for (const bet of bets) {
          demoStore.placeBet({
            fixtureName: game.gname,
            marketName: bet.nat,
            outcomeName: bet.nat,
            odds: bet.odds,
            stake: bet.stake,
            potentialReturn: bet.stake * bet.odds,
          });
        }

        toast({
          title: "🎉 Demo Bets Placed!",
          description: `${bets.length} bet(s) placed • ₹${totalStake} stake • Potential: ₹${potentialWin.toFixed(2)}`,
          duration: 5000,
        });
        setBets([]);
        return;
      }

      // Real betting with wallet integration
      if (!userId) {
        toast({
          title: "❌ Not Authenticated",
          description: "Please login to place bets",
          variant: "destructive",
        });
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const bet of bets) {
        const result = await placeBet(
          {
            gameId: game.gmid,
            gameName: game.gname,
            roundId: gameData?.mid || "unknown",
            marketId: gameData?.mid || "unknown",
            marketName: bet.nat,
            selection: bet.nat,
            odds: bet.odds,
            stake: bet.stake,
            betType: "BACK",
          },
          userId,
        );

        if (result) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "🎉 Bets Placed Successfully!",
          description: `${successCount} bet(s) placed • ₹${totalStake} stake • Potential: ₹${potentialWin.toFixed(2)}`,
          duration: 5000,
        });
        setBets([]);
        // Refetch balance to show updated amount
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
          error instanceof Error
            ? error.message
            : "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  const cards = gameData?.card?.split(",") || [];
  const markets = gameData?.sub || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Enhanced Header with Animations */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-2xl">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-xl shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl uppercase tracking-wide">
                    {game.gname}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-400 text-sm">Round ID:</span>
                    <span className="text-purple-400 font-mono font-semibold">
                      {gameData?.mid || "---"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Wifi className="w-5 h-5 text-green-400 animate-pulse" />
                      <span className="text-green-400 text-sm font-semibold">
                        Live
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm font-semibold">
                        Disconnected
                      </span>
                    </>
                  )}
                </div>

                {/* Timer */}
                <div className="text-right bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-400 text-xs">Time Left</p>
                  </div>
                  <p
                    className={`text-3xl font-bold ${pulseTimer ? "text-red-400 animate-pulse" : "text-yellow-400"} transition-colors`}
                  >
                    {gameData?.lt || 0}s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
          `{/* Main Game Area */}
          <div className="p-6 space-y-6">
            {/* Cards Display with Enhanced Animation */}
            {cards.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  Current Cards
                </h3>
                <Card className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-800 border-slate-700 p-6 shadow-2xl">
                  <div className="flex justify-center gap-4 flex-wrap">
                    {cards.map((card, i) => (
                      <div
                        key={i}
                        className="w-20 h-28 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-2xl flex items-center justify-center text-3xl font-bold transform hover:scale-110 transition-all duration-300 border-4 border-white hover:shadow-purple-500/50"
                        style={{
                          animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`,
                        }}
                      >
                        <span className="bg-gradient-to-br from-slate-800 to-slate-900 bg-clip-text text-transparent">
                          {card}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* All Markets with Enhanced Design */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                Available Markets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {markets.map((market: any, index: number) => {
                  // Skip invalid markets
                  if (!market || !market.sid || !market.nat) return null;
                  
                  const betOnThisMarket = bets.find(
                    (b) => b.sid === market.sid,
                  );
                  return (
                    <Button
                      key={`market-${market.sid}-${index}`}
                      onClick={() => handleMarketClick(market)}
                      disabled={market.gstatus === "SUSPENDED"}
                      className={`h-24 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300 transform hover:scale-105 ${
                        betOnThisMarket
                          ? "bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 shadow-lg shadow-emerald-500/50"
                          : "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 shadow-lg shadow-blue-500/30"
                      } ${market.gstatus === "SUSPENDED" ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                      variant="default"
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

                      <span className="text-white font-bold text-sm text-center z-10">
                        {market.nat}
                      </span>
                      <span className="text-yellow-300 text-lg font-bold mt-1 z-10">
                        {market.b || market.bs || "0.00"}
                      </span>
                      {betOnThisMarket && (
                        <span className="text-white text-xs mt-1 bg-black/30 px-2 py-0.5 rounded-full z-10">
                          ₹{betOnThisMarket.stake}
                        </span>
                      )}

                      {/* Active Badge */}
                      {betOnThisMarket && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse z-10"></div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Last Results with Enhanced Visual */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                Last Results
              </h4>
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex gap-3 flex-wrap">
                  {resultData?.res
                    ?.slice(0, 15)
                    .map((result: any, index: number) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-purple-600 to-purple-700 text-white text-sm shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
                        title={`Mid: ${result.mid}, Win: ${result.win}`}
                        style={{
                          animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                        }}
                      >
                        {result.win}
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            {/* Market Info with Enhanced Stats */}
            {markets.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  Market Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600/20 p-3 rounded-lg">
                        <Target className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Total Markets</p>
                        <p className="text-white font-bold text-2xl">
                          {markets.length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600/20 p-3 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Active</p>
                        <p className="text-green-400 font-bold text-2xl">
                          {
                            markets.filter((m: any) => m.gstatus === "ACTIVE")
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600/20 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Suspended</p>
                        <p className="text-red-400 font-bold text-2xl">
                          {
                            markets.filter(
                              (m: any) => m.gstatus === "SUSPENDED",
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
          {/* Enhanced Bet Slip Sidebar */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-l border-slate-700 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl">Bet Slip</h3>
            </div>

            {/* Enhanced Chip Selection */}
            <div className="mb-6">
              <p className="text-slate-300 text-sm mb-3 font-semibold">
                Select Chip Value
              </p>
              <div className="grid grid-cols-3 gap-3">
                {chips.map((chip) => (
                  <Button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    variant={selectedChip === chip ? "default" : "outline"}
                    className={`h-14 relative overflow-hidden font-bold transition-all duration-300 ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white shadow-lg shadow-yellow-500/50 scale-105 border-2 border-yellow-400"
                        : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500"
                    }`}
                  >
                    {selectedChip === chip && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    )}
                    <span className="relative z-10">₹{chip}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Enhanced Bets List */}
            <div className="space-y-3 mb-6 max-h-[calc(100vh-600px)] overflow-y-auto custom-scrollbar">
              {bets.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-slate-700 p-4 rounded-full">
                      <Target className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400">No bets selected</p>
                    <p className="text-slate-500 text-xs">
                      Click on markets to add bets
                    </p>
                  </div>
                </Card>
              ) : (
                bets.map((bet, index) => (
                  <Card
                    key={index}
                    className="p-4 bg-gradient-to-br from-slate-800 to-slate-850 border-slate-600 hover:border-slate-500 transition-all duration-300 hover:shadow-lg"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-white font-bold text-sm">
                        {bet.nat}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== index))
                        }
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Odds:</span>
                        <span className="text-yellow-400 font-bold">
                          {bet.odds}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Stake:</span>
                        <span className="text-white font-semibold">
                          ₹{bet.stake}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-600">
                        <span className="text-slate-400">Potential Win:</span>
                        <span className="text-green-400">
                          ₹{(bet.stake * bet.odds).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Enhanced Total Section */}
            {bets.length > 0 && (
              <Card className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border-slate-600 mb-4 shadow-xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-semibold">
                      Total Stake:
                    </span>
                    <span className="text-yellow-400 font-bold text-xl">
                      ₹{bets.reduce((sum, bet) => sum + bet.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                    <span className="text-slate-300 font-semibold">
                      Potential Win:
                    </span>
                    <span className="text-green-400 font-bold text-xl">
                      ₹
                      {bets
                        .reduce((sum, bet) => sum + bet.stake * bet.odds, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Number of Bets:</span>
                    <span className="text-white font-semibold">
                      {bets.length}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handlePlaceBets}
                disabled={bets.length === 0 || !isConnected}
                className={`w-full h-14 text-white font-bold text-lg relative overflow-hidden group transition-all duration-300 ${
                  bets.length > 0 && isConnected
                    ? "bg-gradient-to-r from-green-600 via-green-700 to-green-600 hover:from-green-700 hover:via-green-800 hover:to-green-700 shadow-lg shadow-green-500/50"
                    : "bg-slate-700"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">
                  {!isConnected
                    ? "🔌 Connecting..."
                    : `🎯 Place Bet${bets.length > 1 ? "s" : ""}`}
                </span>
              </Button>

              <Button
                onClick={() => setBets([])}
                variant="outline"
                className="w-full h-12 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 font-semibold transition-all duration-300"
                disabled={bets.length === 0}
              >
                Clear All Bets
              </Button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .animate-shimmer {
            animation: shimmer 2s infinite;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgb(30, 41, 59);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgb(71, 85, 105);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgb(100, 116, 139);
          }
        `}</style>
      </div>
    </MainLayout>
  );
}

