# SpotWave Frontend Design Guide

This file is the source of truth for SpotWave frontend visuals. Follow it for every screen unless the user explicitly approves a different direction.

## Visual Direction

SpotWave uses a premium editorial/product style inspired by dark magazine layouts: black graphite surfaces, warm orange-red imagery, oversized typography, tight cards, and bold first-screen composition.

The UI should feel like the provided reference: clean, high-contrast, image-led, confident, and minimal. Avoid generic SaaS dashboards, blue/purple gradients, and default HeroUI/NextUI-looking screens.

The current approved direction is stricter than the first draft: lean harder into black and orange, reduce decorative UI, and prefer simpler hero compositions over multi-panel dashboards unless the screen truly needs application chrome.

## Core Palette

Use near-black colors, not pure `#000000`.

- Page background: `#080A0F`
- Deep graphite: `#0B0E15`
- Card surface: `#10131A`
- Elevated card: `#151922`
- Border subtle: `rgba(255,255,255,0.08)`
- Border strong: `rgba(255,255,255,0.14)`
- Primary text: `#F7F7F4`
- Secondary text: `rgba(247,247,244,0.68)`
- Muted text: `rgba(247,247,244,0.46)`
- Brand orange: `#FF6A00`
- Hot orange: `#FF4F12`
- Warm highlight: `#FFB15A`

Do not use bright blue, violet, or default purple accents. If a cold tint is needed, use gray-navy/slate only: `#151A24`, `#1A202B`, `rgba(120,130,150,0.14)`.

## Backgrounds

Use layered near-black backgrounds:

- Base should be graphite/black navy: `#080A0F` to `#0B0E15`.
- Add very subtle orange glow from one side or bottom only when it improves the composition.
- Add subtle gray-slate glow if depth is needed.
- Never use a visible blue gradient as a dominant area.
- Avoid flat single-color backgrounds unless the screen is intentionally minimal.
- For key auth and landing screens, prefer black plus one or two controlled orange shapes over many overlapping effects.

Recommended background recipe:

```css
background:
  radial-gradient(circle at 12% 12%, rgba(255, 109, 20, 0.16), transparent 29%),
  radial-gradient(circle at 82% 10%, rgba(104, 116, 136, 0.14), transparent 31%),
  radial-gradient(circle at 50% 88%, rgba(20, 24, 34, 0.72), transparent 48%),
  linear-gradient(165deg, #080a0f, #0b0e15 48%, #070910 100%);
```

## Typography

Typography should be large, direct, and editorial.

- Preferred font: `Manrope`.
- Fallback: `Inter`, sans-serif.
- Hero headings: very large, tight tracking, heavy weight.
- Use clean display sizing and tight tracking for primary headlines.
- Use negative tracking for display text: `-0.04em` to `-0.06em`.
- Body copy should be readable but muted, usually `text-white/60` to `text-white/72`.
- Labels and pills use uppercase or compact semibold text with letter spacing.

Avoid thin headings, default browser sizing, and generic centered marketing typography.

## Layout System

Use bold, simple layouts:

- Large first viewport with one dominant headline and one strong interactive/product block.
- Prefer split layouts for auth/onboarding/landing screens.
- Use strong alignment, wide gutters, and intentional whitespace.
- Content should feel spacious, but not empty.
- Avoid nested cards unless there is a clear hierarchy.
- On mobile, collapse to one strong vertical card/list composition.

Desktop max widths should usually sit between `1280px` and `1500px`.

For auth screens specifically:

- Prefer one strong hero message on the left and one compact form card on the right.
- Remove app chrome that is not directly needed for login.
- Avoid stacking extra stats, sidebars, top bars, or secondary modules that make the screen too tall.
- If the page starts feeling vertically stretched, remove blocks before shrinking typography.

## Cards And Panels

Cards should feel like black editorial tiles, not default component-library cards.

- Radius: `24px` to `34px` for major cards.
- Background: `#10131A`, `#111722`, or gradient from `rgba(18,23,34,.92)` to `rgba(9,12,19,.96)`.
- Border: `1px solid rgba(255,255,255,.08-.14)`.
- Shadow: soft black shadow, no blue glow.
- Inner media blocks can use orange/red gradients or real warm images.
- Brand/logo blocks must sit on a dedicated dark surface when placed near orange fields or gradients.

