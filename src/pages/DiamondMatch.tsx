import { useMemo, useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  useMatchDetails,
  useAllMatches,
  useSportIds,
} from "@/hooks/api/useDiamond";
import { diamondApi } from "@/services/diamondApi";
import { LiveScoreDisplay } from "@/components/sportsbook/LiveScoreDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { supabase } from "@/integrations/supabase/client";

export default function DiamondMatch() {
  const { gmid, sid } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

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

  // Fallback: if sid couldn't be resolved from /tree, scan sports and their matches
  const { data: sports } = useSportIds();
  useEffect(() => {
    let cancelled = false;
    async function resolveSidFallback() {
      if (resolvedSid || fallbackSid || !gmidNum) return;
      // Build a list of sports to scan; if API didn't return any, try common sids
      const sportIdsToScan: number[] =
        sports && sports.length > 0
          ? sports.map((s: any) => s.sid)
          : [4, 1, 2, 5, 6, 7, 8, 9, 10]; // cricket, soccer, tennis, etc.
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
  const { data: details, isLoading: loadingDetails } = useMatchDetails(
    gmidNum,
    sidForQueries,
  );

  // Real-time odds state
  const [oddsData, setOddsData] = useState<MatchOddsData>({});
  const [oddsLoading, setOddsLoading] = useState(true);
  const [streamLoaded, setStreamLoaded] = useState(false);

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
  } = useBettingLogic(user?.id || undefined, gmidNum || undefined);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gmidNum || !sidForQueries) return;

    setOddsLoading(true);

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
        setOddsLoading(false);
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

  // Live Score URL (using score.akamaized.uk)
  const liveScoreUrl = useMemo(() => {
    if (!gmidNum) return null;
    return `https://score.akamaized.uk/diamond-live-score?gmid=${gmidNum}`;
  }, [gmidNum]);

  // Live Stream URL (using cricketid.xyz)
  const liveStreamUrl = useMemo(() => {
    if (!gmidNum) return null;
    const API_KEY =
      import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
    return `https://live.cricketid.xyz/directStream?gmid=${gmidNum}&key=${API_KEY}`;
  }, [gmidNum]);

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

          {/* Live Stream */}
          {liveStreamUrl && (
            <Card className="overflow-hidden mb-4">
              {details?.is_live ? (
                <div className="w-full h-[400px] relative">
                  <iframe
                    src={liveStreamUrl}
                    className="w-full h-full border-0"
                    title="Live Match Stream"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    onLoad={() => {
                      setStreamLoaded(true);
                      console.log("[DiamondMatch] Stream loaded successfully");
                    }}
                    onError={(e) => {
                      console.warn(
                        "[DiamondMatch] Stream iframe failed to load",
                      );
                      setStreamLoaded(false);
                    }}
                  />
                  {!streamLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-xs text-muted-foreground bg-background/80 px-3 py-2 rounded">
                        Stream currently unavailable
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <p className="text-lg font-semibold text-muted-foreground">
                    Match is Not Live
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Live Score Iframe */}
          {liveScoreUrl && (
            <Card className="overflow-hidden mb-4">
              {details?.is_live ? (
                <div className="w-full h-[200px]">
                  <iframe
                    src={liveScoreUrl}
                    className="w-full h-full border-0"
                    title="Live Match Score"
                    onError={(e) => {
                      console.warn(
                        "[DiamondMatch] Score iframe failed to load",
                      );
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-[200px] flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <p className="text-lg font-semibold text-muted-foreground">
                    Match is Not Live
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Markets Tabs */}
          {gmidNum && sidForQueries && !resolvingSid && (
            <Tabs defaultValue="match_odds" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="match_odds">Match Odds</TabsTrigger>
                <TabsTrigger value="bookmaker">Bookmaker</TabsTrigger>
                <TabsTrigger value="fancy">Fancy</TabsTrigger>
                <TabsTrigger value="toss">Toss</TabsTrigger>
              </TabsList>

              <TabsContent value="match_odds" className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Match Odds</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Max: 1.00 | Min: 100.00 | Max: 25K
                  </p>
                  {oddsLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Loading odds...
                    </p>
                  ) : oddsData.match_odds && oddsData.match_odds.length > 0 ? (
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
                      No odds available for this market
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
                  {oddsLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Loading odds...
                    </p>
                  ) : oddsData.bookmaker && oddsData.bookmaker.length > 0 ? (
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
                  {oddsLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Loading odds...
                    </p>
                  ) : oddsData.fancy && oddsData.fancy.length > 0 ? (
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

              <TabsContent value="toss" className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Toss</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Max: 1.00 | Min: 100.00 | Max: 10K
                  </p>
                  {oddsLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Loading odds...
                    </p>
                  ) : oddsData.toss && oddsData.toss.length > 0 ? (
                    <MarketOddsDisplay
                      marketType="TOSS"
                      runners={oddsData.toss}
                      onBetClick={(selection, odds, betType, selectionId) =>
                        handleBetClick(
                          "TOSS",
                          `${gmidNum}_toss`,
                          "Toss",
                          selection,
                          odds,
                          betType,
                          selectionId,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No toss market available
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
  );
}

function parseTeamNames(matchName: string): { home: string; away: string } {
  const separators = [" vs ", " v ", " VS ", " V "];
  for (const sep of separators) {
    if (matchName.includes(sep)) {
      const [home, away] = matchName.split(sep);
      return { home: home.trim(), away: away.trim() };
    }
  }
  return { home: matchName || "Home Team", away: "Away Team" };
}
