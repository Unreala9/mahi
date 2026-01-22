import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCasinoLiveMultiple } from "@/hooks/api/useCasinoLive";
import { Activity, Wifi, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { CasinoGame } from "@/types/casino";

interface LiveCasinoGridProps {
  games: CasinoGame[];
  maxDisplay?: number;
}

export function LiveCasinoGrid({
  games,
  maxDisplay = 8, // Reduced from 20 to 8 for better performance
}: LiveCasinoGridProps) {
  const gmids = games.slice(0, maxDisplay).map((g) => g.gmid);
  const { getData, getStatus, connectedCount, isLoading } =
    useCasinoLiveMultiple(gmids);

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-secondary/30 border border-border">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">Live Casino Dashboard</span>
        </div>
        <Badge variant="default" className="rounded-none">
          {connectedCount} / {gmids.length} Connected
        </Badge>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {games.slice(0, maxDisplay).map((game) => {
          const liveData = getData(game.gmid);
          const status = getStatus(game.gmid);
          const isConnected = status === "connected" || status === "polling";

          return (
            <Link key={game.gmid} to={`/casino/${game.gmid}`}>
              <Card className="p-4 rounded-none hover:border-primary transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold uppercase tracking-tight line-clamp-2 flex-1">
                    {game.gname}
                  </h4>
                  {isConnected && (
                    <div className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Badge variant="outline" className="rounded-none text-xs">
                    {game.gmid}
                  </Badge>
                  {liveData?.status && (
                    <Badge
                      variant={
                        liveData.status === "active" ? "default" : "secondary"
                      }
                      className="rounded-none text-xs"
                    >
                      {liveData.status}
                    </Badge>
                  )}
                </div>

                {/* Live Info */}
                <div className="space-y-2">
                  {liveData?.timer && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono font-bold">
                        {liveData.timer}s
                      </span>
                    </div>
                  )}

                  {liveData?.roundId && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      <span className="font-mono truncate">
                        Round: {liveData.roundId}
                      </span>
                    </div>
                  )}

                  {!liveData && isLoading && (
                    <p className="text-xs text-muted-foreground">
                      Connecting...
                    </p>
                  )}

                  {!liveData && !isLoading && (
                    <p className="text-xs text-muted-foreground">
                      No live data
                    </p>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="mt-3 pt-3 border-t border-border">
                  <span
                    className={`text-xs uppercase tracking-wider ${
                      isConnected ? "text-green-500" : "text-muted-foreground"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
