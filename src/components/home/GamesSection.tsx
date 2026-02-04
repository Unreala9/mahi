import { GameCard } from "./GameCard";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface Game {
  id: string;
  title: string;
  thumbnail: string;
  provider?: string;
  isLive?: boolean;
}

interface GamesSectionProps {
  title: string;
  games: Game[];
  layout?: "carousel" | "grid";
  columns?: 3 | 4;
  onGameClick?: (gameId: string) => void;
  onSeeMore?: () => void;
}

export const GamesSection = ({
  title,
  games,
  layout = "grid",
  columns = 4,
  onGameClick,
  onSeeMore,
}: GamesSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="p-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide">{title}</h2>
        <div className="flex items-center gap-3">
          {layout === "carousel" && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {onSeeMore && (
            <button
              onClick={onSeeMore}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 group"
            >
              See more
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Games Container */}
      {layout === "carousel" ? (
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth"
        >
          <div className="flex gap-4 pb-2">
            {games.map((game) => (
              <div key={game.id} className="flex-shrink-0 w-48">
                <GameCard game={game} onClick={() => onGameClick?.(game.id)} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            columns === 4
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} onClick={() => onGameClick?.(game.id)} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {games.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No games available</p>
        </div>
      )}
    </div>
  );
};
