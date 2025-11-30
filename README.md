# AlgoStudy - 알고리즘 스터디 자동 제출 & 코드 리뷰 시스템

백준(BOJ)과 프로그래머스(Programmers)에서 문제를 풀고 정답을 받으면 자동으로 서버에 기록하고, 팀원들과 코드 리뷰를 진행할 수 있는 웹 서비스입니다.

## 주요 기능

- **자동 제출 기록**: 크롬 익스텐션이 백준/프로그래머스에서 정답 감지 시 자동으로 DB에 저장
- **코드 리뷰**: 팀원들과 함께 제출한 코드에 대해 리뷰 작성 및 피드백
- **대시보드**: 제출 통계 및 최근 활동 확인
- **문제별 조회**: 같은 문제에 대한 다른 사람들의 풀이 비교

## 시스템 아키텍처

```
┌─────────────────────┐       ┌─────────────────────┐
│  Chrome Extension   │       │   Vue.js Frontend   │
│  (백준/프로그래머스)   │       │   (웹 대시보드)      │
└──────────┬──────────┘       └──────────┬──────────┘
           │                              │
           │ POST /api/submissions        │ GET/POST API
           │                              │
           └──────────────┬───────────────┘
                          ▼
                ┌──────────────────────┐
                │  Spring Boot Server  │
                │  (REST API)          │
                └──────────┬───────────┘
                           ▼
                ┌──────────────────────┐
                │   MySQL Database     │
                └──────────────────────┘
```

## 기술 스택

### 백엔드
- Java 17
- Spring Boot 3.2
- Spring Data JPA
- MySQL 8.0
- Gradle

### 프론트엔드
- Vue.js 3
- Vue Router
- Pinia (상태 관리)
- Tailwind CSS
- Axios

### 크롬 익스텐션
- Manifest V3
- Vanilla JavaScript
- Chrome Storage API

### 배포
- Docker & Docker Compose
- Nginx

## 빠른 시작

### 1. 사전 요구사항

- Docker & Docker Compose
- Node.js 20+ (프론트엔드 개발 시)
- Java 17+ (백엔드 개발 시)
- Chrome Browser (익스텐션 사용 시)

### 2. Docker로 실행하기

```bash
# 저장소 클론
git clone <repository-url>
cd code_study

# Docker Compose로 전체 시스템 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

서비스가 시작되면:
- 프론트엔드: http://localhost
- 백엔드 API: http://localhost:8080
- MySQL: localhost:3306

### 3. 개발 환경에서 실행하기

#### MySQL 실행
```bash
docker run -d \
  --name algostudy-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=algostudy \
  -p 3306:3306 \
  mysql:8.0
```

#### 백엔드 실행
```bash
cd backend

# Gradle로 빌드 및 실행
./gradlew bootRun

# 또는
./gradlew build
java -jar build/libs/algostudy-0.0.1-SNAPSHOT.jar
```

#### 프론트엔드 실행
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

#### 크롬 익스텐션 설치
1. Chrome 브라우저에서 `chrome://extensions` 열기
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `extension` 폴더 선택

## 프로젝트 구조

```
code_study/
├── backend/                    # Spring Boot 백엔드
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/algostudy/
│   │   │   │   ├── domain/     # 엔티티 & Repository
│   │   │   │   ├── service/    # 비즈니스 로직
│   │   │   │   ├── web/        # Controller & DTO
│   │   │   │   └── config/     # 설정
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   ├── build.gradle
│   └── Dockerfile
│
├── frontend/                   # Vue.js 프론트엔드
│   ├── src/
│   │   ├── views/             # 페이지 컴포넌트
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── stores/            # Pinia 스토어
│   │   ├── services/          # API 서비스
│   │   └── router/            # 라우팅
│   ├── package.json
│   └── Dockerfile
│
├── extension/                  # Chrome 익스텐션
│   ├── manifest.json
│   ├── background.js
│   ├── content/
│   │   ├── baekjoon.js
│   │   └── programmers.js
│   └── popup/
│       ├── popup.html
│       ├── popup.js
│       └── popup.css
│
├── docker-compose.yml
├── ARCHITECTURE.md            # 상세 아키텍처 문서
└── README.md
```

## 사용 방법

### 1. 크롬 익스텐션 설정
1. 확장 프로그램 아이콘 클릭
2. 백엔드 서버 URL 입력 (기본값: http://localhost:8080)
3. 사용자 ID 입력 (개발용 기본값: 1)
4. "설정 저장" 클릭

### 2. 문제 풀이 및 자동 기록
1. 백준 또는 프로그래머스에서 문제 풀이
2. 코드 제출
3. 정답 시 자동으로 서버에 저장됨
4. 웹 대시보드에서 확인 가능

### 3. 코드 리뷰 작성
1. 웹 대시보드 접속
2. 제출 기록 클릭
3. 코드 확인 후 리뷰 작성
4. 별점 및 피드백 입력

## API 엔드포인트

### 제출 기록
- `POST /api/submissions` - 제출 기록 생성
- `GET /api/submissions` - 제출 기록 목록 (페이지네이션)
- `GET /api/submissions/{id}` - 제출 기록 상세
- `GET /api/submissions/user/{userId}` - 사용자별 제출 기록
- `GET /api/submissions/problem/{site}/{problemId}` - 문제별 제출 기록

### 코드 리뷰
- `POST /api/reviews` - 리뷰 작성
- `GET /api/reviews/submission/{submissionId}` - 제출에 대한 리뷰 목록
- `PUT /api/reviews/{id}` - 리뷰 수정
- `DELETE /api/reviews/{id}` - 리뷰 삭제
- `POST /api/reviews/{id}/comments` - 리뷰 댓글 작성
- `GET /api/reviews/{id}/comments` - 리뷰 댓글 목록

## 개발 가이드

### 백엔드 테스트
```bash
cd backend
./gradlew test
```

### 프론트엔드 빌드
```bash
cd frontend
npm run build
```

### Docker 이미지 빌드
```bash
# 백엔드
docker build -t algostudy-backend ./backend

# 프론트엔드
docker build -t algostudy-frontend ./frontend
```

## 문제 해결

### 크롬 익스텐션이 작동하지 않을 때
1. 개발자 도구 콘솔에서 에러 메시지 확인
2. 백엔드 서버가 실행 중인지 확인
3. CORS 설정이 올바른지 확인
4. 익스텐션 설정의 URL이 정확한지 확인

### 데이터베이스 연결 오류
1. MySQL 컨테이너가 실행 중인지 확인: `docker ps`
2. 연결 정보 확인: `application.yml`
3. 데이터베이스가 생성되었는지 확인

### 프론트엔드 API 호출 오류
1. 백엔드 서버가 실행 중인지 확인
2. 프록시 설정 확인: `vite.config.js`
3. CORS 설정 확인: `WebConfig.java`

## 향후 개발 계획

- [ ] JWT 기반 인증/인가 구현
- [ ] 스터디 그룹 관리 기능
- [ ] 실시간 알림 (WebSocket)
- [ ] 문제 추천 시스템
- [ ] 코드 실행/테스트 기능
- [ ] LeetCode, CodeForces 지원
- [ ] 모바일 앱 개발

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 이용해주세요.
