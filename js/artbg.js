/* factotum — scroll-drawn background line
   A single continuous, abstract ink line that criss-crosses down the full
   page, looping here and there. It draws itself as you scroll down and
   un-draws as you scroll up (stroke-dashoffset linked to scroll progress).
   Over dark sections (quote bands, footer) a synced WHITE copy of the same
   line is drawn behind the text, so the stroke turns white as it crosses
   them. Faint, non-interactive; static for reduced-motion users.           */
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Deterministic pseudo-random so the line is identical every load. */
  var SEED0 = 71113, seed = SEED0;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  /* ---- Background layer + main (charcoal) line ---- */
  var layer = document.createElement("div");
  layer.id = "artbg";
  layer.setAttribute("aria-hidden", "true");
  var svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("preserveAspectRatio", "none");
  var path = document.createElementNS(SVGNS, "path");
  svg.appendChild(path);
  layer.appendChild(svg);
  document.body.insertBefore(layer, document.body.firstChild);

  /* Dark sections (quote bands) intentionally show NO line — the main line is
     simply hidden behind their background, so no white overlay is created. */
  var overlays = [];

  /* ---- Build a criss-crossing "one-line" path for a given size ---- */
  function buildPath(w, h) {
    var cx = w * 0.5;
    var clampX = function (x) { return Math.max(w * 0.04, Math.min(w * 0.96, x)); };

    var bottom = h;
    var crossings = Math.max(8, Math.round(bottom / 340));  // sweeps across more often
    var steps = Math.max(18, Math.round(bottom / 95));

    // More frequent loops, scattered with a bit of randomness.
    var nLoops = Math.max(7, Math.round(bottom / 430));
    var loopAt = [];
    for (var li = 0; li < nLoops; li++) {
      loopAt.push((li + 0.5) / nLoops + (rnd() - 0.5) * 0.06);
    }

    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var y = t * bottom;
      // wide primary sweep + a big secondary wander + fine jitter → fills the page
      var amp = w * (0.4 + 0.08 * Math.sin(t * 4.3 + 0.5));
      var x = cx + Math.sin(t * Math.PI * crossings + 0.7) * amp
                 + Math.sin(t * 9.7 + rnd() * 1.4) * w * 0.13
                 + (rnd() - 0.5) * w * 0.05;
      pts.push([clampX(x), y]);

      // curl into a small loop, like a pen doubling back
      for (var L = 0; L < loopAt.length; L++) {
        if (i > 0 && i < steps && i === Math.round(steps * loopAt[L])) {
          var r = w * (0.05 + rnd() * 0.055);
          var dir = rnd() < 0.5 ? 1 : -1;
          for (var k = 1; k <= 6; k++) {
            var a = (k / 7) * Math.PI * 2 * dir - Math.PI / 2;
            pts.push([clampX(x + Math.cos(a) * r), y + Math.sin(a) * r + r * 1.2]);
          }
        }
      }
    }
    return smooth(pts);
  }

  /* Catmull-Rom → cubic bezier for one organic, smooth stroke. */
  function smooth(p) {
    if (p.length < 3) return "M" + p.map(function (q) { return q[0] + "," + q[1]; }).join(" L");
    var d = "M" + p[0][0].toFixed(1) + "," + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += "C" + c1x.toFixed(1) + "," + c1y.toFixed(1) + " " +
                 c2x.toFixed(1) + "," + c2y.toFixed(1) + " " +
                 p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d;
  }

  function docHeight() {
    layer.style.height = "0px";
    return Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      window.innerHeight
    );
  }

  var totalLen = 0, docH = 0, w = 0, lineBottom = 0;

  function docY(el) {
    var r = el.getBoundingClientRect();
    return { top: r.top + (window.pageYOffset || 0), height: r.height };
  }

  function rebuild() {
    // clientWidth (scrollbar excluded) matches the width the SVGs render into,
    // so the main line and the dark-section overlays share one coordinate space.
    w = document.documentElement.clientWidth;
    docH = docHeight();

    // The line ends at the top of the footer — it must not enter it.
    var footer = document.querySelector(".site-footer");
    lineBottom = footer ? Math.round(docY(footer).top) : docH;

    layer.style.height = docH + "px";
    svg.setAttribute("viewBox", "0 0 " + w + " " + docH);
    svg.setAttribute("width", w);
    svg.setAttribute("height", docH);

    seed = SEED0;                       // stable path across rebuilds
    var d = buildPath(w, lineBottom);
    path.setAttribute("d", d);
    totalLen = path.getTotalLength();
    path.style.strokeDasharray = totalLen;

    // Each dark overlay shows the SAME path, windowed to that section's exact
    // document position so the stroke lines up seamlessly at the edges.
    overlays.forEach(function (o) {
      var g = docY(o.el);
      var top = Math.round(g.top), hh = Math.round(g.height);
      o.svg.setAttribute("viewBox", "0 " + top + " " + w + " " + hh);
      o.svg.setAttribute("width", w);
      o.svg.setAttribute("height", hh);
      o.path.setAttribute("d", d);
      o.path.style.strokeDasharray = totalLen;
    });

    apply();
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function progress() {
    var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
    var vh = window.innerHeight;
    // The drawn tip leads the scroll: it accelerates from the top and settles
    // ~75% down the viewport, so the freshly drawn line is always well in view.
    var lead = easeOut(Math.min(sy / (vh * 0.6), 1)) * vh * 0.75;
    var tip = sy + lead;
    return lineBottom > 0 ? Math.min(Math.max(tip / lineBottom, 0), 1) : 1;
  }
  function apply() {
    var off = totalLen * (1 - (reduce ? 1 : progress()));
    path.style.strokeDashoffset = off;
    overlays.forEach(function (o) { o.path.style.strokeDashoffset = off; });
  }

  // Subtle parallax on studio photos. Driven from THIS script's single rAF so
  // it shares the line's scroll handler and never competes with it.
  var photos = Array.prototype.slice.call(document.querySelectorAll(".photo-card"));
  function applyParallax() {
    if (reduce || !photos.length) return;
    var vh = window.innerHeight;
    for (var i = 0; i < photos.length; i++) {
      var r = photos[i].getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;        // skip offscreen
      var delta = (r.top + r.height / 2 - vh / 2) / vh;          // ~ -0.5..0.5
      var shift = Math.max(-16, Math.min(16, -delta * 26));      // gentle, clamped
      photos[i].style.transform = "translate3d(0," + shift.toFixed(1) + "px, 0)";
    }
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () { apply(); applyParallax(); ticking = false; });
    }
  }

  rebuild();
  applyParallax();
  if (!reduce) window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", rebuild, { passive: true });
  window.addEventListener("load", rebuild);
})();