Never place the SpotWave wordmark directly on top of a bright orange glow or ribbon without a dark container behind it.

Example panel:

```tsx
<Card className="rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(18,23,34,.92),rgba(9,12,19,.96))] shadow-[0_38px_120px_rgba(0,0,0,.48)]" />
```

## Imagery And Accent Style

The reference uses vivid orange-red photography and warm blocks. SpotWave should use that same energy:

- Use warm orange/red imagery or CSS media placeholders.
- Event cards can use orange gradient thumbnails.
- Keep imagery cropped with strong radius.
- Orange should be the only loud color.
- Use warm glows sparingly around primary interactive points.
- Avoid layered glow-on-glow compositions that reduce contrast or readability.

Avoid stock-looking blue maps, purple blobs, or multicolor gradients.

## Buttons

Primary buttons are orange, wide, and confident.

- Primary fill can be either solid `#FF6A00` or a restrained orange gradient when the screen needs it.
- Text: white, bold/black.
- Radius: `16px` to `22px`.
- Height: `52px` to `64px`.
- Shadow should be minimal or absent on cleaner black/orange layouts.

Secondary actions should be dark graphite with a subtle border. Links use `#FF6A00` or `#FF7514`.

## Inputs And Forms

Form controls must match the dark graphite system:

- Background: `rgba(255,255,255,0.035)` or `#151922`.
- Border: `rgba(255,255,255,0.10-.14)`.
- Focus border: orange `#FF7A1A`.
- Placeholder: `rgba(255,255,255,0.32)`.
- Icons: muted white/slate, not blue.
- Label: semibold, white with 60-75% opacity.

Do not use default white inputs, blue focus rings, or unstyled HeroUI defaults.

## HeroUI Usage

HeroUI components are allowed, but must be visually overridden to match this guide.

- Use HeroUI for structure/accessibility where useful.
- Do not accept default HeroUI visual styling if it conflicts with this guide.
- Current installed HeroUI is v3. Use the real v3 API and verify with Docker build.
- Do not add `HeroUIProvider` unless the installed package actually exports it.
- For custom visual variants, prefer wrapper components under `apps/frontend/src/shared/ui`.

## Motion

Use restrained motion:

- Subtle load-in fade/slide for major panels.
- Small hover lift for cards and primary buttons.
- Gentle glow/radar pulse where it supports SpotWave location/event metaphor.
- Respect reduced motion.

No excessive spring animations, bouncing icons, generic micro-motion everywhere, or constant glowing surfaces.

## Mobile Rules

Mobile must look intentionally designed, not just stacked desktop.

- One primary panel per screen.
- Large readable heading, but avoid horizontal clipping.
- Keep touch targets at least `44px` high.
- Preserve dark graphite surfaces and orange CTA.
- Hide complex desktop illustrations when they make the mobile screen cramped.

## Design Anti-Patterns

Do not use:

- Pure black `#000000` as the main background.
- Dominant blue/purple gradients.
- Default Tailwind/Next/HeroUI look.
- White cards on dark background.
- Generic SaaS bento grids.
- Tiny low-contrast text.
- Random colored badges.
- Overly glossy neon cyberpunk effects.
- Unnecessary decorative pills above every heading.

## Implementation Checklist

Before finishing a frontend screen:

1. Background uses graphite near-black, not pure black and not blue.
2. Orange is the dominant accent color.
3. Brand/logo remains readable and does not overlap with orange glow fields.
4. Typography is large, bold, and tight where appropriate.
5. Cards and controls use custom dark surfaces, borders, and restrained shadows.
6. HeroUI defaults are overridden to match this guide.
7. Desktop and mobile screenshots are checked.
8. Docker build passes for the frontend.
9. No unnecessary files or dead UI wrappers were added.

## Current Auth Screen Reference

The `/sign-in` screen establishes the current SpotWave direction:

- Mostly black canvas with controlled orange shapes.
- Large white/orange Russian headline on the left.
- Compact dark auth card on the right.
- No sidebar, no top utility bar, no stats strip under the form.
- Minimal glow, stronger contrast, cleaner black/orange hierarchy.

Future frontend screens should feel like they belong to the same product family.
