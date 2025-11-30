# 알고리즘 스터디 자동 제출 기록 시스템 – 기능 및 기술 명세서

## 0. 목적 (Purpose)

알고리즘 스터디 팀원을 위해  
**백준(BOJ)** 또는 **프로그래머스(Programmers)** 에서 문제를 풀고 **정답(AC)** 이 나오면  
그 순간을 **크롬 확장 프로그램이 감지**하여  
해당 제출 정보(문제 번호, 소스코드, 언어 등)를 Spring 서버로 전송해  
**DB에 자동 기록**하는 시스템을 구축한다.

정답 여부는 각 사이트의 UI(DOM) 변화를 기반으로 감지하며,  
백엔드에서 직접 크롤링하거나 외부 API를 호출하지 않는다.

---

# 1. 전체 아키텍처
프로그래머스 / 백준 사이트
│ (DOM 감지)
▼
[크롬 확장 프로그램]

content script: 문제 정보/코드 추출, 정답 감지

background: 서버에 요청 전송
│ (JSON POST)
▼
[Spring Boot API 서버]
│ (JPA)
▼
[DB: MySQL 또는 PostgreSQL]

---

# 2. 요구사항 (Requirements)

## 2.1 핵심 기능

1. 사용자가 BOJ/Programmers에서 문제 제출
2. 해당 사이트가 채점 후 **정답(AC)** UI 표시
3. 크롬 확장이 해당 DOM 변화 감지
4. 문제 정보 + 코드 + 언어 + 제출 시간 + 정답 여부 등을  
   Spring 서버 **POST /api/submissions** 로 전송
5. 서버는 DB에 제출 기록 저장

---

# 3. 사이트별 정답 감지 로직

## 3.1 백준(BOJ)

### 감지 지점
- `/status` 페이지의 첫 번째 테이블 row
- `.result` 컬럼에 `"맞았습니다!!"` 포함 시 AC

### 필요한 데이터
- 문제 번호: `.problem_id`
- 언어: `.language`
- 제출 시간: `.time`
- 소스코드: `/submit/{id}` 페이지에서 제출 버튼 클릭 시 미리 추출하여 `chrome.storage` 에 보관

### 처리 흐름
1. `/submit/{id}` 페이지에서 제출 버튼 클릭 → 코드/문제정보 저장
2. 브라우저가 `/status` 로 이동
3. content script가 첫 row 파싱 → `"맞았습니다"` 여부 확인
4. 맞으면 저장해둔 코드/정보와 함께 서버로 전송

---

## 3.2 프로그래머스(Programmers)

### 감지 지점
- 제출 후 페이지 내 **결과 패널**에서 `"정답입니다"` 문구 탐지
- DOM 업데이트는 `MutationObserver` 로 감시

### 필요한 데이터
- 문제 ID: URL의 `/lessons/{id}`에서 추출
- 문제 제목: `.lesson-title`
- 코드: CodeMirror/Monaco API로 에디터 내부 텍스트 추출
- 언어: UI 드롭다운에서 값 읽기

### 처리 흐름
1. 제출 버튼 클릭 → 문제ID/제목/코드/언어 `chrome.storage` 저장
2. 결과 패널을 `MutationObserver` 로 감시
3. `"정답입니다"` 등장하면 → AC로 판정
4. 저장해둔 정보와 함께 서버로 전송

---

# 4. 크롬 확장 프로그램 명세

## 4.1 파일 구조
extension/
├── manifest.json
├── content/
│ ├── baekjoon.js
│ ├── programmers.js
├── background.js
├── popup.html
├── popup.js

---

## 4.2 manifest.json (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "Algo Auto Submit Tracker",
  "version": "1.0",
  "permissions": ["storage", "scripting", "activeTab"],
  "host_permissions": [
    "https://www.acmicpc.net/*",
    "https://school.programmers.co.kr/*",
    "http://localhost:8080/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://www.acmicpc.net/*"],
      "js": ["content/baekjoon.js"],
      "run_at": "document_idle"
    },
    {
      "matches": ["https://school.programmers.co.kr/*"],
      "js": ["content/programmers.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup.html"
  }
}

---

## 4.3 서버 전송 JSON 규격 (content script → Spring)
{
  "site": "baekjoon",
  "problemId": "1000",
  "problemTitle": "A+B",
  "language": "Java",
  "code": "public class Main {...}",
  "status": "AC",
  "submittedAt": "2025-11-30T13:00:00+09:00"
}
필드 정의:

필드	타입	설명
site	string	baekjoon 또는 programmers
problemId	string	문제 번호
problemTitle	string	문제의 실제 제목
language	string	제출 언어
code	string	제출한 소스코드
status	string	"AC" 고정
submittedAt	string	ISO 8601 형식 날짜

--- 
# 5. Spring Boot API 명세
## 5.1 엔드포인트
POST /api/submissions
- 크롬 확장이 정답 판정 시 서버에 전송하는 API
- 인증(JWT)은 optional → 프로젝트 요구에 따라 추가 가능