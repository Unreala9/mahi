/**
 * Comprehensive Live Score Display Component
 * Shows live scores with real-time updates for sports matches
 */

import { useSportsMatch } from "@/hooks/api/useEnhancedBetting";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveScoreDisplayProps {
  gmid: number;
  sid: number;
  className?: string;
  compact?: boolean;
}

export function LiveScoreDisplay({
  gmid,
  sid,
  className,
  compact = false,
}: LiveScoreDisplayProps) {
  const { score, loadingScore } = useSportsMatch(gmid, sid);

  if (loadingScore) {
    return (
      <Card className={cn("p-4 animate-pulse", className)}>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className={cn("p-4", className)}>
        <p className="text-sm text-muted-foreground text-center">
          No live score available
        </p>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold truncate">
              {score.score.home.name}
            </span>
            <span className="ml-2 font-bold">{score.score.home.score}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold truncate">
              {score.score.away.name}
            </span>
            <span className="ml-2 font-bold">{score.score.away.score}</span>
          </div>
        </div>
        <Badge variant="destructive" className="animate-pulse">
          LIVE
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 p-3 flex items-center justify-between">
        <Badge
          variant="outline"
          className="bg-white/10 text-white border-white/20"
        >
          <Activity className="w-3 h-3 mr-1 animate-pulse" />
          LIVE
        </Badge>
        <span className="text-xs text-white/80">{score.status}</span>
      </div>

      {/* Teams and Scores */}
      <div className="p-4 space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-semibold truncate">
              {score.score.home.name}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-2xl font-bold">{score.score.home.score}</span>
            {score.score.home.overs && (
              <span className="text-sm text-muted-foreground">
                ({score.score.home.overs})
              </span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-semibold truncate">
              {score.score.away.name}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-2xl font-bold">{score.score.away.score}</span>
            {score.score.away.overs && (
              <span className="text-sm text-muted-foreground">
                ({score.score.away.overs})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {(score.current_innings ||
        score.partnership ||
        score.last_wicket ||
        score.required_run_rate) && (
        <div className="border-t px-4 py-3 bg-muted/30 space-y-2">
          {score.current_innings && (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium">{score.current_innings}</span>
            </div>
          )}

          {score.partnership && (
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Partnership:</span>
              <span className="font-medium">{score.partnership}</span>
            </div>
          )}

          {score.last_wicket && (
            <div className="flex items-center gap-2 text-xs">
              <Activity className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Last Wicket:</span>
              <span className="font-medium">{score.last_wicket}</span>
            </div>
          )}

          {score.required_run_rate && (
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Required RR:</span>
              <span className="font-medium">
                {score.required_run_rate.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recent Overs */}
      {score.recent_overs && score.recent_overs.length > 0 && (
        <div className="border-t px-4 py-3">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            Recent Overs
          </h4>
          <div className="flex gap-2 flex-wrap">
            {score.recent_overs.map((over, index) => (
              <Badge
                key={index}
                variant="outline"
                className="font-mono text-xs"
              >
                {over}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Mini live score display for compact spaces
 */
export function MiniLiveScore({ gmid, sid, className }: LiveScoreDisplayProps) {
  return (
    <LiveScoreDisplay gmid={gmid} sid={sid} className={className} compact />
  );
}
