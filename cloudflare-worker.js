/**
 * Cloudflare Worker - Diamond API Proxy
 * Copy this entire code to your Cloudflare Worker
 */

const DIAMOND_API = 'http://130.250.191.174:3009';
const API_KEY = 'mahi4449839dbabkadbakwq1qqd';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    try {
      // Get path - handle both /endpoint and /?path=endpoint formats
      let apiPath = url.pathname.substring(1); // Remove leading /
      
      // Support ?path= parameter (for PHP proxy compatibility)
      if (url.searchParams.has('path')) {
        apiPath = url.searchParams.get('path');
        url.searchParams.delete('path');
      }
      
      // Root path - show help
      if (!apiPath || apiPath === '') {
        return jsonResponse({
          status: 'ok',
          message: 'Diamond API Proxy is running',
          usage: {
            example1: `${url.origin}/allSportid`,
            example2: `${url.origin}/getPriveteData?gmid=33595173&sid=4`,
            note: 'API key is automatically added'
          }
        }, 200);
      }

      // Build target URL
      const targetUrl = new URL(`${DIAMOND_API}/${apiPath}`);
      
      // Copy all query parameters
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
      });
      
      // Add API key if not present
      if (!targetUrl.searchParams.has('key')) {
        targetUrl.searchParams.set('key', API_KEY);
      }

      // Prepare request
      const requestOptions = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Add body for POST/PUT
      if (request.method === 'POST' || request.method === 'PUT') {
        const body = await request.text();
        if (body) {
          requestOptions.body = body;
        }
      }

      // Make request to Diamond API
      const apiResponse = await fetch(targetUrl.toString(), requestOptions);
      
      // Get response text
      let responseData;
      const contentType = apiResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await apiResponse.text();
      } else {
        responseData = await apiResponse.text();
      }

      // Return with CORS headers
      return new Response(responseData, {
        status: apiResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });

    } catch (error) {
      return jsonResponse({
        error: 'Proxy Error',
        message: error.message,
        stack: error.stack,
        note: 'Failed to connect to Diamond API'
      }, 500);
    }
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
