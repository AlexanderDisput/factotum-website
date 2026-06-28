# factotum

Website for **factotum** — a DIY creative workshop space in Dublin offering hands-on
pottery painting, sewing and textile craft sessions, founded by visual artist Elena Buzzo.

> *A versatile approach to arts and crafts.*

## Tech stack

Plain static **HTML + CSS + vanilla JS** — no framework, no build step. Designed to be
hosted on **GitHub Pages**.

## Structure

```
index.html        # Home
workshops.html    # Workshops (pottery painting, sewing, textile crafts)
gallery.html      # Sculptures & drawings, with lightbox
about.html        # Elena's story & the factotum philosophy
contact.html      # Enquiry / booking form
css/styles.css    # Design system (tokens) + shared styles
js/               # main.js (nav/reveal), gallery.js (masonry + lightbox),
                  # data.js (gallery data), contact.js (form)
assets/images/    # Site imagery (drawings, sculptures, workshops, portrait)
```

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Notes

- The contact form is wired for [Formspree](https://formspree.io) — set the `action`
  on the form in `contact.html` to your endpoint to receive enquiries by email.
- Some content is placeholder pending real details (workshop pricing/timetable,
  studio address & opening hours).

— Built with care. 🎨
