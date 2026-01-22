import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Flame } from "lucide-react";



import { useCasinoGames } from "@/hooks/api/useCasino";

const FeaturedGames = () => {
  const { data: allGames = [] } = useCasinoGames();
  const games = allGames.slice(0, 4);

  return (
    <section className="py-20 bg-background relative z-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div className="text-center sm:text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2 ml-1">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text-cyan">Games</span>
            </h2>
            <p className="text-muted-foreground ml-1">Top picks from our premium collection</p>
          </div>
          <Link to="/casino">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 hover:border-white/20">
              View All Games
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game: any, index: number) => (
            <div
              key={game.id}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-sidebar-primary/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_-5px_hsla(var(--primary)/0.3)] animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Hot Badge */}
                {game.hot && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-destructive rounded-full text-xs font-bold text-white shadow-lg shadow-destructive/20 animate-pulse-slow">
                    <Flame className="w-3 h-3 fill-white" />
                    HOT
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                  {game.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-white mb-4 group-hover:text-primary transition-colors">
                  {game.name}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-accent">
                      <Star className="w-4 h-4 fill-current drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]" />
                      <span className="text-sm font-bold text-white">{game.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{game.players}</span>
                    </div>
                  </div>

                  <Link to="/auth?mode=signup">
                    <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary hover:text-black border border-primary/20 hover:border-primary transition-all duration-300 font-bold">
                        Play
                        <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;
