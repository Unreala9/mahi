import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameCard } from "@/components/casino/GameCard";
import { CASINO_TABS } from "@/data/casinoGames";
import { fetchCasinoGames } from "@/services/casino";
import type { CasinoGame, CasinoTabCategory } from "@/types/casino";
import { Sparkles, Search, Trophy, Zap, Star } from "lucide-react";

export default function Casino() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<CasinoTabCategory>("SMART");

  // Fetch real casino games from API with fallback
  const {
    data: apiGames,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for better caching)
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: 1, // Only retry once to fail faster
    retryDelay: 500, // Faster retry (500ms instead of 1s)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component remount
  });

  // Debug logging (only in development)
  if (import.meta.env.DEV) {
    console.log("[Casino] API Games:", apiGames?.length, "games");
    console.log("[Casino] Loading:", isLoading);
    console.log("[Casino] Error:", isError, error);
  }

  // Organize games by tab based on game name patterns
  const gamesByTab = useMemo(() => {
    if (!apiGames) return {} as Record<CasinoTabCategory, CasinoGame[]>;

    const organized: Record<string, CasinoGame[]> = {
      SMART: [],
      OUR: [],
      AVIATOR: [],
      POPOK: [],
      PASCAL: [],
      SCRATCH: [],
      DARWIN: [],
      GEMINI: [],
      STUDIO21: [],
      BEON: [],
      JACKTOP: [],
    };

    // Categorize games based on their names and properties
    apiGames.forEach((game) => {
      const name = game.gname.toLowerCase();

      // SMART - Premium slots, multipliers, keno
      if (
        name.includes("lucky") ||
        name.includes("keno") ||
        name.includes("balloon") ||
        name.includes("plinko") ||
        name.includes("mines") ||
        name.includes("hilo") ||
        name.includes("casino meter") ||
        name.includes("super over")
      ) {
        organized.SMART.push(game);
      }
      // OUR - In-house exclusives (Matka, custom games)
      else if (
        name.includes("matka") ||
        name.includes("diam") ||
        name.includes("worli") ||
        name.includes("dolidana") ||
        name.includes("mogambo")
      ) {
        organized.OUR.push(game);
      }
      // AVIATOR - Mini quick games
      else if (
        name.includes("aviator") ||
        name.includes("goal") ||
        name.includes("dice")
      ) {
        organized.AVIATOR.push(game);
      }
      // POPOK - Rapid fire games (Andar Bahar, quick variants)
      else if (
        name.includes("andar") ||
        name.includes("bahar") ||
        name.includes("ab") ||
        name.includes("chicky") ||
        name.includes("tappy")
      ) {
        organized.POPOK.push(game);
      }
      // PASCAL - Live table games (Roulette, Blackjack, Poker)
      else if (
        name.includes("roulette") ||
        name.includes("blackjack") ||
        name.includes("poker") ||
        name.includes("baccarat") ||
        name.includes("texas") ||
        name.includes("flush") ||
        name.includes("bet on number")
      ) {
        organized.PASCAL.push(game);
      }
      // SCRATCH - Instant win games
      else if (name.includes("scratch") || name.includes("instant")) {
        organized.SCRATCH.push(game);
      }
      // DARWIN - Evolution Gaming (Live dealer games)
      else if (
        name.includes("evolution") ||
        name.includes("live") ||
        name.includes("bollywood") ||
        name.includes("trio")
      ) {
        organized.DARWIN.push(game);
      }
      // GEMINI - Provably fair games
      else if (
        name.includes("fair") ||
        name.includes("marble") ||
        name.includes("limbo") ||
        name.includes("crash neon") ||
        name.includes("note number")
      ) {
        organized.GEMINI.push(game);
      }
      // STUDIO21 - Themed exclusive games (Cricket, Football themed)
      else if (
        name.includes("cricket") ||
        name.includes("football") ||
        name.includes("race") ||
        name.includes("war")
      ) {
        organized.STUDIO21.push(game);
      }
      // BEON - Aviation/Flight games
      else if (
        name.includes("aviation") ||
        name.includes("flight") ||
        name.includes("sky")
      ) {
        organized.BEON.push(game);
      }
      // JACKTOP - Chicken games and instant wins
      else if (name.includes("chicken") || name.includes("mega deal")) {
        organized.JACKTOP.push(game);
      }
      // Default - Teen Patti goes to PASCAL, others to SMART
      else if (name.includes("teen") || name.includes("teenpatti")) {
        organized.PASCAL.push(game);
      } else if (
        name.includes("dragon") ||
        name.includes("tiger") ||
        name.includes("dt")
      ) {
        organized.PASCAL.push(game);
      } else {
        // Unmatched games go to SMART by default
        organized.SMART.push(game);
      }
    });

    if (import.meta.env.DEV) {
      console.log("[Casino] Games organized by tab:", organized);
      console.log("[Casino] Total games:", apiGames.length);
    }

    return organized as Record<CasinoTabCategory, CasinoGame[]>;
  }, [apiGames]);

  // Count total games
  const totalGames = useMemo(() => {
    return apiGames?.length || 0;
  }, [apiGames]);

  // Filter games based on search
  const filteredGames = useMemo(() => {
    const tabGames = gamesByTab[activeTab] || [];
    if (!search) return tabGames;
    return tabGames.filter((game) =>
      game.gname.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, activeTab, gamesByTab]);

  const handlePlay = (game: CasinoGame) => {
    navigate(`/casino/${game.gmid}`);
  };

  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-red-900/90 p-6 rounded-2xl border border-purple-500/30 mb-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
              Casino Games
            </h1>
            <Badge className="bg-white/95 text-purple-900 font-bold tracking-wider uppercase px-4 py-1.5 text-sm shadow-lg">
              {totalGames} Games
            </Badge>
          </div>
          <p className="text-purple-100 text-base max-w-2xl">
            Experience premium gaming with live dealers, instant wins, and provably fair games
          </p>
          <div className="flex flex-wrap gap-6 mt-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-yellow-300 font-semibold text-sm">
                Live Dealers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-green-300 font-semibold text-sm">
                Instant Win
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-blue-300 font-semibold text-sm">
                Provably Fair
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-6 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for your favorite games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 text-base"
          />
        </div>
      </Card>

      {/* Loading and Error States */}
      {isLoading && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-muted-foreground">Loading casino games...</p>
            <p className="text-xs text-muted-foreground">This may take a few seconds</p>
          </div>
        </Card>
      )}
      {isError && (
        <Card className="p-8 text-center">
          <p className="text-destructive mb-2">
            Failed to load casino games from API.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mx-auto"
          >
            Retry
          </Button>
        </Card>
      )}

      {/* Tabs */}
      {!isLoading && !isError && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as CasinoTabCategory)}
          className="w-full"
        >
          <div className="mb-6 relative">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex items-center gap-3 bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 p-3 rounded-full w-full justify-start backdrop-blur-sm border border-border/30">
                {CASINO_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-background/50 border-2 border-transparent data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:via-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:border-purple-400/50 data-[state=active]:shadow-2xl data-[state=active]:shadow-purple-500/30 hover:bg-background hover:border-border/50 transition-all duration-300 whitespace-nowrap hover:scale-105 data-[state=active]:scale-105"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 data-[state=active]:from-white/20 data-[state=active]:to-white/30">
                      <span className="text-2xl">{tab.icon}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-base uppercase tracking-wider">{tab.name}</span>
                      <Badge className="h-6 min-w-[28px] px-2 text-xs font-black rounded-full bg-purple-500/20 text-purple-300 data-[state=active]:bg-white/30 data-[state=active]:text-white border-0 shadow-sm">
                        {gamesByTab[tab.id]?.length || 0}
                      </Badge>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {CASINO_TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="mb-6 pb-4 border-b border-border/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{tab.icon}</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    {tab.name}
                  </h2>
                  <Badge variant="outline" className="ml-2 font-semibold">
                    {gamesByTab[tab.id]?.length || 0} Games
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  {tab.description}
                </p>
              </div>

              {filteredGames.length === 0 ? (
                <Card className="p-12 text-center rounded-xl border-dashed">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-semibold text-muted-foreground mb-1">
                    No games found
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Try adjusting your search terms
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.gmid}
                      game={game}
                      onClick={() => handlePlay(game)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
      </div>
    </MainLayout>
  );
}
