// Run before CSS: retain existing theme and reading preferences without a flash.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var theme;
  try {
    theme = localStorage.getItem('theme');
    var scale = Number(localStorage.getItem('reading-font-scale'));
    if (scale >= .9 && scale <= 1.4) root.style.setProperty('--reading-font-scale', scale);
    var family = localStorage.getItem('reading-font-family');
    if (family && /Source Serif|Inter/.test(family)) root.style.setProperty('--reading-font-family', family);
  } catch (_) {}
  if (theme === 'dark' || theme === 'light') root.classList.add(theme);
})();
