const calendarGrid = document.getElementById("calendar-grid");
const calendarTitle = document.getElementById("calendar-title");
let currentDate = new Date();
let events = [];

async function loadEvents() {
  const res = await fetch("/events");
  events = await res.json();
  generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

function generateCalendar(year, month) {
  calendarGrid.innerHTML = "";
  calendarTitle.innerText = `${year} 年 ${month + 1} 月`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  for (let i = 0; i < startDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.innerHTML = `<span>${day}</span><div class="events"></div>`;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const todayEvents = events.filter(ev => ev.date === dateStr);
    todayEvents.forEach(ev => {
      const evDiv = document.createElement("div");
      evDiv.textContent = ev.name;
      evDiv.title = `備註: ${ev.note}\n通知: ${ev.notify.join(', ')}`;
      evDiv.classList.add("badge", "bg-info", "text-dark", "d-block", "mb-1");
      evDiv.addEventListener("click", () => alert(`活動: ${ev.name}\n備註: ${ev.note}\n通知對象: ${ev.notify.join(', ')}`));
      cell.querySelector(".events").appendChild(evDiv);
    });

    calendarGrid.appendChild(cell);
  }
}

document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

loadEvents();
