import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle, Zap } from "lucide-react";
import { diamondWS } from "@/services/websocket";

type TestResult = {
  name: string;
  status: "pending" | "success" | "error" | "warning";
  request?: any;
  response?: any;
  error?: string;
  timestamp: string;
};

export default function ApiTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [liveData, setLiveData] = useState<{
    sports: number;
    matches: number;
    lastUpdate: string;
  } | null>(null);

  useEffect(() => {
    // Listen for WebSocket events
    const handleSports = (data: any) => {
      setLiveData(prev => ({
        sports: data?.length || 0,
        matches: prev?.matches || 0,
        lastUpdate: new Date().toISOString(),
      }));
    };

    const handleMatches = (data: any) => {
      setLiveData(prev => ({
        sports: prev?.sports || 0,
        matches: data?.length || 0,
        lastUpdate: new Date().toISOString(),
      }));
    };

    const handleConnected = () => {
      setWsConnected(true);
    };

    diamondWS.on("sports", handleSports);
    diamondWS.on("matches", handleMatches);
    diamondWS.on("connected", handleConnected);

    return () => {
      diamondWS.off("sports", handleSports);
      diamondWS.off("matches", handleMatches);
      diamondWS.off("connected", handleConnected);
    };
  }, []);

  const addResult = (result: Omit<TestResult, "timestamp">) => {
    setResults((prev) => {
      // Prevent duplicate pending results
      const filtered = prev.filter(r => 
        !(r.name === result.name && r.status === "pending")
      );
      return [...filtered, { ...result, timestamp: new Date().toISOString() }];
    });
  };

  const testDiamondApi = async () => {
    const apiHost = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
    const apiKey = import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
    const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
    
    const baseUrl = apiHost.startsWith("/")
      ? apiHost
      : `${protocol}://${apiHost}`;

    addResult({
      name: "Diamond API - Configuration",
      status: "success",
      request: {
        baseUrl,
        apiKey,
        environment: import.meta.env.MODE,
        origin: window.location.origin,
        isProxied: apiHost.startsWith("/"),
        directApiUrl: "http://130.250.191.174:3009",
      },
      response: null,
    });

    // Test 1: Using configured URL (proxy or direct)
    try {
      const url = `${baseUrl}/tree?key=${apiKey}`;
      addResult({
        name: "Diamond API - Sports List (Configured URL)",
        status: "pending",
        request: { url, method: "GET", note: "Using BASE_URL from config" },
        response: null,
      });

      const response = await fetch(url);
      const data = await response.json();

      addResult({
        name: "Diamond API - Sports List (Configured URL)",
        status: data.success !== false ? "success" : "warning",
        request: { url, method: "GET" },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: data,
          note: data.success === false ? "API returned success: false" : undefined,
        },
      });
    } catch (error: any) {
      addResult({
        name: "Diamond API - Sports List (Configured URL) Error",
        status: "error",
        error: error.message,
        request: { url: `${baseUrl}/tree` },
        response: null,
      });
    }

    // Test 2: Try direct API URL if in production and proxy failed
    if (!apiHost.startsWith("/")) {
      try {
        const directUrl = `http://130.250.191.174:3009/tree?key=${apiKey}`;
        addResult({
          name: "Diamond API - Sports List (Direct API)",
          status: "pending",
          request: { url: directUrl, method: "GET", note: "Testing direct API access" },
          response: null,
        });

        const response = await fetch(directUrl);
        const data = await response.json();

        addResult({
          name: "Diamond API - Sports List (Direct API)",
          status: data.success !== false ? "success" : "warning",
          request: { url: directUrl, method: "GET" },
          response: {
            status: response.status,
            statusText: response.statusText,
            data: data,
          },
        });
      } catch (error: any) {
        addResult({
          name: "Diamond API - Sports List (Direct API) Error",
          status: "error",
          error: error.message + " - This may be a CORS or network issue",
          request: null,
          response: null,
        });
      }
    }
  };

  const testCasinoApi = async () => {
    const apiHost = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
    const apiKey = import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
    const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
    
    const baseUrl = apiHost.startsWith("/")
      ? apiHost
      : `${protocol}://${apiHost}`;

    const url = `${baseUrl}/casino/tableid?key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();

      addResult({
        name: "Casino API - Table List",
        status: response.ok ? "success" : "error",
        request: { url, method: "GET" },
        response: {
          status: response.status,
          statusText: response.statusText,
          data: data,
          tableCount: data?.data?.t1?.length || 0,
        },
      });
    } catch (error: any) {
      addResult({
        name: "Casino API - Table List",
        status: "error",
        error: error.message,
        request: { url, method: "GET" },
        response: null,
      });
    }
  };

  const testSupabase = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    addResult({
      name: "Supabase - Configuration",
      status: supabaseUrl && supabaseKey ? "success" : "error",
      request: {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
      },
      response: null,
    });

    if (!supabaseUrl || !supabaseKey) {
      addResult({
        name: "Supabase - Missing Config",
        status: "error",
        error: "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not configured",
        request: null,
        response: null,
      });
      return;
    }

    try {
      const url = `${supabaseUrl}/rest/v1/`;
      const response = await fetch(url, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      addResult({
        name: "Supabase - Connection Test",
        status: response.ok ? "success" : "error",
        request: { url, method: "GET" },
        response: {
          status: response.status,
          statusText: response.statusText,
        },
      });
    } catch (error: any) {
      addResult({
        name: "Supabase - Connection Error",
        status: "error",
        error: error.message,
        request: null,
        response: null,
      });
    }
  };

  const runAllTests = async () => {
    if (testing) return; // Prevent multiple simultaneous tests
    
    setTesting(true);
    setResults([]);

    addResult({
      name: "Environment Info",
      status: "success",
      request: {
        mode: import.meta.env.MODE,
        origin: window.location.origin,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        userAgent: navigator.userAgent,
      },
      response: null,
    });

    await testDiamondApi();
    await testCasinoApi();
    await testSupabase();

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "pending":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">API Diagnostics</h1>
            <p className="text-sm text-muted-foreground">
              Test API connections and view responses (runs once per click)
            </p>
          </div>
          <div className="flex gap-2">
            {wsConnected && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-600 rounded">
                <Zap className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-xs text-green-200">Live Connection Active</span>
              </div>
            )}
            <Button
              onClick={runAllTests}
              disabled={testing}
              className="bg-primary text-black hover:bg-white"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Run All Tests"
              )}
            </Button>
          </div>
        </div>

        {liveData && (
          <Card className="p-4 bg-green-900/20 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold mb-1 text-green-200">
                  <Zap className="inline w-4 h-4 mr-1" />
                  WebSocket Polling Active
                </h2>
                <p className="text-xs text-green-300">
                  Data updates automatically every 5-10 seconds
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-300">
                  <div>Sports: {liveData.sports}</div>
                  <div>Matches: {liveData.matches}</div>
                  <div className="text-[10px] text-green-400 mt-1">
                    Updated: {new Date(liveData.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 bg-muted/50">
          <h2 className="text-sm font-bold mb-2 text-foreground">Current Environment</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Mode:</span>{" "}
              <span className="font-mono text-foreground">{import.meta.env.MODE}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Origin:</span>{" "}
              <span className="font-mono text-foreground">{window.location.origin}</span>
            </div>
            <div>
              <span className="text-muted-foreground">API Host:</span>{" "}
              <span className="font-mono text-foreground">
                {import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond (default)"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Using Proxy:</span>{" "}
              <span className="font-mono text-foreground">
                {(import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond").startsWith("/") ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Supabase:</span>{" "}
              <span className="font-mono text-foreground">
                {import.meta.env.VITE_SUPABASE_URL ? "Configured" : "Not set"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">API Key:</span>{" "}
              <span className="font-mono text-foreground">
                {import.meta.env.VITE_DIAMOND_API_KEY ? "Set" : "Using default"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-yellow-900/20 border-yellow-600">
          <h3 className="text-sm font-bold mb-2 text-yellow-200">⚠️ Production Configuration Required</h3>
          <p className="text-xs text-yellow-200 mb-2">
            On localhost, the app uses Vite's proxy (<code>/api/diamond</code>) which works fine.
            In production, you need to either:
          </p>
          <ol className="text-xs text-yellow-200 list-decimal list-inside space-y-1">
            <li>Set environment variables in your hosting platform (Vercel/Netlify)</li>
            <li>Configure a proxy on your production server</li>
          </ol>
          <div className="mt-2 p-2 bg-black/30 rounded font-mono text-[10px] text-yellow-100">
            VITE_DIAMOND_API_HOST=130.250.191.174:3009<br/>
            VITE_DIAMOND_API_PROTOCOL=http<br/>
            VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
          </div>
        </Card>

        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Test Results</h2>
            {results.map((result, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{result.name}</h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {result.error && (
                      <div className="mb-2 p-2 bg-red-900/20 border border-red-600 rounded">
                        <p className="text-xs text-red-200">{result.error}</p>
                      </div>
                    )}

                    {result.request && (
                      <details className="mb-2">
                        <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground">
                          Request Details
                        </summary>
                        <pre className="mt-2 p-2 bg-card rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.request, null, 2)}
                        </pre>
                      </details>
                    )}

                    {result.response && (
                      <details className="mb-2">
                        <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground">
                          Response Details
                        </summary>
                        <pre className="mt-2 p-2 bg-card rounded text-xs overflow-x-auto max-h-96">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {results.length === 0 && !testing && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Click "Run All Tests" to start diagnostics
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
