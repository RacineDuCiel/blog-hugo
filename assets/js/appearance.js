// Run before CSS: retain existing theme and reading preferences without a flash.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var theme;
  try {
    theme = localStorage.getItem('theme');
    if (document.currentScript.hasAttribute('data-reader')) {
      var scale = Number(localStorage.getItem('reading-font-scale'));
      if (scale >= .6 && Number.isFinite(scale)) {
        root.style.setProperty('--reading-font-scale', Math.min(1.5, Math.round(scale * 20) / 20));
      }
      var width = Number(localStorage.getItem('reading-width-scale'));
      if (width >= .75 && width <= 1.15) {
        root.style.setProperty('--reading-width-scale', Math.round(width * 20) / 20);
      }

      var family = localStorage.getItem('reading-font-family') || '';
      // Older versions saved the full CSS font stack.
      if (family.includes('Source Serif')) family = 'serif';
      if (family.includes('Inter')) family = 'inter';
      if (['serif', 'inter', 'georgia', 'atkinson'].includes(family)) root.dataset.readingFont = family;

      var spacing = localStorage.getItem('reading-line-spacing');
      if (spacing === 'compact' || spacing === 'airy') root.dataset.readingSpacing = spacing;
    }
  } catch (_) {}
  if (theme === 'dark' || theme === 'light') root.classList.add(theme);
})();
