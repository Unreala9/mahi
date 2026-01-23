# Hostinger Deployment Guide

## Prerequisites
Your app is built and ready in the `dist` folder after running:
```bash
npm run build
```

## Step 1: Upload Files to Hostinger

1. Log in to Hostinger control panel
2. Go to **File Manager** or use **FTP**
3. Navigate to `public_html` folder
4. Upload ALL files from the `dist` folder (not the dist folder itself)
5. Upload the `.htaccess` file to `public_html`

## Step 2: .htaccess Configuration

The `.htaccess` file in your project root should be uploaded to enable:
- API proxy to Diamond API server
- CORS headers
- Client-side routing for React
- Asset caching and compression

**Important:** Make sure your Hostinger plan supports `.htaccess` and `mod_rewrite`

## Step 3: Check Apache Modules (if proxy doesn't work)

If the API proxy doesn't work, you might need to contact Hostinger support to enable:
- `mod_rewrite`
- `mod_proxy`
- `mod_proxy_http`

## Alternative: Direct API Configuration

If Hostinger doesn't support proxy, you can configure direct API access:

1. Before building, update `.env.production`:
```
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=http
```

2. Rebuild the project:
```bash
npm run build
```

3. Upload the new `dist` folder to Hostinger

**Note:** Direct API access might have CORS issues. The proxy method is preferred.

## Step 4: Environment Variables

Hostinger doesn't have a built-in environment variable system like Vercel/Netlify.
All environment variables must be set in `.env.production` BEFORE building.

## Step 5: Build Commands for Hostinger

```bash
# Build for production
npm run build

# The dist folder will contain all files ready for Hostinger
# Upload the contents of dist/ (not the dist folder itself) to public_html/
```

## Step 6: Test Your Deployment

1. Visit your Hostinger domain
2. Go to `/api-test` page
3. Click "Run All Tests"
4. Check if API calls are working

## Troubleshooting

### Issue: API calls fail with 404
- Check if `.htaccess` is uploaded to `public_html`
- Verify `mod_rewrite` is enabled
- Contact Hostinger support to enable Apache proxy modules

### Issue: React Router shows 404 on refresh
- Make sure `.htaccess` is in `public_html`
- The rewrite rules handle client-side routing

### Issue: Assets not loading
- Check that all files from `dist/` are in `public_html`
- Check file permissions (should be 644 for files, 755 for folders)

### Issue: API returns CORS errors
- The `.htaccess` includes CORS headers
- If still failing, use direct API configuration method above

## Support

If you continue to have issues:
1. Check the `/api-test` page for detailed diagnostics
2. Contact Hostinger support about enabling Apache proxy modules
3. Consider using direct API access method (with CORS configured on API server)
