async function getConfig() {
    const response = await fetch('./config.json');
    const config = await response.json();
    return config;
}

async function saveToGitHub() {
    const config = await getConfig();
    const fileUrlToken = config.fileUrlToken;  // 用於 fileUrl 的 PAT

    const content = document.getElementById("userInput").value;
    
    if (!content) {
        alert("請輸入內容！");
        return;
    }

    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    const githubUsername = "yitingchen00";  // 你的 GitHub 用戶名
    const repoName = "skills-github-pages";  // 你的倉庫名稱
    const filePath = "database.xlsx";        // 存儲文件的路徑
    const fileUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${filePath}`;

    // 先檢查該檔案是否已存在（需要取得 SHA 值來更新）
    let sha = null;
    try {
        const response = await fetch(fileUrl, {
            headers: {
                "Authorization": `token ${fileUrlToken}`,
                "Accept": "application/vnd.github.v3+json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            sha = data.sha;  // 取得檔案 SHA 值（若檔案存在）
        }
    } catch (error) {
        console.log("檔案可能不存在，將新建檔案");
    }

    // 發送 PUT 請求來新增或更新檔案
    const body = JSON.stringify({
        message: "使用者儲存筆記",
        content: encodedContent,
        sha: sha  // 若檔案已存在，則需要 SHA
    });

    const result = await fetch(fileUrl, {
        method: "PUT",
        headers: {
            "Authorization": `token ${fileUrlToken}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        },
        body: body
    });

    if (result.ok) {
        alert("筆記已成功儲存到 GitHub!");
    } else {
        alert("儲存失敗，請檢查權限或 API 設定");
    }
}
