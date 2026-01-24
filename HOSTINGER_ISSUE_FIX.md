# 🔧 Hostinger Connection Issue - Solutions

## Problem

Your Hostinger server **cannot connect** to Diamond API:

```
Connection timed out after 10002 milliseconds
```

**Why?** 
- Hostinger **blocks outbound connections** to non-standard ports (3009)
- Diamond API might be **blocking Hostinger's server IP**
- Shared hosting typically restricts external connections for security

---

## ✅ Solution 1: Cloudflare Workers (RECOMMENDED)

**Best option:** Free, fast, no restrictions

### Quick Setup (5 minutes):

1. **Create Cloudflare account:** https://dash.cloudflare.com/sign-up
2. **Create Worker:** Workers & Pages → Create → Worker
3. **Paste code from:** [CLOUDFLARE_WORKER.md](CLOUDFLARE_WORKER.md)
4. **Get URL:** `https://your-worker.workers.dev`
5. **Update .env.production:**
   ```env
   VITE_DIAMOND_API_HOST=your-worker.workers.dev
   VITE_DIAMOND_API_PROTOCOL=https
   ```
6. **Rebuild:** `npm run build`
7. **Upload to Hostinger**

**Full guide:** See [CLOUDFLARE_WORKER.md](CLOUDFLARE_WORKER.md)

---

## ✅ Solution 2: Contact Hostinger Support

Ask them to whitelist the API:

**Email/Chat Template:**

```
Subject: Allow Outbound Connection to 130.250.191.174:3009

Hello,

I need to make HTTP requests to an external API from my hosting account.

API Details:
- Host: 130.250.191.174
- Port: 3009
- Protocol: HTTP

Please whitelist this IP and port for outbound connections from my account.

Domain: [your-domain.com]
Account: [your-account-name]

Thank you!
```

**Success Rate:** 30-40% (depends on hosting plan)

---

## ✅ Solution 3: Upgrade to VPS

If you need full control:

**Hostinger VPS Plans:**
- VPS 1: $4.99/month - Full root access
- VPS 2: $5.99/month - Better specs

**Setup:**
1. Order VPS from Hostinger
2. Install Node.js or PHP
3. Use the proxy code we created (server.js or proxy.php)
4. No restrictions on outbound connections

---

## ✅ Solution 4: Use Alternative Hosting for Proxy Only

Keep your main site on Hostinger, proxy on different service:

### Option A: Railway.app (Free)

1. Sign up: https://railway.app
2. Create new project
3. Upload [server.js](server.js)
4. Deploy
5. Get URL: `https://your-app.railway.app`
6. Update .env.production:
   ```env
   VITE_DIAMOND_API_HOST=your-app.railway.app/api/diamond
   VITE_DIAMOND_API_PROTOCOL=https
   ```

### Option B: Render.com (Free)

1. Sign up: https://render.com
2. New Web Service
3. Connect GitHub repo or upload server.js
4. Deploy
5. Similar setup as Railway

### Option C: Fly.io (Free)

1. Sign up: https://fly.io
2. Install flyctl CLI
3. Deploy Node.js app
4. Configure domain

---

## ✅ Solution 5: Use Diamond API's HTTPS Endpoint (if available)

Check if Diamond API has HTTPS:

```bash
# Test if HTTPS works
curl https://130.250.191.174:3009/allSportid?key=mahi4449839dbabkadbakwq1qqd
```

If it works, update .env.production:
```env
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=https
```

**Rebuild and it should work without proxy!**

---

## Comparison

| Solution | Cost | Setup Time | Reliability | Speed |
|----------|------|------------|-------------|-------|
| **Cloudflare Workers** | Free | 5 min | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ |
| Contact Hostinger | $0 | 1-3 days | ⭐⭐⭐ | ⚡⚡⚡ |
| Upgrade to VPS | $5/mo | 30 min | ⭐⭐⭐⭐ | ⚡⚡⚡ |
| Railway/Render | Free | 10 min | ⭐⭐⭐⭐ | ⚡⚡ |
| API HTTPS | $0 | 1 min | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ |

---

## Recommended Path

### For Production (Choose one):

**1st Choice:** ✅ **Cloudflare Workers**
- Fastest to set up
- Most reliable
- Best performance
- Free forever

**2nd Choice:** ✅ **Ask Diamond API for HTTPS**
- If they enable it, no proxy needed
- Direct connection = fastest
- No extra service to maintain

**3rd Choice:** ✅ **Contact Hostinger + Backup with Cloudflare**
- Try getting Hostinger to whitelist
- While waiting, use Cloudflare Workers
- Switch to direct PHP proxy if approved

---

## Testing After Fix

Once you've set up any solution:

### 1. Test the proxy directly:
```bash
# Replace with your proxy URL
curl "https://your-worker.workers.dev/allSportid"
```

### 2. Update .env.production:
```env
VITE_DIAMOND_API_HOST=your-worker.workers.dev
VITE_DIAMOND_API_PROTOCOL=https
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
```

### 3. Rebuild:
```bash
npm run build
```

### 4. Upload to Hostinger:
- Upload entire `dist/` folder to `public_html/`

### 5. Test on your site:
- Open: `https://yourdomain.com`
- Open DevTools (F12) → Network
- Navigate to a match page
- Verify API calls work (status 200)

---

## Need Help?

1. **Try Cloudflare Workers first** - See [CLOUDFLARE_WORKER.md](CLOUDFLARE_WORKER.md)
2. **Check updated test:** Upload new `test.php` and visit `/api/test.php`
3. **If stuck:** Let me know which solution you want and I'll help

---

## Quick Action

**Right now, do this:**

1. Go to: https://dash.cloudflare.com/sign-up
2. Create account (2 minutes)
3. Create Worker (2 minutes)
4. Follow [CLOUDFLARE_WORKER.md](CLOUDFLARE_WORKER.md)
5. You'll be live in 10 minutes! ⚡

**This is the fastest and most reliable solution!** 🚀
