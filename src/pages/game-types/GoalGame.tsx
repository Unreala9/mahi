import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Clock, TrendingUp, Target, AlertCircle } from "lucide-react";

interface Game {
  gmid: string;
  gname?: string;
}

interface GoalGameProps {
  game?: Game;
}

interface Bet {
  market: string;
  selection: string;
  odds: number;
  amount: number;
}

interface Player {
  id: number;
  name: string;
  position: { x: number; y: number };
  odds: number;
}

interface KeyEvent {
  time: number;
  type: "goal" | "yellow" | "corner" | "assist";
  description: string;
  icon: string;
}

const MARKETS = [
  { id: "nextgoal", label: "Next Goal Scorer", type: "player" },
  { id: "teamscore", label: "Team to Score Next", type: "team" },
  { id: "overunder", label: "Over/Under Goals", type: "range" },
  { id: "corners", label: "Corner Kicks", type: "number" },
  { id: "yellowcards", label: "Yellow Cards", type: "number" },
  { id: "assists", label: "Assists", type: "player" },
  { id: "shotstarget", label: "Shots on Target", type: "number" },
  { id: "possession", label: "Possession %", type: "range" },
];

const PLAYERS: Player[] = [
  { id: 1, name: "Ronaldo", position: { x: 70, y: 30 }, odds: 3.5 },
  { id: 2, name: "Messi", position: { x: 75, y: 50 }, odds: 3.2 },
  { id: 3, name: "Neymar", position: { x: 65, y: 70 }, odds: 4.0 },
  { id: 4, name: "Mbappé", position: { x: 80, y: 40 }, odds: 3.8 },
  { id: 5, name: "Haaland", position: { x: 85, y: 55 }, odds: 3.6 },
];

const KEY_EVENTS: KeyEvent[] = [
  { time: 45, type: "goal", description: "GOAL! Ronaldo scores!", icon: "⚽" },
  {
    time: 38,
    type: "yellow",
    description: "Yellow Card - Defender",
    icon: "🟨",
  },
  {
    time: 23,
    type: "corner",
    description: "Corner Kick - Home Team",
    icon: "🚩",
  },
  { time: 12, type: "assist", description: "Assist by Messi", icon: "🎯" },
];

const CHIP_VALUES = [100, 500, 1000, 5000, 10000];

