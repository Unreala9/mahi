# Quick VPS Deployment Commands

# Save these commands - you'll run them on your VPS

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 3. Verify installation
node --version
npm --version

# 4. Create directory
sudo mkdir -p /var/www
cd /var/www

# 5. Clone your repository
sudo git clone https://github.com/Unreala9/mahi.git
cd mahi/proxy-server

# 6. Install dependencies
sudo npm install --production

# 7. Create environment file
sudo nano .env
# Add these lines:
# PORT=3001
# DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
# NODE_ENV=production
# Save: Ctrl+X, Y, Enter

# 8. Test server
node proxy-server.js
# Should show: ✅ Server running on port 3001
# Press Ctrl+C to stop

# 9. Install PM2
sudo npm install -g pm2

# 10. Start with PM2
pm2 start proxy-server.js --name diamond-proxy

# 11. Setup auto-start
pm2 startup
pm2 save

# 12. Configure firewall
sudo ufw allow 3001/tcp
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 13. Check status
pm2 status
pm2 logs diamond-proxy

# Done! Test from your PC:
# curl http://YOUR_VPS_IP:3001
