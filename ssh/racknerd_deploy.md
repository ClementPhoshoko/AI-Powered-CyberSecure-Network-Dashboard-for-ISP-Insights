# RackNerd Deployment Guide for AkovoLabs Speedtest

Production deployment guide for **AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights** on a RackNerd VPS.

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
RackNerd Public IP
    ↓
Caddy (reverse proxy + auto HTTPS)
    ├── speedtest.akovolabs.co.za  → React frontend from client/dist
    └── speedtest.akovolabs.co.za/api → Node/Express backend on localhost:5000
```

The app will be available on your domain with automatic HTTPS via Caddy.

---

## 1. Order Your RackNerd VPS

1. Go to [RackNerd flash sales](https://racknerd.com/FlashSale/)
2. Pick any KVM VPS plan (1 vCPU / 1-2GB RAM / 20-30GB SSD)
3. During checkout, choose **Ubuntu 22.04** or **Ubuntu 24.04** as the OS
4. After payment, you will receive:
   - **Root password** (emailed to you)
   - **VM IP address**
   - **SolusVM panel URL** for VNC/reset/reinstall

> ⚠️ **Important**: If you miss the OS selection during checkout, log into the SolusVM panel, reinstall the VM with Ubuntu 22.04/24.04, and wait 2-5 minutes for it to finish.

---

## 2. SSH Into the RackNerd VM

### First login (with password)

RackNerd emails you the root password. Connect:

```bash
ssh root@YOUR_RACKNERD_IP
```

Type `yes` to accept the host key, then paste the password from the email (it may not show as you type — that is normal).

### Create a non-root user

Running as root is risky. Create a user for daily work:

```bash
adduser ubuntu
```

You will be asked for a password and some optional info (Full Name, etc. — press Enter to skip all).

Give the user sudo privileges:

```bash
usermod -aG sudo ubuntu
```

### Set up SSH key for passwordless login

On your **local machine** (not the VM), generate an SSH key if you do not already have one:

```bash
ssh-keygen -t ed25519 -C "racknerd-deploy"
```

Press Enter to accept the default location (`~/.ssh/id_ed25519`). A passphrase is optional.

Copy the public key to the VM:

```bash
ssh-copy-id ubuntu@YOUR_RACKNERD_IP
```

If `ssh-copy-id` is not available on your system, do it manually:

```bash
# On your local machine, print the public key
cat ~/.ssh/id_ed25519.pub

# On the VM (still logged in as root), append it
echo "paste_the_public_key_here" >> /home/ubuntu/.ssh/authorized_keys
chmod 700 /home/ubuntu/.ssh
chmod 600 /home/ubuntu/.ssh/authorized_keys
chown -R ubuntu:ubuntu /home/ubuntu/.ssh
```

Now test key-based login (from your local machine):

```bash
ssh ubuntu@YOUR_RACKNERD_IP
```

If it works without asking for a password, you are set.

### Disable root password login (optional but recommended)

```bash
sudo sed -i 's/^PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

> ⚠️ **Small workaround**: If the `sed` command fails, the config line may be commented out. Run `sudo nano /etc/ssh/sshd_config`, find `#PermitRootLogin`, remove the `#` and change it to `prohibit-password`, save (Ctrl+O, Enter, Ctrl+X), then restart sshd.

---

## 3. Update Server Packages

```bash
sudo apt update && sudo apt upgrade -y
```

Install required packages:

```bash
sudo apt install -y git curl ufw fail2ban
```

---

## 4. Install Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:

```bash
node -v
npm -v
```

You should see Node `22.x` and npm `10.x` or later.

---

## 5. Install PM2

PM2 keeps the backend running in the background and auto-starts on reboot.

```bash
sudo npm install -g pm2
```

Verify:

```bash
pm2 -v
```

---

## 6. Install Caddy

