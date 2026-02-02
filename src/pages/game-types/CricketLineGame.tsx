import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Clock, BarChart3, Target } from "lucide-react";

interface Game {
  gmid: string;
}

interface CricketLineGameProps {
  game: Game;
}

interface Bet {
  type: string;
  selection: string;
  odds: number;
  amount: number;
}

interface RunBand {
  range: string;
  odds: number;
  pool: number;
  color: string;
}

interface WicketBand {
  range: string;
  odds: number;
  pool: number;
}

const RUN_BANDS: RunBand[] = [
  {
    range: "100-110",
    odds: 8.5,
    pool: 12000,
    color: "from-green-600 to-green-800",
  },
  {
    range: "111-120",
    odds: 7.2,
    pool: 18000,
    color: "from-green-500 to-green-700",
  },
  {
    range: "121-130",
    odds: 5.5,
    pool: 25000,
    color: "from-yellow-600 to-yellow-800",
  },
  {
    range: "131-140",
    odds: 4.8,
    pool: 32000,
    color: "from-yellow-500 to-yellow-700",
  },
  {
    range: "141-150",
    odds: 4.2,
    pool: 28000,
    color: "from-orange-600 to-orange-800",
  },
  {
    range: "151-160",
    odds: 5.0,
    pool: 22000,
    color: "from-orange-500 to-orange-700",
  },
  {
    range: "161-170",
    odds: 6.5,
    pool: 15000,
    color: "from-red-600 to-red-800",
  },
  {
    range: "171-180",
    odds: 9.0,
    pool: 10000,
    color: "from-red-500 to-red-700",
  },
];

const WICKET_BANDS: WicketBand[] = [
  { range: "0-3", odds: 12.0, pool: 5000 },
  { range: "4-5", odds: 3.5, pool: 35000 },
  { range: "6-7", odds: 2.8, pool: 48000 },
  { range: "8-10", odds: 4.5, pool: 20000 },
];

const BOUNDARIES = [
  {
    type: "Total Sixes",
    options: [
      { label: "Over 15.5", odds: 1.85 },
      { label: "Under 15.5", odds: 1.95 },
    ],
  },
  {
    type: "Total Fours",
    options: [
      { label: "Over 28.5", odds: 1.9 },
      { label: "Under 28.5", odds: 1.9 },
    ],
  },
];

const CHIP_VALUES = [100, 500, 1000, 5000, 10000];

