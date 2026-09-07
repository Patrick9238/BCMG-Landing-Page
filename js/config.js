/* =============================================================
   THE PATRICK CARR SHOW — SITE CONFIG
   -------------------------------------------------------------
   This is the ONE file you edit to go live. Everything that needs
   a real link, email, or ID later lives here. No code knowledge
   required — just replace the values inside the quotes.
   ============================================================= */

const CONFIG = {
  /* Brand */
  showName: "The Patrick Carr Show",
  company: "Blue Collar Media Group",
  domain: "thepatrickcarrshow.com",

  /* The single email that all purchase / contact notifications go to.
     Change this to whatever inbox you want everything routed to. */
  notifyEmail: "anthony@thepatrickcarrshow.com",

  /* ---- YouTube "latest video" ----
     EASIEST WAY TO ALWAYS SHOW YOUR NEWEST VIDEO:
     Put your channel ID below. We turn it into your "uploads"
     playlist automatically, so the newest upload always plays.
     Find your channel ID at: https://www.youtube.com/account_advanced

     If you'd rather pin ONE specific video, leave channelId empty
     and put the video's ID in videoId instead.
     (A YouTube URL like https://youtu.be/AbC123  -> videoId is "AbC123") */
  youtube: {
    channelId: "",                            // leave empty to pin one specific video below
    videoId: "phok2qKjXNY",                   // pinned latest episode (not a Short)
    channelUrl: "https://www.youtube.com/@ThePatrickCarr"
  },

  /* ---- Payments / Checkout ----
     When you set up Stripe Payment Links or a GoHighLevel order form,
     paste the URL for each item here. Until then, buttons gently tell
     the visitor checkout is opening soon.

     Each tier and product below references one of these keys. */
  checkoutLinks: {
    /* ---- THE ONE MEMBERSHIP (recurring, $4.99/month) ----
       The only tier on the site and the only link to keep current.
       Its Stripe "after payment" redirect points at
       https://thepatrickcarrshow.com/thank-you-member.html?paid=1
       which is what fires the new-member email and the Meta pixel
       Purchase event. If you ever swap this link, set that redirect on
       the new one too, and bump config.js?v= in the HTML files so
       returning visitors are not served the old link from cache. */
    member: "https://buy.stripe.com/eVq7sMdfX0ex4GZ0Uv7Vm07",

    /* ---- ARCHIVED TIER LINKS (kept for reference — NOT shown on the site) ----
       These are the old five tiers. They are no longer displayed anywhere:
       nothing in data.js points at these keys, so no button uses them.

       IMPORTANT: they are kept here only as a record. Existing subscribers
       are billed by STRIPE, not by this file — deleting or keeping a line
       here does not start, stop, or change anyone's subscription. To see or
       manage current members, go to Stripe, not this file.

       If you ever want one of these back on the site, add a tier block to
       js/data.js with a matching "linkKey". */
    _archived: {
      supporter:   "https://buy.stripe.com/7sY28s8ZH0ex0qJ7iT7Vm00",  // $2.99/mo
      contributor: "https://buy.stripe.com/3cI7sM6Rzgdv1uN32D7Vm01",  // $19.99/mo
      partner:     "https://buy.stripe.com/28E5kEa3Lf9rgpHcDd7Vm02",  // $199.99/mo
      founder:     "https://buy.stripe.com/28E8wQ0tb2mF6P75aL7Vm03",  // $3,500/mo
      showSponsor: "https://buy.stripe.com/dRm14o6Rzgdvddv8mX7Vm04"   // $10,000/mo
    },
    // Merch (one-time Stripe Payment Links) — each hat has its own Buy button
    hatFixOrlando:  "https://buy.stripe.com/7sY00k5Nv0ex8Xfbz97Vm05",
    hatWelcomeShow: "https://buy.stripe.com/bJe14oa3L9P7ddvdHh7Vm06"
  },

  /* ---- Weekly members-only call ----
     Powers the "Add to calendar" buttons on thank-you-member.html.
     Fill these in and the buttons appear automatically. Leave joinUrl
     empty and the page falls back to "Anthony will send you the link",
     so a new member never sees a broken button.

       day          Mon | Tue | Wed | Thu | Fri | Sat | Sun
       time         24-hour local start time, e.g. "19:00" is 7:00 PM
       durationMins how long the call runs
       timeZone     IANA zone. Orlando is "America/New_York"
       joinUrl      the STANDING Zoom / Meet link (same link every week) */
  weeklyCall: {
    day: "Wed",
    time: "16:00",
    durationMins: 60,
    timeZone: "America/New_York",
    joinUrl: "https://streamyard.com/hswqtpprvu",
    title: "The Patrick Carr Show — Members-Only Call",
    details: "Your weekly members-only group call with Patrick and Producer Anthony."
  },

  /* ---- Live views counter (home-page top bar) ----
     Shows a combined "views across our content" number that starts at
     `baseline` and ticks up over time at `perDay` views/day. To reset it,
     set `baseline` to the new total and `anchorISO` to the current time. */
  viewsCounter: {
    enabled: true,
    baseline: 4500000,                  // starting total shown
    anchorISO: "2026-06-24T12:00:00Z",  // when the baseline was set (keep in the past so it's always climbing)
    perDay: 120000,                     // AVERAGE new views/day (bump this up over time)
    swingPerDay: 20000,                 // rate ramps up/down by this (~100k–140k/day)
    periodHours: 6,                     // length of one ramp-up/ramp-down cycle
    label: "views across YouTube, Instagram, Facebook & TikTok"
  },

  /* Social / external links (footer). Leave blank to hide. */
  social: {
    youtube:   "https://www.youtube.com/@ThePatrickCarr",
    instagram: "https://www.instagram.com/patrick_r_carr/",
    facebook:  "",
    tiktok:    "",
    x:         ""
  }
};
