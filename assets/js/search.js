// Local-only search. Queries and theme filters remain shareable in the URL.
(function () {
  'use strict';
  const root = document.querySelector('.search-container');
  if (!root) return;
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-count');
  const filters = document.getElementById('theme-filters');
  const filterButtons = new Map(Array.from(
    filters?.querySelectorAll('[data-theme]') || [],
    button => [button.dataset.theme, button]
  ));
  const clear = document.getElementById('theme-filter-clear');
  const more = document.getElementById('search-more');
  const retry = document.getElementById('search-retry');
  const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const themes = new Set();
  let items = JSON.parse(document.getElementById('search-metadata').textContent);
  const availableThemes = new Set(items.flatMap(item => item.themes.map(theme => theme.slug)));
  const normalizeSlug = value => normalize(value).replace(/\s+/g, '-');
  const legacyTags = new Map(Object.entries(JSON.parse(document.getElementById('search-legacy-tags').textContent))
    .map(([tag, theme]) => [normalizeSlug(tag), theme]));
  let fuse, loading = false, failed = false, limit = 10, timer;
  function fromURL() {
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    themes.clear();
    const selected = (params.get('themes') || '').split(',').map(normalizeSlug);
    if (params.has('tags') && !params.has('themes')) {
      for (let tag of params.get('tags').split(',')) {
        // Some older shared links encoded tags twice.
        try { tag = decodeURIComponent(tag); } catch (_) {}
        selected.push(legacyTags.get(normalizeSlug(tag)));
      }
    }
    selected.filter(theme => availableThemes.has(theme)).forEach(theme => themes.add(theme));
    if (params.has('tags')) syncURL();
  }
  function syncURL() {
    const params = new URLSearchParams(location.search);
    if (input.value.trim()) params.set('q', input.value.trim()); else params.delete('q');
    if (themes.size) params.set('themes',[...themes].join(',')); else params.delete('themes');
    params.delete('tags');
    history.replaceState(null,'',location.pathname + (params.size ? '?' + params : ''));
  }
  function syncButtons() {
    for (const [slug, button] of filterButtons) {
      button.setAttribute('aria-pressed', String(themes.has(slug)));
    }
    if (clear) clear.hidden = !themes.size && !input.value;
  }
  function toggle(theme) {
    if (themes.has(theme)) themes.delete(theme); else themes.add(theme);
    limit = 10; syncURL(); refresh();
  }
  function highlightedTitle(title) {
    const fragment = document.createDocumentFragment();
    const q = normalize(input.value), i = normalize(title).indexOf(q);
    if (!q || i < 0) { fragment.append(title); return fragment; }
    fragment.append(title.slice(0,i));
    const mark = document.createElement('mark'); mark.textContent = title.slice(i,i+q.length);
    fragment.append(mark,title.slice(i+q.length)); return fragment;
  }
  function card(item) {
    const article = document.createElement('article');
    article.className = 'post-item search-result-item';
    const copy = document.createElement('div');
    copy.className = 'post-item-main';
    const title = document.createElement('h2');
    title.className = 'post-item-title search-result-title';
    const link = document.createElement('a');
    link.href = item.permalink;
    link.append(highlightedTitle(item.title));
    title.append(link);
    copy.append(title);
    article.append(copy);
    if (item.dateLabel) {
      const meta = document.createElement('div');
      meta.className = 'post-item-meta';
      const time = document.createElement('time');
      time.dateTime = item.date.slice(0, 10);
      time.textContent = item.dateLabel;
      meta.append(time);
      article.append(meta);
    }
    const excerpt = item.summary || item.contents || '';
    if (excerpt) {
      const p = document.createElement('p'); p.className = 'post-item-excerpt';
      p.textContent = excerpt.length > 180 ? excerpt.slice(0,180).replace(/\s+\S*$/,'') + '…' : excerpt;
      copy.append(p);
    }
    if (!item.themes.length) return article;
    const themeRow = document.createElement('div');
    themeRow.className = 'post-item-themes search-result-themes';
    item.themes.forEach(theme => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = theme.title;
      button.setAttribute('aria-pressed', String(themes.has(theme.slug)));
      button.addEventListener('click', () => {
        const hadFocus = document.activeElement === button;
        toggle(theme.slug);
        if (hadFocus) (filterButtons.get(theme.slug) ?? input).focus();
      });
      themeRow.append(button);
    });
    copy.append(themeRow);
    return article;
  }
  function render() {
    syncButtons(); results.replaceChildren(); more.hidden = true;
    const q = normalize(input.value);
    retry.hidden = !q || !failed;
    if (q && !fuse) {
      status.textContent = failed
        ? 'La recherche n’a pas pu être chargée.'
        : 'Chargement de la recherche…';
      return;
    }
    if (!q && !themes.size) { status.textContent = ''; return; }
    const matches = q
      ? fuse.search(q).sort((a, b) => a.item.index - b.item.index).map(result => items[result.item.index])
      : items;
    const found = themes.size ? matches.filter(item => item.themes.some(theme => themes.has(theme.slug))) : matches;
    const n = found.length;
    status.textContent = n ? n + ' résultat' + (n > 1 ? 's' : '') + (n > limit ? ' · ' + limit + ' affichés' : '') : 'Aucun résultat. Essaie un autre mot ou retire un filtre.';
    found.slice(0,limit).forEach(item => results.append(card(item)));
    more.hidden = n <= limit;
  }
  async function load() {
    if (loading || fuse) return;
    loading = true;
    try {
      const [response, { default: Fuse }] = await Promise.all([
        fetch(root.dataset.index),
        import(root.dataset.fuseModule)
      ]);
      if (!response.ok) throw new Error('Index unavailable');
      const articles = await response.json();
      if (!Array.isArray(articles)) throw new Error('Invalid index');
      const indexed = articles.map((item,index) => ({
        index,
        title: normalize(item.title),
        summary: normalize(item.summary),
        contents: normalize(item.contents),
        themes: item.themes.map(theme => normalize(theme.title))
      }));
      fuse = new Fuse(indexed,{keys:[{name:'title',weight:3},{name:'themes',weight:2},'summary','contents'],threshold:.2,ignoreLocation:true});
      items = articles;
    } catch (_) {
      failed = true;
    } finally {
      loading = false;
      render();
    }
  }
  function refresh() {
    if (normalize(input.value) && !failed) load();
    render();
  }
  input.addEventListener('input',() => { clearTimeout(timer); timer = setTimeout(() => { limit = 10; syncURL(); refresh(); },180); });
  root.querySelector('form').addEventListener('submit',e => { e.preventDefault(); clearTimeout(timer); limit = 10; syncURL(); refresh(); });
  if (filters) filters.addEventListener('click',e => { const b = e.target.closest('[data-theme]'); if (b) toggle(b.dataset.theme); });
  clear?.addEventListener('click',() => { clearTimeout(timer); themes.clear(); input.value = ''; limit = 10; syncURL(); render(); input.focus(); });
  more.addEventListener('click', () => {
    const previousLimit = limit;
    const hadFocus = document.activeElement === more;
    limit += 10;
    render();
    if (hadFocus) {
      const firstNewLink = results.children[previousLimit]?.querySelector('h2 a');
      (firstNewLink ?? input).focus();
    }
  });
  retry.addEventListener('click', () => {
    if (document.activeElement === retry) input.focus();
    failed = false;
    refresh();
  });
  addEventListener('popstate',() => { clearTimeout(timer); fromURL(); limit = 10; refresh(); });
  fromURL(); refresh();
})();
