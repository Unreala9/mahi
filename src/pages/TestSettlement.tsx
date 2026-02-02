/**
 * Test Settlement Page - Debug bet settlement
 */

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  settleCasinoBets,
  settleSportsBets,
} from "@/services/autoSettlementService";
import { resultWebSocket } from "@/services/resultWebSocket";
import { fetchCasinoResult } from "@/services/casino";

export default function TestSettlement() {
  const [pendingBets, setPendingBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [casinoResult, setCasinoResult] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    loadPendingBets();

    // Subscribe to result updates
    const unsubscribe = resultWebSocket.subscribe((update) => {
      addLog(
        `Result received: ${update.type} - ${update.gameId || update.eventId} - Winner: ${update.winner}`,
      );
    });

    return () => unsubscribe();
  }, []);

  const loadPendingBets = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        addLog("No user logged in");
        return;
      }

      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        addLog(`Error loading bets: ${error.message}`);
        return;
      }

      setPendingBets(data || []);
      addLog(`Loaded ${data?.length || 0} pending bets`);
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCasinoResult = async (gameType: string) => {
    setLoading(true);
    try {
      addLog(`Fetching casino result for ${gameType}...`);
      const result = await fetchCasinoResult(gameType);
      setCasinoResult(result);
      addLog(
        `Casino result fetched: ${JSON.stringify(result?.data?.res?.[0] || "No result")}`,
      );
    } catch (error: any) {
      addLog(`Error fetching casino result: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSettleCasino = async (gameType: string) => {
    setLoading(true);
    try {
      addLog(`Testing casino settlement for ${gameType}...`);
      const results = await settleCasinoBets(gameType);
      addLog(`Settlement complete: ${results.length} bets settled`);
      results.forEach((r) => {
        addLog(`  Bet ${r.betId}: ${r.status} - Payout: ${r.payout}`);
      });
      await loadPendingBets();
    } catch (error: any) {
      addLog(`Settlement error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSettleSports = async (eventId: number) => {
    setLoading(true);
    try {
      addLog(`Testing sports settlement for event ${eventId}...`);
      const results = await settleSportsBets(eventId);
      addLog(`Settlement complete: ${results.length} bets settled`);
      results.forEach((r) => {
        addLog(`  Bet ${r.betId}: ${r.status} - Payout: ${r.payout}`);
      });
      await loadPendingBets();
    } catch (error: any) {
      addLog(`Settlement error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkResultWebSocket = () => {
    addLog("Checking result WebSocket status...");
    addLog("Result WebSocket should be running and checking every 5 seconds");
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <h1 className="text-3xl font-bold">Bet Settlement Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Bets */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Bets ({pendingBets.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={loadPendingBets} disabled={loading}>
                Refresh Bets
              </Button>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingBets.map((bet) => (
                  <div key={bet.id} className="p-3 border rounded text-sm">
                    <div className="font-semibold">
                      {bet.event_name || bet.event}
                    </div>
                    <div>Game: {bet.game_id || bet.game}</div>
                    <div>
                      Selection: {bet.selection} (ID: {bet.selection_id})
                    </div>
                    <div>
                      Stake: ₹{bet.stake} @ {bet.odds}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(bet.created_at).toLocaleString()}
                    </div>
                    <div className="mt-2 space-x-2">
                      {bet.game_id && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => testCasinoResult(bet.game_id)}
                            disabled={loading}
                          >
                            Check Result
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => testSettleCasino(bet.game_id)}
                            disabled={loading}
                          >
                            Settle
                          </Button>
                        </>
                      )}
                      {bet.event_id && (
                        <Button
                          size="sm"
                          onClick={() =>
                            testSettleSports(parseInt(bet.event_id))
                          }
                          disabled={loading}
                        >
                          Settle Sports
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {pendingBets.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No pending bets
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Casino Result */}
          <Card>
            <CardHeader>
              <CardTitle>Casino Result</CardTitle>
            </CardHeader>
            <CardContent>
              {casinoResult && (
                <div className="space-y-2">
                  <div className="font-semibold">Latest Results:</div>
                  {casinoResult.data?.res?.slice(0, 5).map((r: any) => (
                    <div key={r.mid} className="p-2 bg-gray-50 rounded text-sm">
                      Round: {r.mid} | Winner: {r.win}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-x-2">
            <Button onClick={() => testCasinoResult("dt20")} disabled={loading}>
              Test dt20 Result
            </Button>
            <Button onClick={() => testCasinoResult("dt6")} disabled={loading}>
              Test dt6 Result
            </Button>
            <Button onClick={() => testSettleCasino("dt20")} disabled={loading}>
              Settle dt20 Bets
            </Button>
            <Button onClick={checkResultWebSocket} disabled={loading}>
              Check WebSocket
            </Button>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-96 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
              {logs.length === 0 && <div>No logs yet...</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
