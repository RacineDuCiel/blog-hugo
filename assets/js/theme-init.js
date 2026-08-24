(function () {
  "use strict";
  var root = document.documentElement;
  try {
    var appearance = localStorage.getItem("rdc:appearance") || "auto";
    var palette = localStorage.getItem("rdc:palette") || "carmin";
    if (!/^(auto|light|dark)$/.test(appearance)) appearance = "auto";
    if (!/^(carmin|graphite)$/.test(palette)) palette = "carmin";
    root.dataset.appearance = appearance;
    root.dataset.palette = palette;
    if (localStorage.getItem("rdc:palette") !== palette) localStorage.setItem("rdc:palette", palette);
  } catch (error) {
    root.dataset.appearance = "auto";
    root.dataset.palette = "carmin";
  }
  var dark = root.dataset.appearance === "dark" || (root.dataset.appearance === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var graphite = root.dataset.palette === "graphite";
  var themeMeta = document.querySelector("[data-theme-color]");
  if (themeMeta) themeMeta.setAttribute("content", dark ? (graphite ? "#151515" : "#101218") : (graphite ? "#F1F1EF" : "#F6F1E8"));
})();
