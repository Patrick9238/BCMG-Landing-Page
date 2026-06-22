# The Patrick Carr Show — Website

A fast, conversion-focused website for **The Patrick Carr Show**, powered by Blue Collar Media Group.
Built as a plain static site (HTML / CSS / JavaScript) — no build step, no server required. It deploys
to any host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, or your GoHighLevel site).

## Pages

| Page | File | Purpose |
|------|------|---------|
| Welcome | `index.html` | Show intro, latest YouTube video, and all 5 support tiers |
| Merchandise | `merch.html` | Hats with add-to-cart |
| Approved Businesses | `businesses.html` | Interactive Florida map of businesses you support |
| Contact Us | `contact.html` | Contact form + ways to reach you |

## The only file you normally edit: `js/config.js`

Everything that needs a real value to go live lives in **`js/config.js`**. Open it in any text editor
and fill in the blanks — no coding required.

- **`notifyEmail`** — the single inbox where contact-form messages go.
- **`youtube`** — show your latest video automatically (set `channelId`) or pin one video (`videoId`).
- **`checkoutLinks`** — paste a payment URL for each tier and for merch checkout (see below).
- **`social`** — your social links for the footer.

To change the **content** (tier perks, prices, products, businesses), edit **`js/data.js`** —
it's organized as simple lists with comments showing how to add more.

## Showing your latest YouTube video

**Already configured.** The home page is wired to the channel **@ThePatrickCarr**
(`channelId: "UCQVALUBg3MEO2b__twd1KRQ"`), so your **newest upload plays automatically** —
nothing to do.

Prefer to feature one specific video instead? In `js/config.js`, clear `channelId` and set
`videoId` to the video's ID (the part after `youtu.be/` or `watch?v=`).

## Taking payments (recommended: Stripe)

**Recommendation:** use **Stripe**. It handles both recurring subscriptions (your 5 tiers) and one-time
merch in one account, and it **connects natively to GoHighLevel**, so the supporters/sponsors you bring in
flow right into your GHL pipeline with their tier. You can launch with **no backend**.

Two easy options — pick one:

**A) Stripe Payment Links (fastest)**
1. In Stripe, create a Payment Link for each tier (set as *recurring/monthly*) and for merch (*one-time*).
2. Paste each link into `CONFIG.checkoutLinks` in `js/config.js`:
   - `supporter`, `contributor`, `partner`, `founder`, `showSponsor` → tier links
   - `cartCheckout` → your merch checkout link
3. Buttons now send customers straight to secure Stripe checkout.

**B) GoHighLevel order forms**
1. Build order forms / payment products in GHL (GHL uses Stripe under the hood).
2. Paste each form's URL into the same `checkoutLinks` keys.
3. Customers and their tier are captured directly in GHL.

> Until you add links, the buttons show a friendly "checkout opening soon — contact us" message,
> so the site is safe to publish immediately.

## Capturing leads in GoHighLevel

The contact form currently composes an email to `notifyEmail`. To capture leads directly in GHL:
embed a GHL form, or point the form at a GHL inbound webhook. (Ask your developer to swap the
form handler in `contact.html` — it's clearly commented.)

## Editing the Approved Businesses map

Open `js/data.js` and edit the `BUSINESSES` list. For each business set:
`name`, `category`, `city`, `lat`, `lng` (coordinates from <https://www.latlong.net>),
one or more `images`, an `info` line, and your personal `writeup`.
The map uses Leaflet + free OpenStreetMap tiles — **no API key or billing required**.

## Brand assets & rules

The real logo and photos are already integrated (see `assets/img/` and `CLAUDE.md`):
- **Logo** — the neon-sign logo (`assets/img/logo-neon.png`) is in the header, footer, and favicon.
  **It must not be altered** — keep it exactly as the neon sign it is.
- **Photos of Patrick** must always stay **ultra-realistic** — small enhancements only
  (crop/color/exposure/background cleanup), never AI edits that distort his face or body.
- **Blue Collar Media Group** logo appears in the footer, linking to bluecollarmediagroup.com.
- **Socials** (YouTube + Instagram) are wired site-wide from `js/config.js`.

Still using placeholders (swap when you have real images — keep the filenames or update `js/data.js`):
- `assets/hat-fix-orlando.svg` / `assets/hat-welcome-show.svg` → product photos
- `assets/business-placeholder.svg` → business photos

## Running it locally

It's just files — open `index.html` in a browser. For the map and modules to behave exactly like
production, serve it with any static server, e.g.:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Going live on thepatrickcarrshow.com

Upload these files to your host and point the domain at it. On Netlify/Vercel you can drag-and-drop
the folder or connect this Git repo, then add the custom domain `thepatrickcarrshow.com`.
