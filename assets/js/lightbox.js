(function () {
  var dialog = document.createElement("dialog");
  dialog.id = "lightbox";

  var image = document.createElement("img");
  dialog.appendChild(image);
  document.body.appendChild(dialog);

  var figures = [];
  var index = 0;

  function sourceOf(figure) {
    var img = figure.querySelector("img");
    var link = figure.querySelector("a");
    return {
      src: img.dataset.src || (link && link.href) || img.currentSrc || img.src,
      alt: img.alt,
    };
  }

  function show(i) {
    index = (i + figures.length) % figures.length;
    var item = sourceOf(figures[index]);
    image.classList.toggle("vector", /\.svg([?#]|$)/i.test(item.src));
    image.src = item.src;
    image.alt = item.alt;
  }

  function open(figure) {
    figures = Array.prototype.filter.call(
      document.querySelectorAll("main figure"),
      function (f) { return f.querySelector("img"); }
    );
    show(figures.indexOf(figure));
    dialog.showModal();
  }

  dialog.addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("close", function () {
    image.removeAttribute("src");
  });

  dialog.addEventListener("keydown", function (e) {
    if (figures.length < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      show(index + 1);
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
