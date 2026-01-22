import { useEffect, useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { useBetSlip } from "@/hooks/useBetSlip";
import type { MatchEvent, OddsData } from "@/services/diamondApi";

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
  const betSlip = useBetSlip();
  const [activeTab, setActiveTab] = useState<"cashout" | "placebet">("placebet");

  // Set initial selection when modal opens
  useEffect(() => {
    if (isOpen && initialSelection) {
      betSlip.selectBet({
        matchId: match.gmid,
        matchName: match.name,
        selection: initialSelection.selection,
        betType: initialSelection.betType,
        odds: initialSelection.odds,
        stake: 0,
      });
    }
  }, [isOpen, initialSelection, match.gmid, match.name]);

  if (!isOpen) return null;

  const matchOdds =
    oddsData?.match_odds && oddsData.match_odds.length > 0
      ? oddsData.match_odds
      : oddsData?.bookmaker || [];

  const tiedMatchOdds = oddsData?.tied_match || [];

  const handleOddsClick = (
    selection: string,
    betType: "back" | "lay",
    odds: number
  ) => {
    betSlip.selectBet({
      matchId: match.gmid,
      matchName: match.name,
      selection,
      betType,
      odds,
      stake: 0,
    });
  };

  const handleSubmit = () => {
    const success = betSlip.submitBet();
    if (success) {
      // Optionally show success message
      console.log("Bet submitted successfully");
    }
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
      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:w-[95vw] md:max-w-6xl bg-[#1a1a1a] md:rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#2d3748] px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex-1">
            <h2 className="text-sm md:text-base font-bold text-white uppercase">
              {match.name}
            </h2>
            <p className="text-xs text-gray-400">
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
              className="text-gray-400 hover:text-white transition-colors"
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
                <div className="bg-[#0a0a0a] rounded-lg overflow-hidden">
                  <div className="bg-[#2d3748] px-4 py-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase">
                      Match Odds
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
                                  {backOdds?.size && (
                                    <div className="text-[10px] opacity-80">
                                      {backOdds.size}
                                    </div>
                                  )}
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
                                  {layOdds?.size && (
                                    <div className="text-[10px] opacity-80">
                                      {layOdds.size}
                                    </div>
                                  )}
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
              <div className="bg-[#0a0a0a] rounded-lg overflow-hidden">
                <div className="bg-[#2d3748] px-4 py-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase">
                    Live Score
                  </h3>
                  {match.is_live && (
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">
                      LIVE
                    </span>
                  )}
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
                      {betSlip.currentBet?.selection || "-"}
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
                        value={betSlip.currentBet?.odds || ""}
                        onChange={(e) =>
                          betSlip.updateOdds(parseFloat(e.target.value) || 0)
                        }
                        className="flex-1 bg-[#2a2a2a] text-white px-3 py-2 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#38b2ac]"
                      />
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            betSlip.updateOdds(
                              (betSlip.currentBet?.odds || 0) + 0.01
                            )
                          }
                          className="text-gray-400 hover:text-white"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() =>
                            betSlip.updateOdds(
                              Math.max(0, (betSlip.currentBet?.odds || 0) - 0.01)
                            )
                          }
                          className="text-gray-400 hover:text-white"
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
                        value={betSlip.currentBet?.stake || ""}
                        onChange={(e) =>
                          betSlip.updateStake(parseFloat(e.target.value) || 0)
                        }
                        className="flex-1 bg-[#2a2a2a] text-white px-3 py-2 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#38b2ac]"
                      />
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            betSlip.updateStake(
                              (betSlip.currentBet?.stake || 0) + 100
                            )
                          }
                          className="text-gray-400 hover:text-white"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() =>
                            betSlip.updateStake(
                              Math.max(0, (betSlip.currentBet?.stake || 0) - 100)
                            )
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
                        onClick={() => betSlip.incrementStake(amount)}
                        className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-2 py-1 rounded text-[10px] font-semibold transition-colors"
                      >
                        +{amount >= 1000 ? `${amount / 1000}k` : amount}
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={betSlip.clearBet}
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
                      onClick={betSlip.resetBet}
                      className="bg-[#fc8181] hover:bg-[#f56565] text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={
                        !betSlip.currentBet || betSlip.currentBet.stake <= 0
                      }
                      className="bg-[#48bb78] hover:bg-[#38a169] text-white px-4 py-2 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
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
                          {betSlip.myBets.length === 0 ? (
                            <tr>
                              <td
                                colSpan={2}
                                className="px-2 py-2 text-center text-gray-500"
                              >
                                No bets placed
                              </td>
                            </tr>
                          ) : (
                            betSlip.myBets.slice(0, 3).map((bet) => (
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
                          {betSlip.matchedBets.length === 0 ? (
                            <tr>
                              <td
                                colSpan={2}
                                className="px-2 py-2 text-center text-gray-500"
                              >
                                No matched bets
                              </td>
                            </tr>
                          ) : (
                            betSlip.matchedBets.slice(0, 3).map((bet) => (
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
