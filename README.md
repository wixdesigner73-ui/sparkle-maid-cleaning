# Sparkle Maid Cleaning Services — website

Static site, no build step. Open `index.html` in a browser (or upload the whole folder to any web host).

| Page | File |
|------|------|
| Home | `index.html` |
| About | `about.html` |
| Services | `services.html` |
| Contact | `contact.html` |

Shared files: `css/styles.css`, `js/main.js`, `images/`.

## Before launch — things only the owner can confirm

Search the HTML files for `EDITABLE` — each marks content that is a placeholder or a proposal:

- **Services** (4 categories, descriptions) — `index.html`, `services.html`, and the dropdown in `contact.html`. No prices, guarantees or inclusions have been added.
- **Testimonials** — three placeholder cards in `index.html`. Replace with real reviews (with permission). No ratings or statistics are shown.
- **Meet Kristen** — `about.html`. Add her story and photo (replace the dummy portrait `images/kristen-placeholder.jpg` and its alt text).
- **Mission and values** — `about.html`; "Why choose us" points — `index.html`.
- **Contact details** — only the phone number (762) 867-9326 is used. No address, email or service area has been invented.

## The quote form needs somewhere to send requests

The form validates and shows a success message, but it does **not** deliver anything until you set `FORM_ENDPOINT` at the top of `js/main.js` (e.g. a Formspree or Netlify Forms URL). Until then, requests go nowhere.

## Photography

Free-licence photos from [Unsplash](https://unsplash.com), downloaded and sized into `images/`. The hero photo is cropped from an Unsplash photo of a cleaner in yellow gloves; swap `images/hero-cleaner.jpg` (aim for ~1100×1350 portrait) if you source a different one.
