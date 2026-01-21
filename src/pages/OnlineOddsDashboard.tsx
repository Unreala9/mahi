import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  useWebSocketSports,
  useWebSocketMatches,
  useWebSocketOdds,
  useWebSocketDetails,
  useWebSocketStatus,
} from "@/hooks/api/useWebSocket";
import { diamondApi, type MatchEvent } from "@/services/diamondApi";

type Odds = { otype?: string; oname?: string; odds?: number; size?: number };
type Section = { sid: number; nat?: string; odds?: Odds[] };

const Pill = ({
  label,
  value,
  size,
  variant,
}: {
  label: string;
  value?: number;
  size?: number;
  variant: "back" | "lay";
}) => (
  <div
    className={`px-3 py-2 rounded-md text-xs font-bold ${variant === "back" ? "bg-[#72bbef] text-gray-900" : "bg-[#faa9ba] text-gray-900"}`}
  >
    <span className="opacity-80 mr-1">{label}</span>
    {value ?? "-"}
    {typeof size === "number" && (
      <span className="ml-1 text-[10px] opacity-70">({size})</span>
    )}
  </div>
);

const Card = ({ title, children }: { title: string; children: any }) => (
  <div className="p-4 rounded-lg bg-[#0f172a] border border-[#1f2a44]">
    <div className="text-sm font-semibold text-gray-200 mb-3">{title}</div>
    {children}
  </div>
);

const getBest = (odds: Odds[] = []) => {
  const backs = odds.filter(
    (o) => o.otype === "back" && typeof o.odds === "number",
  );
  const lays = odds.filter(
    (o) => o.otype === "lay" && typeof o.odds === "number",
  );
  const bestBack = backs.length
    ? backs.reduce((a, b) => (a.odds! > b.odds! ? a : b))
    : undefined;
  const bestLay = lays.length
    ? lays.reduce((a, b) => (a.odds! < b.odds! ? a : b))
    : undefined;
  return { bestBack, bestLay };
};

