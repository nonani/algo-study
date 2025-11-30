#!/bin/bash

# EC2 초기 설정 스크립트
# 사용법: ssh -i your-key.pem ubuntu@52.79.48.108 'bash -s' < setup-ec2.sh

echo "===================================="
echo "EC2 환경 설정 시작"
echo "===================================="

# 시스템 업데이트
echo "📦 시스템 업데이트 중..."
sudo apt update
sudo apt upgrade -y

# Docker 설치
echo "🐳 Docker 설치 중..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker Compose 설치
echo "🐳 Docker Compose 설치 중..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Docker 권한 설정
echo "🔑 Docker 권한 설정 중..."
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# Git 설치
echo "📚 Git 설치 중..."
sudo apt install -y git

# 방화벽 설정 (UFW)
echo "🔥 방화벽 설정 중..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw --force enable

# 프로젝트 디렉토리 생성
echo "📁 프로젝트 디렉토리 생성 중..."
mkdir -p /home/ubuntu/code_study

echo "===================================="
echo "✅ EC2 환경 설정 완료!"
echo "===================================="
echo ""
echo "다음 명령어로 Docker 버전 확인:"
echo "  docker --version"
echo "  docker-compose --version"
echo ""
echo "재접속 후 Docker 권한이 적용됩니다."
echo "  exit 후 다시 ssh로 접속하세요."
