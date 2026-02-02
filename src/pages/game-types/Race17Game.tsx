import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Zap, Trophy } from "lucide-react";

interface Game {
  gmid: string;
  gname?: string;
}

interface Race17GameProps {
  game?: Game;
}

interface Bet {
  type: string;
  selection: string;
  odds: number;
  amount: number;
}

interface Horse {
  id: number;
  name: string;
  color: string;
  position: number;
  odds: number;
}

const HORSES: Horse[] = [
  { id: 1, name: "Thunder", color: "bg-red-600", position: 0, odds: 3.2 },
  { id: 2, name: "Lightning", color: "bg-blue-600", position: 0, odds: 4.5 },
  { id: 3, name: "Storm", color: "bg-green-600", position: 0, odds: 2.8 },
  { id: 4, name: "Flash", color: "bg-yellow-600", position: 0, odds: 5.0 },
  { id: 5, name: "Bolt", color: "bg-purple-600", position: 0, odds: 3.8 },
];

const RECENT_WINNERS = [
  { raceId: 8471, winner: "Storm", payout: 2.8 },
  { raceId: 8470, winner: "Thunder", payout: 3.2 },
  { raceId: 8469, winner: "Flash", payout: 5.0 },
  { raceId: 8468, winner: "Lightning", payout: 4.5 },
  { raceId: 8467, winner: "Bolt", payout: 3.8 },
];

const CHIP_VALUES = [100, 500, 1000, 5000, 10000];

