import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ALL_CASINO_GAMES,
  GAME_CATEGORIES,
  getGamesByCategory,
  getVIPGames,
  getPremiumGames,
  getLiveGames,
  type CompleteCasinoGame,
} from "@/data/allCasinoGames";
import { Search, Filter, Star, Crown, Radio } from "lucide-react";

export default function CasinoLobby() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVIP, setFilterVIP] = useState(false);
  const [filterPremium, setFilterPremium] = useState(false);
  const [filterLive, setFilterLive] = useState(false);

  // Filter games based on category, search, and filters
  const filteredGames = useMemo(() => {
    let games = getGamesByCategory(activeCategory);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      games = games.filter(
        (game) =>
          game.name.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.slug.toLowerCase().includes(query),
      );
    }

    // Apply VIP filter
    if (filterVIP) {
      games = games.filter((game) => game.isVIP);
    }

    // Apply Premium filter
    if (filterPremium) {
      games = games.filter((game) => game.isPremium);
    }

    // Apply Live filter
    if (filterLive) {
      games = games.filter((game) => game.isLive);
    }

    return games;
  }, [activeCategory, searchQuery, filterVIP, filterPremium, filterLive]);

  const handlePlayGame = (game: CompleteCasinoGame) => {
    // Navigate to the game page
    navigate(`/casino/${game.slug}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <div className="bg-gray-900/50 border-b border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              {/* Title and Stats */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Casino Lobby
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {ALL_CASINO_GAMES.length} games available
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    {getVIPGames().length} VIP
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-500/10 text-purple-500 border-purple-500/20"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {getPremiumGames().length} Premium
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-500 border-green-500/20"
                  >
                    <Radio className="w-3 h-3 mr-1" />
                    {getLiveGames().length} Live
                  </Badge>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterVIP ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterVIP(!filterVIP)}
                    className={
                      filterVIP ? "bg-yellow-600 hover:bg-yellow-700" : ""
                    }
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    VIP
                  </Button>
                  <Button
                    variant={filterPremium ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterPremium(!filterPremium)}
                    className={
                      filterPremium ? "bg-purple-600 hover:bg-purple-700" : ""
                    }
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Premium
                  </Button>
                  <Button
                    variant={filterLive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterLive(!filterLive)}
                    className={
                      filterLive ? "bg-green-600 hover:bg-green-700" : ""
                    }
                  >
                    <Radio className="w-4 h-4 mr-1" />
                    Live
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-gray-900/30 border-b border-gray-800 sticky top-[140px] z-10 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
              {GAME_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex-shrink-0 ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="container mx-auto px-4 py-8">
          {filteredGames.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No games found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {GAME_CATEGORIES.find((c) => c.id === activeCategory)?.name ||
                    "All Games"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {filteredGames.length} game
                  {filteredGames.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 group cursor-pointer"
                    onClick={() => handlePlayGame(game)}
                  >
                    {/* Game Image Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <div className="text-6xl opacity-50">
                        {GAME_CATEGORIES.find((c) => c.id === game.category)
                          ?.icon || "🎮"}
                      </div>

                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {game.isVIP && (
                          <Badge className="bg-yellow-600 text-white">
                            <Crown className="w-3 h-3" />
                          </Badge>
                        )}
                        {game.isPremium && (
                          <Badge className="bg-purple-600 text-white">
                            <Star className="w-3 h-3" />
                          </Badge>
                        )}
                        {game.isLive && (
                          <Badge className="bg-green-600 text-white animate-pulse">
                            <Radio className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>

                      {/* Hover Play Button */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                          Play Now
                        </Button>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-lg mb-1 truncate">
                        {game.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {game.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {game.features.slice(0, 2).map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-gray-900/50 border-gray-600 text-gray-300"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {game.features.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-900/50 border-gray-600 text-gray-400"
                          >
                            +{game.features.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
