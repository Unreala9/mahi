import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Target,
  Activity,
} from "lucide-react";

interface CricketMatchMeterGameProps {
  game: any;
}

interface Bet {
  market: string;
  selection: string;
  odds: number;
  stake: number;
}

const CHIPS = [100, 500, 1000, 5000, 10000, 50000];

const BALL_MARKETS = [
  { id: "runs-over", label: "Runs Over 1.5", odds: 2.2 },
  { id: "runs-under", label: "Runs Under 1.5", odds: 1.8 },
  { id: "boundary-yes", label: "Boundary Yes", odds: 4.5 },
  { id: "boundary-no", label: "Boundary No", odds: 1.3 },
  { id: "wicket-yes", label: "Wicket Yes", odds: 8.0 },
  { id: "maiden-over", label: "Maiden Over", odds: 6.5 },
];

const INNINGS_MARKETS = [
  { id: "sixes-over", label: "Total 6s Over 3.5", odds: 1.95 },
  { id: "sixes-under", label: "Total 6s Under 3.5", odds: 1.85 },
  { id: "boundaries-over", label: "Boundaries Over 8.5", odds: 2.1 },
  { id: "boundaries-under", label: "Boundaries Under 8.5", odds: 1.75 },
];

const FIELD_POSITIONS = [
  { id: "slip", x: "82%", y: "45%", name: "Slip" },
  { id: "cover", x: "75%", y: "25%", name: "Cover" },
  { id: "mid-off", x: "60%", y: "15%", name: "Mid-Off" },
  { id: "bowler", x: "50%", y: "10%", name: "Bowler" },
  { id: "mid-on", x: "40%", y: "15%", name: "Mid-On" },
  { id: "mid-wicket", x: "25%", y: "35%", name: "Mid-Wicket" },
  { id: "square-leg", x: "20%", y: "55%", name: "Square Leg" },
  { id: "fine-leg", x: "15%", y: "75%", name: "Fine Leg" },
  { id: "wicket-keeper", x: "50%", y: "90%", name: "WK" },
  { id: "batsman", x: "50%", y: "85%", name: "Batsman" },
];

