/**
 * Live Dealer Layout - For Evolution Gaming, Baccarat, Blackjack
 * Features: Video stream, live dealer, professional table, chat
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Video, MessageCircle, Users, TrendingUp, Settings } from "lucide-react";
import type { CasinoLiveData } from "@/services/casinoRealTimeService";

interface LiveDealerLayoutProps {
  gameInfo: { name: string; category: string; description: string };
  liveData: CasinoLiveData | null;
  results: any;
  streamUrl?: string;
  onPlaceBet: (sid: number, nat: string, odds: number, type: "back" | "lay", stake: number) => Promise<void>;
}

export function LiveDealerLayout({ gameInfo, liveData, results, streamUrl, onPlaceBet }: LiveDealerLayoutProps) {
  const [selectedBet, setSelectedBet] = useState<{ sid: number; nat: string; odds: number; type: "back" | "lay" } | null>(null);
  const [stake, setStake] = useState(100);
  const [placing, setPlacing] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handlePlaceBet = async () => {
    if (!selectedBet) return;
    setPlacing(true);
    try {
      await onPlaceBet(selectedBet.sid, selectedBet.nat, selectedBet.odds, selectedBet.type, stake);
      setSelectedBet(null);
      setStake(100);
    } finally {
      setPlacing(false);
    }
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, chatInput]);
      setChatInput("");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {/* Main Game Area - 3 columns */}
      <div className="xl:col-span-3 space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-800 border-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{gameInfo.name}</h1>
                  <Badge className="bg-red-600 animate-pulse">
                    <Video className="w-4 h-4 mr-1" />
                    LIVE
                  </Badge>
                </div>
                <p className="text-amber-100">{gameInfo.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-amber-200">Table</p>
                <p className="text-2xl font-bold text-white">VIP-{liveData?.mid || "..."}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Video Stream */}
        <Card className="bg-black border-slate-700 overflow-hidden">
          <div className="relative aspect-video">
            {streamUrl ? (
              <iframe
                src={streamUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-24 h-24 mx-auto mb-4 text-slate-600" />
                  <p className="text-2xl font-bold text-white mb-2">Live Stream Loading...</p>
                  <p className="text-slate-400">Professional dealer will appear shortly</p>
                </div>
              </div>
            )}

            {/* Stream Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
              <Card className="bg-black/80 border-slate-700 backdrop-blur pointer-events-auto">
                <div className="p-3 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="text-white font-bold">{Math.floor(Math.random() * 500) + 100}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-600"></div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                    <span className="text-white font-bold">₹{(Math.random() * 1000000).toFixed(0)}</span>
                  </div>
                </div>
              </Card>

              <Button size="icon" variant="outline" className="bg-black/80 border-slate-700 backdrop-blur pointer-events-auto">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* Dealer Info */}
            <div className="absolute bottom-4 left-4">
              <Card className="bg-black/80 border-slate-700 backdrop-blur">
                <div className="p-3">
                  <p className="text-xs text-slate-400">Live Dealer</p>
                  <p className="text-white font-bold">Sarah Williams</p>
                  <Badge className="mt-1 bg-green-600">Online</Badge>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Betting Table */}
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="main">Main Bets</TabsTrigger>
            <TabsTrigger value="side">Side Bets</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {liveData?.t1 && liveData.t1.map((runner, idx) => {
                    const backOdds = runner.b1?.[0];
                    const backPrice = backOdds?.rate || backOdds?.odds || backOdds?.price || 0;

                    return (
                      <Button
                        key={idx}
                        size="lg"
                        className="h-32 text-2xl font-bold bg-blue-600 hover:bg-blue-700 flex flex-col gap-2"
                        disabled={runner.gstatus !== "1"}
                        onClick={() => setSelectedBet({ sid: runner.sid, nat: runner.nat, odds: backPrice, type: "back" })}
                      >
                        <span>{runner.nat}</span>
                        <span className="text-4xl">{backPrice.toFixed(2)}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="side" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3">
                  {["Pair", "Perfect Pair", "Tie", "Big", "Small", "Any Pair", "Lucky 6", "Dragon"].map((bet) => (
                    <Button key={bet} variant="outline" className="h-24 border-slate-600 hover:bg-slate-700">
                      <div className="text-center">
                        <div className="font-bold">{bet}</div>
                        <div className="text-lg text-green-400">{(Math.random() * 10 + 2).toFixed(2)}x</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-4">Win Rate</h4>
                    <div className="space-y-3">
                      {liveData?.t1 && liveData.t1.map((runner, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">{runner.nat}</span>
                            <span className="text-white font-bold">{(Math.random() * 30 + 25).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.random() * 30 + 25}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-4">Last 20 Results</h4>
                    <div className="flex gap-2 flex-wrap">
                      {results?.lastresult?.slice(0, 20).map((result: string, idx: number) => (
                        <Badge key={idx} className="bg-slate-700 text-white">
                          {result}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - 1 column */}
      <div className="xl:col-span-1 space-y-4">
        {/* Bet Slip */}
        <Card className="bg-slate-800 border-slate-700 sticky top-4">
          <div className="p-4">
            <h3 className="text-xl font-bold text-white mb-4">Bet Slip</h3>

            {selectedBet ? (
              <div className="space-y-4">
                <Card className="bg-slate-700 border-slate-600">
                  <div className="p-3">
                    <p className="text-sm text-slate-400">Selection</p>
                    <p className="text-lg font-bold text-white">{selectedBet.nat}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-slate-400">Odds</span>
                      <span className="font-mono font-bold text-yellow-400">{selectedBet.odds.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Stake (₹)</label>
                  <Input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white text-lg"
                    min={100}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        onClick={() => setStake(amount)}
                        className="border-slate-600"
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Card className="bg-green-600/20 border-green-600">
                  <div className="p-3">
                    <p className="text-sm text-green-400">Potential Win</p>
                    <p className="text-3xl font-bold text-green-400">
                      ₹{(stake * (selectedBet.odds - 1)).toFixed(2)}
                    </p>
                  </div>
                </Card>

                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold"
                  onClick={handlePlaceBet}
                  disabled={placing || stake < 100}
                >
                  {placing ? "Placing..." : "Place Bet"}
                </Button>
                <Button variant="outline" className="w-full border-slate-600" onClick={() => setSelectedBet(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Click a bet to start</p>
            )}
          </div>
        </Card>

        {/* Live Chat */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">Live Chat</h3>
            </div>

            <div className="bg-slate-900 rounded-lg p-3 h-48 overflow-y-auto mb-3">
              {chatMessages.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No messages yet</p>
              ) : (
                <div className="space-y-2">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="bg-slate-800 rounded p-2">
                      <p className="text-white text-sm">{msg}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button size="icon" onClick={sendMessage}>
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
