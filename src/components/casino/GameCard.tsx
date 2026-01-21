import { CasinoGame } from "@/types/casino";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Radio, CheckCircle2 } from "lucide-react";
import { getImageCandidates } from "@/services/casino";
import { useMemo, useState } from "react";

interface GameCardProps {
  game: CasinoGame;
  onClick?: () => void;
  onPlay?: (game: CasinoGame) => void;
}

export function GameCard({ game, onClick, onPlay }: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageCandidates = useMemo(
    () => getImageCandidates(game.imgpath),
    [game.imgpath],
  );
  const imageSrc = imageCandidates[currentImageIndex] || "";

  const handleImageError = () => {
    console.log(
      `[GameCard] Image failed for ${game.gname}, trying next URL. Current index: ${currentImageIndex}, Total URLs: ${imageCandidates.length}`,
    );
    console.log(`[GameCard] Failed URL: ${imageSrc}`);

    // Try next image URL candidate
    if (currentImageIndex < imageCandidates.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // No more candidates, show fallback
      console.log(
        `[GameCard] All image URLs failed for ${game.gname}, showing fallback`,
      );
      setImageError(true);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onPlay) {
      onPlay(game);
    }
  };

  return (
    <Card
      className="group relative aspect-[3/4] bg-card overflow-hidden cursor-pointer border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all"
      onClick={handleClick}
    >
      {!imageError && imageSrc ? (
        <img
          src={imageSrc}
          alt={game.gname}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
          onError={handleImageError}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
          <div className="text-center">
            <Play className="h-12 w-12 mx-auto mb-2 text-white/50" />
            <p className="text-xs text-white/70 uppercase font-bold px-2">
              {game.gname}
            </p>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {game.isLive && (
          <Badge className="bg-red-600 text-white border-0 h-5 px-2 flex items-center gap-1 animate-pulse">
            <Radio className="h-3 w-3" />
            <span className="text-[10px] font-bold">LIVE</span>
          </Badge>
        )}
        {game.isFair && (
          <Badge className="bg-green-600 text-white border-0 h-5 px-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-[10px] font-bold">FAIR</span>
          </Badge>
        )}
      </div>

      <div className="absolute inset-0 flex items-end justify-between p-2 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div className="text-left flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-white drop-shadow-lg line-clamp-2">
            {game.gname}
          </p>
          {game.provider && (
            <p className="text-[9px] text-yellow-400 uppercase tracking-wider font-semibold">
              {game.provider}
            </p>
          )}
        </div>
        <Button
          className="h-8 w-8 rounded-full bg-primary text-black hover:bg-white p-0 flex-shrink-0 ml-2"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <Play className="h-4 w-4 fill-current" />
        </Button>
      </div>
    </Card>
  );
}
