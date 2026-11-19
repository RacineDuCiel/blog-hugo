(function () {
  'use strict';
  var menu = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  function closeMenu() {
    nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false');
    menu.querySelector('span').textContent = '+';
  }
  if (menu && nav) {
    menu.hidden = false;
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
      menu.querySelector('span').textContent = open ? '−' : '+';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });
    matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
  }
  var mode = document.getElementById('mode');
  var root = document.documentElement;
  var system = matchMedia('(prefers-color-scheme: dark)');
  var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function isDark() { return root.classList.contains('dark') || (!root.classList.contains('light') && system.matches); }
  function update() {
    var dark = isDark();
    mode.setAttribute('aria-label', dark ? 'Activer le thème clair' : 'Activer le thème sombre');
    document.querySelector('meta[name="theme-color"]').content = dark ? '#191a19' : '#fafaf8';
  }
  function changeTheme() {
    var theme = isDark() ? 'light' : 'dark';
    root.classList.remove('light', 'dark'); root.classList.add(theme);
    try { localStorage.setItem('theme', theme); } catch (_) {}
    update();
  }
  function finishThemeTransition() {
    root.classList.remove('theme-transition');
  }
  if (mode) {
    mode.hidden = false; update(); system.addEventListener('change', update);
    mode.addEventListener('click', function () {
      if (root.classList.contains('theme-transition')) return;
      if (!document.startViewTransition || reducedMotion.matches) {
        changeTheme();
        return;
      }
      root.classList.add('theme-transition');
      document.startViewTransition(changeTheme).finished.then(finishThemeTransition, finishThemeTransition);
    });
  }
  // Keyboard users can scroll wide tables and code blocks independently.
  document.querySelectorAll('.prose:not(#article-content) table, .prose:not(#article-content) pre').forEach(function (el) {
    el.tabIndex = 0;
    if (el.tagName === 'PRE') el.setAttribute('role', 'region');
    el.setAttribute('aria-label', el.tagName === 'TABLE' ? 'Tableau, défilement horizontal si nécessaire' : 'Extrait de code');
  });
})();
