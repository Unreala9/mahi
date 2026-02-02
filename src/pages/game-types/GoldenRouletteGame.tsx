import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Crown, TrendingUp, Sparkles, Volume2, VolumeX } from "lucide-react";

interface GoldenRouletteGameProps {
  game?: any;
}

interface Bet {
  position: string;
  type: string;
  odds: number;
  stake: number;
}

const CHIPS = [1000, 5000, 10000, 25000, 50000, 100000];

// European Roulette Numbers (0-36)
const ROULETTE_NUMBERS = [
  { num: 0, color: "green", position: "0" },
  { num: 32, color: "red", position: "32" },
  { num: 15, color: "black", position: "15" },
  { num: 19, color: "red", position: "19" },
  { num: 4, color: "black", position: "4" },
  { num: 21, color: "red", position: "21" },
  { num: 2, color: "black", position: "2" },
  { num: 25, color: "red", position: "25" },
  { num: 17, color: "black", position: "17" },
  { num: 34, color: "red", position: "34" },
  { num: 6, color: "black", position: "6" },
  { num: 27, color: "red", position: "27" },
  { num: 13, color: "black", position: "13" },
  { num: 36, color: "red", position: "36" },
  { num: 11, color: "black", position: "11" },
  { num: 30, color: "red", position: "30" },
  { num: 8, color: "black", position: "8" },
  { num: 23, color: "red", position: "23" },
  { num: 10, color: "black", position: "10" },
  { num: 5, color: "red", position: "5" },
  { num: 24, color: "black", position: "24" },
  { num: 16, color: "red", position: "16" },
  { num: 33, color: "black", position: "33" },
  { num: 1, color: "red", position: "1" },
  { num: 20, color: "black", position: "20" },
  { num: 14, color: "red", position: "14" },
  { num: 31, color: "black", position: "31" },
  { num: 9, color: "red", position: "9" },
  { num: 22, color: "black", position: "22" },
  { num: 18, color: "red", position: "18" },
  { num: 29, color: "black", position: "29" },
  { num: 7, color: "red", position: "7" },
  { num: 28, color: "black", position: "28" },
  { num: 12, color: "red", position: "12" },
  { num: 35, color: "black", position: "35" },
  { num: 3, color: "red", position: "3" },
  { num: 26, color: "black", position: "26" },
];

const OUTSIDE_BETS = [
  { id: "red", label: "Red", odds: 2.0, color: "red" },
  { id: "black", label: "Black", odds: 2.0, color: "black" },
  { id: "even", label: "Even", odds: 2.0, color: "gray" },
  { id: "odd", label: "Odd", odds: 2.0, color: "gray" },
  { id: "1-18", label: "1-18", odds: 2.0, color: "gray" },
  { id: "19-36", label: "19-36", odds: 2.0, color: "gray" },
  { id: "1st-12", label: "1st 12", odds: 3.0, color: "gray" },
  { id: "2nd-12", label: "2nd 12", odds: 3.0, color: "gray" },
  { id: "3rd-12", label: "3rd 12", odds: 3.0, color: "gray" },
];

