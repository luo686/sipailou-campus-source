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
    const { tab: activeTab, tabIndex } = chapters[index];
    rail.style.setProperty('--chapter-index', index);
    tabs.style.setProperty('--chapter-index', tabIndex);
    for (const tab of tabs.querySelectorAll('[data-scroll]')) {
      tab.classList.toggle('current', tab === activeTab);
      if (tab === activeTab) tab.setAttribute('aria-current', 'location');
      else tab.removeAttribute('aria-current');
    }
    chapters.forEach(({ button }, chapterIndex) => {
      if (index === chapterIndex) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
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

  function addChapter(list, label, section, tab, tabIndex) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
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
    chapters.push({ tab, tabIndex, button, section });
    return row;
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

    for (const [tabIndex, tab] of Array.from(tabs.querySelectorAll('[data-scroll]')).entries()) {
      const section = document.getElementById(tab.dataset.scroll);
      if (!section) continue;
      const row = addChapter(list, tab.textContent, section, tab, tabIndex);
      if (section.id !== 'stories') continue;
      const headings = section.querySelectorAll(':scope > article > h3, :scope > .archive-gallery > h3');
      if (!headings.length) continue;
      const sublist = document.createElement('ul');
      sublist.className = 'chapter-sublist';
      row.append(sublist);
      for (const heading of headings) {
        addChapter(sublist, heading.textContent, heading, tab, tabIndex);
      }
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