export default function Race17Game({ game }: Race17GameProps) {
  const gameId = game?.gmid || "race17";
  const gameName = game?.gname || "Race 17";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState(17);
  const [isRacing, setIsRacing] = useState(false);
  const [horses, setHorses] = useState<Horse[]>(HORSES);

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRacing) {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            startRace();
            return 17;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRacing]);

  const startRace = () => {
    setIsRacing(true);
    const raceInterval = setInterval(() => {
      setHorses((prev) =>
        prev.map((horse) => ({
          ...horse,
          position: horse.position + Math.random() * 15 + 5,
        })),
      );
    }, 200);

    setTimeout(() => {
      clearInterval(raceInterval);
      setIsRacing(false);
      setHorses(HORSES);
      setTimeRemaining(17);
      toast({
        title: "Race Finished!",
        description: "Check results",
      });
    }, 3000);
  };

  const handleBet = (type: string, selection: string, odds: number) => {
    if (timeRemaining <= 2 || isRacing) {
      toast({
        title: "Betting Closed",
        description: "Race is starting or in progress",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = {
      type,
      selection,
      odds,
      amount: selectedChip,
    };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet(
      gameId,
      gameData?.mid || "",
      "",
      `${type}_${selection}`,
      selectedChip.toString(),
      selectedChip,
      "0",
      "0",
      "0",
    );

    toast({
      title: "Bet Placed!",
      description: `₹${selectedChip} on ${selection} @ ${odds.toFixed(2)}`,
    });
  };

  const getTotalStake = () => {
    return bets.reduce((sum, b) => sum + b.amount, 0);
  };

  const getPotentialReturn = () => {
    if (bets.length === 0) return 0;
    return Math.max(...bets.map((b) => b.amount * b.odds));
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black p-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-900/60 via-yellow-900/60 to-green-900/60 backdrop-blur-md border-4 border-green-500/60 rounded-3xl p-4 mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
                <div>
                  <div className="text-green-300 text-sm uppercase tracking-wide">
                    17-Second Race
                  </div>
                  <div className="text-white font-bold text-2xl">
                    Ultra-Fast Horse Racing
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-green-300 text-xs">Race ID</div>
                  <div className="text-white font-mono text-xl font-bold">
                    {gameData?.mid || "R8472"}
                  </div>
                </div>

                <div
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-4xl font-bold shadow-2xl border-4 ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : isRacing
                        ? "bg-yellow-600 text-white border-yellow-400 animate-spin"
                        : "bg-gradient-to-br from-green-600 to-emerald-600 text-white border-green-400"
                  }`}
                >
                  {isRacing ? <Zap className="w-12 h-12" /> : timeRemaining}
                  <span className="text-xs mt-1">
                    {isRacing ? "RACING" : "sec"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Race Track */}
          <div className="bg-gradient-to-br from-green-800/80 to-emerald-900/80 backdrop-blur-md border-4 border-yellow-600/60 rounded-3xl p-6 mb-4 shadow-2xl relative overflow-hidden min-h-[300px]">
            {/* Track Lines */}
            <div className="absolute inset-0 flex flex-col justify-around py-6">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className="border-t-2 border-dashed border-white/20"
                ></div>
              ))}
            </div>

            {/* Horses */}
            <div className="relative z-10 space-y-4">
              {horses.map((horse, idx) => (
                <div key={horse.id} className="relative h-12">
                  <div
                    className="absolute transition-all duration-200 ease-linear"
                    style={{ left: `${Math.min(horse.position, 100)}%` }}
                  >
                    <div
                      className={`w-16 h-12 ${horse.color} rounded-lg flex items-center justify-center text-white font-bold shadow-xl border-2 border-white transform hover:scale-110 transition-transform`}
                    >
                      {horse.id}
                    </div>
                  </div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/60 px-3 py-1 rounded-r-lg">
                    <span className="text-white font-semibold text-sm">
                      {horse.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Finish Line */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-yellow-400 via-white to-yellow-400 shadow-2xl"></div>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            {/* Betting Markets - Left & Center */}
            <div className="lg:col-span-3 space-y-4">
              {/* Win Bets */}
              <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-md border-2 border-blue-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-blue-300 font-bold text-xl mb-4">
                  🏆 WIN - Pick the Winner
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {HORSES.map((horse) => (
                    <button
                      key={horse.id}
                      onClick={() => handleBet("win", horse.name, horse.odds)}
                      disabled={isRacing}
                      className={`${horse.color} hover:opacity-90 rounded-xl p-6 shadow-2xl border-2 border-white/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="text-white font-bold text-5xl mb-2">
                        {horse.id}
                      </div>
                      <div className="text-white font-semibold text-sm mb-2">
                        {horse.name}
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2">
                        <div className="text-yellow-400 font-bold text-2xl">
                          {horse.odds.toFixed(1)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exacta & Trifecta */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                  <h3 className="text-purple-300 font-bold text-lg mb-4">
                    🎯 EXACTA - Top 2 in Order
                  </h3>
                  <div className="space-y-2">
                    {[
                      { combo: "1-3", odds: 8.5 },
                      { combo: "3-1", odds: 7.2 },
                      { combo: "1-5", odds: 9.8 },
                      { combo: "3-5", odds: 6.5 },
                    ].map((exacta) => (
                      <button
                        key={exacta.combo}
                        onClick={() =>
                          handleBet("exacta", exacta.combo, exacta.odds)
                        }
                        disabled={isRacing}
                        className="w-full bg-black/40 hover:bg-purple-600/60 rounded-lg p-4 border border-purple-500/30 transition-all disabled:opacity-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-lg">
                            {exacta.combo}
                          </span>
                          <span className="text-yellow-400 font-bold text-2xl">
                            {exacta.odds.toFixed(1)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-900/60 to-red-900/60 backdrop-blur-md border-2 border-orange-500/40 rounded-2xl p-5 shadow-2xl">
                  <h3 className="text-orange-300 font-bold text-lg mb-4">
                    🔥 TRIFECTA - Top 3 in Order
                  </h3>
                  <div className="space-y-2">
                    {[
                      { combo: "1-3-5", odds: 24.5 },
                      { combo: "3-1-5", odds: 22.0 },
                      { combo: "1-5-3", odds: 28.5 },
                      { combo: "3-5-1", odds: 19.8 },
                    ].map((trifecta) => (
                      <button
                        key={trifecta.combo}
                        onClick={() =>
                          handleBet("trifecta", trifecta.combo, trifecta.odds)
                        }
                        disabled={isRacing}
                        className="w-full bg-black/40 hover:bg-orange-600/60 rounded-lg p-4 border border-orange-500/30 transition-all disabled:opacity-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-lg">
                            {trifecta.combo}
                          </span>
                          <span className="text-yellow-400 font-bold text-2xl">
                            {trifecta.odds.toFixed(1)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Forecast */}
              <div className="bg-gradient-to-br from-teal-900/60 to-cyan-900/60 backdrop-blur-md border-2 border-teal-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-teal-300 font-bold text-lg mb-4">
                  💎 FORECAST - Top 2 Any Order
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { combo: "1+3", odds: 5.5 },
                    { combo: "1+5", odds: 6.2 },
                    { combo: "3+5", odds: 4.8 },
                    { combo: "2+4", odds: 7.5 },
                  ].map((forecast) => (
                    <button
                      key={forecast.combo}
                      onClick={() =>
                        handleBet("forecast", forecast.combo, forecast.odds)
                      }
                      disabled={isRacing}
                      className="bg-black/40 hover:bg-teal-600/60 rounded-lg p-4 border border-teal-500/30 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      <div className="text-white font-bold text-xl mb-2">
                        {forecast.combo}
                      </div>
                      <div className="text-yellow-400 font-bold text-2xl">
                        {forecast.odds.toFixed(1)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Results Bar */}
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-md border-2 border-gray-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-gray-300 font-bold text-lg mb-4">
                  📊 Last 5 Race Winners
                </h3>
                <div className="flex gap-4 overflow-x-auto">
                  {RECENT_WINNERS.map((result) => (
                    <div
                      key={result.raceId}
                      className="bg-black/40 rounded-lg p-4 border border-gray-500/30 min-w-[150px]"
                    >
                      <div className="text-gray-400 text-xs mb-1">
                        Race #{result.raceId}
                      </div>
                      <div className="text-white font-bold text-lg mb-1">
                        {result.winner}
                      </div>
                      <div className="text-yellow-400 font-bold">
                        {result.payout.toFixed(1)}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip & Controls - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-green-300 font-bold text-lg mb-3">
                  Bet Slip
                </h3>
                {bets.length === 0 ? (
                  <div className="text-center py-6 text-green-300">
                    <div className="text-4xl mb-2">🏇</div>
                    <div className="text-xs">Select bets</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto mb-3">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 rounded-lg p-2 border border-green-500/30"
                      >
                        <div className="text-green-300 text-xs uppercase">
                          {bet.type}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-sm">
                            {bet.selection}
                          </span>
                          <span className="text-yellow-400 font-bold">
                            {bet.odds.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-white font-bold text-sm">
                          ₹{bet.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bets.length > 0 && (
                  <div className="space-y-2 border-t border-green-500/30 pt-3">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>Total Stake</span>
                      <span className="font-bold text-yellow-400">
                        ₹{getTotalStake()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>Max Return</span>
                      <span className="font-bold text-green-400">
                        ₹{getPotentialReturn().toFixed(0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-500/40 rounded-2xl p-4 shadow-2xl">
                <h3 className="text-green-300 font-bold text-sm mb-3">
                  Chip Value
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-lg p-3 font-bold text-sm shadow-lg transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-yellow-300 scale-105"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      ₹{value >= 1000 ? `${value / 1000}K` : value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-500/40 rounded-2xl p-4 shadow-2xl">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button
                    onClick={() => setBets([])}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 text-sm rounded-lg"
                  >
                    Clear
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm rounded-lg">
                    Repeat
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white py-3 text-sm rounded-lg">
                    Double
                  </Button>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 text-sm rounded-lg font-bold">
                    Place Bet
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