export default function OnlineOddsDashboard() {
  // WebSocket connection status
  const { isConnected } = useWebSocketStatus();

  // Sports
  const { data: sports } = useWebSocketSports();
  const defaultSport = useMemo(
    () =>
      (sports || []).find((s) => s.sid === 4)?.sid ?? sports?.[0]?.sid ?? null,
    [sports],
  );
  const [sportId, setSportId] = useState<number | null>(defaultSport);

  // Matches for selected sport
  const { data: matches = [] } = useWebSocketMatches(sportId);
  const [selected, setSelected] = useState<MatchEvent | null>(
    matches[0] ?? null,
  );

  // Update selection when matches change
  useMemo(() => {
    if (!selected && matches.length) setSelected(matches[0]);
  }, [matches]);

  const gmid = selected?.gmid ?? null;
  const sid = selected?.sid ?? sportId;

  // Details and odds via WebSocket
  const { data: details } = useWebSocketDetails(gmid, sid);
  const { data: odds, isLoading: oddsLoading } = useWebSocketOdds(gmid, sid);

  // Debug logging
  useMemo(() => {
    if (odds) {
      console.log("[Dashboard] Odds received:", {
        gmid,
        sid,
        match_odds: odds.match_odds?.length || 0,
        bookmaker: odds.bookmaker?.length || 0,
        fancy: odds.fancy?.length || 0,
      });
    }
  }, [odds, gmid, sid]);

  const title =
    selected?.name ||
    (() => {
      const teams = details?.teams;
      return teams ? `${teams.home} vs ${teams.away}` : "Online Odds";
    })();

  const matchOdds: Section[] = (odds?.match_odds || []) as Section[];
  const bookmaker: Section[] = (odds?.bookmaker || []) as Section[];
  const fancy: Section[] = (odds?.fancy || []) as Section[];

  const scoreUrl = details?.gtv
    ? diamondApi.getScoreUrl(details.gtv, sid as number)
    : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold ${isConnected ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`}
              ></span>
              {isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}
            </div>
            <div className="text-xs text-gray-400">Live API via WebSocket</div>
          </div>
        </div>

        {/* Sport selector */}
        <div className="flex gap-2 flex-wrap">
          {(sports || []).map((s) => (
            <button
              key={s.sid}
              onClick={() => {
                setSportId(s.sid);
                setSelected(null);
              }}
              className={`px-3 py-1 rounded-md text-sm border ${sportId === s.sid ? "bg-[#13203a] border-[#264c8a] text-white" : "bg-[#0f172a] border-[#1f2a44] text-gray-300"}`}
            >
              {s.icon ?? ""} {s.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar: Matches */}
          <div className="lg:col-span-1 bg-[#0b1220] border border-[#1f2a44] rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-200 mb-3">
              Matches
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
              {matches.map((m) => (
                <button
                  key={m.gmid}
                  onClick={() => setSelected(m)}
                  className={`w-full text-left p-2 rounded-md border ${selected?.gmid === m.gmid ? "bg-[#13203a] border-[#264c8a]" : "bg-[#0f172a] border-[#1f2a44]"}`}
                >
                  <div className="text-xs text-gray-300">{m.cname}</div>
                  <div className="text-sm text-gray-100">{m.name}</div>
                  {m.start_date && (
                    <div className="text-[11px] text-gray-400">
                      {m.start_date}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Details */}
            <Card title="Match Details">
              {details ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-200">
                  <div>
                    <span className="opacity-70">Event:</span> {details.name}
                  </div>
                  <div>
                    <span className="opacity-70">Start:</span>{" "}
                    {details.start_date}
                  </div>
                  <div>
                    <span className="opacity-70">In Play:</span>{" "}
                    {details.is_live ? "Yes" : "No"}
                  </div>
                  {details.teams && (
                    <div className="col-span-2">
                      <span className="opacity-70">Teams:</span>{" "}
                      {details.teams.home} vs {details.teams.away}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  No details available.
                </div>
              )}
            </Card>

            {scoreUrl && (
              <Card title="Live Score">
                <iframe
                  title="Live score"
                  src={scoreUrl}
                  className="w-full h-[360px] rounded-md border border-[#1f2a44]"
                />
              </Card>
            )}

            {/* Markets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* MATCH_ODDS */}
              <Card title="Match Odds (Exchange)">
                {oddsLoading ? (
                  <div className="text-sm text-gray-400 animate-pulse">
                    Loading odds...
                  </div>
                ) : matchOdds.length ? (
                  <div className="space-y-3">
                    {matchOdds.map((sec) => {
                      const { bestBack, bestLay } = getBest(sec.odds || []);
                      return (
                        <div
                          key={sec.sid}
                          className="bg-[#0b1220] border border-[#1f2a44] p-3 rounded-md"
                        >
                          <div className="text-sm text-gray-200 mb-2">
                            {sec.nat || `Runner ${sec.sid}`}
                          </div>
                          <div className="flex gap-2">
                            <Pill
                              label="Back"
                              value={bestBack?.odds}
                              size={bestBack?.size}
                              variant="back"
                            />
                            <Pill
                              label="Lay"
                              value={bestLay?.odds}
                              size={bestLay?.size}
                              variant="lay"
                            />
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-1">
                            {(sec.odds || []).map((o, i) => (
                              <div
                                key={i}
                                className={`px-2 py-1 rounded text-[11px] font-bold ${
                                  o.otype === "back"
                                    ? "bg-[#173555] text-[#9bd1ff]"
                                    : "bg-[#3a1824] text-[#ffd1db]"
                                }`}
                              >
                                {o.oname || o.otype}: {o.odds ?? "-"}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    No exchange odds available.
                  </div>
                )}
              </Card>

              {/* Bookmaker */}
              <Card title="Bookmaker">
                {oddsLoading ? (
                  <div className="text-sm text-gray-400 animate-pulse">
                    Loading bookmaker...
                  </div>
                ) : bookmaker.length ? (
                  <div className="space-y-3">
                    {bookmaker.map((sec) => {
                      const { bestBack, bestLay } = getBest(sec.odds || []);
                      return (
                        <div
                          key={sec.sid}
                          className="bg-[#0b1220] border border-[#1f2a44] p-3 rounded-md"
                        >
                          <div className="text-sm text-gray-200 mb-2">
                            {sec.nat || `Runner ${sec.sid}`}
                          </div>
                          <div className="flex gap-2">
                            <Pill
                              label="Back"
                              value={bestBack?.odds}
                              size={bestBack?.size}
                              variant="back"
                            />
                            <Pill
                              label="Lay"
                              value={bestLay?.odds}
                              size={bestLay?.size}
                              variant="lay"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    No bookmaker odds available.
                  </div>
                )}
              </Card>

              {/* Fancy */}
              <Card title="Fancy (Top 12)">
                {oddsLoading ? (
                  <div className="text-sm text-gray-400 animate-pulse">
                    Loading fancy markets...
                  </div>
                ) : fancy.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {fancy.slice(0, 12).map((sec) => {
                      const backs =
                        sec.odds?.filter((o) => o.otype === "back") || [];
                      const lays =
                        sec.odds?.filter((o) => o.otype === "lay") || [];
                      const back = backs[0];
                      const lay = lays[0];
                      return (
                        <div
                          key={sec.sid}
                          className="bg-[#0b1220] border border-[#1f2a44] p-3 rounded-md"
                        >
                          <div className="text-xs text-gray-300 mb-2">
                            {sec.nat || `Fancy ${sec.sid}`}
                          </div>
                          <div className="flex gap-2">
                            <Pill
                              label="Back"
                              value={back?.odds}
                              size={back?.size}
                              variant="back"
                            />
                            <Pill
                              label="Lay"
                              value={lay?.odds}
                              size={lay?.size}
                              variant="lay"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    No fancy markets available.
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
