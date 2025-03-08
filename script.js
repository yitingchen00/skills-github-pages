async function saveToGitHub() {
    const content = document.getElementById("userInput").value;
    
    if (!content) {
        alert("請輸入內容！");
        return;
    }

    // 轉換為 Base64
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // 發送 GitHub Actions 事件
    const githubUsername = "yitingchen00";
    const repoName = "skills-github-pages";
    const fileUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/dispatches`;

    const response = await fetch(fileUrl, {
        method: "POST",
        headers: {
            "Authorization": "token 你的GitHub個人存取令牌",  // ⚠️ 這裡要填入你的 Token
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            event_type: "update-excel",
            client_payload: {
                data: encodedContent
            }
        })
    });

    if (response.ok) {
        alert("請求已發送，GitHub Actions 會更新 Excel！");
    } else {
        alert("發送失敗，請檢查 GitHub Actions 設定：" + JSON.stringify(await response.json()));
    }
}
