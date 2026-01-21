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

  // Fetch real casino games from API
  const {
    data: apiGames,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
  });

  // Debug logging
  console.log("[Casino] API Games:", apiGames);
  console.log("[Casino] Loading:", isLoading);
  console.log("[Casino] Error:", isError);

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

    console.log("[Casino] Games organized by tab:", organized);
    console.log("[Casino] Total games:", apiGames.length);

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
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 p-4 md:p-8 rounded-xl border border-purple-700 mb-4 md:mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2 md:gap-3">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 animate-pulse" />
              Casino Games
            </h1>
            <Badge className="bg-white text-purple-900 font-bold tracking-widest uppercase px-3 py-1">
              {totalGames} Games
            </Badge>
          </div>
          <p className="text-purple-200 text-sm md:text-base">
            Experience the thrill with crash games, slots, live dealers, and
            provably fair gaming
          </p>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm">
                Live Dealers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold text-sm">
                Instant Win
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 font-semibold text-sm">
                Provably Fair
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-3 mb-4 rounded-xl">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </Card>

      {/* Loading and Error States */}
      {isLoading && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading casino games...</p>
        </Card>
      )}
      {isError && (
        <Card className="p-8 text-center">
          <p className="text-destructive">
            Failed to load casino games. Please try again.
          </p>
        </Card>
      )}

      {/* Tabs */}
      {!isLoading && !isError && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as CasinoTabCategory)}
          className="w-full"
        >
          <TabsList className="w-full flex-wrap h-auto gap-2 bg-muted/50 p-2 rounded-xl mb-4">
            {CASINO_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 min-w-[100px] data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-[20px] text-xs"
                >
                  {gamesByTab[tab.id]?.length || 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {CASINO_TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">
                  {tab.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {tab.description}
                </p>
              </div>

              {filteredGames.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No games found matching your search.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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
    </MainLayout>
  );
}
