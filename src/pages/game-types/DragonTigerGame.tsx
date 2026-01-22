import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";
import { PlayingCard, CardPlaceholder } from "@/components/casino/PlayingCard";
import { BetButton } from "@/components/casino/BetButton";

interface DragonTigerGameProps {
  game: CasinoGame;
}

export function DragonTigerGame({ game }: DragonTigerGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  // Parse cards from API data
  const cards = liveData?.card?.split(",") || [];
  const dragonCard = cards[0];
  const tigerCard = cards[1];

  // Get betting markets from API
  const markets = liveData?.sub || [];

  // Categorize markets
  const mainMarkets = markets.filter(
    (m) =>
      m.nat === "Dragon" ||
      m.nat === "Tiger" ||
      m.nat === "Tie" ||
      m.nat === "Pair",
  );

  const dragonSideMarkets = markets.filter(
    (m) =>
      m.nat.includes("Dragon") &&
      !mainMarkets.find((main) => main.nat === m.nat),
  );

  const tigerSideMarkets = markets.filter(
    (m) =>
      m.nat.includes("Tiger") &&
      !mainMarkets.find((main) => main.nat === m.nat),
  );

  // Map market colors
  const getMarketVariant = (nat: string) => {
    if (nat.includes("Dragon")) return "primary";
    if (nat.includes("Tiger")) return "danger";
    if (nat.includes("Tie")) return "warning";
    return "secondary";
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900">
          <GameHeader game={game} liveData={liveData} />

          {/* Game Table - Card Display */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-2xl p-8 border-4 border-yellow-700/30">
              {/* Cards Display */}
              <div className="flex justify-around items-center mb-8">
                <div className="text-center">
                  <h3 className="text-yellow-400 font-bold mb-4 text-2xl uppercase tracking-wider drop-shadow-lg">
                    🐉 Dragon
                  </h3>
                  {dragonCard ? (
                    <PlayingCard card={dragonCard} className="w-24 h-36" />
                  ) : (
                    <CardPlaceholder className="w-24 h-36" />
                  )}
                </div>

                <div className="text-white text-6xl font-bold tracking-wider drop-shadow-lg">
                  VS
                </div>

                <div className="text-center">
                  <h3 className="text-yellow-400 font-bold mb-4 text-2xl uppercase tracking-wider drop-shadow-lg">
                    🐯 Tiger
                  </h3>
                  {tigerCard ? (
                    <PlayingCard card={tigerCard} className="w-24 h-36" />
                  ) : (
                    <CardPlaceholder className="w-24 h-36" />
                  )}
                </div>
              </div>

              {/* Round Info */}
              <div className="text-center text-yellow-200/80 text-sm">
                Round:{" "}
                <span className="font-mono font-bold">
                  {liveData?.roundId || "Waiting..."}
                </span>
              </div>
            </div>
          </div>

          {/* Main Betting Markets */}
          {mainMarkets.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">
                Main Markets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mainMarkets.map((market) => (
                  <BetButton
                    key={market.sid}
                    market={market}
                    variant={getMarketVariant(market.nat) as any}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Dragon Side Bets */}
          {dragonSideMarkets.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                <span className="text-blue-400">🐉</span> Dragon Side Bets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {dragonSideMarkets.map((market) => (
                  <BetButton
                    key={market.sid}
                    market={market}
                    variant="primary"
                    className="py-4"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tiger Side Bets */}
          {tigerSideMarkets.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                <span className="text-red-400">🐯</span> Tiger Side Bets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {tigerSideMarkets.map((market) => (
                  <BetButton
                    key={market.sid}
                    market={market}
                    variant="danger"
                    className="py-4"
                  />
                ))}
              </div>
            </div>
          )}

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
