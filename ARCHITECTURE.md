# 알고리즘 스터디 자동 제출 & 코드 리뷰 시스템 아키텍처

## 1. 시스템 개요

알고리즘 스터디 팀원들이 백준(BOJ) 또는 프로그래머스(Programmers)에서 문제를 풀고 정답을 받으면,
크롬 확장 프로그램이 자동으로 제출 정보를 서버에 전송하고, 웹 대시보드에서 코드 리뷰를 진행할 수 있는 시스템입니다.

## 2. 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 (스터디 참여자)                       │
└────────────┬────────────────────────────────┬────────────────┘
             │                                │
             ▼                                ▼
  ┌──────────────────────┐        ┌──────────────────────┐
  │  백준/프로그래머스      │        │   웹 대시보드 (Vue.js) │
  │  + 크롬 익스텐션       │        │   - 제출 기록 조회     │
  │                      │        │   - 코드 리뷰         │
  │  [자동 감지 & 전송]   │        │   - 스터디 관리       │
  └──────────┬───────────┘        └──────────┬───────────┘
             │                               │
             │ POST /api/submissions         │ GET/POST API
             │                               │
             └───────────────┬───────────────┘
                             ▼
                  ┌──────────────────────┐
                  │  Spring Boot Server  │
                  │  - REST API          │
                  │  - 비즈니스 로직      │
                  │  - 인증/인가 (JWT)   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Database (MySQL)   │
                  │   - users            │
                  │   - submissions      │
                  │   - reviews          │
                  │   - study_groups     │
                  └──────────────────────┘
```

## 3. 주요 컴포넌트

### 3.1 크롬 익스텐션 (Chrome Extension)

**기술 스택:**
- Manifest V3
- Vanilla JavaScript
- Chrome Storage API

**주요 기능:**
- 백준/프로그래머스에서 정답 감지 (DOM MutationObserver)
- 문제 정보, 제출 코드 자동 추출
- Spring Boot API로 자동 전송
- 사용자 인증 토큰 관리

**파일 구조:**
```
extension/
├── manifest.json
├── background.js
├── content/
│   ├── baekjoon.js
│   └── programmers.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 3.2 Spring Boot 백엔드

**기술 스택:**
- Java 17+
- Spring Boot 3.x
- Spring Data JPA
- Spring Security + JWT
- MySQL 8.0+
- Gradle

**주요 기능:**
- 제출 기록 저장 API
- 코드 리뷰 CRUD API
- 스터디 그룹 관리
- 사용자 인증/인가
- CORS 설정

**패키지 구조:**
```
com.example.algostudy/
├── domain/
│   ├── user/
│   │   ├── User.java
│   │   └── UserRepository.java
│   ├── submission/
│   │   ├── Submission.java
│   │   └── SubmissionRepository.java
│   ├── review/
│   │   ├── Review.java
│   │   ├── ReviewComment.java
│   │   └── ReviewRepository.java
│   └── studygroup/
│       ├── StudyGroup.java
│       ├── StudyMember.java
│       └── StudyGroupRepository.java
├── service/
│   ├── SubmissionService.java
│   ├── ReviewService.java
│   └── StudyGroupService.java
├── web/
│   ├── submission/
│   │   ├── SubmissionController.java
│   │   └── dto/
│   ├── review/
│   │   ├── ReviewController.java
│   │   └── dto/
│   └── studygroup/
│       ├── StudyGroupController.java
│       └── dto/
├── config/
│   ├── WebConfig.java
│   ├── SecurityConfig.java
│   └── JpaConfig.java
└── AlgoStudyApplication.java
```

### 3.3 웹 대시보드 (Frontend)

**기술 스택:**
- Vue.js 3
- Vue Router
- Pinia (상태 관리)
- Axios
- TailwindCSS
- Prism.js (코드 하이라이팅)

**주요 기능:**
- 제출 기록 대시보드
- 코드 리뷰 작성/조회
- 스터디 그룹 관리
- 문제별 통계
- 사용자 프로필

**페이지 구조:**
```
frontend/
├── src/
│   ├── views/
│   │   ├── Dashboard.vue          # 메인 대시보드
│   │   ├── SubmissionList.vue     # 제출 기록 목록
│   │   ├── SubmissionDetail.vue   # 제출 상세 & 코드 리뷰
│   │   ├── StudyGroups.vue        # 스터디 그룹 관리
│   │   └── Login.vue              # 로그인
│   ├── components/
│   │   ├── CodeViewer.vue         # 코드 뷰어
│   │   ├── ReviewForm.vue         # 리뷰 작성 폼
│   │   └── ReviewComments.vue     # 리뷰 댓글 목록
│   ├── stores/
│   │   ├── auth.js
│   │   ├── submission.js
│   │   └── review.js
│   ├── services/
│   │   └── api.js
│   └── router/
│       └── index.js
└── package.json
```

## 4. 데이터베이스 스키마

### 4.1 users 테이블
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4.2 submissions 테이블
```sql
CREATE TABLE submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    site VARCHAR(50) NOT NULL,              -- 'baekjoon' or 'programmers'
    problem_id VARCHAR(100) NOT NULL,
    problem_title VARCHAR(255),
    language VARCHAR(50),
    code TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,            -- 'AC', 'WA', etc.
    submitted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_site_problem (site, problem_id)
);
```

### 4.3 reviews 테이블
```sql
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    rating INT,                             -- 1-5 별점 (선택)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_submission_id (submission_id)
);
```

