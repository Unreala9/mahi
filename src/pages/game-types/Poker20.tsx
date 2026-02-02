import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const PLAYERS = [
  { seat: 1, name: "Player1", stack: 5200, status: "folded", position: "UTG" },
  {
    seat: 2,
    name: "Player2",
    stack: 8500,
    status: "active",
    position: "UTG+1",
  },
  { seat: 3, name: "Player3", stack: 3400, status: "folded", position: "MP" },
  { seat: 4, name: "Player4", stack: 12000, status: "active", position: "CO" },
  { seat: 5, name: "Player5", stack: 6800, status: "acting", position: "BTN" },
  { seat: 6, name: "Player6", stack: 4200, status: "active", position: "SB" },
  { seat: 7, name: "Player7", stack: 9100, status: "active", position: "BB" },
  { seat: 8, name: "Player8", stack: 7500, status: "folded", position: "UTG" },
];

const COMMUNITY_CARDS = [
  { suit: "hearts" as const, value: "A" },
  { suit: "diamonds" as const, value: "K" },
  { suit: "clubs" as const, value: "Q" },
];

const HISTORY = [
  { winner: "Player5", amount: "₹4500", hand: "Full House" },
  { winner: "Player2", amount: "₹2800", hand: "Two Pair" },
  { winner: "Player4", amount: "₹6200", hand: "Straight" },
];

