import { useQuery } from "@tanstack/react-query";
import { fetchCasinoGames } from "@/services/casino";
import { GameCard } from "@/components/casino/GameCard";
import type { CasinoGame } from "@/types/casino";

interface LiveCasinoGridProps {
  limit?: number;
  category?: string;
}

export function LiveCasinoGrid({ limit, category }: LiveCasinoGridProps) {
  const { data: games, isLoading } = useQuery({
    queryKey: ["casino-games", category],
    queryFn: fetchCasinoGames,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: limit || 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] bg-muted rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  let filteredGames = games || [];

  if (category) {
    filteredGames = filteredGames.filter(
      (game: CasinoGame) =>
        game.category?.toLowerCase() === category.toLowerCase()
    );
  }

  if (limit) {
    filteredGames = filteredGames.slice(0, limit);
  }

  if (filteredGames.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No games available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredGames.map((game: CasinoGame) => (
        <GameCard key={game.gmid} game={game} />
      ))}
    </div>
  );
}
