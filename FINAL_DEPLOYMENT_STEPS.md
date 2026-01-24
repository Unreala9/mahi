# 🚀 Final Deployment Steps - mahiexchange.com

## Current Setup

**Main Website:** mahiexchange.com (Hostinger)  
**API Proxy:** diamond-api-proxy.pages.dev (Cloudflare)

---

## ✅ Step 1: Verify Cloudflare Worker

Test your worker in browser:
```
https://diamond-api-proxy.pages.dev/allSportid
```

**Expected:** JSON response with sports data

**If 404 error:** Follow setup in [CLOUDFLARE_WORKER.md](CLOUDFLARE_WORKER.md)

---

## ✅ Step 2: Build Production

```bash
npm run build
```

This creates `dist/` folder with optimized files.

---

## ✅ Step 3: Upload to Hostinger

### Via File Manager:
1. Login to Hostinger cPanel
2. File Manager → `public_html`
3. **Delete old files** (keep backups if needed)
4. Upload **entire contents** of `dist/` folder
5. Result should look like:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-xxx.css
   │   └── index-xxx.js
   ├── robots.txt
   └── ...
   ```

### Via FTP:
1. Use FileZilla or similar
2. Connect to Hostinger FTP
3. Navigate to `public_html/`
4. Upload all files from `dist/`

---

## ✅ Step 4: Test on Production

1. **Visit site:**
   ```
   https://mahiexchange.com
   ```

2. **Open DevTools** (F12) → Network tab

3. **Navigate to a match/betting page**

4. **Verify API calls:**
   - Should see requests to: `diamond-api-proxy.pages.dev`
   - Status: 200 OK
   - No CORS errors
   - No mixed content warnings

5. **Test features:**
   - ✅ Odds are updating
   - ✅ Live streams playing
   - ✅ Betting works
   - ✅ All sports loading

---

## 🔍 Troubleshooting

### Issue: Worker returns 404

**Fix:** Make sure you created a **Worker** (not Pages deployment)

1. Go to: https://dash.cloudflare.com
2. Workers & Pages → Create Application → **Create Worker**
3. Paste code from [cloudflare-worker.js](cloudflare-worker.js)
4. Deploy
5. Test: `https://your-worker.workers.dev/allSportid`

### Issue: API calls fail on mahiexchange.com

**Check .env.production:**
```env
VITE_DIAMOND_API_HOST=diamond-api-proxy.pages.dev
VITE_DIAMOND_API_PROTOCOL=https
```

**Rebuild:**
```bash
npm run build
# Re-upload dist/ to Hostinger
```

### Issue: Old cached version showing

**Clear cache:**
1. Hard refresh: Ctrl + Shift + R
2. Clear browser cache completely
3. Try incognito/private window

### Issue: "Cannot read properties of undefined"

**Check build:**
```bash
# Verify environment variables are in build
cat dist/assets/index-*.js | grep -i "diamond-api-proxy"
```

Should show the worker URL in the bundle.

---

## 📊 Performance Check

After deployment, check:

✅ **Page Load:** < 3 seconds  
✅ **API Response:** < 500ms  
✅ **Odds Update:** Every 2 seconds  
✅ **Score Update:** Every 3 seconds  

---

## 🔐 Optional: Custom Domain for Worker

Want to use `api.mahiexchange.com` instead of `diamond-api-proxy.pages.dev`?

### 1. Add Domain to Cloudflare:
- Cloudflare Dashboard → Add Site → mahiexchange.com
- Update nameservers at domain registrar

### 2. Add Custom Domain to Worker:
- Workers & Pages → diamond-api-proxy
- Settings → Triggers → Add Custom Domain
- Enter: `api.mahiexchange.com`

### 3. Update .env.production:
```env
VITE_DIAMOND_API_HOST=api.mahiexchange.com
```

### 4. Rebuild and redeploy

**Benefit:** Cleaner URLs, same reliability

---

## 📝 Final Checklist

- [ ] Cloudflare Worker tested: `diamond-api-proxy.pages.dev/allSportid` returns data
- [ ] Built production: `npm run build` completed
- [ ] Uploaded `dist/` contents to Hostinger `public_html/`
- [ ] Visited https://mahiexchange.com - site loads
- [ ] Checked DevTools Network - API calls work
- [ ] Tested betting - odds update in real-time
- [ ] Tested live streams - videos play
- [ ] No console errors
- [ ] Mobile responsive works
- [ ] All pages accessible

---

## 🎉 Success!

Once all checks pass:

✅ **Main Site:** https://mahiexchange.com (Hostinger with SSL)  
✅ **API Proxy:** https://diamond-api-proxy.pages.dev (Cloudflare)  
✅ **Real-time Betting:** Working with live odds  
✅ **Live Streams:** Playing without issues  
✅ **Production Ready:** Fully deployed!

---

## 📞 Quick Commands

```bash
# Build
npm run build

# Test worker
curl https://diamond-api-proxy.pages.dev/allSportid

# Check if env is in build (PowerShell)
Get-Content dist/assets/index-*.js | Select-String "diamond-api-proxy"

# Quick verify
Start-Process https://mahiexchange.com
```

---

## 🔄 Future Updates

When you make changes:

1. Edit code in `src/`
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Upload `dist/` to Hostinger
5. Clear browser cache
6. Verify on mahiexchange.com

**No need to touch Cloudflare Worker unless API changes!**

---

## 📚 Documentation

- [CLOUDFLARE_WORKER.md](CLOUDFLARE_WORKER.md) - Worker setup details
- [QUICKSTART.md](QUICKSTART.md) - General deployment guide
- [PROXY_DEPLOYMENT.md](PROXY_DEPLOYMENT.md) - Technical details

---

**You're all set! 🚀**
