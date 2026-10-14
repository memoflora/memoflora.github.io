(function () {
  function button(label, text) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "gallery-" + label.toLowerCase();
    b.setAttribute("aria-label", label + " image");
    b.textContent = text;
    return b;
  }

  document.querySelectorAll("main .gallery").forEach(function (gallery) {
    var slides = gallery.querySelectorAll("figure");
    if (slides.length < 2) return;

    var track = document.createElement("div");
    track.className = "gallery-track";
    slides.forEach(function (s) { track.appendChild(s); });
    gallery.textContent = "";
    gallery.appendChild(track);

    var prev = button("Previous", "<");
    var next = button("Next", ">");
    var count = document.createElement("span");
    count.className = "gallery-count";
    var nav = document.createElement("div");
    nav.className = "gallery-nav";
    nav.append(prev, count, next);
    gallery.appendChild(nav);

    function current() {
      return Math.round(track.scrollLeft / track.clientWidth);
    }

    function update() {
      var i = current();
      count.textContent = i + 1 + " / " + slides.length;
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
    }

    function go(i) {
      track.scrollTo({ left: i * track.clientWidth, behavior: "instant" });
    }

    prev.addEventListener("click", function () { go(current() - 1); });
    next.addEventListener("click", function () { go(current() + 1); });
    track.addEventListener("scroll", update, { passive: true });
    update();
  });
})();
