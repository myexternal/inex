# Inex Kitchen Solutions v4 "Daylight": build notes

## v4.1 fixes (2026-11-17)

- **Phone bar** ("Get a quote" + WhatsApp) now stays up through the scroll film instead of vanishing for about four screens. The film caption sits above it.
- **Contact details** were set so tight that "gmail.com" read as "gmailcom" and "6.0213° N" as "60213° N". They now have normal spacing.
- **Fonts** were missing "é" (Café, cafés) and "°" (the map pin), so phones drew those two characters in a different font. Both are now in the font files.
- **Real photos in "Kitchens for every kind of service".** All seven tiles now use Inex's own install photos (restaurant line, hotel kitchen, buffet, seafood counter, bain-marie, bar counter, home kitchen), cropped and lightly colour-corrected. A person in the buffet photo was cropped out and a brand name on a chiller door was blurred. The hero, the studio product shots, the film and the turntable are still AI-made (the hero is a cleaned-up version of their real restaurant line, the one in the Restaurants tile).
- **Proof:** "600+ projects delivered", "Building kitchens since 2009" and "Registered as Inex Kitchen Solutions (Pvt) Ltd in 2016" under the opening statement, "Since 2009" in the hero and a line in the quote form. These come from Inex via the user on 2026-11-17.
- **Google rating:** "5.0 from 5 reviews on Google Maps" with the one short written review by a customer (Lahiru Deshapriya De Silva: "Excellent customer service."), linking to the Google Maps listing. Checked on 2026-11-17; update the count if more reviews come in.
- `og:url`, `canonical` and the share image still point to `https://inex-24tf.onrender.com/`. When this goes on its final address, change those three lines (and `robots.txt`, `sitemap.xml`), or links shared on WhatsApp/Facebook will open the old site.

Upload the folder as it is. It is all static: HTML, CSS and vanilla JS, with fonts in `fonts/` and the smooth-scroll script in `vendor/`. There is no three.js in this version. Test it through a server or on Render, not by double-clicking `index.html`.

v1 (`../inex-kitchen/`), v2 (`../inex-kitchen-v2/`) and v3 (`../inex-kitchen-v3/`) are kept for comparison.

## What is new in v4

- **Bright and clean.** Warm paper background, white cards, steel photography, one red for actions. The design system is in `DESIGN.md`.
- **Light and bold type.** Every headline pairs a weight-200 line with a weight-800 line of the same typeface (Bricolage Grotesque).
- **Hierarchy.** One job per section, in this order: what Inex does, how a kitchen is made, what kinds of kitchen, the equipment, the real workshop, the five steps, the quote, the visit.
- **A different layout in every section:** framed photo hero, centred statement, pinned scroll film, bento grid, product feature with a turntable plus a rail, staggered portrait clips, sticky two-column steps, dark split panel, contact list beside a photo card.
- **Scroll film ("It starts as flat steel").** As you scroll, raw sheet, tube and burner rings assemble into the wok range, the range takes its place in a full kitchen, and the burners light.
- **360° wok range.** Drag it (or use the arrow keys) to turn it round.
- **The CTA, "Light it up".** The quote form ends on an ignition knob. On submit the burner lights across the whole screen with "Flame on.", then the panel stays lit and one green button sends the request to WhatsApp on +94 77 665 4172. Tiles and "Ask about this" links pre-tick the form.
- **Real crew, real workshop.** Five clips from the new videos (petrol polos only) and one still of the crew in the visit card.

## What is AI-made, and what is real

Please have Inex look at these before it goes live.

| On the site | What it is |
| --- | --- |
| Workshop clips (Mark out, Fold, Finish, Check, Ready), hero mini clip, crew photo in "Visit" | **Real.** Cut from IMG_0891, 0910, 0915, 0917, 0925 and 0927, lightly graded |
| Hero photo and the seven "Kitchens" photos | **AI re-shoots of their real installs** (made with Higgsfield from their own WhatsApp photos, cleaned up and relit). The layout of each kitchen follows the real one, but small details can differ |
| Wok range, four-burner range, deck oven, fryers, griddle product shots | **AI studio versions of real units** seen in their photos and videos |
| Scroll film, 360° turntable, burner ignition | **Illustrations made with Higgsfield.** The film is labelled on the page: "Illustration of our process. The wok range is modelled on a real Inex unit." |

