# US · Our Pixel World 🎮

A pixel art PWA for long-distance couples — real map, drift bottles, pixel room.

## File Structure

```
pixel-love-pwa/
├── index.html          ← main HTML shell
├── style.css           ← all pixel art styles
├── app.js              ← home + bottle logic
├── map.js              ← Leaflet map (Stamen Toner, no API key needed)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline cache)
├── vercel.json         ← Vercel config
├── nginx.conf          ← Nginx config for Droplet
├── deploy.sh           ← one-command Droplet deploy
└── .do/app.yaml        ← DO App Platform config
```

---

## Option A — Digital Ocean App Platform (FREE)

Auto-deploys on every GitHub push. No server management.

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOU/pixel-love-pwa.git
git push -u origin main
```

### 2. Create App

1. https://cloud.digitalocean.com → **Apps** → **Create App**
2. Connect GitHub → select repo → branch `main`
3. DO detects static site automatically
4. Plan: **Starter (Free)**
5. Create → done in ~2 min → URL: `https://pixel-love-xxx.ondigitalocean.app`

---

## Option B — Droplet + Nginx ($6/month)

Full server control. Good base for adding a real backend later.

### 1. Create Droplet

Control Panel → **Droplets** → **Create**
- Image: Ubuntu 24.04 LTS
- Size: Basic / Regular / 1 GB ($6/mo)
- Auth: SSH Key

### 2. First-time setup (run once on server)

```bash
ssh root@YOUR_IP

apt update && apt upgrade -y
apt install -y nginx
mkdir -p /var/www/pixel-love-pwa
chown -R www-data:www-data /var/www/pixel-love-pwa
```

### 3. Deploy files from local machine

```bash
chmod +x deploy.sh
./deploy.sh root@YOUR_IP
```

Then configure Nginx:
```bash
ssh root@YOUR_IP
cp /var/www/pixel-love-pwa/nginx.conf /etc/nginx/sites-available/pixel-love
# Edit: change "your-domain.com" to your domain or IP
nano /etc/nginx/sites-available/pixel-love

ln -sf /etc/nginx/sites-available/pixel-love /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Visit `http://YOUR_IP` — live!

### 4. Free HTTPS (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 5. Git push to deploy (optional)

```bash
# On server:
mkdir -p /var/repo/pixel-love.git && cd /var/repo/pixel-love.git
git init --bare
cat > hooks/post-receive << 'EOF'
#!/bin/bash
GIT_WORK_TREE=/var/www/pixel-love-pwa git checkout -f main
systemctl reload nginx
EOF
chmod +x hooks/post-receive

# On local machine:
git remote add do ssh://root@YOUR_IP/var/repo/pixel-love.git
git push do main   # deploy anytime with this
```

---

## Map

Free Stamen Toner tiles via Stadia — no API key for open projects.
Warm amber CSS filter applied to match the pixel room aesthetic.

## Install as PWA

Once deployed, on mobile:
- iOS Safari: Share → **Add to Home Screen**
- Android Chrome: Menu → **Add to Home Screen**
