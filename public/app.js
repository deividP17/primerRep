function showMessage(el, text, ok = true) {
  el.textContent = text;
  el.style.color = ok ? "#12b76a" : "#d92d20";
}

function getCurrentUser() {
  const raw = localStorage.getItem("gnmUser");
  return raw ? JSON.parse(raw) : null;
}

async function loadTrips(targetId, selectId) {
  const container = document.getElementById(targetId);
  const select = document.getElementById(selectId);
  if (!container && !select) return;

  const res = await fetch("/api/trips");
  const trips = await res.json();

  if (container) {
    container.innerHTML = trips
      .map(
        (t) => `<article class="card"><img src="${t.image_url}" alt="${t.destination}"><h3>${t.title}</h3><p>${t.destination}</p><p>${t.start_date} al ${t.end_date}</p><p><strong>ARS ${Number(t.price).toLocaleString()}</strong></p></article>`
      )
      .join("");
  }

  if (select) {
    select.innerHTML = '<option value="">Seleccionar viaje...</option>' +
      trips.map((t) => `<option value="${t.id}">${t.title} - ${t.destination} (${t.start_date})</option>`).join("");
  }
}
