import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle,
  Smile,
  ThumbsUp,
  Heart,
  Trophy,
  TrendingUp,
} from "lucide-react";

interface Game {
  gmid: string;
  gname?: string;
}

interface Teen42GameProps {
  game?: Game;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  status: "active" | "folded" | "all-in";
  currentBet: number;
  position: string;
  mood: "excited" | "aggressive" | "cautious";
  achievements: string[];
}

interface ChatMessage {
  id: number;
  player: string;
  message: string;
  emoji?: string;
  timestamp: string;
}

interface Bet {
  type: string;
  amount: number;
}

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Raj",
    avatar: "😄",
    chips: 85000,
    status: "active",
    currentBet: 0,
    position: "top",
    mood: "excited",
    achievements: ["🔥 Hot Streak"],
  },
  {
    id: 2,
    name: "Maya",
    avatar: "🤗",
    chips: 72000,
    status: "active",
    currentBet: 0,
    position: "right-top",
    mood: "cautious",
    achievements: ["🎯 Consistent"],
  },
  {
    id: 3,
    name: "Arjun",
    avatar: "😎",
    chips: 95000,
    status: "active",
    currentBet: 0,
    position: "right-bottom",
    mood: "aggressive",
    achievements: ["💪 Big Winner"],
  },
  {
    id: 4,
    name: "You",
    avatar: "😊",
    chips: 78000,
    status: "active",
    currentBet: 0,
    position: "bottom",
    mood: "excited",
    achievements: ["⭐ Rising Star"],
  },
  {
    id: 5,
    name: "Priya",
    avatar: "🥳",
    chips: 88000,
    status: "active",
    currentBet: 0,
    position: "left-bottom",
    mood: "excited",
    achievements: ["🎉 Lucky Day"],
  },
  {
    id: 6,
    name: "Vikram",
    avatar: "🤔",
    chips: 81000,
    status: "active",
    currentBet: 0,
    position: "left-top",
    mood: "cautious",
    achievements: ["🛡️ Defensive"],
  },
];

const QUICK_MESSAGES = [
  { text: "Nice hand!", emoji: "👍" },
  { text: "Bad luck!", emoji: "😢" },
  { text: "Good game!", emoji: "🎮" },
  { text: "Well played!", emoji: "👏" },
  { text: "Amazing!", emoji: "🌟" },
  { text: "Too risky!", emoji: "⚠️" },
];

const EMOJI_REACTIONS = ["😂", "😍", "😱", "🔥", "💪", "🎉", "👀", "🤯"];

const CHIP_VALUES = [1000, 2500, 5000, 10000, 25000];

const LEADERBOARD = [
  { rank: 1, name: "Arjun", winnings: 45000, emoji: "😎", badge: "🥇" },
  { rank: 2, name: "Priya", winnings: 38000, emoji: "🥳", badge: "🥈" },
  { rank: 3, name: "Raj", winnings: 35000, emoji: "😄", badge: "🥉" },
  { rank: 4, name: "Vikram", winnings: 31000, emoji: "🤔", badge: "🏅" },
  { rank: 5, name: "You", winnings: 28000, emoji: "😊", badge: "⭐" },
];

