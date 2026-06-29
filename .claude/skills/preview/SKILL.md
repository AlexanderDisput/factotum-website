---
name: preview
description: Serve the factotum static site locally and verify every page, asset, and internal link loads. Use when previewing the site, after editing pages/CSS/JS, or before committing.
---

# Preview & verify the factotum site

This project is plain static HTML/CSS/JS (no build step), so "preview" means serving the
folder and confirming nothing is broken. Run these checks from the repo root.

## 1. Serve locally

Start a background static server on a free port and give it a moment:

```bash
python3 -m http.server 8800 >/tmp/factotum-preview.log 2>&1 &
sleep 2
```

Tell the user to open **http://localhost:8800** in their browser. Stop the server when done:
`pkill -f "http.server 8800"`.

## 2. Every page returns 200

```bash
for p in "" workshops.html gallery.html about.html contact.html \
         pottery-painting-dublin.html group-events-dublin.html \
         sitemap.xml robots.txt; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8800/$p)  /$p"
done
```

## 3. Referenced images exist on disk (no 404s)

```bash
grep -rho 'assets/images/[^"'"'"' )]*\.webp' *.html js/data.js | sort -u \
  | while read -r p; do [ -f "$p" ] || echo "MISSING $p"; done
echo "(no MISSING lines = good)"
```

## 4. Internal page links resolve

```bash
grep -rhoE 'href="[a-z-]+\.html"' *.html | sed 's/href="//;s/"//' | sort -u \
  | while read -r f; do [ -f "$f" ] || echo "BROKEN -> $f"; done
echo "(no BROKEN lines = good)"
```

## 5. Manual checks to mention to the user

- **Background line** (`js/artbg.js`): draws in as you scroll, leads ~75% down the viewport,
  turns white over the dark quote band, stops above the footer, and is **absent on Contact**.
- **Home featured cards**: assemble in sequence (box → illustration draws in → header →
  paragraph) and stagger left→right as they enter view.
- **Intro**: force a replay at `http://localhost:8800/?intro=1`.
- **Reduced motion**: with OS "reduce motion" on, animations should be skipped (static).
- **Readability**: the line never crosses text; knockouts blend with the page background.

## Notes

- No linter/test suite — these curl + grep checks are the verification.
- If JS is edited, also open the page and check the browser console for errors.
- Don't hardcode colours; tokens live in `:root` in `css/styles.css` (see CLAUDE.md).
