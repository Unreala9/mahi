import { useBettingResult, useEventResults } from "@/hooks/api/useBetting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { BettingResult } from "@/services/bettingWebSocket";

interface BettingResultsProps {
  eventId?: number;
  marketId?: number;
  showAllMarkets?: boolean;
}

export function BettingResults({
  eventId,
  marketId,
  showAllMarkets = false,
}: BettingResultsProps) {
  // Fetch single market result
  const singleResult = useBettingResult(
    eventId && marketId ? { event_id: eventId, market_id: marketId } : null,
    !showAllMarkets && !!eventId && !!marketId,
  );

  // Fetch all event results
  const eventResults = useEventResults(
    eventId ?? null,
    showAllMarkets && !!eventId,
  );

  const results = showAllMarkets
    ? eventResults.data
    : singleResult.data
      ? [singleResult.data]
      : [];
  const isLoading = showAllMarkets
    ? eventResults.isLoading
    : singleResult.isLoading;
  const error = showAllMarkets ? eventResults.error : singleResult.error;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Failed to load results</span>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
          <span>No results available</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <ResultCard key={result.market_id} result={result} />
      ))}
    </div>
  );
}

interface ResultCardProps {
  result: BettingResult;
}

function ResultCard({ result }: ResultCardProps) {
  const getStatusBadge = () => {
    switch (result.result_status) {
      case "DECLARED":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Declared
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Pending
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "VOIDED":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Voided
          </Badge>
        );
      default:
        return null;
    }
  };

  const getResultIcon = (betResult: string) => {
    switch (betResult) {
      case "WON":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "LOST":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "VOID":
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{result.market_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{result.event_name}</p>
            <Badge variant="outline" className="text-xs">
              {result.market_type}
            </Badge>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.winning_selection && result.result_status === "DECLARED" && (
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Winner: {result.winning_selection.selection_name}
                </p>
                {result.declared_at && (
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Declared: {new Date(result.declared_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {result.bets && result.bets.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Your Bets</h4>
            <div className="space-y-2">
              {result.bets.map((bet, index) => (
                <div
                  key={bet.bet_id || index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getResultIcon(bet.result)}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{bet.selection}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant={
                            bet.bet_type === "BACK" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {bet.bet_type}
                        </Badge>
                        <span>
                          ₹{bet.stake} @ {bet.odds}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        bet.result === "WON"
                          ? "text-green-600"
                          : bet.result === "LOST"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {bet.result}
                    </p>
                    {bet.payout && bet.payout > 0 && (
                      <p className="text-xs text-muted-foreground">
                        +₹{bet.payout.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.settled_at && (
          <p className="text-xs text-muted-foreground text-center">
            Settled: {new Date(result.settled_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
