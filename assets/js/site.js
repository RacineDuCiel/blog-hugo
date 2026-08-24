(function () {
  "use strict";
  var root = document.documentElement;
  var header = document.querySelector("[data-site-header]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var menuLabel = document.querySelector("[data-menu-label]");
  var nav = document.querySelector("[data-site-nav]");
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var themePanel = document.querySelector("[data-theme-panel]");

  function setStored(key, value) { try { localStorage.setItem(key, value); } catch (error) {} }
  function syncThemeButtons() {
    document.querySelectorAll("[data-theme-group]").forEach(function (group) {
      var key = group.dataset.themeGroup;
      var active = key === "appearance" ? root.dataset.appearance : root.dataset.palette;
      group.querySelectorAll("[data-theme-value]").forEach(function (button) {
        var selected = button.dataset.themeValue === active;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    });
    var dark = root.dataset.appearance === "dark" || (root.dataset.appearance === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var themeMeta = document.querySelector("[data-theme-color]");
    if (themeMeta) {
      var graphite = root.dataset.palette === "graphite";
      themeMeta.setAttribute("content", dark ? (graphite ? "#151515" : "#101218") : (graphite ? "#F1F1EF" : "#F6F1E8"));
    }
  }
  document.querySelectorAll("[data-theme-value]").forEach(function (button) {
    button.addEventListener("click", function () {
      var group = button.closest("[data-theme-group]").dataset.themeGroup;
      var value = button.dataset.themeValue;
      root.dataset[group] = value;
      setStored("rdc:" + group, value);
      syncThemeButtons();
    });
  });
  function closeThemePanel() {
    if (!themePanel || themePanel.hidden) return;
    themePanel.hidden = true;
    themeToggle.setAttribute("aria-expanded", "false");
  }
  if (themeToggle && themePanel) themeToggle.addEventListener("click", function () {
    var open = themePanel.hidden;
    themePanel.hidden = !open;
    themeToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) themePanel.querySelector("button").focus();
  });
  function closeMenu(returnFocus) {
    var wasOpen = document.body.classList.contains("nav-open");
    document.body.classList.remove("nav-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    if (menuLabel) menuLabel.textContent = "Ouvrir le menu";
    if (wasOpen && returnFocus && menuToggle) menuToggle.focus();
  }
  if (menuToggle && nav) menuToggle.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (menuLabel) menuLabel.textContent = open ? "Fermer le menu" : "Ouvrir le menu";
    if (open) window.setTimeout(function () { var first = nav.querySelector("a, button"); if (first) first.focus(); }, 0);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      var themeWasOpen = themePanel && !themePanel.hidden;
      closeThemePanel();
      closeMenu(true);
      if (themeWasOpen && themeToggle) themeToggle.focus();
    }
    if (event.key === "Tab" && document.body.classList.contains("nav-open") && window.matchMedia("(max-width: 960px)").matches) {
      var focusables = [menuToggle, themeToggle].concat(Array.from(nav.querySelectorAll("a, button"))).filter(Boolean);
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener("click", function (event) {
    if (themePanel && !themePanel.hidden && !event.target.closest("[data-theme-control]")) closeThemePanel();
  });

  var searchDataPromise;
  function loadSearchData() {
    if (!searchDataPromise) searchDataPromise = fetch("/index.json", { credentials: "same-origin" }).then(function (response) {
      if (!response.ok) throw new Error("Index indisponible");
      return response.json();
    });
    return searchDataPromise;
  }
  function normalize(value) {
    return (value || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }
  function createSearchResult(item) {
    var article = document.createElement("article");
    article.className = "search-result";
    var kicker = document.createElement("p");
    kicker.className = "story-kicker";
    kicker.textContent = item.categoryLabel + " · " + item.formatLabel;
    var heading = document.createElement("h3");
    var link = document.createElement("a");
    link.href = item.url; link.textContent = item.title; heading.appendChild(link);
    var description = document.createElement("p");
    description.textContent = item.description;
    var meta = document.createElement("small");
    meta.textContent = item.date.split("-").reverse().join(".") + " · " + item.readingTime + " min";
    article.appendChild(kicker); article.appendChild(heading); article.appendChild(description); article.appendChild(meta);
    return article;
  }
  function initSearch(searchRoot) {
    var input = searchRoot.querySelector("[data-search-input]");
    var results = searchRoot.querySelector("[data-search-results]");
    var status = searchRoot.querySelector("[data-search-status]");
    var categoryWrap = searchRoot.querySelector("[data-search-categories]");
    var formatSelect = searchRoot.querySelector("[data-search-format]");
    var tagSelect = searchRoot.querySelector("[data-search-tag]");
    var activeCategory = "all";
    var data;
    var loading = false;
    function render(data) {
      var query = normalize(input.value);
      var format = formatSelect.value;
      var tag = normalize(tagSelect.value);
      var filtered = data.filter(function (item) {
        if (activeCategory !== "all" && item.category !== activeCategory) return false;
        if (format !== "all" && item.format !== format) return false;
        if (tag !== "all" && !(item.tags || []).some(function (value) { return normalize(value) === tag; })) return false;
        if (!query) return activeCategory !== "all" || format !== "all" || tag !== "all";
        return normalize([item.title, item.description, item.body, (item.tags || []).join(" "), item.series].join(" ")).indexOf(query) !== -1;
      }).map(function (item) {
        var score = 0;
        if (query) {
          if (normalize(item.title).indexOf(query) !== -1) score += 5;
          if (normalize(item.description).indexOf(query) !== -1) score += 3;
          if (normalize((item.tags || []).join(" ")).indexOf(query) !== -1) score += 4;
          if (normalize(item.body).indexOf(query) !== -1) score += 1;
        }
        return { item: item, score: score };
      }).sort(function (a, b) { return b.score - a.score || b.item.date.localeCompare(a.item.date); }).slice(0, 20);
      results.replaceChildren();
      if (!query && activeCategory === "all" && format === "all" && tag === "all") { status.textContent = "Commencez à écrire pour rechercher, ou utilisez les filtres."; return; }
      status.textContent = filtered.length + " résultat" + (filtered.length > 1 ? "s" : "");
      filtered.forEach(function (entry) { results.appendChild(createSearchResult(entry.item)); });
      if (!filtered.length) { var empty = document.createElement("p"); empty.className = "search-empty"; empty.textContent = "Aucun texte ne correspond à cette recherche."; results.appendChild(empty); }
    }
    function startSearch() {
      if (loading) return;
      loading = true;
      status.textContent = "Chargement de l’index…";
      loadSearchData().then(function (loaded) {
      data = loaded;
      var tags = [];
      data.forEach(function (item) { (item.tags || []).forEach(function (tag) { if (tags.indexOf(tag) === -1) tags.push(tag); }); });
      tags.sort(function (a, b) { return a.localeCompare(b, "fr", { sensitivity: "base" }); }).forEach(function (tag) { var option = document.createElement("option"); option.value = tag; option.textContent = tag; tagSelect.appendChild(option); });
      render(data);
      }).catch(function () { status.textContent = "La recherche est momentanément indisponible. Utilisez les univers ou les archives."; });
    }
    input.addEventListener("focus", startSearch, { once: true });
    input.addEventListener("input", function () { startSearch(); if (data) render(data); });
    formatSelect.addEventListener("change", function () { startSearch(); if (data) render(data); });
    tagSelect.addEventListener("change", function () { startSearch(); if (data) render(data); });
    categoryWrap.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-value]"); if (!button) return;
      activeCategory = button.dataset.value;
      categoryWrap.querySelectorAll("button").forEach(function (item) { item.classList.toggle("is-active", item === button); item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
      startSearch(); if (data) render(data);
    });
  }
  document.querySelectorAll("[data-search-root]").forEach(initSearch);

  var searchDialog = document.querySelector("[data-search-dialog]");
  var standaloneSearch = document.querySelector(".search-page [data-search-input]");
  function openSearch(event) {
    if (event) event.preventDefault();
    closeThemePanel();
    closeMenu(false);
    if (searchDialog && typeof searchDialog.showModal === "function") { searchDialog.showModal(); window.setTimeout(function () { searchDialog.querySelector("[data-search-input]").focus(); }, 0); }
    else if (standaloneSearch) standaloneSearch.focus();
    else window.location.assign("/search/");
  }
  document.querySelectorAll("[data-search-open]").forEach(function (button) { button.addEventListener("click", openSearch); });
  document.addEventListener("keydown", function (event) { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); } });

  var storageAvailable = true;
  function readJSON(key) {
    try {
      var value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value.slice(0, 50) : [];
    } catch (error) { storageAvailable = false; return []; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (error) { storageAvailable = false; return false; }
  }
  function removeStored(key) {
    try { localStorage.removeItem(key); return true; }
    catch (error) { storageAvailable = false; return false; }
  }
  var notice = document.querySelector("[data-site-notice]");
  var noticeTimer;
  function showNotice(message) {
    if (!notice || !message) return;
    window.clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.hidden = false;
    noticeTimer = window.setTimeout(function () { notice.hidden = true; }, 2600);
  }
  window.addEventListener("rdc:notice", function (event) { showNotice(event.detail); });

  var libraryDialog = document.querySelector("[data-library-dialog]");
  var libraryTab = "saved";
  var clearPending = false;
  var clearTimer;
  function libraryKey() { return libraryTab === "saved" ? "rdc:library:v1" : "rdc:recent:v1"; }
  function resetClearButton() {
    if (!libraryDialog) return;
    clearPending = false;
    window.clearTimeout(clearTimer);
    var button = libraryDialog.querySelector("[data-library-clear]");
    button.dataset.confirming = "false";
    button.textContent = libraryTab === "saved" ? "Effacer les textes enregistrés" : "Effacer l’historique";
  }
  function syncLibraryCounts() {
    var saved = readJSON("rdc:library:v1");
    var recent = readJSON("rdc:recent:v1");
    document.querySelectorAll("[data-library-count]").forEach(function (count) {
      count.textContent = saved.length;
      count.hidden = saved.length === 0;
    });
    document.querySelectorAll("[data-library-open]").forEach(function (button) {
      button.setAttribute("aria-label", saved.length ? "Ouvrir la bibliothèque, " + saved.length + " texte" + (saved.length > 1 ? "s" : "") + " enregistré" + (saved.length > 1 ? "s" : "") : "Ouvrir la bibliothèque");
    });
    document.querySelectorAll("[data-library-tab-count='saved']").forEach(function (count) { count.textContent = saved.length; });
    document.querySelectorAll("[data-library-tab-count='recent']").forEach(function (count) { count.textContent = recent.length; });
    return { saved: saved, recent: recent };
  }
  function createEmptyLibrary() {
    var empty = document.createElement("div");
    empty.className = "library-empty";
    var heading = document.createElement("h3");
    var description = document.createElement("p");
    if (!storageAvailable) {
      heading.textContent = "Bibliothèque indisponible";
      description.textContent = "Le stockage local est désactivé dans ce navigateur. La lecture du site reste entièrement disponible.";
    } else if (libraryTab === "saved") {
      heading.textContent = "Aucun texte enregistré";
      description.textContent = "Dans un article, utilisez « Ajouter à la bibliothèque » pour le retrouver ici.";
    } else {
      heading.textContent = "Aucun historique pour le moment";
      description.textContent = "Les articles que vous ouvrez apparaissent automatiquement ici, avec votre progression de lecture.";
    }
    empty.appendChild(heading);
    empty.appendChild(description);
    if (storageAvailable) {
      var link = document.createElement("a");
      link.className = "text-link";
      link.href = "/categories/";
      link.textContent = "Explorer les textes →";
      empty.appendChild(link);
    }
    return empty;
  }
  function createLibraryItem(item) {
    var row = document.createElement("article");
    row.className = "library-item";
    var link = document.createElement("a");
    link.className = "library-item__link";
    link.href = item.url;
    var label = document.createElement("small");
    label.textContent = item.category || "RacineDuCiel";
    var strong = document.createElement("strong");
    strong.textContent = item.title;
    link.appendChild(label);
    link.appendChild(strong);
    if (typeof item.progress === "number") {
      var progress = document.createElement("span");
      progress.textContent = item.progress + " % lu";
      link.appendChild(progress);
    }
    var remove = document.createElement("button");
    remove.className = "library-remove";
    remove.type = "button";
    remove.dataset.libraryRemove = item.url;
    remove.textContent = "Retirer";
    remove.setAttribute("aria-label", "Retirer « " + item.title + " » " + (libraryTab === "saved" ? "des textes enregistrés" : "de l’historique"));
    row.appendChild(link);
    row.appendChild(remove);
    return row;
  }
  function renderLibrary() {
    if (!libraryDialog) return;
    var list = libraryDialog.querySelector("[data-library-list]");
    var collections = syncLibraryCounts();
    var items = libraryTab === "saved" ? collections.saved : collections.recent;
    var clear = libraryDialog.querySelector("[data-library-clear]");
    list.replaceChildren();
    clear.hidden = !storageAvailable || items.length === 0;
    if (!items.length) { list.appendChild(createEmptyLibrary()); return; }
    items.forEach(function (item) { list.appendChild(createLibraryItem(item)); });
  }
  document.querySelectorAll("[data-library-open]").forEach(function (button) { button.addEventListener("click", function () { if (!libraryDialog) return; document.body.classList.remove("nav-open"); if (menuToggle) menuToggle.setAttribute("aria-expanded", "false"); renderLibrary(); libraryDialog.showModal(); }); });
  if (libraryDialog) {
    libraryDialog.querySelectorAll("[data-library-tab]").forEach(function (button) { button.addEventListener("click", function () { libraryTab = button.dataset.libraryTab; libraryDialog.querySelectorAll("[data-library-tab]").forEach(function (tab) { var active = tab === button; tab.setAttribute("aria-selected", active ? "true" : "false"); }); resetClearButton(); renderLibrary(); }); });
    libraryDialog.querySelector("[data-library-list]").addEventListener("click", function (event) {
      var button = event.target.closest("[data-library-remove]");
      if (!button) return;
      var items = readJSON(libraryKey()).filter(function (item) { return item.url !== button.dataset.libraryRemove; });
      if (writeJSON(libraryKey(), items)) showNotice(libraryTab === "saved" ? "Texte retiré de votre bibliothèque." : "Texte retiré de votre historique.");
      resetClearButton();
      renderLibrary();
      window.dispatchEvent(new CustomEvent("rdc:library-change"));
    });
    libraryDialog.querySelector("[data-library-clear]").addEventListener("click", function () {
      var button = this;
      if (!clearPending) {
        clearPending = true;
        button.dataset.confirming = "true";
        button.textContent = "Confirmer l’effacement";
        clearTimer = window.setTimeout(resetClearButton, 5000);
        return;
      }
      if (removeStored(libraryKey())) showNotice(libraryTab === "saved" ? "Bibliothèque vidée." : "Historique effacé.");
      resetClearButton();
      renderLibrary();
      window.dispatchEvent(new CustomEvent("rdc:library-change"));
    });
    libraryDialog.addEventListener("close", resetClearButton);
  }
  window.addEventListener("rdc:library-change", renderLibrary);
  renderLibrary();
  document.querySelectorAll("[data-dialog-close]").forEach(function (button) { button.addEventListener("click", function () { button.closest("dialog").close(); }); });
  document.querySelectorAll("dialog").forEach(function (dialog) { dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); }); });

  document.querySelectorAll("[data-archive-filter]").forEach(function (button) { button.addEventListener("click", function () {
    var value = button.dataset.archiveFilter;
    document.querySelectorAll("[data-archive-filter]").forEach(function (item) { item.classList.toggle("is-active", item === button); item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
    document.querySelectorAll("[data-archive-item]").forEach(function (item) { item.hidden = value !== "all" && item.dataset.archiveItem !== value; });
    document.querySelectorAll(".archive-year").forEach(function (year) { year.hidden = !year.querySelector("[data-archive-item]:not([hidden])"); });
  }); });

  function onScroll() { if (header) header.classList.toggle("is-compact", window.scrollY > 32); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  syncThemeButtons();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { if (root.dataset.appearance === "auto") syncThemeButtons(); });
})();
