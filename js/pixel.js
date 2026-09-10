/* =============================================================
   META PIXEL + EVENT TRACKING — The Patrick Carr Show
   -------------------------------------------------------------
   Loaded in the <head> of every page. Fires:
     • PageView          — every page
     • ViewContent       — merch catalog page
     • InitiateCheckout  — clicking the membership button, the donate
                           button, or a merch "Buy Now". Tagged with a
                           content_name and content_category so the funnels
                           can be split apart in Meta with Custom Conversions.
     • Lead              — story / contact form submit
     • Purchase          — membership / merch thank-you pages, with a real value
     • Donate            — donation thank-you page, no value (amount unknown)
   To change the Pixel ID, edit PIXEL_ID below.
   ============================================================= */
(function () {
  var PIXEL_ID = "1723577458775337";

  // --- Meta base code ---
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  fbq("init", PIXEL_ID);
  fbq("track", "PageView");

  // strip "$3,500/month" -> 3500
  function val(txt) {
    var n = parseFloat(String(txt || "").replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  function isStripe(href) { return /buy\.stripe\.com/.test(href || ""); }

  // --- Intent: clicking a tier "Join" or a merch "Buy Now" (delegated so it
  //     works for buttons rendered later by JS) ---
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;

    // The one-time donation button. No value: the donor has not picked an
    // amount yet, and sending a fake number would poison value optimization.
    var donate = e.target.closest("#donate-cta");
    if (donate && isStripe(donate.getAttribute("href"))) {
      fbq("track", "InitiateCheckout", {
        content_name: "One-Time Donation",
        content_category: "Donation",
        currency: "USD"
      });
      return;
    }

    var tier = e.target.closest(".tier-cta");
    if (tier && isStripe(tier.getAttribute("href"))) {
      var tc = tier.closest(".tier");
      var tname = tc && tc.querySelector("h3") ? tc.querySelector("h3").textContent.trim() : "Membership";
      var tval = tc && tc.querySelector(".price") ? val(tc.querySelector(".price").textContent) : 0;
      fbq("track", "InitiateCheckout", {
        content_name: tname, content_category: "Membership Tier",
        value: tval, currency: "USD"
      });
      return;
    }

    var buy = e.target.closest(".product .btn");
    if (buy && isStripe(buy.getAttribute("href"))) {
      var pc = buy.closest(".product");
      var pname = pc && pc.querySelector("h3") ? pc.querySelector("h3").textContent.trim() : "Merch";
      var pval = pc && pc.querySelector(".pp") ? val(pc.querySelector(".pp").textContent) : 0;
      fbq("track", "InitiateCheckout", {
        content_name: pname, content_type: "product",
        value: pval, currency: "USD"
      });
    }
  });

  // --- Leads: story / contact form submit (capture phase so it fires even
  //     though those handlers call preventDefault) ---
  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (!f || !f.id) return;
    if (f.id === "story-form") fbq("track", "Lead", { content_name: "Story Submission" });
    else if (f.id === "contact-form") fbq("track", "Lead", { content_name: "Contact Form" });
  }, true);

  /* A conversion should be counted once, on the visit that actually followed
     the payment. Without this, a refresh of a thank-you page reports another
     Purchase and inflates the conversion count Meta optimizes against. */
  function countOnce(key) {
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1");
    } catch (e) {}
    return true;
  }

  // --- Page-specific events ---
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("products")) {
      fbq("track", "ViewContent", { content_type: "product_group", content_name: "Show Merch" });
    }
    // A page opts into a Purchase event via <body data-fb-purchase="..." data-fb-value="..">.
    // Used by the thank-you pages reached only after a completed Stripe checkout.
    var pp = document.body ? document.body.getAttribute("data-fb-purchase") : null;
    if (pp && countOnce("fbq:purchase:" + pp)) {
      var pv = parseFloat(document.body.getAttribute("data-fb-value") || "0") || 0;
      fbq("track", "Purchase", { content_name: pp, currency: "USD", value: pv });
    }

    /* Donations fire Meta's standard Donate event, NOT Purchase, and carry no
       value. Two reasons this matters:
         - Donation amounts range from a few dollars to hundreds. Mixed into
           Purchase they would wreck value optimization and ROAS reporting for
           the $4.99 membership, which is the number that has to stay clean.
         - The amount is not knowable on this page. Stripe's redirect does not
           carry it, and reading it would need a server with a secret key.
       A page opts in via <body data-fb-donate="..."> */
    var dn = document.body ? document.body.getAttribute("data-fb-donate") : null;
    if (dn && countOnce("fbq:donate:" + dn)) {
      fbq("track", "Donate", { content_name: dn, currency: "USD" });
    }
  });
})();
