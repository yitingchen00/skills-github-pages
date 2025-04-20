document.addEventListener('DOMContentLoaded', function () {
    const name = localStorage.getItem('name');
    const contact = localStorage.getItem('contact');
  
    // 若未登入就導回登入頁面或給提示
    if (!contact) {
      alert('請先登入才能建立活動！將為你導回登入頁面');
      window.location.href = 'login.html'; // ⬅️ 可修改為你實際的登入頁面位置
      return;
    }
  
    // 綁定表單送出
    document.getElementById('eventForm').addEventListener('submit', function (e) {
      e.preventDefault();
  
      const event = {
        title: document.getElementById('title').value,
        startDate: document.getElementById('startDate').value,
        startTime: document.getElementById('startTime').value,
        endDate: document.getElementById('endDate').value,
        endTime: document.getElementById('endTime').value,
        location: document.getElementById('location').value,
        intro: document.getElementById('intro').value,
        category: document.getElementById('category').value,
        limit: document.getElementById('limit').value || null,
        creator: {
          name: name || '匿名',
          contact: contact || '未填'
        },
        joinList: []
      };
  
      // 儲存到 localStorage
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      events.push(event);
      localStorage.setItem('events', JSON.stringify(events));
  
      alert('活動已建立！');
      this.reset();
    });
  });
  