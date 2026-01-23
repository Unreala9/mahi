import {
  usePlacedBetsStream,
  useAllPlacedBetsStream,
  usePlacedBets,
} from "@/hooks/api/usePlacedBets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PlacedBetData } from "@/services/placedBetsWebSocket";

interface PlacedBetsMonitorProps {
  eventId?: number;
  showAllEvents?: boolean;
  maxHeight?: string;
}

export function PlacedBetsMonitor({
  eventId,
  showAllEvents = false,
  maxHeight = "600px",
}: PlacedBetsMonitorProps) {
  // Use WebSocket stream for real-time updates
  const eventStream = usePlacedBetsStream(
    eventId ?? null,
    !showAllEvents && !!eventId,
  );
  const allStream = useAllPlacedBetsStream(showAllEvents);

  // Also fetch initial data via REST
  const { data: initialBets, isLoading } = usePlacedBets(
    eventId ?? null,
    !showAllEvents && !!eventId,
  );

  const bets = showAllEvents ? allStream.bets : eventStream.bets;
  const latestBet = showAllEvents ? allStream.latestBet : eventStream.latestBet;
  const isConnected = showAllEvents
    ? allStream.isConnected
    : eventStream.isConnected;
  const error = showAllEvents ? allStream.error : eventStream.error;

  // Merge initial bets with streamed bets
  const allBets = isLoading ? [] : [...bets];
  if (initialBets && allBets.length === 0) {
    allBets.push(...initialBets);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {showAllEvents ? "All Placed Bets" : "Event Placed Bets"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time betting activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="gap-1">
                <Wifi className="h-3 w-3" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
            {latestBet && (
              <Badge variant="outline" className="gap-1 animate-pulse">
                New Bet
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isLoading && allBets.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : allBets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No bets placed yet</p>
            <p className="text-xs mt-1">Waiting for betting activity...</p>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="space-y-2">
              {allBets.map((bet, index) => (
                <BetCard
                  key={bet.bet_id || index}
                  bet={bet}
                  isLatest={latestBet?.bet_id === bet.bet_id}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

interface BetCardProps {
  bet: PlacedBetData;
  isLatest?: boolean;
}

function BetCard({ bet, isLatest }: BetCardProps) {
  const getStatusBadge = () => {
    switch (bet.status) {
      case "MATCHED":
        return (
          <Badge variant="default" className="text-xs">
            Matched
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "UNMATCHED":
        return (
          <Badge variant="outline" className="text-xs">
            Unmatched
          </Badge>
        );
      case "SETTLED":
        return (
          <Badge className="bg-green-600 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Settled
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "VOID":
        return (
          <Badge variant="outline" className="text-xs">
            Void
          </Badge>
        );
      default:
        return null;
    }
  };

  const getResultBadge = () => {
    if (!bet.result) return null;

    switch (bet.result) {
      case "WON":
        return <Badge className="bg-green-600 text-xs">Won</Badge>;
      case "LOST":
        return (
          <Badge variant="destructive" className="text-xs">
            Lost
          </Badge>
        );
      case "VOID":
        return (
          <Badge variant="outline" className="text-xs">
            Void
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isLatest
          ? "bg-primary/5 border-primary animate-pulse"
          : "bg-card hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {bet.bet_type === "BACK" ? (
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-pink-600" />
            )}
            <span className="font-semibold text-sm">{bet.selection}</span>
            <Badge
              variant={bet.bet_type === "BACK" ? "default" : "secondary"}
              className="text-xs"
            >
              {bet.bet_type}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{bet.market_name}</p>
            <p className="text-xs text-muted-foreground font-medium">
              {bet.event_name}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {getStatusBadge()}
            {getResultBadge()}
            <Badge variant="outline" className="text-xs">
              {bet.market_type}
            </Badge>
          </div>

          {bet.username && (
            <p className="text-xs text-muted-foreground">
              User: {bet.username}
            </p>
          )}
        </div>

        <div className="text-right space-y-1">
          <div className="font-semibold">
            <div className="text-sm">₹{bet.stake.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">@ {bet.odds}</div>
          </div>

          <div className="text-xs text-muted-foreground">
            <div>Profit: ₹{bet.potential_profit.toFixed(2)}</div>
            {bet.payout && bet.payout > 0 && (
              <div className="text-green-600 font-medium">
                Payout: ₹{bet.payout.toFixed(2)}
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(bet.placed_at), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for dashboard widgets
 */
export function PlacedBetsWidget({ eventId }: { eventId?: number }) {
  const { bets, isConnected, latestBet } = usePlacedBetsStream(
    eventId ?? null,
    !!eventId,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Bets</CardTitle>
          {isConnected ? (
            <Badge variant="default" className="text-xs gap-1">
              <Wifi className="h-2 w-2" />
              Live
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs gap-1">
              <WifiOff className="h-2 w-2" />
              Offline
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {bets.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No bets yet
          </p>
        ) : (
          <div className="space-y-2">
            {bets.slice(0, 5).map((bet, index) => (
              <div
                key={bet.bet_id || index}
                className={`text-xs p-2 rounded ${
                  latestBet?.bet_id === bet.bet_id
                    ? "bg-primary/10 border border-primary"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate flex-1">
                    {bet.selection}
                  </span>
                  <Badge
                    variant={bet.bet_type === "BACK" ? "default" : "secondary"}
                    className="text-xs ml-2"
                  >
                    {bet.bet_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1 text-muted-foreground">
                  <span>
                    ₹{bet.stake} @ {bet.odds}
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(bet.placed_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
