(function () {
  var toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", function () {
    var next = document.body.getAttribute("a") === "inverted" ? "light" : "inverted";
    document.body.setAttribute("a", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });
})();