Caddy is a reverse proxy that automatically handles HTTPS (Let's Encrypt). It replaces Nginx for this setup.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy.list
sudo apt update
sudo apt install caddy
```

Verify:

```bash
caddy version
```

---

## 7. Clone the GitHub Repo on the VM

```bash
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www
cd /var/www
```

Clone your repo:

```bash
git clone https://github.com/ClementPhoshoko/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights.git
```

Enter the project directory:

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights
```

If your default branch is `main` (check with `git branch -a`):

```bash
git checkout main
```

> ⚠️ **Small workaround**: If `git clone` fails with "Connection refused" or times out, GitHub may be blocked in your region. Run `git clone` using the `https://` protocol with a personal access token: `git clone https://USERNAME:TOKEN@github.com/ClementPhoshoko/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights.git`. Generate a token at GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.

---

## 8. Install Backend Dependencies

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/server
npm install
```

If your backend has a build step (check `package.json` for a `"build"` script):

```bash
npm run build
```

If it is plain JavaScript, skip the build step.

---

## 9. Create Backend Production Env File

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/server
nano .env.production
```

Paste your production values:

```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_key
```

Save in nano:
```text
Ctrl+O → Enter → Ctrl+X
```

Secure the file (only the owner can read it):

```bash
chmod 600 .env.production
```

---

## 10. Start Backend With PM2

Check the start script in `package.json`:

```bash
cat package.json | grep -A2 '"start"'
```

If it shows `"start": "node src/index.js"` (or similar), run:

```bash
NODE_ENV=production pm2 start npm --name speedtest-api -- start
```

If your entry file is directly runnable (e.g., `src/server.js`), use:

```bash
NODE_ENV=production pm2 start src/server.js --name speedtest-api
```

Save the PM2 process list so it survives a reboot:

```bash
pm2 save
```

Enable PM2 startup:

```bash
pm2 startup
```

PM2 will print a command. It will look similar to:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Copy that line and run it. Then run `pm2 save` again.

Check status and logs:

```bash
pm2 status
pm2 logs speedtest-api
```

Test the backend locally on the VM:

```bash
curl http://localhost:5000
```

If Swagger is at `/api-docs`:

```bash
curl http://localhost:5000/api-docs
```

---

## 11. Build React Frontend

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/client
npm install
```

Create the production environment file:

```bash
nano .env.production
```

Paste:

```env
VITE_API_BASE_URL=https://speedtest.akovolabs.co.za/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ **Important**: Use your actual domain here (e.g., `speedtest.akovolabs.co.za`). If you do not have a domain yet, use your RackNerd IP temporarily: `http://YOUR_RACKNERD_IP/api`. Caddy will handle HTTPS automatically when a domain is configured.

Build:

```bash
npm run build
```

This should create `client/dist/` with the compiled frontend files.

---

## 12. Configure Caddy

Caddy uses a file called `Caddyfile`. Edit it:

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace the contents with:

```caddy
speedtest.akovolabs.co.za {
    root * /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/client/dist
    encode gzip

    # Frontend (SPA — serve index.html for all routes)
    try_files {path} /index.html

    # Backend API reverse proxy
    handle_path /api/* {
        reverse_proxy localhost:5000
    }

    # Swagger docs
    handle_path /api-docs {
        reverse_proxy localhost:5000
    }
}
```

> ⚠️ **No domain yet?** Replace `speedtest.akovolabs.co.za` with your RackNerd IP address. Caddy will serve without HTTPS in this case (which is fine for testing). Example:
> ```caddy
> http://YOUR_RACKNERD_IP {
>     ...
> }
> ```

Save in nano (`Ctrl+O → Enter → Ctrl+X`).

Test the Caddy configuration:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

If validation passes, reload Caddy:

```bash
sudo systemctl reload caddy
```

If there is an error, run `sudo caddy validate` again and check the error message. Common issues:
- **Domain not pointing to this server yet**: The validation will warn but still work. Fix your DNS first, then reload.
- **Port 80 or 443 already in use**: Run `sudo systemctl stop apache2 nginx` first if they are installed.

---

## 13. Configure DNS (Domain)

Go to your domain provider (HostAfrica for `.co.za` domains) and create an **A record**:

| Type | Name | Value |
|------|------|-------|
| A | `speedtest` | `YOUR_RACKNERD_IP` |

If your domain is `akovolabs.co.za`, this makes `speedtest.akovolabs.co.za` point to your VM.

DNS changes can take **5 minutes to 48 hours** to propagate. Caddy will automatically request a Let's Encrypt certificate once the DNS resolves.

---

## 14. Configure Firewall (ufw)

Enable the firewall:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Type `y` when prompted.

Check the status:

```bash
sudo ufw status
```

Expected output:

```text
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
22/tcp (v6)                ALLOW       Anywhere (v6)
80/tcp (v6)                ALLOW       Anywhere (v6)
443/tcp (v6)               ALLOW       Anywhere (v6)
```

> ⚠️ **Small workaround**: If `ufw enable` says "Command may disrupt existing ssh connections", just type `y`. Your SSH session will not drop because port 22 is already allowed.

---

## 15. Set Up Fail2Ban (Basic Security)

Fail2Ban blocks IPs that repeatedly fail SSH login attempts.

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

Check its status:

```bash
sudo fail2ban-client status sshd
```

You should see something like "Status: OK" with a list of banned IPs (will be empty initially).

---

## 16. Test Full Deployment

Visit your domain in a browser:

```text
https://speedtest.akovolabs.co.za
```

If you are using the IP instead:

```text
http://YOUR_RACKNERD_IP
```

Test the API:

```bash
curl https://speedtest.akovolabs.co.za/api
```

Or with IP:

```bash
curl http://YOUR_RACKNERD_IP/api
```

Check backend logs if something is wrong:

```bash
pm2 logs speedtest-api
```

Check Caddy logs:

```bash
sudo journalctl -u caddy --no-pager -n 50
```

---

## 17. Set Up GitHub Actions Auto-Deploy (Optional)

This gives you Vercel-like deployment: every push to `main` automatically updates the live server.

### 17.1 Generate Deploy SSH Key Locally

On your **local machine**:

```bash
ssh-keygen -t ed25519 -C "github-actions-racknerd-deploy" -f racknerd_deploy_key
```

This creates two files:
```text
racknerd_deploy_key      (private key — keep secret)
racknerd_deploy_key.pub  (public key — goes on the VM)
```

### 17.2 Add Public Key to the VM

Copy the public key:

```bash
cat racknerd_deploy_key.pub
```

SSH into the VM:

```bash
ssh ubuntu@YOUR_RACKNERD_IP
```

Add the key to authorized keys:

```bash
echo "paste_the_public_key_here" >> ~/.ssh/authorized_keys
```

> ⚠️ **Small workaround**: If `~/.ssh` does not exist yet, run `mkdir -p ~/.ssh && chmod 700 ~/.ssh` first.

### 17.3 Add GitHub Secrets

In your GitHub repo, go to:

```text
Settings → Secrets and variables → Actions → New repository secret
```

Add these three secrets:

| Name | Value |
|------|-------|
| `RACKNERD_HOST` | `YOUR_RACKNERD_IP` |
| `RACKNERD_USER` | `ubuntu` |
| `RACKNERD_SSH_KEY` | Full contents of `racknerd_deploy_key` (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) |

### 17.4 Add GitHub Actions Workflow

In your repo, create:

```text
.github/workflows/deploy.yml
```

Add:

```yaml
name: Deploy to RackNerd

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy AkovoLabs Speedtest
    runs-on: ubuntu-latest

    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.RACKNERD_HOST }}
          username: ${{ secrets.RACKNERD_USER }}
          key: ${{ secrets.RACKNERD_SSH_KEY }}
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

            echo "Testing Caddy config..."
            sudo caddy validate --config /etc/caddy/Caddyfile

            echo "Reloading Caddy..."
            sudo systemctl reload caddy

            echo "Deployment completed successfully."
```

Commit and push:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add RackNerd auto deployment workflow"
git push origin main
```

Check deployment progress:

```text
GitHub repo → Actions → Deploy to RackNerd
```

---

## 18. Important Note About Production Env Files

The GitHub Actions workflow expects these files to already exist on the VM:

```text
server/.env.production
client/.env.production
```

These are **not** committed to GitHub (they contain secrets). Create them manually once (steps 9 and 11), and the deploy script will reuse them across deployments.

If you ever change values in `client/.env.production`, you must rebuild:

```bash
cd /var/www/AI-Powered-CyberSecure-Network-Dashboard-for-ISP-Insights/client
npm run build
sudo systemctl reload caddy
```

---

## 19. Manual Update Instructions

If you do not set up GitHub Actions, update manually:

1. SSH into the VM:

```bash
ssh ubuntu@YOUR_RACKNERD_IP
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
npm install
pm2 restart speedtest-api
```

5. Reload Caddy (only if you changed the Caddyfile):

```bash
sudo systemctl reload caddy
```

---

## 20. Final Production Checklist

| Check | Command |
|-------|---------|
| Backend running | `pm2 status` (should show `online`) |
| Caddy valid | `sudo caddy validate --config /etc/caddy/Caddyfile` |
| Backend local | `curl http://localhost:5000` |
| Through proxy | `curl http://localhost/api` |
| Firewall active | `sudo ufw status` |
| Fail2Ban active | `sudo fail2ban-client status sshd` |
| Disk space | `df -h` (should not be near 100%) |

---

## 21. Differences Between RackNerd and Oracle

| Area | Oracle Cloud | RackNerd |
|------|-------------|----------|
| First login | SSH key required at instance creation | Root password emailed |
| Firewall | iptables + cloud console security lists | ufw only (no external firewall) |
| Reverse proxy | Nginx | **Caddy** (auto HTTPS, simpler config) |
| Default user | `ubuntu` | `root` (create non-root user) |
| iptables reset | Required (Oracle adds restrictive rules) | Not needed |
| Bandwidth cap | 10TB/month (abuse detection) | Unmetered at port speed |

---

## Summary

After setup, you will have:

- RackNerd VPS with Ubuntu 22.04/24.04
- React frontend served by Caddy
- Express backend running with PM2
- `/api` reverse proxy to backend
- Swagger at `/api-docs`
- Auto-HTTPS via Caddy (with a domain)
- Auto-deploy on push to `main` (optional)
- Fail2Ban for SSH security
