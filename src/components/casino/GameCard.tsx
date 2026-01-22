import { CasinoGame } from "@/types/casino";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Radio, CheckCircle2 } from "lucide-react";
import { getImageCandidates } from "@/services/casino";
import { useMemo, useState, memo } from "react";

interface GameCardProps {
  game: CasinoGame;
  onClick?: () => void;
  onPlay?: (game: CasinoGame) => void;
}

const GameCardComponent = ({ game, onClick, onPlay }: GameCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageCandidates = useMemo(
    () => getImageCandidates(game.imgpath),
    [game.imgpath],
  );
  const imageSrc = imageCandidates[currentImageIndex] || "";

  const handleImageError = () => {
    // Try next image URL candidate (max 2 attempts to avoid lag)
    if (currentImageIndex < 1 && currentImageIndex < imageCandidates.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Show fallback after 2 attempts
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
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
      className="group relative aspect-[3/4] bg-card overflow-hidden cursor-pointer border border-border/50 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 rounded-xl"
      onClick={handleClick}
    >
      {!imageError && imageSrc ? (
        <>
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/60 via-pink-900/60 to-red-900/60 animate-pulse">
              <Play className="h-10 w-10 text-white/40" />
            </div>
          )}
          <img
            src={imageSrc}
            alt={game.gname}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${!isImageLoaded ? 'opacity-0' : 'opacity-90 group-hover:opacity-100'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          /></>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-red-900/90">
          <div className="text-center px-3">
            <Play className="h-14 w-14 mx-auto mb-3 text-white/60" />
            <p className="text-xs text-white/80 uppercase font-bold leading-tight">
              {game.gname}
            </p>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
        {game.isLive && (
          <Badge className="bg-red-600/95 text-white border-0 h-6 px-2.5 flex items-center gap-1.5 animate-pulse shadow-lg">
            <Radio className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-wide">LIVE</span>
          </Badge>
        )}
        {game.isFair && (
          <Badge className="bg-green-600/95 text-white border-0 h-6 px-2.5 flex items-center gap-1.5 shadow-lg">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-wide">FAIR</span>
          </Badge>
        )}
      </div>

      <div className="absolute inset-0 flex items-end justify-between p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="text-left flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] line-clamp-2 mb-1">
            {game.gname}
          </p>
          {game.provider && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-yellow-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg border border-yellow-500/20">
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-md bg-yellow-500/20 text-[10px] font-black">
                  {game.provider.charAt(0)}
                </span>
                <span className="truncate max-w-[80px]">{game.provider}</span>
              </span>
            </div>
          )}
        </div>
        <Button
          className="h-10 w-10 rounded-full bg-primary hover:bg-white text-primary-foreground hover:text-primary p-0 flex-shrink-0 ml-2 shadow-lg transition-all hover:scale-110"
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
};

// Memoize to prevent unnecessary re-renders
export const GameCard = memo(GameCardComponent);
