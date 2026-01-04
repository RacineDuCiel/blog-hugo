/**
 * ===========================================================================
 * BEST PRACTICE: Module de recherche encapsulé
 * ---------------------------------------------------------------------------
 * - IIFE (Immediately Invoked Function Expression) pour éviter les variables globales
 * - Debounce pour limiter les appels pendant la saisie
 * - createElement() au lieu de innerHTML pour la sécurité (prévention XSS)
 * - Réutilisation d'un seul élément tempDiv pour le stripping HTML
 * ===========================================================================
 */
(function () {
    'use strict';

    // =========================================================================
    // Configuration
    // =========================================================================
    const CONFIG = {
        DEBOUNCE_DELAY: 200,      // ms avant de lancer la recherche
        MAX_RESULTS: 10,          // Nombre max de résultats affichés
        SNIPPET_LENGTH: 80,       // Longueur du résumé
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
            useExtendedSearch: true
        }
    };

    // =========================================================================
    // Éléments du DOM (récupérés une seule fois)
    // =========================================================================
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // Élément réutilisable pour stripper le HTML (évite de créer des éléments à chaque résultat)
    const tempDiv = document.createElement('div');

    // Instance Fuse.js
    let fuse = null;

    // =========================================================================
    // Utilitaires
    // =========================================================================

    /**
     * Debounce : retarde l'exécution d'une fonction jusqu'à ce que l'utilisateur
     * arrête de taper pendant un certain délai.
     * @param {Function} func - Fonction à debouncer
     * @param {number} wait - Délai en ms
     * @returns {Function}
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Convertit du HTML en texte brut (strip HTML tags)
     * Réutilise tempDiv pour éviter les allocations mémoire
     * @param {string} html - Contenu HTML
     * @returns {string} - Texte brut
     */
    function stripHtml(html) {
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    /**
     * Crée un élément de résultat de manière sécurisée (sans innerHTML)
     * @param {Object} item - Objet résultat de la recherche
     * @returns {HTMLElement}
     */
    function createResultElement(item) {
        // Article container
        const article = document.createElement('div');
        article.className = 'search-result-item';

        // Titre avec lien
        const h3 = document.createElement('h3');
        const link = document.createElement('a');
        link.href = item.permalink;
        link.textContent = item.title; // textContent = sécurisé contre XSS
        h3.appendChild(link);
        article.appendChild(h3);

        // Snippet (résumé)
        const content = item.summary || item.contents || '';
        const plainText = stripHtml(content);
        const snippet = plainText.length > CONFIG.SNIPPET_LENGTH
            ? plainText.substring(0, CONFIG.SNIPPET_LENGTH) + '...'
            : plainText;

        const p = document.createElement('p');
        p.textContent = snippet;
        article.appendChild(p);

        // Date
        const small = document.createElement('small');
        small.textContent = new Date(item.date).toLocaleDateString('fr-FR');
        article.appendChild(small);

        return article;
    }

    /**
     * Affiche un message (aucun résultat, erreur, etc.)
     * @param {string} message - Message à afficher
     * @param {boolean} isError - Si true, style en rouge
     */
    function showMessage(message, isError = false) {
        const p = document.createElement('p');
        p.textContent = message;
        if (isError) {
            p.style.color = 'red';
        }
        searchResults.innerHTML = '';
        searchResults.appendChild(p);
    }

    // =========================================================================
    // Logique de recherche
    // =========================================================================

    /**
     * Effectue la recherche et affiche les résultats
     * @param {string} query - Terme de recherche
     */
    function performSearch(query) {
        if (!fuse) {
            return;
        }

        // Indicateur de recherche en cours (accessibilité)
        searchResults.setAttribute('aria-busy', 'true');

        if (query.length === 0) {
            searchResults.innerHTML = '';
            searchResults.setAttribute('aria-busy', 'false');
            return;
        }

        const results = fuse.search(query);

        // Vide les résultats précédents
        searchResults.innerHTML = '';

        if (results.length > 0) {
            // Créer un fragment pour optimiser les reflows DOM
            const fragment = document.createDocumentFragment();

            results.slice(0, CONFIG.MAX_RESULTS).forEach(result => {
                const element = createResultElement(result.item);
                fragment.appendChild(element);
            });

            searchResults.appendChild(fragment);
        } else {
            showMessage('Aucun résultat trouvé.');
        }

        searchResults.setAttribute('aria-busy', 'false');
    }

    // =========================================================================
    // Initialisation
    // =========================================================================

    /**
     * Charge l'index de recherche depuis le JSON généré par Hugo
     */
    function loadSearchIndex() {
        fetch('/index.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Search index loaded:', data.length, 'items');
                fuse = new Fuse(data, CONFIG.FUSE_OPTIONS);
            })
            .catch(error => {
                console.error('Error loading search index:', error);
                showMessage('Erreur de chargement de la recherche. Vérifiez la console.', true);
            });
    }

    /**
     * Initialise les event listeners
     */
    function initEventListeners() {
        // Debounce sur l'input pour éviter trop de recherches
        const debouncedSearch = debounce((e) => {
            performSearch(e.target.value);
        }, CONFIG.DEBOUNCE_DELAY);

        searchInput.addEventListener('input', debouncedSearch);
    }

    /**
     * Point d'entrée
     */
    function init() {
        loadSearchIndex();
        initEventListeners();
    }

    // Lancer l'initialisation
    init();

})();
