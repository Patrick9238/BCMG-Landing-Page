/* =============================================================
   META PIXEL + EVENT TRACKING — The Patrick Carr Show
   -------------------------------------------------------------
   Loaded in the <head> of every page. Fires:
     • PageView          — every page
     • ViewContent       — merch catalog page
     • InitiateCheckout  — clicking a tier "Join" or merch "Buy Now"
                           (tagged with the tier/product name + price)
     • Lead              — story / contact form submit
     • Purchase          — the thank-you page (after Stripe checkout)
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

  // --- Page-specific events ---
  document.addEventListener("DOMContentLoaded", function () {
    var path = (location.pathname || "").toLowerCase();
    if (document.getElementById("products")) {
      fbq("track", "ViewContent", { content_type: "product_group", content_name: "Show Merch" });
    }
    if (/thank-you(\.html)?$/.test(path)) {
      // Reached only via Stripe's post-payment redirect.
      fbq("track", "Purchase", { currency: "USD", value: 0 });
    }
  });
})();
