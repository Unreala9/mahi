# Production Deployment Guide

## Domain Information

**Production URL:** https://mahiexchange.com

## Prerequisites

- Node.js 18+ installed
- Access to Hostinger hosting account
- Domain: mahiexchange.com (configured and pointing to Hostinger)

## Environment Variables Setup

Create a `.env.production` file with the following:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Diamond API Configuration
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=http
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
```

## Building for Production

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

## Hostinger Deployment

### Option 1: Direct Upload (Recommended)

1. Build the project locally: `npm run build`
2. Upload contents of `dist` folder to your Hostinger public_html directory
3. Configure `.htaccess` for SPA routing (see below)

### Option 2: Git Deployment

1. Push code to GitHub
2. Use Hostinger's Git deployment feature
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## Apache .htaccess Configuration

Create/update `.htaccess` in your public_html directory:

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Serve existing files/directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Route all other requests to index.html
  RewriteRule . /index.html [L]
</IfModule>

# Enable CORS for API requests
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Enable Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>
```

## Important Notes

### API CORS Issues

The Diamond API runs on HTTP (not HTTPS) which may cause mixed content issues when your site runs on HTTPS.

**Solutions:**

1. **Server-side Proxy (Recommended)**: Create a PHP proxy on Hostinger
2. **Use direct HTTP**: May trigger browser security warnings
3. **Contact API provider**: Request HTTPS support

### PHP Proxy Setup (if needed)

Create `api/diamond-proxy.php` in your public_html:

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$apiHost = '130.250.191.174:3009';
$path = isset($_GET['path']) ? $_GET['path'] : '';
$query = isset($_GET['query']) ? $_GET['query'] : '';

$url = "http://{$apiHost}/{$path}";
if ($query) {
    $url .= "?{$query}";
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Accept: */*'
));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
?>
```

Then update environment variable:

```env
VITE_DIAMOND_API_HOST=/api/diamond-proxy.php
```

## Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] Sports data displays
- [ ] Casino games load with images
- [ ] Odds update in real-time
- [ ] User authentication works
- [ ] Payment integration functional
- [ ] All routes work (no 404s)
- [ ] Console shows no critical errors
- [ ] Mobile responsive design works
- [ ] Performance is acceptable

## Troubleshooting

### "Failed to fetch" errors

- Check API host configuration
- Verify CORS headers
- Consider PHP proxy solution

### Images not loading

- Verify `VITE_CASINO_IMAGE_BASE` is set correctly
- Check image URLs in browser console
- Ensure API endpoint is accessible

### Blank page after deployment

- Check browser console for errors
- Verify `.htaccess` is configured
- Ensure all environment variables are set

### Slow loading

- Enable Gzip compression
- Configure caching headers
- Optimize images
- Use CDN for static assets

## Support

For issues related to:

- **Hosting**: Contact Hostinger support
- **Diamond API**: Contact API provider
- **Supabase**: Check Supabase dashboard and logs
