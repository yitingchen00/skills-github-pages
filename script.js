async function getToken() {
    const response = await fetch('./config.json');
    const data = await response.json();
    return data.token;
}

async function saveToGitHub() {
    const token = await getToken();  // 從 config.json 中獲取 PAT
    const content = document.getElementById("userInput").value;
    
    if (!content) {
        alert("請輸入內容！");
        return;
    }

    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    const githubUsername = "yitingchen00";
    const repoName = "skills-github-pages";
    const fileUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/dispatches`;

    const response = await fetch(fileUrl, {
        method: "POST",
        headers: {
            "Authorization": `token ${token}`,
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
