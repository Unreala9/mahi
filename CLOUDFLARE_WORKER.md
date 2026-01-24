# Cloudflare Workers Proxy - Free Alternative

Since Hostinger is blocking outbound connections to the Diamond API, use Cloudflare Workers as a free proxy solution.

## Why Cloudflare Workers?

✅ **Free tier:** 100,000 requests/day  
✅ **No server restrictions:** Can connect to any API  
✅ **Fast:** Global CDN with low latency  
✅ **Easy setup:** Deploy in 5 minutes  
✅ **Custom domain:** Use your own domain or free workers.dev subdomain

---

## Setup Steps

### Step 1: Create Cloudflare Account

1. Go to: https://dash.cloudflare.com/sign-up
2. Sign up (it's free)
3. Verify email

### Step 2: Create Worker

1. In Cloudflare Dashboard, click **Workers & Pages**
2. Click **Create Application**
3. Click **Create Worker**
4. Give it a name: `diamond-api-proxy`
5. Click **Deploy**

### Step 3: Edit Worker Code

Click **Edit Code** and replace everything with:

```javascript
/**
 * Cloudflare Worker - Diamond API Proxy
 * Handles CORS and forwards requests to Diamond API
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
      // Get path from URL
      // Expected format: https://your-worker.workers.dev/allSportid
      // or: https://your-worker.workers.dev/?path=allSportid
      
      let apiPath = url.pathname.substring(1); // Remove leading /
      
      // Support ?path= parameter for compatibility
      if (url.searchParams.has('path')) {
        apiPath = url.searchParams.get('path');
        url.searchParams.delete('path');
      }
      
      if (!apiPath) {
        return jsonResponse({
          error: 'Missing API path',
          usage: 'Use: https://your-worker.workers.dev/endpoint or ?path=endpoint'
        }, 400);
      }

      // Build target URL
      const targetUrl = new URL(`${DIAMOND_API}/${apiPath}`);
      
      // Copy query parameters
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
      });
      
      // Add API key if not present
      if (!targetUrl.searchParams.has('key')) {
        targetUrl.searchParams.set('key', API_KEY);
      }

      // Prepare request options
      const requestOptions = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Add body for POST/PUT
      if (request.method === 'POST' || request.method === 'PUT') {
        requestOptions.body = await request.text();
      }

      console.log('Proxying to:', targetUrl.toString());

      // Make request to Diamond API
      const apiResponse = await fetch(targetUrl.toString(), requestOptions);
      const responseData = await apiResponse.text();

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
      console.error('Proxy error:', error);
      return jsonResponse({
        error: 'Proxy Error',
        message: error.message,
        stack: error.stack
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
```

### Step 4: Save and Deploy

1. Click **Save and Deploy**
2. Copy your worker URL: `https://diamond-api-proxy.YOUR_SUBDOMAIN.workers.dev`

### Step 5: Test Worker

Open in browser or use curl:

```bash
# Test all sports
curl "https://diamond-api-proxy.YOUR_SUBDOMAIN.workers.dev/allSportid"

# Test match details
curl "https://diamond-api-proxy.YOUR_SUBDOMAIN.workers.dev/getPriveteData?gmid=33595173&sid=4"
```

### Step 6: Update Your React App

Edit `.env.production`:

```env
# Use your Cloudflare Worker URL (without https://)
VITE_DIAMOND_API_HOST=diamond-api-proxy.YOUR_SUBDOMAIN.workers.dev
VITE_DIAMOND_API_PROTOCOL=https
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd

VITE_SPORTBEX_API_KEY=shiZvksuvSPpLCBSlVpOEFyLeQi4pjIC1jWl1GT1
```

### Step 7: Rebuild and Deploy

```bash
npm run build
# Upload dist/ to Hostinger
```

---

## Custom Domain (Optional)

If you want to use your own domain instead of workers.dev:

1. Add your domain to Cloudflare (Cloudflare → Add Site)
2. Update nameservers at your domain registrar
3. Workers & Pages → Your Worker → Settings → Triggers
4. Add Custom Domain: `api.yourdomain.com`
5. Update `.env.production`:
   ```env
   VITE_DIAMOND_API_HOST=api.yourdomain.com
   ```

---

## Advantages Over PHP Proxy

| Feature | PHP Proxy | Cloudflare Worker |
|---------|-----------|-------------------|
| **Setup** | Need server access | 5 minute setup online |
| **Restrictions** | Host may block ports | No restrictions |
| **Speed** | Single server | Global CDN |
| **Reliability** | Depends on hosting | 99.99% uptime |
| **Cost** | Included in hosting | Free (100k req/day) |
| **Scalability** | Limited by server | Automatic scaling |

---

## Rate Limits

**Free Tier:**
- 100,000 requests per day
- 1000 requests per minute
- More than enough for most apps

**Paid Tier** ($5/month):
- 10 million requests per month
- Unlimited bursts

---

## Monitoring

View logs in Cloudflare Dashboard:
1. Workers & Pages → Your Worker
2. Click **Logs** tab
3. See real-time requests and errors

---

## Troubleshooting

### Worker returns 1101 error

**Problem:** Worker can't reach Diamond API

**Fix:** Diamond API might be down or blocking Cloudflare IPs

```javascript
// Add timeout in worker code:
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

const apiResponse = await fetch(targetUrl.toString(), {
  ...requestOptions,
  signal: controller.signal
});

clearTimeout(timeoutId);
```

### CORS error still showing

**Problem:** Worker not adding CORS headers

**Fix:** Make sure `Access-Control-Allow-Origin: *` is in response headers (already in code above)

### "No subdomain" error

**Problem:** Worker name already taken

**Fix:** Use different name like `diamond-proxy-yourname` or `mahi-api-proxy`

---

## Alternative: Use Existing Public Proxy

If you don't want to create your own worker, you can use:

**Cloudflare Tunnel:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

**All Origins (Public):** 
```
https://api.allorigins.win/raw?url=http://130.250.191.174:3009/allSportid
```

⚠️ **Warning:** Public proxies are slow and unreliable. Use for testing only.

---

## Security Notes

1. **API Key in Code:** The API key is visible in worker code. To hide it:
   ```javascript
   // In Worker settings, add Environment Variable:
   // API_KEY = mahi4449839dbabkadbakwq1qqd
   
   // In worker code, use:
   const API_KEY = env.API_KEY;
   ```

2. **Rate Limiting:** Add rate limiting to prevent abuse:
   ```javascript
   // Track requests per IP (basic example)
   const ip = request.headers.get('CF-Connecting-IP');
   // Implement rate limiting logic
   ```

3. **Allowed Origins:** Restrict to your domain only:
   ```javascript
   const allowedOrigins = ['https://yourdomain.com', 'https://www.yourdomain.com'];
   const origin = request.headers.get('Origin');
   
   if (allowedOrigins.includes(origin)) {
     return new Response(data, {
       headers: {
         'Access-Control-Allow-Origin': origin,
       }
     });
   }
   ```

---

## Complete Setup Time

- **Create account:** 2 minutes
- **Deploy worker:** 2 minutes  
- **Test & verify:** 1 minute
- **Update app:** 2 minutes
- **Build & deploy:** 5 minutes

**Total: ~12 minutes** ⚡

---

## Next Steps

1. ✅ Create Cloudflare account
2. ✅ Deploy worker with code above
3. ✅ Test worker URL in browser
4. ✅ Update `.env.production` with worker URL
5. ✅ Rebuild: `npm run build`
6. ✅ Upload to Hostinger
7. ✅ Verify everything works

**This will solve your Hostinger connection issue!** 🚀
