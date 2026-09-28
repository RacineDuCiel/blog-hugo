(function () {
  'use strict';
  const article = document.querySelector('.prose');
  if (!article) return;
  const bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.setAttribute('role','progressbar'); bar.setAttribute('aria-label','Progression de lecture');
  bar.setAttribute('aria-valuemin','0'); bar.setAttribute('aria-valuemax','100');
  document.body.prepend(bar);
  let pending = false;
  function update() {
    pending = false;
    const bounds = article.getBoundingClientRect();
    const distance = bounds.height - window.innerHeight;
    const value = distance > 0 ? Math.max(0,Math.min(100,-bounds.top / distance * 100)) : (bounds.bottom <= window.innerHeight ? 100 : 0);
    bar.style.width = value + '%'; bar.setAttribute('aria-valuenow',String(Math.round(value)));
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  addEventListener('scroll',schedule,{passive:true}); addEventListener('resize',schedule,{passive:true});
  new ResizeObserver(schedule).observe(article);
  update();
})();
