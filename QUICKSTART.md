# AlgoStudy 빠른 시작 가이드

## 1. 로컬 개발 환경 설정 (추천)

### 1.1 MySQL 실행
```bash
docker run -d \
  --name algostudy-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=algostudy \
  -p 3306:3306 \
  mysql:8.0
```

### 1.2 백엔드 실행
```bash
cd backend

# Windows
gradlew.bat bootRun

# Mac/Linux
./gradlew bootRun
```

백엔드 서버가 http://localhost:8080 에서 실행됩니다.

### 1.3 프론트엔드 실행
```bash
cd frontend

# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드가 http://localhost:5173 에서 실행됩니다.

### 1.4 크롬 익스텐션 설치

1. Chrome 브라우저에서 `chrome://extensions` 접속
2. 우측 상단 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `extension` 폴더 선택
5. 확장 프로그램 아이콘 클릭하여 설정
   - 백엔드 URL: `http://localhost:8080`
   - 사용자 ID: `1` (기본값)

## 2. Docker Compose로 한 번에 실행

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down

# 데이터까지 모두 삭제
docker-compose down -v
```

실행 후 접속:
- 프론트엔드: http://localhost
- 백엔드 API: http://localhost:8080
- MySQL: localhost:3306

## 3. 테스트 데이터 생성

### 3.1 사용자 생성 (수동)

MySQL에 접속하여 테스트 사용자 생성:

```sql
USE algostudy;

INSERT INTO users (name, email, password, created_at, updated_at)
VALUES ('테스터', 'test@example.com', 'password123', NOW(), NOW());
```

### 3.2 제출 기록 테스트

#### 방법 1: 크롬 익스텐션 사용
1. 백준(https://www.acmicpc.net) 또는 프로그래머스(https://school.programmers.co.kr) 접속
2. 문제 풀이 및 제출
3. 정답 시 자동으로 DB에 저장됨

#### 방법 2: API 직접 호출 (테스트용)
```bash
curl -X POST http://localhost:8080/api/submissions \
  -H "Content-Type: application/json" \
  -H "X-USER-ID: 1" \
  -d '{
    "site": "baekjoon",
    "problemId": "1000",
    "problemTitle": "A+B",
    "language": "Java",
    "code": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}",
    "status": "AC",
    "submittedAt": "2025-11-30T12:00:00"
  }'
```

## 4. 주요 기능 사용하기

### 4.1 대시보드 확인
- http://localhost:5173 접속
- 최근 제출 기록 및 통계 확인

### 4.2 제출 기록 조회
- 상단 메뉴 "제출 기록" 클릭
- 페이지네이션을 통해 전체 기록 조회

### 4.3 코드 리뷰 작성
1. 제출 기록 목록에서 특정 제출 클릭
2. 제출된 코드 확인
3. 별점 선택 (1-5)
4. 리뷰 내용 작성
5. "리뷰 작성" 버튼 클릭

## 5. 개발 환경 설정

### 5.1 IDE 설정

#### IntelliJ IDEA (백엔드)
1. `backend` 폴더를 프로젝트로 열기
2. Gradle 새로고침
3. `AlgoStudyApplication.java` 실행

#### VS Code (프론트엔드)
1. `frontend` 폴더를 프로젝트로 열기
2. 추천 확장 프로그램 설치:
   - Volar
   - ESLint
   - Tailwind CSS IntelliSense

### 5.2 환경변수 설정

백엔드(`backend/src/main/resources/application.yml`):
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/algostudy
    username: root
    password: root
```

프론트엔드(`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:8080
```

## 6. 문제 해결

### 백엔드가 시작되지 않을 때
```bash
# MySQL 연결 확인
mysql -h localhost -u root -p

# 포트 충돌 확인
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows
```

### 프론트엔드 빌드 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 크롬 익스텐션 오류
1. 개발자 도구(F12) 열고 Console 탭 확인
2. Background Service Worker 로그 확인:
   - `chrome://extensions` > 확장 프로그램 > "Service Worker" 클릭

### CORS 오류
- 백엔드 `WebConfig.java`에서 CORS 설정 확인
- 크롬 익스텐션의 경우 `manifest.json`의 `host_permissions` 확인

## 7. 다음 단계

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 상세 아키텍처 문서
- [backend/README.md](./backend/README.md) - 백엔드 개발 가이드
- [frontend/README.md](./frontend/README.md) - 프론트엔드 개발 가이드
- [extension/README.md](./extension/README.md) - 크롬 익스텐션 가이드

## 8. 프로덕션 배포

### Docker Hub에 이미지 푸시
```bash
# 이미지 빌드
docker build -t username/algostudy-backend:latest ./backend
docker build -t username/algostudy-frontend:latest ./frontend

# 이미지 푸시
docker push username/algostudy-backend:latest
docker push username/algostudy-frontend:latest
```

### 클라우드 배포 (예: AWS EC2)
```bash
# EC2 인스턴스에서
git clone <repository-url>
cd code_study

# 환경변수 설정
cp .env.example .env
# .env 파일 수정

# 실행
docker-compose up -d
```

## 9. 유용한 명령어

### Docker
```bash
# 모든 컨테이너 상태 확인
docker-compose ps

# 특정 서비스 재시작
docker-compose restart backend

# 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend

# 데이터베이스 접속
docker exec -it algostudy-mysql mysql -u root -p
```

### Gradle (백엔드)
```bash
# 테스트 실행
./gradlew test

# 빌드
./gradlew build

# 클린 빌드
./gradlew clean build
```

### npm (프론트엔드)
```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 10. 지원

문제가 발생하면:
1. [README.md](./README.md)의 "문제 해결" 섹션 확인
2. GitHub Issues에 버그 리포트
3. 로그 파일 확인:
   - 백엔드: 콘솔 출력
   - 프론트엔드: 브라우저 개발자 도구
   - 크롬 익스텐션: Service Worker 로그
