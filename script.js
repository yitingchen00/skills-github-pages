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

    const githubUsername = "yitingchen00";
    const repoName = "skills-github-pages";
    const filePath = "database.xlsx";
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

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
            sha = data.sha;
        }
    } catch (error) {
        console.log("檔案可能不存在，將新建檔案");
    }

    const body = JSON.stringify({
        message: "使用者儲存筆記",
        content: encodedContent,
        sha: sha
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
