# EC2 배포 가이드

## EC2 정보
- **Public IP**: 43.203.36.96
- **OS**: Ubuntu 22.04 LTS
- **Instance Type**: t3.small (권장)

## 1. 사전 준비

### SSH 키 준비
`algo-study.pem` 파일이 프로젝트 루트에 있어야 합니다.

```bash
# 현재 위치 확인
pwd
# /Users/jinu/code_study

# SSH 키가 있는지 확인
ls -la algo-study.pem
```

### 보안 그룹 설정
AWS Console에서 다음 포트를 열어야 합니다:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 8080 (Backend API)

## 2. EC2 초기 설정 (최초 1회만)

### 방법 1: 자동 설치 스크립트 사용 (권장)

```bash
# 프로젝트 루트에서 실행
cd /Users/jinu/code_study

# EC2 초기 설정 실행
ssh -i algo-study.pem ubuntu@43.203.36.96 'bash -s' < deploy/setup-ec2.sh
```

### 방법 2: 수동 설치

```bash
# EC2 접속
ssh -i algo-study.pem ubuntu@43.203.36.96

# Docker 설치
sudo apt update
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker ubuntu

# 재접속 (Docker 권한 적용)
exit
ssh -i algo-study.pem ubuntu@43.203.36.96

# Docker 버전 확인
docker --version
docker-compose --version
```

## 3. 배포하기

### 방법 1: 자동 배포 스크립트 (권장 ⭐)

```bash
cd /Users/jinu/code_study/deploy

# 배포 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

스크립트가 자동으로:
1. ✅ SSH 키 권한 설정
2. ✅ EC2 연결 테스트
3. ✅ 프로젝트 파일 전송
4. ✅ Docker Compose 빌드 및 실행
5. ✅ 배포 결과 확인

### 방법 2: 수동 배포

```bash
# 1. 파일 전송
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'build' \
  -e "ssh -i algo-study.pem" \
  ../ ubuntu@43.203.36.96:/home/ubuntu/code_study/

# 2. EC2 접속
ssh -i algo-study.pem ubuntu@43.203.36.96

# 3. 배포 실행
cd /home/ubuntu/code_study
docker-compose down
docker-compose up -d --build

# 4. 상태 확인
docker-compose ps
docker-compose logs -f
```

## 4. 서비스 접속

배포 완료 후:

- **프론트엔드**: http://43.203.36.96
- **백엔드 API**: http://43.203.36.96:8080
- **API 테스트**: http://43.203.36.96:8080/api/submissions

## 5. 배포 후 확인

### 서비스 상태 확인
```bash
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose ps"
```

### 로그 확인
```bash
# 실시간 로그
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose logs -f"

# 특정 서비스 로그
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose logs backend"
```

### API 테스트
```bash
# 제출 기록 조회
curl http://43.203.36.96:8080/api/submissions

# 테스트 제출 생성
curl -X POST http://43.203.36.96:8080/api/submissions \
  -H "Content-Type: application/json" \
  -H "X-USER-ID: 1" \
  -d '{
    "site": "baekjoon",
    "problemId": "1000",
    "problemTitle": "A+B",
    "language": "Java",
    "code": "public class Main { ... }",
    "status": "AC",
    "submittedAt": "2025-11-30T12:00:00"
  }'
```

## 6. 유용한 명령어

### 재시작
```bash
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose restart"
```

### 중지
```bash
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose down"
```

### 시작
```bash
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose up -d"
```

### 리소스 사용량 확인
```bash
ssh -i algo-study.pem ubuntu@43.203.36.96 "docker stats"
```

### 디스크 사용량 확인
```bash
ssh -i algo-study.pem ubuntu@43.203.36.96 "df -h"
```

## 7. GitHub Actions 자동 배포 설정 (선택)

### GitHub Secrets 설정

Repository Settings > Secrets and variables > Actions에서 추가:

1. **EC2_HOST**: `43.203.36.96`
2. **EC2_SSH_KEY**: `algo-study.pem` 파일의 전체 내용 복사

```bash
# SSH 키 내용 복사 (Mac)
cat algo-study.pem | pbcopy

# SSH 키 내용 복사 (Linux)
cat algo-study.pem | xclip -selection clipboard
```

### 자동 배포 활성화

이제 `main` 브랜치에 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다.

## 8. 크롬 익스텐션 설정 업데이트

배포 후 크롬 익스텐션 설정 변경:

1. 익스텐션 아이콘 클릭
2. 백엔드 URL: `http://43.203.36.96:8080`
3. 사용자 ID: 본인의 ID
4. 설정 저장

## 9. 문제 해결

### 접속이 안 될 때
```bash
# EC2 인스턴스 상태 확인 (AWS Console)
# 보안 그룹 규칙 확인 (포트 22, 80, 8080)
# 서비스 상태 확인
ssh -i algo-study.pem ubuntu@43.203.36.96 "docker-compose ps"
```

### MySQL 연결 오류
```bash
# MySQL 컨테이너 로그 확인
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose logs mysql"

# MySQL 재시작
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose restart mysql"
```

### 백엔드 오류
```bash
# 백엔드 로그 확인
ssh -i algo-study.pem ubuntu@43.203.36.96 "cd /home/ubuntu/code_study && docker-compose logs backend"
```

### 디스크 공간 부족
```bash
# 사용하지 않는 Docker 이미지 정리
ssh -i algo-study.pem ubuntu@43.203.36.96 "docker system prune -a"
```

## 10. 도메인 연결 (선택)

도메인이 있다면 설정 가능:

```bash
# Let's Encrypt SSL 인증서 설치
ssh -i algo-study.pem ubuntu@43.203.36.96

sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 다음 단계

- [ ] HTTPS 설정 (Let's Encrypt)
- [ ] 자동 백업 설정
- [ ] 모니터링 설정 (CloudWatch)
- [ ] 로그 로테이션 설정
- [ ] 방화벽 강화
