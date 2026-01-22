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

interface TeenpattiGameProps {
  game: CasinoGame;
}

export function TeenpattiGame({ game }: TeenpattiGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  // Parse cards - typical teenpatti has 2 players (A and B)
  const cards = liveData?.card?.split(",") || [];
  const playerACards = cards.slice(0, 3) || [];
  const playerBCards = cards.slice(3, 6) || [];

  // Get betting markets
  const markets = liveData?.sub || [];
  const mainMarkets = markets.filter(
    (m) =>
      m.nat.includes("Player A") ||
      m.nat.includes("Player B") ||
      m.nat.includes("Tie"),
  );
  const sideMarkets = markets.filter(
    (m) => !mainMarkets.find((main) => main.nat === m.nat),
  );

  // Teenpatti hand rankings
  const handRankings = [
    { name: "Trail", desc: "Three of a kind", icon: "🃏🃏🃏" },
    { name: "Pure Sequence", desc: "Consecutive same suit", icon: "🔥" },
    { name: "Sequence", desc: "Consecutive cards", icon: "📊" },
    { name: "Color", desc: "Same suit", icon: "🎨" },
    { name: "Pair", desc: "Two of a kind", icon: "👥" },
    { name: "High Card", desc: "Highest card wins", icon: "👑" },
  ];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900">
          <GameHeader game={game} liveData={liveData} />

          {/* Game Table */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-2xl p-8 border-4 border-yellow-700/30">
              {/* Players Display */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                {/* Player A */}
                <div className="text-center">
                  <div className="mb-4">
                    <h3 className="text-yellow-400 font-bold text-2xl uppercase tracking-wider drop-shadow-lg mb-2">
                      Player A
                    </h3>
                    <div className="text-yellow-200/70 text-sm">
                      Waiting for cards...
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    {playerACards.length > 0 ? (
                      <CardHand cards={playerACards} />
                    ) : (
                      <>
                        <CardPlaceholder />
                        <CardPlaceholder />
                        <CardPlaceholder />
                      </>
                    )}
                  </div>
                </div>

                {/* VS Divider */}
                <div className="flex items-center justify-center">
                  <div className="text-white text-6xl font-bold tracking-wider drop-shadow-lg">
                    VS
                  </div>
                </div>

                {/* Player B */}
                <div className="text-center">
                  <div className="mb-4">
                    <h3 className="text-yellow-400 font-bold text-2xl uppercase tracking-wider drop-shadow-lg mb-2">
                      Player B
                    </h3>
                    <div className="text-yellow-200/70 text-sm">
                      Waiting for cards...
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    {playerBCards.length > 0 ? (
                      <CardHand cards={playerBCards} />
                    ) : (
                      <>
                        <CardPlaceholder />
                        <CardPlaceholder />
                        <CardPlaceholder />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Hand Rankings Reference */}
              <div className="mt-6 bg-black/20 rounded-xl p-4">
                <h4 className="text-yellow-300 text-sm font-bold mb-3 uppercase">
                  Hand Rankings (Highest to Lowest)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {handRankings.map((rank) => (
                    <div
                      key={rank.name}
                      className="bg-white/10 rounded-lg p-2 text-center"
                    >
                      <div className="text-2xl mb-1">{rank.icon}</div>
                      <div className="text-white text-xs font-bold">
                        {rank.name}
                      </div>
                      <div className="text-yellow-200/60 text-xs">
                        {rank.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Betting Markets */}
          {mainMarkets.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">
                Main Markets
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {mainMarkets.map((market) => (
                  <BetButton
                    key={market.sid}
                    market={market}
                    variant={
                      market.nat.includes("Player A")
                        ? "primary"
                        : market.nat.includes("Player B")
                          ? "danger"
                          : "warning"
                    }
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
