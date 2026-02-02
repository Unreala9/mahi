import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Clock, Zap, TrendingUp, Info } from "lucide-react";

interface Game {
  gmid: string;
  gname?: string;
}

interface Poker6GameProps {
  game?: Game;
}

interface Player {
  id: number;
  name: string;
  chips: number;
  position: string;
  hand: string[];
  status: "active" | "folded" | "allin" | "out";
  bet: number;
}

interface HandHistory {
  handNum: number;
  winner: string;
  pot: number;
  winningHand: string;
}

const INITIAL_PLAYERS: Player[] = [
  {
    id: 1,
    name: "You",
    chips: 25000,
    position: "BTN",
    hand: [],
    status: "active",
    bet: 0,
  },
  {
    id: 2,
    name: "Player2",
    chips: 18500,
    position: "SB",
    hand: [],
    status: "active",
    bet: 50,
  },
  {
    id: 3,
    name: "Player3",
    chips: 32000,
    position: "BB",
    hand: [],
    status: "active",
    bet: 100,
  },
  {
    id: 4,
    name: "Player4",
    chips: 15000,
    position: "UTG",
    hand: [],
    status: "folded",
    bet: 0,
  },
  {
    id: 5,
    name: "Player5",
    chips: 28000,
    position: "MP",
    hand: [],
    status: "active",
    bet: 0,
  },
  {
    id: 6,
    name: "Player6",
    chips: 21500,
    position: "CO",
    hand: [],
    status: "active",
    bet: 0,
  },
];

const COMMUNITY_CARDS = ["A♠", "K♦", "Q♥", "J♣", "10♠"];

const STRATEGY_TIPS = [
  {
    title: "Position is Power",
    tip: "BTN & CO can play 40% more hands than UTG",
    icon: "🎯",
  },
  {
    title: "3-Bet Range",
    tip: "3-bet JJ+ and AK from all positions vs EP opens",
    icon: "🔥",
  },
  {
    title: "C-Bet Strategy",
    tip: "C-bet 65-75% on dry boards, 40-50% on wet boards",
    icon: "💡",
  },
  {
    title: "Pot Control",
    tip: "Check behind with marginal made hands OOP on turn",
    icon: "🛡️",
  },
];

const HAND_RANKINGS = [
  { rank: "Royal Flush", example: "A♥ K♥ Q♥ J♥ 10♥" },
  { rank: "Straight Flush", example: "9♠ 8♠ 7♠ 6♠ 5♠" },
  { rank: "Four of a Kind", example: "K♦ K♣ K♥ K♠ A♦" },
  { rank: "Full House", example: "Q♦ Q♣ Q♥ 7♠ 7♦" },
  { rank: "Flush", example: "A♣ J♣ 9♣ 5♣ 3♣" },
  { rank: "Straight", example: "10♦ 9♠ 8♥ 7♣ 6♦" },
  { rank: "Three of a Kind", example: "8♦ 8♣ 8♥ A♦ K♠" },
  { rank: "Two Pair", example: "J♦ J♣ 6♥ 6♠ A♦" },
  { rank: "One Pair", example: "A♦ A♣ K♥ Q♠ 9♦" },
  { rank: "High Card", example: "A♦ K♣ Q♥ J♠ 9♦" },
];

const HAND_HISTORY_DATA: HandHistory[] = [
  { handNum: 147, winner: "Player2", pot: 3200, winningHand: "Flush, A-high" },
  { handNum: 146, winner: "You", pot: 2800, winningHand: "Two Pair, KK77" },
  {
    handNum: 145,
    winner: "Player5",
    pot: 5400,
    winningHand: "Straight, 10-high",
  },
];

