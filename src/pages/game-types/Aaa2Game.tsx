import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { Button } from "@/components/ui/button";
import { Clock, Search, Trophy, Flame, TrendingUp } from "lucide-react";

interface Aaa2GameProps {
  game?: CasinoGame;
}

const VIRTUAL_SPORTS = [
  {
    id: "vhorse",
    name: "Virtual Horse Racing",
    icon: "🐎",
    color: "from-amber-600 to-amber-800",
    status: "LIVE",
    nextRace: "2m 34s",
  },
  {
    id: "vfootball",
    name: "Virtual Football",
    icon: "⚽",
    color: "from-green-600 to-green-800",
    status: "LIVE",
    nextRace: "4m 12s",
  },
  {
    id: "vgreyhound",
    name: "Virtual Greyhounds",
    icon: "🐕",
    color: "from-blue-600 to-blue-800",
    status: "LIVE",
    nextRace: "1m 08s",
  },
  {
    id: "vtennis",
    name: "Virtual Tennis",
    icon: "🎾",
    color: "from-yellow-600 to-yellow-800",
    status: "STARTING",
    nextRace: "0m 23s",
  },
  {
    id: "vbasketball",
    name: "Virtual Basketball",
    icon: "🏀",
    color: "from-orange-600 to-orange-800",
    status: "LIVE",
    nextRace: "3m 45s",
  },
  {
    id: "vcycling",
    name: "Virtual Cycling",
    icon: "🚴",
    color: "from-cyan-600 to-cyan-800",
    status: "LIVE",
    nextRace: "5m 20s",
  },
  {
    id: "vmotorbike",
    name: "Virtual Motorbike Racing",
    icon: "🏍️",
    color: "from-red-600 to-red-800",
    status: "LIVE",
    nextRace: "2m 55s",
  },
  {
    id: "vf1",
    name: "Virtual F1 Racing",
    icon: "🏎️",
    color: "from-purple-600 to-purple-800",
    status: "LIVE",
    nextRace: "6m 10s",
  },
  {
    id: "varchery",
    name: "Virtual Archery",
    icon: "🎯",
    color: "from-pink-600 to-pink-800",
    status: "COMING",
    nextRace: "8m 30s",
  },
  {
    id: "vdarts",
    name: "Virtual Darts",
    icon: "🎯",
    color: "from-indigo-600 to-indigo-800",
    status: "LIVE",
    nextRace: "1m 42s",
  },
  {
    id: "vathletics",
    name: "Virtual Athletics",
    icon: "🏃",
    color: "from-teal-600 to-teal-800",
    status: "LIVE",
    nextRace: "4m 55s",
  },
  {
    id: "vboxing",
    name: "Virtual Boxing",
    icon: "🥊",
    color: "from-rose-600 to-rose-800",
    status: "LIVE",
    nextRace: "7m 18s",
  },
];

