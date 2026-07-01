# Oracle Cloud Deployment Guide for Speedtest API

Production deployment guide for **AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights**.

This project contains:

```text
AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/
├── client/   # React/Vite frontend
└── server/   # Node/Express/Swagger backend
```

## Target Architecture

```text
Internet Users
   ↓
Oracle Cloud Public IP
   ↓
Nginx
   ├── /        → React frontend from client/dist
   └── /api     → Node/Express backend on localhost:5000
```

The app will be available publicly using the Oracle Cloud instance public IP for now. A domain and HTTPS can be added later.

---

## 1. Required Config Changes Before Deployment

### 1.1 Frontend Production Environment

Your current frontend environment file is:

```text
client/.env
```

Current development value:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=****
VITE_SUPABASE_ANON_KEY=****
```

For production, create:

```text
client/.env.production
```

Add:

```env
VITE_API_BASE_URL=http://YOUR_ORACLE_PUBLIC_IP/api
VITE_SUPABASE_URL=****
VITE_SUPABASE_ANON_KEY=****
```

Example:

```env
VITE_API_BASE_URL=http://129.159.xx.xx/api
```

Later, when using a domain:

```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

> Do not commit real secrets to GitHub if your repository is public.

---

### 1.2 Backend Production Environment

Your backend environment file is currently inside:

```text
server/src/.env
```

For production, use:

```text
server/.env.production
```

Add:

```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=****
SUPABASE_ANON_KEY=****
SUPABASE_SERVICE_ROLE_KEY=****
GEMINI_API_KEY=****

# Set to 'true' when you add HTTPS later
USE_HTTPS=false
```

If your backend only uses `SUPABASE_URL` and `GEMINI_API_KEY`, keep only those.

---

### 1.3 Backend Dotenv Config

In your Express entry file, usually one of these:

```text
server/src/index.js
server/src/server.js
```

If using ES Modules:

```js
import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production"
    ? ".env.production"
    : "src/.env"
});
```

If using CommonJS:

```js
require("dotenv").config({
  path: process.env.NODE_ENV === "production"
    ? ".env.production"
    : "src/.env"
});
```

---

### 1.4 Backend CORS Config

Allow your Oracle public IP frontend.

```js
import cors from "cors";

const allowedOrigins = [
  "http://YOUR_ORACLE_PUBLIC_IP",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

Later, when you add a domain:

```js
const allowedOrigins = [
  "http://YOUR_ORACLE_PUBLIC_IP",
  "https://yourdomain.com"
];
```

For temporary testing only:

```js
app.use(cors());
```

Avoid open CORS in production long term.

---

### 1.5 Express Listen Config

Make sure your backend listens on `0.0.0.0`:

```js
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 2. Create Oracle Cloud Instance

Recommended instance:

```text
OS: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS
Shape: VM.Standard.E2.1.Micro or better
RAM: 1GB minimum, 2GB+ preferred
Public IP: Yes
```

For a real speedtest tool, use at least:

```text
2 vCPU
2GB RAM
```

Low-resource free-tier VMs may bottleneck speedtest results.

---

## 3. Open Firewall Ports in Oracle Cloud

In Oracle Cloud Console:

```text
Virtual Cloud Network
→ Security Lists
→ Ingress Rules
```

Add these ingress rules:

```text
TCP 22     source 0.0.0.0/0
TCP 80     source 0.0.0.0/0
TCP 443    source 0.0.0.0/0
TCP 5000   source YOUR_IP_ONLY, optional for debugging
```

> Production note: do not expose port `5000` publicly. Nginx will proxy to it internally.

---

## 4. SSH Into the Oracle VM

Using a private key (recommended):

```bash
ssh -i /path/to/private-key ubuntu@YOUR_ORACLE_PUBLIC_IP
```

Alternatively, if no key is needed (not recommended):

```bash
ssh ubuntu@YOUR_ORACLE_PUBLIC_IP
```

---

## 5. Update Server Packages

```bash
sudo apt update && sudo apt upgrade -y
```

Install required packages:

```bash
sudo apt install -y git nginx curl ufw unzip build-essential
```

---

## 6. Install Node.js 20+ LTS (22 recommended)

```bash
# Node 22 (recommended)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# OR Node 20 LTS (also works perfectly)
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt install -y nodejs
```

Verify:

```bash
node -v
npm -v
```

You should see Node `20.x` or `22.x`. The code works on any Node 20+ because we disabled realtime to avoid WebSocket dependency issues.

---

## 7. Install PM2

PM2 keeps the backend running in the background.

```bash
sudo npm install -g pm2
```

Verify:

```bash
pm2 -v
```

---

## 8. Clone the GitHub Repo on the VM

```bash
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www
cd /var/www
```

Clone your repo:

```bash
git clone https://github.com/ClementPhoshoko/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights.git
```

