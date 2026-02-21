/**
 * TOC Spy — Suivi de position dans la table des matières latérale
 *
 * Observe les titres h2/h3 de .page-content via IntersectionObserver.
 * Quand un titre est visible, le lien correspondant dans .toc-sidebar
 * reçoit la classe .toc-active.
 *
 * Fonctionne correctement dans les deux sens de scroll (haut/bas).
 */
(function () {
    'use strict';

    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const sidebar = document.querySelector('.toc-sidebar');
        if (!sidebar) return;

        const tocNav = sidebar.querySelector('nav#TableOfContents');
        if (!tocNav) return;

        // Récupérer tous les liens de la TOC
        const tocLinks = Array.from(tocNav.querySelectorAll('a[href^="#"]'));
        if (tocLinks.length === 0) return;

        // Récupérer les titres correspondants dans l'article
        const article = document.querySelector('.page-content');
        if (!article) return;

        const headings = Array.from(article.querySelectorAll('h2[id], h3[id]'));
        if (headings.length === 0) return;

        // Index courant — le titre le plus haut visible dans le viewport
        let activeId = null;

        // Marquer un lien comme actif
        function setActive(id) {
            if (activeId === id) return;
            activeId = id;

            tocLinks.forEach(link => {
                const isActive = link.getAttribute('href') === '#' + id;
                link.classList.toggle('toc-active', isActive);
            });
        }

        // Observer : rootMargin calibré pour activer le titre
        // dès qu'il passe sous la navbar (~80px du haut)
        const observer = new IntersectionObserver(
            function (entries) {
                // Construire un snapshot de visibilité pour tous les titres
                entries.forEach(entry => {
                    entry.target._tocVisible = entry.isIntersecting;
                });

                // Trouver le premier titre visible en partant du haut
                const firstVisible = headings.find(h => h._tocVisible);
                if (firstVisible) {
                    setActive(firstVisible.id);
                    return;
                }

                // Aucun titre visible : on est entre deux titres ou en bas.
                // Activer le dernier titre au-dessus du viewport.
                const scrollY = window.scrollY;
                let lastAbove = null;
                headings.forEach(h => {
                    if (h.getBoundingClientRect().top + scrollY < scrollY + window.innerHeight * 0.5) {
                        lastAbove = h;
                    }
                });
                if (lastAbove) {
                    setActive(lastAbove.id);
                }
            },
            {
                // Zone d'observation : ignorer les 80px du haut (navbar)
                // et déclencher sur les 40% supérieurs du viewport
                rootMargin: '-80px 0px -60% 0px',
                threshold: 0
            }
        );

        headings.forEach(h => {
            h._tocVisible = false;
            observer.observe(h);
        });

        // Activer le premier titre au chargement si on est en haut de page
        if (headings.length > 0 && window.scrollY < 100) {
            setActive(headings[0].id);
        }
    }
})();
