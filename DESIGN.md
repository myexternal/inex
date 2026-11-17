# Daylight: the Inex Kitchen Solutions v4 design system

Daylight belongs to this site only. It shares no layout, palette or type with v1, v2, v3 ("Forge") or any other client site.

## Idea

A clean, daylit showroom for steel. The page is warm paper, the steel is the colour, and the only loud thing is the red you press. The single dark moment is the quote panel, so the flame has somewhere to glow.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F1EFEC` | Page background. The film frames are colour-matched to it so they float with no visible edge |
| `#FFFFFF` | white | Cards, the nav pill, the equipment sheet |
| `--ink` | `#131416` | Text and dark buttons |
| `--ink-2` / `--ink-3` | `#55585D` / `#85888D` | Body text, labels |
| `--steel` / `--steel-2` | `#E6E3DF` / `#CFCCC7` | Image wells, hairlines |
| `--red` | `#E01B22` | Actions only: Get a quote, Light it up, the "Not on the list?" tile, eyebrow dots |
| `--flame` | `#2E7BFF` | The lit burner only: quote eyebrow, reference number, glow |
| `--wa` | `#1FAF57` | WhatsApp buttons only |
| `--night` | `#0B0C0E` | The quote panel and the ignition screen |

Rule: red means "press this". It is never decoration.

## Type

- **Display:** Bricolage Grotesque, variable. Every headline is two voices of the same face: a **200** line and an **800** line (`.l` and `.b`). Tracking -0.045 to -0.05em, line height 0.92 to 0.96.
- **Text:** Hanken Grotesk 400 to 600.
- Sizes: hero `clamp(46px, 6.9vw, 128px)`, section headline `clamp(38px, 5.5vw, 94px)`, body 16 to 19px.
- Eyebrows: 12.5px, uppercase, 0.09em tracking, with a small square red dot.

## Space and shape

- Section gap `--sec: clamp(104px, 13.5vw, 216px)`. Related things sit 8 to 24px apart, unrelated things a full section apart.
- Radii 32, 24, 16. Buttons and chips are full pills.
- Photos sit in rounded wells. Captions sit on white tags inside the photo, never on a dark gradient.

## Layouts (one per section, none repeated)

1. **Hero:** one photo in an inset rounded frame, copy bottom-left on a paper fade, a small live workshop clip bottom-right.
2. **Statement:** one long sentence whose words darken as you read, then three facts under rules.
3. **Film:** pinned for 5.6 screens. The picture floats on the paper, then grows into a rounded window. A four-step bar sits under it.
4. **Kitchens:** bento grid of seven photo tiles and one red tile. Every tile opens the quote form with that kitchen ticked.
5. **Equipment:** a white sheet. One feature (360° turntable plus a spec list), then a rail of four units.
6. **Workshop:** five portrait clips, staggered up and down on desktop, a snap rail on phones.
7. **Process:** sticky headline on the left, five numbered steps on the right that darken as they pass.
8. **Quote:** dark rounded panel, burner on the left, form on the right.
9. **Visit:** contact list on the left, photo-and-coordinates card on the right.

## Motion

- One easing for entrances: `cubic-bezier(.23, 1, .32, 1)`. Reveals rise 20 to 28px once.
- Buttons press to `scale(.97)`. Hover effects exist only for a real mouse.
- The film and the turntable follow the hand directly: scroll position and drag distance, with a little inertia on release.
- The big moment is saved for the end: the ignition plays once, full screen, about 3.5 seconds, and can be skipped with a tap, Esc or Enter.
- Reduce Motion: no reveals, no autoplaying clips, the film still follows the scroll, the form goes straight to the lit panel.

## The CTA

Name: **Light it up.** Reward: **Flame on.** The visitor's last action lights the burner. It should feel like the kitchen has started, not like a form was sent.
