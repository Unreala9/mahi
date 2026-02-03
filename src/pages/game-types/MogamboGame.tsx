import { useState, useEffect } from "react";
import { CasinoGame } from "@/types/casino";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Clock,
  Skull,
  Trophy,
  Zap,
  Flame,
  Crown,
  TrendingUp,
  Eye,
  Shield,
} from "lucide-react";

interface MogamboGameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function MogamboGame({ game }: MogamboGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [wickednessIndex, setWickednesIndex] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [playerAction, setPlayerAction] = useState<string>("");

  const gameId = game?.gmid || "mogambo";
  const gameName = game?.gname || "Mogambo - Villain Teen Patti";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000, 25000];

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update wickedness index based on aggressive plays
  const increaseWickedness = (amount: number) => {
    setWickednesIndex((prev) => Math.min(prev + amount, 100));
  };

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({
        title: "💀 Market Suspended!",
        description: "The villain awaits...",
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
    increaseWickedness(5);
  };

  const handleAction = async (action: string) => {
    setPlayerAction(action);

    if (action === "RAISE") {
      increaseWickedness(15);
    } else if (action === "ALL_IN") {
      increaseWickedness(30);
    }

    toast({
      title: `😈 ${action.toUpperCase()}!`,
      description: "Wickedness rises...",
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
      toast({
        title: "💀 Bets Placed!",
        description: "The villain approves...",
      });
      setBets([]);
      increaseWickedness(20);
    } catch (error) {
      toast({
        title: "⚠️ Bet Failed",
        description: "Even villains face setbacks",
        variant: "destructive",
      });
    }
  };

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialReturn = bets.reduce(
    (sum, bet) => sum + bet.stake * bet.odds,
    0,
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black relative overflow-hidden">
        {/* Villainous Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`,
            }}
          ></div>
        </div>

        {/* Skull Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <Skull className="w-96 h-96 text-red-500" />
        </div>

        <div className="container mx-auto p-4 relative z-10">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-red-950 via-purple-950 to-black border-2 border-red-800 rounded-lg p-4 shadow-2xl shadow-red-900/50">
              <div className="flex items-center gap-3">
                <Skull className="w-8 h-8 text-red-500 animate-pulse" />
                <div>
                  <h1 className="text-3xl font-black text-red-500 tracking-wider">
                    MOGAMBO TEEN PATTI
                  </h1>
                  <p className="text-purple-300 text-sm font-bold">
                    👑 Where Villains Play
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-500 text-2xl font-black">
                  Round #{gameData?.mid || "---"}
                </div>
                <div className="text-red-400 text-sm">Game ID: {gameId}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Wickedness Index & Hand Rankings */}
            <div className="lg:col-span-3 space-y-4">
              {/* Wickedness Index */}
              <div className="bg-gradient-to-br from-purple-950 via-black to-red-950 border-2 border-purple-700 rounded-xl p-4 shadow-2xl shadow-purple-900/50">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                  <h3 className="text-red-400 font-black text-lg uppercase tracking-wider">
                    Villain Power Meter
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-pulse">
                      {wickednessIndex}%
                    </div>
                    <div className="text-purple-300 text-sm font-bold mt-1">
                      WICKEDNESS INDEX
                    </div>
                  </div>
                  <div className="relative h-4 bg-black rounded-full overflow-hidden border border-red-900">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-red-600 transition-all duration-500 shadow-lg shadow-red-500/50"
                      style={{ width: `${wickednessIndex}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-black/60 border border-red-900 rounded-lg p-2 text-center">
                      <Zap className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                      <div className="text-white text-xs font-bold">
                        Aggression
                      </div>
                      <div className="text-red-400 text-lg font-black">
                        {Math.floor(wickednessIndex / 3)}
                      </div>
                    </div>
                    <div className="bg-black/60 border border-purple-900 rounded-lg p-2 text-center">
                      <Crown className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                      <div className="text-white text-xs font-bold">
                        Dominance
                      </div>
                      <div className="text-purple-400 text-lg font-black">
                        {Math.floor(wickednessIndex / 4)}
                      </div>
                    </div>
                    <div className="bg-black/60 border border-yellow-900 rounded-lg p-2 text-center">
                      <Trophy className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                      <div className="text-white text-xs font-bold">
                        Evil Rank
                      </div>
                      <div className="text-yellow-400 text-lg font-black">
                        #{Math.floor(Math.random() * 50) + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hand Rankings */}
              <div className="bg-gradient-to-br from-black via-red-950 to-purple-950 border-2 border-red-800 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-yellow-400 font-black text-sm uppercase">
                    Hand Rankings
                  </h3>
                </div>
                <div className="space-y-2">
                  {HAND_RANKINGS.map((hand) => (
                    <div
                      key={hand.rank}
                      className="bg-black/60 border border-red-900/50 rounded-lg p-3 hover:border-purple-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{hand.icon}</span>
                          <span className="text-red-400 font-bold text-sm">
                            #{hand.rank}
                          </span>
                        </div>
                        <span className="text-purple-300 font-black text-xs">
                          {hand.name}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs text-right font-mono">
                        {hand.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Game Table */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Game Table */}
              <div className="relative bg-gradient-to-br from-red-950 via-black to-red-950 border-4 border-red-800 rounded-3xl p-8 shadow-2xl shadow-red-900/50 min-h-[600px]">
                {/* Table Felt with Pattern */}
                <div
                  className="absolute inset-4 bg-gradient-to-br from-red-900 to-black rounded-2xl border-4 border-yellow-900/30 shadow-inner"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.4) 0%, transparent 50%)`,
                  }}
                >
                  {/* Skull Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <Skull className="absolute top-10 left-10 w-20 h-20" />
                    <Skull className="absolute top-10 right-10 w-20 h-20" />
                    <Skull className="absolute bottom-10 left-10 w-20 h-20" />
                    <Skull className="absolute bottom-10 right-10 w-20 h-20" />
                  </div>
                </div>

                {/* Player Seats */}
                {PLAYER_SEATS.map((player) => (
                  <div
                    key={player.id}
                    className={`absolute ${player.position} z-10`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative group">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-900 via-black to-red-900 border-3 border-red-700 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-red-900/50 group-hover:shadow-purple-500/50 transition-all">
                          {player.avatar}
                          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-75 blur transition-all"></div>
                        </div>
                        {/* Cards */}
                        <div className="absolute -top-2 -right-2 flex gap-1">
                          <div className="w-6 h-8 bg-red-900 border border-yellow-600 rounded-sm transform -rotate-12 shadow-lg"></div>
                          <div className="w-6 h-8 bg-red-900 border border-yellow-600 rounded-sm transform rotate-12 shadow-lg"></div>
                        </div>
                      </div>
                      <div className="bg-black/80 border border-red-800 rounded-lg px-3 py-1">
                        <div className="text-red-400 text-xs font-bold">
                          {player.name}
                        </div>
                        <div className="text-yellow-500 text-xs font-black text-center">
                          ₹{(Math.random() * 10000 + 5000).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Center Pot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="bg-gradient-to-br from-black via-purple-950 to-black border-4 border-red-600 rounded-2xl p-6 shadow-2xl shadow-purple-900/80 min-w-[280px]">
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                        <h4 className="text-red-400 font-black text-sm uppercase tracking-widest">
                          Villain's Pot
                        </h4>
                        <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                      </div>
                      <div className="relative">
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 animate-pulse">
                          ₹
                          {(
                            gameData?.pot || Math.random() * 50000 + 10000
                          ).toFixed(0)}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-500 blur-xl opacity-50"></div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-purple-300 text-sm">Boot:</div>
                        <div className="text-yellow-400 text-lg font-bold">
                          ₹{gameData?.boot || 100}
                        </div>
                      </div>
                      {/* Countdown Timer */}
                      <div className="mt-4 pt-4 border-t border-red-800">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-500" />
                          <div
                            className={`text-3xl font-black ${countdown < 10 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}
                          >
                            {countdown}s
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Status */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-black/90 border-2 border-purple-700 rounded-full px-6 py-2 shadow-lg shadow-purple-900/50">
                    <div className="text-purple-300 text-sm font-bold text-center">
                      {gameData?.status || "Waiting for Players..."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="bg-gradient-to-r from-black via-red-950 to-black border-2 border-red-800 rounded-xl p-4 shadow-2xl">
                <div className="grid grid-cols-4 gap-3">
                  <Button
                    onClick={() => handleAction("PACK")}
                    className="bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-black border-2 border-gray-600 shadow-lg h-16"
                  >
                    <div className="text-center">
                      <div className="text-lg">🏳️</div>
                      <div className="text-xs">PACK</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleAction("CHAAL")}
                    className="bg-gradient-to-br from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white font-black border-2 border-blue-500 shadow-lg h-16"
                  >
                    <div className="text-center">
                      <div className="text-lg">👁️</div>
                      <div className="text-xs">CHAAL</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleAction("BLIND")}
                    className="bg-gradient-to-br from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white font-black border-2 border-purple-500 shadow-lg h-16"
                  >
                    <div className="text-center">
                      <div className="text-lg">🎭</div>
                      <div className="text-xs">BLIND</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleAction("SHOW")}
                    className="bg-gradient-to-br from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white font-black border-2 border-green-500 shadow-lg h-16"
                  >
                    <div className="text-center">
                      <div className="text-lg">🃏</div>
                      <div className="text-xs">SHOW</div>
                    </div>
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Button
                    onClick={() => handleAction("SIDE_SHOW")}
                    className="bg-gradient-to-br from-yellow-700 to-yellow-900 hover:from-yellow-600 hover:to-yellow-800 text-black font-black border-2 border-yellow-500 shadow-lg"
                  >
                    👀 SIDE SHOW
                  </Button>
                  <Button
                    onClick={() => handleAction("RAISE")}
                    className="bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-black border-2 border-red-500 shadow-lg"
                  >
                    📈 RAISE
                  </Button>
                  <Button
                    onClick={() => handleAction("ALL_IN")}
                    className="bg-gradient-to-br from-purple-700 via-red-700 to-purple-700 hover:from-purple-600 hover:via-red-600 hover:to-purple-600 text-white font-black border-2 border-yellow-500 shadow-lg animate-pulse"
                  >
                    💀 ALL IN
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel - Betting & Hall of Infamy */}
            <div className="lg:col-span-3 space-y-4">
              {/* Chip Selection */}
              <div className="bg-gradient-to-br from-black via-purple-950 to-black border-2 border-purple-700 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-yellow-400 font-black text-sm uppercase">
                    Select Your Weapon
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`relative p-3 rounded-lg font-black text-sm transition-all ${
                        selectedChip === chip
                          ? "bg-gradient-to-br from-yellow-600 to-red-600 border-2 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/50"
                          : "bg-gradient-to-br from-red-900 to-black border border-red-700 hover:border-purple-500"
                      }`}
                    >
                      <div className="text-white">₹{chip}</div>
                      {selectedChip === chip && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg opacity-75 blur"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Slip */}
              {bets.length > 0 && (
                <div className="bg-gradient-to-br from-black via-red-950 to-purple-950 border-2 border-red-700 rounded-xl p-4 shadow-2xl">
                  <h3 className="text-red-400 font-black text-sm uppercase mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Active Bets
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {bets.map((bet, index) => (
                      <div
                        key={index}
                        className="bg-black/60 border border-purple-800 rounded-lg p-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-purple-300 text-xs font-bold">
                            {bet.nat}
                          </div>
                          <button
                            onClick={() =>
                              setBets(bets.filter((_, i) => i !== index))
                            }
                            className="text-red-500 hover:text-red-400 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-white text-sm">₹{bet.stake}</div>
                          <div className="text-yellow-400 text-sm font-bold">
                            @{bet.odds}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-red-800">
                    <div className="flex justify-between mb-2">
                      <span className="text-purple-300 text-xs">
                        Total Stake:
                      </span>
                      <span className="text-white font-bold">
                        ₹{totalStake}
                      </span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-purple-300 text-xs">
                        Potential Return:
                      </span>
                      <span className="text-yellow-400 font-black">
                        ₹{potentialReturn.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handlePlaceBets}
                      className="w-full bg-gradient-to-r from-red-600 via-purple-600 to-red-600 hover:from-red-500 hover:via-purple-500 hover:to-red-500 text-white font-black shadow-lg shadow-purple-900/50 border-2 border-yellow-500"
                    >
                      💀 PLACE BETS
                    </Button>
                  </div>
                </div>
              )}

              {/* Hall of Infamy */}
              <div className="bg-gradient-to-br from-black via-red-950 to-black border-2 border-red-800 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />
                  <h3 className="text-yellow-400 font-black text-sm uppercase">
                    Hall of Infamy
                  </h3>
                </div>
                <div className="space-y-2">
                  {(resultData?.res || Array(5).fill(null))
                    .slice(0, 5)
                    .map((result: any, i: number) => (
                      <div
                        key={i}
                        className="bg-black/60 border border-red-900 rounded-lg p-3 hover:border-purple-700 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {["😈", "💀", "👹", "🔥", "⚡"][i]}
                            </span>
                            <span className="text-red-400 text-xs font-bold">
                              Round #
                              {result?.mid || Math.floor(Math.random() * 1000)}
                            </span>
                          </div>
                          <div className="text-yellow-500 text-xs font-black">
                            ₹
                            {result?.amount ||
                              (Math.random() * 50000 + 10000).toFixed(0)}
                          </div>
                        </div>
                        <div className="text-purple-300 text-xs">
                          {result?.winner || `Villain ${i + 1}`} -{" "}
                          {
                            [
                              "Trail of Aces",
                              "Pure Sequence",
                              "High Pair",
                              "Color Flush",
                              "Sequence",
                            ][i]
                          }
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {result?.time ||
                            `${Math.floor(Math.random() * 60)}m ago`}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Markets */}
              {gameData?.markets && gameData.markets.length > 0 && (
                <div className="bg-gradient-to-br from-black via-purple-950 to-black border-2 border-purple-700 rounded-xl p-4 shadow-2xl">
                  <h3 className="text-purple-400 font-black text-sm uppercase mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Side Bets
                  </h3>
                  <div className="space-y-2">
                    {gameData.markets.slice(0, 4).map((market: any) => (
                      <button
                        key={market.sid}
                        onClick={() => handleMarketClick(market)}
                        disabled={isMarketSuspended(market)}
                        className={`w-full p-3 rounded-lg border-2 transition-all ${
                          isMarketSuspended(market)
                            ? "bg-black/40 border-gray-800 opacity-50 cursor-not-allowed"
                            : "bg-gradient-to-br from-red-900 to-purple-900 border-red-700 hover:border-yellow-500 hover:shadow-lg hover:shadow-purple-500/50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white text-sm font-bold">
                            {market.nat}
                          </span>
                          <span className="text-yellow-400 text-lg font-black">
                            {market.b || market.bs || "-"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
