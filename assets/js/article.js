(function () {
  "use strict";
  var article = document.querySelector("[data-article]");
  if (!article) return;

  var root = document.documentElement;
  var url = article.dataset.articleUrl;
  var title = article.dataset.articleTitle;
  var category = article.dataset.articleCategory;
  var progressBar = document.querySelector("[data-reading-progress] span");
  var bookmarkButton = document.querySelector("[data-bookmark]");
  var resumeButton = document.querySelector("[data-resume-reading]");
  var backToTop = document.querySelector("[data-back-to-top]");
  var recentKey = "rdc:recent:v1";
  var libraryKey = "rdc:library:v1";
  var readingKey = "rdc:reading:v1";
  var lastSaved = 0;

  function readJSON(key, fallback) {
    try { var value = JSON.parse(localStorage.getItem(key)); return value || fallback; } catch (error) { return fallback; }
  }
  function writeJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {} }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function percentRead() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max <= 0 ? 100 : clamp(Math.round((window.scrollY / max) * 100), 0, 100);
  }

  function recentRecord() {
    var items = readJSON(recentKey, []);
    var current = items.find(function (item) { return item.url === url; });
    return current || null;
  }
  function saveRecent(force) {
    var now = Date.now();
    if (!force && now - lastSaved < 1500) return;
    lastSaved = now;
    var progress = percentRead();
    var items = readJSON(recentKey, []).filter(function (item) { return item.url !== url; });
    items.unshift({ url: url, title: title, category: category, progress: progress, viewedAt: new Date().toISOString() });
    writeJSON(recentKey, items.slice(0, 50));
    window.dispatchEvent(new CustomEvent("rdc:library-change"));
  }

  function syncBookmark() {
    if (!bookmarkButton) return;
    var saved = readJSON(libraryKey, []).some(function (item) { return item.url === url; });
    bookmarkButton.classList.toggle("is-active", saved);
    bookmarkButton.setAttribute("aria-pressed", saved ? "true" : "false");
    bookmarkButton.textContent = saved ? "Enregistré" : "Enregistrer";
  }
  if (bookmarkButton) bookmarkButton.addEventListener("click", function () {
    var items = readJSON(libraryKey, []);
    var saved = items.some(function (item) { return item.url === url; });
    items = items.filter(function (item) { return item.url !== url; });
    if (!saved) items.unshift({ url: url, title: title, category: category, savedAt: new Date().toISOString() });
    writeJSON(libraryKey, items.slice(0, 50));
    syncBookmark();
    window.dispatchEvent(new CustomEvent("rdc:library-change"));
  });

  var shareButton = document.querySelector("[data-share]");
  if (shareButton) shareButton.addEventListener("click", function () {
    var share = { title: title, url: window.location.href };
    if (navigator.share) navigator.share(share).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).then(function () {
      var previous = shareButton.textContent;
      shareButton.textContent = "Lien copié";
      window.setTimeout(function () { shareButton.textContent = previous; }, 1600);
    });
    else window.prompt("Copiez ce lien :", window.location.href);
  });

  var reading = readJSON(readingKey, { version: 1, font: "serif", scale: 1, width: "standard" });
  var scales = [0.9, 1, 1.1, 1.25, 1.4];
  function applyReading() {
    if (scales.indexOf(reading.scale) === -1) reading.scale = 1;
    root.style.setProperty("--reading-scale", reading.scale);
    root.dataset.readingFont = reading.font === "sans" ? "sans" : "serif";
    root.dataset.readingWidth = reading.width === "wide" ? "wide" : "standard";
    var output = document.querySelector("[data-reading-size-output]");
    if (output) output.textContent = Math.round(reading.scale * 100) + " %";
    document.querySelectorAll("[data-reading-font] button").forEach(function (button) { button.classList.toggle("is-active", button.dataset.value === reading.font); button.setAttribute("aria-pressed", button.dataset.value === reading.font ? "true" : "false"); });
    document.querySelectorAll("[data-reading-width] button").forEach(function (button) { button.classList.toggle("is-active", button.dataset.value === reading.width); button.setAttribute("aria-pressed", button.dataset.value === reading.width ? "true" : "false"); });
    writeJSON(readingKey, reading);
  }
  document.querySelectorAll("[data-reading-size]").forEach(function (button) { button.addEventListener("click", function () { var index = scales.indexOf(reading.scale); index = clamp(index + (button.dataset.readingSize === "increase" ? 1 : -1), 0, scales.length - 1); reading.scale = scales[index]; applyReading(); }); });
  document.querySelectorAll("[data-reading-font] button").forEach(function (button) { button.addEventListener("click", function () { reading.font = button.dataset.value; applyReading(); }); });
  document.querySelectorAll("[data-reading-width] button").forEach(function (button) { button.addEventListener("click", function () { reading.width = button.dataset.value; applyReading(); }); });
  var readingReset = document.querySelector("[data-reading-reset]");
  if (readingReset) readingReset.addEventListener("click", function () { reading = { version: 1, font: "serif", scale: 1, width: "standard" }; applyReading(); });
  var readingToggle = document.querySelector("[data-reading-toggle]");
  var readingPanel = document.querySelector("[data-reading-panel]");
  if (readingToggle && readingPanel) readingToggle.addEventListener("click", function () { var open = readingPanel.hidden; readingPanel.hidden = !open; readingToggle.setAttribute("aria-expanded", open ? "true" : "false"); });

  var previous = recentRecord();
  if (previous && previous.progress >= 10 && previous.progress <= 90 && resumeButton) {
    resumeButton.hidden = false;
    resumeButton.textContent = "Reprendre à " + previous.progress + " %";
    resumeButton.addEventListener("click", function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * previous.progress / 100, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      resumeButton.hidden = true;
    });
  }

  function onScroll() {
    var progress = percentRead();
    if (progressBar) progressBar.style.width = progress + "%";
    if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 900);
    saveRecent(false);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", function () { saveRecent(true); });
  if (backToTop) backToTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });

  var tocLinks = Array.from(document.querySelectorAll(".article-toc a, [data-mobile-toc] a"));
  var headings = tocLinks.map(function (link) { try { return document.querySelector(decodeURI(link.hash)); } catch (error) { return null; } }).filter(Boolean);
  function syncTOC() {
    var active = headings[0];
    headings.forEach(function (heading) { if (heading.getBoundingClientRect().top <= 150) active = heading; });
    tocLinks.forEach(function (link) { var selected = active && decodeURI(link.hash) === "#" + active.id; link.classList.toggle("is-active", selected); if (selected) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
  }
  window.addEventListener("scroll", syncTOC, { passive: true });

  var tocSheet = document.querySelector("[data-mobile-toc]");
  var tocBackdrop = document.querySelector("[data-toc-backdrop]");
  var tocOpen = document.querySelector("[data-toc-open]");
  var tocClose = document.querySelector("[data-toc-close]");
  function setToc(open) {
    if (!tocSheet) return;
    tocSheet.hidden = !open;
    if (tocBackdrop) tocBackdrop.hidden = !open;
    if (tocOpen) tocOpen.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("sheet-open", open);
    if (open && tocClose) tocClose.focus(); else if (!open && tocOpen) tocOpen.focus();
  }
  if (tocOpen) tocOpen.addEventListener("click", function () { setToc(true); });
  if (tocClose) tocClose.addEventListener("click", function () { setToc(false); });
  if (tocBackdrop) tocBackdrop.addEventListener("click", function () { setToc(false); });
  tocLinks.forEach(function (link) { link.addEventListener("click", function () { setToc(false); }); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") { setToc(false); if (readingPanel && !readingPanel.hidden) { readingPanel.hidden = true; readingToggle.setAttribute("aria-expanded", "false"); } } });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Tab" || !tocSheet || tocSheet.hidden) return;
    var focusables = Array.from(tocSheet.querySelectorAll("a, button"));
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.querySelectorAll("pre").forEach(function (pre) {
    if (pre.parentElement && pre.parentElement.classList.contains("code-frame")) return;
    var frame = document.createElement("div"); frame.className = "code-frame"; pre.parentNode.insertBefore(frame, pre); frame.appendChild(pre);
    var button = document.createElement("button"); button.type = "button"; button.className = "code-copy"; button.textContent = "Copier"; frame.appendChild(button);
    button.addEventListener("click", function () { var code = pre.querySelector("code") || pre; if (navigator.clipboard) navigator.clipboard.writeText(code.textContent).then(function () { button.textContent = "Copié"; window.setTimeout(function () { button.textContent = "Copier"; }, 1400); }); });
  });

  syncBookmark(); applyReading(); onScroll(); syncTOC(); saveRecent(true);
})();
