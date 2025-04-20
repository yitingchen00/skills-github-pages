// 假設你的 HTML 中有一個 id="eventList" 的容器來顯示活動
// 以及一個 FullCalendar 容器 id="calendar"

// 初始化日曆
function initCalendar(events) {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'zh-tw',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listWeek'
      },
      events: events.map(event => ({
        title: event.title + ' - by ' + event.creator.name,
        start: event.startDate + (event.startTime ? 'T' + event.startTime : ''),
        end: event.endDate + (event.endTime ? 'T' + event.endTime : ''),
        extendedProps: { eventData: event }
      })),
      eventClick: function(info) {
        const data = info.event.extendedProps.eventData;
        showEventDetail(data);
      }
    });
    calendar.render();
  }
  
  // 顯示活動細節與加入按鈕
  function showEventDetail(event) {
    const detailArea = document.getElementById('eventDetail');
    const joined = event.joinList || [];
  
    let html = `<h3>${event.title}</h3>
      <p><strong>時間：</strong>${event.startDate}${event.startTime ? ' ' + event.startTime : ''} ～ ${event.endDate}${event.endTime ? ' ' + event.endTime : ''}</p>
      <p><strong>地點：</strong>${event.location}</p>
      <p><strong>介紹：</strong>${event.intro}</p>
      <p><strong>類別：</strong>${event.category}</p>
      <p><strong>建立者：</strong>${event.creator.name} (${event.creator.contact})</p>
      <p><strong>參加人數：</strong>${joined.length}${event.limit ? ' / ' + event.limit : ''}</p>
      <ul>${joined.map(p => `<li>${p.name} (${p.contact})</li>`).join('')}</ul>
      <button onclick='joinEvent("${event.title}")'>我要加入</button>`;
  
    detailArea.innerHTML = html;
  }
  
  // 加入活動邏輯
  function joinEvent(title) {
    const name = localStorage.getItem('name') || '匿名';
    const contact = localStorage.getItem('contact');
  
    if (!contact) {
      alert('請先登入才能加入活動！');
      return;
    }
  
    let events = JSON.parse(localStorage.getItem('events') || '[]');
    const index = events.findIndex(e => e.title === title);
  
    if (index !== -1) {
      const alreadyJoined = events[index].joinList.some(p => p.contact === contact);
      if (alreadyJoined) {
        alert('你已經加入過這個活動了！');
      } else {
        events[index].joinList.push({ name, contact });
        localStorage.setItem('events', JSON.stringify(events));
        alert('成功加入活動！');
        location.reload(); // 重新載入頁面以更新資訊
      }
    }
  }
  
  // 初始化整體流程
  function initPage() {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    initCalendar(events);
  }
  
  document.addEventListener('DOMContentLoaded', initPage);
  