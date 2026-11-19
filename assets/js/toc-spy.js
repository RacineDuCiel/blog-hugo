(function () {
  'use strict';

  const prose = document.getElementById('article-content');
  const aside = document.querySelector('.article-toc');
  if (!prose || !aside) return;

  const root = document.documentElement;
  const wide = matchMedia('(min-width: 1200px)');
  const toc = aside.querySelector('.toc-details');
  const inline = toc.querySelector('.toc-inline');
  const content = inline.querySelector('.toc-content');
  const nav = content.querySelector('.toc-nav');
  const topButton = aside.querySelector('.toc-open');
  const floatingButton = document.querySelector('.toc-fab');
  const dialog = document.getElementById('toc-dialog');
  const dialogContent = dialog.querySelector('.toc-dialog-content');
  const canOpenDialog = typeof dialog.showModal === 'function';
  const visualViewport = window.visualViewport;
  const filter = content.querySelector('.toc-filter');
  const search = filter?.querySelector('input');
  const clear = filter?.querySelector('.toc-filter-clear');
  const status = filter?.querySelector('.toc-filter-status');
  const byItem = new Map();
  const byLink = new Map();
  const byId = new Map();

  function fragmentId(hash) {
    const id = hash.slice(1);
    try { return decodeURIComponent(id); } catch (_) { return id; }
  }

  function normalize(text) {
    return text.normalize('NFD').toLocaleLowerCase('fr')
      .replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe').replace(/[’']/g, ' ').trim();
  }

  for (const item of nav.querySelectorAll('.toc-item')) {
    const link = item.querySelector(':scope > .toc-link');
    const heading = document.getElementById(fragmentId(link.hash));
    const section = {
      item, link,
      branch: item.querySelector(':scope > .toc-branch'),
      parent: byItem.get(item.parentElement.closest('.toc-item')),
      heading: prose.contains(heading) ? heading : null,
      title: filter ? normalize(link.textContent) : '',
      collapsed: false,
      offset: null,
    };
    byItem.set(item, section);
    byLink.set(link, section);
    if (section.heading) byId.set(heading.id, section);
  }

  const sections = [...byItem.values()];
  const topLevel = nav.querySelector('ul');
  if (topLevel.children.length === 1) {
    const first = byItem.get(topLevel.firstElementChild);
    if (first?.branch) first.branch.open = true;
  }

  let active = null;
  let positions = [];
  let scrollPadding = 0;
  let layoutChanged = true;
  let frame = 0;
  let openBeforeFilter = null;
  let firstMatch = null;
  let opener = null;
  let focusAfterClose = null;

  function scrollInOutline(link) {
    const row = link.getBoundingClientRect();
    const panel = nav.getBoundingClientRect();
    if (row.top < panel.top) nav.scrollTop += row.top - panel.top;
    else if (row.bottom > panel.bottom) nav.scrollTop += row.bottom - panel.bottom;
  }

  function revealCurrent() {
    if (!active || openBeforeFilter || !nav.getClientRects().length) return;
    let visible = active;
    for (let parent = active.parent; parent; parent = parent.parent) {
      if (!parent.collapsed) parent.branch.open = true;
      if (!parent.branch.open) visible = parent;
    }
    scrollInOutline(visible.link);
  }

  function select(section) {
    if (section === active) return;
    if (active) {
      active.link.removeAttribute('aria-current');
      for (let parent = active.parent; parent; parent = parent.parent) {
        parent.item.removeAttribute('data-current-path');
      }
    }
    active = section;
    if (!active) return;
    active.link.setAttribute('aria-current', 'location');
    for (let parent = active.parent; parent; parent = parent.parent) {
      parent.item.setAttribute('data-current-path', '');
    }
    const focused = document.activeElement;
    if (!content.contains(focused) || !focused.matches(':focus-visible')) revealCurrent();
  }

  function sectionAt(top) {
    const linked = byId.get(fragmentId(location.hash));
    if (linked?.offset != null && Math.abs(linked.offset - top - scrollPadding) < 24) {
      const margin = parseFloat(getComputedStyle(linked.heading).scrollMarginBlockStart) || 0;
      if (Math.abs(linked.offset - top - scrollPadding - margin) <= 2) return linked;
    }

    const line = top + scrollPadding + 12;
    let start = 0;
    let end = positions.length;
    while (start < end) {
      const middle = (start + end) >>> 1;
      if (positions[middle].offset <= line) start = middle + 1;
      else end = middle;
    }
    return positions[start - 1] || null;
  }

  function update() {
    frame = 0;
    const top = window.scrollY;
    if (layoutChanged) {
      scrollPadding = parseFloat(getComputedStyle(root).scrollPaddingBlockStart) || 0;
      positions = [];
      for (const section of sections) {
        section.offset = null;
        if (section.heading?.getClientRects().length) {
          section.offset = section.heading.getBoundingClientRect().top + top;
          positions.push(section);
        }
      }
      positions.sort((first, second) => first.offset - second.offset);
      layoutChanged = false;
    }
    select(sectionAt(top));

    if (canOpenDialog && !dialog.open) {
      floatingButton.hidden = wide.matches || aside.getBoundingClientRect().bottom > 0 ||
        prose.getBoundingClientRect().bottom <= window.innerHeight;
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function refresh() {
    layoutChanged = true;
    schedule();
  }

  function applyFilter() {
    const query = normalize(search.value);
    clear.hidden = !search.value;
    firstMatch = null;
    if (!query) {
      if (openBeforeFilter) {
        for (const section of sections) {
          section.item.hidden = false;
          section.item.removeAttribute('data-filter-match');
          if (section.branch) {
            section.branch.hidden = false;
            section.branch.open = openBeforeFilter.has(section.branch);
          }
        }
        openBeforeFilter = null;
        nav.hidden = false;
        status.textContent = '';
        revealCurrent();
      }
      return;
    }

    if (!openBeforeFilter) {
      openBeforeFilter = new Set(sections.map(section => section.branch).filter(branch => branch?.open));
    }
    const words = query.split(/\s+/);
    const visible = new Set();
    const expanded = new Set();
    let count = 0;
    for (const section of sections) {
      const matches = words.every(word => section.title.includes(word));
      section.item.toggleAttribute('data-filter-match', matches);
      if (!matches) continue;
      firstMatch ||= section;
      count++;
      visible.add(section);
      for (let parent = section.parent; parent; parent = parent.parent) {
        visible.add(parent);
        expanded.add(parent);
      }
    }
    for (const section of sections) {
      section.item.hidden = !visible.has(section);
      if (section.branch) {
        section.branch.hidden = !expanded.has(section);
        section.branch.open = expanded.has(section);
      }
    }
    nav.hidden = !count;
    nav.scrollTop = 0;
    const message = count === 0 ? 'Aucune section trouvée' :
      count === 1 ? '1 section trouvée' : count + ' sections trouvées';
    if (status.textContent !== message) status.textContent = message;
  }

  function resetFilter() {
    if (!search || !search.value) return;
    search.value = '';
    applyFilter();
  }

  if (filter) {
    filter.hidden = false;
    search.addEventListener('input', applyFilter);
    search.addEventListener('keydown', event => {
      if (event.isComposing) return;
      if (event.key === 'Escape' && search.value) {
        event.preventDefault();
        resetFilter();
      } else if (event.key === 'Enter' && firstMatch) {
        event.preventDefault();
        firstMatch.link.focus({ preventScroll: true });
        scrollInOutline(firstMatch.link);
      }
    });
    clear.addEventListener('click', () => {
      search.focus({ preventScroll: true });
      resetFilter();
    });
  }

  function setLayout() {
    const compact = !wide.matches && canOpenDialog;
    if (!compact && dialog.open) dialog.close();
    topButton.hidden = !compact;
    toc.hidden = compact;
    toc.open = wide.matches;
    refresh();
  }

  function focusHeading(heading) {
    if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }

  nav.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const disclosure = event.target.closest('.toc-disclosure');
    if (disclosure && !openBeforeFilter) {
      const section = byItem.get(disclosure.closest('.toc-item'));
      section.collapsed = section.branch.open;
      return;
    }
    const section = byLink.get(event.target.closest('.toc-link'));
    if (!section?.heading) return;
    if (openBeforeFilter) {
      for (let parent = section.parent; parent; parent = parent.parent) parent.collapsed = false;
    }
    resetFilter();
    if (dialog.open) {
      focusAfterClose = section.heading;
      dialog.close();
    } else {
      if (!wide.matches) toc.open = false;
      focusHeading(section.heading);
    }
  });

  function fitDialog() {
    if (!visualViewport || !dialog.open) return;
    const { height, offsetTop } = visualViewport;
    dialog.style.setProperty('--toc-viewport-height', height + 'px');
    dialog.style.setProperty('--toc-viewport-top', offsetTop + 'px');
    dialog.style.setProperty('--toc-viewport-bottom', Math.max(0, window.innerHeight - offsetTop - height) + 'px');
  }

  if (canOpenDialog) {
    function openDialog(event) {
      if (opener) return;
      opener = event.currentTarget;
      root.style.setProperty('--dialog-scrollbar', (window.innerWidth - root.clientWidth) + 'px');
      dialogContent.append(content);
      dialog.showModal();
      fitDialog();
      nav.scrollTop = 0;
      revealCurrent();
    }

    topButton.addEventListener('click', openDialog);
    floatingButton.addEventListener('click', openDialog);
    visualViewport?.addEventListener('resize', fitDialog);
    visualViewport?.addEventListener('scroll', fitDialog);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });

    dialog.addEventListener('close', () => {
      root.style.removeProperty('--dialog-scrollbar');
      inline.append(content);
      resetFilter();
      if (focusAfterClose) {
        focusHeading(focusAfterClose);
        focusAfterClose = null;
      } else {
        const trigger = wide.matches ? toc.querySelector('.toc-summary') : opener;
        trigger?.focus({ preventScroll: true });
      }
      opener = null;
      refresh();
    });
  }

  wide.addEventListener('change', setLayout);
  toc.addEventListener('toggle', () => {
    if (toc.open) revealCurrent();
    refresh();
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('load', refresh, { once: true });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refresh);
    for (const element of document.querySelectorAll('.site-header, .article-header, .article-toc, #article-content')) {
      observer.observe(element);
    }
  }
  setLayout();
})();
