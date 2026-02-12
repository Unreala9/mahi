# Hostinger Deployment Guide

Complete guide to deploy Mahi Exchange on Hostinger hosting.

## 📋 Pre-Deployment Checklist

- [x] Icons added to git (69 sport icons)
- [x] Production build working (`npm run build`)
- [x] Environment variables configured
- [x] .htaccess file created for routing
- [ ] Domain configured on Hostinger
- [ ] Upload dist folder to Hostinger

## 🔧 Step 1: Build for Production

```powershell
# Make sure you're in the project directory
cd C:\Users\shwet\OneDrive\Documents\GitHub\mahi

# Build the project
npm run build
```

This creates the `dist` folder with all files including:

- ✅ Icons (69 sport SVG files)
- ✅ Optimized JavaScript bundles
- ✅ CSS files
- ✅ index.html
- ✅ .htaccess for routing

## 📤 Step 2: Upload to Hostinger

### Option A: File Manager (Web Interface)

1. **Login to Hostinger Control Panel**
   - Go to: https://hpanel.hostinger.com
   - Login with your credentials

2. **Navigate to File Manager**
   - Click on "File Manager" in your hosting panel
   - Navigate to `public_html` folder

3. **Clear Existing Files (if any)**
   - Select all files in `public_html`
   - Delete them (or backup first)

4. **Upload dist folder contents**
   - Click "Upload" button
   - Select ALL files from your local `dist` folder
   - Upload everything INCLUDING:
     - `index.html`
     - `assets/` folder
     - `icons/` folder (with all sports icons)
     - `.htaccess` file
     - `robots.txt`
     - `casino.json`
     - Any other files

5. **Wait for upload to complete**
   - Large files may take time
   - Don't close the window until 100% complete

### Option B: FTP Upload (Faster for Large Sites)

1. **Get FTP Credentials from Hostinger**
   - In Hostinger panel, go to "FTP Accounts"
   - Note down:
     - FTP Host: `ftp.yourdomain.com`
     - Username: Usually your domain or custom username
     - Password: Set or retrieve from panel

2. **Use FileZilla or Any FTP Client**

   ```
   Host: ftp.yourdomain.com
   Username: [from Hostinger]
   Password: [from Hostinger]
   Port: 21
   ```

3. **Upload dist folder contents**
   - Connect via FTP
   - Navigate to `public_html` on right side
   - Select all files from `dist` folder on left side
   - Right click → Upload
   - Wait for completion

## 🌐 Step 3: Configure Domain Settings

### A. If using primary domain (e.g., mahiexchange.com)

Files should be in: `public_html/`

### B. If using subdomain (e.g., app.mahiexchange.com)

1. Create subdomain in Hostinger
2. Point subdomain to folder (e.g., `public_html/app/`)
3. Upload files to that folder

## 🔐 Step 4: Environment Variables & API Configuration

### Production API Setup

**Important:** Hostinger uses **PHP proxies** to handle API calls (no Vercel rewrites).

**Your production setup includes:**

1. **`.env.production`** (already configured):

```env
# Diamond API - Via PHP Proxy
VITE_DIAMOND_API_HOST=/api/diamond
VITE_DIAMOND_API_PROTOCOL=
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd

# Results API - Via PHP Proxy
VITE_RESULTS_API_URL=/api/results
VITE_RESULTS_API_KEY=knqkdkqndkqn
VITE_RESULTS_CLIENT_REF=mahi_client
```

2. **PHP Proxy Files** (already in `dist/` after build):
   - `dist/api/diamond/index.php` - Proxies Diamond API calls
   - `dist/api/results/index.php` - Proxies Results API calls

3. **`.htaccess`** (already in `dist/` after build):
   - Routes `/api/diamond/*` to PHP proxy
   - Routes `/api/results/*` to PHP proxy
   - Handles React Router (SPA routing)

**✅ No manual configuration needed - just upload `dist/` folder!**

## ✅ Step 5: Verify Deployment

1. **Visit your domain**
   - Go to: `https://yourdomain.com`
   - Check if site loads

2. **Test sport icons**
   - Navigate to Sportsbook section
   - Icons should show for Cricket, Football, Tennis, etc.
   - If not showing, check browser console for errors

3. **Test routing**
   - Click various pages
   - Use browser back/forward buttons
   - Refresh on different pages
   - All should work without 404 errors

4. **Check browser console**
   - Press F12
   - Look for any errors
   - Especially check icon loading

5. **Test PHP proxies (IMPORTANT!)**

   ```bash
   # Test Diamond API proxy
   curl https://yourdomain.com/api/diamond/casino/result?type=dt20&key=mahi4449839dbabkadbakwq1qqd

   # Test Results API proxy
   curl https://yourdomain.com/api/results/get-result
   ```

   Both should return JSON responses (not errors)

