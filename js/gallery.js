/* factotum — gallery: render drawings masonry + lightbox (drawings & sculptures) */
(function () {
  "use strict";

  var data = window.GALLERY || { drawings: [], sculptures: [] };

  /* Flat list of everything the lightbox can step through, in DOM order. */
  var lightboxItems = [];
  var currentIndex = 0;

  /* ---------- Render drawings masonry ---------- */
  var masonry = document.getElementById("drawingsMasonry");
  if (masonry) {
    data.drawings.forEach(function (item) {
      var idx = lightboxItems.push(item) - 1;
      var tile = document.createElement("button");
      tile.className = "tile";
      tile.type = "button";
      tile.setAttribute("aria-label", "View drawing: " + item.title);
      tile.dataset.index = idx;
      tile.innerHTML =
        '<img src="' + item.src + '" alt="Drawing titled ' + item.title + '" loading="lazy" />' +
        '<span class="tile__cap">' +
          '<span class="title">' + item.title + "</span>" +
          '<span class="date">' + item.date + "</span>" +
        "</span>";
      masonry.appendChild(tile);
    });
  }

  /* ---------- Wire sculpture showcase images into the lightbox ---------- */
  var showcaseImgs = document.querySelectorAll("[data-lightbox-sculpture]");
  showcaseImgs.forEach(function (img) {
    var idx = lightboxItems.push({
      src: img.getAttribute("src"),
      title: img.dataset.title || "materia botanica",
      date: img.dataset.date || "2024"
    }) - 1;
    img.dataset.index = idx;
    img.style.cursor = "zoom-in";
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbTitle = lb.querySelector(".lightbox__cap .title");
    var lbDate = lb.querySelector(".lightbox__cap .date");

    function show(index) {
      currentIndex = (index + lightboxItems.length) % lightboxItems.length;
      var item = lightboxItems[currentIndex];
      lbImg.src = item.src;
      lbImg.alt = item.title;
      lbTitle.textContent = item.title;
      lbDate.textContent = item.date;
    }
    function open(index) {
      show(index);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }

    /* open from any tile or sculpture image (event delegation on document) */
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-index]");
      if (trigger) { open(parseInt(trigger.dataset.index, 10)); }
    });

    lb.querySelector(".lightbox__close").addEventListener("click", close);
    lb.querySelector(".lightbox__next").addEventListener("click", function () { show(currentIndex + 1); });
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { show(currentIndex - 1); });

    /* click backdrop to close */
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

    /* keyboard controls */
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(currentIndex + 1);
      else if (e.key === "ArrowLeft") show(currentIndex - 1);
    });
  }

  /* ---------- Section tabs (drawings / sculptures / textiles) ---------- */
  var tabs = document.querySelectorAll(".gallery-tabs button");
  var panels = document.querySelectorAll("[data-panel]");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
      tab.setAttribute("aria-selected", "true");
      var target = tab.dataset.target;
      panels.forEach(function (p) {
        p.hidden = p.dataset.panel !== target;
      });
    });
  });
})();
