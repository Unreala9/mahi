# 🚀 Quick Start - Hostinger Deployment

## Files Created

✅ **Backend Proxy:**
- `public/api/proxy.php` - Main proxy server
- `public/api/test.php` - Test endpoint
- `public/api/.htaccess` - PHP configuration
- `public/api/test-proxy.html` - Visual test page

✅ **Alternative:**
- `server.js` - Node.js proxy (if you have Node.js support)
- `package-proxy.json` - Node.js dependencies

✅ **Documentation:**
- `PROXY_DEPLOYMENT.md` - Complete deployment guide
- `HOSTINGER_SETUP.md` - Hostinger-specific setup

---

## 📋 Step-by-Step Deployment

### Step 1: Upload Proxy Files to Hostinger

Via File Manager or FTP, upload these files:

```
public_html/
├── api/
│   ├── proxy.php           ← Upload this
│   ├── test.php            ← Upload this
│   ├── .htaccess           ← Upload this
│   └── test-proxy.html     ← Upload this
```

**From your project:**
- Copy `public/api/proxy.php` → `public_html/api/proxy.php`
- Copy `public/api/test.php` → `public_html/api/test.php`
- Copy `public/api/.htaccess` → `public_html/api/.htaccess`
- Copy `public/api/test-proxy.html` → `public_html/api/test-proxy.html`

### Step 2: Test the Proxy

Open in browser:
```
https://yourdomain.com/api/test.php
```

**Expected Output:**
```json
{
  "status": "success",
  "message": "Proxy is working correctly!",
  "http_code": 200
}
```

**Visual Test:**
```
https://yourdomain.com/api/test-proxy.html
```

### Step 3: Update Environment

Edit `.env.production` in your project:

```env
# ⚠️ IMPORTANT: Replace yourdomain.com with your actual domain!
VITE_DIAMOND_API_HOST=yourdomain.com/api/proxy.php
VITE_DIAMOND_API_PROTOCOL=https
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd

VITE_SPORTBEX_API_KEY=shiZvksuvSPpLCBSlVpOEFyLeQi4pjIC1jWl1GT1
```

### Step 4: Build Production

```bash
npm run build
```

This creates optimized files in `dist/` folder.

### Step 5: Upload to Hostinger

Upload entire `dist/` folder contents to `public_html/`:

```
public_html/
├── api/              ← Already there from Step 1
├── index.html        ← From dist/
├── assets/           ← From dist/
└── ...other files    ← From dist/
```

**⚠️ Important:** Don't delete the `api/` folder when uploading!

### Step 6: Verify Everything Works

1. **Visit your site:**
   ```
   https://yourdomain.com
   ```

2. **Open browser DevTools** (F12) → Network tab

3. **Navigate to a match page**

4. **Check API calls:**
   - Should see: `https://yourdomain.com/api/proxy.php?path=...`
   - Status: 200 OK
   - No CORS errors
   - No mixed content warnings

---

## ✅ Success Checklist

- [ ] Uploaded proxy.php to public_html/api/
- [ ] Uploaded test.php to public_html/api/
- [ ] Uploaded .htaccess to public_html/api/
- [ ] Tested: https://yourdomain.com/api/test.php (returns success)
- [ ] Updated .env.production with YOUR domain
- [ ] Built project: `npm run build`
- [ ] Uploaded dist/ contents to public_html/
- [ ] Visited site in browser
- [ ] Checked Network tab - no errors
- [ ] Betting odds are updating
- [ ] Live streams working

---

## 🐛 Common Issues

### Issue: "cURL is not enabled"

**Fix:**
Contact Hostinger support: "Please enable PHP cURL extension"

### Issue: "500 Internal Server Error"

**Fix:**
```bash
# Check file permissions via SSH or File Manager
chmod 644 public_html/api/proxy.php
chmod 644 public_html/api/.htaccess
```

### Issue: "Cannot read properties of undefined"

**Fix:**
Make sure you replaced `yourdomain.com` with your actual domain in `.env.production`

### Issue: "CORS policy error" still showing

**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Verify proxy.php has CORS headers (check with curl)

### Issue: "Mixed content" still showing

**Fix:**
1. Make sure `VITE_DIAMOND_API_PROTOCOL=https` in .env.production
2. Rebuild: `npm run build`
3. Re-upload dist/ folder

---

## 📞 Need Help?

1. **Test proxy first:** https://yourdomain.com/api/test.php
2. **Visual tests:** https://yourdomain.com/api/test-proxy.html
3. **Check PHP logs:** Hostinger cPanel → Error Logs
4. **Check browser console:** F12 → Console tab

---

## 🎯 What the Proxy Does

```
Your Website (HTTPS)
    ↓
✅ https://yourdomain.com/api/proxy.php?path=allSportid
    ↓
    [Server-side request - no CORS/Mixed Content issues]
    ↓
http://130.250.191.174:3009/allSportid?key=xxx
    ↓
Response with CORS headers added
    ↓
✅ Your website receives data
```

**Without Proxy:**
```
Your Website (HTTPS)
    ↓
❌ http://130.250.191.174:3009/allSportid
    ↓
🚫 BLOCKED: Mixed Content Error
🚫 BLOCKED: CORS Error
```

---

## 📚 Full Documentation

- **PROXY_DEPLOYMENT.md** - Complete deployment guide with all details
- **HOSTINGER_SETUP.md** - Hostinger-specific configurations

---

## 🎉 Done!

Once everything is working:
- ✅ API calls work from HTTPS site
- ✅ No CORS errors
- ✅ No mixed content warnings
- ✅ Real-time odds updating
- ✅ Live streams displaying
- ✅ Betting system functional

Your app is now production-ready on Hostinger! 🚀
