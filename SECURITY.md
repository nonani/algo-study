# 보안 가이드

## 🔒 중요 보안 사항

### 1. 환경변수 관리

**절대 하지 말아야 할 것:**
- ❌ `.env` 파일을 Git에 커밋
- ❌ 패스워드를 코드에 하드코딩
- ❌ SSH 키를 Git에 커밋
- ❌ API 키를 공개 저장소에 업로드

**반드시 해야 할 것:**
- ✅ `.env` 파일 사용 (이미 .gitignore에 포함됨)
- ✅ `.env.example`만 Git에 커밋 (실제 값 제외)
- ✅ 프로덕션에서 강력한 패스워드 사용
- ✅ SSH 키는 로컬에만 보관

### 2. 패스워드 변경 방법

#### 로컬 개발 환경
```bash
# .env 파일 수정
nano .env

# 다음 값들을 강력한 패스워드로 변경:
MYSQL_ROOT_PASSWORD=your-strong-password
MYSQL_PASSWORD=your-strong-password
JWT_SECRET=very-long-random-string
```

#### EC2 프로덕션 환경
```bash
# EC2 접속
ssh -i algo-study.pem ubuntu@52.79.48.108

# .env 파일 생성/수정
nano /home/ubuntu/code_study/.env

# 패스워드 변경 후 저장

# 서비스 재시작
cd /home/ubuntu/code_study
docker-compose down
docker-compose up -d
```

### 3. 강력한 패스워드 생성

```bash
# 랜덤 패스워드 생성 (Linux/Mac)
openssl rand -base64 32

# 또는
pwgen -s 32 1
```

### 4. Git에 실수로 커밋한 경우

**민감한 정보를 실수로 커밋했다면:**

```bash
# 1. 즉시 패스워드 변경
# 2. Git 히스토리에서 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. 강제 푸시
git push origin --force --all

# 4. 모든 팀원에게 알리고 패스워드 변경
```

⚠️ **더 나은 방법**: GitHub에 문의하여 저장소 히스토리 완전 삭제 요청

### 5. 환경별 설정

#### 개발 환경 (.env.development)
```bash
MYSQL_ROOT_PASSWORD=dev-password
MYSQL_PASSWORD=dev-password
```

#### 프로덕션 환경 (.env.production)
```bash
# 훨씬 더 강력한 패스워드 사용!
MYSQL_ROOT_PASSWORD=xK9#mL2@pQ7$vN4&wR8^zT5!
MYSQL_PASSWORD=aB3$cD6@eF9#gH2&iJ5!kL8^
JWT_SECRET=very-very-long-random-string-at-least-256-bits-required-use-openssl-rand
```

### 6. AWS 보안 그룹 설정

**EC2 보안 그룹에서 MySQL 포트(3306)는 절대 public으로 열지 마세요!**

✅ 허용:
- 22 (SSH) - 내 IP만
- 80 (HTTP) - 0.0.0.0/0
- 443 (HTTPS) - 0.0.0.0/0
- 8080 (Backend API) - 0.0.0.0/0

❌ 금지:
- 3306 (MySQL) - 0.0.0.0/0

### 7. SSH 키 관리

```bash
# SSH 키 권한 설정
chmod 400 algo-study.pem

# SSH 키는 절대 공유하지 말 것
# 각 팀원은 자신의 SSH 키를 생성해야 함
```

### 8. 정기 보안 점검

- [ ] 3개월마다 모든 패스워드 변경
- [ ] Git 히스토리에 민감한 정보 없는지 확인
- [ ] EC2 보안 그룹 규칙 재검토
- [ ] 사용하지 않는 포트 닫기
- [ ] Docker 이미지 업데이트
- [ ] 의존성 보안 취약점 검사

```bash
# 의존성 보안 검사
cd backend && ./gradlew dependencyCheckAnalyze
cd frontend && npm audit
```

### 9. 프로덕션 체크리스트

배포 전 반드시 확인:
- [ ] .env 파일이 .gitignore에 포함되어 있는가?
- [ ] 강력한 패스워드로 변경했는가?
- [ ] SSH 키가 Git에 포함되지 않았는가?
- [ ] API 키가 하드코딩되지 않았는가?
- [ ] 데이터베이스 포트가 public으로 열려있지 않은가?
- [ ] HTTPS 설정이 완료되었는가?
- [ ] 백업 시스템이 구축되어 있는가?

### 10. 문제 발생 시 대응

**보안 사고 발생 시:**

1. 즉시 모든 패스워드 변경
2. 영향받은 서비스 중지
3. 로그 확인 및 분석
4. 취약점 패치
5. 서비스 재시작
6. 팀원 및 사용자에게 알림

**긴급 연락처:**
- GitHub Security: https://github.com/security
- AWS Support: https://aws.amazon.com/support

---

## 📚 추가 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Spring Security](https://spring.io/projects/spring-security)

---

## ⚠️ 면책 조항

이 보안 가이드는 기본적인 보안 사항만 다룹니다.
프로덕션 환경에서는 전문 보안 감사를 받는 것을 권장합니다.
