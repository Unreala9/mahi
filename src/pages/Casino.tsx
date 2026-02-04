import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { CASINO_CATEGORIES } from "@/data/casinoCategories";
import { fetchCasinoGames } from "@/services/casino";
import type { CasinoGame } from "@/types/casino";
import { Button } from "@/components/ui/button";
import { hasCustomPage } from "@/data/gameRouteMapping";
import {
  Search,
  X,
  Loader2,
  Dices,
  Gamepad2,
  Ticket,
  Play,
  TrendingUp,
  Zap,
  Crown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getImageCandidates } from "@/services/casino";

// Extended categories to match the reference image
const MICRO_CATEGORIES = [
  { id: "dragon-tiger", name: "Dragon Tiger", icon: "🐉" },
  { id: "aviator", name: "Aviator", icon: "✈️" },
  { id: "mines", name: "Mines", icon: "💣" },
  { id: "color-game", name: "Color Game", icon: "🎨" },
  { id: "teenpatti", name: "Teenpatti", icon: "🃏" },
  { id: "32-cards", name: "32 Cards", icon: "🂠" },
  { id: "andar-bahar", name: "Andar Bahar", icon: "🂡" },
  { id: "lucky-7", name: "Lucky 7", icon: "7️⃣" },
  { id: "poker", name: "Live Poker", icon: "♣️" },
  { id: "3-card", name: "3 Card Judgement", icon: "⚖️" },
  { id: "roulette", name: "Roulette", icon: "🎡" },
  { id: "casino-war", name: "Casino War", icon: "⚔️" },
  { id: "baccarat", name: "Baccarat", icon: "🏦" },
  { id: "matka", name: "Matka", icon: "🎲" },
  { id: "cricket", name: "Cricket", icon: "🏏" },
  { id: "slots", name: "Slots", icon: "🎰" },
  { id: "virtual", name: "Virtual", icon: "🎮" },
  { id: "others", name: "Others", icon: "📦" },
];

