import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

type Odds = { otype?: string; oname?: string; odds?: number; size?: number };
type Section = { sid: number; nat?: string; odds?: Odds[] };
type Market = {
  gmid?: number;
  mname: string;
  gtype: string;
  status: string;
  section?: Section[];
};
type OddsFile = { success: boolean; data: Market[] };

type MatchListItem = {
  gmid: number;
  ename?: string;
  cname?: string;
  stime?: string;
  status?: string;
  section?: Section[];
};
type MatchListFile = { success: boolean; data: { t1?: MatchListItem[] } };

type MatchDetails = {
  gmid: number;
  ename?: string;
  cname?: string;
  stime?: string;
  iplay?: boolean;
  bm?: boolean;
  f?: boolean;
  f1?: boolean;
  tv?: boolean;
  scard?: number;
  gtv?: number;
};
type MatchDetailsFile = { success: boolean; data: MatchDetails[] };

const parseRawJson = <T,>(raw: any): T | null => {
  try {
    // If already parsed JSON, return as-is
    if (typeof raw === "object") return raw as T;
    const start = (raw as string).indexOf("{");
    const jsonText =
      start >= 0 ? (raw as string).slice(start) : (raw as string);
    return JSON.parse(jsonText) as T;
  } catch {
    return null;
  }
};

async function loadJson<T>(candidates: string[]): Promise<T | null> {
  // Try dynamic import first (avoids Vite static import analysis)
  for (const path of candidates) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error dynamic json import
      const mod = await import(/* @vite-ignore */ path);
      const data = (mod?.default ?? mod) as T;
      if (data) return data;
    } catch {}
  }
  // Fallback: try fetch (works if files are in /public)
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = (await res.json()) as T;
        return json;
      }
    } catch {}
  }
  return null;
}

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

export default function OfflineOddsDashboard() {
  const [oddsFile, setOddsFile] = useState<OddsFile | null>(null);
  const [matchListFile, setMatchListFile] = useState<MatchListFile | null>(
    null,
  );
  const [matchDetailsFile, setMatchDetailsFile] =
    useState<MatchDetailsFile | null>(null);

  useMemo(() => {
    // Load JSON from multiple candidates: project root and public
    loadJson<OddsFile>(["../../odds.json", "/odds.json"]).then((d) =>
      setOddsFile(d),
    );
    loadJson<MatchListFile>(["../../matchlist.json", "/matchlist.json"]).then(
      (d) => setMatchListFile(d),
    );
    loadJson<MatchDetailsFile>([
      "../../matchdetails.json",
      "/matchdetails.json",
    ]).then((d) => setMatchDetailsFile(d));
  }, []);
  const markets = oddsFile?.data || [];
  const matchList = (matchListFile?.data?.t1 || []).filter(
    (m) => typeof m.gmid === "number",
  );
  const availableGmidsFromOdds = new Set(
    (markets || []).map((m) => m.gmid).filter(Boolean) as number[],
  );

  const initial =
    matchList.find((m) => availableGmidsFromOdds.has(m.gmid)) ||
    matchList[0] ||
    null;
  const [selected, setSelected] = useState<MatchListItem | null>(initial);

  const selectedDetails =
    (selected &&
      matchDetailsFile?.data?.find((d) => d.gmid === selected.gmid)) ||
    null;
  const selectedMarkets = markets.filter(
    (m) => !m.gmid || (selected && m.gmid === selected.gmid),
  );
  const matchOdds = selectedMarkets.find((m) => m.mname === "MATCH_ODDS");
  const bookmaker = selectedMarkets.find((m) => m.mname === "Bookmaker");
  const fancy = selectedMarkets.find((m) => m.mname === "Normal");

  const title =
    selected?.ename ||
    (() => {
      const teams = matchOdds?.section
        ?.map((s) => s.nat)
        .filter(Boolean) as string[];
      return teams && teams.length >= 2
        ? `${teams[0]} vs ${teams[1]}`
        : "Offline Odds";
    })();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <div className="text-xs text-gray-400">
            Sources: odds.json, matchlist.json, matchdetails.json,
            allsportsmatchlist.json
          </div>
        </div>

        {/* Top errors */}
        {(!oddsFile || !matchListFile) && (
          <div className="p-4 rounded bg-[#1a1a1a] border border-red-600/40 text-sm text-red-300">
            Could not parse one or more source JSON files.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar: Matches */}
          <div className="lg:col-span-1 bg-[#0b1220] border border-[#1f2a44] rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-200 mb-3">
              Matches
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
              {matchList.map((m) => (
                <button
                  key={m.gmid}
                  onClick={() => setSelected(m)}
                  className={`w-full text-left p-2 rounded-md border ${selected?.gmid === m.gmid ? "bg-[#13203a] border-[#264c8a]" : "bg-[#0f172a] border-[#1f2a44]"}`}
                >
                  <div className="text-xs text-gray-300">{m.cname}</div>
                  <div className="text-sm text-gray-100">{m.ename}</div>
                  {m.stime && (
                    <div className="text-[11px] text-gray-400">{m.stime}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Details */}
            <Card title="Match Details">
              {selectedDetails ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-200">
                  <div>
                    <span className="opacity-70">Event:</span>{" "}
                    {selectedDetails.ename}
                  </div>
                  <div>
                    <span className="opacity-70">Competition:</span>{" "}
                    {selectedDetails.cname}
                  </div>
                  <div>
                    <span className="opacity-70">Start:</span>{" "}
                    {selectedDetails.stime}
                  </div>
                  <div>
                    <span className="opacity-70">In Play:</span>{" "}
                    {selectedDetails.iplay ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="opacity-70">Bookmaker:</span>{" "}
                    {selectedDetails.bm ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="opacity-70">Fancy:</span>{" "}
                    {selectedDetails.f ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="opacity-70">Fancy1:</span>{" "}
                    {selectedDetails.f1 ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="opacity-70">TV:</span>{" "}
                    {selectedDetails.tv ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="opacity-70">Scorecard:</span>{" "}
                    {selectedDetails.scard ? selectedDetails.scard : "-"}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  No details available for this match.
                </div>
              )}
            </Card>

            {/* Markets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* MATCH_ODDS */}
              <Card title="Match Odds (Exchange)">
                <div className="space-y-3">
                  {(matchOdds?.section || []).map((sec) => {
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
              </Card>

              {/* Bookmaker */}
              <Card title="Bookmaker">
                <div className="space-y-3">
                  {(bookmaker?.section || []).map((sec) => {
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
              </Card>

              {/* Fancy */}
              <Card title="Fancy (Top 12)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(fancy?.section || []).slice(0, 12).map((sec) => {
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
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
