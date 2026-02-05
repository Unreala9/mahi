# Deployment Guide - Cloudflare Pages

## Architecture

This project uses **Cloudflare Pages Functions** as a proxy to handle API requests:

```
Browser (HTTPS) 
   ↓
Cloudflare Pages (your-project.pages.dev)
   ↓
Cloudflare Function (/functions/_middleware.js)
   ↓
Diamond API (http://130.250.191.174:3009)
```

## Environment Configuration

### Local Development
For local development, use `.env.local` which uses direct IP:
```env
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=http
```

### Production Deployment (Cloudflare)
Production uses Cloudflare worker (root path):
```env
VITE_DIAMOND_API_HOST=
```
**Note:** Empty string means requests go directly to root, where Cloudflare function handles them.

## Cloudflare Pages Deployment Steps

### Option 1: Git Push (Recommended)
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to Cloudflare Pages"
   git push origin shwet
   ```

2. Connect to Cloudflare Pages (First time only):
   - Go to Cloudflare Dashboard
   - Pages → Create a project
   - Connect to Git → Select repository: `Unreala9/mahi`
   - Build settings:
     - **Build command:** `npm run build`
     - **Build output directory:** `dist`
     - **Root directory:** `/`
     - **Branch:** `shwet` or `main`

3. Set Environment Variables in Cloudflare:
   - Go to Pages → Your Project → Settings → Environment Variables
   - Add these for **Production**:

   | Variable Name | Value |
   |--------------|-------|
   | `VITE_SUPABASE_URL` | `https://rgrmozpakutydlvxxngt.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
   | `VITE_DIAMOND_API_HOST` | *(leave empty or blank)* |
   | `VITE_DIAMOND_API_KEY` | `mahi4449839dbabkadbakwq1qqd` |
   | `VITE_CASINO_IMAGE_BASE` | `https://nd.sprintstaticdata.com/casino-icons/lc` |
   | `VITE_STRIPE_PUBLIC_KEY` | `pk_test_51SfDLFBUIydttjbm...` |
   | `VITE_RAZORPAY_KEY_ID` | `rzp_test_Ry8hY2ZgAcS50z` |
   | `VITE_SPORTBEX_API_KEY` | `shiZvksuvSPpLCBSlVpOEFyLeQi4pjIC1jWl1GT1` |

### Option 2: Wrangler CLI
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=mahi
```

## How It Works

### Development (Local)
```
Browser → http://130.250.191.174:3009/casino/data?type=dt20&key=xxx
```

### Production (Cloudflare Pages)
```
Browser → https://your-project.pages.dev/casino/data?type=dt20
         ↓
Cloudflare Pages Function (/functions/_middleware.js)
         ↓ (automatically adds key parameter)
http://130.250.191.174:3009/casino/data?type=dt20&key=mahi4449839dbabkadbakwq1qqd
```

## Cloudflare Function Features

The `/functions/_middleware.js` automatically:
- ✅ Adds API key to all requests
- ✅ Handles CORS headers
- ✅ Proxies all HTTP methods (GET, POST, PUT, DELETE)
- ✅ 15-second timeout protection
- ✅ Error handling with detailed logs
- ✅ Converts HTTP to HTTPS (solves mixed content issue)

## Testing After Deployment

Test these endpoints on your Cloudflare Pages URL:
1. `https://your-project.pages.dev/` - Homepage
2. `https://your-project.pages.dev/allSportid` - API proxy test
3. `https://your-project.pages.dev/casino/data?type=dt20` - Casino data test

## Troubleshooting

### Issue: API data not loading
**Checklist:**
1. ✅ `VITE_DIAMOND_API_HOST` is empty in Cloudflare env vars
2. ✅ `functions/_middleware.js` exists in repo
3. ✅ Build deployed successfully
4. ✅ Check browser console for errors

**Debug Steps:**
```bash
# Test proxy directly
curl https://your-project.pages.dev/allSportid

# Should return Diamond API response with 200 status
```

### Issue: 404 on API calls
1. Check Cloudflare Pages deployment logs
2. Verify `functions/_middleware.js` is in root directory
3. Ensure function is deployed (Files tab in Cloudflare Pages)

### Issue: Mixed Content Errors
Already fixed! Cloudflare function handles HTTP → HTTPS conversion.

### Issue: CORS Errors
Function already includes CORS headers. If still seeing errors:
1. Clear browser cache
2. Check if custom headers are interfering
3. Verify OPTIONS requests are allowed

## Monitoring & Logs

**View Real-time Logs:**
```bash
wrangler pages deployment tail --project-name=mahi
```

**Dashboard:**
- Cloudflare Dashboard → Pages → Your Project
- View deployments, logs, analytics
- Check function execution times

## Testing Locally with Cloudflare Functions

```bash
# Install wrangler
npm install -g wrangler

# Build project
npm run build

# Run with Cloudflare functions locally
wrangler pages dev dist

# OR just preview (without functions)
npm run preview
```

**Note:** `wrangler pages dev` runs actual Cloudflare functions locally for accurate testing.

## Custom Domain Setup

1. Cloudflare Pages → Your Project → Custom domains
2. Add your domain (must be in same Cloudflare account)
3. SSL automatically configured

## Quick Deploy Commands

```bash
# Full deploy workflow
git add .
git commit -m "Update: API fixes"
git push origin shwet

# Manual deploy
npm run build
wrangler pages deploy dist --project-name=mahi --branch=main

# Check deployment status
wrangler pages deployments list --project-name=mahi
```

## Environment Variables Priority

Cloudflare checks in this order:
1. Cloudflare Dashboard environment variables (Production/Preview)
2. `.env.production` file (if not set in dashboard)
3. `.env` file (fallback)

**Best Practice:** Set sensitive keys in Cloudflare Dashboard, not in files.

## Common Cloudflare Commands

```bash
# View project info
wrangler pages project list

# View deployments
wrangler pages deployments list --project-name=mahi

# Delete deployment (rollback)
wrangler pages deployment delete <DEPLOYMENT_ID> --project-name=mahi

# Tail logs
wrangler pages deployment tail
```
