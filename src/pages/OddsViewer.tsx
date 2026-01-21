import { useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error Vite raw import
import oddsRaw from "../../Api Response/matchods.txt?raw";

type Odds = { otype?: string; oname?: string; odds?: number; size?: number };
type Section = { sid: number; nat?: string; odds?: Odds[] };
type Market = {
  mname: string;
  gtype: string;
  status: string;
  section?: Section[];
};
type OddsFile = { success: boolean; data: Market[] };

const parseFile = (raw: string): OddsFile | null => {
  try {
    const start = raw.indexOf("{");
    const jsonText = raw.slice(start);
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
};

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

const OddsPill = ({
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

const MarketCard = ({ title, children }: { title: string; children: any }) => (
  <div className="p-4 rounded-lg bg-[#0f172a] border border-[#1f2a44]">
    <div className="text-sm font-semibold text-gray-200 mb-3">{title}</div>
    {children}
  </div>
);

const OddsViewer = () => {
  const parsed = useMemo(() => parseFile(oddsRaw as string), []);
  const markets = parsed?.data || [];

  const matchOdds = markets.find((m) => m.mname === "MATCH_ODDS");
  const bookmaker = markets.find((m) => m.mname === "Bookmaker");
  const fancy = markets.find((m) => m.mname === "Normal");

  // Title from MATCH_ODDS sections
  const teams = matchOdds?.section
    ?.map((s) => s.nat)
    .filter(Boolean) as string[];
  const title =
    teams && teams.length >= 2 ? `${teams[0]} vs ${teams[1]}` : "Odds Viewer";

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <div className="text-xs text-gray-400">
            Data source: Api Response/matchods.txt
          </div>
        </div>

        {!parsed && (
          <div className="p-4 rounded bg-[#1a1a1a] border border-red-600/40 text-sm text-red-300">
            Could not parse the odds file.
          </div>
        )}

        {parsed && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* MATCH_ODDS */}
            <MarketCard title="Match Odds (Exchange)">
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
                        <OddsPill
                          label="Back"
                          value={bestBack?.odds}
                          size={bestBack?.size}
                          variant="back"
                        />
                        <OddsPill
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
            </MarketCard>

            {/* Bookmaker */}
            <MarketCard title="Bookmaker">
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
                        <OddsPill
                          label="Back"
                          value={bestBack?.odds}
                          size={bestBack?.size}
                          variant="back"
                        />
                        <OddsPill
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
            </MarketCard>

            {/* Fancy */}
            <MarketCard title="Fancy (Top 12)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(fancy?.section || []).slice(0, 12).map((sec) => {
                  const backs =
                    sec.odds?.filter((o) => o.otype === "back") || [];
                  const lays = sec.odds?.filter((o) => o.otype === "lay") || [];
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
                        <OddsPill
                          label="Back"
                          value={back?.odds}
                          size={back?.size}
                          variant="back"
                        />
                        <OddsPill
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
            </MarketCard>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OddsViewer;
