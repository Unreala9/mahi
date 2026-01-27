# 🚀 VPS Backend Deployment Guide

## Architecture

**Backend (VPS):** Express.js proxy server
**Frontend (Hostinger):** React app → mahiexchange.com
**Flow:** Frontend → VPS Proxy → Diamond API

---

## Part 1: Deploy Backend on VPS

### Step 1: Connect to VPS

```bash
ssh root@YOUR_VPS_IP
# Or use SSH key
ssh -i your-key.pem user@YOUR_VPS_IP
```

### Step 2: Install Node.js

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x
npm --version
```

### Step 3: Upload Backend Code

**Option A: Via Git (Recommended)**

```bash
# Install git if not present
sudo apt install git -y

# Clone repository
cd /var/www
git clone https://github.com/Unreala9/mahi.git
cd mahi/proxy-server
```

**Option B: Via SCP from your local machine**

```bash
# On your Windows machine (PowerShell)
scp -r C:\Users\shwet\OneDrive\Documents\GitHub\mahi\proxy-server root@YOUR_VPS_IP:/var/www/
```

### Step 4: Install Dependencies

```bash
cd /var/www/mahi/proxy-server
npm install --production
```

### Step 5: Configure Environment

```bash
# Create/edit .env file
nano .env
```

Add:

```env
PORT=3001
DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
NODE_ENV=production
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 6: Test Server

```bash
# Test run
node proxy-server.js
```

Should show:

```
✅ Server running on port 3001
📡 Proxying to: http://130.250.191.174:3009
```

**Test from another terminal:**

```bash
curl http://localhost:3001/allSportid
```

If working, stop with `Ctrl+C`

### Step 7: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start server with PM2
pm2 start proxy-server.js --name diamond-proxy

# Set PM2 to start on system boot
pm2 startup
pm2 save
```

**PM2 Commands:**

```bash
pm2 status              # Check status
pm2 logs diamond-proxy  # View logs
pm2 restart diamond-proxy  # Restart
pm2 stop diamond-proxy  # Stop
pm2 delete diamond-proxy  # Remove
```

### Step 8: Configure Firewall

```bash
# Allow port 3001
sudo ufw allow 3001/tcp

# Check firewall status
sudo ufw status
```

### Step 9: Test from Internet

From your Windows machine:

```powershell
curl http://YOUR_VPS_IP:3001
```

Should return proxy status!

---

## Part 2: Optional - Add Domain & SSL

### Option A: Use Domain (Recommended)

**1. Add DNS Record:**

- Go to your domain registrar
- Add A record:
  - Name: `api` (creates api.mahiexchange.com)
  - Value: `YOUR_VPS_IP`
  - TTL: 300

**2. Install Nginx:**

```bash
sudo apt install nginx -y
```

**3. Configure Nginx:**

```bash
sudo nano /etc/nginx/sites-available/api
```

Add:

```nginx
server {
    listen 80;
    server_name api.mahiexchange.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**4. Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**5. Add SSL with Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.mahiexchange.com
```

Now use: `https://api.mahiexchange.com` (no port needed!)

---

## Part 3: Deploy Frontend to Hostinger

### Step 1: Update Frontend Config

Edit `.env.production`:

**If using domain with SSL:**

```env
VITE_DIAMOND_API_HOST=api.mahiexchange.com
VITE_DIAMOND_API_PROTOCOL=https
```

**If using IP directly:**

```env
VITE_DIAMOND_API_HOST=YOUR_VPS_IP:3001
VITE_DIAMOND_API_PROTOCOL=http
```

### Step 2: Build Frontend

```bash
cd C:\Users\shwet\OneDrive\Documents\GitHub\mahi
npm run build
```

### Step 3: Upload to Hostinger

**Via File Manager:**

1. Login to Hostinger cPanel
2. File Manager → `public_html`
3. Delete old files
4. Upload entire `dist/` folder contents
5. Extract if zipped

**Via FTP:**

1. Connect with FileZilla
2. Navigate to `public_html/`
3. Upload all files from `dist/`

### Step 4: Test

Visit: https://mahiexchange.com

**Check:**

- Open DevTools (F12) → Network tab
- Navigate to a match page
- Should see requests to: `YOUR_VPS_IP:3001` or `api.mahiexchange.com`
- Status: 200 OK

---

## Security Considerations

### 1. Restrict CORS (Backend)

Edit `proxy-server/proxy-server.js`:

```javascript
app.use(
  cors({
    origin: ["https://mahiexchange.com", "https://www.mahiexchange.com"],
    credentials: true,
  }),
);
```

### 2. Add Rate Limiting

```bash
cd /var/www/mahi/proxy-server
npm install express-rate-limit
```

Edit `proxy-server.js`:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests, please try again later",
});