// Helper component for robust image loading
const CasinoGameCard = ({
  game,
  onClick,
}: {
  game: CasinoGame;
  onClick: (g: CasinoGame) => void;
}) => {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgIndex, setImgIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Construct candidates including the specific CDN URL that uses gmid
  const candidates = useMemo(() => {
    const list = [
      `https://diamond-api.b-cdn.net/game-image/${game.gmid}/${game.imgpath}`,
      ...getImageCandidates(game.imgpath),
    ];
    return list;
  }, [game.gmid, game.imgpath]);

  useEffect(() => {
    if (candidates && candidates.length > 0) {
      setImgSrc(candidates[0]);
      setImgIndex(0);
      setHasError(false);
    }
  }, [candidates]);

  const handleError = () => {
    const nextIndex = imgIndex + 1;
    if (nextIndex < candidates.length) {
      setImgSrc(candidates[nextIndex]);
      setImgIndex(nextIndex);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#121c2c] border border-white/5 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick(game)}
    >
      {/* Image */}
      <img
        src={hasError ? "/placeholder-game.jpg" : imgSrc}
        alt={game.gname}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={handleError}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform">
        <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">
          {game.gname}
        </h3>
        <button className="w-full py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded hover:bg-blue-500 transition-colors opacity-0 group-hover:opacity-100">
          Play Now
        </button>
      </div>

      {/* Provider Badge (Optional) */}
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur rounded text-[8px] font-medium text-gray-300 border border-white/10">
        {game.provider || "Casino"}
      </div>
    </div>
  );
};

export default function Casino() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMicro, setActiveMicro] = useState<string | null>(null); // null means 'all' in context of micro
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(30);

  // Parse URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    if (cat) {
      // Try to match with micro categories first
      if (MICRO_CATEGORIES.some((c) => c.id === cat)) {
        setActiveMicro(cat);
      }
    }
  }, [location.search]);

  // Fetch games
  const {
    data: apiGames,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Categorize games logic
  const gamesByCategory = useMemo(() => {
    if (!apiGames) return {} as Record<string, CasinoGame[]>;

    const categorized: Record<string, CasinoGame[]> = {};

    // Initialize all buckets
    MICRO_CATEGORIES.forEach((c) => (categorized[c.id] = []));
    categorized["all"] = [...apiGames];

    apiGames.forEach((game) => {
      const name = game.gname.toLowerCase();
      const provider = (game.provider as any)?.toString()?.toLowerCase() || "";

      // Auto-categorization
      if (
        name.includes("dragon") ||
        name.includes("tiger") ||
        name.includes("dt")
      )
        categorized["dragon-tiger"].push(game);
      else if (name.includes("aviator")) categorized["aviator"].push(game);
      else if (name.includes("mines")) categorized["mines"].push(game);
      else if (name.includes("color") || name.includes("colour"))
        categorized["color-game"].push(game);
      else if (
        name.includes("teen") &&
        (name.includes("patti") || name.includes("pati"))
      )
        categorized["teenpatti"].push(game);
      else if (name.includes("32 cards") || name.includes("32cards"))
        categorized["32-cards"].push(game);
      else if (
        name.includes("andar") ||
        name.includes("bahar") ||
        name.includes("ab")
      )
        categorized["andar-bahar"].push(game);
      else if (name.includes("lucky 7") || name.includes("lucky7"))
        categorized["lucky-7"].push(game);
      else if (name.includes("poker")) categorized["poker"].push(game);
      else if (name.includes("3 card") || name.includes("three card"))
        categorized["3-card"].push(game);
      else if (name.includes("roulette")) categorized["roulette"].push(game);
      else if (name.includes("war")) categorized["casino-war"].push(game);
      else if (name.includes("baccarat")) categorized["baccarat"].push(game);
      else if (name.includes("matka") || name.includes("worli"))
        categorized["matka"].push(game);
      else if (name.includes("cricket")) categorized["cricket"].push(game);
      else if (name.includes("slot") || provider.includes("slot"))
        categorized["slots"].push(game);
      else if (name.includes("virtual") || provider.includes("virtual"))
        categorized["virtual"].push(game);
      else categorized["others"].push(game);
    });

    return categorized;
  }, [apiGames]);

  // Filtering
  const filteredGames = useMemo(() => {
    let games = activeMicro
      ? gamesByCategory[activeMicro] || []
      : gamesByCategory["all"];

    // Macro filter (Conceptual implementation as we assume 'all' contains everything)

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      games = games.filter(
        (g) =>
          g.gname.toLowerCase().includes(q) ||
          (g.provider as any)?.toString()?.toLowerCase().includes(q),
      );
    }

    return games || [];
  }, [gamesByCategory, activeMicro, searchQuery]);

  const handlePlay = (game: CasinoGame) => {
    const gameId = game.gmid.toLowerCase();
    if (hasCustomPage(gameId)) {
      navigate(`/casino/${gameId}`);
    } else {
      navigate(`/casino/${game.gmid}`);
    }
  };

  // Reset visible count on filter change
  useEffect(() => {
    setVisibleCount(30);
  }, [activeMicro, searchQuery]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh] bg-[#050b14]">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#050b14] text-white -mt-4 -mx-4 md:p-6 p-4">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121c2c] p-4 rounded-lg border border-blue-900/30 shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Dices className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
              Casino
            </h1>
          </div>

          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="pl-10 bg-[#0b121e] border-blue-900/50 text-white placeholder:text-gray-500 rounded-full focus:ring-blue-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Micro Categories (Icon Buttons) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 mb-8">
          <button
            onClick={() => setActiveMicro(null)}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
              !activeMicro
                ? "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500 shadow-lg shadow-blue-500/20"
                : "bg-[#121c2c] border-white/5 hover:border-blue-500/50 hover:bg-[#1a2638]"
            }`}
          >
            <span className="text-2xl">⚡</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">
              All Games
            </span>
          </button>

          {MICRO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveMicro(cat.id)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                activeMicro === cat.id
                  ? "bg-gradient-to-br from-white text-black border-white shadow-lg"
                  : "bg-[#121c2c] text-gray-300 border-white/5 hover:border-blue-500/50 hover:bg-[#1a2638]" // Inverted selected style to match ref image white selection
              }`}
            >
              <span className="text-2xl filter drop-shadow-sm">{cat.icon}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${activeMicro === cat.id ? "text-black" : "text-gray-300"}`}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Gamepad2 className="w-16 h-16 opacity-20 mb-4" />
            <p>No games found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
              {filteredGames.slice(0, visibleCount).map((game) => (
                <CasinoGameCard
                  key={game.gmid}
                  game={game}
                  onClick={handlePlay}
                />
              ))}
            </div>

            {filteredGames.length > visibleCount && (
              <div className="flex justify-center mt-12 mb-8">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + 30)}
                  className="bg-[#121c2c] border-blue-900 text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 min-w-[200px]"
                >
                  Load More Games
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
