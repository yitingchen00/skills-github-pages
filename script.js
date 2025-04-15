let currentDate = new Date();
let users = JSON.parse(localStorage.getItem("users")) || [];
let events = JSON.parse(localStorage.getItem("events")) || [];
let logs = JSON.parse(localStorage.getItem("logs")) || [];

function saveToStorage() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("events", JSON.stringify(events));
  localStorage.setItem("logs", JSON.stringify(logs));
}

function renderUsers() {
  const list = document.getElementById("userList");
  const select = document.getElementById("recipientList");
  list.innerHTML = "";
  select.innerHTML = "";

  users.forEach((u, i) => {
    const div = document.createElement("div");
    div.className = "d-flex justify-content-between align-items-center mb-1";
    div.innerHTML = `
      ${u.name} (${u.email})
      <button class="btn btn-sm btn-danger" onclick="removeUser(${i})">❌</button>
    `;
    list.appendChild(div);

    const option = document.createElement("option");
    option.value = u.email;
    option.textContent = `${u.name} (${u.email})`;
    select.appendChild(option);
  });
}

function removeUser(index) {
  users.splice(index, 1);
  saveToStorage();
  renderUsers();
}

function addUser() {
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  if (name && email) {
    users.push({ name, email });
    saveToStorage();
    renderUsers();
    document.getElementById("userName").value = "";
    document.getElementById("userEmail").value = "";
  }
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  const title = document.getElementById("calendarTitle");
  cal.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  title.textContent = `${year} 年 ${month + 1} 月`;

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const padding = firstDay.getDay();

  for (let i = 0; i < padding; i++) {
    cal.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const box = document.createElement("div");
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    box.classList.toggle("event-day", dayEvents.length > 0);
    box.innerHTML = `${d}\n${dayEvents.map(e => e.content).join("\n")}`;
    cal.appendChild(box);
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function addEvent() {
  const date = document.getElementById("eventDate").value;
  const content = document.getElementById("eventContent").value.slice(0, 20);
  const recipients = Array.from(document.getElementById("recipientList").selectedOptions).map(opt => opt.value);
  const mockSend = document.getElementById("mockSend").checked;
  const sender = users.length ? users[users.length - 1].name : "匿名";

  if (date && content && recipients.length > 0) {
    events.push({ date, content });

    if (mockSend) {
      logs.push({
        date,
        content,
        sender,
        recipients
      });
    }

    saveToStorage();
    renderCalendar();
    renderLogs();

    document.getElementById("eventDate").value = "";
    document.getElementById("eventContent").value = "";
  }
}

function renderLogs() {
  const table = document.getElementById("logTable");
  table.innerHTML = "";

  logs.forEach(log => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.date}</td>
      <td>${log.content}</td>
      <td>${log.sender}</td>
      <td>${log.recipients.join(", ")}</td>
    `;
    table.appendChild(row);
  });
}

// 初始
renderUsers();
renderCalendar();
renderLogs();
