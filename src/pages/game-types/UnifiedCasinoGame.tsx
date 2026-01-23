import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CasinoGame } from "@/types/casino";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { getImageUrlForGame } from "@/services/casino";
import { BetButtonGrid } from "@/components/casino/BetButton";
import {
  BetSlipSidebar,
  type Bet,
} from "./components/SharedGameComponents";
import { BettingChipSelector } from "@/components/casino/BettingChip";
import { GameHeader, ResultsSection } from "./components/SharedGameComponents";
import { CountdownTimer } from "@/components/casino/GameTimer";

type AnyMarket = {
  sid: number;
  nat: string;
  b: number;
  bs: number;
  sr: number;
  gstatus: "ACTIVE" | "SUSPENDED";
  min: number;
  max: number;
  subtype: string;
  etype: string;
};

function normalizeMarkets(liveData: any): AnyMarket[] {
  const markets = liveData?.sub;
  if (!Array.isArray(markets)) return [];
  return markets.filter((m: any) => m && typeof m.nat === "string");
}

export function UnifiedCasinoGame({ game }: { game: CasinoGame }) {
  const navigate = useNavigate();
  const { data: liveData, status, isLoading, error } = useCasinoLive(game.gmid);

  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [activeMatkaTab, setActiveMatkaTab] = useState<string>("single");

  const markets = useMemo(() => normalizeMarkets(liveData), [liveData]);
  const imageSrc = useMemo(() => getImageUrlForGame(game)[0] || "", [game]);

  const roundId = (liveData as any)?.roundId ?? "";
  const timer = (liveData as any)?.timer;
  const result = (liveData as any)?.result;

  const isMatka = game.gname.toLowerCase().includes("matka") || game.gmid.toLowerCase().includes("worli");

  // Bet management functions
  const handleAddBet = (marketName: string, selectionName: string, odds: number) => {
    if (selectedChip <= 0) {
      // Or show a toast/message to select a chip first
      console.warn("Please select a chip amount before placing a bet.");
      return;
    }

    setBets((prevBets) => {
      const existingBetIndex = prevBets.findIndex(
        (b) => b.marketName === marketName && b.selectionName === selectionName
      );

      if (existingBetIndex > -1) {
        // If bet exists, update its stake
        const updatedBets = [...prevBets];
        updatedBets[existingBetIndex].stake += selectedChip;
        return updatedBets;
      } else {
        // Otherwise, add a new bet
        const newBet: Bet = {
          marketName,
          selectionName,
          odds,
          stake: selectedChip,
        };
        return [...prevBets, newBet];
      }
    });
  };

  const handleRemoveBet = (index: number) => {
    setBets((prevBets) => prevBets.filter((_, i) => i !== index));
  };

  const handleUpdateStake = (index: number, stake: number) => {
    setBets((prevBets) => {
      const updatedBets = [...prevBets];
      if (updatedBets[index]) {
        updatedBets[index].stake = stake;
      }
      return updatedBets;
    });
  };

  const handlePlaceBets = () => {
    console.log("Placing bets:", bets);
    // Here you would typically call an API to place the bets
    // After successful placement, clear the bet slip
    setBets([]);
  };

  if (isMatka) {
    // Matka-style interface inspired by reference screenshots
    const matkaTabs = [
      { id: "jodi", label: "Jodi" },
      { id: "single", label: "Single" },
      { id: "pana", label: "Pana" },
      { id: "sp", label: "SP" },
      { id: "dp", label: "DP" },
      { id: "trio", label: "Trio" },
      { id: "cycle", label: "Cycle" },
      { id: "motor-sp", label: "Motor SP" },
      { id: "charts-56", label: "56 Charts" },
      { id: "charts-64", label: "64 Charts" },
      { id: "abr", label: "ABR" },
    ];

    const matkaButtonsRow1 = ["1", "2", "3", "4", "5", "LINE 1", "ODD"];
    const matkaButtonsRow2 = ["6", "7", "8", "9", "0", "LINE 2", "EVEN"];

    // Demo market schedule with countdowns (replace with API later)
    const now = new Date().getTime();
    const marketsHeader = [
      { label: "LORDS CLOSE", addMs: 45 * 60 * 1000 },
      { label: "RIGA OPEN", addMs: 95 * 60 * 1000 },
      { label: "RIGA CLOSE", addMs: 155 * 60 * 1000 },
      { label: "ASIA OPEN", addMs: 225 * 60 * 1000 },
      { label: "ASIA CLOSE", addMs: 275 * 60 * 1000 },
      { label: "TAJ OPEN", addMs: 325 * 60 * 1000 },
      { label: "TAJ CLOSE", addMs: 385 * 60 * 1000 },
    ];

    // Re-render every second to update countdowns
    const [tick, setTick] = useState(0);
    useEffect(() => {
      const i = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(i);
    }, []);

    const getTimeParts = (targetTs: number) => {
      const diff = Math.max(0, Math.floor((targetTs - Date.now()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      return { h, m, s };
    };

    return (
      <MainLayout>
        <div className="w-full max-w-[1400px] mx-auto px-2">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1000px)_380px] gap-4">
          {/* Left content */}
          <div className="space-y-4">
            {/* Top bar + markets scroller */}
            <Card className="p-0 overflow-hidden">
              <div className="bg-[#2f4458] px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/casino")}
                    className="h-8 text-white"
                  >
                    Back
                  </Button>
                  <h2 className="text-white font-bold text-base uppercase tracking-wide">
                    Matka Market
                  </h2>
                  <button className="text-blue-300 underline text-xs">Rules</button>
                </div>
                <div className="text-xs text-blue-200/80 flex items-center gap-3">
                  {typeof timer === "number" && <span>Time: {timer}s</span>}
                  {roundId && <span className="font-mono">Round: {roundId}</span>}
                </div>
              </div>
              {/* Horizontal market pills */}
              <div className="bg-[#2f4458]/90 px-2 py-2 border-t border-[#203444]">
                <div className="flex items-stretch gap-2 overflow-x-auto scrollbar-hide">
                  {marketsHeader.map((m) => {
                    const target = Date.now() + m.addMs;
                    const parts = getTimeParts(target);
                    const dateStr = new Date(target).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                    });
                    const timeStr = new Date(target).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={m.label}
                        className="min-w-[200px] bg-[#203444] text-white rounded-md shadow-sm border border-[#183041] px-3 py-2"
                      >
                        <div className="font-semibold text-sm mb-1">{m.label}</div>
                        <div className="flex items-start justify-between">
                          {/* Left: bullet + stacked h/m/s */}
                          <div className="flex items-start gap-2">
                            <span className="mt-1 inline-block w-2 h-2 bg-blue-400 rounded-sm" />
                            <div className="leading-4">
                              <div className="font-mono text-green-400 text-sm font-bold">
                                {parts.h}h
                              </div>
                              <div className="font-mono text-green-400 text-sm font-bold">
                                {parts.m}m
                              </div>
                              <div className="font-mono text-green-400 text-sm font-bold">
                                {parts.s}s
                              </div>
                            </div>
                          </div>
                          {/* Right: date/time */}
                          <div className="text-[11px] text-blue-200/80 text-right">
                            <div>{dateStr}</div>
                            <div>{timeStr}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Game board (no placeholder image) */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black min-h-[420px]">
                {/* Space for live video/board; intentionally blank to show actual game UI */}
              </div>
            </Card>

            {/* Chips selector */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Set your coin amount</div>
                <Button variant="secondary" size="sm" className="h-8" onClick={() => setSelectedChip(0)}>
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-4">
                {/* Selected amount display */}
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {selectedChip || 0}
                </div>
                <div className="text-gray-500">=</div>
                <div className="flex-1">
                  <BettingChipSelector
                    selectedAmount={selectedChip}
                    onAmountChange={setSelectedChip}
                    amounts={[25, 50, 100, 200, 500, 1000]}
                  />
                </div>
              </div>
            </Card>

            {/* Matka tabs + grid */}
            <Card className="p-0 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
                {/* Left vertical tabs */}
                <div className="border-r bg-[#ecf0f1]">
                  {matkaTabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveMatkaTab(t.id)}
                      className={`w-full text-left px-3 py-2 border-b font-semibold text-sm transition-colors ${
                        activeMatkaTab === t.id
                          ? "bg-white text-[#1f2937] border-l-4 border-blue-500"
                          : "bg-[#ecf0f1] text-[#2c3e50] hover:bg-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {/* Right grid area */}
                <div className="p-3 bg-[#f7f9fa]">
                  {/* Single grid as in reference */}
                  <div className="grid grid-cols-7 gap-2">
                    {matkaButtonsRow1.map((label) => (
                      <button
                        key={label}
                        onClick={() => handleAddBet("Single Digit", label, 9.5)} // Example odds
                        className="bg-[#87cefa] hover:bg-[#7ec8f7] text-[#133b5c] font-extrabold tracking-wide px-3 py-6 rounded-md shadow-sm border border-[#a7d8ff] focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        <div className="text-lg">{label}</div>
                        {label.startsWith("LINE") && (
                          <div className="text-[10px] mt-1 opacity-80">
                            {label === "LINE 1" ? "1|2|3|4|5" : ""}
                          </div>
                        )}
                        {label === "ODD" && (
                          <div className="text-[10px] mt-1 opacity-80">1|3|5|7|9</div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {matkaButtonsRow2.map((label) => (
                      <button
                        key={label}
                        onClick={() => handleAddBet("Single Digit", label, 9.5)} // Example odds
                        className="bg-[#87cefa] hover:bg-[#7ec8f7] text-[#133b5c] font-extrabold tracking-wide px-3 py-6 rounded-md shadow-sm border border-[#a7d8ff] focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        <div className="text-lg">{label}</div>
                        {label.startsWith("LINE") && (
                          <div className="text-[10px] mt-1 opacity-80">
                            {label === "LINE 2" ? "6|7|8|9|0" : ""}
                          </div>
                        )}
                        {label === "EVEN" && (
                          <div className="text-[10px] mt-1 opacity-80">2|4|6|8|0</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Live Markets (from API) */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Live Markets</div>
                <div className="text-xs text-muted-foreground">
                  {markets.length ? `${markets.length} options` : "No markets"}
                </div>
              </div>
              {markets.length ? (
                <BetButtonGrid
                  markets={markets}
                  columns={3}
                  onBet={(market, selection) =>
                    handleAddBet(market.subtype, selection.nat, selection.b)
                  }
                />
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  Waiting for live markets…
                </div>
              )}
            </Card>

            {/* Last Results */}
            <ResultsSection />
          </div>

          {/* Right sidebar */}
          <div className="lg:sticky lg:top-20 h-fit">
            <BetSlipSidebar
              bets={bets}
              onRemoveBet={handleRemoveBet}
              onUpdateStake={handleUpdateStake}
              onPlaceBets={handlePlaceBets}
              variant="dark"
            />
          </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Default unified view for non-Matka games
  return (
      <MainLayout>
      <div className="w-full max-w-[1400px] mx-auto px-2">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1000px)_380px] gap-4">
        {/* Left */}
        <div className="space-y-4">
          {/* Top bar */}
          <Card className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino")}
                className="h-8"
              >
                Back
              </Button>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{game.gname}</div>
                <div className="text-xs text-muted-foreground">
                  {error ? "Disconnected" : isLoading ? "Connecting…" : status}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
              {typeof timer === "number" && <span>Time: {timer}s</span>}
              {roundId && <span className="font-mono">Round: {roundId}</span>}
            </div>
          </Card>

          {/* Game display (lightweight) */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={game.gname}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  Game
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Result</div>
                  <div className="text-sm font-semibold font-mono">
                    {result ?? "—"}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Markets */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Markets</div>
              <div className="text-xs text-muted-foreground">
                {markets.length ? `${markets.length} options` : "No markets"}
              </div>
            </div>

            {markets.length ? (
              <BetButtonGrid
                markets={markets}
                columns={3}
                onBet={(market, selection) =>
                  handleAddBet(market.subtype, selection.nat, selection.b)
                }
              />
            ) : (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Waiting for live markets…
              </div>
            )}
          </Card>
        </div>

        {/* Right */}
        <div className="lg:sticky lg:top-20 h-fit">
          <BetSlipSidebar
            bets={bets}
            onRemoveBet={handleRemoveBet}
            onUpdateStake={handleUpdateStake}
            onPlaceBets={handlePlaceBets}
          />
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
