# deploy.ps1 - Water Purification Platform 自动部署脚本
# 用法：.\deploy.ps1

# ============ 配置区域 ============
$VPS_HOST = "154.39.79.239"
$VPS_USER = "root"
$WEB_ROOT = "/var/www/water-purification"
$DOMAIN = "water-purification.eu.cc"
$PROJECT_NAME = "Water Purification"
# ===================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying: $PROJECT_NAME" -ForegroundColor Green
Write-Host "  Domain: $DOMAIN" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 构建项目
Write-Host "[1/4] Building project..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  Installing dependencies..." -ForegroundColor Gray
    yarn install
    
    Write-Host "  Building..." -ForegroundColor Gray
    yarn run build
}

if (-not (Test-Path "dist/index.html")) {
    Write-Host "[✗] Build failed: dist/index.html not found" -ForegroundColor Red
    exit 1
}
Write-Host "[✓] Build completed" -ForegroundColor Green

# 步骤 2: 压缩包上传
Write-Host ""
Write-Host "[2/4] Compressing dist folder..." -ForegroundColor Yellow
# Windows 10/11 内置有 tar 命令
tar -czf dist.tar.gz -C dist .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Compression failed" -ForegroundColor Red
    exit 1
}
Write-Host "[✓] Compression completed" -ForegroundColor Green

Write-Host "  Uploading dist.tar.gz to VPS (with KeepAlive to prevent disconnection)..." -ForegroundColor Gray
# 加入了 ServerAliveInterval 和 TCPKeepAlive 防断连心跳机制
$uploadCmd = "scp -o TCPKeepAlive=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=5 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null dist.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/water_dist.tar.gz"
Write-Host "  $uploadCmd" -ForegroundColor Gray
Invoke-Expression $uploadCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Upload failed" -ForegroundColor Red
    exit 1
}
Write-Host "[✓] File uploaded" -ForegroundColor Green

# 步骤 3 & 4: 远端解压、设置权限与重载 Nginx
Write-Host ""
Write-Host "[3/4] & [4/4] Extracting, setting permissions and reloading Nginx..." -ForegroundColor Yellow
# 将所有远程操作合并为一条 SSH 命令，大幅减少输入密码的次数
$deployCmd = "ssh -o TCPKeepAlive=yes -o ServerAliveInterval=15 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VPS_USER}@${VPS_HOST} 'rm -rf ${WEB_ROOT}/* && tar -xzf /tmp/water_dist.tar.gz -C ${WEB_ROOT} && chown -R www-data:www-data ${WEB_ROOT} && chmod -R 755 ${WEB_ROOT} && rm -f /tmp/water_dist.tar.gz && systemctl reload nginx'"
Invoke-Expression $deployCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Remote execution failed" -ForegroundColor Red
    exit 1
}
Write-Host "[✓] Extracted & Permissions set & Nginx reloaded" -ForegroundColor Green

# 清理本地产生的压缩包
Remove-Item -Path "dist.tar.gz" -ErrorAction SilentlyContinue

# 完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "  URL: https://$DOMAIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 打开浏览器
Write-Host "Opening browser in 2 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 2
Start-Process "https://$DOMAIN"