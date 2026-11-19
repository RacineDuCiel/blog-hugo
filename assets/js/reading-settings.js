(function () {
  'use strict';

  const widget = document.querySelector('[data-reading-settings]');
  if (!widget) return;

  const root = document.documentElement;
  const toggle = widget.querySelector('.reading-settings-toggle');
  const panel = widget.querySelector('.reading-settings-panel');
  const size = panel.querySelector('#reading-size');
  const ranges = [...panel.querySelectorAll('[data-rs-scale]')];
  const rangeValues = new Map(ranges.map(range => [range, panel.querySelector('output[for="' + range.id + '"]')]));
  const decrease = panel.querySelector('[data-rs-size="dec"]');
  const increase = panel.querySelector('[data-rs-size="inc"]');
  const font = panel.querySelector('#reading-font');
  const spacing = [...panel.querySelectorAll('[name="reading-spacing"]')];
  const hasPopover = typeof panel.showPopover === 'function';
  const desktop = matchMedia('(min-width: 761px)');

  const fontKey = 'reading-font-family';
  const spacingKey = 'reading-line-spacing';

  function save(key, value) {
    try {
      if (value === '') localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (_) {}
  }

  function updateScale(range) {
    const percent = range.valueAsNumber;
    const property = '--' + range.dataset.rsScale;
    if (range.value === range.defaultValue) root.style.removeProperty(property);
    else root.style.setProperty(property, percent / 100);
    rangeValues.get(range).value = percent + '\u00a0%';
    range.setAttribute('aria-valuetext', percent + ' %');
    if (range === size) {
      decrease.setAttribute('aria-disabled', String(percent <= Number(size.min)));
      increase.setAttribute('aria-disabled', String(percent >= Number(size.max)));
    }
  }

  function saveScale(range) {
    save(range.dataset.rsScale, range.value === range.defaultValue ? '' : String(range.valueAsNumber / 100));
  }

  function setChoice(name, key, value) {
    if (value) root.dataset[name] = value;
    else delete root.dataset[name];
    save(key, value);
  }

  for (const range of ranges) {
    const savedScale = Number(root.style.getPropertyValue('--' + range.dataset.rsScale));
    range.value = savedScale ? Math.round(savedScale * 100) : range.defaultValue;
    updateScale(range);
    range.addEventListener('input', () => updateScale(range));
    range.addEventListener('change', () => {
      saveScale(range);
      if (range !== size) schedulePosition();
    });
  }
  font.value = root.dataset.readingFont || '';
  for (const option of spacing) option.checked = option.value === (root.dataset.readingSpacing || '');

  for (const [button, direction] of [[decrease, -1], [increase, 1]]) {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      size.stepUp(direction);
      updateScale(size);
      saveScale(size);
    });
  }

  font.addEventListener('change', () => setChoice('readingFont', fontKey, font.value));
  for (const option of spacing) {
    option.addEventListener('change', () => setChoice('readingSpacing', spacingKey, option.value));
  }

  panel.querySelector('[data-rs-reset]').addEventListener('click', () => {
    for (const range of ranges) {
      range.value = range.defaultValue;
      updateScale(range);
      saveScale(range);
    }
    font.value = '';
    setChoice('readingFont', fontKey, '');
    for (const option of spacing) option.checked = option.defaultChecked;
    setChoice('readingSpacing', spacingKey, '');
    schedulePosition();
  });

  function isOpen() {
    return hasPopover ? panel.matches(':popover-open') : !panel.hidden;
  }

  function positionPanel() {
    if (!desktop.matches) return;
    const anchor = toggle.getBoundingClientRect();
    const gutter = 12;
    const maxLeft = root.clientWidth - panel.offsetWidth - gutter;
    const maxTop = root.clientHeight - panel.offsetHeight - gutter;
    const below = anchor.bottom + 8;
    const above = anchor.top - panel.offsetHeight - 8;
    const top = below <= maxTop ? below : above;
    panel.style.setProperty('--rs-left', Math.max(gutter, Math.min(maxLeft, anchor.right - panel.offsetWidth)) + 'px');
    panel.style.setProperty('--rs-top', Math.max(gutter, Math.min(maxTop, top)) + 'px');
  }

  let positionFrame = 0;
  function schedulePosition() {
    if (positionFrame || !isOpen()) return;
    positionFrame = requestAnimationFrame(() => {
      positionFrame = 0;
      if (isOpen()) positionPanel();
    });
  }

  function closePanel(restoreFocus) {
    if (!isOpen()) return;
    if (hasPopover) panel.hidePopover();
    else panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', event => {
    event.preventDefault();
    if (isOpen()) {
      closePanel(true);
      return;
    }
    if (hasPopover) panel.showPopover({ source: toggle });
    else panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    positionPanel();
    panel.scrollTop = 0;
    size.focus({ preventScroll: true });
  });

  panel.querySelector('.rs-close').addEventListener('click', () => closePanel(true));
  let tabbing = false;
  widget.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      tabbing = true;
      requestAnimationFrame(() => { tabbing = false; });
    } else if (!hasPopover && event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      closePanel(true);
    }
  });
  widget.addEventListener('focusout', event => {
    if (tabbing && !widget.contains(event.relatedTarget)) closePanel(false);
  });

  if (hasPopover) {
    panel.hidden = false;
    panel.addEventListener('beforetoggle', event => {
      toggle.setAttribute('aria-expanded', String(event.newState === 'open'));
    });
  } else {
    panel.removeAttribute('popover');
    document.addEventListener('click', event => {
      if (!widget.contains(event.target)) closePanel(false);
    });
  }

  window.addEventListener('scroll', schedulePosition, { passive: true });
  window.addEventListener('resize', schedulePosition, { passive: true });
  widget.dataset.ready = '';
})();
