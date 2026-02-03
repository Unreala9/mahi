import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { CasinoGame } from "@/types/casino";

interface GameCardProps {
  game: CasinoGame;
  featured?: boolean;
}

export function GameCard({ game, featured = false }: GameCardProps) {
  // Try multiple image sources
  const imageUrl = 
    game.gimg || 
    (game as any).imgpath || 
    (game as any).img || 
    (game as any).image || 
    `https://via.placeholder.com/400x300/1a1a1a/ffffff?text=${encodeURIComponent(game.gname)}`;
  
  const isLive = game.status === "active" || game.live;

  return (
    <Link
      to={`/casino/${game.gmid}`}
      className={`group relative block overflow-hidden rounded-xl bg-card transition-all hover:shadow-2xl hover:-translate-y-1 ${
        featured ? "col-span-2 row-span-2" : ""
      }`}
    >
      {/* Game Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={game.gname}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Use a better placeholder with game name
            target.src = `https://via.placeholder.com/400x300/1a1a1a/ffffff?text=${encodeURIComponent(game.gname)}`;
            target.onerror = null; // Prevent infinite loop
          }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-3 right-3">
            <Badge variant="destructive" className="animate-pulse bg-red-600">
              <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse" />
              LIVE
            </Badge>
          </div>
        )}

        {/* Game Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
            {game.gname}
          </h3>
          {game.category && (
            <p className="text-sm text-white/80 line-clamp-1">{game.category}</p>
          )}
        </div>
      </div>

      {/* Hover Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
          <svg
            className="w-8 h-8 text-primary-foreground ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
