#!/bin/bash

# EC2에 .env 파일 생성 스크립트
# 사용법: ssh -i algo-study.pem ubuntu@52.79.48.108 'bash -s' < deploy/create-env.sh

cat > /home/ubuntu/code_study/.env << 'EOF'
# Database Configuration
MYSQL_ROOT_PASSWORD=xP9#mK2$vL8@wN5&zQ3!rT7^yU4%
MYSQL_DATABASE=algostudy
MYSQL_USER=algostudy
MYSQL_PASSWORD=bD6@fH9#jM2&nP5!sT8^vX3$wZ7%

# Spring Boot
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/algostudy
SPRING_DATASOURCE_USERNAME=algostudy
SPRING_DATASOURCE_PASSWORD=bD6@fH9#jM2&nP5!sT8^vX3$wZ7%
JWT_SECRET=aK8#mN4$pQ9@sV2&wY7!zB5^cF3%dH8@eJ6#gL9$hM2&iN5!

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=80
EOF

echo "✅ .env 파일이 생성되었습니다."
echo "⚠️  프로덕션 환경에서는 패스워드를 반드시 변경하세요!"
