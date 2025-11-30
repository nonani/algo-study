#!/bin/bash

# EC2 배포 스크립트
# 사용법: ./deploy.sh

set -e

EC2_HOST="43.203.36.96"
EC2_USER="ubuntu"
SSH_KEY="algo-study.pem"
PROJECT_DIR="/home/ubuntu/code_study"

echo "===================================="
echo "🚀 AlgoStudy 배포 시작"
echo "===================================="

# SSH 키 권한 확인
if [ -f "$SSH_KEY" ]; then
    chmod 400 "$SSH_KEY"
    echo "✅ SSH 키 권한 설정 완료"
else
    echo "❌ SSH 키 파일을 찾을 수 없습니다: $SSH_KEY"
    echo "현재 디렉토리: $(pwd)"
    echo "algo-study.pem 파일이 현재 디렉토리에 있는지 확인하세요."
    exit 1
fi

# EC2 접속 테스트
echo "🔍 EC2 연결 테스트 중..."
if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" > /dev/null 2>&1; then
    echo "✅ EC2 연결 성공"
else
    echo "❌ EC2 연결 실패"
    echo "다음을 확인하세요:"
    echo "  1. EC2 인스턴스가 실행 중인지"
    echo "  2. 보안 그룹에서 22번 포트(SSH)가 열려있는지"
    echo "  3. SSH 키 파일이 올바른지"
    exit 1
fi

# 프로젝트 파일 전송
echo "📦 프로젝트 파일 전송 중..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude 'build' \
    --exclude '.gradle' \
    --exclude 'dist' \
    --exclude '.git' \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    ../ "$EC2_USER@$EC2_HOST:$PROJECT_DIR/"

echo "✅ 파일 전송 완료"

# .env 파일 전송
echo "🔐 환경변수 파일 전송 중..."
if [ -f "../.env" ]; then
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "../.env" "$EC2_USER@$EC2_HOST:$PROJECT_DIR/.env"
    echo "✅ .env 파일 전송 완료"
else
    echo "⚠️  .env 파일이 없습니다. .env.example을 참고하여 생성하세요."
    exit 1
fi

# 배포 실행
echo "🐳 Docker Compose로 배포 중..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd /home/ubuntu/code_study

    # 기존 컨테이너 중지 및 제거
    docker-compose down

    # 이미지 빌드 및 실행
    docker-compose up -d --build

    echo ""
    echo "===================================="
    echo "✅ 배포 완료!"
    echo "===================================="
    echo ""
    echo "🌐 서비스 URL:"
    echo "  Frontend: http://43.203.36.96"
    echo "  Backend:  http://43.203.36.96:8080"
    echo ""
    echo "📊 컨테이너 상태 확인:"
    docker-compose ps
    echo ""
    echo "📝 로그 확인 명령어:"
    echo "  docker-compose logs -f"
ENDSSH

echo ""
echo "===================================="
echo "🎉 배포 스크립트 실행 완료!"
echo "===================================="
echo ""
echo "💡 유용한 명령어:"
echo "  로그 확인: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'cd $PROJECT_DIR && docker-compose logs -f'"
echo "  재시작:   ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'cd $PROJECT_DIR && docker-compose restart'"
echo "  중지:     ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'cd $PROJECT_DIR && docker-compose down'"
