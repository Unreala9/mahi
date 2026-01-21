import { useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Users, Flame, Search, Filter, Gamepad2 } from "lucide-react";
import { useCasinoGames } from "@/hooks/api/useCasino";

const categories = [
  "All",
  "Sports",
  "Slots",
  "Card Games",
  "Table Games",
  "Crash Games",
  "Live Casino",
];

const PublicGames = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allGames = [], isLoading } = useCasinoGames();

  const filteredGames = allGames.filter((game) => {
    const matchesCategory =
      selectedCategory === "All" || game.category === selectedCategory;
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-0">
        {/* Header */}
        <div className="mb-8 text-center bg-card p-8 rounded-2xl border border-border">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Game <span className="text-primary">Library</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our extensive collection of premium games. From classic
            casino favorites to cutting-edge crash games.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 justify-between items-center bg-card p-4 rounded-xl border border-border">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "default" : "secondary"
                }
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 ${
                  selectedCategory === category
                    ? "bg-primary text-black hover:bg-primary/90"
                    : "bg-background text-muted-foreground hover:bg-card/80"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-muted-foreground mb-6 font-medium">
          Showing {filteredGames.length} games
        </p>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Hardcoded Sportsbook Card */}
            {("Sports".includes(searchQuery) ||
              selectedCategory === "All" ||
              selectedCategory === "Sports") && (
              <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:scale-[1.02]">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&q=80"
                    alt="Sports Betting"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20">
                    Sports
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    Sportsbook
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bet on live sports events with best odds.
                  </p>
                  <Link to="/sports">
                    <Button className="w-full bg-primary text-black hover:bg-primary/90 font-bold">
                      <Gamepad2 className="w-4 h-4 mr-2" /> Open Sportsbook
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-black">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />

                  {/* Hot Badge */}
                  {game.hot && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-red-600 rounded-full text-xs font-bold text-white">
                      <Flame className="w-3 h-3" />
                      HOT
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10">
                    {game.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors truncate">
                    {game.name}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">
                          {game.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{game.players}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-background hover:bg-card text-primary border border-primary/30 hover:border-primary font-bold">
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

export default PublicGames;
