# Inex Kitchen Solutions: build notes

Open `index.html` through a local server or upload the folder as it is (the 3D model will not load from `file://`). Everything is static: HTML, CSS, vanilla JS and three.js (bundled in `vendor/`, no CDN).

## Questions for Inex before this goes live

These were in the Framer draft or on Facebook, but I could not verify them, so **they are not on the site**. Confirm any you want added back.

| Claim | Where it came from | What I need |
| --- | --- | --- |
| "Since 2009" / "17+ years" | Only the Facebook handle `INEX2009` | The real founding year |
| "600+ projects" | Framer draft | A real count, or drop it |
| "5.0 Google rating" | Framer draft | Rating and review count from their Google profile |
| "Lifetime warranty" | Facebook | What it covers, in writing |
| Service towns (Galle, Colombo, Kurunegala) | Framer draft | Where they actually install. The site says "islandwide" |
| Opening hours | Not found anywhere | Hours. Until then the site says "please call before you visit" |

Other open points:

- **Burners and valves.** Inex makes the wok burner tables (confirmed). The burner heads and gas valves are probably bought in. The copy says they are "fitted and checked", which is true either way.
- **Supplied brands.** Photos show MATOSA ranges and Abans equipment. The site says "supplied equipment" without brand names. Do they want brands named?
- **People photos.** Only real crew photos are used. The man in the selfies (p32 to p34) is left out. If he is the owner, a short "about" line with his photo would help.
- **More finished kitchens.** The weakest part of the page is the "Kitchens we have handed over" strip. Ask for 6 to 10 wide, well-lit photos of finished client kitchens (and the client names, if they can be shown).
- **Email.** inexkitchen@gmail.com is used. A domain email would look better once there is a domain.

## Before launch

- `og:image` in `index.html` is `media/share.jpg` (relative). Change it to an absolute URL (`https://<domain>/media/share.jpg`) once the domain exists, or link previews will not show the image.
- Add `<link rel="canonical">` and an `og:url` meta tag with the same domain.
- The WhatsApp brief sends to +94 77 665 4172. Check that number is on WhatsApp.

## Fixed from the Framer draft

- Placeholder copy replaced with real copy throughout.
- Map now points at the real workshop (plus code 27C2+GP, 6.0213, 80.2518) instead of the UK.
- Stock and AI people photos removed. Only Inex's own photos are used.
- The fish photo is no longer under "Delivery and installation". It now sits with the seafood display counters Inex built.
- Unverified statistics removed (see above). Typos gone with the old copy.

## What's in the page

1. Hero: whole kitchens first, with the dark hot-line photo.
2. Five working zones (Store, Prep, Cook, Wash, Serve): tabs swap a cut-out product, the equipment list and real photos.
3. 3D wok burner table, turned by scroll and drag. Made from Inex's own photo with Higgsfield image-to-3D. Falls back to the photo when WebGL is off.
4. Workshop collage: the crew, the folding machine, the building.
5. "Built in our workshop / Working in yours": a scroll-driven diagonal split.
6. Who we build for: seven sectors with a photo that follows the pointer (thumbnails on phones).
7. Kitchens handed over: a swipeable strip.
8. Process in four steps, plus the four ways to work with Inex.
9. Brief builder: tap what you need and it writes a WhatsApp message.
10. Visit: address, plus code, map.

Design system and motion rules are in `DESIGN.md`.

## Media and credits

- All photos are from Inex (the 71 the client sent, deduplicated to 48 used or kept).
- Higgsfield: background removal for the cut-outs and logo, plus image-to-3D for the burner table. About 30 credits.
- The 3D model was simplified to ~170k triangles and 4.4 MB with gltf-transform.
- Fonts: Geologica, Geist and Geist Mono from Google Fonts.

## Checked

- Desktop at 1440×900 and iPhone 13 size in Chromium: no horizontal overflow, no script errors. (One 403 showed up once in the test browser, most likely the Google Maps embed refusing a headless browser. It did not repeat.)
- The 3D only renders while something is moving, so it doesn't drain phone batteries.
- Reduced motion turns off the reveals, the split animation and the scroll-driven 3D turn.
- Not checked on a real phone. Worth opening it on an iPhone and an Android before sending it to Inex.
