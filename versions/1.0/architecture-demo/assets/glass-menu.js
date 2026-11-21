(() => {
  'use strict';
  const toggle = document.getElementById('glass-toggle');
  const panel = document.getElementById('glass-panel');
  const links = [...panel.querySelectorAll('a')];
  const background = [...document.querySelectorAll('#app, .site-footer, .identity, .header-links, .header-search, .bottom-navigation')];
  const english = CampusLanguage.isEnglish;
  const names = english ? ['Buildings', 'Distinguished Alumni', 'Game · Coming soon'] : ['建筑', '杰出校友', '游戏 · 筹备中'];
  links.forEach((link, index) => { link.textContent = names[index]; });
  panel.setAttribute('aria-label', english ? 'Site navigation' : '栏目导航');
  let opened = false;
  function setOpen(value) {
    opened = value;
    document.body.classList.toggle('menu-open', value);
    toggle.setAttribute('aria-expanded', String(value));
    toggle.setAttribute('aria-label', english ? (value ? 'Close menu' : 'Open menu') : (value ? '关闭菜单' : '打开菜单'));
    panel.inert = !value;
    if (!value && panel.contains(document.activeElement)) toggle.focus({ preventScroll: true });
    panel.setAttribute('aria-hidden', String(!value));
    background.forEach(element => { element.inert = value; });
    if (value) links[0].focus({ preventScroll: true });
  }
  function updateCurrent() {
    const route = location.hash.startsWith('#building/') ? '#buildings' : location.hash.split('/')[0];
    links.forEach(link => {
      if (link.hash === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  toggle.addEventListener('click', () => setOpen(!opened));
  links.forEach(link => link.addEventListener('click', () => setOpen(false)));
  panel.addEventListener('click', event => { if (event.target === panel) setOpen(false); });
  window.addEventListener('hashchange', () => { setOpen(false); updateCurrent(); });
  document.addEventListener('keydown', event => {
    if (!opened) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); toggle.focus({ preventScroll: true }); }
    if (event.key === 'Tab') {
      const focusable = [toggle, ...links];
      const index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); links.at(-1).focus(); }
      else if (!event.shiftKey && (index === focusable.length - 1 || index < 0)) { event.preventDefault(); toggle.focus(); }
    }
  });
  setOpen(false);
  updateCurrent();
})();