const CricketMatchMeterGame = ({ game }: CricketMatchMeterGameProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(1000);
  const [currentOverRuns, setCurrentOverRuns] = useState(4);
  const [totalSixes, setTotalSixes] = useState(3);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);
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
        await casinoBettingService.placeCasinoBet(
          game.gid,
          game.gname,
          gameData?.mid || "round-1",
          bet.market,
          bet.selection,
          bet.selection,
          bet.odds,
          bet.stake,
          "back",
        );
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
  const totalExposure = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialWin = bets.reduce((sum, bet) => sum + bet.stake * bet.odds, 0);

  const ballHistory = resultData?.res?.slice(-15) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-gray-900 to-blue-950 text-white p-4">
        {/* Match Context Header */}
        <div className="bg-gradient-to-r from-green-800/30 to-blue-800/30 backdrop-blur-md rounded-xl p-6 mb-4 border border-green-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match Score */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-green-400">
                    India vs Australia
                  </h3>
                  <p className="text-gray-400 text-sm">
                    T20 International • Live
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">165/4</p>
                  <p className="text-green-400 font-semibold">
                    15.3 / 20 Overs
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Run Rate</p>
                  <p className="text-xl font-bold text-green-400">10.97</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Required</p>
                  <p className="text-xl font-bold text-orange-400">11.45</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Wickets</p>
                  <p className="text-xl font-bold text-red-400">4</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Balls Left</p>
                  <p className="text-xl font-bold text-blue-400">27</p>
                </div>
              </div>
            </div>

            {/* Field Map */}
            <div
              className="bg-green-900/20 rounded-xl p-4 border border-green-500/30 relative"
              style={{ height: "240px" }}
            >
              <h4 className="text-sm font-semibold text-green-400 mb-2">
                Live Field
              </h4>
              <div className="absolute inset-4 border-2 border-green-500/30 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.15) 50%, transparent 100%)",
                  }}
                ></div>
                {FIELD_POSITIONS.map((pos) => (
                  <div
                    key={pos.id}
                    className="absolute w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg"
                    style={{
                      left: pos.x,
                      top: pos.y,
                      transform: "translate(-50%, -50%)",
                    }}
                    title={pos.name}
                  />
                ))}
                <div className="absolute left-1/2 top-1/2 w-1 h-16 bg-white/30 transform -translate-x-1/2 -translate-y-1/2 rotate-0"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Meters and Markets */}
          <div className="lg:col-span-2 space-y-4">
            {/* Dual Meter System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Over Runs Meter */}
              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-md rounded-xl p-6 border border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Current Over Runs
                  </h3>
                  <div className="text-3xl font-bold text-white">
                    {currentOverRuns}
                  </div>
                </div>
                <div className="relative h-48 bg-gray-800/50 rounded-lg overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500 to-red-500 transition-all duration-500"
                    style={{ height: `${(currentOverRuns / 6) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-between p-2 text-xs text-gray-400">
                    {[6, 5, 4, 3, 2, 1, 0].map((num) => (
                      <div
                        key={num}
                        className="flex justify-between border-b border-gray-700/30"
                      >
                        <span>{num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Sixes Meter */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Total Sixes
                  </h3>
                  <div className="text-3xl font-bold text-white">
                    {totalSixes}
                  </div>
                </div>
                <div className="relative h-48 bg-gray-800/50 rounded-lg overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ height: `${(totalSixes / 10) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-between p-2 text-xs text-gray-400">
                    {[10, 8, 6, 4, 2, 0].map((num) => (
                      <div
                        key={num}
                        className="flex justify-between border-b border-gray-700/30"
                      >
                        <span>{num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ball Markets */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Ball Markets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BALL_MARKETS.map((market) => {
                  const isSelected = bets.some((b) => b.market === market.id);
                  return (
                    <button
                      key={market.id}
                      onClick={() => handleMarketClick(market)}
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-br from-green-500 to-blue-500 shadow-lg shadow-green-500/50 scale-105"
                          : "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{market.label}</p>
                      <p className="text-2xl font-bold text-green-400">
                        {market.odds.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Innings Markets */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Innings Markets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INNINGS_MARKETS.map((market) => {
                  const isSelected = bets.some((b) => b.market === market.id);
                  return (
                    <button
                      key={market.id}
                      onClick={() => handleMarketClick(market)}
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 scale-105"
                          : "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{market.label}</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {market.odds.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ball-by-Ball History */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-bold text-blue-400 mb-4">
                Last 15 Balls
              </h3>
              <div className="flex gap-2 flex-wrap">
                {ballHistory.map((ball: any, idx: number) => {
                  const result = Math.floor(Math.random() * 7);
                  const displayValue = result === 7 ? "W" : result;
                  const bgColor =
                    result === 6
                      ? "bg-purple-500"
                      : result === 4
                        ? "bg-green-500"
                        : result === 7
                          ? "bg-red-500"
                          : "bg-gray-700";
                  return (
                    <div
                      key={idx}
                      className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center font-bold text-sm shadow-lg`}
                    >
                      {displayValue}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 h-fit sticky top-4">
            <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6" />
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
                        ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50 scale-110"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    ₹{chip >= 1000 ? `${chip / 1000}k` : chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Bets */}
            <div className="mb-6 space-y-2 max-h-64 overflow-y-auto">
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
                      <p className="text-sm font-medium text-white">
                        {bet.selection}
                      </p>
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
                    <p className="text-green-400 text-sm font-semibold mt-1">
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
                  <span className="text-gray-400">Total Stake:</span>
                  <span className="text-white font-bold">₹{totalStake}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Exposure:</span>
                  <span className="text-orange-400 font-bold">
                    ₹{totalExposure}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Potential Win:</span>
                  <span className="text-green-400 font-bold">
                    ₹{potentialWin.toFixed(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={() => setBets([])}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-600"
              >
                Clear All
              </Button>
              <Button
                onClick={() =>
                  setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                }
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-600"
              >
                Double
              </Button>
            </div>

            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 rounded-lg shadow-lg disabled:opacity-50"
            >
              Place {bets.length} Bet{bets.length !== 1 ? "s" : ""} - ₹
              {totalStake}
            </Button>
          </div>
        </div>

        {/* Live Commentary Ticker */}
        <div className="mt-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-blue-400 font-bold text-sm whitespace-nowrap">
              LIVE:
            </span>
            <p className="text-white text-sm animate-pulse">
              Kohli smashes a FOUR through covers! • Next ball in 8 seconds...
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CricketMatchMeterGame;
