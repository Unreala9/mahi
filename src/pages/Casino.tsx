import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { GameCard } from "@/components/casino/GameCard";
import { CASINO_CATEGORIES } from "@/data/casinoCategories";
import { fetchCasinoGames } from "@/services/casino";
import type { CasinoGame } from "@/types/casino";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Casino() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    if (!cat) return;
    if (CASINO_CATEGORIES.some((c) => c.id === cat)) {
      setActiveCategory(cat);
    }
  }, [location.search]);

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
    retryDelay: 500,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Categorize games
  const gamesByCategory = useMemo(() => {
    if (!apiGames) return {} as Record<string, CasinoGame[]>;

    const categorized: Record<string, CasinoGame[]> = {
      all: [...apiGames],
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

    apiGames.forEach((game) => {
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
  }, [apiGames]);

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

  const handlePlay = (game: CasinoGame) => {
    navigate(`/casino/${game.gmid}`);
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
          <p className="text-destructive mb-4">Failed to load casino games</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Horizontal Scrolling Tabs */}
      <div className="relative mb-4 -mx-6 px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-9 w-9"
            onClick={() => scrollTabs("left")}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            <div className="flex gap-2 min-w-max pb-1">
              {CASINO_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 text-sm whitespace-nowrap border transition-colors ${
                    activeCategory === category.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  <span className="font-semibold">{category.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {gamesByCategory[category.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-9 w-9"
            onClick={() => scrollTabs("right")}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No games in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredGames.map((game) => (
            <GameCard
              key={game.gmid}
              game={game}
              onClick={() => handlePlay(game)}
            />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
