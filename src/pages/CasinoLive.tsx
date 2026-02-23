import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchCasinoGames, getImageCandidates } from "@/services/casino";
import { LiveCasinoGrid } from "@/components/casino/LiveCasinoGrid";
import { CASINO_CATEGORIES } from "@/data/casinoCategories";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Radio,
  Terminal,
  Search,
  X,
  LayoutGrid,
  Target,
  Spade,
  Club,
  Landmark,
  Flame,
  Layers,
  Dices,
  GamepadIcon as Gamepad2,
  Swords,
  Trophy,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CasinoGame } from "@/types/casino";
import { CasinoToolbar } from "@/components/casino/CasinoToolbar";

// Helper for rendering image with fallback (Inlined for simplicity in this page)
const GameCard = ({
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
      className="group relative aspect-[3/4] bg-white border border-gray-200 hover:border-[#1a472a] hover:shadow-lg transition-all cursor-pointer overflow-hidden rounded-sm"
      onClick={() => onClick(game)}
    >
      {/* Tech corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-300 z-10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-300 z-10" />

      <img
        src={hasError ? "/placeholder-game.jpg" : imgSrc}
        alt={game.gname}
        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
        loading="lazy"
        onError={handleError}
      />

      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">
            Live
          </span>
        </div>
        <p className="text-xs font-bold text-white uppercase font-display line-clamp-1 group-hover:text-primary transition-colors">
          {game.gname}
        </p>
      </div>
    </div>
  );
};

export default function CasinoLive() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch casino games
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

  const liveGames = useMemo(() => apiGames || [], [apiGames]);

  // Categorize live games
  const gamesByCategory = useMemo(() => {
    if (!liveGames) return {} as Record<string, CasinoGame[]>;

    const categorized: Record<string, CasinoGame[]> = {
      all: [...liveGames],
      roulette: [],
      teenpatti: [],
      poker: [],
      baccarat: [],
      "dragon-tiger": [],
      "32-cards": [],
      "andar-bahar": [],
      "lucky-7": [],
      "3-card": [],
      "casino-war": [],
      matka: [],
      cricket: [],
      others: [],
    };

    liveGames.forEach((game) => {
      const name = game.gname.toLowerCase();
      if (name.includes("roulette")) categorized.roulette.push(game);
      else if (name.includes("teen") || name.includes("teenpatti"))
        categorized.teenpatti.push(game);
      else if (name.includes("poker")) categorized.poker.push(game);
      else if (name.includes("baccarat")) categorized.baccarat.push(game);
      else if (name.includes("dragon") || name.includes("tiger"))
        categorized["dragon-tiger"].push(game);
      else if (name.includes("32") || name.includes("card32"))
        categorized["32-cards"].push(game);
      else if (name.includes("andar") || name.includes("bahar"))
        categorized["andar-bahar"].push(game);
      else if (name.includes("lucky") && name.includes("7"))
        categorized["lucky-7"].push(game);
      else if (name.includes("3") && name.includes("card"))
        categorized["3-card"].push(game);
      else if (name.includes("war")) categorized["casino-war"].push(game);
      else if (name.includes("matka")) categorized.matka.push(game);
      else if (name.includes("cricket")) categorized.cricket.push(game);
      else categorized.others.push(game);
    });

    return categorized;
  }, [liveGames]);

  // Apply search filter
  const filteredGames = useMemo(() => {
    let games = gamesByCategory[activeCategory] || [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      games = games.filter(
        (g) =>
          g.gname.toLowerCase().includes(q) ||
          (g.provider as any)?.toString()?.toLowerCase().includes(q),
      );
    }

    return games;
  }, [gamesByCategory, activeCategory, searchQuery]);

  const [visibleCount, setVisibleCount] = useState(24);

  // Map categories with icons for the toolbar
  const toolbarCategories = useMemo(() => {
    const iconMap: Record<string, React.ReactNode> = {
      all: <LayoutGrid className="w-5 h-5 text-primary" />,
      roulette: <Target className="w-5 h-5 text-red-400" />,
      teenpatti: <Spade className="w-5 h-5 text-green-500" />,
      poker: <Club className="w-5 h-5 text-emerald-500" />,
      baccarat: <Landmark className="w-5 h-5 text-amber-500" />,
      "dragon-tiger": <Flame className="w-5 h-5 text-orange-500" />,
      "32-cards": <LayoutGrid className="w-5 h-5 text-blue-500" />,
      "andar-bahar": <Layers className="w-5 h-5 text-indigo-500" />,
      "lucky-7": <Dices className="w-5 h-5 text-pink-500" />,
      "3-card": <Gamepad2 className="w-5 h-5 text-cyan-500" />,
      "casino-war": <Swords className="w-5 h-5 text-gray-400" />,
      matka: <Dices className="w-5 h-5 text-orange-400" />,
      cricket: <Trophy className="w-5 h-5 text-blue-400" />,
      others: <Gift className="w-5 h-5 text-rose-400" />,
    };

    return CASINO_CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: iconMap[cat.id] || <Gamepad2 className="w-5 h-5" />,
    }));
  }, []);

  const handlePlay = (game: CasinoGame) => {
    navigate(`/casino/${game.gmid}`);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-900 -m-4 p-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center relative shadow-sm rounded-sm">
          <Video className="w-5 h-5 text-red-500" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.2em] font-display text-gray-900">
            Live<span className="text-red-600">Stream</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <Radio className="w-3 h-3 text-red-500" />
            Real-time Dealer Feed
          </p>
        </div>
      </div>

      <CasinoToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={(c) => setActiveCategory(c || "all")}
        categories={toolbarCategories}
        totalGames={filteredGames.length}
      />

      {/* Games Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 font-bold border border-dashed border-gray-300 bg-white rounded-md shadow-sm">
          <Terminal className="w-12 h-12 opacity-30 mb-4" />
          <p className="uppercase tracking-widest text-xs">
            No Signal Detected
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {filteredGames.slice(0, visibleCount).map((game) => (
              <GameCard key={game.gmid} game={game} onClick={handlePlay} />
            ))}
          </div>

          {filteredGames.length > visibleCount && (
            <div className="flex justify-center mt-16 mb-12">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((c) => c + 24)}
                className="bg-white border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-sm h-12 min-w-[200px] font-bold uppercase tracking-widest text-xs transition-all shadow-sm"
              >
                Load More Streams
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
