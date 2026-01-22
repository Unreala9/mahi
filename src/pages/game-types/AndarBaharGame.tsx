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

interface AndarBaharGameProps {
  game: CasinoGame;
}

export function AndarBaharGame({ game }: AndarBaharGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  // Parse cards from API
  const cards = liveData?.card?.split(",") || [];
  const jokerCard = cards[0]; // First card is the joker
  const andarCards = cards.filter((_, idx) => idx > 0 && idx % 2 === 1);
  const baharCards = cards.filter((_, idx) => idx > 0 && idx % 2 === 0);

  // Get betting markets
  const markets = liveData?.sub || [];
  const mainMarkets = markets.filter(
    (m) => m.nat === "Andar" || m.nat === "Bahar",
  );
  const sideMarkets = markets.filter(
    (m) => !mainMarkets.find((main) => main.nat === m.nat),
  );

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900">
          <GameHeader game={game} liveData={liveData} />

          {/* Game Table */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-2xl p-8 border-4 border-yellow-700/30">
              {/* Joker Card (Center) */}
              <div className="text-center mb-8">
                <h3 className="text-yellow-400 font-bold text-2xl uppercase tracking-wider drop-shadow-lg mb-4">
                  🃏 Joker Card
                </h3>
                <div className="flex justify-center">
                  {jokerCard ? (
                    <PlayingCard card={jokerCard} className="w-24 h-36" />
                  ) : (
                    <CardPlaceholder className="w-24 h-36" />
                  )}
                </div>
              </div>

              {/* Andar and Bahar Sides */}
              <div className="grid grid-cols-2 gap-8">
                {/* Andar Side (Inside) */}
                <div>
                  <div className="mb-4 text-center">
                    <h3 className="text-blue-400 font-bold text-xl uppercase tracking-wide drop-shadow-lg">
                      🏠 Andar (Inside)
                    </h3>
                    <div className="text-blue-200/70 text-sm">
                      Cards: {andarCards.length}
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 min-h-[200px] border-2 border-blue-500/30">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {andarCards.length > 0 ? (
                        andarCards.map((card, idx) => (
                          <PlayingCard
                            key={idx}
                            card={card}
                            className="w-12 h-18"
                          />
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm text-center w-full py-8">
                          No cards dealt yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bahar Side (Outside) */}
                <div>
                  <div className="mb-4 text-center">
                    <h3 className="text-red-400 font-bold text-xl uppercase tracking-wide drop-shadow-lg">
                      🌍 Bahar (Outside)
                    </h3>
                    <div className="text-red-200/70 text-sm">
                      Cards: {baharCards.length}
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 min-h-[200px] border-2 border-red-500/30">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {baharCards.length > 0 ? (
                        baharCards.map((card, idx) => (
                          <PlayingCard
                            key={idx}
                            card={card}
                            className="w-12 h-18"
                          />
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm text-center w-full py-8">
                          No cards dealt yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="mt-6 bg-yellow-900/20 rounded-xl p-4 border border-yellow-700/30">
                <p className="text-yellow-200 text-sm text-center">
                  Cards are dealt alternately to Andar and Bahar. The first card
                  that matches the Joker's rank wins!
                </p>
              </div>
            </div>
          </div>

          {/* Main Betting Markets */}
          {mainMarkets.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">
                Place Your Bet
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {mainMarkets.map((market) => (
                  <BetButton
                    key={market.sid}
                    market={market}
                    variant={market.nat === "Andar" ? "primary" : "danger"}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
