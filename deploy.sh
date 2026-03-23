#!/bin/bash
# deploy.sh — 一键部署到 Digital Ocean Droplet
# 用法: ./deploy.sh root@你的服务器IP

set -e

SERVER=${1:-"root@your-droplet-ip"}
REMOTE_DIR="/var/www/pixel-love-pwa"

echo "🚀 Deploying to $SERVER..."

# 上传文件（排除不需要的）
rsync -avz --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='deploy.sh' \
  --exclude='nginx.conf' \
  --exclude='README.md' \
  ./ "$SERVER:$REMOTE_DIR/"

# 在服务器上配置 Nginx（首次运行）
ssh "$SERVER" << 'REMOTE'
  # 安装 Nginx（如果没有）
  if ! command -v nginx &> /dev/null; then
    apt-get update -q && apt-get install -y nginx
  fi

  # 确保目录存在且有权限
  mkdir -p /var/www/pixel-love-pwa
  chown -R www-data:www-data /var/www/pixel-love-pwa
  chmod -R 755 /var/www/pixel-love-pwa

  # 重载 Nginx
  nginx -t && systemctl reload nginx

  echo "✅ Deploy complete!"
REMOTE

echo ""
echo "✅ Done! Visit: http://$SERVER"
echo ""
echo "Next: set up HTTPS with Let's Encrypt:"
echo "  ssh $SERVER"
echo "  apt install certbot python3-certbot-nginx"
echo "  certbot --nginx -d your-domain.com"
