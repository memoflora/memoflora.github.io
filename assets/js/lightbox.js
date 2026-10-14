(function () {
  var dialog = document.createElement("dialog");
  dialog.id = "lightbox";

  var track = document.createElement("div");
  track.className = "lightbox-track";
  dialog.appendChild(track);
  document.body.appendChild(dialog);

  var touch = window.matchMedia("(pointer: coarse)");

  var figures = [];
  var index = 0;
  // On touch devices every image is a slide in a scrollable vertical stack.
  // Elsewhere one image shows at a time and the arrow keys switch it.
  var stacked = false;

  function sourceOf(figure) {
    var img = figure.querySelector("img");
    var link = figure.querySelector("a");
    return {
      src: img.dataset.src || (link && link.href) || img.currentSrc || img.src,
      alt: img.alt,
    };
  }

  function makeSlide(figure, eager) {
    var item = sourceOf(figure);
    var slide = document.createElement("div");
    slide.className = "lightbox-slide";
    var img = document.createElement("img");
    img.alt = item.alt;
    img.loading = eager ? "eager" : "lazy";
    img.classList.toggle("vector", /\.svg([?#]|$)/i.test(item.src));
    img.src = item.src;
    slide.appendChild(img);
    return slide;
  }

  function current() {
    return Math.round(track.scrollTop / track.clientHeight);
  }

  // Wraps around at either end.
  function go(i) {
    index = (i + figures.length) % figures.length;
    if (stacked) {
      track.scrollTo({ top: index * track.clientHeight, behavior: "instant" });
    } else {
      track.textContent = "";
      track.appendChild(makeSlide(figures[index], true));
    }
  }

  function open(figure) {
    // Only images in a gallery (blog or /pics) can be browsed; others open alone.
    var gallery = figure.closest(".gallery, .justified-gallery");
    figures = gallery
      ? Array.prototype.filter.call(
          gallery.querySelectorAll("figure"),
          function (f) { return f.querySelector("img"); }
        )
      : [figure];
    index = figures.indexOf(figure);
    stacked = touch.matches && figures.length > 1;

    track.textContent = "";
    dialog.classList.toggle("stacked", stacked);
    if (stacked) {
      figures.forEach(function (f, i) {
        track.appendChild(makeSlide(f, i === index));
      });
    } else {
      track.appendChild(makeSlide(figure, true));
    }

    dialog.showModal();
    if (stacked) go(index);
  }

  track.addEventListener("scroll", function () {
    if (stacked) index = current();
  }, { passive: true });

  dialog.addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("close", function () {
    track.textContent = "";
  });

  dialog.addEventListener("keydown", function (e) {
    if (figures.length < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
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
