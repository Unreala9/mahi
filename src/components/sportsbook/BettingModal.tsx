import { useEffect, useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import type { MatchEvent, OddsData } from "@/services/diamondApi";
import { useBettingLogic } from "@/services/bettingLogicService";
import { supabase } from "@/integrations/supabase/client";

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchEvent;
  oddsData: OddsData | null;
  initialSelection?: {
    selection: string;
    betType: "back" | "lay";
    odds: number;
  };
}

export function BettingModal({
  isOpen,
  onClose,
  match,
  oddsData,
  initialSelection,
}: BettingModalProps) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"cashout" | "placebet">("placebet");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const {
      betSlip,
      placedBets,
      // balance,
      // exposure,
      isPlacingBet,
      // totalStake,
      // totalPotentialProfit,
      addToBetSlip,
      // removeFromBetSlip,
      updateStake,
      clearBetSlip,
      placeBets,
      fetchMyBets,
  } = useBettingLogic(user?.id || "");

  // Current bet is the first item in the slip (Modal mode = single bet)
  const currentBet = betSlip.length > 0 ? betSlip[0] : null;

  const handleOddsClick = (
    selection: string,
    betType: "back" | "lay",
    odds: number
  ) => {
    // In modal mode, we only allow one bet at a time
    clearBetSlip();
    
    // Add new bet
    // We don't have all IDs here, but we map what we have
    addToBetSlip(
      match.gmid,
      match.name,
      betType === "back" || betType === "lay" ? "MATCH_ODDS" : "OTHER", // Default market mapping
      "Match Odds", // Default market name
      "MATCH_ODDS", // Default market type
      selection,
      odds,
      betType.toUpperCase() as any,
      undefined
    );
  };

  // Set initial selection when modal opens
  useEffect(() => {
    if (isOpen && initialSelection) {
      clearBetSlip();
      handleOddsClick(
        initialSelection.selection,
        initialSelection.betType,
        initialSelection.odds
      );
    }
  }, [isOpen, initialSelection, match.gmid, match.name]);

  // Refresh bets when user is set
  useEffect(() => {
      if(user?.id) {
          fetchMyBets();
      }
  }, [user?.id, fetchMyBets]);


  if (!isOpen) return null;

  const matchOdds =
    oddsData?.match_odds && oddsData.match_odds.length > 0
      ? oddsData.match_odds
      : oddsData?.bookmaker || [];

  const tiedMatchOdds = oddsData?.tied_match || [];

  const handleSubmit = () => {
    placeBets();
  };

  const handleUpdateStake = (stake: number) => {
      if (betSlip.length > 0) {
          updateStake(0, stake);
      }
  };

  const handleIncrementStake = (amount: number) => {
      if (betSlip.length > 0) {
          updateStake(0, betSlip[0].stake + amount);
      }
  };
  
  const handleUpdateOdds = (newOdds: number) => {
     // NOTE: useBettingLogic currently doesn't support updating odds after addition in the public interface easily
     // without re-adding. For now, we'll assume odds are fixed from the selection or minimal update.
     // But wait, bettingLogicService.ts doesn't have updateOdds exposed!
     // We can just ignore this for now or implement it if critical.
     // User usually takes the market odds.
     console.warn("Manual odds update not fully supported in this version");
  };


  const quickStakeAmounts = [1000, 2000, 5000, 10000, 20000, 25000, 50000, 75000, 90000, 95000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:w-[95vw] md:max-w-6xl bg-background md:rounded-lg shadow-2xl overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="bg-muted px-4 py-3 flex items-center justify-between border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm md:text-base font-bold text-foreground uppercase">
                {match.name}
              </h2>
              {match.is_live && (
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {match.start_date
                ? new Date(match.start_date).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Time TBD"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-orange-500 hover:text-orange-400 text-sm font-semibold"
            >
              Matka
            </a>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            {/* Left Section - Betting Options */}
            <div className="lg:col-span-2 space-y-4">
              {/* Match Odds */}
              {matchOdds.length > 0 && (
                <div className="bg-card rounded-lg overflow-hidden border border-border">
                  <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
                    <h3 className="text-xs font-bold text-foreground uppercase">
                      Match Odds
                    </h3>
                    <span className="text-xs text-muted-foreground">Max: 1.00</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50 text-muted-foreground">
                          <th className="px-4 py-2 text-left font-semibold"></th>
                          <th className="px-2 py-2 text-center font-semibold" colSpan={2}>
                            Back
                          </th>
                          <th className="px-2 py-2 text-center font-semibold" colSpan={2}>
                            Lay
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchOdds.map((runner: any, idx: number) => {
                            const backOdds = runner?.odds?.find(
                                (o: any) =>
                                  o.otype === "back" ||
                                  o.oname?.toLowerCase().includes("back")
                              );
                              const layOdds = runner?.odds?.find(
                                (o: any) =>
                                  o.otype === "lay" ||
                                  o.oname?.toLowerCase().includes("lay")
                              );
    
                              const runnerName = runner.nat || runner.runner_name || `Runner ${idx + 1}`;

                          return (
                            <tr
                              key={idx}
                              className="border-b border-border hover:bg-muted/30"
                            >
                              <td className="px-4 py-2 text-foreground font-semibold">
                                {runnerName}
                              </td>
                              <td className="px-2 py-2">
                                <button
                                  onClick={() =>
                                    backOdds?.odds &&
                                    handleOddsClick(runnerName, "back", backOdds.odds)
                                  }
                                  disabled={!backOdds?.odds || backOdds.odds <= 0}
                                  className={`w-full px-3 py-2 rounded text-center font-bold transition-all ${
                                    backOdds?.odds && backOdds.odds > 0
                                      ? "bg-sky-300 hover:bg-sky-400 text-black cursor-pointer"
                                      : "bg-muted text-muted-foreground cursor-not-allowed"
                                  }`}
                                >
                                  <div className="text-sm">
                                    {backOdds?.odds && backOdds.odds > 0
                                      ? backOdds.odds.toFixed(2)
                                      : "-"}
                                  </div>
                                  {backOdds?.size && (
                                    <div className="text-[10px] opacity-80">
                                      {backOdds.size}
                                    </div>
                                  )}
                                </button>
                              </td>
                              <td className="px-2 py-2">
                                <div className="text-[10px] text-muted-foreground text-center">
                                  {backOdds?.size || "-"}
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <button
                                  onClick={() =>
                                    layOdds?.odds &&
                                    handleOddsClick(runnerName, "lay", layOdds.odds)
                                  }
                                  disabled={!layOdds?.odds || layOdds.odds <= 0}
                                  className={`w-full px-3 py-2 rounded text-center font-bold transition-all ${
                                    layOdds?.odds && layOdds.odds > 0
                                      ? "bg-rose-300 hover:bg-rose-400 text-black cursor-pointer"
                                      : "bg-muted text-muted-foreground cursor-not-allowed"
                                  }`}
                                >
                                  <div className="text-sm">
                                    {layOdds?.odds && layOdds.odds > 0
                                      ? layOdds.odds.toFixed(2)
                                      : "-"}
                                  </div>
                                  {layOdds?.size && (
                                    <div className="text-[10px] opacity-80">
                                      {layOdds.size}
                                    </div>
                                  )}
                                </button>
                              </td>
                              <td className="px-2 py-2">
                                <div className="text-[10px] text-muted-foreground text-center">
                                  {layOdds?.size || "-"}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tied Match */}
              {tiedMatchOdds.length > 0 && (
                <div className="bg-[#0a0a0a] rounded-lg overflow-hidden">
                  <div className="bg-[#2d3748] px-4 py-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase">
                      Tied Match
                    </h3>
                    <span className="text-xs text-gray-400">Max: 1.00</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#1a1a1a] text-gray-400">
                          <th className="px-4 py-2 text-left font-semibold"></th>
                          <th className="px-2 py-2 text-center font-semibold" colSpan={2}>
                            Back
                          </th>
                          <th className="px-2 py-2 text-center font-semibold" colSpan={2}>
                            Lay
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tiedMatchOdds.map((runner: any, idx: number) => {
                           const backOdds = runner?.odds?.find(
                            (o: any) =>
                              o.otype === "back" ||
                              o.oname?.toLowerCase().includes("back")
                          );
                          const layOdds = runner?.odds?.find(
                            (o: any) =>
                              o.otype === "lay" ||
                              o.oname?.toLowerCase().includes("lay")
                          );

                          const runnerName = runner.nat || runner.runner_name || (idx === 0 ? "Yes" : "No");

                          return (
                            <tr
                              key={idx}
                              className="border-b border-gray-800 hover:bg-[#1a1a1a]"
                            >
                              <td className="px-4 py-2 text-white font-semibold">
                                {runnerName}
                              </td>
                              <td className="px-2 py-2">
                                <button
                                  onClick={() =>
                                    backOdds?.odds &&
                                    handleOddsClick(runnerName, "back", backOdds.odds)
                                  }
                                  disabled={!backOdds?.odds || backOdds.odds <= 0}
                                  className={`w-full px-3 py-2 rounded text-center font-bold transition-all ${
                                    backOdds?.odds && backOdds.odds > 0
                                      ? "bg-[#72bbef] hover:bg-[#5aa7dc] text-black cursor-pointer"
                                      : "bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
                                  }`}
                                >
                                  <div className="text-sm">
                                    {backOdds?.odds && backOdds.odds > 0
                                      ? backOdds.odds.toFixed(2)
                                      : "-"}
                                  </div>
                                </button>
                              </td>
                              <td className="px-2 py-2">
                                <div className="text-[10px] text-gray-500 text-center">
                                  {backOdds?.size || "-"}
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <button
                                  onClick={() =>
                                    layOdds?.odds &&
                                    handleOddsClick(runnerName, "lay", layOdds.odds)
                                  }
                                  disabled={!layOdds?.odds || layOdds.odds <= 0}
                                  className={`w-full px-3 py-2 rounded text-center font-bold transition-all ${
                                    layOdds?.odds && layOdds.odds > 0
                                      ? "bg-[#faa9ba] hover:bg-[#f88fa5] text-black cursor-pointer"
                                      : "bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
                                  }`}
                                >
                                  <div className="text-sm">
                                    {layOdds?.odds && layOdds.odds > 0
                                      ? layOdds.odds.toFixed(2)
                                      : "-"}
                                  </div>
                                </button>
                              </td>
                              <td className="px-2 py-2">
                                <div className="text-[10px] text-gray-500 text-center">
                                  {layOdds?.size || "-"}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Live Score */}
              {match.is_live && (
                <div className="bg-[#0a0a0a] rounded-lg overflow-hidden">
                  <div className="bg-[#2d3748] px-4 py-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase">
                      Live Score
                    </h3>
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">
                      LIVE
                    </span>
                  </div>
                  <div className="p-2">
                    <iframe
                      src={`https://score.akamaized.uk/diamond-live-score?gmid=${match.gmid}`}
                      title="Live Score"
                      className="w-full h-64 md:h-80 rounded border border-gray-700 bg-black"
                      allow="autoplay"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Section - Bet Placement Panel */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("cashout")}
                  className={`flex-1 px-4 py-2 text-xs font-bold rounded transition-colors ${
                    activeTab === "cashout"
                      ? "bg-[#38b2ac] text-white"
                      : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]"
                  }`}
                >
                  Cashout
                </button>
                <button
                  onClick={() => setActiveTab("placebet")}
                  className={`flex-1 px-4 py-2 text-xs font-bold rounded transition-colors ${
                    activeTab === "placebet"
                      ? "bg-[#38b2ac] text-white"
                      : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]"
                  }`}
                >
                  Place Bet
                </button>
              </div>

              {/* Bet Panel */}
              {activeTab === "placebet" && (
                <div className="bg-[#0a0a0a] rounded-lg p-4 space-y-4">
                  {/* Bet For */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      (Bet for)
                    </label>
                    <div className="bg-[#2a2a2a] px-3 py-2 rounded text-sm text-white font-semibold">
                      {currentBet?.selection || "-"}
                    </div>
                  </div>

                  {/* Odds */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Odds
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        readOnly
                        value={currentBet?.odds || ""}
                        className="flex-1 bg-[#2a2a2a] text-white px-3 py-2 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#38b2ac]"
                      />
                      {/* Note: Odds updates are disabled for now as useBettingLogic controls them */}
                      <div className="flex flex-col">
                        <button
                          className="text-gray-400 hover:text-white opacity-50 cursor-not-allowed"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-white opacity-50 cursor-not-allowed"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stake */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Stake
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={currentBet?.stake || ""}
                        onChange={(e) =>
                          handleUpdateStake(parseFloat(e.target.value) || 0)
                        }
                        className="flex-1 bg-[#2a2a2a] text-white px-3 py-2 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#38b2ac]"
                      />
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            handleIncrementStake(100)
                          }
                          className="text-gray-400 hover:text-white"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                           onClick={() =>
                             handleIncrementStake(-100)
                           }
                          className="text-gray-400 hover:text-white"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stake Buttons */}
                  <div className="grid grid-cols-5 gap-1">
                    {quickStakeAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleIncrementStake(amount)}
                        className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-2 py-1 rounded text-[10px] font-semibold transition-colors"
                      >
                        +{amount >= 1000 ? `${amount / 1000}k` : amount}
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={clearBetSlip}
                      className="bg-[#63b3ed] hover:bg-[#4299e1] text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                    >
                      clear
                    </button>
                    <button
                      className="bg-[#38b2ac] hover:bg-[#319795] text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={clearBetSlip}
                      className="bg-[#fc8181] hover:bg-[#f56565] text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={
                        !currentBet || currentBet.stake <= 0 || isPlacingBet
                      }
                      className="bg-[#48bb78] hover:bg-[#38a169] text-white px-4 py-2 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlacingBet ? "Placing..." : "Submit"}
                    </button>
                  </div>

                  {/* My Bet */}
                  <div>
                    <h4 className="text-xs font-bold text-white mb-2">My Bet</h4>
                    <div className="bg-[#2a2a2a] rounded overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#1a1a1a] text-gray-400">
                            <th className="px-2 py-1 text-left font-semibold">
                              Odds
                            </th>
                            <th className="px-2 py-1 text-right font-semibold">
                              Stake
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {placedBets.length === 0 ? (
                            <tr>
                              <td
                                colSpan={2}
                                className="px-2 py-2 text-center text-gray-500"
                              >
                                No bets placed
                              </td>
                            </tr>
                          ) : (
                            placedBets.slice(0, 3).map((bet) => (
                              <tr
                                key={bet.id}
                                className="border-b border-gray-700"
                              >
                                <td className="px-2 py-1 text-white">
                                  {bet.odds.toFixed(2)}
                                </td>
                                <td className="px-2 py-1 text-white text-right">
                                  {bet.stake}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Matched Bet */}
                  <div>
                    <h4 className="text-xs font-bold text-white mb-2">
                      Matched Bet
                    </h4>
                    <div className="bg-[#2a2a2a] rounded overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#1a1a1a] text-gray-400">
                            <th className="px-2 py-1 text-left font-semibold">
                              Odds
                            </th>
                            <th className="px-2 py-1 text-right font-semibold">
                              Stake
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {placedBets.length === 0 ? (
                            <tr>
                              <td
                                colSpan={2}
                                className="px-2 py-2 text-center text-gray-500"
                              >
                                No matched bets
                              </td>
                            </tr>
                          ) : (
                            placedBets.slice(0, 3).map((bet) => (
                              <tr
                                key={bet.id}
                                className="border-b border-gray-700"
                              >
                                <td className="px-2 py-1 text-white">
                                  {bet.odds.toFixed(2)}
                                </td>
                                <td className="px-2 py-1 text-white text-right">
                                  {bet.stake}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
