// Background Service Worker for Algo Auto Submit Tracker

console.log("[Background] Service worker initialized");

// 확장 프로그램 설치 시 초기 설정
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Background] Extension installed");

  // 기본 설정 저장
  chrome.storage.sync.set({
    backendUrl: "http://localhost:8080",
    userId: null,
    token: null
  });
});

// Content script로부터 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Background] Message received:", request);

  if (request.type === "SUBMISSION_SUCCESS") {
    handleSubmissionSuccess(request.payload)
      .then(response => {
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error("[Background] Error handling submission:", error);
        sendResponse({ success: false, error: error.message });
      });

    // 비동기 응답을 위해 true 반환
    return true;
  }
});

/**
 * 제출 성공 시 백엔드로 데이터 전송
 */
async function handleSubmissionSuccess(payload) {
  try {
    // Storage에서 설정 가져오기
    const settings = await chrome.storage.sync.get(["backendUrl", "userId", "token"]);
    const backendUrl = settings.backendUrl || "http://localhost:8080";
    const userId = settings.userId || 1; // 기본값 (개발용)

    const url = `${backendUrl}/api/submissions`;

    console.log("[Background] Sending to backend:", url, payload);

    const headers = {
      "Content-Type": "application/json",
      "X-USER-ID": userId.toString()
    };

    // JWT 토큰이 있으면 추가
    if (settings.token) {
      headers["Authorization"] = `Bearer ${settings.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend responded with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("[Background] Backend response:", result);

    // 성공 알림 표시
    showNotification("제출 기록 저장 완료", `${payload.problemTitle || payload.problemId} 문제가 저장되었습니다.`);

    return result;
  } catch (error) {
    console.error("[Background] Failed to send to backend:", error);

    // 실패 알림 표시
    showNotification("제출 기록 저장 실패", error.message);

    throw error;
  }
}

/**
 * 브라우저 알림 표시
 */
function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: title,
    message: message
  });
}
