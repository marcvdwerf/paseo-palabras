// public/script.js
const fileInput = document.getElementById("file");
const preview = document.getElementById("preview");
const startBtn = document.getElementById("start");
const statusEl = document.getElementById("status");
const results = document.getElementById("results");

fileInput.onchange = () => {
  const f = fileInput.files[0];
  if (!f) return;
  preview.src = URL.createObjectURL(f);
  preview.style.display = "block";
};

startBtn.onclick = async () => {
  const f = fileInput.files[0];
  if (!f) return alert("Eerst een foto uploaden!");

  statusEl.textContent = "AI analyseert...";
  results.innerHTML = "";

  const form = new FormData();
  form.append("photo", f);

  try {
    const r = await fetch("/api/analyze", {
      method: "POST",
      body: form
    });

    if (!r.ok) {
      const txt = await r.text();
      statusEl.textContent = "Serverfout: " + r.status;
      console.error("Server response:", txt);
      return;
    }

    const data = await r.json();
    statusEl.textContent = "Klaar!";

    if (!data.labels || !data.labels.length) {
      results.innerHTML = "<div class='result'>Geen labels ontvangen</div>";
      return;
    }

    data.labels.forEach(item => {
      results.innerHTML += `
        <div class="result">
          <strong>${escapeHtml(item.translation || "—")}</strong><br/>
          Origineel: ${escapeHtml(item.label || "—")}<br/>
          ${escapeHtml(item.description || "")}
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Netwerkfout: " + err.message;
  }
};

// kleine helper om HTML-injectie te voorkomen bij weergave
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
