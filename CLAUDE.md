# CLAUDE.md — factotum website

Guidance for working in this repo. Keep it current as the project evolves.

## What this is

Marketing site for **factotum**, a DIY creative workshop space in Dublin (pottery painting,
sewing, textile crafts) founded by visual artist **Elena Buzzo**. Primary goal: sell workshop
experiences and convert visitors into enquiries. Brand voice is calm, handmade, lowercase,
watercolour-and-ink — *"a versatile approach to arts and crafts."*

## Tech stack

Plain static **HTML + CSS + vanilla JS**. **No framework, no build step, no dependencies.**
Hosted on **GitHub Pages** (repo: `AlexanderDisput/factotum-website`). Just edit files and
open them; preview with any static server.

## Run / preview

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```
See the `preview` skill (`.claude/skills/preview`) for the standard serve-and-verify check.

## Layout

```
index.html                     Home
workshops.html                 Workshops hub (pottery / sewing / textile / groups / mobile)
pottery-painting-dublin.html   SEO landing page (flagship)
group-events-dublin.html       SEO landing page (hen / team building / we-come-to-you)
gallery.html                   Sculptures + drawings, tabbed, with lightbox
about.html                     Elena's story + philosophy
contact.html                   Enquiry form + map (NO background line here)
css/styles.css                 ALL styles — design tokens in :root, one file
js/main.js                     nav toggle, footer year, reveal-on-scroll, webp→jpeg fallback
js/artbg.js                    scroll-drawn background line + studio-photo parallax
js/gallery.js + js/data.js     gallery render + lightbox; data.js = image list/captions
js/contact.js                  form validation + Formspree submit
js/intro.js                    first-load watercolour intro (home only)
assets/images/                 .webp (used) + .jpeg (fallback), drawings/ sculptures/ workshops/
sitemap.xml, robots.txt        SEO
```

## Conventions

- **Design tokens** live in `:root` in `css/styles.css` (`--paper`, `--ink`, `--indigo`,
  washes `--green/--magenta/--sky/--clay`, fonts, spacing, `--paper-tints`). Use them; don't
  hardcode colours.
- **Headings are lowercase** (brand voice). Fonts: Quicksand (display) + Lora (body) via Google Fonts.
- Shared **header/nav + footer** are copied into every page (no includes). If you change one,
  change all. The footer carries the Google Maps widget + address.
- **Reveal-on-scroll:** add class `reveal` to an element; the IntersectionObserver in
  `main.js` adds `.in` when it enters view. CSS animates `.reveal` → `.reveal.in`.
- **Text knockout:** bare-on-paper text uses an invisible backing (`--paper` + `--paper-tints`,
  `background-attachment: fixed`) so the background line never crosses readable text. Add new
  bare text containers to that selector group in `styles.css`.
- **Images:** reference `.webp`; keep the matching `.jpeg` as fallback (auto-swapped by the
  `error` handler in `main.js`). `og:image` deliberately points at `.jpeg` for compatibility.
  Convert new images with Pillow (`quality=82, method=6`).
- **Reduced motion:** every animation (intro, line, parallax, card assemble) must honor
  `prefers-reduced-motion: reduce`. Follow the existing patterns.

## Signature features (where to look)

- **Background line** (`js/artbg.js`): one continuous SVG line that draws/un-draws with scroll,
  leads ~75% down the viewport, turns white over dark sections (`.quote-band`), stops above the
  footer. Deterministic (seeded). Studio-photo parallax shares its single rAF loop. **Not on
  contact.html** (script intentionally omitted there).
- **Home featured cards** (`index.html` + `.card--assemble` in CSS): hand-drawn SVG line
  illustrations that draw themselves in; children assemble in sequence (box → illustration →
  header → paragraph) on scroll, staggered across the three cards via `--cd`.
- **Intro** (`js/intro.js`): first-visit watercolour overlay brushed away to reveal a blurred→
  sharp page. Force replay with `?intro=1` or `#intro`.

## Known TODOs / gotchas

- **Placeholder domain:** canonical/OG/sitemap/JSON-LD use `https://factotum.example`
  (marked `TODO`). Find-and-replace with the real domain before launch.
- **Intro is in play-every-load test mode** (`index.html` head script, `if (!reduce)`).
  Restore first-visit-only by reverting to `force || (!seen && !reduce)`.
- **Contact form** posts to nothing yet — set the `<form action>` in `contact.html` to a
  Formspree endpoint. Runs in harmless demo mode until then.
- **GitHub Pages** not yet enabled; URLs are flat `.html` (folder/clean-URL migration is a
  later step tied to a custom domain).
- Workshop **pricing/timetable**, studio **hours**, and a sharper **Elena portrait** are
  placeholders pending real content.
- Image **filenames** aren't SEO-renamed yet (alt text is keyworded on landing pages).

## Git

Commit/push only when asked. Branch is `main`. End commit messages with the
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` trailer.