Enter project directory:

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights
```

Checkout `main`:

```bash
git checkout main
```

---

## 9. Install Backend Dependencies

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/server
npm install
```

If your backend has a build step:

```bash
npm run build
```

If it is plain JavaScript, skip the build step.

---

## 10. Create Backend Production Env File

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/server
nano .env.production
```

Paste:

```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_key
```

Save in nano:

```text
CTRL + O
Enter
CTRL + X
```

Secure the file:

```bash
chmod 600 .env.production
```

---

## 11. Start Backend With PM2

Check backend scripts:

```bash
cat package.json
```

If it has:

```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

Run:

```bash
NODE_ENV=production pm2 start npm --name speedtest-api -- start
```

If your entry file is direct, for example `src/server.js`, run:

```bash
NODE_ENV=production pm2 start src/server.js --name speedtest-api
```

Save PM2 process:

```bash
pm2 save
```

Enable PM2 startup after reboot:

```bash
pm2 startup
```

PM2 will print a command. Copy and run it. It will look similar to:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Then run:

```bash
pm2 save
```

Check status and logs:

```bash
pm2 status
pm2 logs speedtest-api
```

Test backend locally on the VM:

```bash
curl http://localhost:5000
```

If Swagger is at `/api-docs`:

```bash
curl http://localhost:5000/api-docs
```

---

## 12. Build React Frontend

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/client
npm install
```

Create production env:

```bash
nano .env.production
```

Paste:

```env
VITE_API_BASE_URL=http://YOUR_ORACLE_PUBLIC_IP/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Build:

```bash
npm run build
```

This should create:

```text
client/dist/
```

---

## 13. Configure Nginx

Create Nginx config:

```bash
sudo nano /etc/nginx/sites-available/speedtest
```

Paste:

```nginx
server {
    listen 80;
    server_name _;

    client_max_body_size 500M;

    root /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/client/dist;
    index index.html;

    # ---------------------------
    # FRONTEND (React SPA)
    # ---------------------------
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ---------------------------
    # BACKEND API
    # ---------------------------
    location /api/ {
        proxy_pass http://127.0.0.1:5000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ---------------------------
    # SWAGGER DOCS
    # ---------------------------
    location /api-docs {
        proxy_pass http://127.0.0.1:5000/api-docs/;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/speedtest /etc/nginx/sites-enabled/speedtest
```

Remove the default site:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Test Nginx config:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

Visit:

```text
http://YOUR_ORACLE_PUBLIC_IP
```

Backend should be available at:

```text
http://YOUR_ORACLE_PUBLIC_IP/api
```

Swagger should be available at:

```text
http://YOUR_ORACLE_PUBLIC_IP/api-docs
```

---

## 14. Configure Ubuntu Firewall

### Critical Oracle Cloud Step (iptables reset):
Oracle Cloud instances often have default iptables rules that block traffic even with ufw. First reset and clear them:

```bash
# Reset iptables rules completely
sudo iptables -F
sudo iptables -X
sudo iptables -Z
sudo iptables -P INPUT ACCEPT
sudo iptables -P OUTPUT ACCEPT
sudo iptables -P FORWARD ACCEPT

# Save iptables rules (if iptables-persistent is installed)
sudo netfilter-persistent save 2>/dev/null || true
```

### Configure ufw:
```bash
sudo ufw reset
sudo ufw allow 22/tcp
sudo ufw allow 80,443/tcp
sudo ufw enable
```

Check:

```bash
sudo ufw status
```

Expected allowed services:

```text
22/tcp
80/tcp
443/tcp
```

Do not allow `5000` publicly unless debugging.

---

## 15. Set Up GitHub Actions Auto-Deploy on Push to Main

This gives you Vercel-like deployment.

### 15.1 Generate Deploy SSH Key Locally

On your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions-oracle-deploy" -f oracle_deploy_key
```

You will get:

```text
oracle_deploy_key
oracle_deploy_key.pub
```

---

### 15.2 Add Public Key to Oracle VM

Copy public key:

```bash
cat oracle_deploy_key.pub
```

SSH into VM (using your private key):

```bash
ssh -i /path/to/private-key ubuntu@YOUR_ORACLE_PUBLIC_IP
```

Then:

```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
```

Paste the public key and set permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

### 15.3 Add GitHub Secrets

In your GitHub repo, go to:

```text
Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

Add:

```text
ORACLE_HOST=YOUR_ORACLE_PUBLIC_IP
ORACLE_USER=ubuntu
ORACLE_SSH_KEY=contents of oracle_deploy_key
```

For `ORACLE_SSH_KEY`, paste the full private key:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

## 16. Add GitHub Actions Workflow

In your repo, create:

```text
.github/workflows/deploy.yml
```

Add:

