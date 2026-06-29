/* =============================================================
   SITE CONTENT — TIERS, MERCH, BUSINESSES
   -------------------------------------------------------------
   Add to these lists anytime. The pages build themselves from
   what's here. To add a perk, add a line to "perks". To add a
   tier, copy a whole { ... } block. To add a business, add a
   block to BUSINESSES with its map coordinates.
   ============================================================= */

/* ---------------------------------------------------------------
   SUPPORT TIERS  (shown on the Welcome page)
   - "linkKey" must match a key in CONFIG.checkoutLinks
   - "featured: true" highlights the card
   - "badge" shows a small ribbon (e.g. limited spots)
   --------------------------------------------------------------- */
const TIERS = [
  {
    name: "Supporter",
    price: "$2.99",
    cadence: "/month",
    blurb: "Get in the room. Bring your stories. Be part of the movement.",
    linkKey: "supporter",
    perks: [
      "Weekly group meetings with Patrick and Anthony",
      "Weekly meetings with Blue Collar Media Group Marketing",
      "Free hat with purchase of a 1-year subscription",
      "Dedicated email to send us your stories"
    ]
  },
  {
    name: "Contributor",
    price: "$19.99",
    cadence: "/month",
    blurb: "Closer access. Direct conversations. A seat at the table.",
    linkKey: "contributor",
    perks: [
      "Everything in Supporter, plus…",
      "1-on-1 weekly calls with Producer Anthony",
      "Dedicated group call with Patrick (Contributors only)"
    ]
  },
  {
    name: "Partner",
    price: "$199.99",
    cadence: "/month",
    blurb: "Put your business behind the Show — and the Show behind you.",
    featured: true,
    linkKey: "partner",
    perks: [
      "Everything in Contributor, plus…",
      "Become a “The Show” approved business (a business we support)",
      "The Show Approved sign for your website & commercial use",
      "Monthly 1-on-1 calls with the BCMG Marketing team"
    ]
  },
  {
    name: "Founder",
    price: "$3,500",
    cadence: "/month",
    blurb: "A production team in your corner, creating content every month.",
    linkKey: "founder",
    perks: [
      "Everything in Partner, plus…",
      "A BCMG videographer on-site at your business every month (travel included)",
      "1 videographer, 1 full day on-site",
      "Full editing of up to 10 social media reels",
      "Ownership of all content",
      "Pre-production and planning services",
      "Dedicated onboarding and content plan from the BCMG team",
      "Dedicated account representative for your business",
      "A 1-on-1 30-minute call with Patrick",
      "Direct 1-on-1 access to Producer Anthony"
    ]
  },
  {
    name: "Show Sponsor",
    price: "$10,000",
    cadence: "/month",
    blurb: "The top of the house. Full-scale production, leads, and a brand-new site.",
    badge: "ONLY 3 SPOTS LEFT",
    linkKey: "showSponsor",
    perks: [
      "Everything in Founder, plus…",
      "Bi-weekly 1-on-1 calls with Patrick, 1 hour each",
      "2 videographers (instead of 1)",
      "2 days on-site (instead of 1)",
      "Up to 20 videos edited each month",
      "2 videos created by Patrick for your brand",
      "Full lead-gen and campaign setup for your business",
      "Website buildout",
      "Direct access to weekly 1-on-1 meetings with BCMG Vice President Russell Severe"
    ]
  }
];

/* ---------------------------------------------------------------
   MERCHANDISE  (shown on the Merch page)
   - "id" must be unique; the cart uses it
   - "images" is an array of photos shown as a looping carousel
     (first photo is the product shot; add model photos after it)
   --------------------------------------------------------------- */
const PRODUCTS = [
  {
    id: "hat-fix-orlando",
    name: "Fix Orlando Hat",
    price: 29.99,
    images: ["assets/hat-fix-orlando.jpg", "assets/hat-fix-orlando-2.jpg", "assets/hat-fix-orlando-3.jpg"],
    description: "The hat that makes a statement. You don't settle. You want more.",
    linkKey: "hatFixOrlando"
  },
  {
    id: "hat-welcome-to-the-show",
    name: "Welcome To The Show",
    price: 29.99,
    images: ["assets/hat-welcome-show.jpg", "assets/hat-welcome-2.jpg", "assets/hat-welcome-3.jpg"],
    description: "You're a part of a movement. A group of leaders who want change.",
    linkKey: "hatWelcomeShow"
  }
];

