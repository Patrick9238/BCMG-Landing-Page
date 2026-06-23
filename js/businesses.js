/* =============================================================
   BUSINESSES — Leaflet map of approved businesses (Florida)
   Uses OpenStreetMap tiles (free, no API key). Pins come from
   BUSINESSES in data.js. Click a pin OR a card to see details.
   ============================================================= */

function buildPopup(b) {
  const img = (b.images && b.images[0]) ? `<img src="${b.images[0]}" alt="${b.name}">` : "";
  const gmap = b.googleUrl
    ? `<a class="gmap-link" href="${b.googleUrl}" target="_blank" rel="noopener">
         <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
         View on Google</a>`
    : "";
  return `
    <div class="biz-popup">
      ${img}
      <h4>${b.name}</h4>
      <div class="cat">${b.category} · ${b.city}</div>
      ${b.info ? `<p>${b.info}</p>` : ""}
      ${gmap}
      ${b.writeup ? `<div class="quote">${b.writeup}</div>` : ""}
    </div>`;
}

function initBusinesses() {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  // Centered on Florida
  const map = L.map("map", { scrollWheelZoom: false }).setView([28.0, -81.7], 7);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  const goldIcon = L.divIcon({
    className: "biz-pin",
    html: `<svg width="30" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z" fill="#ffb524" stroke="#1a1205" stroke-width="1"/>
             <circle cx="12" cy="12" r="5" fill="#1a1205"/>
           </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -38]
  });

  const markers = {};
  BUSINESSES.forEach((b, i) => {
    const m = L.marker([b.lat, b.lng], { icon: goldIcon }).addTo(map);
    m.bindPopup(buildPopup(b), { maxWidth: 260 });
    markers[i] = m;
  });

  // Re-enable scroll zoom only after a click (better page scrolling UX)
  map.on("click", () => map.scrollWheelZoom.enable());

  // Build the list below the map and link cards to pins
  const list = document.getElementById("biz-list");
  if (list) {
    list.innerHTML = BUSINESSES.map((b, i) => `
      <div class="biz-card" data-biz="${i}">
        <div class="cat">${b.category}</div>
        <h3>${b.name}</h3>
        <div class="city">${b.city}</div>
      </div>`).join("");

    list.querySelectorAll("[data-biz]").forEach(card => {
      card.addEventListener("click", () => {
        const i = card.dataset.biz;
        const b = BUSINESSES[i];
        map.flyTo([b.lat, b.lng], 13, { duration: 0.8 });
        markers[i].openPopup();
        document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", initBusinesses);
