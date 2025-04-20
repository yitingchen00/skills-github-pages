const eventForm = document.getElementById("event-form");
const eventName = document.getElementById("event-name");
const eventDate = document.getElementById("event-date");
const eventNote = document.getElementById("event-note");

eventForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = eventName.value;
  const date = eventDate.value;
  const note = eventNote.value;
  const notify = Array.from(eventForm.querySelectorAll("input[type=checkbox]:checked")).map(cb => cb.value);

  if (name && date) {
    const newEvent = { name, date, note, notify };

    const res = await fetch("/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent)
    });

    if (res.ok) {
      alert("活動已新增並儲存！");
      eventForm.reset();
      location.reload();
    }
  }
});

function notifyByEmail(recipients, subject, body) {
  const mailto = `mailto:${recipients.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto);
}
