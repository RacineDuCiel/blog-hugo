/**
 * Barre de progression de lecture
 * Fine ligne colorée en haut de la page qui se remplit au fil du défilement
 */
(function () {
    'use strict';

    const bar = document.createElement('div');
    bar.id = 'reading-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Progression de lecture');
    bar.setAttribute('aria-valuenow', '0');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    document.body.prepend(bar);

    function updateProgress() {
        const article = document.querySelector('.page-content');
        if (!article) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const viewportHeight = window.innerHeight;

        const readableHeight = articleHeight - viewportHeight;
        const progress = readableHeight > 0
            ? Math.min(100, Math.max(0, ((scrollTop - articleTop) / readableHeight) * 100))
            : 0;

        bar.style.width = progress + '%';
        bar.setAttribute('aria-valuenow', Math.round(progress));
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
})();
