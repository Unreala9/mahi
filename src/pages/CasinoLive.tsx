import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchCasinoGames } from "@/services/casino";
import { LiveCasinoGrid } from "@/components/casino/LiveCasinoGrid";
import { CASINO_CATEGORIES } from "@/data/casinoCategories";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Radio,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CasinoGame } from "@/types/casino";

// Helper for rendering image with fallback (Inlined for simplicity in this page)
const GameCard = ({
  game,
  onClick,
}: {
  game: CasinoGame;
  onClick: (g: CasinoGame) => void;
}) => {
  // Simplified for live grid consistency matching Casino.tsx
  // In a real app, I'd export the CasinoGameCard from Casino.tsx or a shared component
  // For now, I will use a similar structure
  return (
    <div
      className="group relative aspect-[3/4] bg-[#0a1120] border border-white/5 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick(game)}
    >
      {/* Tech corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 z-10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 z-10" />

      <img
        src={`https://diamond-api.b-cdn.net/game-image/${game.gmid}/${game.imgpath}`}
        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
        loading="lazy"
        onError={(e) => (e.currentTarget.src = "/placeholder-game.jpg")}
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

  const filteredGames = gamesByCategory[activeCategory] || [];
  const [visibleCount, setVisibleCount] = useState(24);

  const scrollTabs = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handlePlay = (game: CasinoGame) => {
    navigate(`/casino/${game.gmid}`);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-white -m-4 p-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#0a1120] border border-white/10 flex items-center justify-center relative">
          <Video className="w-5 h-5 text-red-500" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.2em] font-display text-white">
            Live<span className="text-red-500">Stream</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
            <Radio className="w-3 h-3 text-red-500" />
            Real-time Dealer Feed
          </p>
        </div>
      </div>

      {/* Navigation Tabs - Terminal Style */}
      <div className="relative mb-8 bg-[#0a1120] border-y border-white/5 p-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-10 w-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-none"
            onClick={() => scrollTabs("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth flex gap-1"
          >
            {CASINO_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id;
              const count = gamesByCategory[category.id]?.length || 0;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setVisibleCount(24);
                  }}
                  className={`
                      flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border
                      ${
                        isActive
                          ? "bg-red-500 text-black border-red-500"
                          : "bg-transparent text-gray-500 border-transparent hover:border-white/10 hover:text-white"
                      }
                    `}
                >
                  {category.name}
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono ${isActive ? "bg-black/20 text-black" : "bg-white/5 text-gray-600"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-10 w-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-none"
            onClick={() => scrollTabs("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Games Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-[#0a1120] animate-pulse" />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600 font-mono border border-dashed border-white/5 bg-[#0a1120]/50">
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
                className="bg-[#0a1120] border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black rounded-none h-12 min-w-[200px] font-bold uppercase tracking-widest text-xs transition-all"
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
