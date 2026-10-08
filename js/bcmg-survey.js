/* No contact answers are stored in the browser or sent to analytics. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) api.init(root);
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var VERSION = "bcmg-marketing-fit-v1";
  var BOOKING_URL = "https://api.leadconnectorhq.com/widget/booking/HYJ0OuN4vdnduGY6sy3K";
  var POLICY_URL = "https://bluecollarmediagroup.com/privacy-policy";
  var TERMS_URL = "https://bluecollarmediagroup.com/terms-of-use";
  var CONSENT_VERSION = "bcmg-sms-v1-2026-10-08";
  var CONSENT_TEXT = {
    non_marketing:"By checking this box, I consent to receive non-marketing text messages from Blue Collar Media Group about my inquiry and appointment, including reminders and updates. Message frequency varies. Message and data rates may apply. Text HELP for assistance or STOP to opt out. Consent is optional and is not a condition of purchase.",
    marketing:"By checking this box, I consent to receive marketing and promotional text messages from Blue Collar Media Group at the phone number provided. Message frequency varies. Message and data rates may apply. Text HELP for assistance or STOP to opt out. Consent is optional and is not a condition of purchase."
  };
  var BUDGET_MINIMUMS = { under_1000:0, "1000_2999":1000, "3000_4999":3000, "5000_9999":5000, "10000_plus":10000 };
  var LABELS = {
    annual_revenue:{ under_250k:"Less Than $250K", "250k_1m":"$250K To $1M", "1m_3m":"$1M - $3M", "3m_10m":"$3M - $10M", "10m_plus":"$10M+" },
    decision_role:{ owner:"Owner or co-owner", authorized:"I am authorized to make the decision", researching:"I am researching for the decision-maker" },
    support_interest:{ course:"A course I can work through", workshop:"A workshop with practical guidance", turnaround:"The 90-Day Marketing Turnaround", help_choosing:"I need help choosing the right option" },
    monthly_investment:{ under_1000:"Under $1,000/month", "1000_2999":"$1,000–$2,999/month", "3000_4999":"$3,000–$4,999/month", "5000_9999":"$5,000–$9,999/month", "10000_plus":"$10,000/month or more", unsure:"I am not sure yet" },
    start_timeline:{ within_30_days:"Within 30 days", one_to_three_months:"In 1–3 months", later:"More than 3 months from now", exploring:"I am exploring options" }
  };

  function endpointFor(config) {
    return String(config.webhookUrl || "").trim();
  }

  function budgetMinimum(value) {
    return Object.prototype.hasOwnProperty.call(BUDGET_MINIMUMS, value) ? BUDGET_MINIMUMS[value] : null;
  }

  function isQualified(answers, config) {
    var minimum = Number(config.minimumMonthlyBudget || 3000);
    var budget = budgetMinimum(answers.monthly_investment);
    return budget !== null && Number.isFinite(minimum) && minimum >= 3000 && budget >= minimum;
  }

  function submissionId(cryptoApi) {
    if (cryptoApi && typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
    if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
      var values = cryptoApi.getRandomValues(new Uint32Array(4));
      return Array.prototype.map.call(values, function (value) { return value.toString(16).padStart(8, "0"); }).join("-");
    }
    return "bcmg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
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

  function prepareAttempt(state, answers, cryptoApi) {
    if (state.submissionBlocked) return;
    var fingerprint = JSON.stringify(answers);
    if (state.answersFingerprint && state.answersFingerprint !== fingerprint) {
      state.submissionId = submissionId(cryptoApi);
      state.submittedAt = null;
    }
    state.answersFingerprint = fingerprint;
    state.submittedAt = state.submittedAt || new Date().toISOString();
  }

  function buildPayload(answers, state, config) {
    var qualified = isQualified(answers, config);
    var clean = {};
    Object.keys(answers).forEach(function (key) {
      clean[key] = typeof answers[key] === "boolean" ? answers[key] : String(answers[key] || "").trim();
    });
    clean.phone = normalizePhone(clean.phone);
    clean.email = clean.email.toLowerCase();
    clean.website = normalizeWebsite(clean.website) || "";
    var stableAnswers = {
      survey_version:VERSION,
      first_name:clean.first_name,
      last_name:clean.last_name,
      email:clean.email,
      phone:clean.phone,
      company_name:clean.company_name,
      business_location:clean.business_location,
      website:clean.website,
      annual_revenue:clean.annual_revenue,
      decision_role:clean.decision_role,
      support_interest:clean.support_interest,
      monthly_investment:clean.monthly_investment,
      start_timeline:clean.start_timeline,
      marketing_challenge:clean.marketing_challenge,
      sms_non_marketing_consent:clean.sms_non_marketing_consent === true,
      sms_marketing_consent:clean.sms_marketing_consent === true,
      consent_text_version:CONSENT_VERSION
    };
    var labeledChoices = {};
    Object.keys(LABELS).forEach(function (key) { labeledChoices[key] = { value:clean[key], label:LABELS[key][clean[key]] }; });
    var payload = Object.assign({}, clean, {
      submission_id:state.submissionId,
      survey_version:VERSION,
      started_at:state.startedAt,
      submitted_at:state.submittedAt,
      time_to_complete_ms:Math.max(0, Date.parse(state.submittedAt) - Date.parse(state.startedAt)),
      annual_revenue_label:LABELS.annual_revenue[clean.annual_revenue],
      decision_role_label:LABELS.decision_role[clean.decision_role],
      support_interest_label:LABELS.support_interest[clean.support_interest],
      monthly_investment_label:LABELS.monthly_investment[clean.monthly_investment],
      start_timeline_label:LABELS.start_timeline[clean.start_timeline],
      labeled_choices:labeledChoices,
      survey_answers:JSON.stringify(Object.assign({}, stableAnswers, { labeled_choices:labeledChoices })),
      consent_record:JSON.stringify({
        sms_non_marketing_consent:stableAnswers.sms_non_marketing_consent,
        sms_marketing_consent:stableAnswers.sms_marketing_consent,
        consent_text_version:CONSENT_VERSION,
        consent_text:CONSENT_TEXT,
        recorded_at:state.submittedAt,
        privacy_policy_url:POLICY_URL,
        terms_url:TERMS_URL
      }),
      offer_interest:clean.support_interest,
      meta_event:"Lead",
      meta_event_name:"Lead",
      meta_custom_event_name:"BCMGMarketingSurveySubmitted",
      meta_event_id:"bcmg-survey-" + state.submissionId,
      lead_source:"BCMG Marketing Survey",
      submit_action:qualified ? "book_consultation" : "review_inquiry",
      qualified:qualified,
      qualification_status:qualified ? "qualified" : "not_qualified",
      monthly_investment_min:budgetMinimum(clean.monthly_investment),
      minimum_monthly_budget:Number(config.minimumMonthlyBudget || 3000),
      consent_text_version:CONSENT_VERSION,
      privacy_policy_url:POLICY_URL,
      terms_url:TERMS_URL,
      page_url:"https://thepatrickcarrshow.com/blue-collar-media-group.html"
    });
    return payload;
  }

  function submissionFailure(code, id) {
    var failure = new Error(code);
    failure.code = code;
    failure.submissionId = id;
    return failure;
  }

  async function readAcknowledgement(response) {
    var limit = 8192;
    var length = response.headers && response.headers.get && Number(response.headers.get("content-length"));
    if (length > limit) throw new Error("acknowledgement_size");
    var value;
    if (response.body && typeof response.body.getReader === "function") {
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var bytes = 0;
      var text = "";
      try {
        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > limit) { reader.cancel().catch(function () {}); throw new Error("acknowledgement_size"); }
          text += decoder.decode(chunk.value, { stream:true });
        }
        text += decoder.decode();
        value = JSON.parse(text);
      } finally { reader.releaseLock(); }
    } else if (typeof response.text === "function") {
      var body = await response.text();
      if (new TextEncoder().encode(body).byteLength > limit) throw new Error("acknowledgement_size");
      value = JSON.parse(body);
    } else {
      value = await response.json();
      if (new TextEncoder().encode(JSON.stringify(value)).byteLength > limit) throw new Error("acknowledgement_size");
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("acknowledgement_shape");
    return value;
  }

  function failureAction(failure) {
    return failure.attempted || ["submissions_disabled", "configuration"].indexOf(failure.code) !== -1 ? "contact" : "retry";
  }

  async function sendSubmission(config, payload, environment) {
    if (payload.company_fax) throw submissionFailure("validation", payload.submission_id);
    var body = JSON.stringify(payload);
    if (new TextEncoder().encode(body).byteLength > 16384) throw submissionFailure("size", payload.submission_id);
    if (config.liveSubmissionsEnabled !== true) throw submissionFailure("submissions_disabled", payload.submission_id);
    var url;
    try { url = new URL(endpointFor(config)); } catch (_) { throw submissionFailure("configuration", payload.submission_id); }
    if (url.protocol !== "https:" || url.username || url.password) throw submissionFailure("configuration", payload.submission_id);
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, Number(config.requestTimeoutMs) || 20000);
    try {
      var response = await environment.fetch(url.href, {
        method:"POST",
        mode:"cors",
        redirect:"error",
        headers:{ "Content-Type":"application/json", "Accept":"application/json" },
        body:body,
        credentials:"omit",
        signal:controller.signal
      });
      if (!response.ok || ["opaque", "opaqueredirect", "error"].indexOf(response.type) !== -1) throw new Error("unconfirmed");
      var acknowledgement = await readAcknowledgement(response);
      if (acknowledgement.status === "Success: test request received") {
        var draft = submissionFailure("workflow_not_live", payload.submission_id);
        draft.attempted = true;
        throw draft;
      }
      if (acknowledgement.status !== "Success: request sent to trigger execution server") throw new Error("unconfirmed");
      var qualified = isQualified(payload, config);
      return { qualified:qualified, booking_url:qualified ? BOOKING_URL : null, submission_id:payload.submission_id };
    } catch (failure) {
      if (failure.code === "workflow_not_live") throw failure;
      var uncertain = submissionFailure("submission_unconfirmed", payload.submission_id);
      uncertain.attempted = true;
      throw uncertain;
    } finally { clearTimeout(timeout); }
  }

  function bookingUrl(config) {
    try {
      var url = new URL(config.bookingUrl);
      return url.protocol === "https:" && !url.username && !url.password && url.href === BOOKING_URL ? url.href : "";
    } catch (_) { return ""; }
  }

  function collectAnswers(form) {
    var answers = {};
    Array.prototype.forEach.call(form.querySelectorAll("[data-survey-answer]"), function (field) {
      if (field.type === "radio") { if (field.checked) answers[field.name] = field.value; }
      else if (field.type === "checkbox") answers[field.name] = field.checked;
      else answers[field.name] = field.value.trim();
    });
    return answers;
  }

  function normalizeWebsite(value) {
    var text = String(value || "").trim();
    if (!text) return "";
    try {
      var url = new URL(text.includes("://") ? text : "https://" + text);
      if (["http:", "https:"].indexOf(url.protocol) === -1 || url.username || url.password || !url.hostname.includes(".")) return null;
      return url.href;
    } catch (_) { return null; }
  }

  function validateField(field) {
    if (field.required && field.type !== "radio" && !field.value.trim()) field.setCustomValidity("Please fill this in.");
    else if (field.name === "phone" && !normalizePhone(field.value)) field.setCustomValidity("Please enter a valid phone number. Include + and your country code for numbers outside the U.S.");
    else if (field.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) field.setCustomValidity("Please enter a valid email address.");
    else if (field.name === "website" && normalizeWebsite(field.value) === null) field.setCustomValidity("Please enter your business website, like yourbusiness.com, or leave this blank.");
    else field.setCustomValidity("");
    return field.checkValidity();
  }

  function init(win) {
    var document = win.document;
    var form = document.getElementById("bcmg-survey-form");
    if (!form) return;
    var config = win.BCMG_SURVEY_CONFIG || {};
    var steps = Array.prototype.slice.call(form.querySelectorAll("[data-survey-step]"));
    var back = form.querySelector("[data-survey-back]");
    var next = form.querySelector("[data-survey-next]");
    var submit = form.querySelector("[type=submit]");
    var error = form.querySelector("[data-survey-error]");
    var status = form.querySelector("[data-survey-status]");
    var progress = form.querySelector("progress");
    var progressCopy = form.querySelector("[data-survey-progress]");
    var result = form.querySelector("[data-survey-result]");
    var actions = form.querySelector(".survey-actions");
    var state = { step:0, busy:false, succeeded:false, submissionBlocked:false, submissionId:submissionId(win.crypto), startedAt:new Date().toISOString(), submittedAt:null };
    form.action = endpointFor(config) || "#";
    form.querySelector("[name=submission_id]").value = state.submissionId;
    form.querySelector("[name=started_at]").value = state.startedAt;

    function clearErrors() {
      error.hidden = true;
      error.textContent = "";
      Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (field) { field.removeAttribute("aria-invalid"); });
      Array.prototype.forEach.call(form.querySelectorAll(".survey-field-error"), function (message) { message.textContent = ""; });
    }

    function validateStep(index, focus) {
      var invalid = null;
      var seen = {};
      Array.prototype.forEach.call(steps[index].querySelectorAll("input, select, textarea"), function (field) {
        if (field.type === "radio" && seen[field.name]) return;
        seen[field.name] = true;
        if (field.type === "hidden" || field.type === "checkbox" || field.name === "company_fax") return;
        if (!validateField(field)) {
          if (!invalid) invalid = field;
          field.setAttribute("aria-invalid", "true");
          var fieldError = document.getElementById(field.getAttribute("data-error-id"));
          if (fieldError) fieldError.textContent = field.validationMessage || "Please check this answer.";
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
      review.textContent = "";
      [["Business", "company_name"], ["Location", "business_location"], ["Website", "website"], ["Annual revenue", "annual_revenue"], ["Your role", "decision_role"], ["Interested in", "support_interest"], ["Biggest challenge", "marketing_challenge"], ["Monthly budget", "monthly_investment"], ["Ready to start", "start_timeline"]].forEach(function (entry) {
        var title = document.createElement("dt");
        var answer = document.createElement("dd");
        title.textContent = entry[0];
        answer.textContent = LABELS[entry[1]] ? LABELS[entry[1]][answers[entry[1]]] || "—" : answers[entry[1]] || "Not provided";
        var row = document.createElement("div");
        row.appendChild(title);
        row.appendChild(answer);
        review.appendChild(row);
      });
    }

    function showStep(index, focus) {
      clearErrors();
      state.step = index;
      steps.forEach(function (step, i) { step.hidden = i !== index; step.disabled = i !== index; });
      back.hidden = index === 0;
      next.hidden = index === steps.length - 1;
      submit.hidden = index !== steps.length - 1;
      next.disabled = false;
      submit.disabled = false;
      progress.value = index + 1;
      progressCopy.textContent = "Step " + (index + 1) + " of " + steps.length;
      if (index === steps.length - 1) updateReview();
      if (focus) steps[index].querySelector("legend").focus();
    }

    function setBusy(busy) {
      state.busy = busy;
      form.setAttribute("aria-busy", String(busy));
      back.disabled = busy || state.submissionBlocked;
      next.disabled = busy || state.submissionBlocked;
      submit.disabled = busy || state.submissionBlocked;
      steps[state.step].disabled = busy || state.submissionBlocked;
      submit.textContent = busy ? "Sending…" : "Send my answers";
      status.textContent = busy ? "Sending your answers. Please keep this page open." : "";
    }

    function showContactFailure(code) {
      state.submissionBlocked = true;
      steps.forEach(function (step) { step.disabled = true; });
      actions.hidden = true;
      var message = ["workflow_not_live", "submissions_disabled", "configuration"].indexOf(code) !== -1
        ? "The form isn’t ready to take enquiries yet. Please contact the team and mention "
        : "We couldn’t confirm your answers arrived. Please contact the team and mention ";
      error.textContent = message + state.submissionId + ". ";
      var link = document.createElement("a");
      link.href = "mailto:anthony@thepatrickcarrshow.com?subject=" + encodeURIComponent("BCMG survey submission " + state.submissionId);
      link.textContent = "Email the team";
      error.appendChild(link);
      error.hidden = false;
      error.focus();
    }

    function showSubmissionFailure(failure) {
      if (failureAction(failure) === "contact") { showContactFailure(failure.code); return; }
      error.textContent = failure.code === "size"
        ? "Your answers are a little long. Please shorten the marketing challenge and try again. Everything you entered is still here."
        : "Please check your answers before sending. Everything you entered is still here.";
      error.hidden = false;
      error.focus();
    }

    function showResult(outcome) {
      var qualified = outcome.qualified;
      steps.forEach(function (step) { step.hidden = true; step.disabled = true; });
      actions.hidden = true;
      progress.hidden = true;
      progressCopy.hidden = true;
      result.hidden = false;
      result.textContent = "";
      var heading = document.createElement("h3");
      heading.tabIndex = -1;
      heading.textContent = "Thanks for sharing your business.";
      var copy = document.createElement("p");
      copy.textContent = qualified ? "I’ve got your answers. Let’s find a time to talk." : "We’ve received your answers for the team to review.";
      result.appendChild(heading);
      result.appendChild(copy);
      if (qualified) {
        var destination = bookingUrl({ bookingUrl:outcome.booking_url });
        if (destination) {
          var link = document.createElement("a");
          link.className = "btn btn-gold btn-block";
          link.href = destination;
          link.textContent = "Choose a time to talk";
          result.appendChild(link);
          status.textContent = "Opening the calendar…";
          win.setTimeout(function () { win.location.assign(destination); }, 1800);
        } else {
          copy.textContent = "We’ve received your answers. The booking calendar is unavailable right now.";
        }
      }
      heading.focus();
    }

    back.addEventListener("click", function () { if (!state.busy && !state.submissionBlocked && state.step > 0) showStep(state.step - 1, true); });
    next.addEventListener("click", function () {
      if (state.busy || state.submissionBlocked) return;
      clearErrors();
      if (validateStep(state.step, true)) showStep(state.step + 1, true);
    });
    form.addEventListener("input", function (event) {
      event.target.setCustomValidity && event.target.setCustomValidity("");
      event.target.removeAttribute("aria-invalid");
      var message = document.getElementById(event.target.getAttribute("data-error-id"));
      if (message) message.textContent = "";
    });
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (state.busy || state.succeeded || state.submissionBlocked) return;
      if (state.step < steps.length - 1) { next.click(); return; }
      clearErrors();
      for (var i = 0; i < steps.length; i++) {
        var wasDisabled = steps[i].disabled;
        steps[i].disabled = false;
        var valid = validateStep(i, false);
        steps[i].disabled = wasDisabled;
        if (!valid) { showStep(i, false); validateStep(i, true); return; }
      }
      var answers = collectAnswers(form);
      if (answers.company_fax) { error.textContent = "We couldn’t send your answers. Please try again."; error.hidden = false; return; }
      prepareAttempt(state, answers, win.crypto);
      form.querySelector("[name=submission_id]").value = state.submissionId;
      var payload = buildPayload(answers, state, config);
      ["survey_answers", "offer_interest", "meta_event", "lead_source", "submit_action"].forEach(function (name) { form.querySelector("[name=" + name + "]").value = payload[name]; });
      setBusy(true);
      try {
        var outcome = await sendSubmission(config, payload, { fetch:win.fetch.bind(win) });
        state.succeeded = true;
        setBusy(false);
        if (typeof win.fbq === "function") {
          try { win.fbq("track", "Lead", { content_name:"BCMG Marketing Fit Survey" }, { eventID:"bcmg-survey-" + state.submissionId }); } catch (_) { /* Tracking cannot prevent a confirmed submission outcome. */ }
        }
        showResult(outcome);
      } catch (failure) {
        setBusy(false);
        showSubmissionFailure(failure);
      }
    });
    showStep(0, false);
  }

  return { init:init, budgetMinimum:budgetMinimum, isQualified:isQualified, normalizePhone:normalizePhone, normalizeWebsite:normalizeWebsite, prepareAttempt:prepareAttempt, buildPayload:buildPayload, sendSubmission:sendSubmission, failureAction:failureAction, validateField:validateField, bookingUrl:bookingUrl };
});
