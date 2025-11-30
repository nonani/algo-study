# BOJ(백준) Content Script 초안

이 스크립트는 **백준에서 정답(맞았습니다!!)** 이 나왔을 때,
해당 제출 정보를 읽어와 **Spring 서버로 전송**하는 역할을 한다.

핵심 아이디어:

1. `/submit/{id}` 페이지에서 **제출 버튼 클릭 시점**에
   - 문제 번호, 언어, 코드 등을 읽어서 `chrome.storage` 에 저장한다.
2. 제출 후 `/status` 페이지로 이동하면
   - 첫 번째 row의 결과가 `"맞았습니다!!"` 인지 확인한다.
   - 맞으면, `chrome.storage` 에 저장된 정보와 합쳐서 서버로 POST 요청을 보낸다.

> 주의: 실제 CSS 셀렉터는 BOJ DOM 구조를 확인하여 필요 시 수정해야 한다.

---

## 구조

- 이 파일은 `content/baekjoon.js` 로 사용된다.
- `manifest.json` 에서 `matches: ["https://www.acmicpc.net/*"]` 로 로딩된다고 가정한다.
- Spring 서버 주소는 `BACKEND_BASE_URL` 상수로 관리한다.

---

## 코드 초안

```js
// content/baekjoon.js

// TODO: 실제 서버 주소로 변경
const BACKEND_BASE_URL = "http://localhost:8080";

(function () {
  const href = location.href;

  if (href.includes("/submit/")) {
    handleSubmitPage();
  } else if (href.includes("/status")) {
    handleStatusPage();
  }

  /**
   * /submit/{id} 페이지 처리
   * - 제출 버튼 클릭 시 문제 정보 + 코드 저장
   */
  function handleSubmitPage() {
    console.log("[BOJ] Submit page detected");

    // 문제 번호는 URL에서 추출 (예: /submit/1000)
    const problemIdMatch = location.pathname.match(/\/submit\/(\d+)/);
    const problemId = problemIdMatch ? problemIdMatch[1] : null;

    // 언어 선택 요소 (실제 셀렉터는 확인 필요)
    const languageSelect = document.querySelector("select[name='language']");

    // 코드 입력 textarea (실제 name은 BOJ DOM 기준으로 확인)
    const codeTextarea = document.querySelector("textarea[name='source']");
    if (!codeTextarea) {
      console.warn("[BOJ] 코드 입력 textarea를 찾지 못했습니다.");
    }

    // 제출 버튼 (정확한 셀렉터는 DOM 확인 후 수정)
    const submitButton = document.querySelector("input[type='submit'], button[type='submit']");
    if (!submitButton) {
      console.warn("[BOJ] 제출 버튼을 찾지 못했습니다.");
      return;
    }

    submitButton.addEventListener("click", () => {
      try {
        const language = languageSelect ? languageSelect.value : "";
        const code = codeTextarea ? codeTextarea.value : "";
        const submittedAt = new Date().toISOString();

        const payload = {
          site: "baekjoon",
          problemId,
          problemTitle: null, // BOJ는 제목을 따로 안 써도 되거나, 나중에 확장
          language,
          code,
          status: "PENDING",
          submittedAt,
        };

        console.log("[BOJ] 저장할 제출 정보:", payload);

        // status 페이지에서 사용할 pendingSubmission 저장
        chrome.storage.sync.set({ bojPendingSubmission: payload }, () => {
          console.log("[BOJ] pending submission saved to storage");
        });
      } catch (e) {
        console.error("[BOJ] Error while handling submit click:", e);
      }
    });
  }

  /**
   * /status 페이지 처리
   * - 첫 번째 행의 결과가 맞았습니다!! 일 경우, 저장된 코드와 함께 서버로 전송
   */
  function handleStatusPage() {
    console.log("[BOJ] Status page detected");

    // DOM이 로드되었는지 확인 후 실행
    window.addEventListener("load", () => {
      setTimeout(processStatusRow, 500); // 약간의 딜레이 후 파싱
    });
  }

  function processStatusRow() {
    // 실제 테이블/셀렉터는 DOM 구조에 맞게 조정 필요
    const firstRow = document.querySelector("#status-table tbody tr");
    if (!firstRow) {
      console.warn("[BOJ] status 첫 번째 row를 찾지 못했습니다.");
      return;
    }

    const resultCell = firstRow.querySelector(".result");
    const problemIdCell = firstRow.querySelector(".problem_id");
    const languageCell = firstRow.querySelector(".language");
    const timeCell = firstRow.querySelector(".time");

    if (!resultCell) {
      console.warn("[BOJ] result cell을 찾지 못했습니다.");
      return;
    }

    const resultText = resultCell.innerText.trim();
    console.log("[BOJ] result text:", resultText);

    // 정답이 아닌 경우 전송하지 않음
    if (!resultText.includes("맞았습니다")) {
      console.log("[BOJ] 정답이 아니므로 서버 전송 생략");
      return;
    }

    const problemIdFromStatus = problemIdCell ? problemIdCell.innerText.trim() : null;
    const languageFromStatus = languageCell ? languageCell.innerText.trim() : null;
    const judgedAtText = timeCell ? timeCell.innerText.trim() : null;

    // 저장해둔 pendingSubmission 가져오기
    chrome.storage.sync.get(["bojPendingSubmission"], ({ bojPendingSubmission }) => {
      if (!bojPendingSubmission) {
        console.warn("[BOJ] storage에 pendingSubmission이 없습니다.");
        return;
      }

      // problemId가 다를 경우(동시 여러 제출 등) 체크
      if (
        problemIdFromStatus &&
        bojPendingSubmission.problemId &&
        problemIdFromStatus !== bojPendingSubmission.problemId
      ) {
        console.warn("[BOJ] status의 problemId와 pendingSubmission의 problemId가 다릅니다.");
      }

      const payload = {
        ...bojPendingSubmission,
        status: "AC",
        // judgedAt를 submittedAt으로 쓸지, 별도 필드로 둘지는 백엔드 설계에 따라
        submittedAt: bojPendingSubmission.submittedAt ?? new Date().toISOString(),
      };

      console.log("[BOJ] 서버로 전송할 payload:", payload);

      sendToBackend(payload)
        .then(() => {
          console.log("[BOJ] 서버 전송 성공");
          chrome.storage.sync.remove("bojPendingSubmission");
        })
        .catch((err) => {
          console.error("[BOJ] 서버 전송 실패:", err);
        });
    });
  }

  /**
   * 백엔드 서버로 제출 정보를 전송
   */
  async function sendToBackend(payload) {
    const url = `${BACKEND_BASE_URL}/api/submissions`;

    // TODO: JWT 인증 등을 사용하는 경우, 토큰을 chrome.storage에서 조회 후 Authorization 헤더 추가
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }
  }
})();
