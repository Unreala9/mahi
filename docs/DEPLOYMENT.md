# Deployment Guide

## Environment Configuration

### Local Development

For local development, use `.env.local` which uses direct IP:

```env
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=http
```

### Production Deployment

Production uses proxy to avoid HTTPS mixed content errors:

```env
VITE_DIAMOND_API_HOST=/api/diamond
```

## Vercel Deployment Steps

### 1. Build the Project

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Set Environment Variables in Vercel Dashboard

Go to Vercel Dashboard > Project > Settings > Environment Variables

Add these variables:

- `VITE_SUPABASE_URL` = `https://rgrmozpakutydlvxxngt.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `VITE_DIAMOND_API_HOST` = `/api/diamond`
- `VITE_DIAMOND_API_KEY` = `mahi4449839dbabkadbakwq1qqd`
- `VITE_CASINO_IMAGE_BASE` = `https://nd.sprintstaticdata.com/casino-icons/lc`
- `VITE_STRIPE_PUBLIC_KEY` = `pk_test_51SfDLFBUIydttjbm...`
- `VITE_RAZORPAY_KEY_ID` = `rzp_test_Ry8hY2ZgAcS50z`
- `VITE_SPORTBEX_API_KEY` = `shiZvksuvSPpLCBSlVpOEFyLeQi4pjIC1jWl1GT1`

### 4. Redeploy

After setting environment variables, trigger a new deployment.

## How It Works

### Development (Local)

```
Browser → http://130.250.191.174:3009/casino/data?type=dt20&key=xxx
```

### Production (Vercel)

```
Browser → https://your-domain.vercel.app/api/diamond/casino/data?type=dt20&key=xxx
         ↓
Vercel Proxy (vercel.json rewrites)
         ↓
http://130.250.191.174:3009/casino/data?type=dt20&key=xxx
```

## Troubleshooting

### Issue: API data not loading in production

**Solution:** Make sure `VITE_DIAMOND_API_HOST=/api/diamond` is set in Vercel environment variables.

### Issue: Mixed Content Error

**Solution:** Never use direct HTTP IP in production. Always use proxy route.

### Issue: 404 on API calls

**Solution:** Check vercel.json rewrites configuration. Should proxy `/api/diamond/*` to Diamond API.

### Issue: Unauthorized errors

**Solution:** Verify `VITE_DIAMOND_API_KEY` is set correctly in Vercel dashboard.

## Testing Production Build Locally

```bash
# Build
npm run build

# Preview
npm run preview
```

This will run production build locally on `http://localhost:4173`
