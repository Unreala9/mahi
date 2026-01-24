# Hostinger Deployment with SSL

## Problem
HTTPS website (with SSL) cannot make HTTP API calls due to:
- **Mixed Content**: Browser blocks HTTP requests from HTTPS sites
- **CORS**: Cross-origin requests need proper headers

## Solutions for Hostinger

### Solution 1: PHP Backend Proxy (Recommended for Hostinger)

Create a simple PHP proxy on your Hostinger server:

**1. Create `/api/proxy.php` in your public_html:**

```php
<?php
// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the target URL from query parameter
$path = isset($_GET['path']) ? $_GET['path'] : '';
$key = 'mahi4449839dbabkadbakwq1qqd';

// Build target URL
$targetUrl = "http://130.250.191.174:3009/{$path}";

// Add query parameters
if (!empty($_SERVER['QUERY_STRING'])) {
    $queryString = $_SERVER['QUERY_STRING'];
    // Remove 'path' parameter
    $queryString = preg_replace('/&?path=[^&]*/', '', $queryString);
    $queryString = ltrim($queryString, '&');
    
    if (!empty($queryString)) {
        $targetUrl .= (strpos($targetUrl, '?') !== false ? '&' : '?') . $queryString;
    }
}

// Add API key if not already present
if (strpos($targetUrl, 'key=') === false) {
    $targetUrl .= (strpos($targetUrl, '?') !== false ? '&' : '?') . "key={$key}";
}

// Initialize cURL
$ch = curl_init($targetUrl);

// Set options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Forward request method and body for POST/PUT
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
    $postData = file_get_contents('php://input');
    if (!empty($postData)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
}

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Return response
http_response_code($httpCode);
echo $response;
?>
```

**2. Update Environment Variables:**

```env
# Use your Hostinger domain with PHP proxy
VITE_DIAMOND_API_HOST=yourdomain.com/api/proxy.php
VITE_DIAMOND_API_PROTOCOL=https
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
```

**3. Update API Services:**

The services will automatically use the proxy if you set the host to your domain.

---

### Solution 2: Node.js Backend Proxy

If you have Node.js support on Hostinger:

**1. Create `server.js`:**

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = 'mahi4449839dbabkadbakwq1qqd';
const DIAMOND_API = 'http://130.250.191.174:3009';

app.use(cors());
app.use(express.json());

// Proxy all requests
app.all('/api/diamond/*', async (req, res) => {
  try {
    const path = req.params[0];
    let url = `${DIAMOND_API}/${path}`;
    
    // Add query parameters
    const queryParams = new URLSearchParams(req.query);
    if (!queryParams.has('key')) {
      queryParams.append('key', API_KEY);
    }
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
```

**2. Deploy to Hostinger:**
- Upload via FTP or Git
- Configure Node.js application in Hostinger control panel
- Set environment variables

---

### Solution 3: .htaccess Rewrite (If supported)

**Create/Update `.htaccess`:**

```apache
# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Proxy rules (if mod_proxy is enabled)
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyPass /api/diamond http://130.250.191.174:3009
    ProxyPassReverse /api/diamond http://130.250.191.174:3009
</IfModule>
```

**Note:** Most shared hosting doesn't allow mod_proxy. Use PHP solution instead.

---

### Solution 4: Cloudflare Workers (Alternative)

If Hostinger doesn't work, use free Cloudflare Workers:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetPath = url.pathname.replace('/api/diamond/', '')
  const targetUrl = `http://130.250.191.174:3009/${targetPath}${url.search}`
  
  // Add API key if not present
  const targetUrlObj = new URL(targetUrl)
  if (!targetUrlObj.searchParams.has('key')) {
    targetUrlObj.searchParams.append('key', 'mahi4449839dbabkadbakwq1qqd')
  }
  
  const modifiedRequest = new Request(targetUrlObj.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body
  })
  
  const response = await fetch(modifiedRequest)
  const modifiedResponse = new Response(response.body, response)
  
  // Add CORS headers
  modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
  modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  
  return modifiedResponse
}
```

Deploy on Cloudflare Workers and use the worker URL as your API host.

---

## Quick Setup Steps (PHP Method)

1. **Upload `proxy.php` to Hostinger:**
   ```
   public_html/api/proxy.php
   ```

2. **Test the proxy:**
   ```
   https://yourdomain.com/api/proxy.php?path=allSportid
   ```

3. **Update `.env.production`:**
   ```env
   VITE_DIAMOND_API_HOST=yourdomain.com/api/proxy.php
   VITE_DIAMOND_API_PROTOCOL=https
   ```

4. **Build and deploy:**
   ```bash
   npm run build
   ```
   Upload `dist` folder to Hostinger

5. **Update services to use proxy:**

The services are already configured to handle this. When `API_HOST` contains your domain, it will use `https://yourdomain.com/api/proxy.php` as the base URL.

---

## Testing

**Test proxy directly:**
```bash
curl https://yourdomain.com/api/proxy.php?path=allSportid
```

**Check in browser:**
Open DevTools → Network tab → Verify:
- All API calls go to `yourdomain.com/api/proxy.php`
- Response has CORS headers
- No mixed content warnings

---

## Troubleshooting

**500 Error?**
- Check PHP error logs in Hostinger control panel
- Verify cURL is enabled: `php -m | grep curl`
- Check file permissions: `chmod 644 proxy.php`

**CORS Still Blocked?**
- Verify `Access-Control-Allow-Origin: *` in response headers
- Clear browser cache
- Try different browser

**Slow Response?**
- The proxy adds ~100-200ms latency
- Use caching in proxy.php for frequent requests
- Consider upgrading Hostinger plan

---

## Alternative: Ask API Provider

Contact Diamond API support:
- Request HTTPS endpoint
- Request CORS headers enabled
- This would eliminate need for proxy

---

Choose PHP proxy method - it's easiest for Hostinger shared hosting! 🎯
