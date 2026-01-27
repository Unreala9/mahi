/**
 * Cloudflare Pages Function - Diamond API Proxy
 * This middleware handles all requests to the Pages deployment
 */

const DIAMOND_API = "http://130.250.191.174:3009";
const API_KEY = "mahi4449839dbabkadbakwq1qqd";

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    // Get path from URL pathname
    let apiPath = url.pathname.substring(1); // Remove leading /

    // Support ?path= parameter (for compatibility)
    if (url.searchParams.has("path")) {
      apiPath = url.searchParams.get("path");
      url.searchParams.delete("path");
    }

    // Root path - show help
    if (!apiPath || apiPath === "") {
      return jsonResponse(
        {
          status: "ok",
          message: "Diamond API Proxy is running on Cloudflare Pages",
          timestamp: new Date().toISOString(),
          usage: {
            allSports: `${url.origin}/allSportid`,
            matchDetails: `${url.origin}/getPriveteData?gmid=33595173&sid=4`,
            placeBet: `${url.origin}/placed_bets (POST)`,
            note: "API key is automatically added to all requests",
          },
        },
        200,
      );
    }

    // Build target URL
    const targetUrl = new URL(`${DIAMOND_API}/${apiPath}`);

    // Copy all query parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    // Add API key if not present
    if (!targetUrl.searchParams.has("key")) {
      targetUrl.searchParams.set("key", API_KEY);
    }

    // Prepare request options
    const requestOptions = {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Add body for POST/PUT requests
    if (request.method === "POST" || request.method === "PUT") {
      const body = await request.text();
      if (body) {
        requestOptions.body = body;
      }
    }

    console.log(`[Proxy] ${request.method} ${targetUrl.toString()}`);

    // Make request to Diamond API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const apiResponse = await fetch(targetUrl.toString(), {
      ...requestOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Get response data
    const responseData = await apiResponse.text();

    // Return with CORS headers
    return new Response(responseData, {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[Proxy Error]", error);

    return jsonResponse(
      {
        error: "Proxy Error",
        message: error.message,
        type: error.name,
        note: "Failed to connect to Diamond API",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}
