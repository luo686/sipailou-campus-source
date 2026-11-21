'use strict';

(() => {
  const app = document.getElementById('app');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let chapters = [];
  let rail;
  let tabs;
  let activeIndex = -1;
  let pendingFrame = 0;

  function highlight(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    rail.style.setProperty('--chapter-index', index);
    tabs.style.setProperty('--chapter-index', index);
    chapters.forEach(({ tab, button }, chapterIndex) => {
      const current = index === chapterIndex;
      tab.classList.toggle('current', current);
      for (const control of [tab, button]) {
        if (current) control.setAttribute('aria-current', 'location');
        else control.removeAttribute('aria-current');
      }
    });
  }

  function updateFromScroll() {
    pendingFrame = 0;
    if (!chapters.length) return;
    const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const readingLine = scrollPadding + 12;
    let index = 0;
    for (const [chapterIndex, { section }] of chapters.entries()) {
      if (section.getBoundingClientRect().top <= readingLine) index = chapterIndex;
    }
    highlight(index);
  }

  function scheduleUpdate() {
    if (chapters.length && !pendingFrame) pendingFrame = requestAnimationFrame(updateFromScroll);
  }

  function mount() {
    chapters = [];
    activeIndex = -1;
    app.classList.remove('chapter-trial-active');
    const layout = app.querySelector('.detail-layout');
    if (!layout) return;
    tabs = app.querySelector('.detail-tabs nav');
    if (!tabs) return;

    rail = document.createElement('nav');
    rail.className = 'chapter-rail';
    rail.setAttribute('aria-label', CampusLanguage.t('contents'));
    const label = document.createElement('p');
    label.className = 'chapter-rail-label';
    label.textContent = CampusLanguage.t('contents');
    const list = document.createElement('ul');
    list.className = 'chapter-rail-list';
    rail.append(label, list);
    const guide = document.createElement('li');
    guide.className = 'chapter-hover-guide';
    guide.setAttribute('aria-hidden', 'true');

    for (const tab of tabs.querySelectorAll('[data-scroll]')) {
      const section = document.getElementById(tab.dataset.scroll);
      if (!section) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = tab.textContent;
      const index = chapters.length;
      const pointToRow = () => {
        rail.style.setProperty('--chapter-hover-index', index);
        rail.classList.add('chapter-hover');
      };
      button.addEventListener('pointerenter', pointToRow);
      button.addEventListener('focus', pointToRow);
      button.addEventListener('pointerleave', () => rail.classList.remove('chapter-hover'));
      button.addEventListener('blur', () => rail.classList.remove('chapter-hover'));
      button.addEventListener('click', () => {
        section.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      });
      const row = document.createElement('li');
      row.append(button);
      list.append(row);
      chapters.push({ tab, button, section });
    }

    if (!chapters.length) return;
    list.append(guide);
    layout.prepend(rail);
    app.classList.add('chapter-trial-active');
    highlight(0);
    scheduleUpdate();
  }

  app.addEventListener('campus:render', mount);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  mount();
})();
