'use strict';
const { t, isEnglish, language } = CampusLanguage;
let buildings=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageUrl=s=>/^(\.\.?\/|data:image\/(png|jpeg|webp);base64,|https?:\/\/)/i.test(s||'')?esc(s):'';
const sourceUrl=s=>/^https?:\/\//i.test(s||'')?esc(s):'#';
const app=document.getElementById('app');
const buildingLink=b=>'#building/'+encodeURIComponent(b.id);
const coverImage = b => b.photo ? `<img src="${imageUrl(b.photo)}" alt="${esc(b.name)}" loading="lazy">` : `<span class="photo-placeholder">${esc(t("photoUnavailable"))}</span>`;
const cards=items=>items.map(b=>`<a class="building-card" href="${buildingLink(b)}"><div class="card-photo">${coverImage(b.cover ? {...b, photo: b.cover} : b)}</div><div class="card-copy"><h3>${esc(b.name)}<span aria-hidden="true">${siteIcon("arrow-right", 18)}</span></h3><p>${esc(b.summary||b.intro)}</p></div></a>`).join('');
const buildingCount = count => t(count === 1 ? 'countOne' : 'countMany', { count });
function crumb(name){return `<div class="breadcrumbs wrap"><a href="#home">${esc(t("home"))}</a><span>/</span>${name?'<a href="#buildings">'+esc(t('buildings'))+'</a><span>/</span><span>'+esc(name)+'</span>':'<span>'+esc(t('buildings'))+'</span>'}</div>`}

