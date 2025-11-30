// Programmers(프로그래머스) Content Script

console.log("[PG] Programmers content script loaded");

const BACKEND_BASE_URL = "http://localhost:8080";
const SUCCESS_KEYWORDS = ["정답입니다", "채점을 완료했습니다"];

(function () {
  console.log("[PG] Initializing...");

  // 페이지 로드 후 처리
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  function initialize() {
    console.log("[PG] Page loaded, setting up hooks");
    setupSubmitHook();
    setupResultObserver();
  }

  /**
   * 제출 버튼에 이벤트 후킹
   * - 제출 시점에 문제 정보 + 코드 + 언어를 storage에 저장
   */
  function setupSubmitHook() {
    console.log("[PG] Setting up submit hook");

    // 제출 버튼 찾기 (셀렉터는 실제 DOM 기준으로 수정 필요)
    const submitButton =
      document.querySelector("button[type='submit']") ||
      document.querySelector("button.btn-primary") ||
      document.querySelector("button.run-code");

    if (!submitButton) {
      console.warn("[PG] Submit button not found, retrying...");
      // 버튼이 동적으로 생성될 수 있으므로 재시도
      setTimeout(setupSubmitHook, 2000);
      return;
    }

    console.log("[PG] Submit button found:", submitButton);

    submitButton.addEventListener("click", () => {
      console.log("[PG] Submit button clicked");

      // 약간의 딜레이 후 정보 수집 (DOM 업데이트 대기)
      setTimeout(() => {
        try {
          const info = collectProblemInfo();

          if (!info || !info.problemId) {
            console.warn("[PG] Could not collect problem info");
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

          console.log("[PG] Saving pending submission:", payload);

          chrome.storage.sync.set({ pgPendingSubmission: payload }, () => {
            console.log("[PG] Pending submission saved");
          });
        } catch (e) {
          console.error("[PG] Error on submit click:", e);
        }
      }, 500);
    });
  }

  /**
   * Programmers 문제 정보 + 코드 수집
   */
  function collectProblemInfo() {
    // URL에서 problemId 추출
    const url = location.href;
    const idMatch = url.match(/lessons\/(\d+)/);
    const problemId = idMatch ? idMatch[1] : null;

    // 제목 추출
    const titleEl =
      document.querySelector(".lesson-title") ||
      document.querySelector("h3") ||
      document.querySelector("h2");
    const problemTitle = titleEl ? titleEl.innerText.trim() : "";

    // 언어 선택 (셀렉터 확인 필요)
    const languageSelect =
      document.querySelector("select#language") ||
      document.querySelector("select[name='language']");
    const language = languageSelect ? languageSelect.value : "";

    // 코드 추출 (Monaco Editor 또는 CodeMirror)
    let code = "";

    // Monaco Editor
    if (window.monaco && window.monaco.editor) {
      const editors = window.monaco.editor.getModels();
      if (editors.length > 0) {
        code = editors[0].getValue();
      }
    }

    // CodeMirror fallback
    if (!code) {
      const cmEl = document.querySelector(".CodeMirror");
      if (cmEl && cmEl.CodeMirror) {
        code = cmEl.CodeMirror.getValue();
      }
    }

    // Textarea fallback
    if (!code) {
      const textarea = document.querySelector("textarea");
      code = textarea ? textarea.value : "";
    }

    if (!problemId) {
      console.warn("[PG] Could not extract problem ID from URL");
    }

    if (!code) {
      console.warn("[PG] Could not extract code");
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
    console.log("[PG] Setting up result observer");

    // 결과 패널 찾기 (셀렉터는 실제 DOM 확인 필요)
    const resultPanel =
      document.querySelector(".result") ||
      document.querySelector(".coding-test-result") ||
      document.querySelector(".testcase-result") ||
      document.querySelector(".modal-body") ||
      document.body; // fallback to body

    if (!resultPanel) {
      console.warn("[PG] Result panel not found");
      return;
    }

    console.log("[PG] Result panel found:", resultPanel);

    const observer = new MutationObserver((mutations) => {
      const text = resultPanel.innerText || "";

      if (isSuccessText(text)) {
        console.log("[PG] Success message detected:", text);
        handleSuccess();
        observer.disconnect(); // 성공 감지 후 observer 중지
      }
    });

    observer.observe(resultPanel, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    console.log("[PG] MutationObserver registered");
  }

  function isSuccessText(text) {
    const lower = text.toLowerCase();
    return SUCCESS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  }

  /**
   * 정답 판정 시 storage에 있는 pendingSubmission을 읽어서 서버로 전송
   */
  function handleSuccess() {
    console.log("[PG] Handling success");

    chrome.storage.sync.get(["pgPendingSubmission"], ({ pgPendingSubmission }) => {
      if (!pgPendingSubmission) {
        console.warn("[PG] No pending submission found in storage");
        return;
      }

      const payload = {
        ...pgPendingSubmission,
        status: "AC",
        submittedAt: pgPendingSubmission.submittedAt || new Date().toISOString(),
      };

      console.log("[PG] Sending payload to backend:", payload);

      // Background script로 메시지 전송
      chrome.runtime.sendMessage(
        { type: "SUBMISSION_SUCCESS", payload },
        (response) => {
          if (response && response.success) {
            console.log("[PG] Backend submission successful");
            chrome.storage.sync.remove("pgPendingSubmission");
          } else {
            console.error("[PG] Backend submission failed:", response?.error);
          }
        }
      );
    });
  }
})();
