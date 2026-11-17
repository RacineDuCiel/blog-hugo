// Local-only search. Query and AND-combined tags remain shareable in the URL.
(function () {
  'use strict';
  const root = document.querySelector('.search-container');
  if (!root) return;
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-count');
  const cloud = document.getElementById('tag-cloud');
  const clear = document.getElementById('tag-filter-clear');
  const more = document.getElementById('search-more');
  const retry = document.getElementById('search-retry');
  const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const tags = new Set();
  let items = JSON.parse(document.getElementById('search-metadata').textContent);
  let fuse, loading = false, failed = false, limit = 10, timer;
  function fromURL() {
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    tags.clear();
    (params.get('tags') || '').split(',').filter(Boolean).forEach(t => {
      // Older shared links encoded tags twice. Accept both representations.
      try { t = decodeURIComponent(t); } catch (_) {}
      tags.add(t.trim().toLowerCase());
    });
  }
  function syncURL() {
    const params = new URLSearchParams(location.search);
    if (input.value.trim()) params.set('q', input.value.trim()); else params.delete('q');
    if (tags.size) params.set('tags',[...tags].join(',')); else params.delete('tags');
    history.replaceState(null,'',location.pathname + (params.size ? '?' + params : ''));
  }
  function syncButtons() {
    if (cloud) cloud.querySelectorAll('[data-tag]').forEach(b => b.setAttribute('aria-pressed',String(tags.has(b.dataset.tag.toLowerCase()))));
    if (clear) clear.hidden = !tags.size && !input.value;
  }
  function toggle(tag) {
    tag = tag.trim().toLowerCase();
    if (tags.has(tag)) tags.delete(tag); else tags.add(tag);
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
    const el = document.createElement('article'); el.className = 'search-result-item';
    const h = document.createElement('h2'), a = document.createElement('a');
    a.href = item.permalink; a.append(highlightedTitle(item.title)); h.append(a); el.append(h);
    const p = document.createElement('p');
    const excerpt = item.summary || item.contents || '';
    p.textContent = excerpt.length > 180 ? excerpt.slice(0,180).replace(/\s+\S*$/,'') + '…' : excerpt;
    el.append(p);
    const tagRow = document.createElement('div'); tagRow.className = 'search-result-tags';
    (item.tags || []).forEach(t => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.setAttribute('aria-pressed',String(tags.has(t.toLowerCase())));
      b.addEventListener('click',() => toggle(t)); tagRow.append(b);
    });
    el.append(tagRow); return el;
  }
  function render() {
    syncButtons(); results.replaceChildren(); more.hidden = true;
    const q = normalize(input.value);
    retry.hidden = !q || !failed;
    if (q && !fuse) {
      status.textContent = failed
        ? 'La recherche n’a pas pu être chargée. Réessaie ou consulte la liste des articles.'
        : 'Chargement de la recherche…';
      return;
    }
    if (!q && !tags.size) { status.textContent = ''; return; }
    let found = q ? fuse.search(q).map(r => items[r.item.index]) : items.slice().sort((a,b) => new Date(b.date)-new Date(a.date));
    found = found.filter(item => [...tags].every(t => (item.tags || []).some(it => it.toLowerCase() === t)));
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
      const indexed = articles.map((item,index) => ({index,title:normalize(item.title),summary:normalize(item.summary),contents:normalize(item.contents),tags:(item.tags || []).map(normalize),categories:(item.categories || []).map(normalize)}));
      fuse = new Fuse(indexed,{keys:[{name:'title',weight:3},{name:'tags',weight:2},'categories','summary','contents'],threshold:.2,ignoreLocation:true});
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
  if (cloud) cloud.addEventListener('click',e => { const b = e.target.closest('[data-tag]'); if (b) toggle(b.dataset.tag); });
  clear?.addEventListener('click',() => { clearTimeout(timer); tags.clear(); input.value = ''; limit = 10; syncURL(); render(); input.focus(); });
  more.addEventListener('click',() => { limit += 10; render(); });
  retry.addEventListener('click',() => { failed = false; refresh(); });
  addEventListener('popstate',() => { clearTimeout(timer); fromURL(); limit = 10; refresh(); });
  fromURL(); refresh();
})();
