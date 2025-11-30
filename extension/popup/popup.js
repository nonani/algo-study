// Popup script for Algo Auto Submit Tracker

document.addEventListener("DOMContentLoaded", () => {
  const backendUrlInput = document.getElementById("backendUrl");
  const userIdInput = document.getElementById("userId");
  const saveButton = document.getElementById("saveSettings");
  const statusMessage = document.getElementById("statusMessage");

  // 저장된 설정 불러오기
  chrome.storage.sync.get(["backendUrl", "userId"], (result) => {
    if (result.backendUrl) {
      backendUrlInput.value = result.backendUrl;
    }
    if (result.userId) {
      userIdInput.value = result.userId;
    }
  });

  // 설정 저장
  saveButton.addEventListener("click", () => {
    const backendUrl = backendUrlInput.value.trim();
    const userId = parseInt(userIdInput.value) || null;

    if (!backendUrl) {
      statusMessage.textContent = "백엔드 URL을 입력해주세요";
      statusMessage.style.color = "red";
      return;
    }

    chrome.storage.sync.set(
      {
        backendUrl: backendUrl,
        userId: userId,
      },
      () => {
        statusMessage.textContent = "설정이 저장되었습니다!";
        statusMessage.style.color = "green";

        setTimeout(() => {
          statusMessage.textContent = "준비 완료";
          statusMessage.style.color = "#555";
        }, 2000);
      }
    );
  });
});
