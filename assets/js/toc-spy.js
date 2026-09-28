(function () {
  'use strict';
  const article = document.querySelector('.prose');
  const links = [...document.querySelectorAll('.toc-nav a')];
  if (!article || !links.length) return;
  const headings = [...article.querySelectorAll('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]')];
  const fab = document.querySelector('.toc-fab');
  const dialog = document.getElementById('toc-dialog');
  const mobile = matchMedia('(max-width: 1199px)');
  let active, pending = false, previousOverflow = '';
  function update() {
    pending = false;
    let current = headings[0];
    for (const h of headings) { if (h.getBoundingClientRect().top <= 100) current = h; else break; }
    if (current && current.id !== active) {
      active = current.id;
      links.forEach(a => {
        const selected = decodeURIComponent(a.hash.slice(1)) === active;
        if (selected) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        if (selected && a.closest('.toc-sidebar')) {
          let parent = a.parentElement;
          while (parent && !parent.classList.contains('toc-nav')) {
            if (parent.tagName === 'DETAILS') parent.open = true;
            parent = parent.parentElement;
          }
        }
      });
    }
    if (fab) fab.hidden = !mobile.matches || window.scrollY < 300;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  if (fab && dialog) {
    fab.addEventListener('click', () => { previousOverflow = document.body.style.overflow; dialog.showModal(); document.body.style.overflow = 'hidden'; });
    dialog.querySelector('.toc-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) { const b = dialog.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; fab.focus({preventScroll:true}); });
    dialog.querySelectorAll('a').forEach(a => a.addEventListener('click', () => dialog.close()));
    mobile.addEventListener('change', () => { if (!mobile.matches && dialog.open) dialog.close(); });
  }
  update();
})();
