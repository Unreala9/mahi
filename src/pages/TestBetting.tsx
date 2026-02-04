/**
 * Test Betting Page - Complete Betting Flow Debugger
 * Tests entire betting flow from UI to database
 */

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { casinoBettingService } from "@/services/casinoBettingService";
import { toast } from "@/hooks/use-toast";

export default function TestBetting() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const addLog = (
    message: string,
    type: "info" | "success" | "error" = "info",
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs((prev) => [...prev, `${type.toUpperCase()}: ${logEntry}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const step1_CheckAuth = async () => {
    addLog("Step 1: Checking authentication...");
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        addLog(`Auth error: ${error.message}`, "error");
        return false;
      }

      if (!session) {
        addLog("No active session found", "error");
        return false;
      }

      addLog(`User authenticated: ${session.user.id}`, "success");
      addLog(`Email: ${session.user.email}`, "success");
      setUserId(session.user.id);
      return true;
    } catch (error: any) {
      addLog(`Exception: ${error.message}`, "error");
      return false;
    }
  };

  const step2_CheckWallet = async () => {
    addLog("Step 2: Checking wallet...");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        addLog("No user found", "error");
        return false;
      }

      const { data: wallet, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        addLog(`Wallet query error: ${error.message}`, "error");
        addLog(`Error code: ${error.code}`, "error");
        return false;
      }

      if (!wallet) {
        addLog("Wallet not found - creating one...", "info");

        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({ user_id: user.id, balance: 0 })
          .select()
          .single();

        if (createError) {
          addLog(`Failed to create wallet: ${createError.message}`, "error");
          return false;
        }

        addLog(`Wallet created with balance: ₹0`, "success");
        setWalletBalance(0);
        return true;
      }

      const balance = Number(wallet.balance);
      addLog(`Wallet found! Balance: ₹${balance}`, "success");
      setWalletBalance(balance);

      if (balance < 100) {
        addLog(
          `Warning: Low balance (₹${balance}). Need at least ₹100 to test betting`,
          "error",
        );
      }

      return true;
    } catch (error: any) {
      addLog(`Exception: ${error.message}`, "error");
      return false;
    }
  };

  const step3_AddBalance = async () => {
    addLog("Step 3: Adding ₹10000 to wallet...");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        addLog("No user found", "error");
        return false;
      }

      const { data, error } = await supabase
        .from("wallets")
        .update({ balance: 10000 })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        addLog(`Failed to update balance: ${error.message}`, "error");
        return false;
      }

      addLog(`Balance updated to: ₹${data.balance}`, "success");
      setWalletBalance(Number(data.balance));
      return true;
    } catch (error: any) {
      addLog(`Exception: ${error.message}`, "error");
      return false;
    }
  };

  const step4_CheckRPCFunction = async () => {
    addLog("Step 4: Testing deduct_balance RPC function...");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        addLog("No user found", "error");
        return false;
      }

      // Test deducting ₹10
      const { data, error } = await supabase.rpc("deduct_balance", {
        p_user_id: user.id,
        p_amount: 10,
      });

      if (error) {
        addLog(`RPC error: ${error.message}`, "error");
        return false;
      }

      if (!data || !data.success) {
        addLog(`RPC failed: ${data?.message || "Unknown error"}`, "error");
        addLog(`RPC response: ${JSON.stringify(data)}`, "info");
        return false;
      }

      addLog(`RPC SUCCESS!`, "success");
      addLog(`Old balance: ₹${data.old_balance}`, "success");
      addLog(`New balance: ₹${data.new_balance}`, "success");
      addLog(`Deducted: ₹${data.old_balance - data.new_balance}`, "success");

      setWalletBalance(data.new_balance);
      return true;
    } catch (error: any) {
      addLog(`Exception: ${error.message}`, "error");
      return false;
    }
  };

  const step5_TestBetPlacement = async () => {
    addLog("Step 5: Testing casino bet placement...");
    try {
      const testBet = {
        gameId: "teen20",
        gameName: "Teen Patti 20",
        roundId: "test_" + Date.now(),
        marketId: "1",
        marketName: "Test Market",
        selection: "PLAYER A",
        odds: 1.95,
        stake: 100,
        betType: "BACK" as const,
      };

      addLog(`Placing test bet: ${JSON.stringify(testBet)}`, "info");

      const result = await casinoBettingService.placeCasinoBet(testBet);

      if (!result.success) {
        addLog(`Bet placement failed: ${result.error}`, "error");
        return false;
      }

      addLog(`Bet placed successfully!`, "success");
      addLog(`Bet ID: ${result.betId}`, "success");
      addLog(`New balance: ₹${result.balance}`, "success");

      setWalletBalance(result.balance || null);
      return true;
    } catch (error: any) {
      addLog(`Exception: ${error.message}`, "error");
      return false;
    }
  };

  const step6_CheckBetInDB = async () => {
    addLog("Step 6: Checking if bet saved in database...");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        addLog("No user found", "error");
        return false;
      }

      const { data: bets, error } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        addLog(`Database query error: ${error.message}`, "error");
        addLog(`Error code: ${error.code}`, "error");
        return false;
      }

      if (!bets || bets.length === 0) {
        addLog("No pending bets found in database", "error");
        return false;
      }

      addLog(`Found ${bets.length} pending bet(s)`, "success");
      bets.forEach((bet, index) => {
        addLog(
          `Bet ${index + 1}: ${bet.selection_name} @ ${bet.odds} - ₹${bet.stake}`,
          "success",
        );
      });

      return true;
    } catch (error: any) {
      addLog(`Exception: ${error.message}`, "error");
      return false;
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearLogs();

    addLog("=== STARTING COMPLETE BETTING FLOW TEST ===", "info");

    const authOk = await step1_CheckAuth();
    if (!authOk) {
      addLog("❌ Test failed at Step 1: Authentication", "error");
      setIsLoading(false);
      return;
    }

    const walletOk = await step2_CheckWallet();
    if (!walletOk) {
      addLog("❌ Test failed at Step 2: Wallet check", "error");
      setIsLoading(false);
      return;
    }

    if (walletBalance !== null && walletBalance < 100) {
      addLog("Adding test balance...", "info");
      await step3_AddBalance();
    }

    const rpcOk = await step4_CheckRPCFunction();
    if (!rpcOk) {
      addLog("❌ Test failed at Step 4: RPC function", "error");
      setIsLoading(false);
      return;
    }

    const betOk = await step5_TestBetPlacement();
    if (!betOk) {
      addLog("❌ Test failed at Step 5: Bet placement", "error");
      setIsLoading(false);
      return;
    }

    const dbOk = await step6_CheckBetInDB();
    if (!dbOk) {
      addLog("❌ Test failed at Step 6: Database check", "error");
      setIsLoading(false);
      return;
    }

    addLog("=== ✅ ALL TESTS PASSED! BETTING FLOW IS WORKING ===", "success");
    toast({
      title: "All Tests Passed!",
      description: "Complete betting flow is working correctly",
    });

    setIsLoading(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            🧪 Betting Flow Test Suite
          </h1>
          <p className="text-muted-foreground">
            Complete debugging tool to test entire betting flow from
            authentication to database
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">User ID</div>
            <div className="font-mono text-sm">
              {userId ? userId.slice(0, 8) + "..." : "Not loaded"}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              Wallet Balance
            </div>
            <div className="text-2xl font-bold">
              {walletBalance !== null ? `₹${walletBalance}` : "Not loaded"}
            </div>
          </Card>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={runAllTests}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? "Running Tests..." : "🚀 Run Complete Test"}
          </Button>

          <Button
            onClick={step3_AddBalance}
            disabled={isLoading}
            variant="outline"
          >
            Add ₹10000
          </Button>

          <Button onClick={clearLogs} variant="ghost">
            Clear Logs
          </Button>
        </div>

        {/* Individual Test Buttons */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Individual Tests</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={step1_CheckAuth}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              1. Auth
            </Button>
            <Button
              onClick={step2_CheckWallet}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              2. Wallet
            </Button>
            <Button
              onClick={step3_AddBalance}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              3. Add Balance
            </Button>
            <Button
              onClick={step4_CheckRPCFunction}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              4. RPC Test
            </Button>
            <Button
              onClick={step5_TestBetPlacement}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              5. Place Bet
            </Button>
            <Button
              onClick={step6_CheckBetInDB}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              6. Check DB
            </Button>
          </div>
        </Card>

        {/* Logs */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            📋 Test Logs
            <Badge variant="secondary">{logs.length} entries</Badge>
          </h3>

          <div className="bg-slate-950 rounded-lg p-4 h-[400px] overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center mt-20">
                Click "Run Complete Test" to start testing
              </div>
            ) : (
              logs.map((log, index) => {
                const isError = log.startsWith("ERROR:");
                const isSuccess = log.startsWith("SUCCESS:");

                return (
                  <div
                    key={index}
                    className={`mb-1 ${
                      isError
                        ? "text-red-400"
                        : isSuccess
                          ? "text-green-400"
                          : "text-slate-300"
                    }`}
                  >
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2">💡 How to use:</h4>
          <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
            <li>Click "Run Complete Test" to test entire betting flow</li>
            <li>Check logs for detailed step-by-step output</li>
            <li>If test fails, check which step failed and why</li>
            <li>Use individual test buttons to debug specific steps</li>
            <li>Check browser console for additional error details</li>
          </ol>
        </div>
      </div>
    </MainLayout>
  );
}
