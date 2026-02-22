import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCasinoGames } from "@/services/casino";
import type { CasinoGame } from "@/types/casino";
import { Button } from "@/components/ui/button";
import { hasCustomPage } from "@/data/gameRouteMapping";
import {
  Loader2,
  Zap,
  Flame,
  Plane,
  Bomb,
  Palette,
  Spade,
  Club,
  Gamepad2,
  Gift,
  Dices,
  Trophy,
  LayoutGrid,
  Cpu,
  Layers,
  Target,
  Swords,
  Landmark,
  Search,
} from "lucide-react";
import { CasinoHero } from "@/components/casino/CasinoHero";
import { CasinoToolbar } from "@/components/casino/CasinoToolbar";
import { CasinoGameCard } from "@/components/casino/CasinoGameCard";

// Using the same categories but structured for the toolbar
const MICRO_CATEGORIES = [
  {
    id: "dragon-tiger",
    name: "Dragon Tiger",
    icon: <Flame className="w-5 h-5 text-orange-500" />,
  },
  {
    id: "aviator",
    name: "Aviator",
    icon: <Plane className="w-5 h-5 text-red-500" />,
  },
  {
    id: "mines",
    name: "Mines",
    icon: <Bomb className="w-5 h-5 text-yellow-500" />,
  },
  {
    id: "color-game",
    name: "Color Game",
    icon: <Palette className="w-5 h-5 text-purple-500" />,
  },
  {
    id: "teenpatti",
    name: "Teenpatti",
    icon: <Spade className="w-5 h-5 text-green-500" />,
  },
  {
    id: "32-cards",
    name: "32 Cards",
    icon: <LayoutGrid className="w-5 h-5 text-blue-500" />,
  },
  {
    id: "andar-bahar",
    name: "Andar Bahar",
    icon: <Layers className="w-5 h-5 text-indigo-500" />,
  },
  {
    id: "lucky-7",
    name: "Lucky 7",
    icon: <Dices className="w-5 h-5 text-pink-500" />,
  },
  {
    id: "poker",
    name: "Live Poker",
    icon: <Club className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: "3-card",
    name: "3 Card Judgement",
    icon: <Gamepad2 className="w-5 h-5 text-cyan-500" />,
  },
  {
    id: "roulette",
    name: "Roulette",
    icon: <Target className="w-5 h-5 text-red-400" />,
  },
  {
    id: "casino-war",
    name: "Casino War",
    icon: <Swords className="w-5 h-5 text-gray-400" />,
  },
  {
    id: "baccarat",
    name: "Baccarat",
    icon: <Landmark className="w-5 h-5 text-amber-500" />,
  },
  {
    id: "matka",
    name: "Matka",
    icon: <Dices className="w-5 h-5 text-orange-400" />,
  },
  {
    id: "cricket",
    name: "Cricket",
    icon: <Trophy className="w-5 h-5 text-blue-400" />,
  },
  {
    id: "slots",
    name: "Slots",
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
  },
  {
    id: "virtual",
    name: "Virtual",
    icon: <Gamepad2 className="w-5 h-5 text-teal-400" />,
  },
  {
    id: "others",
    name: "Others",
    icon: <Gift className="w-5 h-5 text-rose-400" />,
  },
];

export default function Casino() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMicro, setActiveMicro] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(30);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Parse URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    if (cat) {
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
      <div className="flex items-center justify-center h-[60vh] bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#1a472a] animate-spin" />
          <p className="font-mono text-xs text-[#1a472a] animate-pulse">
            Initializing Casino Protocol...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-900 -mt-4 -mx-4 pb-20 md:p-6 p-0 overflow-x-hidden">
      {/* 1. Hero Section */}
      <CasinoHero />

      <div className="px-4 md:px-0">
        {/* 2. Toolbar (Sticky) */}
        <CasinoToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeMicro}
          setActiveCategory={setActiveMicro}
          categories={MICRO_CATEGORIES}
          totalGames={filteredGames.length}
        />

        {/* 3. Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500 font-mono border border-dashed border-gray-300 rounded-lg bg-white shadow-sm">
            <Zap className="w-12 h-12 opacity-50 mb-4 animate-pulse text-[#f28729]" />
            <p className="tracking-widest uppercase text-sm font-bold">
              No Active Protocols Found
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
              {filteredGames.slice(0, visibleCount).map((game, index) => (
                <div
                  key={game.gmid}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CasinoGameCard
                    game={game}
                    onClick={handlePlay}
                    priority={index < 8}
                  />
                </div>
              ))}
            </div>

            {filteredGames.length > visibleCount && (
              <div className="flex justify-center mt-12 mb-8">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + 30)}
                  className="bg-white border-gray-300 text-[#1a472a] hover:bg-gray-50 hover:text-[#1a472a] rounded-full px-8 h-12 font-bold uppercase tracking-widest text-xs transition-all animate-pulse shadow-sm"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Loader2 className="w-4 h-4" />
                    Load More
                  </span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
