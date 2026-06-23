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
  notifyEmail: "anthony@bluecollarmediagroup.com",

  /* ---- YouTube "latest video" ----
     EASIEST WAY TO ALWAYS SHOW YOUR NEWEST VIDEO:
     Put your channel ID below. We turn it into your "uploads"
     playlist automatically, so the newest upload always plays.
     Find your channel ID at: https://www.youtube.com/account_advanced

     If you'd rather pin ONE specific video, leave channelId empty
     and put the video's ID in videoId instead.
     (A YouTube URL like https://youtu.be/AbC123  -> videoId is "AbC123") */
  youtube: {
    channelId: "UCQVALUBg3MEO2b__twd1KRQ",   // @ThePatrickCarr — newest upload auto-plays
    videoId: "",                              // optional: pin one specific video instead
    channelUrl: "https://www.youtube.com/@ThePatrickCarr"
  },

  /* ---- Payments / Checkout ----
     When you set up Stripe Payment Links or a GoHighLevel order form,
     paste the URL for each item here. Until then, buttons gently tell
     the visitor checkout is opening soon.

     Each tier and product below references one of these keys. */
  checkoutLinks: {
    // Subscription tiers (recurring)
    supporter:   "https://buy.stripe.com/7sY28s8ZH0ex0qJ7iT7Vm00",
    contributor: "https://buy.stripe.com/3cI7sM6Rzgdv1uN32D7Vm01",
    partner:     "https://buy.stripe.com/28E5kEa3Lf9rgpHcDd7Vm02",
    founder:     "https://buy.stripe.com/28E8wQ0tb2mF6P75aL7Vm03",
    showSponsor: "https://buy.stripe.com/dRm14o6Rzgdvddv8mX7Vm04",
    // Merch (one-time Stripe Payment Links) — each hat has its own Buy button
    hatFixOrlando:  "https://buy.stripe.com/7sY00k5Nv0ex8Xfbz97Vm05",
    hatWelcomeShow: "https://buy.stripe.com/bJe14oa3L9P7ddvdHh7Vm06"
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
