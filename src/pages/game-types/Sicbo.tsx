import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const BETTING_ZONES = [
  { id: "small", name: "Small (4-10)", odds: 1.95, section: "size" },
  { id: "big", name: "Big (11-17)", odds: 1.95, section: "size" },
  { id: "total4", name: "Total 4", odds: 60.0, section: "totals" },
  { id: "total5", name: "Total 5", odds: 30.0, section: "totals" },
  { id: "total6", name: "Total 6", odds: 18.0, section: "totals" },
  { id: "total7", name: "Total 7", odds: 12.0, section: "totals" },
  { id: "total8", name: "Total 8", odds: 8.0, section: "totals" },
  { id: "total9", name: "Total 9", odds: 6.0, section: "totals" },
  { id: "total10", name: "Total 10", odds: 6.0, section: "totals" },
  { id: "total11", name: "Total 11", odds: 6.0, section: "totals" },
  { id: "total12", name: "Total 12", odds: 6.0, section: "totals" },
  { id: "triple", name: "Any Triple", odds: 30.0, section: "special" },
];

const HISTORY = Array.from({ length: 10 }, () => [
  Math.floor(Math.random() * 6) + 1,
  Math.floor(Math.random() * 6) + 1,
  Math.floor(Math.random() * 6) + 1,
]);

