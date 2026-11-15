# Inex Kitchen Solutions v3: build notes

Upload the folder as it is. It's all static (HTML, CSS, vanilla JS, three.js and Lenis in `vendor/`, fonts in `fonts/`). The 3D model won't load from `file://`, so test it through a server or on Render.

v1 (`../inex-kitchen/`) and v2 (`../inex-kitchen-v2/`) are kept for comparison.

## What's new in v3

- **New look:** the "Forge" design system (see `DESIGN.md`). It's dark and cinematic, uses full-screen graded footage, and has a different layout in every section.
- **16 new clips** from the new crew videos (new polos only), colour graded dark. Each has a wide cut (1280×720) and a tall cut for phones (540×960), at 0.2 to 0.47 MB each.
- **Studio shots** of the wok range, the four-burner range, the deck oven and the twin fryers. They were made with Higgsfield from frames of Inex's own videos and put on a dark studio background. **They are AI-generated versions of their real units, so please have Inex check the details look right.**
- **The CTA:** the visitor fills in the plate. On "Stamp my order", the whole screen goes red and "APPROVED for fabrication" slams in with sparks (and a buzz on phones). Then the plate gets stamped and a pulsing WhatsApp button sends the order to +94 77 665 4172.
- **"Ask about this"** on each piece of equipment jumps to the form with that item already ticked.
- The nameplate on the site says **"Kitchen Solutions"**. Note that the real metal plate in their videos reads "Kitchen Equipment", and step 5 of "How a kitchen gets made" shows that real plate in the clip. If that shouldn't appear, swap clip `s5`.

## Questions for Inex before this goes live

Unverified claims are **not on the site**:

| Item | Status | What I need |
| --- | --- | --- |
| "Since 2009", "17+ years", "600+ projects", "5.0 Google rating", warranty | Kept off | Real numbers if they want them shown |
| Stainless grades (whiteboard in IMG_0894: "202 / 304, 1.0") | Not on the site | Which grades they use, if they want it shown |
| Deck oven, twin fryers, four-burner range | Described as "on our floor", not "built by us" | Did Inex make these? Only the wok range says "Built here" |
| The three facts (5 steps, 1 crew, 1 plate on every unit) | Taken from their process and videos | Fine unless they work differently |
| "Fitted in kitchens around the south" | A soft guess from the photos | Real service area |
| Opening hours | Not found | Until then the site says "please call before you visit" |

## The work order reference

"INX-YYMM-1234" is made in the browser. Nothing is stored or sent until the visitor taps "Send on WhatsApp", and then it's just text in the message.

## Before launch

- `og:image`, `og:url` and `canonical` point to `https://inex-24tf.onrender.com/` (the share image is `media/share.jpg`). If v3 goes on another address, change those three lines.
- The map only loads when someone taps "Show the map".

## Speed

Measured on a throttled iPhone-sized phone (4× slower CPU) through a server that compresses files like Render does:

| Connection | First screen downloads | First paint | Page ready |
| --- | --- | --- | --- |
| Slow 3G (0.4 Mbps, 400 ms) | 130 KB (was 802 KB) | 2.6 s (was 4.5 s) | 3.5 s (was 17.9 s) |
| Fast 3G (1.6 Mbps) | 130 KB | 1.5 s | 1.6 s |
| 4G (9 Mbps) | 130 KB | 0.8 s | 0.7 s |

What changed for speed:
- Fonts are now self-hosted in `fonts/`, cut down to the characters the site uses (65 KB instead of 95 KB, and no extra trips to Google).
- CSS and JS are minified (`css/site.min.css`, `js/app.min.js`). The readable `site.css` and `app.js` are kept next to them for edits; re-minify after changing them, or point `index.html` back at the readable files.
- Photos below the first screen only load when you scroll near them. Phones get the smaller photo sizes.
- The hero's next clip and poster load just before they're needed, not all at once.
- Videos always play, on every connection (on slow ones the poster shows until the clip has buffered). Only Reduce Motion stops them. On iPhones in Low Power Mode, iOS blocks autoplay until the first tap, so the site starts the videos on the first touch.
- The smooth-scroll script loads only on desktop computers with a mouse, after the page has loaded.
- three.js and the 3D model still load only near the equipment cards.

## SEO

- The title and description name the service and the place: "Commercial Kitchens in Sri Lanka | Inex Kitchen Solutions, Unawatuna".
- Business details are marked up for Google (LocalBusiness schema): name, address, map pin, phone, email, Facebook and services. Nothing unverified (hours, ratings, years) is in it.
- The main heading includes "Inex Kitchen Solutions: commercial kitchens built in Unawatuna, Sri Lanka" for search engines and screen readers. Visitors still see "Cut. Fold. Weld. Serve."
- `robots.txt` and `sitemap.xml` are included. Share tags (Facebook, WhatsApp, X) have the image size and alt text set.
- **When the site moves to its own domain**, replace `https://inex-24tf.onrender.com` everywhere in `index.html`, `robots.txt` and `sitemap.xml`. Then add the site in Google Search Console and submit the sitemap.
- The biggest SEO win from here is off the site: a Google Business Profile for the workshop with photos and reviews, linked to this site.

## Checked

- Every big headline measured at 12 widths from 320 to 1920 px, so none get cut off (fixed "MEASURE" on large screens and "RESTAURANTS" on small phones).
- Click-tested at 390, 820, 1024, 1440 and 1920 px wide in Chromium: hero chapters, menu, anchors, kitchen strips, the pinned process, "Ask about this", form errors, engraving, the full-screen "Approved" moment, the WhatsApp message, "Change something", the map and the 3D load. No script errors, no failed requests and no sideways scroll at any width.
- **Not checked on a real phone.** Please open it on an iPhone and an Android before sending it to Inex, especially video autoplay, the pinned process section and the stacked cards.