6. **Test casino results**
   - Place a casino bet
   - Wait for round to complete
   - Click "Settle" button on Bets page
   - Verify bet settles correctly

## 🐛 Troubleshooting

### Icons not showing

**Check 1: Are icons uploaded?**

```
Visit: https://yourdomain.com/icons/sports/cricket.svg
```

Should show the cricket icon SVG.

**Check 2: Browser console errors**

- Open DevTools (F12)
- Check Console tab
- Look for 404 errors on icon files

**Check 3: File permissions**

- In Hostinger File Manager
- Right-click on `icons` folder
- Change Permissions → Set to 755

### React Router not working (404 on page refresh)

**Solution:** Make sure `.htaccess` file is uploaded

```bash
# Check if .htaccess exists in public_html
ls -la public_html/.htaccess
```

If missing:

1. Upload `.htaccess` from dist folder
2. Make sure it's in root of public_html
3. File name must start with dot: `.htaccess`

### API calPHP proxies uploaded\*\*

Verify these files exist:

```
public_html/api/diamond/index.php
public_html/api/results/index.php
```

If missing, upload from `dist/api/` folder.

**Check 2: .htaccess routes**

Open `public_html/.htaccess` and verify these lines exist:

```apache
RewriteRule ^api/diamond/(.*)$ api/diamond/index.php [QSA,L]
RewriteRule ^api/results/(.*)$ api/results/index.php [QSA,L]
```

**Check 3: PHP version**

- Hostinger panel → PHP Settings
- Ensure PHP 7.4 or higher is enabled
- cURL extension must be enabled

**Check 4: Test proxies directly**

Visit in browser:

```
https://yourdomain.com/api/diamond/casino/result?type=dt20&key=mahi4449839dbabkadbakwq1qqd
```

Should see JSON response, not "404" or "Forbidden"

\*\*Check 5: ls failing

**Check 1: CORS issues**

- Open browser console
- Look for CORS errors
- May need to configure API server to allow your domain

**Check 2: API URLs**

- Make sure `.env.production` has correct URLs
- Rebuild after changing: `npm run build`

### SSL/HTTPS issues

**In Hostinger Panel:**

1. Go to "SSL" section
2. Enable free SSL certificate
3. Wait 5-10 minutes for activation
4. Enable "Force HTTPS" option

## 🚀 Quick Deployment Script

Create `deploy-hostinger.ps1`:

```powershell
# Quick deployment script for Hostinger

Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Next steps:" -ForegroundColor Yellow
Write-Host "1. Login to Hostinger: https://hpanel.hostinger.com"
Write-Host "2. Go to File Manager → public_html"
Write-Host "3. Delete old files (backup first if needed)"
Write-Host "4. Upload ALL files from 'dist' folder"
Write-Host "5. Make sure .htaccess is uploaded"
Write-Host "6. Visit your domain to verify"
Write-Host ""
Write-Host "✨ Files ready in: dist/" -ForegroundColor Cyan
explorer dist
```

## 📁 What Gets Uploaded

Your `dist` folder should contain:

```
dist/
├── index.html           ← Main HTML file
├── .htaccess           ← Routing configuration (IMPORTANT!)
├── robots.txt          ← SEO
├── casino.json         ← Casino games data
├── assets/             ← CSS & JS bundles
│   ├── index-[hash].css
│   └── index-[hash].js
├── api/                ← PHP Proxy Scripts (IMPORTANT!)
│   ├── diamond/
│   │   └── index.php   ← Diamond API proxy
│   └── results/
│       └── index.php   ← Results API proxy
├── icons/              ← Sport icons (IMPORTANT!)
│   └── sports/
│       ├── cricket.svg
│       ├── football.svg
│       ├── tennis.svg
│       └── ... (69 total)
├── images/             ← Other images
└── [other files]
```

## 🎯 Post-Deployment

### Update DNS (if needed)

- Point domain A record to Hostinger server IP
- Wait for DNS propagation (up to 24 hours)
- Use https://dnschecker.org to verify

### Enable CDN (Optional)

Hostinger may offer Cloudflare CDN integration:

1. Enable in Hostinger panel
2. Improves global speed
3. Adds DDoS protection

### Monitoring

- Set up Hostinger analytics
- Monitor site uptime
- Check error logs regularly

## 🔄 Future Updates

To update the site:

1. Make changes in code
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Upload new `dist` folder contents to Hostinger
5. Clear browser cache to see changes

## 📞 Support

**Hostinger Support:**

- Live Chat: Available in hPanel
- Email: support@hostinger.com
- Knowledge Base: https://support.hostinger.com

**Common Issues:**

- File permissions: Set folders to 755, files to 644
- PHP version: Not needed (static React site)
- .htaccess: Must be in root of public_html

---

**Ready to deploy? Run the build and start uploading!** 🚀