export default function GoalGame({ game }: GoalGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [matchTime, setMatchTime] = useState(47);
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [matchStatus, setMatchStatus] = useState<
    "ongoing" | "halftime" | "fulltime"
  >("ongoing");

  const gameId = game?.gmid || "goal";
  const gameName = game?.gname || "Goal";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 20));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const matchTimer = setInterval(() => {
      setMatchTime((prev) => (prev < 90 ? prev + 1 : 0));
    }, 2000);
    return () => clearInterval(matchTimer);
  }, []);

  const handleBet = (market: string, selection: string, odds: number) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Match is in play",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = {
      market,
      selection,
      odds,
      amount: selectedChip,
    };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet(
      gameId,
      gameData?.mid || "",
      "",
      `${market}_${selection}`,
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

  const getTotalExposure = () => {
    return bets.reduce((sum, b) => sum + b.amount * b.odds, 0);
  };

  const getStatusColor = () => {
    if (matchStatus === "halftime") return "bg-yellow-600";
    if (matchStatus === "fulltime") return "bg-red-600";
    return "bg-green-600";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 p-4">
        <div className="max-w-[1900px] mx-auto">
          {/* Match Header */}
          <div className="bg-gradient-to-r from-blue-900/60 via-green-900/60 to-red-900/60 backdrop-blur-md border-4 border-green-500/60 rounded-3xl p-6 mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Home Team */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-4xl border-4 border-white mb-2">
                    🔵
                  </div>
                  <div className="text-white font-bold text-lg">HOME</div>
                  <div className="text-blue-300 text-sm">Chelsea FC</div>
                </div>

                {/* Score */}
                <div className="text-center px-8">
                  <div className="text-white font-bold text-6xl mb-2">
                    {homeScore} - {awayScore}
                  </div>
                  <div className="text-green-400 text-sm uppercase tracking-wide">
                    {matchTime}'
                  </div>
                  <div
                    className={`${getStatusColor()} text-white px-4 py-1 rounded-full text-xs font-bold mt-2 inline-block`}
                  >
                    {matchStatus === "ongoing" && "LIVE"}
                    {matchStatus === "halftime" && "HALFTIME"}
                    {matchStatus === "fulltime" && "FULL TIME"}
                  </div>
                </div>

                {/* Away Team */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-4xl border-4 border-white mb-2">
                    🔴
                  </div>
                  <div className="text-white font-bold text-lg">AWAY</div>
                  <div className="text-red-300 text-sm">Man United</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-green-300 text-sm">Match ID</div>
                  <div className="text-white font-mono text-xl font-bold">
                    {gameData?.mid || "MTH8472"}
                  </div>
                </div>

                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl border-4 ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-gradient-to-br from-green-600 to-emerald-600 text-white border-green-400"
                  }`}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Field Visualization & Markets - Left & Center */}
            <div className="lg:col-span-3 space-y-4">
              {/* Simplified Field */}
              <div className="bg-gradient-to-br from-green-800/80 to-emerald-900/80 backdrop-blur-md border-4 border-white/40 rounded-3xl p-6 shadow-2xl relative min-h-[300px]">
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full border-4 border-white rounded-3xl"></div>
                  <div className="absolute top-1/2 left-0 right-0 border-t-4 border-white transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-20 h-20 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Players */}
                {PLAYERS.map((player) => (
                  <div
                    key={player.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${player.position.x}%`,
                      top: `${player.position.y}%`,
                    }}
                  >
                    <div className="relative group">
                      <div className="w-10 h-10 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform shadow-xl">
                        <span className="text-xs font-bold">{player.id}</span>
                      </div>
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {player.name} @ {player.odds.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Ball */}
                <div
                  className="absolute w-6 h-6 bg-white rounded-full border-2 border-black shadow-xl"
                  style={{ left: "50%", top: "50%" }}
                >
                  ⚽
                </div>

                {/* Goal Probability Heatmap */}
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur rounded-xl p-4 border-2 border-green-500/40">
                  <div className="text-green-300 font-bold text-sm mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Goal Probability
                  </div>
                  <div className="space-y-1">
                    {PLAYERS.slice(0, 3).map((player) => (
                      <div key={player.id} className="flex items-center gap-2">
                        <span className="text-white text-xs w-16">
                          {player.name}
                        </span>
                        <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full"
                            style={{ width: `${(1 / player.odds) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-yellow-400 text-xs font-bold">
                          {((1 / player.odds) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Betting Markets */}
              <div className="space-y-4">
                <h3 className="text-white font-bold text-2xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Live Betting Markets
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Next Goal Scorer */}
                  <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-md border-2 border-blue-500/40 rounded-2xl p-5 shadow-2xl">
                    <h4 className="text-blue-300 font-bold text-lg mb-4">
                      ⚽ Next Goal Scorer
                    </h4>
                    <div className="space-y-2">
                      {PLAYERS.map((player) => (
                        <button
                          key={player.id}
                          onClick={() =>
                            handleBet("nextgoal", player.name, player.odds)
                          }
                          className="w-full bg-black/40 hover:bg-blue-600/60 rounded-lg p-3 border border-blue-500/30 transition-all hover:scale-105"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold text-sm">
                              {player.name}
                            </span>
                            <span className="text-yellow-400 font-bold text-lg">
                              {player.odds.toFixed(2)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Team to Score Next */}
                  <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-500/40 rounded-2xl p-5 shadow-2xl">
                    <h4 className="text-green-300 font-bold text-lg mb-4">
                      🏆 Team to Score Next
                    </h4>
                    <div className="space-y-3">
                      <button
                        onClick={() =>
                          handleBet("teamscore", "Home Team", 1.85)
                        }
                        className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg p-4 transition-all hover:scale-105 shadow-xl"
                      >
                        <div className="text-white font-bold text-lg mb-1">
                          HOME
                        </div>
                        <div className="text-yellow-400 font-bold text-2xl">
                          1.85
                        </div>
                      </button>
                      <button
                        onClick={() => handleBet("teamscore", "Away Team", 2.1)}
                        className="w-full bg-red-600 hover:bg-red-500 rounded-lg p-4 transition-all hover:scale-105 shadow-xl"
                      >
                        <div className="text-white font-bold text-lg mb-1">
                          AWAY
                        </div>
                        <div className="text-yellow-400 font-bold text-2xl">
                          2.10
                        </div>
                      </button>
                      <button
                        onClick={() => handleBet("teamscore", "No Goal", 5.5)}
                        className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-all hover:scale-105 shadow-xl"
                      >
                        <div className="text-white font-bold text-lg mb-1">
                          NO GOAL
                        </div>
                        <div className="text-yellow-400 font-bold text-2xl">
                          5.50
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Over/Under Goals */}
                  <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                    <h4 className="text-purple-300 font-bold text-lg mb-4">
                      📊 Over/Under Goals
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleBet("overunder", "Over 2.5", 1.75)}
                        className="bg-green-600 hover:bg-green-500 rounded-lg p-3 transition-all"
                      >
                        <div className="text-white font-bold text-sm">
                          Over 2.5
                        </div>
                        <div className="text-yellow-400 font-bold text-xl">
                          1.75
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          handleBet("overunder", "Under 2.5", 2.05)
                        }
                        className="bg-red-600 hover:bg-red-500 rounded-lg p-3 transition-all"
                      >
                        <div className="text-white font-bold text-sm">
                          Under 2.5
                        </div>
                        <div className="text-yellow-400 font-bold text-xl">
                          2.05
                        </div>
                      </button>
                      <button
                        onClick={() => handleBet("overunder", "Over 3.5", 2.8)}
                        className="bg-green-700 hover:bg-green-600 rounded-lg p-3 transition-all"
                      >
                        <div className="text-white font-bold text-sm">
                          Over 3.5
                        </div>
                        <div className="text-yellow-400 font-bold text-xl">
                          2.80
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          handleBet("overunder", "Under 3.5", 1.45)
                        }
                        className="bg-red-700 hover:bg-red-600 rounded-lg p-3 transition-all"
                      >
                        <div className="text-white font-bold text-sm">
                          Under 3.5
                        </div>
                        <div className="text-yellow-400 font-bold text-xl">
                          1.45
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Corner Kicks */}
                  <div className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 backdrop-blur-md border-2 border-yellow-500/40 rounded-2xl p-5 shadow-2xl">
                    <h4 className="text-yellow-300 font-bold text-lg mb-4">
                      🚩 Corner Kicks
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleBet("corners", "Over 8.5", 1.9)}
                        className="w-full bg-black/40 hover:bg-yellow-600/60 rounded-lg p-3 border border-yellow-500/30 transition-all flex items-center justify-between"
                      >
                        <span className="text-white font-semibold">
                          Over 8.5
                        </span>
                        <span className="text-yellow-400 font-bold text-lg">
                          1.90
                        </span>
                      </button>
                      <button
                        onClick={() => handleBet("corners", "Under 8.5", 1.9)}
                        className="w-full bg-black/40 hover:bg-yellow-600/60 rounded-lg p-3 border border-yellow-500/30 transition-all flex items-center justify-between"
                      >
                        <span className="text-white font-semibold">
                          Under 8.5
                        </span>
                        <span className="text-yellow-400 font-bold text-lg">
                          1.90
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Yellow Cards */}
                  <div className="bg-gradient-to-br from-amber-900/60 to-yellow-900/60 backdrop-blur-md border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl">
                    <h4 className="text-amber-300 font-bold text-lg mb-4">
                      🟨 Yellow Cards
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          handleBet("yellowcards", "Over 3.5", 2.1)
                        }
                        className="w-full bg-black/40 hover:bg-amber-600/60 rounded-lg p-3 border border-amber-500/30 transition-all flex items-center justify-between"
                      >
                        <span className="text-white font-semibold">
                          Over 3.5
                        </span>
                        <span className="text-yellow-400 font-bold text-lg">
                          2.10
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          handleBet("yellowcards", "Under 3.5", 1.75)
                        }
                        className="w-full bg-black/40 hover:bg-amber-600/60 rounded-lg p-3 border border-amber-500/30 transition-all flex items-center justify-between"
                      >
                        <span className="text-white font-semibold">
                          Under 3.5
                        </span>
                        <span className="text-yellow-400 font-bold text-lg">
                          1.75
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Assists */}
                  <div className="bg-gradient-to-br from-teal-900/60 to-cyan-900/60 backdrop-blur-md border-2 border-teal-500/40 rounded-2xl p-5 shadow-2xl">
                    <h4 className="text-teal-300 font-bold text-lg mb-4">
                      🎯 Most Assists
                    </h4>
                    <div className="space-y-2">
                      {PLAYERS.slice(0, 3).map((player) => (
                        <button
                          key={player.id}
                          onClick={() =>
                            handleBet("assists", player.name, player.odds + 1)
                          }
                          className="w-full bg-black/40 hover:bg-teal-600/60 rounded-lg p-3 border border-teal-500/30 transition-all flex items-center justify-between"
                        >
                          <span className="text-white font-semibold text-sm">
                            {player.name}
                          </span>
                          <span className="text-yellow-400 font-bold text-lg">
                            {(player.odds + 1).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Commentary Feed */}
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-md border-2 border-gray-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-gray-300 font-bold text-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Live Commentary & Key Events
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {KEY_EVENTS.map((event, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-3 border-l-4 ${
                        event.type === "goal"
                          ? "bg-green-900/40 border-green-500"
                          : event.type === "yellow"
                            ? "bg-yellow-900/40 border-yellow-500"
                            : event.type === "corner"
                              ? "bg-blue-900/40 border-blue-500"
                              : "bg-purple-900/40 border-purple-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{event.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm">
                            {event.description}
                          </div>
                        </div>
                        <div className="text-gray-400 font-mono text-xs">
                          {event.time}'
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip & Chip Selector - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-green-300 font-bold text-xl mb-4">
                  Bet Slip
                </h3>
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-green-300">
                    <div className="text-5xl mb-2">⚽</div>
                    <div className="text-sm">Select markets to bet</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 rounded-lg p-3 border border-green-500/30"
                      >
                        <div className="text-green-300 text-xs mb-1 uppercase">
                          {bet.market}
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
                  <div className="space-y-3 border-t border-green-500/30 pt-3">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Total Stake</span>
                      <span className="font-bold text-yellow-400">
                        ₹{getTotalStake()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm">Total Exposure</span>
                      <span className="font-bold text-green-400">
                        ₹{getTotalExposure().toFixed(0)}
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

                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 text-lg font-bold rounded-xl shadow-2xl">
                      Place Bet
                    </Button>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-green-300 font-bold text-lg mb-4">
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

              {/* Match Timeline */}
              <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-green-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-green-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Match Timeline
                </h3>
                <div className="relative">
                  <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-yellow-500 h-full transition-all"
                      style={{ width: `${(matchTime / 90) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>0'</span>
                    <span>45'</span>
                    <span>90'</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {KEY_EVENTS.slice(0, 3).map((event, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-1 h-1 bg-white rounded-full"
                          style={{ marginLeft: `${(event.time / 90) * 100}%` }}
                        ></div>
                        <span className="text-xs text-white">
                          {event.icon} {event.time}'
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