export default function Teen42Game({ game }: Teen42GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(5000);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [mainPot, setMainPot] = useState(42000);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      player: "Raj",
      message: "Nice hand!",
      emoji: "👍",
      timestamp: "2m ago",
    },
    {
      id: 2,
      player: "Maya",
      message: "Thanks!",
      emoji: "😊",
      timestamp: "2m ago",
    },
    {
      id: 3,
      player: "Arjun",
      message: "Let's go big!",
      emoji: "🔥",
      timestamp: "1m ago",
    },
  ]);

  const gameId = game?.gmid || "teen42";
  const gameName = game?.gname || "Teen 42";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 20));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBet = (type: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Time's Up",
        description: "Wait for next round",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = { type, amount: selectedChip };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet({
      gameId: gameId,
      gameName: gameName,
      roundId: gameData?.mid || "",
      marketId: type,
      marketName: type,
      selection: type,
      odds: 2.0,
      stake: selectedChip,
      betType: "BACK",
    });

    toast({
      title: "Bet Placed! 🎉",
      description: `${type}: ₹${selectedChip}`,
    });
  };

  const sendQuickMessage = (message: string, emoji: string) => {
    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      player: "You",
      message,
      emoji,
      timestamp: "Now",
    };
    setChatMessages([...chatMessages, newMessage]);

    toast({
      title: "Message Sent",
      description: `${emoji} ${message}`,
    });
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "excited":
        return "🤩";
      case "aggressive":
        return "😤";
      case "cautious":
        return "🤔";
      default:
        return "😊";
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "excited":
        return "text-yellow-400";
      case "aggressive":
        return "text-red-400";
      case "cautious":
        return "text-blue-400";
      default:
        return "text-green-400";
    }
  };

  const getPlayerPosition = (position: string) => {
    const positions: { [key: string]: string } = {
      top: "top-4 left-1/2 transform -translate-x-1/2",
      "right-top": "top-1/4 right-4",
      "right-bottom": "bottom-1/4 right-4",
      bottom: "bottom-4 left-1/2 transform -translate-x-1/2",
      "left-bottom": "bottom-1/4 left-4",
      "left-top": "top-1/4 left-4",
    };
    return positions[position] || "";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-indigo-600/30 backdrop-blur-md border-2 border-pink-500/40 rounded-2xl p-4 mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smile className="w-8 h-8 text-yellow-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Teen Patti 42 - Social Gaming
                  </h1>
                  <p className="text-pink-300 text-sm">
                    Chat, interact & have fun!
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-purple-300 text-sm">Match ID</div>
                <div className="text-white font-mono text-lg">
                  {gameData?.mid || "Loading..."}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Player Leaderboard - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-md border-2 border-yellow-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-yellow-400 font-bold text-xl mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Today's Winners
                </h3>
                <div className="space-y-3">
                  {LEADERBOARD.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`rounded-xl p-3 border-2 shadow-lg ${
                        entry.rank === 1
                          ? "bg-gradient-to-br from-yellow-600/40 to-orange-600/40 border-yellow-400"
                          : entry.rank === 2
                            ? "bg-gradient-to-br from-gray-400/40 to-gray-600/40 border-gray-400"
                            : entry.rank === 3
                              ? "bg-gradient-to-br from-orange-700/40 to-orange-900/40 border-orange-600"
                              : "bg-gray-800/40 border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{entry.badge}</span>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-white font-bold text-sm">
                                {entry.name}
                              </span>
                              <span className="text-xl">{entry.emoji}</span>
                            </div>
                            <div className="text-xs text-gray-300">
                              Rank #{entry.rank}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-lg flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />₹
                            {(entry.winnings / 1000).toFixed(0)}K
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Moods */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4">
                  Player Moods
                </h3>
                <div className="space-y-2">
                  {PLAYERS.map((player) => (
                    <div
                      key={player.id}
                      className="bg-black/40 rounded-lg p-3 border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{player.avatar}</span>
                          <span className="text-white font-semibold text-sm">
                            {player.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl">
                            {getMoodEmoji(player.mood)}
                          </span>
                          <span
                            className={`text-xs font-bold ${getMoodColor(player.mood)}`}
                          >
                            {player.mood}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              {/* Timer */}
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md border border-purple-500/40 rounded-2xl p-4 mb-4 shadow-2xl">
                <div className="flex items-center justify-center gap-6">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl ${
                      timeRemaining <= 5
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-gradient-to-br from-pink-500 to-purple-600 text-white"
                    }`}
                  >
                    {timeRemaining}
                  </div>
                  <div>
                    <div className="text-purple-300 text-sm uppercase">
                      Play Time
                    </div>
                    <div className="text-white font-bold text-2xl">
                      Make Your Move!
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Table */}
              <div className="relative bg-gradient-to-br from-purple-900/60 via-indigo-900/80 to-pink-900/60 backdrop-blur-md border-4 border-purple-500/40 rounded-3xl p-8 shadow-2xl min-h-[500px]">
                {/* Players with Achievements */}
                {PLAYERS.map((player) => (
                  <div
                    key={player.id}
                    className={`absolute ${getPlayerPosition(player.position)} min-w-[160px]`}
                  >
                    <div
                      className={`rounded-2xl p-4 border-2 shadow-2xl ${
                        player.status === "active"
                          ? "bg-gradient-to-br from-purple-700/80 to-indigo-900/80 border-purple-400/50"
                          : player.status === "folded"
                            ? "bg-gray-800/40 border-gray-600/30 opacity-50"
                            : "bg-gradient-to-br from-orange-600/80 to-red-600/80 border-orange-400"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-5xl mb-2">{player.avatar}</div>
                        <div className="text-white font-bold text-sm mb-1">
                          {player.name}
                        </div>
                        <div className="text-yellow-400 font-bold text-lg mb-1">
                          ₹{(player.chips / 1000).toFixed(0)}K
                        </div>
                        {player.achievements.length > 0 && (
                          <div className="bg-yellow-500/20 border border-yellow-400 rounded px-2 py-1 text-xs text-yellow-300 font-bold mb-1">
                            {player.achievements[0]}
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <span className="text-lg">
                            {getMoodEmoji(player.mood)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Center Pot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-pink-600/40 to-purple-600/40 backdrop-blur-xl border-4 border-yellow-400 rounded-3xl p-6 shadow-2xl shadow-pink-500/50">
                    <div className="text-center">
                      <div className="text-pink-300 text-sm font-semibold uppercase mb-1">
                        Fun Pot
                      </div>
                      <div className="text-yellow-400 font-bold text-4xl mb-2">
                        ₹{(mainPot / 1000).toFixed(0)}K
                      </div>
                      <div className="flex items-center justify-center gap-1 text-white text-xs">
                        <Heart className="w-3 h-3 text-pink-400 animate-pulse" />
                        Social Game
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <Button
                  onClick={() => handleBet("pack")}
                  className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-7 text-lg font-bold rounded-xl shadow-2xl"
                >
                  Pack
                </Button>
                <Button
                  onClick={() => handleBet("chaal")}
                  className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-7 text-lg font-bold rounded-xl shadow-2xl"
                >
                  Chaal
                </Button>
                <Button
                  onClick={() => handleBet("sideshow")}
                  className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-7 text-lg font-bold rounded-xl shadow-2xl"
                >
                  Side Show
                </Button>
                <Button
                  onClick={() => handleBet("show")}
                  className="bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-7 text-lg font-bold rounded-xl shadow-2xl"
                >
                  Show
                </Button>
              </div>
            </div>

            {/* Live Chat Panel - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Chat Messages */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-pink-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-pink-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                </h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto mb-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-black/40 rounded-lg p-3 border border-purple-500/20"
                    >
                      <div className="flex items-start gap-2">
                        {msg.emoji && (
                          <span className="text-xl">{msg.emoji}</span>
                        )}
                        <div>
                          <div className="text-pink-400 font-semibold text-xs">
                            {msg.player}
                          </div>
                          <div className="text-white text-sm">
                            {msg.message}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Messages */}
                <div className="space-y-2">
                  <div className="text-purple-300 text-xs font-semibold uppercase">
                    Quick Messages
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_MESSAGES.map((qm, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendQuickMessage(qm.text, qm.emoji)}
                        className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold rounded-lg p-2 shadow-lg transform hover:scale-105 transition-all"
                      >
                        {qm.emoji} {qm.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emoji Reactions */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-pink-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-pink-300 font-bold text-lg mb-3">
                  Quick Reactions
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {EMOJI_REACTIONS.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        toast({
                          title: "Reaction Sent!",
                          description: emoji,
                        });
                      }}
                      className="bg-black/40 hover:bg-purple-600/40 rounded-xl p-3 text-3xl shadow-lg transform hover:scale-125 transition-all border border-purple-500/20"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chip Selector */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-pink-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-pink-300 font-bold text-lg mb-4">
                  Select Chip
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-3 font-bold text-lg shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white border-pink-300 scale-105"
                          : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 border-gray-600/50"
                      }`}
                    >
                      ₹{value.toLocaleString()}
                      {selectedChip === value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
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
