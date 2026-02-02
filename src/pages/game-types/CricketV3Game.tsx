import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  TrendingUp,
  Target,
  Activity,
  Zap,
  MessageSquare,
} from "lucide-react";

interface CricketV3GameProps {
  game?: any;
}

interface Bet {
  market: string;
  selection: string;
  odds: number;
  stake: number;
  category: string;
}

const CHIPS = [100, 500, 1000, 5000, 10000, 50000];

const BALL_MARKETS = [
  { id: "runs-0", label: "0 Runs", odds: 3.2, category: "ball" },
  { id: "runs-1", label: "1 Run", odds: 4.5, category: "ball" },
  { id: "runs-2", label: "2 Runs", odds: 5.0, category: "ball" },
  { id: "runs-4", label: "4 Runs", odds: 6.5, category: "ball" },
  { id: "runs-6", label: "6 Runs", odds: 8.0, category: "ball" },
  { id: "wicket", label: "Wicket", odds: 7.5, category: "ball" },
  { id: "wide", label: "Wide", odds: 9.0, category: "ball" },
  { id: "no-ball", label: "No Ball", odds: 12.0, category: "ball" },
];

const OVER_MARKETS = [
  {
    id: "over-runs-over",
    label: "Over Runs > 6.5",
    odds: 1.95,
    category: "over",
  },
  {
    id: "over-runs-under",
    label: "Over Runs < 6.5",
    odds: 1.85,
    category: "over",
  },
  { id: "maiden-over", label: "Maiden Over", odds: 8.5, category: "over" },
  {
    id: "boundary-over",
    label: "Boundary in Over",
    odds: 2.5,
    category: "over",
  },
  { id: "wicket-over", label: "Wicket in Over", odds: 3.8, category: "over" },
];

const INNINGS_MARKETS = [
  {
    id: "total-runs-over",
    label: "Total Runs > 165.5",
    odds: 1.9,
    category: "innings",
  },
  {
    id: "total-runs-under",
    label: "Total Runs < 165.5",
    odds: 1.9,
    category: "innings",
  },
  {
    id: "total-wickets-over",
    label: "Total Wickets > 5.5",
    odds: 2.0,
    category: "innings",
  },
  {
    id: "total-wickets-under",
    label: "Total Wickets < 5.5",
    odds: 1.8,
    category: "innings",
  },
  {
    id: "total-sixes-over",
    label: "Total 6s > 4.5",
    odds: 2.1,
    category: "innings",
  },
  {
    id: "total-sixes-under",
    label: "Total 6s < 4.5",
    odds: 1.75,
    category: "innings",
  },
];

const PLAYER_MARKETS = [
  {
    id: "kohli-runs-over",
    label: "Kohli Runs > 25.5",
    odds: 1.85,
    category: "player",
  },
  {
    id: "kohli-runs-under",
    label: "Kohli Runs < 25.5",
    odds: 1.95,
    category: "player",
  },
  {
    id: "bumrah-wickets-over",
    label: "Bumrah Wickets > 1.5",
    odds: 2.2,
    category: "player",
  },
  {
    id: "bumrah-wickets-under",
    label: "Bumrah Wickets < 1.5",
    odds: 1.65,
    category: "player",
  },
];

const FIELD_POSITIONS = [
  { x: "82%", y: "45%", name: "Slip" },
  { x: "75%", y: "25%", name: "Cover" },
  { x: "60%", y: "15%", name: "Mid-Off" },
  { x: "50%", y: "10%", name: "Bowler", isActive: true },
  { x: "40%", y: "15%", name: "Mid-On" },
  { x: "25%", y: "35%", name: "Mid-Wicket" },
  { x: "20%", y: "55%", name: "Square" },
  { x: "15%", y: "75%", name: "Fine" },
  { x: "50%", y: "90%", name: "WK" },
  { x: "50%", y: "85%", name: "Bat", isActive: true },
];

