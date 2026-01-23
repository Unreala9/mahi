import { useState } from "react";
import {
  PlacedBetsMonitor,
  PlacedBetsWidget,
} from "@/components/sportsbook/PlacedBetsMonitor";
import { BettingResults } from "@/components/sportsbook/BettingResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BettingMonitor() {
  const [eventId, setEventId] = useState<number>(45554544);
  const [monitorEnabled, setMonitorEnabled] = useState(false);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Betting Monitor Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Event ID"
              value={eventId}
              onChange={(e) => setEventId(Number(e.target.value))}
              className="max-w-xs"
            />
            <Button onClick={() => setMonitorEnabled(!monitorEnabled)}>
              {monitorEnabled ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="placed-bets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="placed-bets">Placed Bets (Event)</TabsTrigger>
          <TabsTrigger value="all-bets">All Bets (All Events)</TabsTrigger>
          <TabsTrigger value="results">Betting Results</TabsTrigger>
        </TabsList>

        <TabsContent value="placed-bets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {monitorEnabled && eventId ? (
                <PlacedBetsMonitor eventId={eventId} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Enter an Event ID and click "Start Monitoring" to begin
                  </CardContent>
                </Card>
              )}
            </div>
            <div>
              {monitorEnabled && eventId && (
                <PlacedBetsWidget eventId={eventId} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all-bets" className="space-y-4">
          {monitorEnabled ? (
            <PlacedBetsMonitor showAllEvents />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Click "Start Monitoring" to watch all events
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {eventId ? (
            <BettingResults eventId={eventId} showAllMarkets />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Enter an Event ID to view results
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