function renderDirectory() {
  app.innerHTML = crumb() + `
    <section class="directory-head wrap">
      <p class="section-kicker">${esc(t("guide"))}</p>
      <h1>${esc(t("buildings"))}</h1>
      <p>${esc(t("directoryDescription"))}</p>
      <form class="building-search" role="search">
        <div class="search-box">
          ${siteIcon("search", 20)}
          <input id="building-search" type="search" role="combobox" placeholder="${esc(t("searchPlaceholder"))}"
            aria-label="${esc(t("searchPlaceholder"))}" aria-autocomplete="list" aria-expanded="false"
            aria-controls="building-suggestions" autocomplete="off" enterkeyhint="search">
          <button id="clear-building-search" type="button" aria-label="${esc(t("clearSearch"))}"
            title="${esc(t("clearSearch"))}" disabled>${siteIcon("x", 20)}</button>
          <button type="submit">${esc(t("search"))}</button>
        </div>
        <ul id="building-suggestions" class="building-suggestions" role="listbox" aria-label="${esc(t("suggestions"))}" hidden></ul>
      </form>
    </section>
    <section class="wrap directory">
      <p id="result-count" class="result-count" role="status">${esc(buildingCount(buildings.length))}</p>
      <div class="building-grid" id="building-results">${cards(buildings)}</div>
    </section>`;
  document.title = t('buildings') + ' · ' + t('site');

  const form = app.querySelector('.building-search');
  const input = document.getElementById('building-search');
  const clear = document.getElementById('clear-building-search');
  const list = document.getElementById('building-suggestions');
  const count = document.getElementById('result-count');
  const results = document.getElementById('building-results');
  let candidates = [];
  let selected = -1;
  let composing = false;
  let hasSubmittedSearch = false;

  function normalizePinyin(value) {
    return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[\s'’-]/g, '');
  }

  function matches(term) {
    const query = term.trim().toLowerCase();
    const pinyinQuery = normalizePinyin(query);
    return buildings.filter(building => {
      if ([building.name, building.originalName, building.en, building.legacyEnglish, ...(building.aliases || [])].some(name => (name || '').toLowerCase().includes(query))) return true;
      if (!pinyinQuery || !building.pinyin) return false;
      const syllables = building.pinyin.trim().split(/\s+/);
      const initials = syllables.map(syllable => normalizePinyin(syllable).charAt(0)).join('');
      return normalizePinyin(building.pinyin).includes(pinyinQuery) || initials.startsWith(pinyinQuery);
    });
  }

  function closeSuggestions() {
    list.hidden = true;
    candidates = [];
    selected = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function showSuggestions() {
    closeSuggestions();
    clear.disabled = input.value === "";
    if (composing || !input.value.trim()) return;
    candidates = matches(input.value).slice(0, 6);
    if (!candidates.length) return;
    list.innerHTML = candidates.map((building, index) => `
      <li id="building-suggestion-${index}" role="option" aria-selected="false" data-index="${index}">
        ${siteIcon("search", 16)}<span>${esc(building.name)}</span>
      </li>`).join('');
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function showResults(candidate) {
    if (candidate) input.value = candidate.name;
    hasSubmittedSearch = Boolean(input.value.trim());
    const filtered = candidate ? [candidate] : matches(input.value);
    closeSuggestions();
    count.textContent = buildingCount(filtered.length);
    results.classList.add('search-results-enter');
    results.innerHTML = filtered.length
      ? cards(filtered)
      : `<p class="empty">${esc(t("noResults"))}</p>`;
  }

  clear.addEventListener('click', () => {
    input.value = '';
    input.focus();
    if (hasSubmittedSearch) showResults();
    else closeSuggestions();
    clear.disabled = true;
  });
  input.addEventListener('input', showSuggestions);
  input.addEventListener('focus', showSuggestions);
  input.addEventListener('compositionstart', () => {
    composing = true;
    closeSuggestions();
  });
  input.addEventListener('compositionend', () => {
    composing = false;
    showSuggestions();
  });
  input.addEventListener('keydown', event => {
    if (composing || event.isComposing || event.keyCode === 229) return;
    if (event.key === 'Escape' && !list.hidden) {
      event.preventDefault();
      closeSuggestions();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    if (list.hidden) showSuggestions();
    if (!candidates.length) return;
    event.preventDefault();
    if (selected < 0) selected = event.key === 'ArrowDown' ? 0 : candidates.length - 1;
    else selected = (selected + (event.key === 'ArrowDown' ? 1 : -1) + candidates.length) % candidates.length;
    Array.from(list.children).forEach((option, index) => {
      option.setAttribute('aria-selected', String(index === selected));
    });
    input.setAttribute('aria-activedescendant', list.children[selected].id);
  });
  list.addEventListener('mousedown', event => event.preventDefault());
  list.addEventListener('click', event => {
    const option = event.target.closest('[data-index]');
    if (option) showResults(candidates[Number(option.dataset.index)]);
  });
  form.addEventListener('focusout', event => {
    if (!form.contains(event.relatedTarget)) closeSuggestions();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!composing) showResults(candidates[selected]);
  });
}

function buildingMap(building) {
  const title = `<h2>${esc(t("mapLocation"))}</h2>`;
  if (!building.mapId) return title + `<p class="map-note">${esc(t("mapUnavailable"))}</p>`;
  const url = 'map.html?building=' + encodeURIComponent(building.mapId) + '&lang=' + language + '&v=0.4';
  return `<div class="map-heading">${title}<a class="inline-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(t("openMap"))} ${siteIcon("arrow-up-right")}</a></div>
    <p class="map-note">${esc(t("mapNote", { name: building.name }))}</p>
    <div class="map-panel"><iframe title="${esc(t("mapOf", { name: building.name }))}" src="${esc(url)}" loading="lazy"></iframe></div>`;
}

function relatedBuildings(currentId, limit = 3) {
  const candidates = buildings.filter(building => building.id !== currentId);
  const count = Math.min(limit, candidates.length);
  for (let index = 0; index < count; index++) {
    const selected = index + Math.floor(Math.random() * (candidates.length - index));
    [candidates[index], candidates[selected]] = [candidates[selected], candidates[index]];
  }
  return candidates.slice(0, count);
}

function render(){if(photoDialog.open)photoDialog.close();app.querySelector('.archive-carousel')?.swiper?.destroy();const hash=location.hash||'#home';const nfcId=new URLSearchParams(location.search).get('building');if(nfcId&&!location.hash){location.hash='building/'+encodeURIComponent(nfcId);return}let id;try{id=decodeURIComponent(hash.replace('#building/',''))}catch{id=''}const b=buildings.find(x=>x.id===id);const isHome=hash==='#home';document.querySelectorAll('[data-nav]').forEach(a=>{const current=a.dataset.nav===(isHome?'home':'buildings');a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
if(isHome){const hall=buildings.find(x=>x.id==='hall')||buildings[0];app.innerHTML=`<section class="home-hero"><img src="${imageUrl(hall.photo)}" alt="${esc(t("heroAlt"))}"><div class="hero-shade"></div><div class="home-hero-copy wrap"><p class="overline">${esc(t("campusAffiliation"))}</p><h1>${esc(t("welcome"))}</h1><p class="hero-description">${esc(t("heroDescription"))}</p><a class="button light" href="#buildings">${esc(t("startVisit"))} ${siteIcon("arrow-right")}</a></div><a class="photo-place" href="${buildingLink(hall)}">${esc(t("featured", { name: hall.name }))} ${siteIcon("arrow-right", 14)}</a></section><section class="visit-options wrap" aria-label="${esc(t("explore"))}"><a href="#buildings" class="visit-option"><span class="option-icon">${siteIcon("building", 36)}</span><div><h2>${esc(t("guide"))}</h2><p>${esc(t("guideDescription"))}</p></div><span class="option-arrow">${siteIcon("arrow-right", 22)}</span></a><div class="visit-option game-option"><span class="option-icon">${siteIcon("puzzle", 36)}</span><div><h2>${esc(t("game"))} <small>${esc(t("comingSoon"))}</small></h2><p>${esc(t("gameDescription"))}</p></div></div></section><section class="collection-section wrap"><div class="section-heading"><div><p class="section-kicker">${esc(t("visit"))}</p><h2>${esc(t("getStarted"))}</h2></div><a class="inline-link" href="#buildings">${esc(t("allBuildings"))} ${siteIcon("arrow-right")}</a></div>${recommendationRail(relatedBuildings(undefined, buildings.length))}</section>`;document.title=t('site');}
else if(hash==='#buildings'){renderDirectory()}
else if(b){document.title=b.name+' · '+t('site');app.innerHTML=crumb(b.name)+`<section class="building-hero${b.id === "hall" ? " tall-cover" : ""}${b.photo ? "" : " no-photo"}">${b.photo ? `<button id="view-photo" aria-label="${esc(t("photoOf", { name: b.name }))}"><img src="${imageUrl(b.photo)}" alt="${esc(b.photoCaption)}"></button>` : ""}<div class="hero-shade"></div><div class="building-hero-copy wrap"><p class="overline">${esc(t("campus"))}${b.number ? `<span class="hero-folio">${esc(t("folio", { number: b.number }))}</span>` : ''}</p><h1>${esc(b.name)}</h1>${!isEnglish && b.en?`<p class="building-english" lang="en">${esc(b.en)}</p>`:''}</div>${b.photo ? `<button class="enlarge-button" id="enlarge-photo" aria-label="${esc(t("enlargePhoto"))}">${esc(t("viewPhoto"))} ${siteIcon("maximize", 14)}</button>` : ""}</section><div class="detail-tabs"><nav class="wrap" aria-label="${esc(t("detailNavigation"))}"><a href="#overview" data-scroll="overview" class="current">${esc(t("overview"))}</a><a href="#stories" data-scroll="stories">${esc(t("history"))}</a><a href="#location" data-scroll="location">${esc(t("mapLocation"))}</a></nav></div><div class="detail-layout wrap"><div class="detail-main"><section id="overview" class="article-section"><h2>${esc(t("overview"))}</h2><p class="lead">${esc(b.intro)}</p></section><section id="stories" class="article-section"><h2>${esc(t("history"))}</h2>${b.sections.map(s=>`<article><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></article>`).join('')}${archiveGallery(b)}</section><section id="location" class="article-section">${buildingMap(b)}</section>${b.sources?.length?`<section class="article-section sources"><h2>${esc(t("references"))}</h2>${b.sources.filter(s=>s.title&&s.url).map(s=>`<a href="${sourceUrl(s.url)}" target="_blank" rel="noopener">${esc(s.title)} <span>${siteIcon("arrow-up-right", 14)}</span></a>`).join('')}</section>`:''}</div><aside class="detail-aside"><div class="fact-sheet"><h2>${esc(t("facts"))}</h2><dl>${b.facts.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl></div>${b.photo ? `<div class="aside-photo">${coverImage(b)}<p>${esc(b.photoCaption)}${b.photoCredit ? `<br>${esc(b.photoCredit)}` : ""}</p></div>` : ""}</aside></div><section class="related wrap"><div class="section-heading"><h2>${esc(t("keepExploring"))}</h2><a class="inline-link" href="#buildings">${esc(t("allBuildings"))} ${siteIcon("arrow-right")}</a></div>${recommendationRail(relatedBuildings(b.id))}<a class="return-link" href="#buildings">${siteIcon("arrow-left")} ${esc(t("returnToBuildings"))}</a></section>`;
mountArchiveGallery(b, app);
document.querySelectorAll('[data-scroll]').forEach(a=>a.onclick=ev=>{ev.preventDefault();document.getElementById(a.dataset.scroll).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.querySelectorAll('.detail-tabs a').forEach(t=>t.classList.toggle('current',t.dataset.scroll===a.dataset.scroll))});}
else{document.title=t('notFound')+' · '+t('site');app.innerHTML=`<section class="wrap directory-head"><h1>${esc(t("notFound"))}</h1><a class="inline-link" href="#buildings">${siteIcon("arrow-left")} ${esc(t("returnToBuildings"))}</a></section>`}window.scrollTo({top:0,behavior:'instant'});app.dispatchEvent(new Event('campus:render'))}
function recommendationRail(items) {
  const previous = isEnglish ? 'Previous building' : '上一座建筑';
  const next = isEnglish ? 'Next building' : '下一座建筑';
  return `<div class="recommendation-rail">
    <div class="recommendation-track" tabindex="0" aria-label="${isEnglish ? 'Recommended buildings' : '推荐建筑'}">${cards(items)}</div>
    <div class="recommendation-controls">
      <button type="button" data-step="-1" aria-label="${previous}">${siteIcon('arrow-left', 18)}</button>
      <button type="button" data-step="1" aria-label="${next}">${siteIcon('arrow-right', 18)}</button>
    </div>
  </div>`;
}

function mountRecommendationRail() {
  const rail = app.querySelector('.recommendation-rail');
  if (!rail) return;
  const track = rail.querySelector('.recommendation-track');
  const slides = [...track.querySelectorAll('.building-card')];
  const buttons = [...rail.querySelectorAll('[data-step]')];
  let active = 0;
  const select = index => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const offset = (i - active + slides.length) % slides.length;
      slide.dataset.position = offset === 0 ? 'front'
        : offset === 1 ? 'right'
        : offset === slides.length - 1 ? 'left' : 'behind';
      slide.setAttribute('aria-hidden', String(slide.dataset.position === 'behind'));
      slide.tabIndex = i === active ? 0 : -1;
    });
  };
  slides.forEach((slide, i) => {
    slide.onclick = event => {
      if (i === active) return;
      event.preventDefault();
      select(i);
      slides[i].focus({ preventScroll: true });
    };
  });
  for (const button of buttons) {
    button.disabled = slides.length < 2;
    button.onclick = () => select(active + Number(button.dataset.step));
  }
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || slides.length < 2) return;
    event.preventDefault();
    select(active + (event.key === 'ArrowRight' ? 1 : -1));
    slides[active].focus({ preventScroll: true });
  });
  if (slides.length) select(0);
}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let routeFade;
let sectionObserver;

