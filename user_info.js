document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");
    const gmail = params.get("gmail");
  
    if (username && gmail) {
      const display = document.getElementById("user-info");
      if (display) {
        display.textContent = `👋 歡迎 ${username}（${gmail}）`;
      }
    }
  });
  