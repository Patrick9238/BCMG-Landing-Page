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
  notifyEmail: "patrick@bluecollarmediagroup.com",

  /* ---- YouTube "latest video" ----
     EASIEST WAY TO ALWAYS SHOW YOUR NEWEST VIDEO:
     Put your channel ID below. We turn it into your "uploads"
     playlist automatically, so the newest upload always plays.
     Find your channel ID at: https://www.youtube.com/account_advanced

     If you'd rather pin ONE specific video, leave channelId empty
     and put the video's ID in videoId instead.
     (A YouTube URL like https://youtu.be/AbC123  -> videoId is "AbC123") */
  youtube: {
    channelId: "",                 // e.g. "UCxxxxxxxxxxxxxxxxxxxxxx"
    videoId: "dQw4w9WgXcQ",        // placeholder — swap for your video
    channelUrl: "https://www.youtube.com/"  // "Subscribe" / "See all" link
  },

  /* ---- Payments / Checkout ----
     When you set up Stripe Payment Links or a GoHighLevel order form,
     paste the URL for each item here. Until then, buttons gently tell
     the visitor checkout is opening soon.

     Each tier and product below references one of these keys. */
  checkoutLinks: {
    // Subscription tiers (recurring)
    supporter:   "",   // e.g. "https://buy.stripe.com/xxxx"
    contributor: "",
    partner:     "",
    founder:     "",
    showSponsor: "",
    // Merch (one-time) — used by the cart's checkout button
    cartCheckout: ""
  },

  /* Social / external links (footer). Leave blank to hide. */
  social: {
    youtube:   "https://www.youtube.com/",
    instagram: "",
    facebook:  "",
    tiktok:    "",
    x:         ""
  }
};
