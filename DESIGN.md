# Inex v3 · "Forge" design system

v3 replaces v2 ("Work Order") and v1 ("Sheet and Seam"). It shares no layout, type or components with them or with any other client site.

## Idea

The site is dark and cinematic: the workshop seen at night under one red light. Inex's own phone videos are colour graded dark (more contrast, less saturation, cool shadows, warm highlights, a vignette) and run full screen. Bone-coloured sections cut between the dark ones so the page has a rhythm. Every headline pairs a hairline light word with a heavy black word, and a red block slides in behind the one word that matters.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--char` | #0F1012 | Base. Hero, kitchens, process, equipment, crew, order, footer |
| `--char-2/3` | #17181B / #222327 | Cards, placeholders |
| `--bone` | #EFEDE7 | Light sections: statement, "Made in Unawatuna", handed over, visit |
| `--red` | #E01B22 | Inex red. Highlight blocks, CTAs, step numbers, the stamp, the "Approved" screen |
| `--wa` | #1FAF57 | WhatsApp send button only |

## Type

- **Big Shoulders Display**, always in capitals. Weight 200 for the light line and 900 for the bold line. On bone, the light line is ink at 40%. On dark, it's bone at 60%.
- **Inter Tight** for body text. **IBM Plex Mono** for labels, indexes and the plate engraving.
- Inputs are at least 16 px so iPhones don't zoom.

## Layout: a different structure in every section

1. **Hero.** A full-screen film in four chapters (crew, cut, fold, build) with progress tabs. Each new clip wipes in from the right. As you scroll, the film shrinks into a rounded card.
2. **Statement** (bone). Two-tone capitals with small looping videos set inline in the text, and three count-up facts.
3. **Kitchens.** Six vertical photo strips that expand on hover or tap. On phones they become an accordion.
4. **Process.** Pinned full screen for five screens of scrolling. Each step's clip wipes up over the last one, with a giant outlined step number, the step title and a 5-point timeline.
5. **Made in Unawatuna** (bone). The video plays through the letters, and the words zoom into place as they arrive.
6. **Equipment.** Stacked sticky cards. Each card sinks and darkens as the next one slides over it. The four-burner range is a 3D model you can turn.
7. **Handed over** (bone). A sticky heading next to three photo columns that move at different speeds.
8. **Crew.** Full-screen video with a big quote, plus a floating portrait clip.
9. **Order.** The nameplate engraves as you type. When you stamp it, the whole screen turns red, "APPROVED" slams in with sparks, then the plate gets stamped and the WhatsApp button pulses.
10. **Visit** (bone) and a footer with the INEX wordmark filled with video.

## Motion

- Easing: `--ease-out` cubic-bezier(.23,1,.32,1) for entrances and `--ease-io` for wipes. Press feedback is a scale to 0.97 in 160 ms.
- Lines rise out of masks, the hero headline rises letter by letter, and the red highlight bars sweep in after the text.
- Smooth wheel scrolling (Lenis) is on desktop mice only. Touch scrolling stays native.
- Hover effects only apply on devices that can hover. Magnetic buttons are desktop only.
- Reduced motion turns off the intro, reveals, wipes, card stacking, parallax and the full-screen "Approved" moment, and shows the stamped plate directly.

## v3.1: the film

- Pinned for 5.6 screens (5.2 on phones). Canvas frames on bone `#EFEDE7`, feathered into the page until the frame opens into a rounded window (28px, 18px on phones) on the finished kitchen; a sharp still replaces the last frame.
- Heading in the section's own style: kicker `(02) How it's made`, "It starts as" in Big Shoulders 300 at 40% ink beside "flat steel." in 900. A mono "Scroll to build it" hint on wide screens.
- Caption: a char card (22px radius) with four 2px progress bars filling in red, step number in red mono, step name in Big Shoulders 900, text in Inter Tight at 60% bone. The nav and the phone dock step aside while the film is pinned.
