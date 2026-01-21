import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Dice5, TrendingUp, ArrowLeft, Play } from "lucide-react";
import {
  useCasinoTables,
  useCasinoData,
  useCasinoLastResult,
} from "@/hooks/api/useDiamond";
import { CASINO_IMG_BASE_URL } from "@/services/diamondApi";

export default function CasinoLive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get("type");
  // selectedTable can be string (gmid) or number (if ID is used)
  const [selectedTable, setSelectedTable] = useState<string | number | null>(
    initialType || null,
  );

  const { data: tables = [], isLoading: loadingTables } = useCasinoTables();
  const { data: casinoData, isLoading: loadingData } = useCasinoData(
    selectedTable!,
  );
  const { data: lastResult } = useCasinoLastResult(selectedTable!);

  // Keep URL in sync with selected table
  useEffect(() => {
    const typeStr = selectedTable ? String(selectedTable) : null;
    const current = searchParams.get("type");
    if (typeStr !== current) {
      const next = new URLSearchParams(searchParams);
      if (typeStr) {
        next.set("type", typeStr);
      } else {
        next.delete("type");
      }
      setSearchParams(next);
    }
  }, [selectedTable, searchParams, setSearchParams]);

  const activeTable = useMemo(
    () =>
      tables.find(
        (t) => t.id === selectedTable || String(t.id) === String(selectedTable),
      ),
    [tables, selectedTable],
  );

  return (
    <MainLayout>
      <div className="space-y-6 min-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-8 rounded-xl border border-purple-700 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              <Dice5 className="h-10 w-10 text-gold animate-bounce-slow" />
              Live Casino
            </h1>
            <p className="text-purple-100 mt-2 text-lg max-w-2xl">
              Experience the thrill of real-time casino games with live dealers
              and instant results.
            </p>
          </div>
        </div>

        {/* Content */}
        {loadingTables ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-gold h-12 w-12" />
          </div>
        ) : selectedTable ? (
          /* Game View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button
              variant="custom"
              onClick={() => setSelectedTable(null)}
              className="mb-6 bg-gold hover:bg-yellow-600 text-black font-bold gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lobby
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Game Area */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-[#1a0520] border-gold/20 p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Dice5 className="h-32 w-32 text-gold/10 rotate-12" />
                  </div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      {activeTable?.imgpath && (
                        <img
                          src={`${CASINO_IMG_BASE_URL}/${activeTable.imgpath}`}
                          alt={activeTable.name}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gold/50 shadow-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/64x64/2d0000/gold?text=IMG";
                          }}
                        />
                      )}
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-wide">
                          {activeTable?.name || "Unknown Game"}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src="/icons/live.gif"
                            className="h-4 w-4"
                            alt=""
                          />
                          {/* Fallback live icon if not available */}
                          <Badge className="bg-red-600/90 text-white animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                            LIVE
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            Round ID: {casinoData?.mid || "Loading..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {loadingData ? (
                    <div className="py-20 text-center">
                      <Loader2 className="animate-spin text-gold h-12 w-12 mx-auto" />
                      <p className="text-gold/60 mt-4 animate-pulse">
                        Connecting to live table...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 relative z-10">
                      {/* Last Result Box */}
                      {lastResult && (
                        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 p-4 rounded-xl backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-green-200 font-medium">
                              Last Round Result
                            </span>
                            <Badge className="bg-green-500 text-white text-lg px-4 py-1 font-bold shadow-lg">
                              {lastResult.result || "WAITING"}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Odds/Data Display */}
                      {casinoData?.odds && casinoData.odds.length > 0 ? (
                        <div className="grid gap-3">
                          <h3 className="text-gold font-bold flex items-center gap-2 uppercase text-sm tracking-wider">
                            <TrendingUp className="h-4 w-4" /> Live Odds
                          </h3>
                          {casinoData.odds.map((odd: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-black/40 hover:bg-black/60 transition-colors p-4 rounded-xl border border-white/5 flex items-center justify-between group"
                            >
                              <span className="text-white font-semibold text-lg group-hover:text-gold transition-colors">
                                {odd.name || `Option ${idx + 1}`}
                              </span>
                              <div className="flex gap-3">
                                {odd.back && (
                                  <div className="text-center min-w-[80px]">
                                    <div className="bg-blue-600 text-white font-bold py-2 rounded-t-md px-4 text-xl shadow-lg shadow-blue-900/20">
                                      {odd.back}
                                    </div>
                                    <div className="bg-blue-800 text-blue-200 text-xs py-1 rounded-b-md">
                                      BACK
                                    </div>
                                  </div>
                                )}
                                {odd.lay && (
                                  <div className="text-center min-w-[80px]">
                                    <div className="bg-pink-600 text-white font-bold py-2 rounded-t-md px-4 text-xl shadow-lg shadow-pink-900/20">
                                      {odd.lay}
                                    </div>
                                    <div className="bg-pink-800 text-pink-200 text-xs py-1 rounded-b-md">
                                      LAY
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                          <p className="text-gray-400">
                            Waiting for next round...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar List (Other Tables) */}
              <div className="lg:col-span-1">
                <div className="bg-[#1a0520] border border-gold/20 rounded-xl overflow-hidden shadow-xl sticky top-6">
                  <div className="p-4 bg-black/40 border-b border-white/5">
                    <h3 className="text-gold font-bold">Other Games</h3>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {tables
                      .filter((t) => t.id !== selectedTable)
                      .map((table) => (
                        <div
                          key={table.id}
                          onClick={() => setSelectedTable(table.id)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all group"
                        >
                          <img
                            src={`${CASINO_IMG_BASE_URL}/${table.imgpath}`}
                            alt={table.name}
                            className="w-12 h-12 rounded bg-black/50 object-cover border border-white/10 group-hover:border-gold/50"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/48x48/2d0000/gold?text=IMG";
                            }}
                          />
                          <div className="overflow-hidden">
                            <p className="text-gray-300 font-medium truncate group-hover:text-white transition-colors">
                              {table.name}
                            </p>
                            <span className="text-xs text-green-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                              Live
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Lobby Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in duration-700">
            {tables.map((table) => (
              <div
                key={table.id}
                className="group relative bg-[#1a0520] rounded-xl overflow-hidden border border-gold/10 hover:border-gold/50 shadow-lg hover:shadow-gold/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setSelectedTable(table.id)}
              >
                {/* Image Container */}
                <div className="aspect-[4/3] bg-black/50 relative overflow-hidden">
                  <img
                    src={`${CASINO_IMG_BASE_URL}/${table.imgpath}`}
                    alt={table.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/300x225/2d0000/gold?text=" +
                        encodeURIComponent(table.name);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                    <div className="bg-gold text-black rounded-full p-4 transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                      <Play className="h-8 w-8 fill-current translate-x-1" />
                    </div>
                  </div>

                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-600 text-white text-[10px] px-2 py-0.5 shadow-lg animate-pulse">
                      LIVE
                    </Badge>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 relative">
                  <h3 className="text-white font-bold text-lg truncate group-hover:text-gold transition-colors">
                    {table.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">Live Dealer</span>
                    <span className="text-xs text-gold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Popular
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
