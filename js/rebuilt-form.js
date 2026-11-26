/* Rebuilt offer: multi-step form -> Patrick's GHL webhook, then an on-page Cal.com booking.
   Goal: never dead-end a prospect. We send the lead to GHL (best effort), then always
   take them to the booking step, because the booked call is the real conversion and
   Cal.com captures their details independently. No contact data is stored in the browser. */
(function (win) {
  "use strict";
  if (!win || !win.document) return;

  var VERSION = "rebuilt-v1";

  function submissionId(cryptoApi) {
    if (cryptoApi && typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
    return "rebuilt-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function normalizePhone(value) {
    var text = String(value || "").trim();
    if (!/^[+\d\s().-]+$/.test(text)) return "";
    var digits = text.replace(/\D/g, "");
    if (text.charAt(0) === "+") return digits.length >= 8 && digits.length <= 15 && digits.charAt(0) !== "0" ? "+" + digits : "";
    if (digits.length === 10) return "+1" + digits;
    if (digits.length === 11 && digits.charAt(0) === "1") return "+" + digits;
    return "";
  }

  function normalizeWebsite(value) {
    var text = String(value || "").trim();
    if (!text) return "";
    try {
      var url = new URL(text.indexOf("://") !== -1 ? text : "https://" + text);
      if (["http:", "https:"].indexOf(url.protocol) === -1 || !url.hostname.includes(".")) return null;
      return url.href;
    } catch (_) { return null; }
  }

  function validateField(field) {
    if (field.type === "checkbox") { field.setCustomValidity(field.required && !field.checked ? "Please confirm to continue." : ""); return field.checkValidity(); }
    if (field.required && !field.value.trim()) field.setCustomValidity("Please fill this in.");
    else if (field.name === "phone" && !normalizePhone(field.value)) field.setCustomValidity("Please enter a valid phone number. Add + and your country code if outside the U.S.");
    else if (field.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) field.setCustomValidity("Please enter a valid email address.");
    else if (field.name === "website" && normalizeWebsite(field.value) === null) field.setCustomValidity("Please enter your website like yourbusiness.com, or leave it blank.");
    else field.setCustomValidity("");
    return field.checkValidity();
  }

  function collectAnswers(form) {
    var answers = {};
    Array.prototype.forEach.call(form.querySelectorAll("[data-survey-answer]"), function (field) {
      if (field.type === "checkbox") answers[field.name] = field.checked;
      else answers[field.name] = field.value.trim();
    });
    return answers;
  }

  function buildPayload(answers, state, config) {
    var clean = {};
    Object.keys(answers).forEach(function (key) { clean[key] = typeof answers[key] === "boolean" ? answers[key] : String(answers[key] || "").trim(); });
    clean.phone = normalizePhone(clean.phone);
    clean.email = clean.email.toLowerCase();
    clean.website = normalizeWebsite(clean.website) || "";
    clean.full_name = (clean.first_name + " " + clean.last_name).trim();
    return Object.assign({}, clean, {
      submission_id: state.submissionId,
      survey_version: VERSION,
      started_at: state.startedAt,
      submitted_at: new Date().toISOString(),
      offer_name: config.offerName,
      offer_price: config.offerPrice,
      offer_regular_price: config.offerRegularPrice,
      offer_deadline: config.offerDeadline,
      offer_acknowledged: clean.offer_acknowledgment === true,
      lead_source: config.leadSource,
      meta_event: "Lead",
      meta_event_id: "rebuilt-" + state.submissionId,
      page_url: win.location.href
    });
  }

  async function sendLead(config, payload) {
    if (config.liveSubmissionsEnabled !== true) return false;
    var url;
    try { url = new URL(String(config.webhookUrl || "").trim()); } catch (_) { return false; }
    if (url.protocol !== "https:") return false;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, Number(config.requestTimeoutMs) || 20000);
    try {
      var response = await win.fetch(url.href, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        credentials: "omit",
        signal: controller.signal
      });
      return !!(response && response.ok);
    } catch (_) {
      return false;
    } finally { clearTimeout(timer); }
  }

  /* Lazy Cal.com embed loader (official snippet). */
  function loadCal() {
    if (win.Cal && win.Cal.loaded) return win.Cal;
    (function (C, A, L) {
      var p = function (a, ar) { a.q.push(ar); };
      var d = C.document;
      C.Cal = C.Cal || function () {
        var cal = C.Cal, ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }
        if (ar[0] === L) {
          var api = function () { p(api, arguments); };
          var namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); }
          else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(win, "https://app.cal.com/embed/embed.js", "init");
    return win.Cal;
  }

  function openBooking(config, payload, target) {
    var Cal = loadCal();
    Cal("init", { origin: config.calOrigin });
    Cal("ui", { theme: "dark", hideEventTypeDetails: false, styles: { branding: { brandColor: config.brandColor } } });
    Cal("inline", {
      elementOrSelector: target,
      calLink: config.calLink,
      config: {
        theme: "dark",
        name: payload.full_name,
        email: payload.email,
        notes: "Company: " + payload.company_name + (payload.website ? " (" + payload.website + ")" : "") +
          "\nPhone: " + payload.phone + "\nBiggest challenge: " + payload.marketing_challenge
      }
    });
    // The real conversion: fire Meta "Schedule" when they actually book the call.
    // Cal.com emits "bookingSuccessful" from the embed; we fire once, with the
    // same Advanced Matching data so the booking maps to the person and the ad.
    var scheduled = false;
    Cal("on", {
      action: "bookingSuccessful",
      callback: function () {
        if (scheduled || typeof win.fbq !== "function") return;
        scheduled = true;
        try {
          if (config.metaPixelId) {
            win.fbq("init", config.metaPixelId, {
              em: payload.email,
              ph: String(payload.phone || "").replace(/\D/g, ""),
              fn: payload.first_name,
              ln: payload.last_name
            });
          }
          win.fbq("track", "Schedule", { content_name: "Rebuilt Consultation Booked" }, { eventID: "rebuilt-booking-" + payload.submission_id });
        } catch (_) {}
      }
    });
  }

  function init() {
    var document = win.document;
    var form = document.getElementById("rebuilt-form");
    if (!form) return;
    var config = win.REBUILT_CONFIG || {};
    var steps = Array.prototype.slice.call(form.querySelectorAll("[data-survey-step]"));
    var back = form.querySelector("[data-survey-back]");
    var next = form.querySelector("[data-survey-next]");
    var submit = form.querySelector("[type=submit]");
    var error = form.querySelector("[data-survey-error]");
    var status = form.querySelector("[data-survey-status]");
    var progress = form.querySelector("progress");
    var progressCopy = form.querySelector("[data-survey-progress]");
    var actions = form.querySelector(".survey-actions");
    var booking = document.getElementById("rebuilt-booking");
    var state = { step: 0, busy: false, done: false, submissionId: submissionId(win.crypto), startedAt: new Date().toISOString() };

    function clearErrors() {
      error.hidden = true; error.textContent = "";
      Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (f) { f.removeAttribute("aria-invalid"); });
      Array.prototype.forEach.call(form.querySelectorAll(".survey-field-error"), function (m) { m.textContent = ""; });
    }

    function validateStep(index, focus) {
      var invalid = null;
      Array.prototype.forEach.call(steps[index].querySelectorAll("input, select, textarea"), function (field) {
        if (field.type === "hidden") return;
        if (!validateField(field)) {
          if (!invalid) invalid = field;
          field.setAttribute("aria-invalid", "true");
          var msg = document.getElementById(field.getAttribute("data-error-id"));
          if (msg) msg.textContent = field.validationMessage || "Please check this answer.";
        }
      });
      if (invalid) {
        error.textContent = "Please check the highlighted answer before continuing.";
        error.hidden = false;
        if (focus) invalid.focus();
        return false;
      }
      return true;
    }

    function updateReview() {
      var answers = collectAnswers(form);
      var review = form.querySelector("[data-survey-review]");
      if (!review) return;
      review.textContent = "";
      [["Business", "company_name"], ["Website", "website"], ["Biggest challenge", "marketing_challenge"], ["Name", null], ["Email", "email"], ["Phone", "phone"]].forEach(function (entry) {
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = entry[0];
        if (entry[1] === null) dd.textContent = ((answers.first_name || "") + " " + (answers.last_name || "")).trim() || "Not provided";
        else dd.textContent = answers[entry[1]] || "Not provided";
        var row = document.createElement("div");
        row.appendChild(dt); row.appendChild(dd);
        review.appendChild(row);
      });
    }

    function showStep(index, focus) {
      clearErrors();
      state.step = index;
      steps.forEach(function (s, i) { s.hidden = i !== index; s.disabled = i !== index; });
      back.hidden = index === 0;
      next.hidden = index === steps.length - 1;
      submit.hidden = index !== steps.length - 1;
      progress.value = index + 1;
      progressCopy.textContent = "Step " + (index + 1) + " of " + steps.length;
      if (index === steps.length - 1) updateReview();
      if (focus) { var legend = steps[index].querySelector("legend"); if (legend) legend.focus(); }
    }

    function setBusy(busy) {
      state.busy = busy;
      form.setAttribute("aria-busy", String(busy));
      back.disabled = busy; next.disabled = busy; submit.disabled = busy;
      submit.textContent = busy ? "One moment…" : "Submit and pick my time";
      status.textContent = busy ? "Locking in your spot. Please keep this page open." : "";
    }

    function finish(payload) {
      state.done = true;
      steps.forEach(function (s) { s.hidden = true; s.disabled = true; });
      actions.hidden = true;
      var guarantee = form.querySelector("[data-survey-guarantee]");
      if (guarantee) guarantee.hidden = true;
      if (progress) progress.hidden = true;
      if (progressCopy) progressCopy.hidden = true;
      status.textContent = "";
      booking.hidden = false;
      openBooking(config, payload, "#rebuilt-cal");
      var heading = booking.querySelector("[data-booking-heading]");
      if (heading) { heading.focus(); heading.scrollIntoView({ behavior: "smooth", block: "start" }); }
    }

    back.addEventListener("click", function () { if (!state.busy && state.step > 0) showStep(state.step - 1, true); });
    next.addEventListener("click", function () {
      if (state.busy) return;
      clearErrors();
      if (validateStep(state.step, true)) showStep(state.step + 1, true);
    });
    form.addEventListener("input", function (event) {
      if (event.target.setCustomValidity) event.target.setCustomValidity("");
      event.target.removeAttribute("aria-invalid");
      var msg = document.getElementById(event.target.getAttribute("data-error-id"));
      if (msg) msg.textContent = "";
    });
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (state.busy || state.done) return;
      if (state.step < steps.length - 1) { next.click(); return; }
      clearErrors();
      for (var i = 0; i < steps.length; i++) {
        var wasDisabled = steps[i].disabled;
        steps[i].disabled = false;
        var ok = validateStep(i, false);
        steps[i].disabled = wasDisabled;
        if (!ok) { showStep(i, false); validateStep(i, true); return; }
      }
      var payload = buildPayload(collectAnswers(form), state, config);
      setBusy(true);
      await sendLead(config, payload); // best effort; booking proceeds regardless
      if (typeof win.fbq === "function") {
        try {
          // Advanced Matching: re-init with the lead's hashed PII so Meta can
          // attribute this Lead to the real person and the ad that drove them.
          // fbq normalizes and SHA-256 hashes these values client-side.
          if (config.metaPixelId) {
            win.fbq("init", config.metaPixelId, {
              em: payload.email,
              ph: String(payload.phone || "").replace(/\D/g, ""),
              fn: payload.first_name,
              ln: payload.last_name
            });
          }
          win.fbq("track", "Lead", { content_name: "Rebuilt Offer" }, { eventID: payload.meta_event_id });
        } catch (_) {}
      }
      setBusy(false);
      finish(payload);
    });

    showStep(0, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : null);
