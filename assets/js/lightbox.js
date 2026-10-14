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
    return Math.round(track.scrollLeft / track.clientWidth);
  }

  // Wraps around at either end.
  function go(i) {
    index = (i + count) % count;
    track.scrollTo({ left: index * track.clientWidth, behavior: "instant" });
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
    figures.forEach(function (f, i) {
      var item = sourceOf(f);
      var slide = document.createElement("div");
      slide.className = "lightbox-slide";
      var img = document.createElement("img");
      img.alt = item.alt;
      img.loading = i === index ? "eager" : "lazy";
      img.classList.toggle("vector", /\.svg([?#]|$)/i.test(item.src));
      img.src = item.src;
      slide.appendChild(img);
      track.appendChild(slide);
    });

    dialog.showModal();
    go(index);
  }

  track.addEventListener("scroll", function () {
    index = current();
  }, { passive: true });

  // Like a story: tap the left 25% for the previous image and the right 25%
  // for the next one. The middle closes the preview. A single image closes on
  // any tap.
  var EDGE = 0.25;
  dialog.addEventListener("click", function (e) {
    var x = e.clientX / window.innerWidth;
    if (count < 2 || (x >= EDGE && x <= 1 - EDGE)) {
      dialog.close();
    } else {
      go(current() + (x < EDGE ? -1 : 1));
    }
  });

  dialog.addEventListener("close", function () {
    track.textContent = "";
  });

  dialog.addEventListener("keydown", function (e) {
    if (count < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(current() - 1);
    } else if (e.key === "ArrowRight") {
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
