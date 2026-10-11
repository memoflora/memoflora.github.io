(function () {
  var toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  var dark = window.matchMedia("(prefers-color-scheme: dark)");

  function current() {
    var a = document.body.getAttribute("a");
    if (a === "dark" || a === "light") return a;
    return dark.matches ? "dark" : "light";
  }

  toggle.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    document.body.setAttribute("a", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });
})();