function showRoute() {
  sectionObserver?.disconnect();
  render();
  mountRecommendationRail();
  if (reducedMotion.matches) return;

  const blocks = app.querySelectorAll([
    '.breadcrumbs', '.home-hero', '.visit-option', '.section-heading',
    '.directory-head', '.directory .building-card', '.building-hero',
    '.detail-tabs', '.fact-sheet', '.aside-photo', '.article-section',
    '.recommendation-rail', '.return-link'
  ].join(','));
  const reveal = (block, index) => {
    block.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 250,
      delay: Math.min(index, 5) * 35,
      easing: 'ease-out',
      fill: 'backwards'
    });
  };
  sectionObserver = new IntersectionObserver((entries, observer) => {
    let index = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (!reducedMotion.matches) reveal(entry.target, index++);
    }
  });

  let visibleIndex = 0;
  for (const block of blocks) {
    const bounds = block.getBoundingClientRect();
    if (bounds.top < innerHeight && bounds.bottom > 0) reveal(block, visibleIndex++);
    else sectionObserver.observe(block);
  }
}

async function transitionRoute() {
  if (!buildings.length) return;
  routeFade?.cancel();
  if (reducedMotion.matches || !app.firstElementChild) {
    showRoute();
    return;
  }
  const fade = app.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 125,
    easing: 'ease-in',
    fill: 'forwards'
  });
  routeFade = fade;
  try {
    await fade.finished;
  } catch {
    return;
  }
  try {
    showRoute();
  } finally {
    fade.cancel();
    routeFade = undefined;
  }
}
window.addEventListener('hashchange', transitionRoute);
function setBuildingData(records) {
  buildings = records.map(localizeBuilding);
  showRoute();
}

function localizeBuilding(building) {
  const translation = englishBuildings[building.id];
  if (!translation) {
    if (!isEnglish) return building;
    const factLabels = {
      落成年份: 'Completed',
      建筑印象: 'Architectural Features',
      结构体量: 'Structure and Size',
      现状: 'Current Use'
    };
    const facts = building.facts.map(fact => ({ ...fact, label: factLabels[fact.label] || fact.label }));
    return { ...building, originalName: building.name, name: building.en || building.name, facts };
  }
  const names = { originalName: building.name, legacyEnglish: building.en, en: translation.name, pinyin: building.pinyin || translation.pinyin };
  if (!isEnglish) return { ...building, ...names };
  const { sourceTitles, pinyin, ...english } = translation;
  const sources = building.sources?.map((source, index) => ({
    ...source, title: sourceTitles[index] || source.title
  }));
  return { ...building, ...names, ...english, sources };
}
setBuildingData(window.CAMPUS_PUBLISHED_BUILDINGS);
