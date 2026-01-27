/**
 * Enhanced Diamond Match Page
 * Full betting interface with real-time odds, score updates, and bet slip
 */

import { useMemo, useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  useMatchDetails,
  useAllMatches,
  useSportIds,
} from "@/hooks/api/useDiamond";
import { diamondApi } from "@/services/diamondApi";
import { LiveScoreDisplay } from "@/components/sportsbook/LiveScoreDisplay";
import { MarketOddsDisplay } from "@/components/sportsbook/MarketOddsDisplay";
import { EnhancedBetSlip } from "@/components/sportsbook/EnhancedBetSlip";
import { enhancedSportsWebSocket } from "@/services/enhancedSportsWebSocket";
import { useBettingLogic } from "@/services/bettingLogicService";
import type {
  SportsBettingMessage,
  MatchOddsData,
  MarketType,
  BetType,
} from "@/types/sports-betting";
import { toast } from "@/hooks/use-toast";

export default function EnhancedDiamondMatch() {
  const { gmid, sid } = useParams();
  const gmidNum = useMemo(() => (gmid ? parseInt(gmid, 10) : null), [gmid]);

  // Resolve sid from all matches if not provided in URL
  const { data: allMatches } = useAllMatches();
  const [fallbackSid, setFallbackSid] = useState<number | null>(null);
  const [resolvingSid, setResolvingSid] = useState(false);

  const resolvedSid = useMemo(() => {
    if (sid) return parseInt(sid, 10);
    if (!allMatches || !gmidNum) return null;
    const m = allMatches.find((mm: any) => mm.gmid === gmidNum);
    return m ? m.sid : null;
  }, [sid, allMatches, gmidNum]);

  // Fallback: scan sports for sid
  const { data: sports } = useSportIds();
  useEffect(() => {
    let cancelled = false;
    async function resolveSidFallback() {
      if (resolvedSid || fallbackSid || !gmidNum) return;
      const sportIdsToScan: number[] =
        sports && sports.length > 0
          ? sports.map((s: any) => s.sid)
          : [4, 1, 2, 5, 6, 7, 8, 9, 10];
      setResolvingSid(true);
      try {
        for (const sidCandidate of sportIdsToScan) {
          const matches = await diamondApi.getMatchesBySport(sidCandidate);
          const found = matches.find((mm: any) => mm.gmid === gmidNum);
          if (found) {
            if (!cancelled) setFallbackSid(found.sid);
            break;
          }
        }
      } finally {
        if (!cancelled) setResolvingSid(false);
      }
    }
    resolveSidFallback();
    return () => {
      cancelled = true;
    };
  }, [resolvedSid, fallbackSid, gmidNum, sports]);

  const sidForQueries = resolvedSid ?? fallbackSid;
  const { data: details } = useMatchDetails(gmidNum, sidForQueries);

  // Real-time odds state
  const [oddsData, setOddsData] = useState<MatchOddsData>({});

  // Betting logic hook
  const {
    betSlip,
    balance,
    exposure,
    isPlacingBet,
    totalStake,
    totalPotentialProfit,
    addToBetSlip,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    placeBets,
  } = useBettingLogic("user123"); // TODO: Get real user ID

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gmidNum || !sidForQueries) return;

    const handleMessage = (message: SportsBettingMessage) => {
      if (message.type === "odds_update") {
        setOddsData((prev) => {
          const updated = { ...prev };
          if (message.market_type === "MATCH_ODDS") {
            updated.match_odds = message.data;
          } else if (message.market_type === "BOOKMAKER") {
            updated.bookmaker = message.data;
          } else if (message.market_type === "FANCY") {
            updated.fancy = message.data;
          }
          return updated;
        });
      } else if (message.type === "score_update") {
        // Score updates handled by LiveScoreDisplay
      }
    };

    const unsubscribe = enhancedSportsWebSocket.subscribe(
      gmidNum,
      sidForQueries,
      handleMessage,
      {
        markets: ["match_odds", "bookmaker", "fancy"],
        includeScore: true,
      },
    );

    return unsubscribe;
  }, [gmidNum, sidForQueries]);

  const teams = useMemo(
    () => parseTeamNames(details?.name || ""),
    [details?.name],
  );

  const scoreUrl = useMemo(() => {
    if (!details?.gtv || !sidForQueries) return null;
    return diamondApi.getScoreUrl(details.gtv, sidForQueries);
  }, [details?.gtv, sidForQueries]);

  // Handle bet click
  const handleBetClick = useCallback(
    (
      marketType: MarketType,
      marketId: string | number,
      marketName: string,
      selection: string,
      odds: number,
      betType: BetType,
      selectionId?: number,
    ) => {
      if (!gmidNum || !details?.name) return;

      addToBetSlip(
        gmidNum,
        details.name,
        marketId,
        marketName,
        marketType,
        selection,
        odds,
        betType,
        selectionId,
      );
    },
    [gmidNum, details?.name, addToBetSlip],
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content - Left & Center */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Match Details</h1>
              <Button asChild variant="outline">
                <Link to="/sports">Back to Sports</Link>
              </Button>
            </div>

            {/* Match Info Card */}
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {details?.is_live && (
                      <Badge className="bg-red-600 text-white animate-pulse">
                        LIVE
                      </Badge>
                    )}
                    {details?.start_date && !details?.is_live && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(details.start_date).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">{teams.home}</div>
                    <div className="text-lg font-semibold">{teams.away}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    GMID: {gmid} | SID:{" "}
                    {sidForQueries ?? (resolvingSid ? "resolving…" : "…")}
                  </div>
                </div>
              </div>
            </Card>

            {/* Live Score */}
            {gmidNum && sidForQueries && (
              <LiveScoreDisplay gmid={gmidNum} sid={sidForQueries} />
            )}

            {/* Live TV */}
            {scoreUrl && (
              <Card className="p-4">
                <h2 className="text-sm font-bold mb-2">Live TV</h2>
                <div className="w-full h-[360px]">
                  <iframe
                    src={scoreUrl}
                    className="w-full h-full"
                    title="Live Match Score"
                  />
                </div>
              </Card>
            )}

            {/* Markets Tabs */}
            {gmidNum && sidForQueries && !resolvingSid && (
              <Tabs defaultValue="match_odds" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="match_odds">Match Odds</TabsTrigger>
                  <TabsTrigger value="bookmaker">Bookmaker</TabsTrigger>
                  <TabsTrigger value="fancy">Fancy</TabsTrigger>
                </TabsList>

                <TabsContent value="match_odds" className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Match Odds</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Max: 1.00 | Min: 100.00 | Max: 25K
                    </p>
                    {oddsData.match_odds && oddsData.match_odds.length > 0 ? (
                      <MarketOddsDisplay
                        marketType="MATCH_ODDS"
                        runners={oddsData.match_odds}
                        onBetClick={(selection, odds, betType, selectionId) =>
                          handleBetClick(
                            "MATCH_ODDS",
                            `${gmidNum}_match_odds`,
                            "Match Odds",
                            selection,
                            odds,
                            betType,
                            selectionId,
                          )
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Loading odds...
                      </p>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="bookmaker" className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Bookmaker</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Max: 1.00 | Min: 100.00 | Max: 25K
                    </p>
                    {oddsData.bookmaker && oddsData.bookmaker.length > 0 ? (
                      <MarketOddsDisplay
                        marketType="BOOKMAKER"
                        runners={oddsData.bookmaker}
                        onBetClick={(selection, odds, betType, selectionId) =>
                          handleBetClick(
                            "BOOKMAKER",
                            `${gmidNum}_bookmaker`,
                            "Bookmaker",
                            selection,
                            odds,
                            betType,
                            selectionId,
                          )
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No bookmaker odds available
                      </p>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="fancy" className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Normal Markets</h3>
                    {oddsData.fancy && oddsData.fancy.length > 0 ? (
                      <div className="space-y-4">
                        {oddsData.fancy.map((runner, index) => (
                          <Card key={index} className="p-3">
                            <h4 className="text-sm font-medium mb-2">
                              {runner.runner_name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Min: 100.00 | Max: 25K
                            </p>
                            <MarketOddsDisplay
                              marketType="FANCY"
                              runners={[runner]}
                              onBetClick={(
                                selection,
                                odds,
                                betType,
                                selectionId,
                              ) =>
                                handleBetClick(
                                  "FANCY",
                                  `${gmidNum}_fancy_${index}`,
                                  runner.runner_name,
                                  selection,
                                  odds,
                                  betType,
                                  selectionId,
                                )
                              }
                            />
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No fancy markets available
                      </p>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Bet Slip - Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <EnhancedBetSlip
                betSlip={betSlip}
                balance={balance}
                exposure={exposure}
                isPlacingBet={isPlacingBet}
                totalStake={totalStake}
                totalPotentialProfit={totalPotentialProfit}
                onRemove={removeFromBetSlip}
                onUpdateStake={updateStake}
                onPlaceBets={placeBets}
                onClear={clearBetSlip}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Helper function to parse team names
function parseTeamNames(matchName: string): { home: string; away: string } {
  const parts = matchName.split(" vs ");
  if (parts.length === 2) {
    return { home: parts[0].trim(), away: parts[1].trim() };
  }
  return { home: matchName, away: "" };
}
