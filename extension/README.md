# Algo Auto Submit Tracker - Chrome Extension

백준(BOJ)과 프로그래머스(Programmers)에서 문제를 풀고 정답을 받으면 자동으로 서버에 제출 기록을 저장하는 크롬 확장 프로그램입니다.

## 설치 방법

1. Chrome 브라우저에서 `chrome://extensions` 페이지를 엽니다
2. 우측 상단의 "개발자 모드" 토글을 활성화합니다
3. "압축해제된 확장 프로그램을 로드합니다" 버튼을 클릭합니다
4. 이 `extension` 폴더를 선택합니다

## 사용 방법

1. 확장 프로그램 아이콘을 클릭하여 팝업을 엽니다
2. 백엔드 서버 URL과 사용자 ID를 설정합니다
   - 개발 환경: `http://localhost:8080`
   - 사용자 ID: 본인의 사용자 ID (기본값: 1)
3. "설정 저장" 버튼을 클릭합니다
4. 백준 또는 프로그래머스에서 문제를 풉니다
5. 코드를 제출하고 정답을 받으면 자동으로 서버에 저장됩니다

## 동작 원리

### 백준 (BOJ)
1. `/submit/{problemId}` 페이지에서 제출 버튼 클릭 시 코드와 문제 정보를 저장
2. `/status` 페이지에서 "맞았습니다!!" 결과를 감지
3. 저장된 정보와 함께 서버로 전송

### 프로그래머스 (Programmers)
1. 문제 페이지에서 제출 버튼 클릭 시 코드와 문제 정보를 저장
2. MutationObserver로 결과 패널을 감시
3. "정답입니다" 메시지 감지 시 서버로 전송

## 파일 구조

```
extension/
├── manifest.json           # 확장 프로그램 설정
├── background.js          # 백그라운드 서비스 워커
├── content/
│   ├── baekjoon.js       # 백준 content script
│   └── programmers.js    # 프로그래머스 content script
├── popup/
│   ├── popup.html        # 팝업 UI
│   ├── popup.css         # 팝업 스타일
│   └── popup.js          # 팝업 로직
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 개발자를 위한 참고사항

### 디버깅
- Content Script: 해당 페이지에서 개발자 도구(F12)를 열고 Console 탭 확인
- Background Script: `chrome://extensions` > 확장 프로그램 > "Service Worker" 링크 클릭
- Popup: 팝업을 연 상태에서 우클릭 > "검사"

### 로그 메시지
- `[BOJ]`: 백준 관련 로그
- `[PG]`: 프로그래머스 관련 로그
- `[Background]`: 백그라운드 스크립트 로그

### 주의사항
- 백준과 프로그래머스의 DOM 구조가 변경되면 셀렉터를 업데이트해야 할 수 있습니다
- Chrome Storage는 동기화되므로 여러 기기에서 같은 설정을 사용할 수 있습니다

## 문제 해결

### 자동 저장이 안 될 때
1. 개발자 도구 Console에서 에러 메시지 확인
2. 백엔드 서버가 실행 중인지 확인
3. 팝업에서 설정한 URL과 사용자 ID가 올바른지 확인
4. CORS 설정이 올바른지 확인 (백엔드 WebConfig 참조)

### DOM 셀렉터 업데이트가 필요한 경우
- `content/baekjoon.js`: 백준 DOM 구조 변경 시
- `content/programmers.js`: 프로그래머스 DOM 구조 변경 시
