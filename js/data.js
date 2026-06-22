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
   - "image" points at a file in /assets
   --------------------------------------------------------------- */
const PRODUCTS = [
  {
    id: "hat-fix-orlando",
    name: "Fix Orlando Hat",
    price: 29.99,
    image: "assets/hat-fix-orlando.jpg",
    description: "Structured embroidered hat. Wear the mission — Fix Orlando.",
    linkKey: "hatFixOrlando"
  },
  {
    id: "hat-welcome-to-the-show",
    name: "Welcome To The Show Hat",
    price: 29.99,
    image: "assets/hat-welcome-show.jpg",
    description: "Our signature lid. Welcome To The Show — now rep it everywhere.",
    linkKey: "hatWelcomeShow"
  }
];

/* ---------------------------------------------------------------
   APPROVED BUSINESSES  (shown on the Businesses map)
   - lat/lng place the pin on the Florida map
   - look up coordinates at https://www.latlong.net if you need them
   - "images" can hold one or more photo paths
   - "writeup" is your personal note about the business
   --------------------------------------------------------------- */
const BUSINESSES = [
  {
    name: "Example Auto & Tire",
    category: "Automotive",
    city: "Orlando, FL",
    lat: 28.5383,
    lng: -81.3792,
    images: ["assets/business-placeholder.svg"],
    info: "Family-owned full-service auto and tire shop serving Central Florida.",
    writeup: "These folks treated my truck like it was their own. Honest pricing, real craftsmanship — exactly the kind of business the Show stands behind. — Patrick"
  },
  {
    name: "Example Diner",
    category: "Food & Drink",
    city: "Winter Park, FL",
    lat: 28.6000,
    lng: -81.3392,
    images: ["assets/business-placeholder.svg"],
    info: "Local diner with from-scratch breakfast and the friendliest counter in town.",
    writeup: "Best cup of coffee and a handshake to go with it. Add your write-up here. — Patrick"
  }
  /* Add more businesses by copying a block above. */
];
