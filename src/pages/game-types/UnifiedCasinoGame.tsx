import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CasinoGame } from "@/types/casino";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { getImageUrlForGame } from "@/services/casino";
import { BetButtonGrid } from "@/components/casino/BetButton";
import { BetSlipSidebar } from "./components/SharedGameComponents";

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

  const [betAmount, setBetAmount] = useState("");

  const markets = useMemo(() => normalizeMarkets(liveData), [liveData]);
  const imageSrc = useMemo(() => getImageUrlForGame(game)[0] || "", [game]);

  const roundId = (liveData as any)?.roundId ?? "";
  const timer = (liveData as any)?.timer;
  const result = (liveData as any)?.result;

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
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
                onBet={() => {
                  // Keep lightweight: selection wiring can come later
                }}
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
          <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
        </div>
      </div>
    </MainLayout>
  );
}