### 4.4 review_comments 테이블
```sql
CREATE TABLE review_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id)
);
```

### 4.5 study_groups 테이블
```sql
CREATE TABLE study_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 4.6 study_members 테이블
```sql
CREATE TABLE study_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) DEFAULT 'MEMBER',      -- 'ADMIN' or 'MEMBER'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (study_group_id, user_id)
);
```

## 5. API 엔드포인트

### 5.1 제출 기록 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submissions` | 제출 기록 생성 (크롬 익스텐션용) |
| GET | `/api/submissions` | 제출 기록 목록 조회 |
| GET | `/api/submissions/{id}` | 제출 기록 상세 조회 |
| GET | `/api/submissions/user/{userId}` | 특정 사용자 제출 기록 조회 |
| GET | `/api/submissions/problem/{site}/{problemId}` | 특정 문제 제출 기록 조회 |

### 5.2 코드 리뷰 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | 리뷰 작성 |
| GET | `/api/reviews/submission/{submissionId}` | 제출에 대한 리뷰 목록 |
| PUT | `/api/reviews/{id}` | 리뷰 수정 |
| DELETE | `/api/reviews/{id}` | 리뷰 삭제 |
| POST | `/api/reviews/{id}/comments` | 리뷰 댓글 작성 |

### 5.3 스터디 그룹 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/study-groups` | 스터디 그룹 생성 |
| GET | `/api/study-groups` | 스터디 그룹 목록 조회 |
| GET | `/api/study-groups/{id}` | 스터디 그룹 상세 조회 |
| POST | `/api/study-groups/{id}/members` | 멤버 추가 |
| GET | `/api/study-groups/{id}/submissions` | 그룹 제출 기록 조회 |

### 5.4 인증 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| GET | `/api/auth/me` | 현재 사용자 정보 |

## 6. 크롬 익스텐션 동작 흐름

### 6.1 백준 (BOJ)
```
1. 사용자가 /submit/{problemId} 페이지에서 코드 작성
   ↓
2. 제출 버튼 클릭
   ↓
3. Content Script: 문제 정보 + 코드를 chrome.storage에 저장
   ↓
4. 브라우저가 /status 페이지로 자동 이동
   ↓
5. Content Script: 첫 번째 row의 결과 확인
   ↓
6. "맞았습니다!!" 감지 시 storage에서 정보 로드
   ↓
7. Spring Boot API로 POST 요청 전송
   ↓
8. 서버: DB에 저장 후 201 Created 응답
```

### 6.2 프로그래머스 (Programmers)
```
1. 사용자가 문제 페이지에서 코드 작성
   ↓
2. 제출 버튼 클릭
   ↓
3. Content Script: 문제 정보 + 코드를 chrome.storage에 저장
   ↓
4. MutationObserver가 결과 패널 감시
   ↓
5. "정답입니다" 문구 감지
   ↓
6. storage에서 정보 로드
   ↓
7. Spring Boot API로 POST 요청 전송
   ↓
8. 서버: DB에 저장 후 201 Created 응답
```

## 7. 보안 고려사항

### 7.1 인증/인가
- JWT 기반 인증 사용
- 크롬 익스텐션: chrome.storage.sync에 토큰 저장
- Access Token (1시간) + Refresh Token (7일) 구조
- CORS 설정으로 허용된 origin만 접근 가능

### 7.2 코드 보안
- XSS 방지: 코드 출력 시 적절한 이스케이핑
- SQL Injection 방지: JPA PreparedStatement 사용
- CSRF 방지: SameSite Cookie 설정

### 7.3 크롬 익스텐션 보안
- manifest.json에서 필요한 최소 권한만 요청
- Content Security Policy 설정
- host_permissions를 특정 도메인으로 제한

## 8. 배포 환경

### 8.1 개발 환경
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- MySQL: `localhost:3306`

### 8.2 프로덕션 환경 (예시)
- Backend: `https://api.algostudy.com`
- Frontend: `https://algostudy.com`
- MySQL: AWS RDS or Cloud SQL
- Docker + Docker Compose 사용

## 9. 기술적 챌린지 및 해결 방안

### 9.1 사이트 DOM 구조 변경
- **문제**: 백준/프로그래머스의 DOM 구조가 변경될 수 있음
- **해결**:
  - 여러 셀렉터를 fallback으로 시도
  - 정기적으로 셀렉터 검증
  - 사용자 피드백 수집 메커니즘

### 9.2 동시 제출 처리
- **문제**: 사용자가 여러 문제를 연속으로 제출할 경우
- **해결**:
  - problemId를 키로 사용하여 storage에 별도 저장
  - 타임스탬프 비교로 최신 제출 확인

### 9.3 코드 리뷰 알림
- **향후 개선**:
  - WebSocket 또는 Server-Sent Events로 실시간 알림
  - 이메일 알림 기능 추가

## 10. 확장 가능성

### 10.1 추가 가능한 기능
- 문제 추천 시스템
- 스터디 일정 관리
- 문제 난이도별 통계
- 사용자 랭킹 시스템
- 코드 실행/테스트 기능
- LeetCode, CodeForces 등 다른 사이트 지원

### 10.2 성능 최적화
- Redis 캐싱 (자주 조회되는 제출 기록)
- 페이지네이션 및 Lazy Loading
- 코드 syntax highlighting 캐싱
- CDN을 통한 정적 파일 서빙
