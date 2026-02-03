import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";
const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

export default function AndarBahar20() {
  const navigate = useNavigate();

  // Use the universal casino game hook with live API data
  const {
    gameData,
    result,
    isConnected,
    markets,
    roundId,
    cards,
    placeBet,
    placedBets,
    clearBets,
    totalStake,
    potentialWin,
    isSuspended,
  } = useUniversalCasinoGame({
    gameType: "ab20",
    gameName: "Andar Bahar 20",
  });

  const [countdown, setCountdown] = useState(20);
  const [isDealing, setIsDealing] = useState(false);
  const [jokerCard, setJokerCard] = useState("🂮");

  // Parse API card data
  useEffect(() => {
    if (cards) {
      // Format: "2CC,1" or similar
      // Extract joker card if available
      const cardData = cards.split(",");
      if (cardData[0]) {
        setJokerCard(`🂮`); // Can map card codes to emoji
      }
    }
  }, [cards]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsDealing(true);
          setTimeout(() => setIsDealing(false), 5000);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get Andar and Bahar markets
  const andarMarket = markets.find((m) =>
    m.nat.toLowerCase().includes("andar"),
  );
  const baharMarket = markets.find((m) =>
    m.nat.toLowerCase().includes("bahar"),
  );

  // Extract card timeline from result history
  const CARD_TIMELINE = result?.cards || [
    { side: "A", card: "🂡" },
    { side: "B", card: "🂮" },
    { side: "A", card: "🃋" },
    { side: "B", card: "🂫" },
  ];

  // Build history from last results
  const HISTORY = result
    ? [
        { winner: result.win === "1" ? "A" : "B", cards: 8 },
        { winner: "B", cards: 12 },
        { winner: "A", cards: 5 },
      ]
    : [
        { winner: "A", cards: 8 },
        { winner: "B", cards: 12 },
        { winner: "A", cards: 5 },
      ];

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
                  <span className="text-blue-500">Andar</span> Bahar{" "}
                  <span className="text-green-500">20</span>
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-lg">
                    {countdown}s
                  </span>
                  {roundId && (
                    <Badge variant="outline" className="ml-2">
                      Round: {roundId}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isConnected ? (
                  <Badge className="bg-green-600 animate-pulse">
                    <Clock className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary">Connecting...</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* History & Betting Panel (Left) */}
            <div className="lg:col-span-1 order-last lg:order-first space-y-4">
              {/* History Panel */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <h3 className="text-purple-400 font-bold mb-4 text-center">
                  History
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((historyItem, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border-2",
                        historyItem.winner === "A"
                          ? "bg-blue-900/30 border-blue-600"
                          : "bg-green-900/30 border-green-600",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "font-bold text-xl",
                            historyItem.winner === "A"
                              ? "text-blue-500"
                              : "text-green-500",
                          )}
                        >
                          {historyItem.winner === "A" ? "Andar" : "Bahar"}
                        </span>
                        <Badge
                          className={cn(
                            historyItem.winner === "A"
                              ? "bg-blue-600"
                              : "bg-green-600",
                          )}
                        >
                          {historyItem.cards} cards
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Live Betting Panel */}
              {markets.length > 0 && (
                <CasinoBettingPanel
                  markets={markets}
                  onPlaceBet={placeBet}
                  placedBets={placedBets}
                  totalStake={totalStake}
                  potentialWin={potentialWin}
                  onClearBets={clearBets}
                  isSuspended={isSuspended}
                  roundId={roundId}
                />
              )}

              {/* Last Result */}
              {result && (
                <Card className="bg-gray-800/50 border-yellow-600/20 p-4">
                  <h3 className="text-yellow-400 font-bold mb-3">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Last Result
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Round</p>
                      <p className="text-sm font-mono text-white">
                        {result.mid}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Winner</p>
                      <Badge className="bg-green-600 mt-1">{result.win}</Badge>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Game Board (Center) */}
            <div className="lg:col-span-3">
              {/* Joker Card at Top */}
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-600/50 p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-purple-400 font-bold text-lg mb-4">
                    JOKER CARD
                  </h3>
                  <div
                    className={cn(
                      "aspect-[3/4] max-w-[150px] mx-auto bg-white rounded-xl flex items-center justify-center text-8xl shadow-2xl border-4 border-purple-500 transition-all duration-500",
                      isDealing && "scale-110 animate-pulse",
                    )}
                  >
                    {jokerCard}
                  </div>
                  <p className="text-gray-400 text-sm mt-3">
                    Match this card to win!
                  </p>
                </div>
              </Card>

              {/* Betting Areas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Andar (Left) */}
                <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-blue-600/50 p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-blue-500 mb-2">
                      ANDAR
                    </h2>
                    <Badge className="bg-blue-600 text-white">
                      {andarMarket ? (andarMarket.b / 100).toFixed(2) : "1.90"}x
                    </Badge>
                    {andarMarket?.gstatus === "SUSPENDED" && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Suspended
                      </Badge>
                    )}
                  </div>

                  <div className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-8 rounded-lg transition-all border-4 border-blue-400 shadow-lg shadow-blue-600/50 flex items-center justify-center">
                    <div className="text-center">
                      <div>BET ON ANDAR</div>
                      {placedBets.has(andarMarket?.sid.toString() || "") && (
                        <div className="text-sm mt-2">
                          ₹
                          {placedBets.get(andarMarket?.sid.toString() || "")
                            ?.stake || 0}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Timeline - Andar Side */}
                  <div className="mt-6 space-y-2">
                    <p className="text-blue-400 text-sm font-bold">
                      Andar Cards:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {CARD_TIMELINE.filter((c) => c.side === "A").map(
                        (card, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-14 bg-white rounded flex items-center justify-center text-2xl border-2 border-blue-500"
                          >
                            {card.card}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </Card>

                {/* Bahar (Right) */}
                <Card className="bg-gradient-to-br from-green-950/50 to-green-900/30 border-green-600/50 p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-green-500 mb-2">
                      BAHAR
                    </h2>
                    <Badge className="bg-green-600 text-white">
                      {baharMarket ? (baharMarket.b / 100).toFixed(2) : "1.90"}x
                    </Badge>
                    {baharMarket?.gstatus === "SUSPENDED" && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Suspended
                      </Badge>
                    )}
                  </div>

                  <div className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-8 rounded-lg transition-all border-4 border-green-400 shadow-lg shadow-green-600/50 flex items-center justify-center">
                    <div className="text-center">
                      <div>BET ON BAHAR</div>
                      {placedBets.has(baharMarket?.sid.toString() || "") && (
                        <div className="text-sm mt-2">
                          ₹
                          {placedBets.get(baharMarket?.sid.toString() || "")
                            ?.stake || 0}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Timeline - Bahar Side */}
                  <div className="mt-6 space-y-2">
                    <p className="text-green-400 text-sm font-bold">
                      Bahar Cards:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {CARD_TIMELINE.filter((c) => c.side === "B").map(
                        (card, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-14 bg-white rounded flex items-center justify-center text-2xl border-2 border-green-500"
                          >
                            {card.card}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Vertical Card Timeline (Full) */}
              {Array.isArray(CARD_TIMELINE) && CARD_TIMELINE.length > 0 && (
                <Card className="bg-gray-800/50 border-purple-600/20 p-4 mb-4">
                  <h3 className="text-purple-400 font-bold mb-3">
                    Card Timeline
                  </h3>
                  <div className="flex gap-1 overflow-x-auto pb-2">
                    {CARD_TIMELINE.map((cardItem: any, idx: number) => (
                      <div key={idx} className="flex-shrink-0">
                        <div
                          className={cn(
                            "w-16 h-24 bg-white rounded flex items-center justify-center text-4xl border-4 transition-all hover:scale-105",
                            cardItem.side === "A"
                              ? "border-blue-500"
                              : "border-green-500",
                          )}
                        >
                          {cardItem.card}
                        </div>
                        <p
                          className={cn(
                            "text-center text-xs font-bold mt-1",
                            cardItem.side === "A"
                              ? "text-blue-500"
                              : "text-green-500",
                          )}
                        >
                          {cardItem.side === "A" ? "Andar" : "Bahar"}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Game Info */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Game Status:</span>
                    <span
                      className={cn(
                        "font-bold",
                        isSuspended ? "text-red-500" : "text-green-500",
                      )}
                    >
                      {isSuspended ? "Suspended" : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connection:</span>
                    <span
                      className={cn(
                        "font-bold",
                        isConnected ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {isConnected ? "Live" : "Offline"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Markets:</span>
                    <span className="text-white font-bold">
                      {markets.length}
                    </span>
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
