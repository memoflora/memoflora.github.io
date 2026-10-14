(function () {
  var dialog = document.createElement("dialog");
  dialog.id = "lightbox";

  var track = document.createElement("div");
  track.className = "lightbox-track";
  dialog.appendChild(track);
  document.body.appendChild(dialog);

  var count = 0;
  var index = 0;

  function sourceOf(figure) {
    var img = figure.querySelector("img");
    var link = figure.querySelector("a");
    return {
      src: img.dataset.src || (link && link.href) || img.currentSrc || img.src,
      alt: img.alt,
    };
  }

  function current() {
    var slide = track.firstElementChild;
    if (!slide) return 0;
    return Math.round(track.scrollTop / slide.offsetHeight);
  }

  // Align the opened slide with the track by the slide's own position, not by
  // a computed height, so fractional heights cannot leave it off by a few pixels.
  function align() {
    var slide = track.children[index];
    if (slide) track.scrollTop = slide.offsetTop - track.offsetTop;
  }

  function ratioOf(figure, shown) {
    var flex = parseFloat(figure.style.flexGrow);
    if (flex > 0) return flex;
    if (shown.naturalWidth && shown.naturalHeight) {
      return shown.naturalWidth / shown.naturalHeight;
    }
    return 0;
  }

  // Size the image as large as the screen allows at its aspect ratio.
  function fit(img, ratio) {
    if (!ratio) return;
    img.style.aspectRatio = ratio;
    img.style.width = "min(92vw, calc(92vh * " + ratio + "))";
  }

  // Load full images for the current slide and its neighbors only. Loading
  // every image of a large set at once can stall a phone.
  function hydrate() {
    for (var i = index - 1; i <= index + 1; i++) {
      var slide = track.children[(i + count) % count];
      var img = slide && slide.firstChild;
      if (img && img.dataset.full) {
        // Use the real size once the full image is known.
        img.addEventListener("load", function () {
          if (this.naturalWidth && this.naturalHeight && !this.classList.contains("vector")) {
            fit(this, this.naturalWidth / this.naturalHeight);
          }
        }, { once: true });
        img.src = img.dataset.full;
        delete img.dataset.full;
      }
    }
  }

  // Wraps around at either end.
  function go(i) {
    index = (i + count) % count;
    align();
    hydrate();
  }

  function open(figure) {
    // Only images in a gallery (blog or /pics) can be browsed; others open alone.
    var gallery = figure.closest(".gallery, .justified-gallery");
    var figures = gallery
      ? Array.prototype.filter.call(
          gallery.querySelectorAll("figure"),
          function (f) { return f.querySelector("img"); }
        )
      : [figure];

    count = figures.length;
    index = figures.indexOf(figure);

    track.textContent = "";
    figures.forEach(function (f) {
      var item = sourceOf(f);
      var shown = f.querySelector("img");
      var slide = document.createElement("div");
      slide.className = "lightbox-slide";
      var img = document.createElement("img");
      img.alt = item.alt;
      img.classList.toggle("vector", /\.svg([?#]|$)/i.test(item.src));
      // Start with the small image already on the page. The full image loads
      // only when the slide is the current one or next to it.
      img.src = shown.currentSrc || shown.src;
      img.dataset.full = item.src;
      // Reserve the final size, as the small image may be much smaller. The
      // aspect ratio comes from the page layout (/pics sets it as the figure's
      // flex value) because a thumbnail that has not decoded has no size yet.
      if (!img.classList.contains("vector")) {
        fit(img, ratioOf(f, shown));
      }
      slide.appendChild(img);
      track.appendChild(slide);
    });

    dialog.showModal();
    go(index);
    hydrate();
    // Some mobile browsers have not finished laying out a just-opened dialog,
    // so the first jump can land in the wrong place. Repeat it on the next
    // frame, unless the user has already moved.
    var opened = index;
    requestAnimationFrame(function () {
      if (dialog.open && index === opened) align();
    });
  }

  // Rotating the phone or showing the address bar changes the slide height.
  window.addEventListener("resize", function () {
    if (dialog.open) align();
  });

  track.addEventListener("scroll", function () {
    index = current();
    hydrate();
  }, { passive: true });

  dialog.addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("close", function () {
    track.textContent = "";
  });

  dialog.addEventListener("keydown", function (e) {
    if (count < 2) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(current() - 1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(current() + 1);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!(e.target instanceof Element)) return;

    var figure = e.target.closest("main figure");
    if (!figure || !figure.querySelector("img")) return;

    e.preventDefault();
    open(figure);
  });
})();
