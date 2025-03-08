async function saveToGitHub() {
    const content = document.getElementById("userInput").value;
    
    if (!content) {
        alert("請輸入內容！");
        return;
    }

    const githubUsername = "yitingchen00";
    const repoName = "skills-github-pages";
    const filePath = "database.xlsx";  // 存到 GitHub 的路徑
    const token = "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";

    // 將內容轉換為 Base64（GitHub API 需要這種格式）
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // 先檢查該檔案是否已存在（需要取得 SHA 值來更新）
    const fileUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${filePath}`;
    
    let sha = null;
    try {
        const response = await fetch(fileUrl, {
            headers: {
                "Authorization": `token ${token}`,
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
            "Authorization": `token ${token}`,
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
