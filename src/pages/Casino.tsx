import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { GameCard } from "@/components/casino/GameCard";
import { CASINO_CATEGORIES } from "@/data/casinoCategories";
import type { CasinoCategoryId } from "@/data/casinoCategories";
import { fetchCasinoGames } from "@/services/casino";
import type { CasinoGame } from "@/types/casino";
import { Button } from "@/components/ui/button";
import { hasCustomPage } from "@/data/gameRouteMapping";

export default function Casino() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  // Keep the UI clean: show only important categories and tags
  const CATEGORY_WHITELIST: CasinoCategoryId[] = [
    "all",
    "teenpatti",
    "baccarat",
    "andar-bahar",
    "dragon-tiger",
    "matka",
    "others",
  ];
  const DISPLAYED_CATEGORIES = CASINO_CATEGORIES.filter((c) =>
    CATEGORY_WHITELIST.includes(c.id as CasinoCategoryId),
  );
  const TAGS: Array<{ id: string; label: string }> = [
    { id: "vip", label: "VIP" },
    { id: "premium", label: "Premium" },
    { id: "virtual", label: "Virtual" },
    { id: "tembo", label: "Tembo" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    const tag = params.get("tag");
    if (cat && CATEGORY_WHITELIST.includes(cat as CasinoCategoryId)) {
      setActiveCategory(cat);
    }
    setTagFilter(tag ? tag.toLowerCase() : null);
  }, [location.search]);

  const handleSetTag = (tag: string | null) => {
    const params = new URLSearchParams(location.search);
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    // preserve selected category in URL too
    if (!params.get("cat")) {
      params.set("cat", activeCategory);
    }
    navigate({ pathname: "/casino", search: params.toString() });
  };

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

  const filteredGames = useMemo(() => {
    const base = gamesByCategory[activeCategory] || [];
    if (!tagFilter) return base;
    const tag = tagFilter.toLowerCase();
    return base.filter((game) => {
      const name = game.gname?.toLowerCase() || "";
      const provider =
        (game.provider as any)?.toString()?.toLowerCase?.() || "";
      const id = game.gmid?.toLowerCase() || "";
      // generic contains check
      if (name.includes(tag) || provider.includes(tag) || id.includes(tag))
        return true;
      // friendly synonyms mapping
      if (tag === "vip") return name.includes("v vip") || name.includes("vip ");
      if (tag === "premium") return name.includes("premium");
      if (tag === "virtual") return name.includes("virtual");
      if (tag === "tembo") return name.includes("tembo");
      if (tag === "slot") return name.includes("slot");
      if (tag === "fantasy") return name.includes("fantasy");
      return false;
    });
  }, [gamesByCategory, activeCategory, tagFilter]);

  // Determine which tag chips should be visible based on available games in current category
  const availableTags = useMemo(() => {
    const base = gamesByCategory[activeCategory] || [];
    const matchesTag = (tag: string, game: CasinoGame) => {
      const name = game.gname?.toLowerCase() || "";
      const provider =
        (game.provider as any)?.toString()?.toLowerCase?.() || "";
      const id = game.gmid?.toLowerCase() || "";
      if (name.includes(tag) || provider.includes(tag) || id.includes(tag))
        return true;
      if (tag === "vip") return name.includes("v vip") || name.includes("vip ");
      if (tag === "premium") return name.includes("premium");
      if (tag === "virtual") return name.includes("virtual");
      if (tag === "tembo") return name.includes("tembo");
      if (tag === "slot") return name.includes("slot");
      if (tag === "fantasy") return name.includes("fantasy");
      return false;
    };
    return TAGS.filter((t) => base.some((g) => matchesTag(t.id, g)));
  }, [gamesByCategory, activeCategory]);

  const [visibleCount, setVisibleCount] = useState(30);

  // Reset visibleCount when category or tag changes
  useEffect(() => {
    setVisibleCount(30);
  }, [activeCategory, tagFilter]);

  const handlePlay = (game: CasinoGame) => {
    const gameId = game.gmid.toLowerCase();
    // Check if game has a custom page, otherwise use generic casino game page
    if (hasCustomPage(gameId)) {
      navigate(`/casino/${gameId}`);
    } else {
      navigate(`/casino/${game.gmid}`);
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
          <p className="text-destructive mb-4">Failed to load casino games</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full mx-auto">
        {/* Unified Filters: Categories + Tags in one row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {DISPLAYED_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1.5 text-xs whitespace-nowrap border transition-colors ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              <span className="font-semibold">{category.name}</span>
              <span className="ml-2 text-[10px] text-muted-foreground">
                {gamesByCategory[category.id]?.length || 0}
              </span>
            </button>
          ))}

          {/* Divider */}
          <span className="hidden sm:inline-block w-px h-5 bg-border mx-1" />

          {/* Tag pills */}
          {availableTags.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSetTag(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                tagFilter === t.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-muted text-foreground border-border hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
          {tagFilter && (
            <button
              onClick={() => handleSetTag(null)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-transparent hover:bg-muted"
            >
              Clear
            </button>
          )}
        </div>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No games in this category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {filteredGames.slice(0, visibleCount).map((game) => (
                <GameCard
                  key={game.gmid}
                  game={game}
                  onClick={() => handlePlay(game)}
                />
              ))}
            </div>

            {filteredGames.length > visibleCount && (
              <div className="flex justify-center mt-8 pb-8">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                  className="min-w-[200px] border-primary/20 hover:bg-primary/10"
                >
                  Load More Games ({filteredGames.length - visibleCount} left)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
