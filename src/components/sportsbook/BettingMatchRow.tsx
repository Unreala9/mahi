import { useState } from "react";
import {
  Loader2,
  Radio,
  Tv,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { useMatchDetails } from "@/hooks/api/useDiamond";
import { useLiveMatchOdds } from "@/hooks/api/useWebSocket";
import { diamondApi } from "@/services/diamondApi";
import type { MatchEvent, OddsData } from "@/services/diamondApi";
import { BettingModal } from "./BettingModal";

interface BettingMatchRowProps {
  match: MatchEvent;
  prefetchedOdds?: OddsData | null;
}

export function BettingMatchRow({
  match,
  prefetchedOdds,
}: BettingMatchRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialSelection, setModalInitialSelection] = useState<
    | {
        selection: string;
        betType: "back" | "lay";
        odds: number;
      }
    | undefined
  >(undefined);

  // Always fetch odds for all matches to display them in the table
  const {
    data: liveOdds,
    isLoading,
    lastUpdate,
  } = useLiveMatchOdds(match.gmid, match.sid, true);

  // Use prefetched data first, then live data
  const oddsData = prefetchedOdds ?? liveOdds;
  const { data: details } = useMatchDetails(match.gmid, match.sid);

  // Get match odds section (first 3 runners for 1, X, 2)
  // Fall back to bookmaker if match_odds is empty
  const matchOdds =
    oddsData?.match_odds && oddsData.match_odds.length > 0
      ? oddsData.match_odds
      : oddsData?.bookmaker || [];
  const hasOdds = matchOdds.length > 0;

  // Create array of exactly 3 outcomes (1, X, 2)
  // For 2-way markets (like cricket), put outcomes in columns 1 and 2, leave X empty
  let runners: (any | null)[];
  if (matchOdds.length === 2) {
    // 2-way market: Team 1 vs Team 2 (no draw)
    runners = [
      matchOdds[0] || null, // Outcome 1 (Home/First team)
      null, // Outcome X (No draw option)
      matchOdds[1] || null, // Outcome 2 (Away/Second team)
    ];
  } else {
    // 3-way market or other: Show all in order
    runners = [
      matchOdds[0] || null, // Outcome 1
      matchOdds[1] || null, // Outcome X
      matchOdds[2] || null, // Outcome 2
    ];
  }

  const handleOddsClick = (
    e: React.MouseEvent,
    selection: string,
    betType: "back" | "lay",
    odds: number,
  ) => {
    e.stopPropagation(); // Prevent row expansion
    setModalInitialSelection({ selection, betType, odds });
    setIsModalOpen(true);
  };

  return (
    <div className="border-b border-border even:bg-muted/30 hover:bg-muted/50 transition-colors">
      <div
        className="grid grid-cols-1 md:grid-cols-12 items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Match Info */}
        <div className="md:col-span-6 px-3 md:px-4 py-2.5 md:border-r border-border">
          <div className="flex items-center gap-2 md:gap-3">
            {match.is_live && (
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm text-foreground mb-0.5 truncate">
                {match.name}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground truncate">
                {match.cname} /{" "}
                {match.start_date
                  ? new Date(match.start_date).toLocaleString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Time TBD"}
              </div>
            </div>
            <div className="flex gap-1 md:gap-2 items-center text-muted-foreground flex-shrink-0">
              {match.is_live && <Tv className="h-3 w-3 md:h-3.5 md:w-3.5" />}
              <span className="text-[10px] md:text-xs font-bold">f</span>
              <span className="text-[10px] md:text-xs font-bold">BM</span>
              {expanded ? (
                <ChevronUp className="h-3 w-3 md:h-3.5 md:w-3.5" />
              ) : (
                <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5" />
              )}
            </div>
          </div>
        </div>

        {/* Odds Columns - 1, X, 2 */}
        {isLoading ? (
          <div className="col-span-6 flex justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : hasOdds ? (
          <>
            {/* Column 1 - First Outcome */}
            {(() => {
              const runner = runners[0];
              const columnClass =
                "md:col-span-2 px-1 py-1.5 md:py-2 text-center md:border-r border-border";

              if (!runner) {
                return (
                  <div key={0} className={columnClass}>
                    <div className="flex gap-0.5 md:gap-1 justify-center items-stretch">
                      <div className="flex-1 px-1 md:px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                        -
                      </div>
                      <div className="flex-1 px-1 md:px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                        -
                      </div>
                    </div>
                  </div>
                );
              }

              const backOdds = runner?.odds?.find(
                (o: any) =>
                  o.otype === "back" || o.oname?.toLowerCase().includes("back"),
              );
              const layOdds = runner?.odds?.find(
                (o: any) =>
                  o.otype === "lay" || o.oname?.toLowerCase().includes("lay"),
              );

              const hasBackOdds =
                backOdds &&
                backOdds.odds !== undefined &&
                backOdds.odds !== null;
              const hasLayOdds =
                layOdds && layOdds.odds !== undefined && layOdds.odds !== null;

              const runnerName =
                runner?.nat ||
                runner?.runner_name ||
                matchOdds[0]?.nat ||
                matchOdds[0]?.runner_name ||
                "Team 1";

              return (
                <div key={0} className={columnClass}>
                  <div className="flex gap-1 justify-center items-stretch">
                    {/* Back (Blue) */}
                    <div
                      onClick={(e) =>
                        hasBackOdds &&
                        backOdds.odds > 0 &&
                        handleOddsClick(e, runnerName, "back", backOdds.odds)
                      }
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                        hasBackOdds && backOdds.odds > 0
                          ? "bg-sky-300 hover:bg-sky-400 text-black"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="font-bold leading-tight">
                        {hasBackOdds
                          ? backOdds.odds > 0
                            ? backOdds.odds
                            : "SUSP"
                          : "-"}
                      </div>
                      {hasBackOdds && backOdds.odds > 0 && backOdds?.size && (
                        <div className="text-[9px] leading-tight mt-0.5">
                          {typeof backOdds.size === "object"
                            ? backOdds.size.size
                            : backOdds.size}
                        </div>
                      )}
                    </div>
                    {/* Lay (Pink) */}
                    <div
                      onClick={(e) =>
                        hasLayOdds &&
                        layOdds.odds > 0 &&
                        handleOddsClick(e, runnerName, "lay", layOdds.odds)
                      }
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                        hasLayOdds && layOdds.odds > 0
                          ? "bg-rose-300 hover:bg-rose-400 text-black"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="font-bold leading-tight">
                        {hasLayOdds
                          ? layOdds.odds > 0
                            ? layOdds.odds
                            : "SUSP"
                          : "-"}
                      </div>
                      {hasLayOdds && layOdds.odds > 0 && layOdds?.size && (
                        <div className="text-[9px] leading-tight mt-0.5">
                          {typeof layOdds.size === "object"
                            ? layOdds.size.size
                            : layOdds.size}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Column X - Draw/Second Outcome */}
            {(() => {
              const runner = runners[1];
              const columnClass =
                "md:col-span-2 px-1 py-2 text-center md:border-r border-border";

              if (!runner) {
                return (
                  <div key={1} className={columnClass}>
                    <div className="flex gap-1 justify-center items-stretch">
                      <div className="flex-1 px-2 py-1.5 text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                        -
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                        -
                      </div>
                    </div>
                  </div>
                );
              }

              const backOdds = runner?.odds?.find(
                (o: any) =>
                  o.otype === "back" || o.oname?.toLowerCase().includes("back"),
              );
              const layOdds = runner?.odds?.find(
                (o: any) =>
                  o.otype === "lay" || o.oname?.toLowerCase().includes("lay"),
              );

              const hasBackOdds =
                backOdds &&
                backOdds.odds !== undefined &&
                backOdds.odds !== null;
              const hasLayOdds =
                layOdds && layOdds.odds !== undefined && layOdds.odds !== null;

              const runnerName =
                runner?.nat ||
                runner?.runner_name ||
                matchOdds[1]?.nat ||
                matchOdds[1]?.runner_name ||
                "Draw";

              return (
                <div key={1} className={columnClass}>
                  <div className="flex gap-1 justify-center items-stretch">
                    {/* Back (Blue) */}
                    <div
                      onClick={(e) =>
                        hasBackOdds &&
                        backOdds.odds > 0 &&
                        handleOddsClick(e, runnerName, "back", backOdds.odds)
                      }
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                        hasBackOdds && backOdds.odds > 0
                          ? "bg-sky-300 hover:bg-sky-400 text-black"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="font-bold leading-tight">
                        {hasBackOdds
                          ? backOdds.odds > 0
                            ? backOdds.odds
                            : "SUSP"
                          : "-"}
                      </div>
                      {hasBackOdds && backOdds.odds > 0 && backOdds?.size && (
                        <div className="text-[9px] leading-tight mt-0.5">
                          {typeof backOdds.size === "object"
                            ? backOdds.size.size
                            : backOdds.size}
                        </div>
                      )}
                    </div>
                    {/* Lay (Pink) */}
                    <div
                      onClick={(e) =>
                        hasLayOdds &&
                        layOdds.odds > 0 &&
                        handleOddsClick(e, runnerName, "lay", layOdds.odds)
                      }
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                        hasLayOdds && layOdds.odds > 0
                          ? "bg-rose-300 hover:bg-rose-400 text-black"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="font-bold leading-tight">
                        {hasLayOdds
                          ? layOdds.odds > 0
                            ? layOdds.odds
                            : "SUSP"
                          : "-"}
                      </div>
                      {hasLayOdds && layOdds.odds > 0 && layOdds?.size && (
                        <div className="text-[9px] leading-tight mt-0.5">
                          {typeof layOdds.size === "object"
                            ? layOdds.size.size
                            : layOdds.size}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Column 2 - Third Outcome */}
            {(() => {
              const runner = runners[2];
              const columnClass = "md:col-span-2 px-1 py-2 text-center";

              if (!runner) {
                return (
                  <div key={2} className={columnClass}>
                    <div className="flex gap-1 justify-center items-stretch">
                      <div className="flex-1 px-2 py-1.5 text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                        -
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                        -
                      </div>
                    </div>
                  </div>
                );
              }

              const backOdds = runner?.odds?.find(
                (o: any) =>
                  o.otype === "back" || o.oname?.toLowerCase().includes("back"),
              );
              const layOdds = runner?.odds?.find(
                (o: any) =>
                  o.otype === "lay" || o.oname?.toLowerCase().includes("lay"),
              );

              const hasBackOdds =
                backOdds &&
                backOdds.odds !== undefined &&
                backOdds.odds !== null;
              const hasLayOdds =
                layOdds && layOdds.odds !== undefined && layOdds.odds !== null;

              const runnerName =
                runner?.nat ||
                runner?.runner_name ||
                matchOdds[2]?.nat ||
                matchOdds[2]?.runner_name ||
                "Team 2";

              return (
                <div key={2} className={columnClass}>
                  <div className="flex gap-1 justify-center items-stretch">
                    {/* Back (Blue) */}
                    <div
                      onClick={(e) =>
                        hasBackOdds &&
                        backOdds.odds > 0 &&
                        handleOddsClick(e, runnerName, "back", backOdds.odds)
                      }
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                        hasBackOdds && backOdds.odds > 0
                          ? "bg-sky-300 hover:bg-sky-400 text-black"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="font-bold leading-tight">
                        {hasBackOdds
                          ? backOdds.odds > 0
                            ? backOdds.odds
                            : "SUSP"
                          : "-"}
                      </div>
                      {hasBackOdds && backOdds.odds > 0 && backOdds?.size && (
                        <div className="text-[9px] leading-tight mt-0.5">
                          {typeof backOdds.size === "object"
                            ? backOdds.size.size
                            : backOdds.size}
                        </div>
                      )}
                    </div>
                    {/* Lay (Pink) */}
                    <div
                      onClick={(e) =>
                        hasLayOdds &&
                        layOdds.odds > 0 &&
                        handleOddsClick(e, runnerName, "lay", layOdds.odds)
                      }
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                        hasLayOdds && layOdds.odds > 0
                          ? "bg-rose-300 hover:bg-rose-400 text-black"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="font-bold leading-tight">
                        {hasLayOdds
                          ? layOdds.odds > 0
                            ? layOdds.odds
                            : "SUSP"
                          : "-"}
                      </div>
                      {hasLayOdds && layOdds.odds > 0 && layOdds?.size && (
                        <div className="text-[9px] leading-tight mt-0.5">
                          {typeof layOdds.size === "object"
                            ? layOdds.size.size
                            : layOdds.size}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <>
            {/* Column 1 - Locked */}
            <div className="md:col-span-2 px-1 py-1.5 md:py-2 text-center md:border-r border-border">
              <div className="flex gap-0.5 md:gap-1 justify-center items-stretch">
                <div className="flex-1 px-1 md:px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                  <Lock className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                <div className="flex-1 px-1 md:px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                  <Lock className="h-3 w-3 md:h-4 md:w-4" />
                </div>
              </div>
            </div>
            {/* Column X - Locked */}
            <div className="md:col-span-2 px-1 py-1.5 md:py-2 text-center md:border-r border-border">
              <div className="flex gap-0.5 md:gap-1 justify-center items-stretch">
                <div className="flex-1 px-1 md:px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                  <Lock className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                <div className="flex-1 px-1 md:px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                  <Lock className="h-3 w-3 md:h-4 md:w-4" />
                </div>
              </div>
            </div>
            {/* Column 2 - Locked */}
            <div className="md:col-span-2 px-1 py-1.5 md:py-2 text-center">
              <div className="flex gap-0.5 md:gap-1 justify-center items-stretch">
                <div className="flex-1 px-1 md:px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                  <Lock className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                <div className="flex-1 px-1 md:px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold bg-muted text-muted-foreground rounded flex items-center justify-center">
                  <Lock className="h-3 w-3 md:h-4 md:w-4" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Expanded Section - Bookmaker & Fancy */}
      {expanded && (
        <div className="bg-muted/20 px-4 py-3 border-t border-border">
          <div className="space-y-4">
            {/* Details */}
            {details && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">
                  Match Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-card p-2 rounded border border-border">
                  <div>
                    <div>GMID: {details.gmid}</div>
                    <div>Sport ID: {details.sid}</div>
                    <div>Live: {details.is_live ? "Yes" : "No"}</div>
                  </div>
                  <div>
                    <div>
                      Start:{" "}
                      {details.start_date
                        ? new Date(details.start_date).toLocaleString()
                        : "TBD"}
                    </div>
                    {details.teams && (
                      <div>
                        Teams: {details.teams.home} vs {details.teams.away}
                      </div>
                    )}
                  </div>
                </div>
                {details.gtv && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-foreground mb-2">
                      Live Score
                    </h4>
                    <div className="bg-card rounded border border-border overflow-hidden">
                      <iframe
                        src={diamondApi.getScoreUrl(details.gtv, match.sid)}
                        title="Live Score"
                        className="w-full h-64"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Bookmaker */}
            {oddsData?.bookmaker && oddsData.bookmaker.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Bookmark className="h-3 w-3" />
                  Bookmaker
                </h4>
                <div className="space-y-1">
                  {oddsData.bookmaker.map((book: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-card p-2 rounded border border-border"
                    >
                      <span className="text-xs text-muted-foreground flex-1">
                        {book.nat || book.runner_name || `Runner ${idx + 1}`}
                      </span>
                      <div className="flex gap-1">
                        {book.odds?.map((odd: any, oidx: number) => {
                          const isBack =
                            odd.otype === "back" ||
                            odd.oname?.toLowerCase().includes("back");
                          return (
                            <div
                              key={oidx}
                              className={`px-3 py-1 rounded text-xs font-bold ${
                                isBack
                                  ? "bg-sky-300 text-black"
                                  : "bg-rose-300 text-black"
                              }`}
                            >
                              {odd.odds || "-"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fancy */}
            {oddsData?.fancy && oddsData.fancy.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-300 mb-2">
                  Fancy
                </h4>
                <div className="space-y-1">
                  {oddsData.fancy.slice(0, 5).map((fancy: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded"
                    >
                      <span className="text-xs text-gray-300 flex-1">
                        {fancy.runner_name || `Fancy ${idx + 1}`}
                      </span>
                      {fancy.runs !== undefined && (
                        <span className="text-xs text-gray-400">
                          Runs: {fancy.runs}
                        </span>
                      )}
                      <div className="flex gap-1">
                        <div className="px-3 py-1 rounded text-xs font-bold bg-[#72bbef] text-gray-900">
                          {fancy.back?.odds || fancy.back || "-"}
                        </div>
                        <div className="px-3 py-1 rounded text-xs font-bold bg-[#faa9ba] text-gray-900">
                          {fancy.lay?.odds || fancy.lay || "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Betting Modal */}
      <BettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={match}
        oddsData={oddsData}
        initialSelection={modalInitialSelection}
      />
    </div>
  );
}
