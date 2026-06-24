#!/bin/bash
# Script cài đặt Docker và Docker Compose trên Ubuntu/Debian mới hoàn toàn

set -e

echo "Cập nhật hệ thống..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

echo "Thêm Docker's official GPG key..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "Cài đặt Docker repository..."
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Cài đặt Docker Engine, CLI, và containerd..."
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Thêm user hiện tại vào group docker (giúp không cần dùng sudo khi gõ lệnh docker)..."
sudo usermod -aG docker $USER

echo "Kiểm tra phiên bản Docker đã cài đặt:"
docker --version
docker compose version

echo "================================================================"
echo "✅ ĐÃ CÀI ĐẶT THÀNH CÔNG DOCKER VÀ DOCKER COMPOSE!"
echo "❗ VUI LÒNG ĐĂNG XUẤT VÀ ĐĂNG NHẬP LẠI HOẶC GÕ 'su - $USER' ĐỂ ÁP DỤNG QUYỀN DOCKER MỚI."
echo "================================================================"
