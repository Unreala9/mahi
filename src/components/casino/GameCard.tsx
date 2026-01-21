import { CasinoGame } from "@/types/casino";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { getImageCandidates } from "@/services/casino";
import { useMemo, useState } from "react";

interface GameCardProps {
  game: CasinoGame;
  onPlay?: (game: CasinoGame) => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = game.imgpath;

  return (
    <Card className="group relative aspect-[3/4] bg-card overflow-hidden cursor-pointer border border-border hover:border-primary transition-all">
      {!imageError && imageSrc ? (
        <img
          src={imageSrc}
          alt={game.gname}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
          <div className="text-center">
            <Play className="h-12 w-12 mx-auto mb-2 text-white/50" />
            <p className="text-xs text-white/70 uppercase font-bold">
              {game.gname}
            </p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 flex items-end justify-between p-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
        <div className="text-left">
          <p className="text-xs font-black uppercase tracking-wide text-white drop-shadow">
            {game.gname}
          </p>
          <p className="text-[10px] text-white/80 uppercase tracking-wider">
            {game.gmid}
          </p>
        </div>
        <Button
          className="h-9 w-9 rounded-none bg-primary text-black hover:bg-white p-0"
          onClick={() => onPlay?.(game)}
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
