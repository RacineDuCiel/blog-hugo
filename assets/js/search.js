/**
 * ===========================================================================
 * Module de recherche + filtrage par tags
 * ---------------------------------------------------------------------------
 * - IIFE pour éviter les variables globales
 * - Debounce sur la saisie texte
 * - createElement() au lieu de innerHTML (prévention XSS)
 * - Filtrage multi-tags en ET, combinable avec la recherche texte
 * - État des tags synchronisé avec l'URL (?tags=a,b) — partageable
 * ===========================================================================
 */
(function () {
    'use strict';

    // =========================================================================
    // Configuration
    // =========================================================================
    const CONFIG = {
        DEBOUNCE_DELAY: 200,      // ms avant de lancer la recherche
        MAX_RESULTS: 10,          // Max de résultats en mode recherche texte
        SNIPPET_LENGTH: 120,      // Longueur du résumé
        FUSE_OPTIONS: {
            keys: [
                { name: 'title', weight: 0.5 },
                { name: 'tags', weight: 0.3 },
                { name: 'categories', weight: 0.3 },
                { name: 'summary', weight: 0.4 },
                { name: 'contents', weight: 0.5 }
            ],
            threshold: 0.1,
            minMatchCharLength: 1,
            ignoreLocation: true,
            useExtendedSearch: true,
            includeMatches: true
        }
    };

    // =========================================================================
    // Éléments du DOM
    // =========================================================================
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchCount = document.getElementById('search-count');
    const tagCloud = document.getElementById('tag-cloud');
    const tagClear = document.getElementById('tag-filter-clear');

    // Élément réutilisable pour stripper le HTML
    const tempDiv = document.createElement('div');

    // État
    let fuse = null;
    let allItems = [];
    const activeTags = new Set();
    let query = '';

    // =========================================================================
    // Utilitaires
    // =========================================================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function stripHtml(html) {
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    /** Normalise un tag pour comparaison (minuscule, sans espaces superflus). */
    function normTag(t) {
        return (t || '').toString().trim().toLowerCase();
    }

    /** Minuscule + suppression des accents, pour une recherche tolérante. */
    function deburr(s) {
        const n = (s || '').toString().normalize('NFD');
        let out = '';
        for (let i = 0; i < n.length; i++) {
            const c = n.charCodeAt(i);
            // Ignore les diacritiques combinants (plage U+0300–U+036F)
            if (c < 0x300 || c > 0x36F) out += n[i];
        }
        return out.trim().toLowerCase();
    }

    function itemTags(item) {
        return Array.isArray(item.tags) ? item.tags : [];
    }

    /** Un item possède-t-il TOUS les tags actifs (ET) ? */
    function itemHasAllTags(item) {
        if (activeTags.size === 0) return true;
        const set = new Set(itemTags(item).map(normTag));
        for (const t of activeTags) {
            if (!set.has(t)) return false;
        }
        return true;
    }

    /**
     * Surligne les termes correspondants via les indices Fuse.js
     */
    function highlightMatches(text, indices) {
        const frag = document.createDocumentFragment();
        if (!indices || indices.length === 0) {
            frag.appendChild(document.createTextNode(text));
            return frag;
        }
        let lastIndex = 0;
        const sorted = [...indices].sort((a, b) => a[0] - b[0]);
        sorted.forEach(([start, end]) => {
            if (start > lastIndex) {
                frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
            }
            const mark = document.createElement('mark');
            mark.textContent = text.slice(start, end + 1);
            frag.appendChild(mark);
            lastIndex = end + 1;
        });
        if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        return frag;
    }

    // =========================================================================
    // URL <-> état des tags
    // =========================================================================

    function readTagsFromURL() {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('tags');
        if (!raw) return;
        raw.split(',').forEach(t => {
            const tag = normTag(decodeURIComponent(t));
            if (tag) activeTags.add(tag);
        });
    }

    function syncURL() {
        const params = new URLSearchParams(window.location.search);
        if (activeTags.size > 0) {
            params.set('tags', [...activeTags].map(encodeURIComponent).join(','));
        } else {
            params.delete('tags');
        }
        const qs = params.toString();
        const newUrl = window.location.pathname + (qs ? '?' + qs : '');
        window.history.replaceState(null, '', newUrl);
    }

    // =========================================================================
    // Rendu d'un résultat
    // =========================================================================

    function createResultElement(item, matches) {
        matches = matches || [];
        const matchMap = {};
        matches.forEach(m => { matchMap[m.key] = m.indices; });

        const article = document.createElement('div');
        article.className = 'search-result-item';

        // Titre
        const h3 = document.createElement('h3');
        const link = document.createElement('a');
        link.href = item.permalink;
        if (matchMap['title']) {
            link.appendChild(highlightMatches(item.title, matchMap['title']));
        } else {
            link.textContent = item.title;
        }
        h3.appendChild(link);
        article.appendChild(h3);

        // Snippet
        const content = item.summary || item.contents || '';
        const plainText = stripHtml(content);
        const snippet = plainText.length > CONFIG.SNIPPET_LENGTH
            ? plainText.substring(0, CONFIG.SNIPPET_LENGTH) + '...'
            : plainText;

        const p = document.createElement('p');
        if (matchMap['summary'] || matchMap['contents']) {
            const indices = matchMap['summary'] || matchMap['contents'];
            const filtered = indices.filter(([s]) => s < CONFIG.SNIPPET_LENGTH);
            p.appendChild(highlightMatches(snippet, filtered));
        } else {
            p.textContent = snippet;
        }
        article.appendChild(p);

        // Tags cliquables
        const tags = itemTags(item);
        if (tags.length > 0) {
            const tagWrap = document.createElement('div');
            tagWrap.className = 'result-tags';
            tags.forEach(t => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'result-tag';
                btn.dataset.tag = normTag(t);
                btn.textContent = t;
                if (activeTags.has(normTag(t))) {
                    btn.classList.add('is-active');
                }
                tagWrap.appendChild(btn);
            });
            article.appendChild(tagWrap);
        }

        // Date
        if (item.date) {
            const small = document.createElement('small');
            small.textContent = new Date(item.date).toLocaleDateString('fr-FR');
            article.appendChild(small);
        }

        return article;
    }

    function showMessage(message, isError = false) {
        const p = document.createElement('p');
        p.textContent = message;
        if (isError) p.style.color = 'red';
        searchResults.innerHTML = '';
        searchResults.appendChild(p);
    }

    function updateCount(text) {
        if (!searchCount) return;
        if (text) {
            searchCount.textContent = text;
            searchCount.hidden = false;
        } else {
            searchCount.textContent = '';
            searchCount.hidden = true;
        }
    }

    // =========================================================================
    // Rendu principal
    // =========================================================================

    function render() {
        if (!searchResults) return;
        const q = query.trim();
        const hasQuery = q.length > 0;
        const hasTags = activeTags.size > 0;

        // État vide : aucun critère → on laisse le nuage de tags guider
        if (!hasQuery && !hasTags) {
            searchResults.innerHTML = '';
            updateCount('');
            return;
        }

        // Construction de la base de résultats
        let results;
        if (hasQuery) {
            if (!fuse) return;
            results = fuse.search(q).map(r => ({ item: r.item, matches: r.matches }));
        } else {
            results = allItems
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(item => ({ item, matches: [] }));
        }

        // Filtre tags (ET)
        if (hasTags) {
            results = results.filter(r => itemHasAllTags(r.item));
        }

        searchResults.innerHTML = '';

        if (results.length === 0) {
            updateCount('');
            showMessage('Aucun résultat trouvé.');
            return;
        }

        const shown = hasQuery ? results.slice(0, CONFIG.MAX_RESULTS) : results;
        const fragment = document.createDocumentFragment();
        shown.forEach(r => fragment.appendChild(createResultElement(r.item, r.matches)));
        searchResults.appendChild(fragment);

        const n = results.length;
        const noun = hasQuery ? 'résultat' : 'article';
        updateCount(n + ' ' + noun + (n > 1 ? 's' : ''));
    }

    // =========================================================================
    // Gestion des tags
    // =========================================================================

    /**
     * Filtre les pills visibles selon la saisie (insensible casse/accents).
     * Les tags actifs restent toujours visibles pour pouvoir les désactiver.
     */
    function filterTagCloud(q) {
        if (!tagCloud) return;
        const term = deburr(q);
        tagCloud.querySelectorAll('.tag-pill').forEach(pill => {
            const tag = deburr(pill.dataset.tag);
            const visible = term === '' || tag.indexOf(term) !== -1 || activeTags.has(normTag(pill.dataset.tag));
            pill.hidden = !visible;
        });
    }

    function syncPillStates() {
        if (tagCloud) {
            tagCloud.querySelectorAll('.tag-pill').forEach(pill => {
                const active = activeTags.has(normTag(pill.dataset.tag));
                pill.classList.toggle('is-active', active);
                pill.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
        }
        if (tagClear) tagClear.hidden = activeTags.size === 0;
    }

    function toggleTag(tag) {
        const t = normTag(tag);
        if (!t) return;
        if (activeTags.has(t)) {
            activeTags.delete(t);
        } else {
            activeTags.add(t);
        }
        syncURL();
        syncPillStates();
        render();
    }

    function clearTags() {
        activeTags.clear();
        syncURL();
        syncPillStates();
        render();
    }

    // =========================================================================
    // Initialisation
    // =========================================================================

    function loadSearchIndex() {
        fetch('/index.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                allItems = data;
                fuse = new Fuse(data, CONFIG.FUSE_OPTIONS);
                render();
            })
            .catch(error => {
                console.error('Error loading search index:', error);
                showMessage('Erreur de chargement de la recherche. Vérifiez la console.', true);
            });
    }

    function initEventListeners() {
        if (searchInput) {
            const debouncedRender = debounce(render, CONFIG.DEBOUNCE_DELAY);
            searchInput.addEventListener('input', () => {
                query = searchInput.value;
                filterTagCloud(query);   // filtrage instantané du nuage
                debouncedRender();       // recherche d'articles débounce
            });
        }

        if (tagCloud) {
            tagCloud.addEventListener('click', e => {
                const pill = e.target.closest('.tag-pill');
                if (pill) toggleTag(pill.dataset.tag);
            });
        }

        if (tagClear) {
            tagClear.addEventListener('click', clearTags);
        }

        // Délégation pour les chips de tags dans les résultats
        if (searchResults) {
            searchResults.addEventListener('click', e => {
                const chip = e.target.closest('.result-tag');
                if (chip) toggleTag(chip.dataset.tag);
            });
        }
    }

    function init() {
        readTagsFromURL();
        syncPillStates();
        initEventListeners();
        loadSearchIndex();
    }

    init();

})();
