

## 2. `programmers-content-script.md` (프로그래머스 전용 content script)

```md
# Programmers(프로그래머스) Content Script 초안

이 스크립트는 **프로그래머스에서 문제 제출 후 "정답입니다" 메시지가 표시되는 순간**을 감지하여,  
해당 제출 정보를 Spring 서버로 전송하는 역할을 한다.

핵심 아이디어:

1. 제출 버튼 클릭 시
   - 문제 ID, 제목, 언어, 코드 등을 읽어 `chrome.storage` 에 저장한다.
2. 결과 패널 DOM에 `MutationObserver` 를 걸어두고,
   - `"정답입니다"` 문자열이 등장하면 AC로 판정,
   - 저장된 정보와 함께 서버에 POST 요청을 보낸다.

> 실제 CSS 셀렉터와 에디터(CodeMirror/Monaco) 접근 방식은 Programmers DOM 구조를 확인해 적절히 수정해야 한다.

---

## 구조

- 이 파일은 `content/programmers.js` 로 사용된다.
- `manifest.json` 에서 `matches: ["https://school.programmers.co.kr/*"]` 로 로딩된다고 가정한다.
- Spring 서버 주소는 `BACKEND_BASE_URL` 상수로 관리한다.

---

## 코드 초안

```js
// content/programmers.js

// TODO: 실제 서버 주소로 변경
const BACKEND_BASE_URL = "http://localhost:8080";

// "정답입니다" 등 성공 문구에 포함될 문자열
const SUCCESS_KEYWORDS = ["정답입니다", "채점을 완료했습니다"];

(function () {
  console.log("[PG] Programmers content script loaded");

  // 페이지 로드 후 처리
  window.addEventListener("load", () => {
    setupSubmitHook();
    setupResultObserver();
  });

  /**
   * 제출 버튼에 이벤트 후킹
   * - 제출 시점에 문제 정보 + 코드 + 언어를 storage에 저장
   */
  function setupSubmitHook() {
    console.log("[PG] try to setup submit hook");

    // 제출 버튼 셀렉터는 실제 DOM 기준으로 수정 필요
    const submitButton =
      document.querySelector("button[type='submit']") ||
      document.querySelector("button.btn-submit");

    if (!submitButton) {
      console.warn("[PG] 제출 버튼을 찾지 못했습니다.");
      return;
    }

    submitButton.addEventListener("click", () => {
      try {
        const info = collectProblemInfo();
        if (!info) {
          console.warn("[PG] 문제 정보를 수집하지 못했습니다.");
          return;
        }

        const payload = {
          site: "programmers",
          problemId: info.problemId,
          problemTitle: info.problemTitle,
          language: info.language,
          code: info.code,
          status: "PENDING",
          submittedAt: new Date().toISOString(),
        };

        console.log("[PG] pending submission:", payload);

        chrome.storage.sync.set({ pgPendingSubmission: payload }, () => {
          console.log("[PG] pending submission saved");
        });
      } catch (e) {
        console.error("[PG] Error on submit click:", e);
      }
    });
  }

  /**
   * Programmers 문제 정보 + 코드 수집
   * - URL에서 problemId 추출
   * - 제목 DOM에서 제목 추출
   * - 에디터에서 코드 추출 (CodeMirror/Monaco 구조에 따라 수정 필요)
   * - 언어 드롭다운에서 현재 선택된 값 추출
   */
  function collectProblemInfo() {
    const url = location.href;
    const idMatch = url.match(/lessons\/(\d+)/);
    const problemId = idMatch ? idMatch[1] : null;

    const titleEl = document.querySelector(".lesson-title");
    const problemTitle = titleEl ? titleEl.innerText.trim() : "";

    // 언어 선택 셀렉터 (실제 DOM 보고 수정)
    const languageSelect = document.querySelector("select#language, select[name='language']");
    const language = languageSelect ? languageSelect.value : "";

    // 코드 추출: 실제로는 CodeMirror 또는 Monaco 인스턴스를 사용해야 할 수 있음.
    // 아래는 단순 textarea 예시이며, 실제 DOM 확인 후 수정 필요.
    const textarea = document.querySelector("textarea");
    let code = textarea ? textarea.value : "";

    // TODO: CodeMirror 예시 (DOM 구조에 맞게 수정)
    // const cmEl = document.querySelector(".CodeMirror");
    // if (cmEl && cmEl.CodeMirror) {
    //   code = cmEl.CodeMirror.getValue();
    // }

    if (!problemId) {
      console.warn("[PG] problemId를 URL에서 추출하지 못했습니다.");
    }

    return {
      problemId,
      problemTitle,
      language,
      code,
    };
  }

  /**
   * 결과 패널에 MutationObserver를 설치하여
   * "정답입니다" 등의 문구가 나타날 때 AC로 판정
   */
  function setupResultObserver() {
    console.log("[PG] setup result observer");

    // 결과 패널 요소 (실제 셀렉터는 DOM 확인 필요)
    const resultPanel =
      document.querySelector(".result, .coding-test-result, .testcase-result") ||
      document.querySelector(".modal-body");

    if (!resultPanel) {
      console.warn("[PG] 결과 패널 요소를 찾지 못했습니다. 셀렉터를 수정해야 할 수 있습니다.");
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const text = resultPanel.innerText || "";
        if (isSuccessText(text)) {
          console.log("[PG] Success message detected:", text);
          handleSuccess();
          break;
        }
      }
    });

    observer.observe(resultPanel, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    console.log("[PG] MutationObserver registered on result panel");
  }

  function isSuccessText(text) {
    const lower = text.toLowerCase();
    return SUCCESS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  }

  /**
   * 정답 판정 시 storage에 있는 pendingSubmission을 읽어서 서버로 전송
   */
  function handleSuccess() {
    chrome.storage.sync.get(["pgPendingSubmission"], ({ pgPendingSubmission }) => {
      if (!pgPendingSubmission) {
        console.warn("[PG] pgPendingSubmission not found in storage");
        return;
      }

      const payload = {
        ...pgPendingSubmission,
        status: "AC",
        submittedAt: pgPendingSubmission.submittedAt ?? new Date().toISOString(),
      };

      console.log("[PG] Sending payload to backend:", payload);

      sendToBackend(payload)
        .then(() => {
          console.log("[PG] Backend submit success");
          chrome.storage.sync.remove("pgPendingSubmission");
        })
        .catch((err) => {
          console.error("[PG] Backend submit failed:", err);
        });
    });
  }

  /**
   * 백엔드 서버로 제출 정보를 전송
   */
  async function sendToBackend(payload) {
    const url = `${BACKEND_BASE_URL}/api/submissions`;

    // TODO: JWT 인증 사용 시 chrome.storage에서 토큰을 꺼내와 Authorization 헤더 추가
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