/* ---------------------------------------------------------------
   APPROVED BUSINESSES  (shown on the Businesses map)
   - lat/lng place the pin on the Florida map
   - look up coordinates at https://www.latlong.net if you need them
   - "googleUrl" links the pin to the business's Google profile
     (paste the share link or full Google Maps/Business URL)
   - "images" can hold one or more photo paths (optional)
   - "writeup" is your personal note about the business
   --------------------------------------------------------------- */
const BUSINESSES = [
  {
    name: "Corsa Automotive",
    category: "Automotive",
    city: "Orlando, FL",
    lat: 28.5509,
    lng: -81.4595,
    googleUrl: "https://share.google/JeihpsKtrajS23PmI",
    logo: "assets/logo-corsa.png",
    photo: "assets/biz-corsa.jpg",
    featured: true,
    info: "Full-service auto repair, collision, custom wraps, wheels, and tuning in Central Florida.",
    writeup: "Kenan is a personal friend and this shop can handle it all. From wraps to wheels. Thank you Corsa. — Patrick"
  },
  {
    name: "Logos Promote",
    category: "Apparel & Print",
    city: "Orlando, FL",
    lat: 28.5042,
    lng: -81.4175,
    googleUrl: "https://share.google/eQmwA3m3Y4tnfxGg6",
    logo: "assets/logo-logos-promote.png",
    featured: true,
    info: "Custom screen printing, embroidery, promotional products, signage, and wraps in Orlando.",
    writeup: "Every shirt and hat for the show goes through Logos Promote… we wouldn't use anyone else. — Patrick"
  },
  {
    name: "LunaFit",
    category: "Fitness",
    city: "Altamonte Springs, FL",
    lat: 28.6464,
    lng: -81.4158,
    googleUrl: "https://share.google/eU14WzpeRPme1HfgP",
    logo: "assets/logo-lunafit.png",
    photo: "assets/biz-lunafit.jpg",
    featured: true,
    info: "Full-service gym — personal training, group classes, fresh meals, and supplements.",
    writeup: "The best gym environment in Orlando! Great people, meals, supplements. Everything you need. — Patrick"
  },
  {
    name: "Lazy Moon Pizza",
    category: "Pizza & Eats",
    city: "Orlando, FL",
    lat: 28.5532,
    lng: -81.3660,
    googleUrl: "https://www.lazymoonpizza.com/",
    logo: "assets/logo-lazymoon.svg",
    featured: true,
    info: "Giant New York-style slices, craft beer, and a Mills 50 institution. Come hungry.",
    writeup: "The best pizza in Orlando, come with an appetite because the slices are bigger than your head. — Patrick"
  },
  {
    name: "Colonial Photo & Hobby",
    category: "Photo & Hobby",
    city: "Orlando, FL",
    lat: 28.5524,
    lng: -81.3645,
    googleUrl: "https://cphfun.com/",
    logo: "assets/logo-cph.png",
    featured: true,
    info: "Orlando's home for cameras, photo gear, hobbies, and expert advice — since 1956.",
    writeup: "This is where Blue Collar Media Group buys all of our gear, you won't find friendlier and more knowledgeable people. — Patrick"
  },
  {
    name: "Mechanical One",
    category: "HVAC & Plumbing",
    city: "Altamonte Springs, FL",
    lat: 28.6654,
    lng: -81.3935,
    googleUrl: "https://mechanicalone.com/",
    logo: "assets/logo-mechanicalone.svg",
    featured: true,
    info: "HVAC, plumbing, and home comfort experts serving Central Florida — 1,200+ five-star reviews.",
    writeup: "With over 1,200 five-star reviews it's no surprise they are the team I turn to when I've got an HVAC or plumbing issue. — Patrick"
  },
  {
    name: "Blue Collar Media Group",
    category: "Media & Marketing",
    city: "Altamonte Springs, FL",
    lat: 28.6470,
    lng: -81.4150,
    googleUrl: "https://share.google/Ok9mOLtrUeKAwuSHe",
    logo: "assets/img/bcmg-logo.png",
    info: "Video, marketing, and lead generation built for contractors and home-service companies.",
    writeup: "The #1 media company for contractors in the country. — Patrick"
  }
  /* Add more businesses by copying the block above. */
];
