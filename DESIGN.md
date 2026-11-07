# Inex Kitchen Solutions: design system "Sheet and Seam"

This system belongs to Inex only. It shares no skeleton, fonts or palette with Hewad Market (Apple-style scroll film), Flavours of Asia (packed boxes, condensed sign type), Nupelda (Unbounded, pizza wheel) or Ceylon Tampere CC (Mona Sans width extremes, gold lion).

## Idea
Inex cuts, folds and welds stainless steel. The page is built the same way: flat sheets of colour, hard chamfered corners instead of rounded ones, and one red diagonal seam taken from the X in their logo. Hierarchy reads like a fabrication drawing: a light line that says what it is, a heavy line that says what it does.

## Type
- **Geologica** (display). Two settings only: weight 160 for the light line, weight 860 with sharpness (SHRP) 100 for the heavy line. The sharp axis cuts the terminals like sheared steel. Headings always pair the two: light phrase on top, heavy phrase below.
- **Geist** (body and UI), 400 and 500.
- **Geist Mono**, only for labels that behave like stamped part markings (zone numbers, coordinates). Never as decorative eyebrows.

## Colour
| Token | Hex | Use |
| --- | --- | --- |
| ink | #0d0e10 | dark sections, text on light |
| ink-2 | #17191c | panels on dark |
| steel-0 | #f3f4f5 | light sections |
| steel-1 | #e6e8eb | plates, rules |
| steel-2 | #c9cdd2 | borders |
| steel-3 | #8f969e | secondary text on dark |
| steel-4 | #5a6067 | secondary text on light |
| red | #d6141c | the seam, primary action, active state |
| red-deep | #9e0c12 | pressed state, gradients |

The brushed steel gradient from the logo (#2b2d31 → #b9bdc2 → #4a4e54) is used only on product plates and the footer wordmark.

## Shape
- Corners are chamfered (clip-path, 12px cut), never rounded.
- The red seam is a parallelogram skewed -38°, the same angle as the logo's X.
- Photos are cut with a diagonal edge where they meet text.

## Layout grammar (each section a different structure)
1. Hero: split, type on ink, installed kitchen photo with a diagonal cut edge.
2. Zones: a five-stop rail (Store, Prep, Cook, Wash, Serve) that swaps a cut-out product plate.
3. Made to fit: pinned 3D burner table that turns with scroll, steps on the left.
4. Workshop: broken editorial collage.
5. Floor to floor: full-bleed diagonal split that moves with scroll.
6. Who we build for: a type wall with a photo that follows the pointer.
7. Installed work: native horizontal scroll-snap strip.
8. Process: four stops on a seam line.
9. Brief: a WhatsApp message builder.
10. Visit: map, address, building photo.

## Motion
Crisp and mechanical. UI 160 to 240ms on cubic-bezier(.23,1,.32,1). Reveals wipe in with clip-path from the left, like a cut being made (600ms). Press feedback scale(.97). Hover only behind (hover:hover) and (pointer:fine). Reduced motion keeps fades and drops movement and the 3D turn.
