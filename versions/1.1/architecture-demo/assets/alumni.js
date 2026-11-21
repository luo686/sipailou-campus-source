'use strict';

const alumniPalette = ['#684642', '#394b5a', '#78684c', '#394e47', '#64525d', '#514d60', '#555b49', '#765244', '#3e4858'];
const alumniColor = person => alumniPalette[(Number(person.id) - 1) % alumniPalette.length];
const alumniField = person => alumniFields[person.group][isEnglish ? 1 : 0];
const alumniLink = person => '#alumni/' + person.id;

function alumniBook(person) {
  const cover = person.photo
    ? `<img src="assets/alumni-portraits/${person.id}.webp" alt="" draggable="false">`
    : `<span class="alumni-monogram" aria-hidden="true">${esc(person.name.slice(0, 1))}</span>`;
  return `<span class="alumni-book" aria-hidden="true">
    <span class="alumni-back-cover"></span>
    <span class="alumni-pages alumni-pages-edge"></span>
    <span class="alumni-pages alumni-pages-top"></span>
    <span class="alumni-pages alumni-pages-bottom"></span>
    <span class="alumni-spine">${esc(person.name)}</span>
    <span class="alumni-title-page"><strong>${esc(person.name)}</strong><small>${esc(alumniField(person))}</small></span>
    <span class="alumni-hinge">
      <span class="alumni-endpaper"></span>
      <span class="alumni-cover">${cover}<span class="alumni-caption"><strong>${esc(person.name)}</strong><small>${esc(alumniField(person))}</small></span></span>
    </span>
  </span>`;
}

function renderAlumniProfile(person) {
  const title = isEnglish ? 'Alumni & Faculty' : '杰出校友';
  const intro = isEnglish ? 'Profile' : '人物介绍';
  const connection = isEnglish ? 'University connection' : '与学校的关系';
  const sources = t('references');
  const sections = [
    ['overview', intro, `<p class="lead" lang="zh-CN">${esc(person.bio)}</p>`],
    ['connection', connection, `<p lang="zh-CN">${esc(person.affiliation)}</p>`],
    ['sources', sources, `<p lang="zh-CN">《东南大学校史沿革与知名校友》</p>
      ${person.source ? `<a href="${sourceUrl(person.source)}" target="_blank" rel="noopener">${isEnglish ? 'Biography source' : '人物资料来源'} ↗</a>` : ''}
      ${person.photo ? `<a href="${sourceUrl(person.photo)}" target="_blank" rel="noopener">${isEnglish ? 'Portrait source' : '肖像来源'} ↗</a>` : `<p>${isEnglish ? 'Portrait pending verification' : '肖像待核实'}</p>`}`],
  ];
  document.title = person.name + ' · ' + t('site');
  app.innerHTML = `
    <div class="breadcrumbs wrap"><a href="#home">${esc(t('home'))}</a><span>/</span><a href="#alumni">${title}</a><span>/</span><span>${esc(person.name)}</span></div>
    <section class="building-hero tall-cover alumni-hero" style="--ink:${alumniColor(person)}" aria-labelledby="alumni-profile-name">
      <div class="building-hero-copy wrap"><p class="overline">${esc(alumniField(person))}</p><h1 id="alumni-profile-name">${esc(person.name)}</h1></div>
      <div class="alumni-hero-book">${alumniBook(person)}</div>
    </section>
    <div class="detail-tabs"><nav class="wrap" aria-label="${intro}">
      ${sections.map(([id, label], index) => `<a href="#${id}" data-scroll="${id}"${index ? '' : ' class="current"'}>${label}</a>`).join('')}
    </nav></div>
    <div class="detail-layout wrap">
      <div class="detail-main">${sections.map(([id, label, content]) => `<section id="${id}" class="article-section${id === 'sources' ? ' sources' : ''}"><h2>${label}</h2>${content}</section>`).join('')}</div>
      <aside class="detail-aside">
        <div class="fact-sheet"><h2>${isEnglish ? 'At a glance' : '人物档案'}</h2><dl>
          <div><dt>${isEnglish ? 'Field' : '领域'}</dt><dd>${esc(alumniField(person))}</dd></div>
          <div><dt>${connection}</dt><dd lang="zh-CN">${esc(person.affiliation)}</dd></div>
        </dl></div>
        ${person.photo ? `<div class="aside-photo"><img src="assets/alumni-portraits/${person.id}.webp" alt="${esc(person.name)}" loading="lazy"></div>` : ''}
      </aside>
    </div>
    <section class="related wrap"><a class="return-link" href="#alumni">${siteIcon('arrow-left')} ${isEnglish ? 'Back to the record shelf' : '返回校友唱片馆'}</a></section>`;
  for (const tab of app.querySelectorAll('[data-scroll]')) {
    tab.onclick = event => {
      event.preventDefault();
      document.getElementById(tab.dataset.scroll).scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
      for (const link of app.querySelectorAll('[data-scroll]')) link.classList.toggle('current', link === tab);
    };
  }
}

function renderAlumni() {
  const title = isEnglish ? 'Alumni Record Archive' : '校友唱片馆';
  document.title = title + ' · ' + t('site');
  const frame = document.createElement('iframe');
  frame.className = 'alumni-records-frame';
  frame.title = title;
  frame.src = 'alumni-records/index.html?guide&lang=' + (isEnglish ? 'en' : 'zh-CN');
  app.replaceChildren(frame);
}
