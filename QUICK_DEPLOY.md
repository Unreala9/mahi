# QUICK DEPLOYMENT GUIDE - https://mahiexchange.com

## Current Build Status ✓

Your app is built and ready in the `dist` folder!

## Critical: SSL/HTTPS Issue Fixed

**Problem**: Diamond API (130.250.191.174:3009) only supports HTTP, not HTTPS.
**Solution**: Two deployment options below.

---

## Option 1: Direct HTTP (Simpler, but Mixed Content Warnings)

### Setup:

1. Upload entire `dist` folder to Hostinger `public_html`
2. Current `.env` uses HTTP directly
3. App will work but browser may show "Not Secure" warnings

### Pros:

- Simple setup
- No proxy needed

### Cons:

- Mixed content warnings (HTTPS site calling HTTP API)
- Some browsers may block requests

---

## Option 2: HTTPS Proxy (Recommended for Production)

### Setup:

1. Upload entire `dist` folder to Hostinger `public_html`
2. Verify `api/proxy.php` exists in `public_html/api/`
3. Rename `.env.production` to `.env` (overwrites current .env)
4. Ensure `.htaccess` is uploaded (may be hidden)

### How It Works:

```
Browser (HTTPS) → proxy.php (HTTPS) → Diamond API (HTTP)
```

The proxy bridges HTTPS ↔ HTTP securely server-side.

### Proxy Configuration:

File: `dist/api/proxy.php`

- Already configured with Diamond API credentials
- Handles CORS automatically
- Forwards all requests to HTTP API

### Environment File:

File: `dist/.env.production`

```env
VITE_DIAMOND_API_HOST=mahiexchange.com/api/proxy.php
VITE_DIAMOND_API_PROTOCOL=https
```

This makes your app call `https://mahiexchange.com/api/proxy.php?endpoint=sports` instead of `http://130.250.191.174:3009/sports`

---

## Upload Checklist

Upload these files from `dist` folder to Hostinger `public_html`:

- [ ] index.html
- [ ] All .js files in `assets/`
- [ ] All .css files in `assets/`
- [ ] .htaccess (enable "Show Hidden Files" in File Manager)
- [ ] api/proxy.php (for Option 2)
- [ ] .env.production → rename to .env (for Option 2)

---

## Post-Deployment Testing

After upload, test these URLs:

1. **Homepage**: https://mahiexchange.com
   - Should load without errors

2. **Sports Data**: https://mahiexchange.com/sportsbook
   - Should show live matches

3. **Casino Images**: https://mahiexchange.com/casino
   - Game images should display

4. **Browser Console** (F12):
   - No SSL_PROTOCOL_ERROR
   - No mixed content warnings
   - API calls should succeed

---

## Troubleshooting

### "SSL_PROTOCOL_ERROR" still appears:

- Check `.env` file uses correct protocol
- Option 1: Should have `VITE_DIAMOND_API_PROTOCOL=http`
- Option 2: Should have `VITE_DIAMOND_API_PROTOCOL=https` + proxy

### "Mixed Content" warnings:

- Switch to Option 2 (HTTPS Proxy)
- Rename `.env.production` to `.env`
- Clear browser cache

### API returns errors:

- Check proxy.php uploaded correctly
- Verify Diamond API key in proxy.php matches
- Test direct API: http://130.250.191.174:3009/sports

### Images not loading:

- Casino images are served via HTTP
- This is expected - they load fine even with HTTPS site
- Only API data needs proxy, not images

---

## Current Configuration Summary

**Development (.env)**:

- Uses HTTP directly
- Good for local testing
- Will cause mixed content in production

**Production (.env.production)**:

- Uses HTTPS proxy
- Required for mahiexchange.com
- No mixed content warnings

**Proxy (api/proxy.php)**:

- Forwards requests to Diamond API
- Handles authentication
- Manages CORS headers

---

## Quick Commands Reference

```bash
# Rebuild if you make changes
npm run build

# Preview production build locally
npm run preview

# Check for errors
npm run lint
```

---

## Support Files

- Full deployment guide: `DEPLOYMENT.md`
- Architecture overview: `ARCHITECTURE.md`
- API integration details: `DIAMOND_API_INTEGRATION.md`
