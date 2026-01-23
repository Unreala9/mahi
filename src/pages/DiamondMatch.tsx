import { useMemo, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  useMatchDetails,
  useMatchOdds,
  useAllMatches,
  useSportIds,
} from "@/hooks/api/useDiamond";
import { diamondApi } from "@/services/diamondApi";
import { LiveScoreDisplay } from "@/components/sportsbook/LiveScoreDisplay";
import { EnhancedOddsDisplay } from "@/components/sportsbook/EnhancedOddsDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DiamondMatch() {
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
  // Only fetch odds once we have both gmidNum and sidForQueries
  const shouldFetchOdds = Boolean(gmidNum && sidForQueries);
  const { data: oddsData, isLoading: loadingOdds } = useMatchOdds(
    gmidNum,
    sidForQueries,
    shouldFetchOdds,
  );

  const teams = useMemo(
    () => parseTeamNames(details?.name || ""),
    [details?.name],
  );
  const scoreUrl = useMemo(() => {
    if (!details?.gtv || !sidForQueries) return null;
    return diamondApi.getScoreUrl(details.gtv, sidForQueries);
  }, [details?.gtv, sidForQueries]);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Match Details</h1>
          <Button asChild>
            <Link to="/sports">Back to Sports</Link>
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4">
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
                  <div className="text-foreground font-semibold">
                    {teams.home}
                  </div>
                  <div className="text-foreground font-semibold">
                    {teams.away}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  GMID: {gmid} | SID:{" "}
                  {sidForQueries ?? (resolvingSid ? "resolving…" : "…")}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Live Score Display */}
        {gmidNum && sidForQueries && details?.is_live && (
          <LiveScoreDisplay gmid={gmidNum} sid={sidForQueries} />
        )}

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

        {/* Enhanced Odds Display with Betting */}
        {gmidNum && sidForQueries && !resolvingSid && (
          <Tabs defaultValue="match_odds" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="match_odds">Match Odds</TabsTrigger>
              <TabsTrigger value="bookmaker">Bookmaker</TabsTrigger>
              <TabsTrigger value="fancy">Fancy</TabsTrigger>
              <TabsTrigger value="toss">Toss</TabsTrigger>
            </TabsList>
            <TabsContent value="match_odds">
              <EnhancedOddsDisplay
                gmid={gmidNum}
                sid={sidForQueries}
                marketType="match_odds"
              />
            </TabsContent>
            <TabsContent value="bookmaker">
              <EnhancedOddsDisplay
                gmid={gmidNum}
                sid={sidForQueries}
                marketType="bookmaker"
              />
            </TabsContent>
            <TabsContent value="fancy">
              <EnhancedOddsDisplay
                gmid={gmidNum}
                sid={sidForQueries}
                marketType="fancy"
              />
            </TabsContent>
            <TabsContent value="toss">
              <EnhancedOddsDisplay
                gmid={gmidNum}
                sid={sidForQueries}
                marketType="toss"
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
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
