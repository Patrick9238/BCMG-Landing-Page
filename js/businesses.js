/* =============================================================
   BUSINESSES — Leaflet map of approved businesses (Florida)
   Uses OpenStreetMap tiles (free, no API key). Pins come from
   BUSINESSES in data.js. Click a pin OR a card to see details.
   ============================================================= */

function buildPopup(b) {
  let media = "";
  if (b.photo) media = `<img class="pimg" src="${b.photo}" alt="${b.name}">`;
  else if (b.logo) media = `<img class="pimg logo-tile" src="${b.logo}" alt="${b.name} logo">`;
  const isGoogle = b.googleUrl && /google\./i.test(b.googleUrl);
  const linkLabel = isGoogle ? "View on Google" : "Visit Website";
  const gmap = b.googleUrl
    ? `<a class="gmap-link" href="${b.googleUrl}" target="_blank" rel="noopener">
         <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
         ${linkLabel}</a>`
    : "";
  return `
    <div class="biz-popup">
      ${media}
      <div class="pbody">
        <h4>${b.name}</h4>
        <div class="cat">${b.category} · ${b.city}</div>
        ${b.info ? `<p>${b.info}</p>` : ""}
        ${gmap}
        ${b.writeup ? `<div class="quote">${b.writeup}</div>` : ""}
      </div>
    </div>`;
}

function initBusinesses() {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  // Centered on Florida
  const map = L.map("map", { scrollWheelZoom: false }).setView([28.0, -81.7], 7);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
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

  // Cluster nearby pins into one light-blue "market" badge with a count.
  // Clicking a badge zooms into that market; overlapping pins fan out.
  const cluster = (typeof L.markerClusterGroup === "function")
    ? L.markerClusterGroup({
        maxClusterRadius: 60,           // px: how close pins must be to group
        spiderfyOnMaxZoom: true,        // fan out pins stacked at the same spot
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: c => {
          const n = c.getChildCount();
          return L.divIcon({
            className: "biz-cluster",
            html: `<div class="biz-cluster-inner"><span>${n}</span></div>`,
            iconSize: [46, 46]
          });
        }
      })
    : null;

  const markers = {};
  BUSINESSES.forEach((b, i) => {
    const m = L.marker([b.lat, b.lng], { icon: goldIcon });
    m.bindPopup(buildPopup(b), { maxWidth: 260 });
    markers[i] = m;
    if (cluster) cluster.addLayer(m); else m.addTo(map);
  });
  if (cluster) map.addLayer(cluster);

  // Re-enable scroll zoom only after a click (better page scrolling UX)
  map.on("click", () => map.scrollWheelZoom.enable());

  // Build the featured cards below the map and link them to pins
  const list = document.getElementById("biz-list");
  if (list) {
    const featured = BUSINESSES.map((b, i) => ({ b, i })).filter(x => x.b.featured);
    list.innerHTML = featured.map(({ b, i }) => `
      <div class="biz-card featured" data-biz="${i}">
        ${b.logo ? `<div class="biz-logo"><img src="${b.logo}" alt="${b.name} logo" loading="lazy"></div>` : ""}
        <div class="cat">${b.category}</div>
        <h3>${b.name}</h3>
        <div class="city">${b.city}</div>
      </div>`).join("");

    list.querySelectorAll("[data-biz]").forEach(card => {
      card.addEventListener("click", () => {
        const i = card.dataset.biz;
        const b = BUSINESSES[i];
        document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
        // If this pin is inside a cluster, expand it first, then open the popup
        if (cluster && typeof cluster.zoomToShowLayer === "function") {
          cluster.zoomToShowLayer(markers[i], () => markers[i].openPopup());
        } else {
          map.flyTo([b.lat, b.lng], 13, { duration: 0.8 });
          markers[i].openPopup();
        }
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", initBusinesses);
