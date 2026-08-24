(function () {
  "use strict";
  var root = document.documentElement;
  try {
    var appearance = localStorage.getItem("rdc:appearance") || "auto";
    var palette = localStorage.getItem("rdc:palette") || "cobalt";
    if (!/^(auto|light|dark)$/.test(appearance)) appearance = "auto";
    if (!/^(cobalt|carmin)$/.test(palette)) palette = "cobalt";
    root.dataset.appearance = appearance;
    root.dataset.palette = palette;
  } catch (error) {
    root.dataset.appearance = "auto";
    root.dataset.palette = "cobalt";
  }
})();
