(function () {
  'use strict';

  const prose = document.getElementById('article-content');
  if (!prose) return;

  // Move tables into a scroll area while preserving the table itself.
  const scrollAreas = [];
  let section = '';
  for (const element of prose.querySelectorAll('h2[id], h3[id], h4[id], h5[id], h6[id], table, pre')) {
    if (element.matches('h2, h3, h4, h5, h6')) {
      section = element.textContent.trim();
      continue;
    }
    let area = element;
    const isTable = element.tagName === 'TABLE';
    if (isTable) {
      if (element.closest('.highlight')) continue;
      area = document.createElement('div');
      area.className = 'table-scroll';
      element.before(area);
      area.append(element);
    }
    if (area.hasAttribute('tabindex') || area.hasAttribute('role') || area.hasAttribute('aria-label')) continue;
    const context = isTable ? element.caption?.textContent.trim() || section : section;
    const type = isTable ? 'Tableau' : 'Extrait de code';
    scrollAreas.push({ area, label: context ? type + ' — ' + context : type });
  }

  const progress = document.createElement('div');
  progress.id = 'reading-progress';
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-label', 'Progression de lecture');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  document.body.prepend(progress);

  let pending = false;
  let percent = -1;
  function updateProgress() {
    pending = false;
    const bounds = prose.getBoundingClientRect();
    const distance = bounds.height - window.innerHeight;
    progress.hidden = distance <= 0;
    if (progress.hidden) return;

    const fraction = Math.max(0, Math.min(1, -bounds.top / distance));
    progress.style.transform = 'scaleX(' + fraction + ')';
    const next = Math.round(fraction * 100);
    if (next !== percent) {
      progress.setAttribute('aria-valuenow', String(next));
      percent = next;
    }
  }

  function scheduleProgress() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(updateProgress);
    }
  }

  function updateSizes() {
    const overflowing = scrollAreas.map(({ area }) => area.scrollWidth > area.clientWidth + 1);
    scrollAreas.forEach(({ area, label }, index) => {
      if (overflowing[index]) {
        area.tabIndex = 0;
        area.setAttribute('role', 'region');
        area.setAttribute('aria-label', label);
      } else {
        area.removeAttribute('tabindex');
        area.removeAttribute('role');
        area.removeAttribute('aria-label');
      }
    });
    scheduleProgress();
  }

  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', updateSizes, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(updateSizes).observe(prose);
  document.fonts?.ready.then(updateSizes);
  updateSizes();
})();