export default function Sicbo() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [dice, setDice] = useState([1, 1, 1]);
  const [bets, setBets] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRolling(true);
          setTimeout(() => {
            const newDice = [
              Math.floor(Math.random() * 6) + 1,
              Math.floor(Math.random() * 6) + 1,
              Math.floor(Math.random() * 6) + 1,
            ];
            setDice(newDice);
            setTimeout(() => setIsRolling(false), 2000);
          }, 2000);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = (zoneId: string) => {
    setBets((prev) => ({
      ...prev,
      [zoneId]: (prev[zoneId] || 0) + selectedChip,
    }));
  };

  const clearBets = () => setBets({});

  const handlePlaceBets = async () => {
    const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      Object.entries(bets).forEach(([zoneId, stake]) => {
        if (stake > 0) {
          const zone = BETTING_ZONES.find((z) => z.id === zoneId);
          if (zone) {
            betPromises.push(
              bettingService.placeBet({
                gameType: "CASINO",
                gameId: "sicbo",
                gameName: "Sicbo",
                marketId: zoneId,
                marketName: zone.name,
                selection: zone.name,
                odds: zone.odds,
                stake,
                betType: "BACK",
              }),
            );
          }
        }
      });

      await Promise.all(betPromises);
      clearBets();
    } catch (error) {
      console.error("Failed to place bets:", error);
    }
  };

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
  const potentialWin = Object.entries(bets).reduce((sum, [zoneId, stake]) => {
    const zone = BETTING_ZONES.find((z) => z.id === zoneId);
    return sum + (zone ? stake * zone.odds : 0);
  }, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-amber-700 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-amber-500 mb-1">
                  <Dices className="inline w-6 h-6 mr-2" />
                  Sic Bo
                </h1>
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-400 font-bold">{countdown}s</span>
                </div>
              </div>
              <Badge className="bg-red-600 animate-pulse">Live</Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Betting Area */}
            <div className="lg:col-span-3">
              {/* Dice Display */}
              <Card className="bg-gradient-to-br from-amber-900/50 to-slate-900/50 border-amber-700 p-8 mb-6">
                <div className="text-center">
                  <h2 className="text-amber-400 font-bold text-xl mb-4">
                    Dice Roll
                  </h2>
                  <div className="flex items-center justify-center gap-6">
                    {dice.map((die, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-24 h-24 bg-white rounded-xl flex items-center justify-center text-5xl font-bold text-slate-900 shadow-2xl",
                          isRolling && "animate-bounce",
                        )}
                      >
                        {die}
                      </div>
                    ))}
                  </div>
                  {!isRolling && (
                    <div className="mt-4">
                      <Badge className="bg-amber-600 text-lg px-4 py-1">
                        Total: {dice.reduce((a, b) => a + b, 0)}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Betting Grid */}
              <div className="space-y-4">
                {/* Size Bets */}
                <Card className="bg-slate-800/50 border-amber-700/30 p-4">
                  <h3 className="text-amber-400 font-bold mb-3">Size Bets</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {BETTING_ZONES.filter((z) => z.section === "size").map(
                      (zone) => (
                        <Card
                          key={zone.id}
                          className={cn(
                            "cursor-pointer transition-all p-4 border-2",
                            bets[zone.id] > 0
                              ? "border-amber-400 bg-amber-900/50 scale-105"
                              : "border-slate-600 bg-slate-900 hover:border-amber-500",
                          )}
                          onClick={() => placeBet(zone.id)}
                        >
                          <div className="text-center">
                            <p className="text-white font-bold mb-1">
                              {zone.name}
                            </p>
                            <Badge className="bg-amber-600 mb-2">
                              {zone.odds}x
                            </Badge>
                            {bets[zone.id] > 0 && (
                              <Badge className="bg-yellow-500 text-black w-full">
                                ₹{bets[zone.id]}
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ),
                    )}
                  </div>
                </Card>

                {/* Total Bets */}
                <Card className="bg-slate-800/50 border-amber-700/30 p-4">
                  <h3 className="text-amber-400 font-bold mb-3">
                    Total Bets (4-17)
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {BETTING_ZONES.filter((z) => z.section === "totals").map(
                      (zone) => (
                        <Card
                          key={zone.id}
                          className={cn(
                            "cursor-pointer transition-all p-3 border-2",
                            bets[zone.id] > 0
                              ? "border-amber-400 bg-amber-900/50"
                              : "border-slate-600 bg-slate-900 hover:border-amber-500",
                          )}
                          onClick={() => placeBet(zone.id)}
                        >
                          <div className="text-center">
                            <p className="text-white font-bold text-sm mb-1">
                              {zone.name.split(" ")[1]}
                            </p>
                            <Badge className="bg-amber-600 text-xs">
                              {zone.odds}x
                            </Badge>
                            {bets[zone.id] > 0 && (
                              <p className="text-yellow-400 text-xs mt-1">
                                ₹{bets[zone.id]}
                              </p>
                            )}
                          </div>
                        </Card>
                      ),
                    )}
                  </div>
                </Card>

                {/* Special Bets */}
                <Card className="bg-slate-800/50 border-amber-700/30 p-4">
                  <h3 className="text-amber-400 font-bold mb-3">
                    Special Bets
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {BETTING_ZONES.filter((z) => z.section === "special").map(
                      (zone) => (
                        <Card
                          key={zone.id}
                          className={cn(
                            "cursor-pointer transition-all p-4 border-2",
                            bets[zone.id] > 0
                              ? "border-amber-400 bg-amber-900/50"
                              : "border-slate-600 bg-slate-900 hover:border-amber-500",
                          )}
                          onClick={() => placeBet(zone.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-bold">
                                {zone.name}
                              </p>
                              <Badge className="bg-amber-600">
                                {zone.odds}x
                              </Badge>
                            </div>
                            {bets[zone.id] > 0 && (
                              <Badge className="bg-yellow-500 text-black">
                                ₹{bets[zone.id]}
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ),
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Controls */}
              <Card className="bg-slate-800/50 border-amber-700/30 p-4">
                <h3 className="text-amber-400 font-bold mb-3">Bet Controls</h3>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      amount={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20 text-sm"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-500 hover:bg-blue-600/20 text-sm"
                  >
                    Repeat
                  </Button>
                </div>

                <Button
                  onClick={handlePlaceBets}
                  className="w-full bg-amber-600 hover:bg-amber-700 font-bold mb-4"
                >
                  Place Bets
                </Button>

                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total Stake:</span>
                    <span className="text-white font-bold">₹{totalStake}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">
                      Potential Win:
                    </span>
                    <span className="text-amber-400 font-bold">
                      ₹{potentialWin.toFixed(0)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* History */}
              <Card className="bg-slate-800/50 border-amber-700/30 p-4">
                <h3 className="text-amber-400 font-bold mb-3">
                  Recent Results
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((roll, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/50 rounded p-2 flex items-center justify-between"
                    >
                      <div className="flex gap-2">
                        {roll.map((die, dieIdx) => (
                          <div
                            key={dieIdx}
                            className="w-8 h-8 bg-white rounded flex items-center justify-center text-sm font-bold text-slate-900"
                          >
                            {die}
                          </div>
                        ))}
                      </div>
                      <Badge className="bg-amber-600 text-xs">
                        {roll.reduce((a, b) => a + b, 0)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