```yaml
name: Deploy to Oracle Cloud

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy Speedtest App
    runs-on: ubuntu-latest

    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.ORACLE_HOST }}
          username: ${{ secrets.ORACLE_USER }}
          key: ${{ secrets.ORACLE_SSH_KEY }}
          script: |
            set -e

            APP_DIR="/var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights"

            cd $APP_DIR

            echo "Pulling latest code from main..."
            git fetch origin main
            git reset --hard origin/main

            echo "Installing backend dependencies..."
            cd $APP_DIR/server
            npm install

            if npm run | grep -q "build"; then
              echo "Building backend..."
              npm run build
            fi

            echo "Restarting backend with PM2..."
            NODE_ENV=production pm2 restart speedtest-api || NODE_ENV=production pm2 start npm --name speedtest-api -- start
            pm2 save

            echo "Installing frontend dependencies..."
            cd $APP_DIR/client
            npm install

            echo "Building frontend..."
            npm run build

            echo "Testing Nginx..."
            sudo nginx -t

            echo "Reloading Nginx..."
            sudo systemctl reload nginx

            echo "Deployment completed successfully."
```

Commit and push:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add Oracle Cloud auto deployment workflow"
git push origin main
```

Then check:

```text
GitHub repo
→ Actions
→ Deploy to Oracle Cloud
```

---

## 17. Important Note About Production Env Files

The GitHub Actions workflow expects these files to already exist on the Oracle VM:

```text
server/.env.production
client/.env.production
```

This is intentional because secrets should not be committed.

React/Vite env values are baked into the frontend during build. If you change:

```text
client/.env.production
```

Rebuild:

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/client
npm run build
sudo systemctl reload nginx
```

---

## 18. Recommended `.gitignore`

```gitignore
node_modules
dist
build
.env
.env.local
.env.production
.env.development
server/src/.env
server/.env
server/.env.production
client/.env
client/.env.production
.DS_Store
```

---

## 19. Test Full Deployment

Frontend:

```text
http://YOUR_ORACLE_PUBLIC_IP
```

API:

```bash
curl http://YOUR_ORACLE_PUBLIC_IP/api
```

Swagger:

```text
http://YOUR_ORACLE_PUBLIC_IP/api-docs
```

Backend logs:

```bash
pm2 logs speedtest-api
```

Nginx logs:

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 20. Later: Add a Domain and HTTPS

Assume your domain is:

```text
speedtest.example.com
```

### 20.1 DNS

Create an A record:

```text
Type: A
Name: speedtest
Value: YOUR_ORACLE_PUBLIC_IP
```

---

### 20.2 Update Nginx

Edit:

```bash
sudo nano /etc/nginx/sites-available/speedtest
```

Change:

```nginx
server_name _;
```

To:

```nginx
server_name speedtest.example.com;
```

Reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 20.3 Add HTTPS With Certbot

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Run:

```bash
sudo certbot --nginx -d speedtest.example.com
```

Update frontend env:

```env
VITE_API_BASE_URL=https://speedtest.example.com/api
```

Rebuild:

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/client
npm run build
sudo systemctl reload nginx
```

---

## 21. Final Production Checklist

Run:

```bash
pm2 status
```

Backend should be online.

Run:

```bash
sudo nginx -t
```

Nginx config should be valid.

Run:

```bash
curl http://localhost:5000
```

Backend should work locally.

Run:

```bash
curl http://YOUR_ORACLE_PUBLIC_IP/api
```

Backend should work through Nginx.

Run:

```bash
curl http://YOUR_ORACLE_PUBLIC_IP
```

Frontend should be served.

Verify Supabase URLs and keys are correct in:

```text
server/.env.production
client/.env.production
```

---

## Summary

After setup, you will have:

- Oracle Cloud Ubuntu VM
- React frontend served by Nginx
- Express backend running with PM2
- `/api` reverse proxy to backend
- Swagger exposed through Nginx
- Auto-deploy on push to `main`
- No domain required for now
- Easy HTTPS/domain setup later

Important frontend production value:

```env
VITE_API_BASE_URL=http://YOUR_ORACLE_PUBLIC_IP/api
```

Important backend production values:

```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=****
GEMINI_API_KEY=****
```

---

## 22. Manual Update Instructions

If you want to manually update the app (without GitHub Actions):

1. SSH into your Oracle VM (using your private key):

```bash
ssh -i /path/to/private-key ubuntu@YOUR_ORACLE_PUBLIC_IP
```

2. Pull the latest code:

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights
git pull origin main
```

3. Rebuild the frontend:

```bash
cd client
npm run build
```

4. Restart the backend:

```bash
cd ../server
pm2 restart all
```

5. Verify the update worked:

```bash
pm2 logs speedtest-api
```

6. If you changed env files (e.g., `client/.env.production` or `server/.env.production`), remember to rebuild the frontend after changes!

---
