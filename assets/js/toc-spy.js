/**
 * TOC Spy — Suivi de position dans la TOC (desktop sidebar + mobile drawer)
 * + gestion du FAB mobile (bouton flottant + bottom sheet)
 *
 * Compatibilité scroll : écoute sur window ET document car Safari/Chrome avec
 * overflow-x:hidden redirigent parfois le scroll sur body/html, rendant les
 * événements sur window silencieux. Le flag `ticking` (rAF) évite les doubles
 * appels.
 *
 * Logique active : le titre actif est le dernier dont
 * getBoundingClientRect().top <= THRESHOLD (seuil sous la navbar).
 */
(function () {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // L'article : contient les titres h2/h3 avec des IDs
        const article = document.querySelector('.page-content');
        if (!article) return;

        const headings = Array.from(article.querySelectorAll('h2[id], h3[id]'));
        if (headings.length === 0) return;

        // ── Éléments desktop : sidebar sticky ─────────────────────────────────
        const tocInner  = document.querySelector('.toc-inner');
        const sideLinks = tocInner
            ? Array.from(tocInner.querySelectorAll('a[href^="#"]'))
            : [];

        // ── Éléments mobile : FAB + Drawer ────────────────────────────────────
        const fab         = document.getElementById('toc-fab');
        const fabLabel    = fab ? fab.querySelector('.toc-fab-label') : null;
        const overlay     = document.getElementById('toc-overlay');
        const drawer      = document.getElementById('toc-drawer');
        const drawerClose = document.getElementById('toc-drawer-close');
        const drawerNav   = drawer ? drawer.querySelector('.toc-drawer-nav') : null;
        const drawerLinks = drawerNav
            ? Array.from(drawerNav.querySelectorAll('a[href^="#"]'))
            : [];

        // Seuil en px sous le haut du viewport (compense la navbar ~60px + marge)
        const THRESHOLD = 80;

        let activeId   = null;
        let drawerOpen = false;
        let ticking    = false; // rAF throttle

        // ── Spy : détection du titre actif ────────────────────────────────────
        function getActiveHeading() {
            var active = headings[0];
            for (var i = 0; i < headings.length; i++) {
                if (headings[i].getBoundingClientRect().top <= THRESHOLD) {
                    active = headings[i];
                } else {
                    break;
                }
            }
            return active;
        }

        function setActive(id) {
            if (activeId === id) return;
            activeId = id;

            // Sidebar desktop
            applyActive(sideLinks, id, tocInner);

            // Drawer mobile
            applyActive(drawerLinks, id, null);

            // Label du FAB : titre de la section courante (tronqué)
            if (fabLabel) {
                var heading = id
                    ? article.querySelector('#' + cssEscape(id))
                    : null;
                if (heading) {
                    var text = heading.textContent.trim();
                    fabLabel.textContent = text.length > 30
                        ? text.slice(0, 29) + '\u2026'
                        : text;
                } else {
                    fabLabel.textContent = 'Plan';
                }
            }
        }

        function applyActive(links, id, scrollContainer) {
            links.forEach(function (link) {
                var isActive = link.getAttribute('href') === '#' + id;
                link.classList.toggle('toc-active', isActive);

                // Auto-scroll du conteneur de TOC uniquement (pas de la page)
                if (isActive && scrollContainer) {
                    var lt = link.offsetTop;
                    var lb = lt + link.offsetHeight;
                    var ct = scrollContainer.scrollTop;
                    var cb = ct + scrollContainer.clientHeight;
                    if (lt < ct) {
                        scrollContainer.scrollTop = lt - 8;
                    } else if (lb > cb) {
                        scrollContainer.scrollTop = lb - scrollContainer.clientHeight + 8;
                    }
                }
            });
        }

        // Polyfill léger pour CSS.escape
        function cssEscape(id) {
            if (window.CSS && CSS.escape) return CSS.escape(id);
            return id.replace(/([^\w-])/g, '\\$1');
        }

        // ── FAB : apparaît après 200 px de scroll ─────────────────────────────
        function updateFab() {
            if (!fab) return;
            var scrollY = window.scrollY || document.documentElement.scrollTop;
            fab.classList.toggle('toc-fab-visible', scrollY > 200);
        }

        // ── Drawer : ouverture / fermeture ────────────────────────────────────
        function openDrawer() {
            if (!drawer) return;
            drawerOpen = true;
            drawer.classList.add('toc-open');
            drawer.setAttribute('aria-hidden', 'false');
            if (overlay) overlay.classList.add('toc-open');
            if (fab) fab.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            // Focus sur le bouton fermer pour l'accessibilité clavier
            if (drawerClose) drawerClose.focus();
        }

        function closeDrawer() {
            if (!drawer) return;
            drawerOpen = false;
            drawer.classList.remove('toc-open');
            drawer.setAttribute('aria-hidden', 'true');
            if (overlay) overlay.classList.remove('toc-open');
            if (fab) {
                fab.setAttribute('aria-expanded', 'false');
                fab.focus(); // restituer le focus au bouton qui a ouvert
            }
            document.body.style.overflow = '';
        }

        // ── Événements FAB / Drawer ───────────────────────────────────────────
        if (fab) {
            fab.addEventListener('click', function () {
                drawerOpen ? closeDrawer() : openDrawer();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', closeDrawer);
        }

        if (drawerClose) {
            drawerClose.addEventListener('click', closeDrawer);
        }

        // Clic sur un lien dans le drawer : fermer la drawer et laisser le
        // navigateur scroller vers la cible (délai court pour ne pas bloquer)
        drawerLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                setTimeout(closeDrawer, 60);
            });
        });

        // Fermer avec Échap
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawerOpen) closeDrawer();
        });

        // ── Listener scroll (throttlé via rAF) ────────────────────────────────
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                setActive(getActiveHeading().id);
                updateFab();
                ticking = false;
            });
        }

        // Écouter sur window ET document pour compatibilité maximale
        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('scroll', onScroll, { passive: true });

        // État initial
        setActive(getActiveHeading().id);
        updateFab();
    }
})();
