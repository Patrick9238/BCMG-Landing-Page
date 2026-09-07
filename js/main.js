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

  // One tier = a single centered card instead of a row of columns
  wrap.classList.toggle("tiers--single", TIERS.length === 1);

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
      <div class="tier ${tier.featured ? "featured" : ""}" id="tier-${tier.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">
        ${ribbon}
        <h3>${tier.name}</h3>
        <div class="price">${tier.price}<span class="cad">${tier.cadence}</span></div>
        <p class="blurb">${tier.blurb}</p>
        <ul>${perks}</ul>
        <a class="btn ${tier.featured ? "btn-gold" : "btn-blue"} btn-block tier-cta" ${btnAttrs}>
          <span class="cta-pre">${tier.ctaPre || "Become A"}</span>
          <span class="cta-name">${tier.ctaName || tier.name}</span>
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

/* ---------- Footer: email + social icons (shared across pages) ---------- */
const SOCIAL_ICONS = {
  youtube:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/></svg>`,
  facebook:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>`,
  tiktok:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.8v2.6c-1.3.1-2.5-.3-3.5-.9v6.1a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.8V3h2.6z"/></svg>`,
  x:         `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2H21l-6.4 7.3L22 22h-6l-4.7-6.1L5.9 22H3l6.8-7.8L2 2h6.2l4.2 5.6L18.2 2zm-2.1 18h1.6L7.9 3.7H6.2L16.1 20z"/></svg>`
};

function initFooter() {
  document.querySelectorAll("#footer-email").forEach(el => el.href = "mailto:" + CONFIG.notifyEmail);

  const s = document.getElementById("socials");
  if (s) {
    s.innerHTML = Object.entries(CONFIG.social).filter(([, v]) => v).map(([k, v]) =>
      `<a href="${v}" target="_blank" rel="noopener" title="${k}" aria-label="${k}">${SOCIAL_ICONS[k] || k}</a>`
    ).join("");
  }
}

/* ---------- Live views counter (home top bar) ----------
   Climbs from CONFIG.viewsCounter.baseline at an average of perDay views/day,
   with the rate ramping smoothly up and down (swingPerDay over periodHours).
   The total is a deterministic function of wall-clock time, so it never jumps
   or goes backwards and every visitor sees the same number. */
function initViewsCounter() {
  const el = document.getElementById("views-num");
  if (!el || typeof CONFIG === "undefined" || !CONFIG.viewsCounter || !CONFIG.viewsCounter.enabled) return;
  const c = CONFIG.viewsCounter;

  const labelEl = document.getElementById("views-label");
  if (labelEl && c.label) labelEl.textContent = c.label;

  const anchor = new Date(c.anchorISO).getTime();
  const avgPerSec = (c.perDay || 0) / 86400;
  const swingPerSec = (c.swingPerDay || 0) / 86400;
  const periodSec = (c.periodHours || 6) * 3600;
  const w = (2 * Math.PI) / periodSec;
  const loadEpoch = Date.now();

  // Always-climbing total. Uses real elapsed time since the anchor; if a device
  // clock is set before the anchor, it still climbs from page load so it never freezes.
  const total = () => {
    const sAbs = (Date.now() - anchor) / 1000;
    if (sAbs > 0) return c.baseline + avgPerSec * sAbs + (swingPerSec / w) * (1 - Math.cos(w * sAbs));
    const sLoad = Math.max(0, (Date.now() - loadEpoch) / 1000);
    return c.baseline + avgPerSec * sLoad;
  };

  const fmt = n => n.toLocaleString("en-US");
  let shown = Math.floor(total());
  el.textContent = fmt(shown);
  setInterval(() => {
    const target = Math.floor(total());
    if (target > shown) {
      shown += Math.max(1, Math.ceil((target - shown) / 3));
      if (shown > target) shown = target;
      el.textContent = fmt(shown);
    }
  }, 300);
}

/* ---------- Email the team when someone lands on a membership thank-you page ----------
   A page opts in via <body data-notify-tier="Partner">. Sends a notification to
   Patrick + Anthony via FormSubmit. Guarded so a page refresh won't re-send. */
function initJoinNotify() {
  var tier = document.body ? document.body.getAttribute("data-notify-tier") : null;
  if (!tier) return;

  // Only notify on a GENUINE Stripe checkout redirect — not test visits or
  // someone landing on the page directly. A real payment redirect either
  // carries a Stripe session_id in the URL or comes from a stripe.com referrer.
  var search = location.search || "";
  var ref = document.referrer || "";
  var sid = (search.match(/[?&](session_id|checkout_session_id)=([^&]+)/) || [])[2] || "";
  var fromStripe = !!sid || /(^|\.)stripe\.com/i.test(ref) || /[?&]paid=1\b/.test(search);
  if (!fromStripe) return;

  // Don't double-send on a page refresh within the same session.
  var key = "joined:" + tier;
  try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch (e) {}

  var fd = new FormData();
  fd.append("_subject", "New " + tier + " member — The Patrick Carr Show");
  fd.append("_cc", "anthony@thepatrickcarrshow.com");
  fd.append("_template", "table");
  fd.append("Tier joined", tier);
  if (sid) fd.append("Stripe session", sid);
  fd.append("Note", "Someone just completed checkout for the " + tier + " tier on thepatrickcarrshow.com. Their name, email and payment details are in Stripe.");
  fetch("https://formsubmit.co/ajax/patrick@thepatrickcarrshow.com", { method: "POST", body: fd })
    .catch(function () {});
}

