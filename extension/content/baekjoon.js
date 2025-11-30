// BOJ(백준) Content Script

console.log("[BOJ] Content script loaded");

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

    if (!problemId) {
      console.warn("[BOJ] Could not extract problem ID from URL");
      return;
    }

    // 언어 선택 요소
    const languageSelect = document.querySelector("select[name='language']");

    // 코드 입력 textarea
    const codeTextarea = document.querySelector("textarea[name='source']");

    if (!codeTextarea) {
      console.warn("[BOJ] Code textarea not found");
    }

    // 제출 버튼
    const submitButton = document.querySelector("input[type='submit'], button[type='submit']");

    if (!submitButton) {
      console.warn("[BOJ] Submit button not found");
      return;
    }

    submitButton.addEventListener("click", () => {
      try {
        const language = languageSelect ? languageSelect.options[languageSelect.selectedIndex].text : "";
        const code = codeTextarea ? codeTextarea.value : "";
        const submittedAt = new Date().toISOString();

        const payload = {
          site: "baekjoon",
          problemId,
          problemTitle: `백준 ${problemId}번`,
          language,
          code,
          status: "PENDING",
          submittedAt,
        };

        console.log("[BOJ] Saving pending submission:", payload);

        chrome.storage.sync.set({ bojPendingSubmission: payload }, () => {
          console.log("[BOJ] Pending submission saved to storage");
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
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(processStatusRow, 1000);
      });
    } else {
      setTimeout(processStatusRow, 1000);
    }
  }

  function processStatusRow() {
    // 첫 번째 제출 결과 row 찾기
    const firstRow = document.querySelector("#status-table tbody tr");

    if (!firstRow) {
      console.warn("[BOJ] Status table first row not found");
      return;
    }

    // 결과 셀 찾기
    const resultCell = firstRow.querySelector("td.result span.result-text");

    if (!resultCell) {
      console.warn("[BOJ] Result cell not found");
      return;
    }

    const resultText = resultCell.innerText.trim();
    console.log("[BOJ] Result text:", resultText);

    // 정답이 아닌 경우 전송하지 않음
    if (!resultText.includes("맞았습니다")) {
      console.log("[BOJ] Not accepted, skipping backend submission");
      return;
    }

    // 문제 번호 가져오기
    const problemIdCell = firstRow.querySelector("td.problem_id a");
    const problemIdFromStatus = problemIdCell ? problemIdCell.innerText.trim() : null;

    // 언어 가져오기
    const languageCell = firstRow.querySelector("td a");
    const languageFromStatus = languageCell ? languageCell.innerText.trim() : null;

    // 저장해둔 pendingSubmission 가져오기
    chrome.storage.sync.get(["bojPendingSubmission"], ({ bojPendingSubmission }) => {
      if (!bojPendingSubmission) {
        console.warn("[BOJ] No pending submission found in storage");
        return;
      }

      // problemId가 다를 경우 체크
      if (problemIdFromStatus && bojPendingSubmission.problemId &&
          problemIdFromStatus !== bojPendingSubmission.problemId) {
        console.warn("[BOJ] Problem ID mismatch:", {
          fromStatus: problemIdFromStatus,
          fromPending: bojPendingSubmission.problemId
        });
      }

      const payload = {
        ...bojPendingSubmission,
        status: "AC",
        submittedAt: bojPendingSubmission.submittedAt || new Date().toISOString(),
      };

      console.log("[BOJ] Sending payload to backend:", payload);

      // Background script로 메시지 전송
      chrome.runtime.sendMessage(
        { type: "SUBMISSION_SUCCESS", payload },
        (response) => {
          if (response && response.success) {
            console.log("[BOJ] Backend submission successful");
            chrome.storage.sync.remove("bojPendingSubmission");
          } else {
            console.error("[BOJ] Backend submission failed:", response?.error);
          }
        }
      );
    });
  }
})();
