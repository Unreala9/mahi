import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";
import { CardHand, CardPlaceholder } from "@/components/casino/PlayingCard";
import { BetButton } from "@/components/casino/BetButton";

interface MogamboGameProps {
  game: CasinoGame;
}

export function MogamboGame({ game }: MogamboGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  // Parse cards from API
  const cards = liveData?.card?.split(",") || [];
  const dagaTejaCards = cards.slice(0, 2) || [];
  const mogamboCard = cards[2];

  // Get betting markets
  const markets = liveData?.sub || [];
  const mainMarkets = markets.filter(
    (m) => m.nat === "Daga / Teja" || m.nat === "Mogambo",
  );
  const sideMarkets = markets.filter(
    (m) => m.nat !== "Daga / Teja" && m.nat !== "Mogambo",
  );

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900">
          <GameHeader game={game} liveData={liveData} />

          {/* Total Display */}
          <div className="px-6 py-3">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-4 py-2 inline-block text-base rounded-lg shadow-lg">
              TOTAL: {liveData?.total || "0"}
            </div>
          </div>

          {/* Game Table */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-2xl p-8 border-4 border-yellow-700/30">
              {/* Card Display Area */}
              <div className="space-y-6">
                {/* DAGA / TEJA */}
                <div>
                  <h3 className="text-yellow-400 font-bold mb-4 text-lg uppercase tracking-wide drop-shadow-lg">
                    DAGA / TEJA
                  </h3>
                  <div className="flex gap-4 justify-center">
                    {dagaTejaCards.length > 0 ? (
                      <CardHand cards={dagaTejaCards} />
                    ) : (
                      <>
                        <CardPlaceholder />
                        <CardPlaceholder />
                      </>
                    )}
                  </div>
                </div>

                {/* MOGAMBO */}
                <div>
                  <h3 className="text-yellow-400 font-bold mb-4 text-lg uppercase tracking-wide drop-shadow-lg">
                    MOGAMBO
                  </h3>
                  <div className="flex justify-center">
                    {mogamboCard ? (
                      <CardHand cards={[mogamboCard]} />
                    ) : (
                      <CardPlaceholder />
                    )}
                  </div>
                </div>
              </div>

              {/* Game visualization */}
              <div className="mt-8 bg-black/30 border-2 border-yellow-700/20 rounded-xl h-[300px] relative flex items-end justify-end p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center border-4 border-white/20 shadow-xl">
                    <span className="text-white text-5xl font-bold drop-shadow-lg">
                      1
                    </span>
                  </div>
                  <div className="w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center border-4 border-white/20 shadow-xl">
                    <span className="text-white text-5xl font-bold drop-shadow-lg">
                      2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Betting Options */}
          {mainMarkets.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">
                Main Markets
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {mainMarkets.map((market) => (
                  <BetButton
                    key={market.sid}
                    market={market}
                    variant="primary"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Side Bets */}
          {sideMarkets.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">
                Side Bets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sideMarkets.map((market) => (
                  <BetButton
                    key={market.sid}
                    market={market}
                    variant="secondary"
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