/* ---------- Weekly members-only call: "add to calendar" ----------
   Builds a RECURRING weekly event, so the member clicks once and the call
   lands on their calendar every week. Works off CONFIG.weeklyCall.
   If joinUrl is empty the whole block is hidden and the fallback copy
   shows instead, so nobody ever sees a dead button. */
var DAY_CODES = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
var ICS_DAYS  = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/* What is the date/time RIGHT NOW in the call's own time zone?
   Read via Intl so it does not matter where the member's computer is. */
function nowInZone(tz) {
  var f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false
  });
  var out = {};
  f.formatToParts(new Date()).forEach(function (p) { out[p.type] = p.value; });
  return {
    y: +out.year, m: +out.month, d: +out.day,
    hour: +out.hour % 24, minute: +out.minute,
    dow: DAY_CODES[String(out.weekday).slice(0, 3).toLowerCase()]
  };
}

/* The next time the call actually happens, as YYYYMMDD + HHMMSS. */
function nextCallStart(cfg) {
  var target = DAY_CODES[String(cfg.day).slice(0, 3).toLowerCase()];
  if (target === undefined) return null;
  var hm = String(cfg.time).split(":");
  var hh = +hm[0], mm = +hm[1] || 0;
  if (isNaN(hh)) return null;

  var now = nowInZone(cfg.timeZone);
  var ahead = (target - now.dow + 7) % 7;
  // Call day is today but the start time already passed -> go to next week.
  if (ahead === 0 && (now.hour > hh || (now.hour === hh && now.minute >= mm))) ahead = 7;

  var dt = new Date(Date.UTC(now.y, now.m - 1, now.d));
  dt.setUTCDate(dt.getUTCDate() + ahead);
  var pad = function (n) { return String(n).padStart(2, "0"); };
  return {
    date: "" + dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()),
    start: pad(hh) + pad(mm) + "00",
    end: (function () {
      var t = hh * 60 + mm + (cfg.durationMins || 60);
      return pad(Math.floor(t / 60) % 24) + pad(t % 60) + "00";
    })(),
    byday: ICS_DAYS[target]
  };
}

function initWeeklyCall() {
  var wrap = document.getElementById("weekly-call");
  if (!wrap) return;

  var cfg = (typeof CONFIG !== "undefined" && CONFIG.weeklyCall) || null;
  var when = cfg && cfg.joinUrl && cfg.joinUrl.trim() ? nextCallStart(cfg) : null;

  // Not configured yet: keep the promise, drop the buttons.
  if (!when) {
    wrap.innerHTML = '<p class="call-fallback">Anthony is sending your call link and invite by email within 24 hours. ' +
      'Keep an eye on your inbox.</p>';
    return;
  }

  var recur  = "RRULE:FREQ=WEEKLY;BYDAY=" + when.byday;
  var detail = (cfg.details || "") + "\n\nJoin here: " + cfg.joinUrl;

  var gcal = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text="     + encodeURIComponent(cfg.title)
    + "&dates="    + when.date + "T" + when.start + "/" + when.date + "T" + when.end
    + "&ctz="      + encodeURIComponent(cfg.timeZone)
    + "&details="  + encodeURIComponent(detail)
    + "&location=" + encodeURIComponent(cfg.joinUrl)
    + "&recur="    + encodeURIComponent(recur);

  var ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The Patrick Carr Show//Members Call//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
    "UID:members-call-" + when.date + "@thepatrickcarrshow.com",
    "DTSTAMP:" + when.date + "T" + when.start + "Z",
    "DTSTART;TZID=" + cfg.timeZone + ":" + when.date + "T" + when.start,
    "DTEND;TZID="   + cfg.timeZone + ":" + when.date + "T" + when.end,
    recur,
    "SUMMARY:" + cfg.title,
    "DESCRIPTION:" + detail.replace(/\n/g, "\\n"),
    "LOCATION:" + cfg.joinUrl,
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");

  var icsUrl = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);

  wrap.innerHTML =
    '<div class="call-actions">' +
      '<a class="btn btn-gold" target="_blank" rel="noopener" href="' + gcal + '">Add To Google Calendar</a>' +
      '<a class="btn btn-blue" download="patrick-carr-show-members-call.ics" href="' + icsUrl + '">Apple / Outlook</a>' +
    '</div>' +
    '<p class="call-note">Adds the call to your calendar every week automatically. ' +
      'The join link is in the invite.</p>';
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initYouTube();
  renderTiers();
  initFooter();
  initViewsCounter();
  initJoinNotify();
  initWeeklyCall();
});
