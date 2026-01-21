import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameCard } from "@/components/casino/GameCard";
import { fetchCasinoGames, inferCategory } from "@/services/casino";
import type { CasinoGame } from "@/types/casino";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Filter, Search } from "lucide-react";

const CATEGORY_ORDER = [
  "Teen Patti",
  "Roulette",
  "Andar Bahar",
  "Poker",
  "Dragon Tiger",
  "Baccarat",
  "Sic Bo",
  "Cricket",
  "Lucky",
  "Other",
];

export default function Casino() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
  });

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categorized = useMemo(() => {
    const byCat: Record<string, CasinoGame[]> = {};
    (data ?? []).forEach((g) => {
      const cat = inferCategory(g);
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(g);
    });
    return byCat;
  }, [data]);

  const filtered = useMemo(() => {
    let games = (data ?? []).filter((g) =>
      g.gname.toLowerCase().includes(search.toLowerCase()),
    );
    if (activeCategory) {
      games = games.filter((g) => inferCategory(g) === activeCategory);
    }
    return games;
  }, [data, search, activeCategory]);

  const categories = useMemo(() => {
    const keys = Object.keys(categorized);
    return CATEGORY_ORDER.filter((c) => keys.includes(c));
  }, [categorized]);

  const categoryCount = (cat: string) => categorized[cat]?.length ?? 0;

  const handlePlay = (game: CasinoGame) => {
    navigate(`/casino/${game.gmid}`);
  };

  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4 md:p-8 rounded-xl border border-purple-700 mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
            <Sparkles className="h-5 w-5 md:h-7 md:w-7" />
            Casino Games
          </h1>
          <Badge className="bg-white text-purple-900 rounded-none font-bold tracking-widest uppercase">
            {data?.length ?? 0} Games
          </Badge>
        </div>
        <p className="text-purple-200 mt-2">
          Discover live and classic casino titles.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        <Card className="p-2 md:p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 md:h-4 md:w-4 absolute left-2 top-2 md:top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 md:pl-8 text-xs md:text-sm rounded-xl h-8 md:h-10"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-xl h-8 md:h-10 px-2 md:px-4">
              <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">Filter</span>
            </Button>
          </div>
        </Card>

        <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            className="rounded-xl text-[10px] md:text-xs uppercase flex-shrink-0 px-2 md:px-4"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "outline"}
              className="rounded-xl text-[10px] md:text-xs uppercase flex items-center gap-1 md:gap-2 flex-shrink-0 px-2 md:px-4"
              onClick={() => setActiveCategory(cat)}
            >
              <span>{cat}</span>
              <Badge className="rounded-xl px-1 md:px-2 py-0 text-[9px] md:text-[10px]">
                {categoryCount(cat)}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <Card className="p-6 rounded-xl">
          <p className="text-sm text-muted-foreground">Loading casino games…</p>
        </Card>
      )}
      {isError && (
        <Card className="p-6 rounded-xl">
          <p className="text-sm text-destructive">
            Failed to load casino games.
          </p>
        </Card>
      )}

      {!isLoading &&
        !isError &&
        (filtered.length === 0 ? (
          <Card className="p-10 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">
              No games match your filters.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {filtered.map((game) => (
              <GameCard key={game.gmid} game={game} onPlay={handlePlay} />
            ))}
          </div>
        ))}
    </MainLayout>
  );
}
