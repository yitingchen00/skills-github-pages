// 載入 localStorage 的資料
function loadContactInfo() {
  const cells = document.querySelectorAll('[contenteditable][data-key]');
  cells.forEach(cell => {
    const key = cell.getAttribute('data-key');
    const saved = localStorage.getItem(key);
    if (saved) {
      cell.innerText = saved;
    }
  });
}

// 儲存資料並顯示 Bootstrap Alert
function saveContactInfo() {
  const cells = document.querySelectorAll('[contenteditable][data-key]');
  cells.forEach(cell => {
    const key = cell.getAttribute('data-key');
    localStorage.setItem(key, cell.innerText.trim());
  });

  const alertBox = document.getElementById('save-alert');
  alertBox.classList.remove('d-none');
  setTimeout(() => {
    alertBox.classList.add('d-none');
  }, 2000);
}

document.addEventListener('DOMContentLoaded', loadContactInfo);
