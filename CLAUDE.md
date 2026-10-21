# Portfolio Website — CLAUDE.md

## Project Overview
Personal portfolio website for Chirayu Ahuja, a Computer Science student at UBC Okanagan. Single-page, no build tools, no frameworks — pure HTML, CSS, and vanilla JavaScript.

## File Structure
```
index.html        — all page markup (single file)
style.css         — all styles including responsive breakpoints
script.js         — reveal system, nav, cursor, design-work data, hamburger, contact form
images/           — LogoImage.png, profile.png (both unreferenced — no logo image or photo in current design)
fonts/            — GondensDemo (OTF), RetroFloral (OTF/TTF)
inspo/            — design inspiration images
```

## Design System

Editorial, light, typography-led — inspired by dzinrstudio.com's pacing/hierarchy, not its branding.

**Color palette**
- Background: `#f2efe9` (warm off-white), alt/card bg `#eae4d8`
- Ink (text): `#141414`, soft `#5c5a54`, muted `#8a8781`
- Accent/gold: `#ad8f66` — used sparingly (numbers, underlines, one hover state), never as a background
- Hairlines: `rgba(20,20,20,.12)` / strong `rgba(20,20,20,.4)`
- All defined as CSS custom properties on `:root` in `style.css`

**Typography**
- Display headings: `Bebas Neue` (Google Fonts) — scaled with `clamp()`, hero goes up to ~9.5rem
- Serif editorial accents: `Playfair Display` (Google Fonts) — used for the hero greeting, about lead line, contact email
- Body/UI: `Roboto` (Google Fonts)
- Decorative (unused in main layout): `GondensDemo`, `RetroFloral` (local OTF)

**Icons:** Font Awesome 6.5 via CDN (footer/contact links only — no tech-icon grid anymore)

## Page Sections (in order)
1. **Hero** (`#home`) — no photo. Huge stacked type ("Software / Developer / & Designer"), staggered line-reveal on load, scroll cue. Text/motion *is* the visual identity.
2. **Marquee** — CSS-only infinite horizontal strip, paused under reduced-motion
3. **About** (`#about`) — editorial lead statement + condensed bio + 3-column typographic skills list (Development/Design/Creative), hover dims siblings
4. **Services** (`#services`) — 4 numbered `<details>` items ("What I Do"), native expand-on-click
5. **Statement** — centered "Code + Design = Experience" typographic break
6. **Work** (`#work`) — 3 real software projects as large numbered editorial blocks with a placeholder visual (`.work-visual`) swappable for a real screenshot later
7. **Design Work** (`#design`) — rendered from the `designWork` array in `script.js`; add an object to add a project, first item renders large
8. **Experience** (`#experience`) — same `<details>` pattern as Services, 1 entry (The Phoenix News)
9. **Contact** (`#contact`) — big statement + prominent email, mailto form kept but visually secondary
10. **Footer** — identity + icon links + back-to-top

## Responsive Breakpoints
- `≤ 1200px` — work items collapse to a single column
- `≤ 992px` — skills grid goes 2-col, design gallery goes 1-col, contact grid goes single-column
- `≤ 768px` — hamburger nav replaces link row, section padding/font reductions, scroll cue hidden
- `≤ 480px` — smallest font/padding sizes

## JavaScript Behaviour
- **Reveal system:** one shared `IntersectionObserver` watches every `.reveal` element (added to section headers, cards, etc.) and adds `.in-view` at 15% threshold — do not create a second observer for new sections, just add the `.reveal` class
- **Nav:** scroll listener toggles `.scrolled` on `#site-header`; a second observer (`rootMargin: "-45% 0px -45% 0px"`) tracks which `[data-nav]` section is centered and toggles `.active` on the matching nav link
- **Hamburger menu:** toggles `.open` on `#hamburger`/`#nav-links`, closes on outside click or nav link click
- **Design Work:** rendered client-side from the `designWork` array at the top of `script.js` — this is the one place content and rendering are separated; everything else is static HTML
- **Contact form:** `submit` opens a `mailto:` link pre-filled with name/email/message (no backend)

## Key Conventions
- No build step — edit `index.html`, `style.css`, `script.js` directly and open in browser
- No frameworks/dependencies beyond Font Awesome (CDN) and Google Fonts — CSS/IntersectionObserver/rAF cover every effect in use; don't add GSAP or a smooth-scroll library unless a specific effect genuinely can't be done without one
- CSS is a single file; add new section styles in order after the existing section they belong to
- Responsive styles live at the bottom of `style.css` in four `@media` blocks (plus one `prefers-reduced-motion` block above them) — add new responsive overrides inside the existing blocks, not as new blocks
- All section containers cap at `max-width: 1180px` via `.section-container`, centered
- `.section-header` (eyebrow + Bebas title) is the shared section header pattern — reuse it for any new section
- The `<details>/<summary>` pattern (Services, Experience) is the standard expand-on-click component — prefer it over custom JS toggle state for any similar list
- Any new non-trivial animation should register with the existing `.reveal` observer or the existing cursor/`data-cursor` mechanism rather than adding a new observer or event listener

## Contact
- Email: chirayu.ahuja3108@gmail.com
- LinkedIn: linkedin.com/in/chirayu-ahuja-532078275
- GitHub: github.com/Chirayu3108
