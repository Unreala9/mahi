# Hostinger Deployment Guide

This guide explains how to deploy your application to Hostinger with the proxy configuration to handle the HTTP Diamond API from your HTTPS website.

## 🎯 Problem We're Solving

Your website will be hosted on HTTPS (Hostinger), but the Diamond API is HTTP-only. Browsers block HTTP requests from HTTPS pages (mixed content). We need a proxy to securely forward requests.

## 📋 Prerequisites

- Hostinger account with hosting plan
- Node.js support (for Option 1) OR Apache with mod_proxy (for Option 2)
- Your built React application (`npm run build`)

---

## 🚀 Deployment Options

You have **3 options** for deploying to Hostinger. Choose the one that works best for your hosting plan.

### Option 1: Node.js Proxy Server (Recommended)

**Best for:** Hostinger plans with Node.js support

#### Step 1: Install Dependencies

Add these to your `package.json` if not already present:

```bash
npm install express cors node-fetch@2
```

#### Step 2: Update package.json Scripts

Add this script to `package.json`:

```json
{
  "scripts": {
    "start:proxy": "node proxy-server.js",
    "build": "vite build"
  }
}
```

#### Step 3: Build Your Application

```bash
npm run build
```

This creates a `dist` folder with your production files.

#### Step 4: Upload to Hostinger

1. **Via File Manager or FTP:**
   - Upload the entire `dist` folder contents to `public_html`
   - Upload `proxy-server.js` to your root directory
   - Upload `package.json` to your root directory

2. **Install dependencies on Hostinger:**
   - SSH into your Hostinger account
   - Run: `npm install --production`

#### Step 5: Configure Environment Variables

Create a `.env` file on Hostinger:

```env
PORT=3000
DIAMOND_API_BASE=http://130.250.191.174:3009
DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
FRONTEND_URL=https://yourdomain.com
```

#### Step 6: Start the Proxy Server

In Hostinger's Node.js application settings:
- Set **Application Root**: `/`
- Set **Application URL**: `https://yourdomain.com`
- Set **Application Startup File**: `proxy-server.js`
- Click **Start Application**

#### Step 7: Update Your Frontend URL

In your frontend code (`.env` on Hostinger), ensure:

```env
VITE_DIAMOND_API_HOST=/api/diamond
VITE_DIAMOND_API_PROTOCOL=
```

---

### Option 2: Apache .htaccess Proxy (Simple)

**Best for:** Shared hosting plans without Node.js

> [!WARNING]
> This requires Apache's `mod_proxy` module. Contact Hostinger support to enable it if not available.

#### Step 1: Build Your Application

```bash
npm run build
```

#### Step 2: Upload Files

Upload the contents of the `dist` folder to `public_html` on Hostinger.

#### Step 3: Upload .htaccess

Upload the `.htaccess` file to `public_html`. This file contains:
- Proxy rules for `/api/diamond/*` requests
- CORS headers
- SPA routing fallback
- Security and caching rules

#### Step 4: Test

Visit your Hostinger URL. The `.htaccess` will automatically proxy API requests.

---

### Option 3: Cloudflare Workers (Advanced)

**Best for:** Maximum reliability and global CDN

#### Step 1: Set up Cloudflare

1. Add your domain to Cloudflare
2. Update nameservers on Hostinger to Cloudflare's

#### Step 2: Create a Worker