export default function Poker20() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(25);
  const [myAction, setMyAction] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [pot, setPot] = useState(1200);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 25 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (action: string) => {
    setMyAction(action);
    toast({
      title: `Action: ${action}`,
      description: `You chose to ${action}`,
    });
    setTimeout(() => setMyAction(null), 2000);
  };

  // Calculate seat positions in oval
  const getOvalPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radiusX = 45;
    const radiusY = 35;
    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);
    return { x, y };
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/10 to-gray-900">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-blue-600/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  Texas Hold'em Poker 20
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-sm text-gray-400">
                    <span className="text-yellow-500">SB: ₹50</span> /{" "}
                    <span className="text-yellow-500">BB: ₹100</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-blue-600 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Poker Table */}
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-blue-600/30 p-6 min-h-[600px]">
                {/* Oval Table with Players */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-green-800/50 to-green-900/50 rounded-[50%] border-8 border-yellow-700/50 shadow-2xl">
                  {/* Players positioned around oval */}
                  {PLAYERS.map((player, idx) => {
                    const pos = getOvalPosition(idx, PLAYERS.length);
                    return (
                      <div
                        key={player.seat}
                        className="absolute"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <Card
                          className={cn(
                            "bg-gray-900/90 border-2 p-2 min-w-[120px] transition-all",
                            player.status === "acting"
                              ? "border-yellow-500 ring-2 ring-yellow-500 ring-offset-2 ring-offset-green-900"
                              : player.status === "folded"
                                ? "border-gray-700 opacity-50"
                                : "border-blue-600",
                          )}
                        >
                          {/* Timer Ring for Acting Player */}
                          {player.status === "acting" && (
                            <div className="absolute -top-1 -right-1 w-8 h-8">
                              <svg
                                className="transform -rotate-90"
                                viewBox="0 0 32 32"
                              >
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="14"
                                  fill="none"
                                  stroke="#FCD34D"
                                  strokeWidth="3"
                                  strokeDasharray={`${(countdown / 25) * 88} 88`}
                                  className="transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-yellow-500">
                                {countdown}
                              </div>
                            </div>
                          )}

                          {/* Player Info */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg">
                                👤
                              </div>
                              {player.position === "BTN" && (
                                <Badge className="bg-yellow-600 text-xs">
                                  D
                                </Badge>
                              )}
                              {player.position === "SB" && (
                                <Badge className="bg-blue-600 text-xs">
                                  SB
                                </Badge>
                              )}
                              {player.position === "BB" && (
                                <Badge className="bg-red-600 text-xs">BB</Badge>
                              )}
                            </div>
                            <p className="text-white text-sm font-bold">
                              {player.name}
                            </p>
                            <p className="text-green-400 text-xs font-bold">
                              ₹{player.stack}
                            </p>
                            {player.status === "folded" && (
                              <Badge className="bg-gray-700 text-xs mt-1">
                                Folded
                              </Badge>
                            )}
                            {player.status === "active" && (
                              <Badge className="bg-blue-600 text-xs mt-1">
                                In Hand
                              </Badge>
                            )}
                            {player.status === "acting" && (
                              <Badge className="bg-yellow-600 text-xs mt-1 animate-pulse">
                                Thinking...
                              </Badge>
                            )}
                          </div>

                          {/* Player Cards (if not folded) */}
                          {player.status !== "folded" && (
                            <div className="flex justify-center gap-1 mt-2">
                              <PlayingCard faceDown size="sm" />
                              <PlayingCard faceDown size="sm" />
                            </div>
                          )}
                        </Card>
                      </div>
                    );
                  })}

                  {/* Center - Community Cards & Pot */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    {/* Community Cards */}
                    <div className="flex justify-center gap-2 mb-4">
                      {COMMUNITY_CARDS.map((card, idx) => (
                        <PlayingCard
                          key={idx}
                          suit={card.suit}
                          value={card.value}
                          size="lg"
                        />
                      ))}
                      <PlayingCard faceDown size="lg" />
                      <PlayingCard faceDown size="lg" />
                    </div>

                    {/* Pot Display */}
                    <div className="bg-yellow-600/20 backdrop-blur-sm rounded-lg px-6 py-3 border-2 border-yellow-600/50">
                      <p className="text-gray-300 text-xs mb-1">Main Pot</p>
                      <p className="text-yellow-500 font-bold text-2xl">
                        ₹{pot}
                      </p>
                    </div>
                  </div>
                </div>

                {/* My Seat (Bottom) */}
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500 p-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <div>
                        <p className="text-white font-bold">You (ME)</p>
                        <p className="text-green-400 text-sm font-bold">
                          ₹10,500
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600">My Turn</Badge>
                  </div>

                  {/* My Cards */}
                  <div className="flex justify-center gap-3 mb-4">
                    <PlayingCard suit="spades" value="A" size="xl" />
                    <PlayingCard suit="spades" value="K" size="xl" />
                  </div>

                  {/* Betting Controls */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <Button
                      onClick={() => handleAction("fold")}
                      variant="outline"
                      className="border-red-600 text-red-500 hover:bg-red-600/20 font-bold"
                    >
                      Fold
                    </Button>
                    <Button
                      onClick={() => handleAction("check")}
                      variant="outline"
                      className="border-yellow-600 text-yellow-500 hover:bg-yellow-600/20 font-bold"
                    >
                      Check
                    </Button>
                    <Button
                      onClick={() => handleAction("call")}
                      variant="outline"
                      className="border-blue-600 text-blue-500 hover:bg-blue-600/20 font-bold"
                    >
                      Call ₹200
                    </Button>
                    <Button
                      onClick={() => handleAction("raise")}
                      className="bg-green-600 hover:bg-green-700 font-bold"
                    >
                      Raise
                    </Button>
                  </div>

                  {/* Bet Amount Slider */}
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-blue-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Bet Amount:</span>
                      <span className="text-white font-bold text-lg">
                        ₹{betAmount}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="10500"
                      step="50"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBetAmount(pot / 2)}
                        className="text-xs"
                      >
                        1/2 Pot
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBetAmount(pot)}
                        className="text-xs"
                      >
                        Pot
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBetAmount(pot * 2)}
                        className="text-xs"
                      >
                        2x Pot
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBetAmount(10500)}
                        className="text-xs text-red-500"
                      >
                        All-In
                      </Button>
                    </div>
                  </div>
                </Card>
              </Card>
            </div>

            {/* Right Panel - Hand History */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-blue-600/20 p-4">
                <h3 className="text-blue-400 font-bold mb-4 text-center">
                  Hand History
                </h3>
                <div className="space-y-3">
                  {HISTORY.map((hand, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900/50 p-3 rounded border border-blue-600/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold text-sm">
                          {hand.winner}
                        </span>
                        <Badge className="bg-green-600 text-xs">
                          {hand.amount}
                        </Badge>
                      </div>
                      <p className="text-yellow-500 text-xs font-bold">
                        {hand.hand}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 bg-gray-900/50 p-3 rounded border border-blue-600/30">
                  <h4 className="text-blue-400 font-bold text-sm mb-3">
                    Table Stats
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Players:</span>
                      <span className="text-white font-bold">8/9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Pot:</span>
                      <span className="text-white font-bold">₹3,850</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hands/Hr:</span>
                      <span className="text-white font-bold">45</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
