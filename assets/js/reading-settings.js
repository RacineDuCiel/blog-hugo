/* ==========================================================================
 * Réglages de lecture — taille + police de la prose d'un article.
 * - Écrit --reading-font-scale / --reading-font-family sur <html>.
 * - Persiste dans localStorage (lu avant le paint par custom-head.html).
 * - Popover accessible : clavier, Échap, clic extérieur, focus géré.
 * IIFE sans dépendance ; ne fait rien si le widget est absent de la page.
 * ========================================================================== */
(function () {
  "use strict";

  var root = document.querySelector("[data-reading-settings]");
  if (!root) return;

  var toggle = root.querySelector(".reading-settings-toggle");
  var panel = root.querySelector(".reading-settings-panel");
  if (!toggle || !panel) return;

  var doc = document.documentElement;
  var store = window.localStorage;

  var KEY_SCALE = "reading-font-scale";
  var KEY_FAMILY = "reading-font-family";

  // Doivent refléter les stacks SCSS (typography.scss).
  var FONTS = {
    serif: "'Source Serif', Georgia, 'Times New Roman', serif",
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  var STEPS = [0.9, 1.0, 1.1, 1.25, 1.4];
  var DEFAULT_INDEX = 1; // 1.0

  // ── Helpers de stockage ───────────────────────────────────────────────────
  function read(key) {
    try { return store.getItem(key); } catch (e) { return null; }
  }
  function write(key, val) {
    try { store.setItem(key, val); } catch (e) {}
  }
  function remove(key) {
    try { store.removeItem(key); } catch (e) {}
  }

  // ── État taille ───────────────────────────────────────────────────────────
  var sizeValueEl = panel.querySelector("[data-rs-size-value]");
  var decBtn = panel.querySelector('[data-rs-size="dec"]');
  var incBtn = panel.querySelector('[data-rs-size="inc"]');

  function nearestIndex(scale) {
    var best = DEFAULT_INDEX, diff = Infinity;
    for (var i = 0; i < STEPS.length; i++) {
      var d = Math.abs(STEPS[i] - scale);
      if (d < diff) { diff = d; best = i; }
    }
    return best;
  }

  var sizeIndex = DEFAULT_INDEX;
  var savedScale = parseFloat(read(KEY_SCALE));
  if (!isNaN(savedScale)) sizeIndex = nearestIndex(savedScale);

  function applySize(persist) {
    var scale = STEPS[sizeIndex];
    doc.style.setProperty("--reading-font-scale", String(scale));
    if (sizeValueEl) {
      sizeValueEl.innerHTML = Math.round(scale * 100) + "&nbsp;%";
    }
    if (decBtn) decBtn.disabled = sizeIndex <= 0;
    if (incBtn) incBtn.disabled = sizeIndex >= STEPS.length - 1;
    if (persist) {
      if (sizeIndex === DEFAULT_INDEX) remove(KEY_SCALE);
      else write(KEY_SCALE, String(scale));
    }
  }

  function stepSize(delta) {
    var next = Math.min(STEPS.length - 1, Math.max(0, sizeIndex + delta));
    if (next === sizeIndex) return;
    sizeIndex = next;
    applySize(true);
  }

  if (decBtn) decBtn.addEventListener("click", function () { stepSize(-1); });
  if (incBtn) incBtn.addEventListener("click", function () { stepSize(1); });

  // ── État police ───────────────────────────────────────────────────────────
  var fontBtns = panel.querySelectorAll("[data-rs-font]");

  // Police naturelle de la page (sans réglage utilisateur) : les fiches CompTIA
  // sont en sans, les articles standards en serif.
  var naturalFont = document.body.classList.contains("fiche-revision") ? "sans" : "serif";

  function markFontActive(name) {
    for (var i = 0; i < fontBtns.length; i++) {
      var active = fontBtns[i].getAttribute("data-rs-font") === name;
      fontBtns[i].setAttribute("aria-checked", active ? "true" : "false");
      fontBtns[i].classList.toggle("is-active", active);
    }
  }

  function applyFont(name, persist) {
    doc.style.setProperty("--reading-font-family", FONTS[name]);
    markFontActive(name);
    if (persist) {
      if (name === naturalFont) {
        remove(KEY_FAMILY);
        doc.style.removeProperty("--reading-font-family");
      } else {
        write(KEY_FAMILY, FONTS[name]);
      }
    }
  }

  // Init police : si une valeur est mémorisée, marquer le bouton correspondant ;
  // sinon refléter la police naturelle SANS poser la variable.
  var savedFamily = read(KEY_FAMILY);
  if (savedFamily) {
    markFontActive(savedFamily.indexOf("Source Serif") !== -1 ? "serif" : "sans");
  } else {
    markFontActive(naturalFont);
  }

  for (var i = 0; i < fontBtns.length; i++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        applyFont(btn.getAttribute("data-rs-font"), true);
      });
    })(fontBtns[i]);
  }

  // ── Réinitialiser ─────────────────────────────────────────────────────────
  var resetBtn = panel.querySelector("[data-rs-reset]");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      sizeIndex = DEFAULT_INDEX;
      applySize(true);
      remove(KEY_FAMILY);
      doc.style.removeProperty("--reading-font-family");
      markFontActive(naturalFont);
    });
  }

  // ── Ouverture / fermeture du popover ──────────────────────────────────────
  var isOpen = false;

  function openPanel() {
    if (isOpen) return;
    isOpen = true;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    // requestAnimationFrame : laisse jouer la transition CSS ET diffère l'ajout
    // des écouteurs de fermeture après la propagation du clic d'ouverture (sinon
    // ce même clic, en remontant jusqu'à document, refermerait aussitôt le panel).
    requestAnimationFrame(function () {
      panel.classList.add("is-open");
      document.addEventListener("keydown", onKeydown, true);
      document.addEventListener("click", onOutsideClick, true);
    });
    var firstBtn = panel.querySelector(".rs-btn:not([disabled])");
    if (firstBtn) firstBtn.focus();
  }

  function closePanel(restoreFocus) {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onKeydown, true);
    document.removeEventListener("click", onOutsideClick, true);
    var hide = function () { panel.hidden = true; };
    // Laisse jouer la transition de fermeture si elle existe.
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hide();
    } else {
      window.setTimeout(hide, 160);
    }
    if (restoreFocus) toggle.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape" || e.key === "Esc") {
      e.preventDefault();
      closePanel(true);
    }
  }

  function onOutsideClick(e) {
    if (!root.contains(e.target)) closePanel(false);
  }

  toggle.addEventListener("click", function () {
    if (isOpen) closePanel(true); else openPanel();
  });

  // ── Application initiale de la taille (sans persister) ────────────────────
  applySize(false);
})();