If Inex would rather show only untouched photos, the hero and the kitchen tiles are the ones to swap. I would need sharper originals than the WhatsApp copies.

## Questions for Inex before this goes live

Unverified claims are **not on the site**:

| Item | Status | What I need |
| --- | --- | --- |
| "17+ years" (2009 and 600+ now confirmed and on the site), warranty | Kept off | Real numbers if they want them shown |
| Stainless grades | Not on the site. The wok range says "Welded stainless steel" only | Which grades they use |
| Four-burner range, deck oven, fryers, griddle | Shown as equipment that goes into the line, with no "made here" claim. Only the wok range says "Made in our workshop" | Does Inex make these or supply them? |
| "Rings: two, or as many as your line needs" and "Length: made to your wall" | My wording from their made-to-measure work | Confirm they do build wok ranges to any length |
| Service area | Not stated anywhere | Where they deliver and install |
| Opening hours | Not on the site | Hours, if they want walk-ins |
| The five steps (Measure, Draw, Build, Fit, Fire up) | My reading of how they work. "We come to your site" and "we test every burner and stay until it works" are promises | Confirm, or tell me the real steps |
| Kitchen types: restaurants, hotels, buffets, seafood, hot holding, bars and cafés, homes | Taken from their install photos | Remove any they do not want to sell |

## The quote reference

"INX-YYMM-1234" is made in the browser. Nothing is stored or sent until the visitor taps "Send it on WhatsApp" or "Email it instead", and then it is just text in that message. There is no database and no form backend.

## Tested

- 125 click-checks pass at 390, 820, 1024, 1440 and 1920 pixels wide: menu and nav links, film chapters, tiles and "Ask" links pre-ticking the form, turntable drag, form errors, the ignition, the WhatsApp and email links, "Change the details", the map, the phone dock, no sideways scroll, no broken images, no invisible elements catching taps, no script errors.
- Headlines fit at 12 widths from 320 to 1920.
- This was tested in Chromium with phone emulation. It has **not** been tested on a real iPhone or Android phone. Please open it on your own phone once before showing the client.

## Speed

Measured on a throttled iPhone-sized phone (4× slower CPU) through a server that compresses files like Render does:

| Connection | First screen downloads | First paint | Largest picture shown |
| --- | --- | --- | --- |
| 4G (9 Mbps, 150 ms) | 246 KB | 1.0 s | 1.0 s |
| Slow (1.6 Mbps, 300 ms) | 246 KB | 1.5 s | 2.1 s |

- The whole page is about 3.6 MB on a phone if someone scrolls all of it, most of it the film frames, which load only when the film is near.
- Videos always play on every connection. Only the Reduce Motion setting stops them (the film still follows the scroll because the visitor drives it, and the form skips the ignition). On iPhones in Low Power Mode, iOS blocks autoplay until the first touch, so the site starts the clips on the first tap.
- Phones get an 800-pixel version of the film. Desktops get 1280.
- CSS and JS are minified (`css/site.min.css`, `js/app.min.js`). The readable `site.css` and `app.js` sit next to them. After editing them, re-minify or point `index.html` at the readable files.

## Before launch

- `canonical`, `og:url`, `og:image` and the business markup point to `https://inex-24tf.onrender.com/`. If v4 goes on another address, replace that address in `index.html`, `sitemap.xml` and `robots.txt`.
- The share image is `media/share.jpg` (1200×630).
- The Google map loads only when someone taps "Show the map".

## SEO

- Title: "Commercial Kitchens in Sri Lanka | Inex Kitchen Solutions, Unawatuna". The H1 carries a full sentence for search engines and the short headline for people.
- Business details are marked up for Google (LocalBusiness): name, address, map pin, phone, email and Facebook. Nothing unverified (hours, ratings, years) is in it.
