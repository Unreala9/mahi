import { useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
// Import raw text so we can strip the curl header and parse JSON
// Note: path includes a space; Vite supports ?raw imports for arbitrary files
// Adjust relative path if this file moves.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error Vite raw import
import oddsRaw from "../../Api Response/matchods.txt?raw";

type OddsFileMarket = {
  gmid: number;
  mid: number;
  mname: string; // e.g., MATCH_ODDS, Bookmaker, Normal, fancy1, meter, khado, oddeven
  gtype: string; // e.g., match, match1, fancy, fancy1, meter, khado, oddeven
  status: string; // OPEN / SUSPENDED
  section?: Array<{
    sid: number;
    nat?: string; // runner name / label
    odds?: Array<{
      otype?: string; // back/lay
      oname?: string; // back1/back2/lay1 etc
      odds?: number;
      size?: number;
    }>;
  }>;
};

type OddsFile = {
  success: boolean;
  msg: string;
  status: number;
  data: OddsFileMarket[];
};

const safeParseOddsFile = (raw: string): OddsFile | null => {
  try {
    const start = raw.indexOf("{");
    if (start === -1) return null;
    const jsonText = raw.slice(start);
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (e) {
    console.warn("Failed to parse matchods.txt", e);
    return null;
  }
};

const OddsDebug = () => {
  const parsed = useMemo(() => safeParseOddsFile(oddsRaw as string), []);

  const summary = useMemo(() => {
    if (!parsed?.data)
      return [] as Array<{
        mname: string;
        gtype: string;
        status: string;
        sections: number;
      }>;
    return parsed.data.map((m) => ({
      mname: m.mname,
      gtype: m.gtype,
      status: m.status,
      sections: m.section?.length || 0,
    }));
  }, [parsed]);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Odds Debug (matchods.txt)</h1>
          <span className="text-xs text-gray-400">
            Source: Api Response/matchods.txt
          </span>
        </div>

        {!parsed && (
          <div className="p-4 rounded bg-[#1a1a1a] border border-red-600/40 text-sm text-red-300">
            Could not parse the odds file. Ensure it contains valid JSON after
            the curl header.
          </div>
        )}

        {parsed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded bg-[#1a1a1a] border border-gray-700">
                <div className="text-xs font-semibold text-gray-300 mb-2">
                  Summary
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  {summary.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="font-medium">{s.mname}</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#2a2a2a] text-gray-300">
                        {s.gtype}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#333] text-gray-300">
                        {s.status}
                      </span>
                      <span className="ml-auto text-gray-400">
                        sections: {s.sections}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded bg-[#1a1a1a] border border-gray-700">
                <div className="text-xs font-semibold text-gray-300 mb-2">
                  First MATCH_ODDS runners
                </div>
                <div className="space-y-2 text-xs text-gray-300">
                  {parsed.data
                    .find((m) => m.mname === "MATCH_ODDS")
                    ?.section?.map((sec) => (
                      <div
                        key={sec.sid}
                        className="bg-[#2a2a2a] p-2 rounded border border-gray-700"
                      >
                        <div className="font-medium mb-1">
                          {sec.nat || `Runner ${sec.sid}`}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {(sec.odds || []).map((o, i) => (
                            <div
                              key={i}
                              className={`px-2 py-1 rounded text-[11px] font-bold ${
                                o.otype === "back"
                                  ? "bg-[#72bbef] text-gray-900"
                                  : "bg-[#faa9ba] text-gray-900"
                              }`}
                            >
                              {o.oname || o.otype}: {o.odds ?? "-"}{" "}
                              {o.size ? (
                                <span className="text-[10px] opacity-80">
                                  ({o.size})
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded bg-[#1a1a1a] border border-gray-700">
              <div className="text-xs font-semibold text-gray-300 mb-2">
                Full JSON
              </div>
              <pre className="text-[10px] text-gray-300 overflow-auto max-h-[60vh]">
                {JSON.stringify(parsed, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default OddsDebug;
