import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gamepad2, Loader2, Filter, Play } from "lucide-react";
import { useCasinoGames, useLaunchGame } from "@/hooks/api/useCasino";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Games = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: games = [], isLoading } = useCasinoGames();
  const { mutate: launchGame } = useLaunchGame();

  const handleLaunch = (gameId: string, name: string) => {
    toast.loading(`Launching ${name}...`);
    launchGame(gameId, {
      onSuccess: (res: any) => {
        toast.dismiss();
        if (res.url) {
          window.open(res.url, "_blank");
        } else {
          toast.success("Game launched! (Mock)");
        }
      },
      onError: () => {
        toast.dismiss();
        toast.error("Failed to launch game");
      },
    });
  };

  const categories = [
    "All",
    "Sports",
    ...new Set(games.map((g: any) => g.category || "Other")),
  ];

  const filteredGames = games.filter((game: any) => {
    const matchesCategory =
      selectedCategory === "All" || game.category === selectedCategory;
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="font-black text-3xl font-display text-foreground uppercase tracking-tight">
              Casino <span className="text-primary">Library</span>
            </h1>
            <p className="text-secondary text-xs uppercase tracking-widest font-bold">
              Premium Gaming Terminal
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input
              placeholder="SEARCH GAMES..."
              className="pl-10 h-10 bg-card border-border text-foreground focus:border-primary text-xs font-bold uppercase tracking-wider rounded-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card p-2 border border-border flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-primary shrink-0 mx-2" />
          {categories.map((cat) => (
            <Button
              key={cat as string}
              variant="ghost"
              onClick={() => setSelectedCategory(cat as string)}
              className={cn(
                "whitespace-nowrap transition-all rounded-none h-8 text-xs font-bold uppercase tracking-wider",
                selectedCategory === cat
                  ? "bg-primary text-black hover:bg-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {cat as string}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4 border border-border bg-card">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
            <p className="text-muted-foreground animate-pulse font-mono text-xs uppercase">
              Loading games database...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
            {/* Sportsbook Card */}
            {("Sports".includes(searchQuery) ||
              selectedCategory === "All" ||
              selectedCategory === "Sports") && (
              <div className="group relative bg-card border border-border hover:border-primary transition-all duration-300">
                <div className="aspect-[16/9] bg-black relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&q=80"
                    alt="Sports Betting"
                    className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-black text-[10px] font-black uppercase tracking-wider">
                    Live
                  </div>
                </div>
                <div className="p-4 relative">
                  <h3 className="font-black text-lg text-foreground mb-1 group-hover:text-primary transition-colors uppercase tracking-tight">
                    Sportsbook
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-wider">
                    Live Betting & Odds
                  </p>
                  <Link to="/sports">
                    <Button className="w-full bg-muted/10 hover:bg-primary hover:text-black text-foreground border border-border hover:border-primary font-bold h-9 uppercase text-xs tracking-wider rounded-none">
                      Launch Terminal <Play className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {filteredGames.map((game: any) => (
              <div
                key={game.id}
                className="group relative bg-card border border-border hover:border-primary transition-all duration-300"
              >
                <div className="aspect-[16/9] bg-black relative overflow-hidden">
                  {game.image ? (
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/10">
                      <Gamepad2 className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-secondary text-white text-[10px] font-black uppercase tracking-wider">
                    {game.category}
                  </div>
                </div>
                <div className="p-4 relative">
                  <h3 className="font-black text-lg text-foreground mb-1 group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                    {game.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-wider">
                    RTP 98.5%
                  </p>
                  <Button
                    onClick={() => handleLaunch(game.id, game.name)}
                    className="w-full bg-primary text-black hover:bg-white font-bold h-9 uppercase text-xs tracking-wider rounded-none"
                  >
                    Play Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
export default Games;
