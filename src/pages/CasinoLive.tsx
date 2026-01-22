import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { fetchCasinoGames } from "@/services/casino";
import { LiveCasinoGrid } from "@/components/casino/LiveCasinoGrid";
import { CASINO_CATEGORIES } from "@/data/casinoCategories";
import type { CasinoGame } from "@/types/casino";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CasinoLive() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch casino games - same as main casino page
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
    retryDelay: 500,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Show all games on casino-live page (same as main casino page)
  const liveGames = useMemo(() => {
    return apiGames || [];
  }, [apiGames]);

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
      else if (
        name.includes("dragon") ||
        name.includes("tiger") ||
        name.includes("dt")
      )
        categorized["dragon-tiger"].push(game);
      else if (name.includes("32") || name.includes("card32"))
        categorized["32-cards"].push(game);
      else if (
        name.includes("andar") ||
        name.includes("bahar") ||
        name.includes("ab")
      )
        categorized["andar-bahar"].push(game);
      else if (name.includes("lucky") && name.includes("7"))
        categorized["lucky-7"].push(game);
      else if (name.includes("3") && name.includes("card"))
        categorized["3-card"].push(game);
      else if (name.includes("war")) categorized["casino-war"].push(game);
      else if (name.includes("matka") || name.includes("worli"))
        categorized.matka.push(game);
      else if (name.includes("cricket")) categorized.cricket.push(game);
      else categorized.others.push(game);
    });

    return categorized;
  }, [liveGames]);

  const filteredGames = gamesByCategory[activeCategory] || [];

  const scrollTabs = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            Failed to load live casino games
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Horizontal Scrolling Tabs */}
      <div className="relative mb-6 -mx-4 px-4">
        <div className="flex items-center gap-2">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-10 w-10 rounded-full hover:bg-primary/10"
            onClick={() => scrollTabs("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Tabs Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            <div className="flex gap-2 min-w-max pb-1">
              {CASINO_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2.5 rounded-md font-semibold text-sm whitespace-nowrap transition-all ${
                    activeCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50"
                  }`}
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-70">
                    {gamesByCategory[category.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-10 w-10 rounded-full hover:bg-primary/10"
            onClick={() => scrollTabs("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            No live games in this category
          </p>
        </div>
      ) : (
        <LiveCasinoGrid games={filteredGames} maxDisplay={24} />
      )}
    </MainLayout>
  );
}
