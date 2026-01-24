# API Configuration & Deployment Guide

## Problem: CORS & Mixed Content Errors in Production

When deploying to production (HTTPS), direct API calls to `http://130.250.191.174:3009` fail due to:

1. **Mixed Content**: HTTPS sites cannot make HTTP requests
2. **CORS**: Browser blocks cross-origin requests without proper headers
3. **Security**: Exposing API keys in client-side code

## Solution: Vercel Proxy

We use Vercel's built-in proxy feature to route API requests through your domain.

### How It Works

```
Client (HTTPS) → Your Domain (HTTPS) → Vercel Proxy → Diamond API (HTTP)
```

### Configuration Files

#### 1. `vercel.json` - Already Configured ✅
```json
{
  "rewrites": [
    {
      "source": "/api/diamond/:path*",
      "destination": "http://130.250.191.174:3009/:path*"
    }
  ]
}
```

This tells Vercel:
- Requests to `yourdomain.com/api/diamond/*` → Forward to `http://130.250.191.174:3009/*`
- API key is appended automatically by our services

#### 2. Environment Variables

**Production (.env.production):**
```env
# Leave VITE_DIAMOND_API_HOST empty or commented
# It will default to "/api/diamond" (proxy)
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
```

**Development (.env.local):**
```env
# Direct API access works on localhost
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=http
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
```

### Service Configuration

All services now support both proxy and direct API:

```typescript
// Default uses proxy in production
const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST  // Use proxy (relative URL)
  : `http://${API_HOST}`;  // Use direct API
```

### Updated Services

✅ `diamondApi.ts` - Main API service
✅ `enhancedSportsWebSocket.ts` - Real-time odds polling
✅ `enhancedPlacedBetsService.ts` - Bet placement

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix CORS with Vercel proxy"
   git push
   ```

2. **Vercel Auto-Deploy:**
   - Vercel will automatically detect `vercel.json`
   - Proxy routes will be configured
   - No additional setup needed!

3. **Verify Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure `VITE_DIAMOND_API_KEY` is set
   - `VITE_DIAMOND_API_HOST` should NOT be set (or set to `/api/diamond`)

### Testing

**Development (localhost:5173):**
```bash
npm run dev
```
- Uses direct API: `http://130.250.191.174:3009`
- Works without proxy

**Production (yourdomain.com):**
- Uses proxy: `https://yourdomain.com/api/diamond`
- Vercel forwards to: `http://130.250.191.174:3009`
- CORS and mixed content issues resolved ✅

### API Endpoints

All endpoints now work through proxy:

| Original | Proxied (Production) | Direct (Development) |
|----------|---------------------|----------------------|
| `http://130.250.191.174:3009/allSportid` | `https://yourdomain.com/api/diamond/allSportid` | `http://130.250.191.174:3009/allSportid` |
| `http://130.250.191.174:3009/tree` | `https://yourdomain.com/api/diamond/tree` | `http://130.250.191.174:3009/tree` |
| `http://130.250.191.174:3009/getPriveteData` | `https://yourdomain.com/api/diamond/getPriveteData` | `http://130.250.191.174:3009/getPriveteData` |

### Troubleshooting

**Still getting CORS errors?**
1. Clear browser cache and cookies
2. Check Vercel deployment logs
3. Verify `vercel.json` is in root directory
4. Ensure environment variables are set correctly

**API calls failing?**
1. Check Network tab in browser DevTools
2. Verify the request URL (should use `/api/diamond/*` in production)
3. Check if API key is being sent: `?key=mahi4449839dbabkadbakwq1qqd`

**Mixed content warnings?**
1. Ensure you're not hardcoding `http://` anywhere
2. All API services should use `BASE_URL` variable
3. Check console for specific URLs causing issues

### Additional Notes

- **No changes needed** for other APIs (Supabase, Stripe, etc.)
- Proxy only applies to Diamond API endpoints
- Live score API (`score.akamaized.uk`) is already HTTPS - no proxy needed
- Live stream API (`live.cricketid.xyz`) is already HTTPS - no proxy needed

### Need Help?

If issues persist:
1. Share the exact error message
2. Check browser console (F12)
3. Check Vercel deployment logs
4. Verify `vercel.json` configuration