app.use(limiter);
```

Restart: `pm2 restart diamond-proxy`

### 3. Environment Variables

Never commit `.env` to git:

```bash
echo ".env" >> .gitignore
```

### 4. Keep Updated

```bash
# Update Node.js packages
cd /var/www/mahi/proxy-server
npm update
pm2 restart diamond-proxy

# Update system
sudo apt update && sudo apt upgrade -y
```

---

## Monitoring

### Check Server Health

```bash
# PM2 status
pm2 status

# View logs
pm2 logs diamond-proxy --lines 100

# Server resources
htop  # Install: sudo apt install htop
```

### Monitor Requests

Add logging to `proxy-server.js`:

```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

View logs:

```bash
pm2 logs diamond-proxy
```

---

## Troubleshooting

### Backend not accessible from internet

**Check firewall:**

```bash
sudo ufw status
sudo ufw allow 3001/tcp
```

**Check if server is running:**

```bash
pm2 status
pm2 logs diamond-proxy
```

**Check port binding:**

```bash
netstat -tulpn | grep 3001
```

### Frontend can't connect to backend

**CORS Error:**

- Make sure backend CORS allows your domain
- Check `Access-Control-Allow-Origin` header

**Mixed Content Error:**

- If Hostinger uses HTTPS, VPS must use HTTPS too
- Add SSL certificate with Nginx + Let's Encrypt

### High latency

**Optimize:**

1. Use CDN for frontend
2. Enable gzip compression in Nginx
3. Use PM2 cluster mode:
   ```bash
   pm2 start proxy-server.js -i max --name diamond-proxy
   ```

---

## Quick Commands Reference

```bash
# Backend VPS
pm2 status                    # Check server
pm2 logs diamond-proxy        # View logs
pm2 restart diamond-proxy     # Restart
sudo systemctl restart nginx  # Restart Nginx

# Test from VPS
curl http://localhost:3001/allSportid

# Test from internet
curl http://YOUR_VPS_IP:3001
curl http://api.mahiexchange.com  # If using domain

# Update code
cd /var/www/mahi
git pull origin shwet
cd proxy-server
npm install
pm2 restart diamond-proxy
```

---

## Backup Strategy

### Backend

```bash
# Backup script
tar -czf /root/backup-$(date +%Y%m%d).tar.gz /var/www/mahi/proxy-server
```

### Database (if added later)

```bash
# MongoDB example
mongodump --out /root/backup-$(date +%Y%m%d)
```

---

## Cost Estimation

**VPS Options:**

- DigitalOcean Droplet: $6/month (1GB RAM)
- Linode Nanode: $5/month (1GB RAM)
- Vultr: $6/month (1GB RAM)
- Hostinger VPS: $4.99/month

**Hostinger Business:** Already have it

**Total:** ~$5-10/month

---

## Next Steps

1. ✅ Get VPS (DigitalOcean, Linode, etc.)
2. ✅ Follow Part 1: Deploy Backend
3. ✅ Test backend: `curl http://YOUR_VPS_IP:3001`
4. ✅ Update `.env.production` with VPS IP/domain
5. ✅ Build frontend: `npm run build`
6. ✅ Upload to Hostinger
7. ✅ Test: https://mahiexchange.com

**Optional but recommended:**

- Add domain: `api.mahiexchange.com`
- Add SSL certificate (free with Let's Encrypt)
- Enable monitoring

---

Your setup will be:

```
User Browser (HTTPS)
    ↓
mahiexchange.com (Hostinger)
    ↓
api.mahiexchange.com (VPS) or YOUR_VPS_IP:3001
    ↓
Diamond API (130.250.191.174:3009)
```

Fast, secure, and scalable! 🚀