export default function Aaa2Game({ game }: Aaa2GameProps) {
  const gameId = game?.gmid || "aaa2";
  const gameName = game?.gname || "AAA 2";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const { gameData } = useCasinoWebSocket(gameId);

  const filteredSports = VIRTUAL_SPORTS.filter(
    (sport) =>
      sport.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "ALL" || sport.status === selectedCategory),
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 border-b border-purple-500/30 p-6 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <div>
                <h1 className="text-yellow-400 font-black text-3xl uppercase">
                  {gameName}
                </h1>
                <p className="text-purple-200 text-sm">
                  Premium Virtual Sports Betting Suite • Live 24/7
                </p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search virtual sports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/50 border border-purple-500/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>
              <div className="flex gap-2">
                {["ALL", "LIVE", "STARTING", "COMING"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                      selectedCategory === cat
                        ? "bg-purple-500 text-white"
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Account Info */}
          <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-slate-400 text-sm mb-1">
                    Available Balance
                  </div>
                  <div className="text-white font-bold text-2xl">
                    ₹12,450.00
                  </div>
                </div>
                <div className="h-12 w-px bg-purple-500/30"></div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Active Bets</div>
                  <div className="text-purple-400 font-bold text-xl">
                    3 Live
                  </div>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400">
                View My Bets
              </Button>
            </div>
          </div>

          {/* Featured Section */}
          {selectedCategory === "ALL" && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-6 h-6 text-orange-400" />
                <h2 className="text-orange-400 font-bold text-xl">
                  Featured Now
                </h2>
              </div>
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 border-2 border-orange-500/50 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-8xl">🏎️</div>
                    <div>
                      <div className="text-white/80 text-sm mb-2 uppercase font-bold">
                        Hot Right Now
                      </div>
                      <h3 className="text-white font-black text-3xl mb-2">
                        Virtual F1 Racing
                      </h3>
                      <p className="text-orange-100 text-lg">
                        Monaco Grand Prix • 20 Laps • Prize Pool: ₹500,000
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/80 text-sm mb-2">
                      Next Race Starts In
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4 mb-4">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-white" />
                      <div className="text-white font-mono text-4xl font-bold">
                        6:10
                      </div>
                    </div>
                    <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg px-8 py-6">
                      Bet Now →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Virtual Sports Grid */}
          <div className="mb-6">
            <h2 className="text-purple-400 font-bold text-xl mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              All Virtual Sports ({filteredSports.length})
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSports.map((sport) => (
              <button
                key={sport.id}
                className="group bg-slate-900/50 border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
              >
                {/* Card Header */}
                <div
                  className={`bg-gradient-to-br ${sport.color} p-6 relative`}
                >
                  <div className="text-7xl mb-4">{sport.icon}</div>
                  <div className="absolute top-4 right-4">
                    {sport.status === "LIVE" && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        LIVE
                      </span>
                    )}
                    {sport.status === "STARTING" && (
                      <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                        STARTING
                      </span>
                    )}
                    {sport.status === "COMING" && (
                      <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        COMING
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-white font-bold text-xl mb-3 group-hover:text-purple-400 transition-colors">
                    {sport.name}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">
                        Next Event
                      </div>
                      <div className="text-white font-bold text-lg flex items-center gap-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        {sport.nextRace}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-xs mb-1">Markets</div>
                      <div className="text-purple-400 font-bold text-lg">
                        {Math.floor(Math.random() * 20) + 10}+
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold group-hover:scale-105 transition-transform">
                    Play Now →
                  </Button>

                  {/* Info Links */}
                  <div className="flex justify-center gap-4 mt-4">
                    <button className="text-purple-400 text-xs hover:underline">
                      Rules
                    </button>
                    <span className="text-slate-600">•</span>
                    <button className="text-purple-400 text-xs hover:underline">
                      Odds Info
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredSports.length === 0 && (
            <div className="text-center py-20">
              <div className="text-slate-600 text-6xl mb-4">🔍</div>
              <div className="text-slate-400 text-xl">
                No virtual sports found
              </div>
              <p className="text-slate-500 text-sm mt-2">
                Try adjusting your search or filter
              </p>
            </div>
          )}

          {/* Recent Payouts Section */}
          <div className="mt-12 bg-slate-900/50 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-yellow-400 font-bold text-xl">
                Recent Big Wins
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  sport: "Virtual Horse Racing",
                  winner: "User***23",
                  amount: 45600,
                  time: "2m ago",
                },
                {
                  sport: "Virtual Football",
                  winner: "Player***89",
                  amount: 38200,
                  time: "5m ago",
                },
                {
                  sport: "Virtual F1 Racing",
                  winner: "Bet***45",
                  amount: 52100,
                  time: "8m ago",
                },
              ].map((win, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-4"
                >
                  <div className="text-slate-400 text-xs mb-1">{win.sport}</div>
                  <div className="text-white font-bold text-lg mb-1">
                    {win.winner}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-yellow-400 font-bold text-xl">
                      ₹{win.amount.toLocaleString()}
                    </div>
                    <div className="text-slate-500 text-xs">{win.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