export default function Poker6Game({ game }: Poker6GameProps) {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [communityCards, setCommunityCards] = useState<string[]>(
    COMMUNITY_CARDS.slice(0, 0),
  );
  const [pot, setPot] = useState(150);
  const [currentBet, setCurrentBet] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(12);
  const [betAmount, setBetAmount] = useState(200);
  const [street, setStreet] = useState<"preflop" | "flop" | "turn" | "river">(
    "preflop",
  );
  const [showStrategyTips, setShowStrategyTips] = useState(false);

  const gameId = game?.gmid || "poker6";
  const gameName = game?.gname || "Poker 6";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 12));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (action: string, amount?: number) => {
    if (timeRemaining <= 1) {
      toast({
        title: "Time Expired",
        description: "Action auto-folded",
        variant: "destructive",
      });
      return;
    }

    casinoBettingService.placeCasinoBet({
      gameId: gameId,
      gameName: gameName,
      roundId: gameData?.mid || "",
      marketId: "",
      marketName: action,
      selection: action,
      odds: 0,
      stake: amount || 0,
      betType: "BACK",
    });

    toast({
      title: `Action: ${action.toUpperCase()}`,
      description: amount ? `₹${amount}` : "",
    });
  };

  const dealCommunityCards = () => {
    if (street === "preflop") {
      setCommunityCards(COMMUNITY_CARDS.slice(0, 3));
      setStreet("flop");
    } else if (street === "flop") {
      setCommunityCards(COMMUNITY_CARDS.slice(0, 4));
      setStreet("turn");
    } else if (street === "turn") {
      setCommunityCards(COMMUNITY_CARDS.slice(0, 5));
      setStreet("river");
    }
    setPot(pot + currentBet * 3);
    setTimeRemaining(12);
  };

  const getPlayerPosition = (index: number) => {
    const positions = [
      { top: "50%", left: "10%", transform: "translateY(-50%)" }, // Left
      { top: "15%", left: "25%", transform: "none" }, // Top-left
      { top: "15%", right: "25%", transform: "none" }, // Top-right
      { top: "50%", right: "10%", transform: "translateY(-50%)" }, // Right
      { bottom: "15%", right: "25%", transform: "none" }, // Bottom-right
      { bottom: "15%", left: "25%", transform: "none" }, // Bottom-left
    ];
    return positions[index];
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-teal-950 to-gray-900 p-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-900/60 via-emerald-900/60 to-teal-900/60 backdrop-blur-md border-2 border-teal-500/40 rounded-2xl p-4 mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-teal-300 text-sm">6-Max Texas Hold'em</div>
                <div className="bg-emerald-600 px-3 py-1 rounded-lg text-white font-semibold text-sm">
                  FAST CASH GAME
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-teal-300 text-xs">Hand #</div>
                  <div className="text-white font-mono text-lg font-bold">
                    {gameData?.mid || "148"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-teal-300 text-xs">BB/SB</div>
                  <div className="text-white font-bold">100/50</div>
                </div>

                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl border-2 ${
                    timeRemaining <= 3
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-gradient-to-br from-teal-600 to-emerald-600 text-white border-teal-400"
                  }`}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            {/* Strategy Tips - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-teal-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-teal-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-teal-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  6-Max Tips
                </h3>
                <div className="space-y-3">
                  {STRATEGY_TIPS.map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-black/40 rounded-lg p-3 border border-teal-500/30"
                    >
                      <div className="text-2xl mb-1">{tip.icon}</div>
                      <div className="text-teal-300 font-semibold text-sm mb-1">
                        {tip.title}
                      </div>
                      <div className="text-gray-300 text-xs">{tip.tip}</div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setShowStrategyTips(!showStrategyTips)}
                  className="w-full mt-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-2 text-sm rounded-lg"
                >
                  <Info className="w-4 h-4 mr-2" />
                  {showStrategyTips ? "Hide" : "Show"} Full Guide
                </Button>
              </div>

              {/* Hand Rankings */}
              <div className="bg-gradient-to-br from-teal-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-teal-500/40 rounded-2xl p-5 shadow-2xl max-h-[400px] overflow-y-auto">
                <h3 className="text-teal-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Hand Rankings
                </h3>
                <div className="space-y-2">
                  {HAND_RANKINGS.map((hand, idx) => (
                    <div
                      key={idx}
                      className="bg-black/40 rounded-lg p-2 border border-teal-500/20"
                    >
                      <div className="text-teal-300 font-semibold text-xs mb-1">
                        {idx + 1}. {hand.rank}
                      </div>
                      <div className="text-white text-xs font-mono">
                        {hand.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Poker Table - Center */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-green-800/80 to-emerald-900/80 backdrop-blur-md border-4 border-amber-600/60 rounded-[3rem] p-8 shadow-2xl relative min-h-[700px]">
                {/* Table Center - Community Cards & Pot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  {/* Pot */}
                  <div className="bg-black/60 rounded-2xl px-6 py-3 mb-6 border-2 border-yellow-500/50 shadow-2xl">
                    <div className="text-yellow-300 text-sm mb-1">Main Pot</div>
                    <div className="text-white font-bold text-4xl">
                      ₹{pot.toLocaleString()}
                    </div>
                  </div>

                  {/* Community Cards */}
                  <div className="flex gap-2 justify-center">
                    {communityCards.length === 0 ? (
                      <div className="text-gray-400 text-sm">
                        Waiting for flop...
                      </div>
                    ) : (
                      communityCards.map((card, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-24 bg-white rounded-xl shadow-2xl flex items-center justify-center border-2 border-gray-300 text-4xl font-bold"
                          style={{
                            color:
                              card.includes("♥") || card.includes("♦")
                                ? "#dc2626"
                                : "#000",
                          }}
                        >
                          {card}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 text-teal-300 text-sm uppercase tracking-wider font-semibold">
                    {street === "preflop" && "Pre-Flop"}
                    {street === "flop" && "Flop"}
                    {street === "turn" && "Turn"}
                    {street === "river" && "River"}
                  </div>
                </div>

                {/* Players */}
                {players.map((player, idx) => {
                  const pos = getPlayerPosition(idx);
                  const isYou = player.id === 1;

                  return (
                    <div key={player.id} className="absolute" style={pos}>
                      <div
                        className={`${
                          isYou
                            ? "bg-gradient-to-br from-yellow-600 to-amber-700 border-yellow-400"
                            : player.status === "active"
                              ? "bg-gradient-to-br from-teal-700 to-emerald-800 border-teal-500"
                              : "bg-gray-700 border-gray-600"
                        } border-2 rounded-2xl p-3 shadow-2xl min-w-[140px]`}
                      >
                        {/* Position Badge */}
                        <div className="absolute -top-3 -right-3 bg-black text-yellow-400 px-2 py-1 rounded-full text-xs font-bold border border-yellow-500">
                          {player.position}
                        </div>

                        {/* Player Info */}
                        <div className="mb-2">
                          <div className="text-white font-bold text-sm mb-1">
                            {player.name}
                            {isYou && <span className="ml-1">👤</span>}
                          </div>
                          <div className="text-yellow-300 text-xs">
                            ₹{player.chips.toLocaleString()}
                          </div>
                        </div>

                        {/* Hole Cards (only shown for You) */}
                        {isYou && (
                          <div className="flex gap-1 mb-2">
                            <div className="w-8 h-12 bg-white rounded shadow text-center text-lg font-bold flex items-center justify-center text-red-600">
                              A♥
                            </div>
                            <div className="w-8 h-12 bg-white rounded shadow text-center text-lg font-bold flex items-center justify-center">
                              K♠
                            </div>
                          </div>
                        )}

                        {/* Current Bet */}
                        {player.bet > 0 && (
                          <div className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
                            Bet: ₹{player.bet}
                          </div>
                        )}

                        {/* Status */}
                        {player.status === "folded" && (
                          <div className="text-red-400 text-xs font-semibold">
                            FOLDED
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Demo Button */}
                <Button
                  onClick={dealCommunityCards}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Deal Next Street
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 bg-gradient-to-br from-teal-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-teal-500/40 rounded-2xl p-5 shadow-2xl">
                <div className="grid grid-cols-5 gap-3">
                  <Button
                    onClick={() => handleAction("fold")}
                    className="bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold rounded-xl shadow-xl"
                  >
                    Fold
                  </Button>
                  <Button
                    onClick={() => handleAction("check")}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold rounded-xl shadow-xl"
                  >
                    Check
                  </Button>
                  <Button
                    onClick={() => handleAction("call", currentBet)}
                    className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold rounded-xl shadow-xl"
                  >
                    Call
                    <br />₹{currentBet}
                  </Button>
                  <Button
                    onClick={() => handleAction("bet", betAmount)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-bold rounded-xl shadow-xl"
                  >
                    Bet
                    <br />₹{betAmount}
                  </Button>
                  <Button
                    onClick={() => handleAction("raise", betAmount * 2)}
                    className="bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-6 text-lg font-bold rounded-xl shadow-xl"
                  >
                    Raise
                    <br />₹{betAmount * 2}
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <span className="text-teal-300 text-sm">Bet Amount:</span>
                  <input
                    type="range"
                    min={currentBet}
                    max={5000}
                    step={100}
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-24 bg-black/40 text-white border border-teal-500/40 rounded-lg px-3 py-2 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Hand History - Right */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-teal-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-teal-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-teal-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Hands
                </h3>
                <div className="space-y-3">
                  {HAND_HISTORY_DATA.map((hand) => (
                    <div
                      key={hand.handNum}
                      className="bg-black/40 rounded-lg p-3 border border-teal-500/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-teal-300 text-xs">
                          Hand #{hand.handNum}
                        </span>
                        <span className="text-yellow-400 font-bold text-sm">
                          ₹{hand.pot.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-white font-semibold text-sm mb-1">
                        🏆 {hand.winner}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {hand.winningHand}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Stats */}
              <div className="bg-gradient-to-br from-teal-900/60 to-emerald-900/60 backdrop-blur-md border-2 border-teal-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-teal-300 font-bold text-lg mb-4">
                  Session Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Hands Played</span>
                    <span className="text-white font-bold">147</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">VPIP</span>
                    <span className="text-teal-400 font-bold">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">PFR</span>
                    <span className="text-teal-400 font-bold">22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">3-Bet</span>
                    <span className="text-teal-400 font-bold">8%</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-teal-500/30 pt-2">
                    <span className="text-gray-400 text-sm">Net Win/Loss</span>
                    <span className="text-green-400 font-bold text-lg">
                      +₹4,200
                    </span>
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
