import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGameBySlug, type CompleteCasinoGame } from "@/data/allCasinoGames";
import {
  ArrowLeft,
  Crown,
  Star,
  Radio,
  Info,
  History,
  TrendingUp,
} from "lucide-react";
import { fetchCasinoResult } from "@/services/casino";
import { useToast } from "@/hooks/use-toast";

export default function GenericGameTemplate() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [game, setGame] = useState<CompleteCasinoGame | null>(null);
  const [gameResults, setGameResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      const foundGame = getGameBySlug(slug);
      if (foundGame) {
        setGame(foundGame);
        loadGameResults(foundGame.apiType);
      } else {
        toast({
          title: "Game not found",
          description: `The game "${slug}" could not be found.`,
          variant: "destructive",
        });
        navigate("/casino-lobby");
      }
    }
  }, [slug, navigate, toast]);

  const loadGameResults = async (gameType: string) => {
    setLoading(true);
    try {
      const result = await fetchCasinoResult(gameType);
      if (result?.data?.res) {
        setGameResults(result.data.res.slice(0, 10)); // Last 10 results
      }
    } catch (error) {
      console.error("Error loading game results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!game) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Loading game...
            </h2>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <div className="bg-gray-900/50 border-b border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/casino-lobby")}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Lobby
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">
                      {game.name}
                    </h1>
                    {game.isVIP && (
                      <Badge className="bg-yellow-600">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                    {game.isPremium && (
                      <Badge className="bg-purple-600">
                        <Star className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {game.isLive && (
                      <Badge className="bg-green-600 animate-pulse">
                        <Radio className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {game.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Game Area */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🎮</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {game.name}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Game implementation in progress
                    </p>
                    <div className="space-y-4">
                      <div className="bg-gray-900/50 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-sm text-gray-300 mb-3">
                          This is a template for <strong>{game.name}</strong>.
                          The full game interface will be implemented with:
                        </p>
                        <ul className="text-left text-sm text-gray-400 space-y-1">
                          {game.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-yellow-500 mr-2">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: `${game.name} will be available soon!`,
                          });
                        }}
                      >
                        Play Now (Demo)
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Game Info Tabs */}
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="bg-gray-900 border-gray-700">
                    <TabsTrigger value="info">
                      <Info className="w-4 h-4 mr-2" />
                      Info
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <History className="w-4 h-4 mr-2" />
                      History
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Stats
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          About {game.name}
                        </h3>
                        <p className="text-gray-400">{game.description}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Features
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {game.features.map((feature, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-gray-900/50 border-gray-600 text-gray-300"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {(game.minBet || game.maxBet) && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Betting Limits
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {game.minBet && (
                              <div className="bg-gray-900/50 rounded-lg p-3">
                                <p className="text-gray-400 text-sm">Min Bet</p>
                                <p className="text-white font-semibold">
                                  ₹{game.minBet}
                                </p>
                              </div>
                            )}
                            {game.maxBet && (
                              <div className="bg-gray-900/50 rounded-lg p-3">
                                <p className="text-gray-400 text-sm">Max Bet</p>
                                <p className="text-white font-semibold">
                                  ₹{game.maxBet}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Recent Results
                      </h3>
                      {loading ? (
                        <p className="text-gray-400">Loading results...</p>
                      ) : gameResults.length > 0 ? (
                        <div className="space-y-2">
                          {gameResults.map((result, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between"
                            >
                              <div>
                                <p className="text-white font-medium">
                                  Round #{result.mid}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {new Date(result.t).toLocaleString()}
                                </p>
                              </div>
                              <Badge className="bg-green-600">
                                Winner: {result.win}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No results available yet
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="stats" className="mt-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Game Statistics
                      </h3>
                      <p className="text-gray-400">
                        Statistics will be available once you start playing
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Bet Slip Card */}
              <Card className="bg-gray-800 border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Bet Slip
                </h3>
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No active bets</p>
                </div>
              </Card>

              {/* Quick Stats Card */}
              <Card className="bg-gray-800 border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Total Games</p>
                    <p className="text-white font-semibold text-xl">0</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Win Rate</p>
                    <p className="text-white font-semibold text-xl">-</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Total Wagered</p>
                    <p className="text-white font-semibold text-xl">₹0</p>
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