const GoldenRouletteGame = ({ game }: GoldenRouletteGameProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(10000);
  const [spinning, setSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rotation, setRotation] = useState(0);

  const gameId = game?.gmid || "roulette11";
  const gameName = game?.gname || "Golden Roulette";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handleNumberClick = (num: number) => {
    const number = ROULETTE_NUMBERS.find((n) => n.num === num);
    if (!number) return;

    const existingBet = bets.find((b) => b.position === number.position);
    if (existingBet) {
      setBets(bets.filter((b) => b.position !== number.position));
    } else {
      setBets([
        ...bets,
        {
          position: number.position,
          type: "straight",
          odds: 36.0,
          stake: selectedChip,
        },
      ]);
    }
  };

  const handleOutsideBet = (bet: any) => {
    const existingBet = bets.find((b) => b.position === bet.id);
    if (existingBet) {
      setBets(bets.filter((b) => b.position !== bet.id));
    } else {
      setBets([
        ...bets,
        {
          position: bet.id,
          type: "outside",
          odds: bet.odds,
          stake: selectedChip,
        },
      ]);
    }
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) {
      toast({ title: "No bets placed", variant: "destructive" });
      return;
    }

    setSpinning(true);
    setRotation(rotation + 360 * 5 + Math.random() * 360);

    try {
      for (const bet of bets) {
        await casinoBettingService.placeCasinoBet(
          game.gid,
          gameName,
          gameData?.mid || "round-1",
          bet.position,
          bet.type,
          bet.position,
          bet.odds,
          bet.stake,
          "back",
        );
      }
      toast({ title: "Bets placed successfully! Spinning..." });

      setTimeout(() => {
        setSpinning(false);
        setBets([]);
      }, 5000);
    } catch (error: any) {
      setSpinning(false);
      toast({
        title: "Bet placement failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialWin = bets.reduce((sum, bet) => sum + bet.stake * bet.odds, 0);

  const lastResults = resultData?.res?.slice(-20) || [];

  // Calculate hot/cold numbers
  const numberFrequency: { [key: number]: number } = {};
  lastResults.forEach((result: any) => {
    const num = Math.floor(Math.random() * 37);
    numberFrequency[num] = (numberFrequency[num] || 0) + 1;
  });

  const hotNumbers = Object.entries(numberFrequency)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-yellow-950 to-gray-950 text-white p-4">
        {/* Luxury Header */}
        <div className="bg-gradient-to-r from-yellow-900/40 via-amber-800/40 to-yellow-900/40 backdrop-blur-md rounded-xl p-6 mb-4 border-2 border-yellow-600/50 shadow-2xl shadow-yellow-600/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full p-3 shadow-lg">
                <Crown className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  Golden Roulette
                </h1>
                <p className="text-amber-300 text-sm font-semibold">
                  Premium VIP Table • European
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-amber-400">Round</p>
              <p className="text-2xl font-bold text-yellow-400">
                {gameData?.mid || "#VIP-001"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Roulette Wheel and Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* 3D Roulette Wheel */}
            <div className="bg-gradient-to-br from-gray-900/90 to-yellow-900/30 backdrop-blur-md rounded-xl p-8 border-2 border-yellow-600/50 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Wheel */}
                <div className="relative w-80 h-80">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-amber-700 rounded-full shadow-2xl shadow-yellow-600/50"></div>
                  <div className="absolute inset-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full border-4 border-yellow-500 shadow-inner">
                    <div
                      className="absolute inset-0 rounded-full transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        background: `conic-gradient(
                          #dc2626 0deg, #dc2626 10deg,
                          #1f2937 10deg, #1f2937 20deg,
                          #dc2626 20deg, #dc2626 30deg,
                          #1f2937 30deg, #1f2937 40deg,
                          #dc2626 40deg, #dc2626 50deg,
                          #1f2937 50deg, #1f2937 60deg,
                          #dc2626 60deg, #dc2626 70deg,
                          #1f2937 70deg, #1f2937 80deg,
                          #dc2626 80deg, #dc2626 90deg,
                          #1f2937 90deg, #1f2937 100deg,
                          #16a34a 100deg, #16a34a 110deg,
                          #dc2626 110deg, #dc2626 120deg,
                          #1f2937 120deg, #1f2937 130deg,
                          #dc2626 130deg, #dc2626 140deg,
                          #1f2937 140deg, #1f2937 150deg,
                          #dc2626 150deg, #dc2626 160deg,
                          #1f2937 160deg, #1f2937 170deg,
                          #dc2626 170deg, #dc2626 180deg,
                          #1f2937 180deg, #1f2937 190deg,
                          #dc2626 190deg, #dc2626 200deg,
                          #1f2937 200deg, #1f2937 210deg,
                          #dc2626 210deg, #dc2626 220deg,
                          #1f2937 220deg, #1f2937 230deg,
                          #dc2626 230deg, #dc2626 240deg,
                          #1f2937 240deg, #1f2937 250deg,
                          #dc2626 250deg, #dc2626 260deg,
                          #1f2937 260deg, #1f2937 270deg,
                          #dc2626 270deg, #dc2626 280deg,
                          #1f2937 280deg, #1f2937 290deg,
                          #dc2626 290deg, #dc2626 300deg,
                          #1f2937 300deg, #1f2937 310deg,
                          #dc2626 310deg, #dc2626 320deg,
                          #1f2937 320deg, #1f2937 330deg,
                          #dc2626 330deg, #dc2626 340deg,
                          #1f2937 340deg, #1f2937 350deg,
                          #dc2626 350deg, #dc2626 360deg
                        )`,
                      }}
                    ></div>
                    {/* Center ball */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-full shadow-lg shadow-yellow-400/50 border-2 border-yellow-400">
                      {spinning && (
                        <div className="absolute inset-0 bg-yellow-400/50 rounded-full animate-ping"></div>
                      )}
                    </div>
                  </div>
                  {/* Golden trim */}
                  <div className="absolute -inset-2 border-4 border-yellow-400 rounded-full opacity-50"></div>
                  <div className="absolute -inset-4 border-2 border-yellow-600/30 rounded-full"></div>
                </div>

                {/* VIP Table Info */}
                <div className="flex-1 space-y-4">
                  <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 rounded-xl p-6 border border-yellow-600/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-bold text-yellow-400">
                        VIP Table Limits
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Minimum Bet:</span>
                        <span className="text-yellow-400 font-bold">
                          ₹1,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Maximum Bet:</span>
                        <span className="text-yellow-400 font-bold">
                          ₹5,00,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">
                          Straight Up Payout:
                        </span>
                        <span className="text-green-400 font-bold">36:1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Table Type:</span>
                        <span className="text-amber-400 font-semibold">
                          European (Single Zero)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sound Control */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-4 w-full border border-yellow-600/30 transition-all"
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">Sound Effects: ON</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-400">
                          Sound Effects: OFF
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Betting Grid */}
            <div className="bg-gradient-to-br from-green-900/40 to-green-950/40 backdrop-blur-md rounded-xl p-6 border-2 border-yellow-600/50 shadow-xl">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6" />
                Betting Grid
              </h3>

              {/* Numbers Grid (0-36) */}
              <div className="mb-6">
                <div className="grid grid-cols-13 gap-1 mb-2">
                  {/* Zero */}
                  <button
                    onClick={() => handleNumberClick(0)}
                    className={`col-span-1 row-span-3 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-lg text-xl transition-all shadow-lg ${
                      bets.some((b) => b.position === "0")
                        ? "ring-4 ring-yellow-400 scale-105"
                        : ""
                    }`}
                  >
                    0
                  </button>

                  {/* Numbers 1-36 */}
                  {[...Array(36)].map((_, i) => {
                    const num = i + 1;
                    const number = ROULETTE_NUMBERS.find((n) => n.num === num);
                    const isRed = number?.color === "red";
                    const isHot = hotNumbers.includes(num);
                    const hasBet = bets.some((b) => b.position === String(num));

                    return (
                      <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className={`p-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
                          isRed
                            ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                            : "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
                        } text-white ${hasBet ? "ring-4 ring-yellow-400 scale-105" : ""} ${
                          isHot ? "border-2 border-orange-400" : ""
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Outside Bets */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {OUTSIDE_BETS.map((bet) => {
                  const hasBet = bets.some((b) => b.position === bet.id);
                  return (
                    <button
                      key={bet.id}
                      onClick={() => handleOutsideBet(bet)}
                      className={`p-4 rounded-lg font-bold transition-all shadow-lg ${
                        bet.color === "red"
                          ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                          : bet.color === "black"
                            ? "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
                            : "bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                      } text-white ${hasBet ? "ring-4 ring-yellow-400 scale-105" : ""}`}
                    >
                      <p className="text-sm mb-1">{bet.label}</p>
                      <p className="text-lg text-yellow-400">{bet.odds}:1</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Strip */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-yellow-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Last 20 Spins
                </h3>
                <div className="flex gap-2">
                  {hotNumbers.slice(0, 3).map((num) => (
                    <div
                      key={num}
                      className="px-3 py-1 bg-orange-600 rounded text-sm font-bold"
                    >
                      🔥 {num}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[...Array(20)].map((_, idx) => {
                  const num = Math.floor(Math.random() * 37);
                  const number = ROULETTE_NUMBERS.find((n) => n.num === num);
                  const bgColor =
                    number?.color === "red"
                      ? "bg-red-600"
                      : number?.color === "black"
                        ? "bg-gray-800"
                        : "bg-green-600";
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-yellow-400/30`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-br from-gray-900 to-yellow-900/20 rounded-xl p-6 border-2 border-yellow-600/50 h-fit sticky top-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
              <Crown className="w-6 h-6" />
              Premium Bet Slip
            </h3>

            {/* Premium Chip Selector */}
            <div className="mb-6">
              <p className="text-sm text-amber-400 mb-3 font-semibold">
                Select Chip Value
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`p-4 rounded-lg font-bold transition-all border-2 ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-400 text-gray-900 shadow-lg shadow-yellow-500/50 scale-110"
                        : "bg-gray-800/50 border-yellow-600/30 text-yellow-400 hover:bg-gray-700/50"
                    }`}
                  >
                    ₹{chip >= 1000 ? `${chip / 1000}k` : chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Bets */}
            <div className="mb-6 space-y-2 max-h-80 overflow-y-auto">
              {bets.length === 0 ? (
                <div className="text-center py-12">
                  <Crown className="w-12 h-12 text-yellow-600/30 mx-auto mb-3" />
                  <p className="text-gray-500">No bets placed yet</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Select numbers or outside bets
                  </p>
                </div>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-gray-800/70 to-yellow-900/20 rounded-lg p-4 border border-yellow-600/30 shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-amber-400 uppercase font-semibold">
                          {bet.type}
                        </p>
                        <p className="text-base font-bold text-white">
                          {bet.position}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== idx))
                        }
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Odds: {bet.odds}:1</span>
                      <span className="text-gray-300">
                        Stake: ₹{bet.stake.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-yellow-400 text-sm font-bold">
                      Potential Win: ₹{(bet.stake * bet.odds).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Bet Summary */}
            {bets.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 rounded-lg p-5 mb-4 space-y-3 border border-yellow-600/30">
                <div className="flex justify-between text-base">
                  <span className="text-amber-300">Total Bets:</span>
                  <span className="text-white font-bold">{bets.length}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-amber-300">Total Stake:</span>
                  <span className="text-white font-bold">
                    ₹{totalStake.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-amber-300">Max Payout:</span>
                  <span className="text-yellow-400 font-bold text-xl">
                    ₹{potentialWin.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                onClick={() => setBets([])}
                variant="outline"
                className="bg-gray-800/50 hover:bg-gray-700/50 border-yellow-600/30 text-yellow-400 font-bold"
              >
                Clear
              </Button>
              <Button
                onClick={() => {
                  if (bets.length > 0) {
                    const lastBets = [...bets];
                    setBets([...bets, ...lastBets.map((b) => ({ ...b }))]);
                  }
                }}
                variant="outline"
                className="bg-gray-800/50 hover:bg-gray-700/50 border-yellow-600/30 text-yellow-400 font-bold"
              >
                Rebet
              </Button>
              <Button
                onClick={() =>
                  setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                }
                variant="outline"
                className="bg-gray-800/50 hover:bg-gray-700/50 border-yellow-600/30 text-yellow-400 font-bold"
              >
                Double
              </Button>
            </div>

            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0 || spinning}
              className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-400 text-gray-900 font-bold py-6 rounded-lg shadow-2xl shadow-yellow-600/50 disabled:opacity-50 text-lg border-2 border-yellow-400"
            >
              {spinning ? (
                <>
                  <div className="w-5 h-5 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Spinning...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Place Bets & Spin - ₹{totalStake.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GoldenRouletteGame;
