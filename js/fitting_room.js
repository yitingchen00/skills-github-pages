const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const limitMsg = document.getElementById('limitMsg');
let imageCount = 0;

imageInput.addEventListener('change', function () {
  const files = Array.from(imageInput.files);
  if ((imageCount + files.length) > 2) {
    limitMsg.classList.remove('d-none');
    imageInput.value = '';
    return;
  } else {
    limitMsg.classList.add('d-none');
  }

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('uploaded-image');

      const img = document.createElement('img');
      img.src = e.target.result;

      const btn = document.createElement('button');
      btn.innerText = '×';
      btn.className = 'remove-btn';
      btn.onclick = function () {
        imagePreview.removeChild(wrapper);
        imageCount--;
      };

      wrapper.appendChild(img);
      wrapper.appendChild(btn);
      imagePreview.appendChild(wrapper);
      imageCount++;
    };
    reader.readAsDataURL(file);
  });

  imageInput.value = '';
});

let regenerateCount = parseInt(localStorage.getItem("regenerateCount") || "2");

function submitMockAI() {
  if (imageCount === 0) {
    alert('請先上傳至少一張圖片');
    return;
  }

  if (regenerateCount <= 0) {
    alert("已達免費模擬次數上限，請加購服務以繼續。");
    return;
  }

  regenerateCount--;
  localStorage.setItem("regenerateCount", regenerateCount);

  fetch('/static/mock-result.json')
    .then(response => response.json())
    .then(data => {
      const resultImg = document.getElementById('resultImage');
      const resultText = document.getElementById('resultText');

      resultImg.src = data.image;
      resultText.textContent = data.description;

      document.getElementById('resultArea').style.display = 'block';

      updateRegenerateInfo();  // 顯示剩餘次數
    })
    .catch(error => {
      console.error('載入模擬結果失敗:', error);
    });
}

function updateRegenerateInfo() {
  const info = document.getElementById('regenerateInfo');
  if (info) {
    info.textContent = `剩餘免費模擬次數：${regenerateCount}`;
  }
}
