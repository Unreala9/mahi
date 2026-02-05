# Hostinger Deployment Configuration

## 🚨 Important: Cloudflare Worker URL Required

Your Cloudflare worker URL needs to be configured. Replace `YOUR_WORKER_URL` below with actual URL.

### Step 1: Find Your Cloudflare Worker URL

Go to Cloudflare Dashboard → Workers & Pages → Your Worker

Possible URLs:
- `https://mahi-api.YOUR_SUBDOMAIN.workers.dev`
- `https://api.yourdomain.com` (if custom domain)
- Same as Hostinger domain if using Pages Functions

### Step 2: Update .env Files

**.env.production:**
```env
# Replace with your actual Cloudflare worker URL
VITE_DIAMOND_API_HOST=https://your-worker-url.workers.dev
```

**.env:**
```env
# For production builds
VITE_DIAMOND_API_HOST=https://your-worker-url.workers.dev
```

### Step 3: Rebuild and Deploy

```bash
npm run build
```

Upload `dist` folder to Hostinger.

---

## Quick Fix Options

### Option A: Using Cloudflare Worker (Recommended)

If worker URL is: `https://mahi-api.workers.dev`

Update `.env`:
```env
VITE_DIAMOND_API_HOST=https://mahi-api.workers.dev
```

### Option B: Using Direct API (Not Recommended for Production)

```env
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=http
```

**Warning:** This may cause Mixed Content errors on HTTPS sites.

### Option C: Using Relative Path (If worker on same domain)

If Cloudflare worker is set up as reverse proxy on your domain:

```env
VITE_DIAMOND_API_HOST=/api
```

---

## Troubleshooting

### Issue: API not working after deploy

**Check these:**
1. ✅ Cloudflare worker is deployed and accessible
2. ✅ Worker URL is correct in .env
3. ✅ Rebuilt project after changing .env
4. ✅ Uploaded correct `dist` folder to Hostinger
5. ✅ Browser cache cleared

**Test Worker:**
```bash
curl https://your-worker-url.workers.dev/allSportid
```

Should return JSON data with sports list.

### Issue: CORS errors

Make sure Cloudflare worker (`functions/_middleware.js`) has CORS headers:
```javascript
headers: {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}
```

### Issue: Worker returns 404

1. Check if worker is deployed
2. Verify worker URL is correct
3. Test root endpoint: `https://your-worker.workers.dev/`

---

## Complete Deployment Checklist

- [ ] Get Cloudflare Worker URL
- [ ] Update `VITE_DIAMOND_API_HOST` in `.env` and `.env.production`
- [ ] Run `npm run build`
- [ ] Upload `dist` folder to Hostinger
- [ ] Clear browser cache
- [ ] Test: `https://yourdomain.com`
- [ ] Test API: Open browser console and check Network tab

---

## Need Help?

Provide these details:
1. Cloudflare Worker URL
2. Hostinger domain URL
3. Error message from browser console
4. Network tab screenshot showing failed requests
