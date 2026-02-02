import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Radio } from "lucide-react";
import { useLiveMatchOdds } from "@/hooks/api/useWebSocket";
import type { MatchEvent } from "@/services/diamondApi";

interface DiamondMatchRowProps {
  match: MatchEvent;
  onAddToSlip?: (selection: any) => void;
}

export function DiamondMatchRow({ match, onAddToSlip }: DiamondMatchRowProps) {
  const [expanded, setExpanded] = useState(false);

  // Use live polling WebSocket for real-time odds updates
  const {
    data: oddsData,
    isLoading: loadingOdds,
    lastUpdate,
  } = useLiveMatchOdds(
    expanded ? match.gmid : null,
    expanded ? match.sid : null,
  );

  const teams = parseTeamNames(match.name);

  const handleOddsClick = (
    outcomeType: string,
    outcomeName: string,
    back: number | null,
    lay: number | null,
  ) => {
    if (!onAddToSlip) return;

    onAddToSlip({
      matchId: match.gmid,
      matchName: match.name,
      outcomeType,
      outcomeName,
      back,
      lay,
      isLive: match.is_live,
    });
  };

  return (
    <Card className="bg-[#2d0000] border-[#5a0000] overflow-hidden">
      {/* Match Header */}
      <div
        className="p-4 cursor-pointer hover:bg-[#3d0000] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {match.is_live && (
                <Badge className="bg-red-600 text-white animate-pulse">
                  <Radio className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              )}
              <span className="text-xs text-gray-400">
                {match.cname || match.sname}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-white font-semibold">{teams.home}</div>
              <div className="text-white font-semibold">{teams.away}</div>
            </div>
            {match.start_date && !match.is_live && (
              <div className="text-xs text-gray-400 mt-2">
                {new Date(match.start_date).toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gold"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
            <Button asChild variant="secondary" size="sm" className="ml-1">
              <Link to={`/match/${match.gmid}/${match.sid}`}>Open Page</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Odds Section */}
      {expanded && (
        <div className="border-t border-[#5a0000] p-4 bg-[#1d0000]">
          {loadingOdds ? (
            <div className="text-center text-gray-400 py-4">
              Loading odds...
            </div>
          ) : !oddsData ? (
            <div className="text-center text-gray-400 py-4">
              No odds available
            </div>
          ) : (
            <div className="space-y-4">
              {/* Match Odds */}
              {oddsData.match_odds && oddsData.match_odds.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gold mb-2">
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
                        onClick={(type, odds) =>
                          handleOddsClick(
                            "Match Odds",
                            odd.nation || odd.runner_name,
                            type === "back" ? odds : null,
                            type === "lay" ? odds : null,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bookmaker */}
              {oddsData.bookmaker && oddsData.bookmaker.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gold mb-2">
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
                        onClick={(type, odds) =>
                          handleOddsClick(
                            "Bookmaker",
                            book.nation || book.runner_name,
                            type === "back" ? odds : null,
                            type === "lay" ? odds : null,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Fancy */}
              {oddsData.fancy && oddsData.fancy.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gold mb-2">Fancy</h4>
                  <div className="grid gap-2">
                    {oddsData.fancy.map((fancy: any, idx: number) => (
                      <OddsRow
                        key={idx}
                        label={fancy.runner_name || `Fancy ${idx + 1}`}
                        back={fancy.back}
                        lay={fancy.lay}
                        runs={fancy.runs}
                        onClick={(type, odds) =>
                          handleOddsClick(
                            "Fancy",
                            fancy.runner_name,
                            type === "back" ? odds : null,
                            type === "lay" ? odds : null,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Odds Row Component
interface OddsRowProps {
  label: string;
  back: any;
  lay: any;
  runs?: number;
  onClick?: (type: "back" | "lay", odds: number) => void;
}

function OddsRow({ label, back, lay, runs, onClick }: OddsRowProps) {
  const backOdds = Array.isArray(back) ? back[0] : back;
  const layOdds = Array.isArray(lay) ? lay[0] : lay;

  return (
    <div className="flex items-center gap-2 bg-[#2d0000] p-2 rounded">
      <div className="flex-1 text-sm text-white">{label}</div>
      {runs !== undefined && (
        <div className="text-xs text-gray-400 mr-2">Runs: {runs}</div>
      )}
      <div className="flex gap-2">
        {/* Back (Blue) */}
        <Button
          size="sm"
          disabled={!backOdds || !backOdds.price}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 min-w-[60px] disabled:opacity-30"
          onClick={() => onClick?.("back", backOdds?.price)}
        >
          <div className="text-center">
            <div className="font-bold">{backOdds?.price || "-"}</div>
            {backOdds?.size && (
              <div className="text-xs opacity-80">
                {typeof backOdds.size === "object"
                  ? backOdds.size.size
                  : backOdds.size}
              </div>
            )}
          </div>
        </Button>

        {/* Lay (Pink) */}
        <Button
          size="sm"
          disabled={!layOdds || !layOdds.price}
          className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 min-w-[60px] disabled:opacity-30"
          onClick={() => onClick?.("lay", layOdds?.price)}
        >
          <div className="text-center">
            <div className="font-bold">{layOdds?.price || "-"}</div>
            {layOdds?.size && (
              <div className="text-xs opacity-80">
                {typeof layOdds.size === "object"
                  ? layOdds.size.size
                  : layOdds.size}
              </div>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}

// Helper function
function parseTeamNames(matchName: string | undefined): {
  home: string;
  away: string;
} {
  if (!matchName) {
    return { home: "Team 1", away: "Team 2" };
  }

  const separators = [" vs ", " v ", " VS ", " V "];

  for (const sep of separators) {
    if (matchName.includes(sep)) {
      const [home, away] = matchName.split(sep);
      return { home: home.trim(), away: away.trim() };
    }
  }

  return { home: matchName, away: "TBD" };
}
