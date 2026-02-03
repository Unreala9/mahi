import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BetSettlementService, {
  SettlementMode,
  SettlementResult,
} from "@/services/betSettlementService";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Market {
  id: string;
  type: string;
  status: string;
  event_id: string;
  events: {
    id: string;
    name: string;
    sport: string;
    status: string;
  };
}

export default function AdminBetSettlement() {
  const [pendingMarkets, setPendingMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>("");
  const [resultCode, setResultCode] = useState<string>("");
  const [settlementMode, setSettlementMode] =
    useState<SettlementMode>("normal");
  const [loading, setLoading] = useState(false);
  const [fetchingMarkets, setFetchingMarkets] = useState(false);
  const [settlementHistory, setSettlementHistory] = useState<
    SettlementResult[]
  >([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingMarkets();
  }, []);

  const fetchPendingMarkets = async () => {
    setFetchingMarkets(true);
    try {
      const markets = await BetSettlementService.getPendingMarkets();
      setPendingMarkets(markets || []);
      toast({
        title: "Markets Loaded",
        description: `Found ${markets?.length || 0} pending markets`,
      });
    } catch (error) {
      console.error("Error fetching markets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending markets",
        variant: "destructive",
      });
    } finally {
      setFetchingMarkets(false);
    }
  };

  const handleSettlement = async () => {
    if (!selectedMarket || !resultCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a market and enter result code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await BetSettlementService.settleMarket(
        selectedMarket,
        resultCode.trim(),
        settlementMode,
      );

      if (result.success) {
        setSettlementHistory((prev) => [result, ...prev]);

        toast({
          title: "Settlement Successful",
          description: `Settled ${result.total_bets} bets with total payout: ₹${result.total_payout}`,
        });

        // Reset form
        setSelectedMarket("");
        setResultCode("");
        setSettlementMode("normal");

        // Refresh markets
        fetchPendingMarkets();
      }
    } catch (error) {
      console.error("Settlement error:", error);
      toast({
        title: "Settlement Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickSettle = async (
    marketId: string,
    resultCode: string,
    mode: SettlementMode = "normal",
  ) => {
    try {
      const result = await BetSettlementService.settleMarket(
        marketId,
        resultCode,
        mode,
      );

      if (result.success) {
        setSettlementHistory((prev) => [result, ...prev]);
        toast({
          title: "Quick Settlement Complete",
          description: `${result.total_bets} bets settled`,
        });
        fetchPendingMarkets();
      }
    } catch (error) {
      toast({
        title: "Quick Settlement Failed",
        description:
          error instanceof Error ? error.message : "Settlement failed",
        variant: "destructive",
      });
    }
  };

  const getSettlementModeColor = (mode: string) => {
    switch (mode) {
      case "normal":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "void":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "half_win":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "half_lost":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bet Settlement</h1>
          <p className="text-gray-400">
            Settle markets and manage bet outcomes
          </p>
        </div>
        <Button
          onClick={fetchPendingMarkets}
          disabled={fetchingMarkets}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${fetchingMarkets ? "animate-spin" : ""}`}
          />
          Refresh Markets
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Form */}
        <Card className="bg-[#131824] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Manual Settlement</CardTitle>
            <CardDescription>
              Settle individual markets with custom result codes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Market
              </label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger className="bg-[#0A0E1A] border-white/10 text-white">
                  <SelectValue placeholder="Select a market to settle" />
                </SelectTrigger>
                <SelectContent className="bg-[#131824] border-white/10">
                  {pendingMarkets.map((market) => (
                    <SelectItem
                      key={market.id}
                      value={market.id}
                      className="text-white"
                    >
                      {market.events.name} - {market.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Result Code
              </label>
              <Input
                value={resultCode}
                onChange={(e) => setResultCode(e.target.value)}
                placeholder="Enter winning selection code (e.g., HOME, AWAY, OVER)"
                className="bg-[#0A0E1A] border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Settlement Mode
              </label>
              <Select
                value={settlementMode}
                onValueChange={(value: SettlementMode) =>
                  setSettlementMode(value)
                }
              >
                <SelectTrigger className="bg-[#0A0E1A] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#131824] border-white/10">
                  <SelectItem value="normal" className="text-white">
                    Normal (Win/Loss)
                  </SelectItem>
                  <SelectItem value="void" className="text-white">
                    Void (Refund All)
                  </SelectItem>
                  <SelectItem value="half_win" className="text-white">
                    Half Win
                  </SelectItem>
                  <SelectItem value="half_lost" className="text-white">
                    Half Lost
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSettlement}
              disabled={loading || !selectedMarket || !resultCode.trim()}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Settling...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Settle Market
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Pending Markets */}
        <Card className="bg-[#131824] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Pending Markets</CardTitle>
            <CardDescription>Markets ready for settlement</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingMarkets ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : pendingMarkets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                No pending markets found
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMarkets.slice(0, 5).map((market) => (
                  <div
                    key={market.id}
                    className="p-3 bg-[#0A0E1A] rounded-lg border border-white/5"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">
                          {market.events.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {market.type} • {market.events.sport}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                        {market.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => quickSettle(market.id, "HOME", "normal")}
                        className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                      >
                        HOME Win
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => quickSettle(market.id, "AWAY", "normal")}
                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                      >
                        AWAY Win
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => quickSettle(market.id, "", "void")}
                        className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20"
                      >
                        Void
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settlement History */}
      {settlementHistory.length > 0 && (
        <Card className="bg-[#131824] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Recent Settlements</CardTitle>
            <CardDescription>
              Settlement history for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settlementHistory.map((result, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#0A0E1A] rounded-lg border border-white/5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-medium">
                        Market: {result.market_id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-400">{result.message}</p>
                    </div>
                    <Badge
                      className={getSettlementModeColor(result.settlement_mode)}
                    >
                      {result.settlement_mode}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400">Total Bets</p>
                      <p className="text-white font-bold">
                        {result.total_bets}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Won/Lost</p>
                      <div className="flex justify-center gap-2">
                        <span className="text-green-400 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {result.total_won}
                        </span>
                        <span className="text-red-400 flex items-center">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          {result.total_lost}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Void/Half</p>
                      <p className="text-yellow-400">
                        {result.total_void +
                          result.total_half_won +
                          result.total_half_lost}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Total Payout</p>
                      <p className="text-white font-bold">
                        ₹{result.total_payout.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
