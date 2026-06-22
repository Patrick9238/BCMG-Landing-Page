/* =============================================================
   MAIN — nav, YouTube embed, tier rendering, shared helpers
   ============================================================= */

/* ---------- Mobile nav toggle ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }
  // Year in footer
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
}

/* ---------- Toast helper (shared) ---------- */
let toastTimer;
function showToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- Checkout link helper ----------
   Returns the configured URL for a tier/product, or null if not set yet. */
function getCheckoutLink(key) {
  const url = CONFIG.checkoutLinks[key];
  return url && url.trim() ? url.trim() : null;
}

/* ---------- YouTube: always-latest or pinned video ---------- */
function initYouTube() {
  const frame = document.getElementById("yt-frame");
  if (!frame) return;
  const yt = CONFIG.youtube;
  let src;
  if (yt.channelId && yt.channelId.trim()) {
    // Convert channel ID (UC...) into the uploads playlist (UU...) so the
    // newest upload always plays automatically.
    const uploads = "UU" + yt.channelId.trim().substring(2);
    src = `https://www.youtube.com/embed/videoseries?list=${uploads}&rel=0`;
  } else {
    src = `https://www.youtube.com/embed/${yt.videoId}?rel=0`;
  }
  frame.src = src;

  const link = document.getElementById("yt-link");
  if (link && yt.channelUrl) link.href = yt.channelUrl;
}

/* ---------- Render support tiers from data.js ---------- */
function renderTiers() {
  const wrap = document.getElementById("tiers-grid");
  if (!wrap) return;

  wrap.innerHTML = TIERS.map(tier => {
    const link = getCheckoutLink(tier.linkKey);
    const ribbon = tier.badge ? `<span class="ribbon">${tier.badge}</span>`
                  : (tier.featured ? `<span class="ribbon">Most Popular</span>` : "");
    const perks = tier.perks.map(p => {
      const isMore = /plus…|plus\.\.\.|everything in/i.test(p);
      return `<li class="${isMore ? "more" : ""}">${p}</li>`;
    }).join("");

    const btnAttrs = link
      ? `href="${link}"`
      : `href="#" data-tier="${tier.name}"`;

    return `
      <div class="tier ${tier.featured ? "featured" : ""}">
        ${ribbon}
        <h3>${tier.name}</h3>
        <div class="price">${tier.price}<span class="cad">${tier.cadence}</span></div>
        <p class="blurb">${tier.blurb}</p>
        <ul>${perks}</ul>
        <a class="btn ${tier.featured || tier.badge ? "btn-gold" : "btn-blue"} btn-block tier-cta" ${btnAttrs}>
          Join ${tier.name}
        </a>
      </div>`;
  }).join("");

  // Tiers without a configured checkout link: gentle "coming soon" notice
  wrap.querySelectorAll("a[data-tier]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      showToast(`Checkout for ${a.dataset.tier} is opening soon — contact us to get started today.`);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initYouTube();
  renderTiers();
});
