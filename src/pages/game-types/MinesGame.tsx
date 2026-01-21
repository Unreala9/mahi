import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { Bomb, Gem } from "lucide-react";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface MinesGameProps {
  game: CasinoGame;
}

type TileState = "hidden" | "safe" | "mine";

export function MinesGame({ game }: MinesGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const [minesCount, setMinesCount] = useState(3);
  const [tiles, setTiles] = useState<TileState[]>(Array(25).fill("hidden"));
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  const handleTileClick = (index: number) => {
    if (!isPlaying || tiles[index] !== "hidden") return;

    const newTiles = [...tiles];
    // Simulate mine/safe (in real app, this would be from server)
    const isMine = Math.random() < minesCount / 25;
    newTiles[index] = isMine ? "mine" : "safe";
    setTiles(newTiles);

    if (isMine) {
      setIsPlaying(false);
      setCurrentMultiplier(0);
    } else {
      setCurrentMultiplier((prev) => prev * 1.2);
    }
  };

  const startGame = () => {
    setTiles(Array(25).fill("hidden"));
    setCurrentMultiplier(1.0);
    setIsPlaying(true);
  };

  const cashOut = () => {
    setIsPlaying(false);
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e]">
          <GameHeader game={game} liveData={liveData} />

          {/* Mines Grid */}
          <div className="px-4 py-6">
            <div className="max-w-2xl mx-auto">
              {/* Stats Display */}
              <div className="bg-[#16213e]/80 rounded-lg p-4 mb-4 flex justify-between items-center">
                <div>
                  <div className="text-gray-400 text-xs">
                    Current Multiplier
                  </div>
                  <div className="text-green-400 text-2xl font-bold">
                    {currentMultiplier.toFixed(2)}x
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Potential Win</div>
                  <div className="text-yellow-400 text-2xl font-bold">
                    ₹
                    {(parseFloat(betAmount || "0") * currentMultiplier).toFixed(
                      2,
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Mines</div>
                  <div className="text-red-400 text-2xl font-bold">
                    {minesCount}
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {tiles.map((tile, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(idx)}
                    disabled={!isPlaying || tile !== "hidden"}
                    className={`aspect-square rounded-lg flex items-center justify-center text-3xl font-bold transition-all ${
                      tile === "hidden"
                        ? "bg-[#16213e] hover:bg-[#1f2d4d] border-2 border-blue-500/30"
                        : tile === "safe"
                          ? "bg-gradient-to-br from-green-600 to-green-700 border-2 border-green-400"
                          : "bg-gradient-to-br from-red-600 to-red-700 border-2 border-red-400"
                    }`}
                  >
                    {tile === "safe" && <Gem className="w-8 h-8 text-white" />}
                    {tile === "mine" && (
                      <Bomb className="w-8 h-8 text-white animate-bounce" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 py-4">
            <div className="max-w-2xl mx-auto bg-[#16213e] rounded-lg p-4 border border-gray-700">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    Bet Amount
                  </label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="100"
                    disabled={isPlaying}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mines-count"
                    className="text-gray-400 text-xs mb-1 block"
                  >
                    Number of Mines
                  </label>
                  <select
                    id="mines-count"
                    value={minesCount}
                    onChange={(e) => setMinesCount(Number(e.target.value))}
                    disabled={isPlaying}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 5, 7, 10].map((count) => (
                      <option key={count} value={count}>
                        {count} Mines
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {!isPlaying ? (
                  <Button
                    onClick={startGame}
                    className="col-span-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg font-bold"
                  >
                    Start Game
                  </Button>
                ) : (
                  <Button
                    onClick={cashOut}
                    className="col-span-2 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-6 text-lg font-bold"
                  >
                    Cash Out: ₹
                    {(parseFloat(betAmount || "0") * currentMultiplier).toFixed(
                      2,
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
