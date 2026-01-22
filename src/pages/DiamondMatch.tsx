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
                  <div className="text-foreground font-semibold">{teams.home}</div>
                  <div className="text-foreground font-semibold">{teams.away}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  GMID: {gmid} | SID:{" "}
                  {sidForQueries ?? (resolvingSid ? "resolving…" : "…")}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {scoreUrl && (
          <Card className="p-4">
            <h2 className="text-sm font-bold mb-2">Live Score</h2>
            <div className="w-full h-[360px]">
              <iframe src={scoreUrl} className="w-full h-full" />
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h2 className="text-sm font-bold mb-3">Odds</h2>
          {loadingOdds || resolvingSid ? (
            <div className="text-center text-muted-foreground py-4">
              Loading odds...
            </div>
          ) : !sidForQueries ? (
            <div className="text-center text-muted-foreground py-4">
              Waiting for match ID resolution…
            </div>
          ) : !oddsData ? (
            <div className="text-center text-muted-foreground py-4">
              No odds available
            </div>
          ) : (
            <div className="space-y-4">
              {oddsData.match_odds && oddsData.match_odds.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold mb-2">
                    Match Odds
                  </h4>
                  <div className="grid gap-2">
                    {oddsData.match_odds.map((odd: any, idx: number) => (
                      <OddsRow
                        key={idx}
                        label={
                          odd.nation || odd.runner_name || `Runner ${idx + 1}`
                        }
                        back={odd.back}
                        lay={odd.lay}
                      />
                    ))}
                  </div>
                </div>
              )}
              {oddsData.bookmaker && oddsData.bookmaker.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold mb-2">
                    Bookmaker
                  </h4>
                  <div className="grid gap-2">
                    {oddsData.bookmaker.map((book: any, idx: number) => (
                      <OddsRow
                        key={idx}
                        label={
                          book.nation || book.runner_name || `Runner ${idx + 1}`
                        }
                        back={book.back}
                        lay={book.lay}
                      />
                    ))}
                  </div>
                </div>
              )}
              {oddsData.fancy && oddsData.fancy.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold mb-2">Fancy</h4>
                  <div className="grid gap-2">
                    {oddsData.fancy.map((fancy: any, idx: number) => (
                      <OddsRow
                        key={idx}
                        label={fancy.runner_name || `Fancy ${idx + 1}`}
                        back={fancy.back}
                        lay={fancy.lay}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

function OddsRow({ label, back, lay }: { label: string; back: any; lay: any }) {
  const backOdds = Array.isArray(back) ? back[0] : back;
  const layOdds = Array.isArray(lay) ? lay[0] : lay;

  return (
    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded border border-border">
      <div className="flex-1 text-sm text-foreground">{label}</div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!backOdds || !backOdds.price}
          className="bg-sky-300 hover:bg-sky-400 text-black px-3 py-1 min-w-[60px] disabled:opacity-30"
        >
          <div className="text-center">
            <div className="font-bold">{backOdds?.price || "-"}</div>
            {backOdds?.size && (
              <div className="text-xs opacity-80">{backOdds.size}</div>
            )}
          </div>
        </Button>
        <Button
          size="sm"
          disabled={!layOdds || !layOdds.price}
          className="bg-rose-300 hover:bg-rose-400 text-black px-3 py-1 min-w-[60px] disabled:opacity-30"
        >
          <div className="text-center">
            <div className="font-bold">{layOdds?.price || "-"}</div>
            {layOdds?.size && (
              <div className="text-xs opacity-80">{layOdds.size}</div>
            )}
          </div>
        </Button>
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
  return { home: matchName || "Team 1", away: "Team 2" };
}