export default function CricketLineGame({ game }: CricketLineGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [currentScore, setCurrentScore] = useState(127);
  const [currentWickets, setCurrentWickets] = useState(5);
  const [oversRemaining, setOversRemaining] = useState(8.4);

  const { gameData, resultData } = useCasinoWebSocket(game.gmid);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBet = (type: string, selection: string, odds: number) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Match is in play",
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
      game.gmid,
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
    return bets.reduce((sum, b) => sum + b.amount * b.odds, 0);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-black p-4">
        <div className="max-w-[1900px] mx-auto">
          {/* Match Header */}
          <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 backdrop-blur-md border-4 border-blue-500/60 rounded-3xl p-6 mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-blue-300 text-sm uppercase tracking-wide">
                    T20 Match
                  </div>
                  <div className="text-white font-bold text-3xl">
                    India vs Australia
                  </div>
                  <div className="text-yellow-400 text-lg mt-2">
                    Current: {currentScore}/{currentWickets} (
                    {oversRemaining.toFixed(1)} overs left)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-blue-300 text-sm">Match ID</div>
                  <div className="text-white font-mono text-xl font-bold">
                    {gameData?.mid || "CKT9483"}
                  </div>
                </div>

                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl border-4 ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-400"
                  }`}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Run Ladder & Markets - Center */}
            <div className="lg:col-span-3 space-y-4">
              {/* Run Ladder */}
              <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-md border-2 border-blue-500/40 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-blue-300 font-bold text-2xl mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Run Ladder - Predict Final Score
                </h3>
                <div className="space-y-3">
                  {RUN_BANDS.map((band) => (
                    <button
                      key={band.range}
                      onClick={() =>
                        handleBet("runband", band.range, band.odds)
                      }
                      className={`w-full bg-gradient-to-r ${band.color} hover:opacity-90 rounded-xl p-4 shadow-xl border-2 border-white/30 transition-all hover:scale-102 group`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-white font-bold text-2xl">
                            {band.range}
                          </div>
                          <div className="text-white/80 text-sm">
                            Pool: ₹{band.pool.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                            <div className="text-white text-xs">Odds</div>
                            <div className="text-yellow-400 font-bold text-3xl">
                              {band.odds.toFixed(1)}
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            +
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Markets */}
              <div className="grid grid-cols-2 gap-4">
                {/* Wicket Bands */}
                <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                  <h4 className="text-purple-300 font-bold text-lg mb-4">
                    🎯 Total Wickets
                  </h4>
                  <div className="space-y-2">
                    {WICKET_BANDS.map((band) => (
                      <button
                        key={band.range}
                        onClick={() =>
                          handleBet("wickets", band.range, band.odds)
                        }
                        className="w-full bg-black/40 hover:bg-purple-600/60 rounded-lg p-3 border border-purple-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold">
                            {band.range} Wickets
                          </span>
                          <span className="text-yellow-400 font-bold text-lg">
                            {band.odds.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-purple-300 text-xs">
                          Pool: ₹{band.pool.toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Boundaries */}
                <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-500/40 rounded-2xl p-5 shadow-2xl">
                  <h4 className="text-green-300 font-bold text-lg mb-4">
                    ⚡ Boundaries
                  </h4>
                  <div className="space-y-4">
                    {BOUNDARIES.map((boundary) => (
                      <div key={boundary.type}>
                        <div className="text-green-200 text-sm mb-2">
                          {boundary.type}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {boundary.options.map((option) => (
                            <button
                              key={option.label}
                              onClick={() =>
                                handleBet(
                                  "boundaries",
                                  option.label,
                                  option.odds,
                                )
                              }
                              className="bg-black/40 hover:bg-green-600/60 rounded-lg p-3 border border-green-500/30 transition-all"
                            >
                              <div className="text-white font-semibold text-xs mb-1">
                                {option.label}
                              </div>
                              <div className="text-yellow-400 font-bold text-lg">
                                {option.odds.toFixed(2)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player Performance */}
                <div className="bg-gradient-to-br from-orange-900/60 to-red-900/60 backdrop-blur-md border-2 border-orange-500/40 rounded-2xl p-5 shadow-2xl col-span-2">
                  <h4 className="text-orange-300 font-bold text-lg mb-4">
                    🏏 Top Batsman Run Range
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {["0-25", "26-50", "51-75", "76-100"].map((range, idx) => (
                      <button
                        key={range}
                        onClick={() =>
                          handleBet("batsman", range, 3.5 + idx * 0.5)
                        }
                        className="bg-black/40 hover:bg-orange-600/60 rounded-lg p-4 border border-orange-500/30 transition-all hover:scale-105"
                      >
                        <div className="text-white font-bold text-lg mb-1">
                          {range}
                        </div>
                        <div className="text-yellow-400 font-bold text-xl">
                          {(3.5 + idx * 0.5).toFixed(1)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Probability Chart */}
              <div className="bg-gradient-to-br from-indigo-900/60 to-blue-900/60 backdrop-blur-md border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-indigo-300 font-bold text-xl mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Probability Chart - Run Scoring Trends
                </h3>
                <div className="relative h-40">
                  <svg className="w-full h-full" viewBox="0 0 800 160">
                    <defs>
                      <linearGradient
                        id="chartGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#10b981", stopOpacity: 0.8 }}
                        />
                        <stop
                          offset="50%"
                          style={{ stopColor: "#f59e0b", stopOpacity: 0.8 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#ef4444", stopOpacity: 0.8 }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 120 Q 100 100, 200 80 T 400 60 T 600 80 T 800 100"
                      fill="none"
                      stroke="url(#chartGradient)"
                      strokeWidth="4"
                    />
                    <path
                      d="M 0 120 Q 100 100, 200 80 T 400 60 T 600 80 T 800 100 L 800 160 L 0 160 Z"
                      fill="url(#chartGradient)"
                      opacity="0.2"
                    />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-4">
                    <span>100</span>
                    <span>120</span>
                    <span>140</span>
                    <span>160</span>
                    <span>180</span>
                  </div>
                </div>
              </div>

              {/* Similar Match Analyzer */}
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-md border-2 border-gray-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-gray-300 font-bold text-xl mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Similar Match Analyzer
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { venue: "Same Venue", score: "145/7", result: "Won" },
                    { venue: "Similar Pitch", score: "138/6", result: "Lost" },
                    { venue: "Same Teams", score: "152/8", result: "Won" },
                  ].map((match, idx) => (
                    <div
                      key={idx}
                      className="bg-black/40 rounded-lg p-4 border border-gray-500/30"
                    >
                      <div className="text-gray-400 text-xs mb-2">
                        {match.venue}
                      </div>
                      <div className="text-white font-bold text-xl mb-1">
                        {match.score}
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          match.result === "Won"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {match.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip & Chip Selector - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-md border-2 border-blue-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-blue-300 font-bold text-xl mb-4">
                  Bet Slip
                </h3>
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-blue-300">
                    <div className="text-5xl mb-2">🏏</div>
                    <div className="text-sm">Select run bands or markets</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 rounded-lg p-3 border border-blue-500/30"
                      >
                        <div className="text-blue-300 text-xs mb-1 uppercase">
                          {bet.type}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold text-sm">
                            {bet.selection}
                          </span>
                          <span className="text-yellow-400 font-bold text-lg">
                            {bet.odds.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-white font-bold">
                          ₹{bet.amount}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          Return: ₹{(bet.amount * bet.odds).toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bets.length > 0 && (
                  <div className="space-y-3 border-t border-blue-500/30 pt-3">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Total Stake</span>
                      <span className="font-bold text-yellow-400">
                        ₹{getTotalStake()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Potential Return</span>
                      <span className="font-bold text-green-400">
                        ₹{getPotentialReturn().toFixed(0)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setBets([])}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 text-sm rounded-lg"
                      >
                        Clear
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm rounded-lg">
                        Repeat
                      </Button>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 text-lg font-bold rounded-xl shadow-2xl">
                      Place Bet
                    </Button>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-md border-2 border-blue-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-blue-300 font-bold text-lg mb-4">
                  Chip Value
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-4 font-bold text-lg shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-yellow-300 scale-105"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      ₹{value >= 1000 ? `${value / 1000}K` : value}
                      {selectedChip === value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Event Ticker */}
              <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-md border-2 border-blue-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-blue-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Events
                </h3>
                <div className="space-y-2">
                  {[
                    { over: "12.3", event: "SIX! Massive hit!", icon: "6️⃣" },
                    { over: "11.5", event: "WICKET! Caught out", icon: "🎯" },
                    { over: "10.2", event: "FOUR! Beautiful shot", icon: "4️⃣" },
                  ].map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-black/40 rounded-lg p-3 border border-blue-500/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{event.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm">
                            {event.event}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {event.over} overs
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
