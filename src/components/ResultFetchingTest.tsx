// src/components/ResultFetchingTest.tsx
/**
 * Test Component for Result Fetching Service
 *
 * This component demonstrates how to use the result fetching service
 * and provides a UI to test fetching results for different market types.
 */

import { useState } from "react";
import { useResultFetching } from "@/hooks/useResultFetching";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export function ResultFetchingTest() {
  const {
    fetchResult,
    fetchEventResults,
    marketResult,
    eventResults,
    isLoading,
    isFetching,
    error,
    startPolling,
    stopPolling,
    clearResults,
  } = useResultFetching();

  // Form state
  const [eventId, setEventId] = useState("856162940");
  const [eventName, setEventName] = useState("SA W vs PAK W");
  const [marketId, setMarketId] = useState("6273906464321");
  const [marketName, setMarketName] = useState("MATCH_ODDS");
  const [isPolling, setIsPolling] = useState(false);

  // Preset examples
  const presets = {
    matchOdds: {
      eventId: "856162940",
      eventName: "SA W vs PAK W",
      marketId: "6273906464321",
      marketName: "MATCH_ODDS",
    },
    fancy: {
      eventId: "856162940",
      eventName: "SA W vs PAK W",
      marketId: "11",
      marketName: "10 over runs PAK W(SA W vs PAK W)adv",
    },
  };

  const handleFetchResult = async () => {
    await fetchResult({
      event_id: Number(eventId),
      event_name: eventName,
      market_id: Number(marketId),
      market_name: marketName,
    });
  };

  const handleFetchEventResults = async () => {
    await fetchEventResults(Number(eventId));
  };

  const handleStartPolling = () => {
    startPolling(Number(eventId), 10000); // Poll every 10 seconds
    setIsPolling(true);
  };

  const handleStopPolling = () => {
    stopPolling();
    setIsPolling(false);
  };

  const loadPreset = (preset: "matchOdds" | "fancy") => {
    const data = presets[preset];
    setEventId(data.eventId);
    setEventName(data.eventName);
    setMarketId(data.marketId);
    setMarketName(data.marketName);
  };

  const getResultBadge = (result: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> =
      {
        WON: {
          variant: "default",
          icon: CheckCircle2,
          color: "text-green-500",
        },
        LOST: { variant: "destructive", icon: XCircle, color: "text-red-500" },
        VOID: { variant: "secondary", icon: XCircle, color: "text-gray-500" },
        PENDING: { variant: "outline", icon: Clock, color: "text-yellow-500" },
        SUSPENDED: {
          variant: "outline",
          icon: Clock,
          color: "text-orange-500",
        },
      };

    const config = variants[result] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {result}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Result Fetching Test</h1>
          <p className="text-muted-foreground">
            Test the result fetching service with live data
          </p>
        </div>
        <Button variant="outline" onClick={clearResults}>
          Clear Results
        </Button>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Fetch Market Result</CardTitle>
          <CardDescription>
            Enter market details to fetch results. Use presets for quick
            testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPreset("matchOdds")}
            >
              Load MATCH_ODDS Example
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPreset("fancy")}
            >
              Load FANCY Example
            </Button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventId">Event ID</Label>
              <Input
                id="eventId"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="856162940"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="SA W vs PAK W"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketId">Market ID</Label>
              <Input
                id="marketId"
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                placeholder="6273906464321"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketName">Market Name</Label>
              <Input
                id="marketName"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                placeholder="MATCH_ODDS"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleFetchResult} disabled={isFetching}>
              {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Market Result
            </Button>
            <Button
              onClick={handleFetchEventResults}
              disabled={isFetching}
              variant="secondary"
            >
              {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch All Event Results
            </Button>
            {!isPolling ? (
              <Button onClick={handleStartPolling} variant="outline">
                Start Auto-Polling (10s)
              </Button>
            ) : (
              <Button onClick={handleStopPolling} variant="destructive">
                Stop Polling
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Market Result Display */}
      {marketResult && (
        <Card>
          <CardHeader>
            <CardTitle>Market Result</CardTitle>
            <CardDescription>Latest fetched market result</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market Name:</span>
                <span className="text-sm">{marketResult.market_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market ID:</span>
                <span className="text-sm font-mono">
                  {marketResult.market_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Result:</span>
                {getResultBadge(marketResult.result)}
              </div>
              {marketResult.winner && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Winner:</span>
                  <span className="text-sm font-semibold">
                    {marketResult.winner}
                  </span>
                </div>
              )}
              {marketResult.result_value !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Result Value:</span>
                  <span className="text-sm">{marketResult.result_value}</span>
                </div>
              )}
              {marketResult.declared_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Declared At:</span>
                  <span className="text-sm">
                    {new Date(marketResult.declared_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Results Display */}
      {eventResults && (
        <Card>
          <CardHeader>
            <CardTitle>Event Results</CardTitle>
            <CardDescription>
              All market results for {eventResults.event_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventResults.markets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No results available yet
                </p>
              ) : (
                eventResults.markets.map((market) => (
                  <div
                    key={market.market_id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{market.market_name}</span>
                      {getResultBadge(market.result)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Market ID: {market.market_id}
                    </div>
                    {market.winner && (
                      <div className="text-sm">
                        Winner:{" "}
                        <span className="font-semibold">{market.winner}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div className="text-xs text-muted-foreground pt-2">
                Fetched at: {new Date(eventResults.fetched_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !marketResult && !eventResults && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading results...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Polling Status */}
      {isPolling && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Auto-polling active - Results will update every 10 seconds
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