const CricketV3Game = ({ game }: CricketV3GameProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(1000);
  const [activeTab, setActiveTab] = useState<
    "ball" | "over" | "innings" | "player"
  >("ball");
  const [bettingCloses, setBettingCloses] = useState(8);

  const gameId = game?.gmid || "cricketv3";
  const gameName = game?.gname || "Cricket V3";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handleMarketClick = (market: any) => {
    const existingBet = bets.find((b) => b.market === market.id);
    if (existingBet) {
      setBets(bets.filter((b) => b.market !== market.id));
    } else {
      setBets([
        ...bets,
        {
          market: market.id,
          selection: market.label,
          odds: market.odds,
          stake: selectedChip,
          category: market.category,
        },
      ]);
    }
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) {
      toast({ title: "No bets placed", variant: "destructive" });
      return;
    }

    try {
      for (const bet of bets) {
        await casinoBettingService.placeCasinoBet({
          gameId: gameId,
          gameName: gameName,
          roundId: gameData?.mid || "round-1",
          marketId: bet.market,
          marketName: bet.selection,
          selection: bet.selection,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "Bets placed successfully!" });
      setBets([]);
    } catch (error: any) {
      toast({
        title: "Bet placement failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialWin = bets.reduce((sum, bet) => sum + bet.stake * bet.odds, 0);

  const ballHistory = resultData?.res?.slice(-15) || [];

  const getCurrentMarkets = () => {
    switch (activeTab) {
      case "ball":
        return BALL_MARKETS;
      case "over":
        return OVER_MARKETS;
      case "innings":
        return INNINGS_MARKETS;
      case "player":
        return PLAYER_MARKETS;
      default:
        return BALL_MARKETS;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-green-950 text-white p-4">
        {/* Match Header */}
        <div className="bg-gradient-to-r from-blue-800/40 to-green-800/40 backdrop-blur-md rounded-xl p-4 mb-4 border border-blue-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Scoreboard */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-400">
                    India vs Australia
                  </h2>
                  <p className="text-gray-400 text-sm">
                    T20 International • Live • Ball-by-Ball
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">India</span>
                  <span className="text-3xl font-bold text-white">165/4</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mb-3">
                  <span>Overs: 15.3 / 20</span>
                  <span>RR: 10.97</span>
                  <span>Target: 186</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-900/30 p-2 rounded">
                    <p className="text-xs text-gray-400">Req. RR</p>
                    <p className="text-lg font-bold text-orange-400">11.45</p>
                  </div>
                  <div className="bg-blue-900/30 p-2 rounded">
                    <p className="text-xs text-gray-400">Last 5 Ov</p>
                    <p className="text-lg font-bold text-green-400">58/1</p>
                  </div>
                  <div className="bg-blue-900/30 p-2 rounded">
                    <p className="text-xs text-gray-400">Partnership</p>
                    <p className="text-lg font-bold text-blue-400">32 (18)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Field Visualization */}
            <div
              className="bg-green-900/20 rounded-xl p-4 border border-green-500/30 relative"
              style={{ height: "200px" }}
            >
              <h4 className="text-sm font-semibold text-green-400 mb-2">
                Field Positions
              </h4>
              <div className="absolute inset-4 border-2 border-green-500/30 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.15) 50%, transparent 100%)",
                  }}
                ></div>
                {FIELD_POSITIONS.map((pos, idx) => (
                  <div
                    key={idx}
                    className={`absolute rounded-full border-2 ${
                      pos.isActive
                        ? "w-4 h-4 bg-yellow-400 border-white shadow-lg shadow-yellow-400/50"
                        : "w-3 h-3 bg-green-400 border-white shadow-md"
                    }`}
                    style={{
                      left: pos.x,
                      top: pos.y,
                      transform: "translate(-50%, -50%)",
                    }}
                    title={pos.name}
                  />
                ))}
                <div className="absolute left-1/2 top-1/2 w-1 h-16 bg-white/30 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Markets Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Market Category Tabs */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-2 border border-gray-700/30 flex gap-2">
              {[
                {
                  id: "ball",
                  label: "Ball Markets",
                  icon: <Zap className="w-4 h-4" />,
                },
                {
                  id: "over",
                  label: "Over Markets",
                  icon: <Activity className="w-4 h-4" />,
                },
                {
                  id: "innings",
                  label: "Innings",
                  icon: <TrendingUp className="w-4 h-4" />,
                },
                {
                  id: "player",
                  label: "Players",
                  icon: <Target className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Betting Closes Timer */}
            <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 backdrop-blur-md rounded-xl p-4 border border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-red-400 animate-pulse" />
                <div>
                  <p className="text-sm text-gray-300">Betting Closes In</p>
                  <p className="text-3xl font-bold text-white">
                    {bettingCloses}s
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Next Ball</p>
                <p className="text-lg font-semibold text-orange-400">
                  Over 15.4
                </p>
              </div>
            </div>

            {/* Dynamic Markets Grid */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6" />
                {activeTab === "ball" && "Ball-by-Ball Markets"}
                {activeTab === "over" && "Over Markets"}
                {activeTab === "innings" && "Innings Markets"}
                {activeTab === "player" && "Player Markets"}
              </h3>
              <div
                className={`grid gap-3 ${
                  activeTab === "ball"
                    ? "grid-cols-2 md:grid-cols-4"
                    : "grid-cols-2 md:grid-cols-3"
                }`}
              >
                {getCurrentMarkets().map((market) => {
                  const isSelected = bets.some((b) => b.market === market.id);
                  return (
                    <button
                      key={market.id}
                      onClick={() => handleMarketClick(market)}
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-br from-blue-500 to-green-500 shadow-lg shadow-blue-500/50 scale-105"
                          : "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700"
                      }`}
                    >
                      <p className="text-sm font-medium mb-2 text-white">
                        {market.label}
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {market.odds.toFixed(2)}
                      </p>
                      <div
                        className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                          Math.random() > 0.5
                            ? "bg-green-400 animate-pulse"
                            : "bg-orange-400 animate-pulse"
                        }`}
                      ></div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Last 15 Balls */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-bold text-green-400 mb-4">
                Last 15 Balls
              </h3>
              <div className="flex gap-2 flex-wrap">
                {[...Array(15)].map((_, idx) => {
                  const outcomes = ["0", "1", "2", "4", "6", "W", "Wd", "Nb"];
                  const result =
                    outcomes[Math.floor(Math.random() * outcomes.length)];
                  const bgColor =
                    result === "6"
                      ? "bg-purple-500"
                      : result === "4"
                        ? "bg-green-500"
                        : result === "W"
                          ? "bg-red-500"
                          : result === "Wd" || result === "Nb"
                            ? "bg-orange-500"
                            : "bg-gray-700";
                  return (
                    <div
                      key={idx}
                      className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center font-bold text-sm shadow-lg`}
                    >
                      {result}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Commentary Feed */}
            <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Live Commentary
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">
                    15.3 - Starc to Kohli
                  </p>
                  <p className="text-sm text-white">
                    FOUR! Glorious cover drive by Kohli! 🏏
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">
                    15.2 - Starc to Kohli
                  </p>
                  <p className="text-sm text-white">
                    Single taken to mid-wicket. India need 21 from 27 balls.
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">
                    15.1 - Starc to Pant
                  </p>
                  <p className="text-sm text-white">
                    SIX! Pant goes downtown! What a shot! 💥
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 h-fit sticky top-4">
            <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Bet Slip
            </h3>

            {/* Chip Selector */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Select Chip</p>
              <div className="grid grid-cols-3 gap-2">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`p-3 rounded-lg font-bold transition-all ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg shadow-blue-500/50 scale-110"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
                <p className="text-gray-500 text-center py-8">
                  No bets placed yet
                </p>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          {bet.category}
                        </p>
                        <p className="text-sm font-medium text-white">
                          {bet.selection}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== idx))
                        }
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Odds: {bet.odds.toFixed(2)}
                      </span>
                      <span className="text-gray-400">Stake: ₹{bet.stake}</span>
                    </div>
                    <p className="text-blue-400 text-sm font-semibold mt-1">
                      Win: ₹{(bet.stake * bet.odds).toFixed(0)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Bet Summary */}
            {bets.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Bets:</span>
                  <span className="text-white font-bold">{bets.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Stake:</span>
                  <span className="text-white font-bold">₹{totalStake}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Potential Win:</span>
                  <span className="text-green-400 font-bold">
                    ₹{potentialWin.toFixed(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Live Odds Tracker */}
            <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-lg p-3 mb-4 border border-blue-500/30">
              <p className="text-xs text-gray-400 mb-1">Live Odds Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-white font-medium">
                  Updating in real-time
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                onClick={() => setBets([])}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-sm"
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
                className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-sm"
              >
                Repeat
              </Button>
              <Button
                onClick={() =>
                  setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                }
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-sm"
              >
                Double
              </Button>
            </div>

            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-bold py-4 rounded-lg shadow-lg disabled:opacity-50"
            >
              Place {bets.length} Bet{bets.length !== 1 ? "s" : ""} - ₹
              {totalStake}
            </Button>
          </div>
        </div>

        {/* Bottom Ticker */}
        <div className="mt-4 bg-gradient-to-r from-blue-900/30 to-green-900/30 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-blue-400 font-bold text-sm whitespace-nowrap">
              ODDS TICKER:
            </span>
            <div className="flex gap-6 text-sm text-white animate-pulse">
              <span>India Win: 2.15 ↑</span>
              <span>Australia Win: 1.75 ↓</span>
              <span>Next Ball 4/6: 5.50</span>
              <span>Kohli 50: 3.20 ↑</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CricketV3Game;
