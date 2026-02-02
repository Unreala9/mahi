import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCasinoLiveMultiple } from "@/hooks/api/useCasinoLive";
import { Activity, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { CasinoGame } from "@/types/casino";
import { getImageCandidates } from "@/services/casino";
import { useState } from "react";
import { hasCustomPage } from "@/data/gameRouteMapping";

interface LiveCasinoGridProps {
  games: CasinoGame[];
  maxDisplay?: number;
}

export function LiveCasinoGrid({
  games,
  maxDisplay = 12,
}: LiveCasinoGridProps) {
  const gmids = games.slice(0, maxDisplay).map((g) => g.gmid);
  const { getData } = useCasinoLiveMultiple(gmids);

  const getGamePath = (game: CasinoGame) => {
    const gameId = game.gmid.toLowerCase();
    if (hasCustomPage(gameId)) {
      return `/casino/${gameId}`;
    }
    return `/casino/${game.gmid}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {games.slice(0, maxDisplay).map((game) => {
        const liveData = getData(game.gmid);

        return (
          <Link key={game.gmid} to={getGamePath(game)}>
            <LiveGameCard game={game} liveData={liveData} />
          </Link>
        );
      })}
    </div>
  );
}

// Live Game Card Component
function LiveGameCard({ game, liveData }: { game: CasinoGame; liveData: any }) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageUrl = getImageCandidates(game.imgpath)[0];

  return (
    <Card className="group relative aspect-[4/5] bg-slate-900 overflow-hidden cursor-pointer border-2 border-white/10 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/20 transition-all duration-200 rounded-sm">
      {/* Live Badge */}
      <div className="absolute top-2 right-2 z-10">
        <Badge className="bg-red-600 text-white border-0 h-5 px-2 text-[10px] font-black uppercase shadow-lg animate-pulse">
          LIVE
        </Badge>
      </div>

      {/* Image */}
      {!imageError && imageUrl ? (
        <>
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={game.gname}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${!isImageLoaded ? "opacity-0" : "opacity-100"}`}
            onError={() => setImageError(true)}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <p className="text-xs text-white/60 uppercase font-bold text-center px-2">
            {game.gname}
          </p>
        </div>
      )}

      {/* Bottom Overlay with Live Data */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-2 py-1.5 space-y-1">
        <p className="text-xs font-bold uppercase text-white truncate">
          {game.gname}
        </p>

        {liveData && (
          <div className="flex items-center gap-2 text-[10px] text-white/70">
            {liveData.timer && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-mono">{liveData.timer}s</span>
              </div>
            )}
            {liveData.roundId && (
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span className="font-mono truncate">R:{liveData.roundId}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
