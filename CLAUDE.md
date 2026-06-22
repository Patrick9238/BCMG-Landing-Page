# Project Notes — The Patrick Carr Show

Brand and content rules for this site. **Read before changing logos, photos, or brand styling.**

## Non-negotiable brand rules

1. **The logo must NOT be changed.** The Patrick Carr Show logo is a neon-sign design and must
   always stay that way — same artwork, same neon look. Do not recolor, redraw, flatten, or
   regenerate it. Use the provided files as-is:
   - `assets/img/logo-neon.png` — transparent background (primary, used on the dark site)
   - `assets/img/logo-neon-black.png` — black background version (social/share image)

2. **Photos of Patrick must always stay ultra-realistic.** Never run AI edits that distort his
   face or body. Small enhancements only (crop, light color/exposure, background cleanup).
   No reshaping, face swaps, body morphing, or generative changes.

## Key links

- Domain: https://thepatrickcarrshow.com
- YouTube: https://www.youtube.com/@ThePatrickCarr  (channel ID `UCQVALUBg3MEO2b__twd1KRQ`)
- Instagram (show = Patrick's personal): https://www.instagram.com/patrick_r_carr/
- Company: Blue Collar Media Group — https://bluecollarmediagroup.com
- Notification email: set in `js/config.js` (`notifyEmail`)

## Image inventory (`assets/img/`)

| File | What it is | Used on |
|------|-----------|---------|
| `logo-neon.png` | Show logo, transparent (neon) | Header, footer, favicon — all pages |
| `logo-neon-black.png` | Show logo, black bg | `og:image` social preview |
| `bcmg-logo.png` | Blue Collar Media Group logo | Footer "Powered by" badge |
| `patrick-stage.png` | Patrick speaking on stage | "Meet Your Host" section |
| `patrick-pointing.png` | Patrick pointing (transparent cutout) | Home CTA band |
| `patrick-presenting.png` | Patrick gesturing (transparent cutout) | Spare — available for future use |
| `patrick-profile.png` | Arms-crossed headshot (black bg) | Spare |
| `patrick-profile-black.png` | Headshot, black bg | Spare |
| `show-thumbnail.png` | Pre-made blue thumbnail graphic | Not used (has its own background) |

Source of truth for the originals: Google Drive → shared "Pictures" folder
(`drive.google.com/drive/folders/1LABNFR8YQWHkB4BO0sroxFWyjtPXSgyN`).

## Where things live

- **Go-live settings** (links, email, YouTube, payments): `js/config.js`
- **Content** (tiers, products, businesses): `js/data.js`
- **Shared behavior** (nav, YouTube embed, tiers, footer/socials): `js/main.js`
- See `README.md` for full setup/deploy instructions.
