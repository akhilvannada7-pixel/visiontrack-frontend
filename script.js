const API = "https:visiontrack-backend-production.up.railway.app";

async function loadDashboard() {
  const status = document.getElementById("apiStatus");
  try {
    const response = await fetch(`${API}/dashboard`);
    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    document.getElementById("objectCount").textContent = data.objectCount;
    document.getElementById("sessionCount").textContent = data.sessionCount;
    document.getElementById("eventCount").textContent = data.eventCount;
    status.textContent = "API CONNECTED";
    status.style.color = "#27d6c4";
    const rows = document.getElementById("objectRows");
    if (!data.objects.length) {
      rows.innerHTML = '<tr><td colspan="4">No records yet. Add one using the form.</td></tr>';
    } else {
      rows.replaceChildren(...data.objects.map(o => {
        const tr = document.createElement("tr");
        [o.track_id, o.object_class, `${Number(o.confidence).toFixed(1)}%`, `x:${o.x_position}% · y:${o.y_position}%`]
          .forEach(value => { const td = document.createElement("td"); td.textContent = value; tr.appendChild(td); });
        return tr;
      }));
    }
  } catch (error) {
    status.textContent = "API OFFLINE";
    status.style.color = "#fb7185";
    document.getElementById("objectRows").innerHTML = '<tr><td colspan="4">Cannot connect. Start the backend and check MySQL settings.</td></tr>';
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadDashboard);
document.getElementById("trackForm").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.getElementById("formMessage");
  const payload = {
    objectClass: document.getElementById("objectClass").value,
    confidence: Number(document.getElementById("confidence").value),
    xPosition: Number(document.getElementById("posX").value),
    yPosition: Number(document.getElementById("posY").value)
  };
  try {
    const response = await fetch(`${API}/objects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save record");
    message.textContent = `Saved successfully (Track ID: ${result.trackId}).`;
    event.target.reset();
    document.getElementById("confidence").value = "96.5";
    document.getElementById("posX").value = "35";
    document.getElementById("posY").value = "48";
    await loadDashboard();
  } catch (error) {
    message.textContent = error.message;
  }
});

loadDashboard();
