/**
 * Slot Machine Layout - For Foxy 20, Bonus Bonanza, Book of Futurian, Wilds & Gods
 * Features: Spinning reels, paylines, auto-spin, win animations
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Play, RotateCcw, Volume2, VolumeX, Zap, Star } from "lucide-react";
import type { CasinoLiveData } from "@/services/casinoRealTimeService";

interface SlotGameLayoutProps {
  gameInfo: { name: string; category: string; description: string };
  liveData: CasinoLiveData | null;
  results: any;
  onPlaceBet: (sid: number, nat: string, odds: number, type: "back" | "lay", stake: number) => Promise<void>;
}

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣", "🔔"];

export function SlotGameLayout({ gameInfo, liveData, results, onPlaceBet }: SlotGameLayoutProps) {
  const [betAmount, setBetAmount] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [reels, setReels] = useState([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[1], SYMBOLS[2], SYMBOLS[3]],
    [SYMBOLS[2], SYMBOLS[3], SYMBOLS[4]],
    [SYMBOLS[3], SYMBOLS[4], SYMBOLS[5]],
    [SYMBOLS[4], SYMBOLS[5], SYMBOLS[6]],
  ]);

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);

    // Simulate spinning animation
    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      setReels((prev) =>
        prev.map((reel) => [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ])
      );
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      setSpinning(false);
    }, spinDuration);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {/* Main Game Area - 3 columns */}
      <div className="xl:col-span-3 space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 border-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{gameInfo.name}</h1>
                <p className="text-pink-200">{gameInfo.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setSoundOn(!soundOn)}
                  className="border-white text-white"
                >
                  {soundOn ? <Volume2 /> : <VolumeX />}
                </Button>
                <Badge className="bg-yellow-500 text-black text-lg px-4 py-2 h-auto">
                  <Star className="w-5 h-5 mr-2" />
                  RTP: 96.5%
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Slot Machine */}
        <Card className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-yellow-500 border-4 shadow-2xl">
          <div className="p-8">
            {/* Top Display */}
            <div className="bg-black rounded-lg p-4 mb-6 border-2 border-yellow-600">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-xs text-yellow-500 mb-1">BALANCE</p>
                  <p className="text-2xl font-bold text-white">₹10,000</p>
                </div>
                <div className="text-center flex-1 border-x-2 border-yellow-600/30">
                  <p className="text-xs text-yellow-500 mb-1">BET</p>
                  <p className="text-2xl font-bold text-yellow-400">₹{betAmount}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-yellow-500 mb-1">WIN</p>
                  <p className="text-2xl font-bold text-green-400">₹0</p>
                </div>
              </div>
            </div>

            {/* Reels */}
            <div className="relative">
              {/* Payline indicators */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400/50"></div>
              </div>

              <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 border-4 border-yellow-600/50">
                <div className="grid grid-cols-5 gap-4">
                  {reels.map((reel, reelIdx) => (
                    <div key={reelIdx} className="space-y-2">
                      {reel.map((symbol, symbolIdx) => (
                        <div
                          key={symbolIdx}
                          className={cn(
                            "aspect-square bg-white rounded-lg flex items-center justify-center text-6xl shadow-xl transition-all",
                            spinning && "animate-spin-fast"
                          )}
                        >
                          {symbol}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Win overlay */}
              {!spinning && false && (
                <div className="absolute inset-0 bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-yellow-400 drop-shadow-lg animate-bounce">
                      BIG WIN!
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">₹5,000</p>
                  </div>
                </div>
              )}
            </div>

            {/* Paytable Preview */}
            <div className="mt-6 bg-black/50 rounded-lg p-4">
              <div className="grid grid-cols-4 gap-4">
                {["🍒🍒🍒", "⭐⭐⭐", "💎💎💎", "7️⃣7️⃣7️⃣"].map((combo, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl mb-1">{combo}</div>
                    <Badge className="bg-yellow-600">
                      {[5, 10, 50, 100][idx]}x
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Game Info */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <div className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-sm text-purple-100">Total Spins</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-pink-600 to-pink-700 border-0">
            <div className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-sm text-pink-100">Total Wins</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <div className="p-4 text-center">
              <RotateCcw className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-sm text-red-100">Max Win</p>
              <p className="text-3xl font-bold text-white">₹0</p>
            </div>
          </Card>
        </div>

        {/* Paytable */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h3 className="font-bold text-white mb-4 text-xl">Paytable</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { combo: "💎💎💎💎💎", payout: "1000x", name: "5 Diamonds" },
                { combo: "7️⃣7️⃣7️⃣7️⃣7️⃣", payout: "500x", name: "5 Sevens" },
                { combo: "⭐⭐⭐⭐⭐", payout: "100x", name: "5 Stars" },
                { combo: "🔔🔔🔔🔔🔔", payout: "50x", name: "5 Bells" },
                { combo: "🍇🍇🍇🍇🍇", payout: "25x", name: "5 Grapes" },
                { combo: "🍊🍊🍊🍊🍊", payout: "15x", name: "5 Oranges" },
                { combo: "🍋🍋🍋🍋🍋", payout: "10x", name: "5 Lemons" },
                { combo: "🍒🍒🍒🍒🍒", payout: "5x", name: "5 Cherries" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-700 rounded-lg p-3">
                  <div className="text-3xl">{item.combo}</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{item.name}</p>
                    <Badge className="bg-yellow-600 mt-1">{item.payout}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Control Sidebar - 1 column */}
      <div className="xl:col-span-1">
        <Card className="bg-slate-800 border-slate-700 sticky top-4">
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white">Game Controls</h3>

            {/* Bet Amount */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Bet Per Line (₹)</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                className="bg-slate-700 border-slate-600 text-white text-lg h-12"
                min={10}
                disabled={spinning}
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[10, 50, 100, 500].map((amount) => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    onClick={() => setBetAmount(amount)}
                    className="border-slate-600"
                    disabled={spinning}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Paylines */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Active Paylines</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 5, 10, 20, 25].map((lines) => (
                  <Button
                    key={lines}
                    size="sm"
                    variant="outline"
                    className="border-slate-600"
                    disabled={spinning}
                  >
                    {lines}
                  </Button>
                ))}
              </div>
            </div>

            {/* Total Bet */}
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-600">
              <div className="p-4">
                <p className="text-sm text-yellow-400 mb-1">Total Bet</p>
                <p className="text-4xl font-bold text-yellow-400">
                  ₹{(betAmount * 20).toFixed(0)}
                </p>
                <p className="text-xs text-yellow-300 mt-1">
                  {betAmount} × 20 lines
                </p>
              </div>
            </Card>

            {/* Spin Button */}
            <Button
              size="lg"
              className={cn(
                "w-full font-bold text-2xl h-20 relative overflow-hidden",
                spinning
                  ? "bg-slate-600"
                  : "bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700"
              )}
              onClick={handleSpin}
              disabled={spinning || betAmount < 10}
            >
              {spinning ? (
                <>
                  <RotateCcw className="w-8 h-8 mr-3 animate-spin" />
                  SPINNING...
                </>
              ) : (
                <>
                  <Play className="w-8 h-8 mr-3" />
                  SPIN
                </>
              )}
            </Button>

            {/* Auto Play */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-14 border-slate-600"
                onClick={() => setAutoPlay(!autoPlay)}
                disabled={spinning}
              >
                <Zap className="w-5 h-5 mr-2" />
                {autoPlay ? "Stop Auto" : "Auto Play"}
              </Button>

              {autoPlay && (
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Auto Spins</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 25, 50].map((spins) => (
                      <Button
                        key={spins}
                        size="sm"
                        variant="outline"
                        className="border-slate-600"
                      >
                        {spins}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Max Bet Button */}
            <Button
              variant="outline"
              className="w-full h-14 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black"
              onClick={() => setBetAmount(500)}
              disabled={spinning}
            >
              <Star className="w-5 h-5 mr-2" />
              MAX BET
            </Button>

            {/* Game Info */}
            <div className="pt-4 border-t border-slate-700 text-sm text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>RTP:</span>
                <span className="text-white">96.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Volatility:</span>
                <Badge className="bg-yellow-600">Medium</Badge>
              </div>
              <div className="flex justify-between">
                <span>Max Win:</span>
                <span className="text-green-400 font-bold">1000x</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
