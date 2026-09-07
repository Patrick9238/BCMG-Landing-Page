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
       !! ACTION NEEDED !! The URL below is the OLD $2.99 Supporter link.
       Create a new $4.99/month recurring Payment Link in Stripe, set its
       success page to https://thepatrickcarrshow.com/thank-you-supporter.html,
       then paste that new URL here. Until you do, buyers are charged $2.99. */
    member: "https://buy.stripe.com/7sY28s8ZH0ex0qJ7iT7Vm00",
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
