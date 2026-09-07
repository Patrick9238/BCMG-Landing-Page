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
       This is the only tier on the site and the only link to update.
       !! ACTION NEEDED !! The URL below is still the OLD $2.99 Supporter
       link, so buyers are currently charged $2.99, not $4.99.
       Create a new $4.99/month recurring Payment Link in Stripe, set its
       success page to https://thepatrickcarrshow.com/thank-you-supporter.html,
       then paste that new URL here in place of the one below. */
    member: "https://buy.stripe.com/7sY28s8ZH0ex0qJ7iT7Vm00",

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
