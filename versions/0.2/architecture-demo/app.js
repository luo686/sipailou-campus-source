'use strict';
const { t, isEnglish, language } = CampusLanguage;
let buildings=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageUrl=s=>/^(\/assets\/photos\/|\.\.?\/|data:image\/(png|jpeg|webp);base64,|https?:\/\/)/i.test(s||'')?esc(s):'';
const sourceUrl=s=>/^https?:\/\//i.test(s||'')?esc(s):'#';
const app=document.getElementById('app');
const buildingLink=b=>'#building/'+encodeURIComponent(b.id);
const cards=items=>items.map(b=>`<a class="building-card" href="${buildingLink(b)}"><div class="card-photo"><img src="${imageUrl(b.photo)}" alt="${esc(b.name)}" loading="lazy"></div><div class="card-copy"><h3>${esc(b.name)}<span aria-hidden="true">${siteIcon("arrow-right", 18)}</span></h3><p>${esc(b.summary||b.intro)}</p></div></a>`).join('');
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
          <button id="clear-building-search" type="button" disabled>${esc(t("clearSearch"))}</button>
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

  function normalizePinyin(value) {
    return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[\s'’-]/g, '');
  }

  function matches(term) {
    const query = term.trim().toLowerCase();
    const pinyinQuery = normalizePinyin(query);
    return buildings.filter(building => {
      if ([building.name, building.originalName, building.en, building.legacyEnglish].some(name => (name || '').toLowerCase().includes(query))) return true;
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
    showResults();
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

function render(){const hash=location.hash||'#home';const nfcId=new URLSearchParams(location.search).get('building');if(nfcId&&!location.hash){location.hash='building/'+encodeURIComponent(nfcId);return}let id;try{id=decodeURIComponent(hash.replace('#building/',''))}catch{id=''}const b=buildings.find(x=>x.id===id);const isHome=hash==='#home';document.querySelectorAll('[data-nav]').forEach(a=>{const current=a.dataset.nav===(isHome?'home':'buildings');a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
if(isHome){const hall=buildings.find(x=>x.id==='hall')||buildings[0];app.innerHTML=`<section class="home-hero"><img src="${imageUrl(hall.photo)}" alt="${esc(t("heroAlt"))}"><div class="hero-shade"></div><div class="home-hero-copy wrap"><p class="overline">${esc(t("campusAffiliation"))}</p><h1>${esc(t("welcome"))}</h1><p class="hero-description">${esc(t("heroDescription"))}</p><a class="button light" href="#buildings">${esc(t("startVisit"))} ${siteIcon("arrow-right")}</a></div><a class="photo-place" href="${buildingLink(hall)}">${esc(t("featured", { name: hall.name }))} ${siteIcon("arrow-right", 14)}</a></section><section class="visit-options wrap" aria-label="${esc(t("explore"))}"><a href="#buildings" class="visit-option"><span class="option-icon">${siteIcon("building", 36)}</span><div><h2>${esc(t("guide"))}</h2><p>${esc(t("guideDescription"))}</p></div><span class="option-arrow">${siteIcon("arrow-right", 22)}</span></a><div class="visit-option game-option"><span class="option-icon">${siteIcon("puzzle", 36)}</span><div><h2>${esc(t("game"))} <small>${esc(t("comingSoon"))}</small></h2><p>${esc(t("gameDescription"))}</p></div></div></section><section class="collection-section wrap"><div class="section-heading"><div><p class="section-kicker">${esc(t("visit"))}</p><h2>${esc(t("getStarted"))}</h2></div><a class="inline-link" href="#buildings">${esc(t("allBuildings"))} ${siteIcon("arrow-right")}</a></div><div class="building-grid">${cards(buildings.slice(0,3))}</div></section>`;document.title=t('site');}
else if(hash==='#buildings'){renderDirectory()}
else if(b){document.title=b.name+' · '+t('site');const mapUrl='map.html?building='+encodeURIComponent(b.mapId)+'&lang='+language+'&v=0.2';app.innerHTML=crumb(b.name)+`<section class="building-hero"><button id="view-photo" aria-label="${esc(t("photoOf", { name: b.name }))}"><img src="${imageUrl(b.photo)}" alt="${esc(b.photoCaption)}"></button><div class="hero-shade"></div><div class="building-hero-copy wrap"><p class="overline">${esc(t("campus"))}${b.number ? `<span class="hero-folio">${esc(t("folio", { number: b.number }))}</span>` : ''}</p><h1>${esc(b.name)}</h1>${!isEnglish && b.en?`<p class="building-english" lang="en">${esc(b.en)}</p>`:''}</div><button class="enlarge-button" id="enlarge-photo" aria-label="${esc(t("enlargePhoto"))}">${esc(t("viewPhoto"))} ${siteIcon("maximize", 14)}</button></section><div class="detail-tabs"><nav class="wrap" aria-label="${esc(t("detailNavigation"))}"><a href="#overview" data-scroll="overview" class="current">${esc(t("overview"))}</a><a href="#stories" data-scroll="stories">${esc(t("history"))}</a><a href="#location" data-scroll="location">${esc(t("mapLocation"))}</a></nav></div><div class="detail-layout wrap"><div class="detail-main"><section id="overview" class="article-section"><h2>${esc(t("overview"))}</h2><p class="lead">${esc(b.intro)}</p></section><section id="stories" class="article-section"><h2>${esc(t("history"))}</h2>${b.sections.map(s=>`<article><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></article>`).join('')}</section><section id="location" class="article-section"><div class="map-heading"><h2>${esc(t("mapLocation"))}</h2><a class="inline-link" href="${esc(mapUrl)}" target="_blank" rel="noopener">${esc(t("openMap"))} ${siteIcon("arrow-up-right")}</a></div><p class="map-note">${esc(t("mapNote", { name: b.name }))}</p><div class="map-panel"><iframe title="${esc(t("mapOf", { name: b.name }))}" src="${esc(mapUrl)}" loading="lazy"></iframe><span class="map-tag">${siteIcon("map-pin", 14)} ${esc(b.name)}</span></div></section>${b.sources?.length?`<section class="article-section sources"><h2>${esc(t("references"))}</h2>${b.sources.filter(s=>s.title&&s.url).map(s=>`<a href="${sourceUrl(s.url)}" target="_blank" rel="noopener">${esc(s.title)} <span>${siteIcon("arrow-up-right", 14)}</span></a>`).join('')}</section>`:''}</div><aside class="detail-aside"><div class="fact-sheet"><h2>${esc(t("facts"))}</h2><dl>${b.facts.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl></div><div class="aside-photo"><img src="${imageUrl(b.photo)}" alt="${esc(b.name)}" loading="lazy"><p>${esc(b.photoCaption)}</p></div></aside></div><section class="related wrap"><div class="section-heading"><h2>${esc(t("keepExploring"))}</h2><a class="inline-link" href="#buildings">${esc(t("allBuildings"))} ${siteIcon("arrow-right")}</a></div><div class="building-grid">${cards(buildings.filter(x=>x.id!==b.id).slice(0,3))}</div><a class="return-link" href="#buildings">${siteIcon("arrow-left")} ${esc(t("returnToBuildings"))}</a></section>`;
const openPhoto=()=>{document.getElementById('large-photo').src=b.photo;document.getElementById('large-photo').alt=b.photoCaption;document.getElementById('photo-dialog').showModal()};document.getElementById('view-photo').onclick=openPhoto;document.getElementById('enlarge-photo').onclick=openPhoto;document.querySelectorAll('[data-scroll]').forEach(a=>a.onclick=ev=>{ev.preventDefault();document.getElementById(a.dataset.scroll).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.querySelectorAll('.detail-tabs a').forEach(t=>t.classList.toggle('current',t.dataset.scroll===a.dataset.scroll))});}
else{document.title=t('notFound')+' · '+t('site');app.innerHTML=`<section class="wrap directory-head"><h1>${esc(t("notFound"))}</h1><a class="inline-link" href="#buildings">${siteIcon("arrow-left")} ${esc(t("returnToBuildings"))}</a></section>`}window.scrollTo({top:0,behavior:'instant'});app.dispatchEvent(new Event('campus:render'))}
document.getElementById('close-photo').onclick=()=>document.getElementById('photo-dialog').close();document.getElementById('photo-dialog').onclick=ev=>{if(ev.target===ev.currentTarget)ev.currentTarget.close()};window.addEventListener('hashchange',()=>{if(buildings.length)render()});
function setBuildingData(records) {
  buildings = records.map(localizeBuilding);
  render();
}

function localizeBuilding(building) {
  const translation = englishBuildings[building.id];
  if (!translation) return building;
  const names = { originalName: building.name, legacyEnglish: building.en, en: translation.name, pinyin: building.pinyin || translation.pinyin };
  if (!isEnglish) return { ...building, ...names };
  const { sourceTitles, pinyin, ...english } = translation;
  const sources = building.sources?.map((source, index) => ({
    ...source, title: sourceTitles[index] || source.title
  }));
  return { ...building, ...names, ...english, sources };
}
setBuildingData(window.ARCHIVED_BUILDINGS);