In Cloudflare Dashboard → Workers:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Proxy API requests
  if (url.pathname.startsWith('/api/diamond/')) {
    const apiPath = url.pathname.replace('/api/diamond', '')
    const targetUrl = `http://130.250.191.174:3009${apiPath}${url.search}`
    
    const apiRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
    
    const response = await fetch(apiRequest)
    
    // Add CORS headers
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    
    return newResponse
  }
  
  // Serve static files from Hostinger
  return fetch(request)
}
```

#### Step 3: Deploy

1. Deploy the worker
2. Add a route: `yourdomain.com/api/diamond/*`
3. Upload your `dist` folder to Hostinger as usual

---

## 🧪 Testing Your Deployment

### 1. Test the Proxy Endpoint

```bash
curl https://yourdomain.com/api/diamond/tree?key=mahi4449839dbabkadbakwq1qqd
```

You should get a JSON response from the Diamond API.

### 2. Test the Website

1. Visit `https://yourdomain.com`
2. Open browser DevTools → Network tab
3. Check that API requests to `/api/diamond/*` return data
4. Verify no mixed content errors in Console

### 3. Test Real-time Features

- Check if sports betting odds update
- Verify casino games load
- Test WebSocket connections (if applicable)

---

## 🔧 Troubleshooting

### Issue: "502 Bad Gateway" or Proxy Errors

**Solution:**
- Verify the Diamond API is accessible: `curl http://130.250.191.174:3009/tree?key=YOUR_KEY`
- Check proxy server logs on Hostinger
- Ensure firewall allows outbound HTTP requests

### Issue: CORS Errors

**Solution:**
- Verify CORS headers are set in proxy response
- Check that `FRONTEND_URL` matches your domain
- Clear browser cache

### Issue: 404 on Page Refresh

**Solution:**
- Ensure `.htaccess` has SPA routing rules
- Or configure Hostinger to serve `index.html` for all routes

### Issue: API Key Not Working

**Solution:**
- Verify environment variables are set correctly
- Check that API key is being appended to requests
- Test API key directly: `curl http://130.250.191.174:3009/tree?key=YOUR_KEY`

---

## 📊 Performance Optimization

### Enable Caching

Add to your proxy server:

```javascript
// Cache API responses for 30 seconds
const CACHE_DURATION = 30;
```

### Use CDN

- Enable Cloudflare CDN for static assets
- Cache `/api/diamond/*` responses with short TTL

### Monitor Performance

- Use Hostinger's built-in analytics
- Set up uptime monitoring (e.g., UptimeRobot)

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit API keys to Git
2. **Rate Limiting**: Add rate limiting to proxy server
3. **HTTPS Only**: Enforce HTTPS redirects in `.htaccess`
4. **API Key Rotation**: Regularly update your Diamond API key
5. **CORS**: Restrict CORS to your domain only (not `*`)

---

## 📝 Quick Reference

### File Locations on Hostinger

```
/
├── public_html/           # Your built React app (dist folder)
│   ├── index.html
│   ├── assets/
│   └── .htaccess          # Apache proxy config
├── proxy-server.js        # Node.js proxy (if using Option 1)
├── package.json
├── .env                   # Environment variables
└── node_modules/          # Dependencies (if using Option 1)
```

### Environment Variables

```env
# Production .env on Hostinger
VITE_DIAMOND_API_HOST=/api/diamond
VITE_DIAMOND_API_PROTOCOL=
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd

# Proxy server .env (if using Node.js)
PORT=3000
DIAMOND_API_BASE=http://130.250.191.174:3009
DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
FRONTEND_URL=https://yourdomain.com
```

---

## 🆘 Need Help?

1. **Hostinger Support**: Contact for mod_proxy or Node.js setup
2. **Test Locally First**: Use `npm run build && npm run preview` to test production build
3. **Check Logs**: Review Hostinger error logs for detailed error messages

---

## ✅ Deployment Checklist

- [ ] Build application: `npm run build`
- [ ] Upload `dist` folder to `public_html`
- [ ] Choose and configure proxy method (Option 1, 2, or 3)
- [ ] Set environment variables
- [ ] Upload `.htaccess` or start proxy server
- [ ] Test proxy endpoint with curl
- [ ] Test website in browser
- [ ] Verify API data loads correctly
- [ ] Check for mixed content errors
- [ ] Test on mobile devices
- [ ] Set up monitoring and backups

---

**🎉 Once deployed, your website will work seamlessly on HTTPS with the HTTP Diamond API!**
