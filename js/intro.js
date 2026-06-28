/* factotum — first-visit watercolour intro
   Paints an opaque watercolour layer over the home page, then "brushes" it
   away with an animated brush stroke (the visitor can also drag to paint it
   away). First visit only; the early <head> script decides whether to show
   it (class "intro-pending"). Safe to run when there's nothing to do.        */
(function () {
  "use strict";

  var root = document.documentElement;
  var intro = document.getElementById("intro");

  // Nothing to do: not first visit / reduced-motion / overlay absent.
  if (!intro || !root.classList.contains("intro-pending")) return;

  var canvas = document.getElementById("introCanvas");
  var content = intro.querySelector(".intro__content");
  var hint = intro.querySelector(".intro__hint");
  var skipBtn = intro.querySelector(".intro__skip");
  var ctx = canvas.getContext("2d");

  // Brand watercolour palette (matches CSS tokens).
  var PAPER = "#f4f1ea";
  var WASHES = ["#8bbe4f", "#e0568a", "#5fa8d8", "#2e4fa3", "#c9b79c", "#e0568a", "#8bbe4f"];

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = window.innerWidth;
  var h = window.innerHeight;
  var done = false;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.scale(dpr, dpr);

  /* ---- Deterministic pseudo-random (no Math.random dependency for layout) ---- */
  var seed = 20240628;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  /* ---- Paint the opaque watercolour layer ---- */
  function paintWatercolour() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    // Whisper-soft colour blooms — kept very faint to match the subtle
    // tints of the homepage paper background.
    ctx.globalCompositeOperation = "multiply";
    var blooms = 11;
    for (var i = 0; i < blooms; i++) {
      var x = rnd() * w;
      var y = rnd() * h;
      var r = (0.3 + rnd() * 0.3) * Math.max(w, h);
      var col = WASHES[i % WASHES.length];
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexToRgba(col, 0.22));
      g.addColorStop(0.5, hexToRgba(col, 0.09));
      g.addColorStop(1, hexToRgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Papyrus-like paper grain so the layer matches the textured card.
    ctx.globalCompositeOperation = "source-over";
    var grain = makeGrain();
    if (grain) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = grain;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }

  /* ---- Build a tiling paper-grain pattern (light & dark specks) ---- */
  function makeGrain() {
    try {
      var size = 160;
      var n = document.createElement("canvas");
      n.width = size; n.height = size;
      var nc = n.getContext("2d");
      var img = nc.createImageData(size, size);
      var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = rnd() < 0.5 ? 90 : 235;     // mix dark + light flecks
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = Math.floor(rnd() * 40);  // very low alpha → subtle tooth
      }
      nc.putImageData(img, 0, 0);
      return ctx.createPattern(n, "repeat");
    } catch (e) { return null; }
  }

  function hexToRgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }

  /* ---- Brush eraser: soft, slightly bristly stamp (reveals page beneath) ---- */
  function erase(x, y, r) {
    ctx.globalCompositeOperation = "destination-out";
    stampDot(x, y, r, 1);
    // a few offset dabs for a painted, textured edge
    for (var i = 0; i < 4; i++) {
      var a = rnd() * Math.PI * 2;
      var d = rnd() * r * 0.7;
      stampDot(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.35 + rnd() * 0.4), 0.8);
    }
    ctx.globalCompositeOperation = "source-over";
  }
  function stampDot(x, y, r, strength) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(0,0,0," + strength + ")");
    g.addColorStop(0.6, "rgba(0,0,0," + strength * 0.55 + ")");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---- Build the auto brush-stroke path (a few sweeping passes) ---- */
  function buildPath() {
    var pts = [];
    var rows = [0.26, 0.5, 0.74];
    var samples = 44;
    for (var p = 0; p < rows.length; p++) {
      for (var i = 0; i <= samples; i++) {
        var f = i / samples;
        var x = p % 2 === 0 ? f * w : (1 - f) * w;
        var y = rows[p] * h + Math.sin(f * Math.PI * 2) * (h * 0.045);
        pts.push([x, y]);
      }
    }
    return pts;
  }

  /* ---- Finish: fade out, unlock scroll, remember, clean up ---- */
  function finish() {
    if (done) return;
    done = true;
    clearTimeout(window.__introFailsafe);
    try { localStorage.setItem("factotum:intro:v1", "1"); } catch (e) {}
    if (content) content.style.opacity = "0";
    if (hint) hint.style.opacity = "0";
    intro.classList.add("fade-out");
    // Sharpen the website from blurred → crisp in sync with the overlay fade,
    // so it feels like one switch rather than revealing a crisp page early.
    root.classList.add("intro-clearing");
    canvas.removeEventListener("pointerdown", onPointer);
    canvas.removeEventListener("pointermove", onPointer);
    window.setTimeout(function () {
      root.classList.remove("intro-pending");
      root.classList.remove("intro-clearing");
      if (intro.parentNode) intro.parentNode.removeChild(intro);
    }, 820);
  }

  /* ---- Let the visitor paint it away too ---- */
  var painting = false;
  function onPointer(e) {
    if (e.type === "pointerdown") painting = true;
    if (e.type === "pointermove" && !(painting || e.pressure > 0 || e.buttons)) return;
    var rect = canvas.getBoundingClientRect();
    erase(e.clientX - rect.left, e.clientY - rect.top, Math.max(w, h) * 0.06);
  }
  canvas.addEventListener("pointerdown", onPointer);
  canvas.addEventListener("pointermove", onPointer);
  window.addEventListener("pointerup", function () { painting = false; });
  skipBtn.addEventListener("click", finish);

  /* ---- Run ---- */
  paintWatercolour();

  var path = buildPath();
  var brushR = Math.max(w, h) * 0.11;
  var DURATION = 4400;   // brush sweep
  var START_DELAY = 750; // let the quote breathe first
  var startTime = null;
  var lastIdx = 0;

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function frame(now) {
    if (done) return;
    if (startTime === null) startTime = now;
    var t = Math.min((now - startTime) / DURATION, 1);
    var target = Math.floor(easeInOut(t) * (path.length - 1));
    for (var i = lastIdx; i <= target; i++) erase(path[i][0], path[i][1], brushR);
    lastIdx = target;

    // Fade the quote out over the back half of the sweep.
    if (content) {
      var qf = (t - 0.4) / 0.45;
      content.style.opacity = String(Math.max(0, Math.min(1, 1 - qf)));
    }
    if (t >= 1) { finish(); return; }
    requestAnimationFrame(frame);
  }

  window.setTimeout(function () {
    if (!done) requestAnimationFrame(frame);
  }, START_DELAY);
})();
