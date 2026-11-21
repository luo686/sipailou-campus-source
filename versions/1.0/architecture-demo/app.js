'use strict';
const { t, isEnglish, language } = CampusLanguage;
let buildings=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageUrl=s=>/^(\.\.?\/|data:image\/(png|jpeg|webp);base64,|https?:\/\/)/i.test(s||'')?esc(s):'';
const sourceUrl=s=>/^https?:\/\//i.test(s||'')?esc(s):'#';
const app=document.getElementById('app');
const buildingLink=b=>'#building/'+encodeURIComponent(b.id);
const coverImage = b => b.photo ? `<img ${CampusMedia.attributes(b.photo)} alt="${esc(b.name)}" loading="lazy" decoding="async">` : `<span class="photo-placeholder">${esc(t("photoUnavailable"))}</span>`;
const cards=items=>items.map(b=>`<a class="building-card" href="${buildingLink(b)}"><div class="card-photo">${coverImage(b.cover ? {...b, photo: b.cover} : b)}</div><div class="card-copy"><h3>${esc(b.name)}<span aria-hidden="true">${siteIcon("arrow-right", 18)}</span></h3><p>${esc(b.summary||b.intro)}</p></div></a>`).join('');
function crumb(name){return `<div class="breadcrumbs wrap"><a href="#home">${esc(t("home"))}</a><span>/</span>${name?'<a href="#buildings">'+esc(t('buildings'))+'</a><span>/</span><span>'+esc(name)+'</span>':'<span>'+esc(t('buildings'))+'</span>'}</div>`}

function renderDirectory() {
  app.innerHTML = '<section class="building-rack" aria-labelledby="building-rack-title"></section>';
  mountBuildingRack(app.querySelector('.building-rack'), buildings, { isEnglish, buildingLink });
  document.title = t('buildings') + ' · ' + t('site');
}

function buildingMap(building) {
  const title = `<h2>${esc(t("mapLocation"))}</h2>`;
  if (!building.mapId) return title + `<p class="map-note">${esc(t("mapUnavailable"))}</p>`;
  const url = 'map.html?building=' + encodeURIComponent(building.mapId) + '&lang=' + language + '&v=1.1';
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

function render(){if(location.hash==='#history')history.replaceState(history.state,'','#home');app.querySelector('.alumni-room')?.dispose?.();app.querySelector('.hall-tour')?.dispose?.();app.querySelector('.building-rack')?.dispose?.();if(photoDialog.open)photoDialog.close();app.querySelector('.archive-gallery')?.dispose?.();const hash=location.hash||'#home';const nfcId=new URLSearchParams(location.search).get('building');if(nfcId&&!location.hash){location.hash='building/'+encodeURIComponent(nfcId);return}let id;try{id=decodeURIComponent(hash.replace('#building/',''))}catch{id=''}const b=buildings.find(x=>x.id===id);const isHome=hash==='#home';document.querySelectorAll('[data-nav]').forEach(a=>{const current=a.dataset.nav===(isHome?'home':hash==='#buildings'||b?'buildings':'');a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
if(isHome){const hall=buildings.find(x=>x.id==='hall')||buildings[0];app.innerHTML=`<section class="home-hero watercolor-welcome" aria-labelledby="welcome-title"><div class="home-hero-copy wrap"><p class="overline">${esc(t("campusAffiliation"))}</p><h1 id="welcome-title">${esc(t("welcomeLineOne"))}<br>${esc(t("welcomeLineTwo"))}</h1><p class="hero-description">${esc(t("watercolorDescription"))}</p><a class="button light" href="#buildings">${esc(t("startVisit"))} ${siteIcon("arrow-right")}</a></div><figure class="welcome-art"><img ${CampusMedia.attributes('assets/hall-watercolor.png','(max-width:720px) 100vw, 760px')} alt="${esc(t("watercolorAlt"))}" width="1536" height="1024" fetchpriority="high"><figcaption><a class="welcome-caption" href="${buildingLink(hall)}">${esc(t("watercolorCaption"))}</a></figcaption><a class="welcome-3d" href="seu_hall_3d_demo0.6.html?v=2" aria-label="${esc(t("enterHall3d"))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9M8 5.25l8 4.5"/></svg><span>${esc(t("enter3d"))}</span><span class="welcome-3d-arrow" aria-hidden="true">↗</span></a></figure></section><section class="card-stack" data-card-stack aria-label="${isEnglish ? 'Featured cards' : '精选卡片'}"></section><section class="collection-section wrap"><div class="section-heading"><div><p class="section-kicker">${esc(t("visit"))}</p><h2>${esc(t("getStarted"))}</h2></div><a class="inline-link" href="#buildings">${esc(t("allBuildings"))} ${siteIcon("arrow-right")}</a></div>${buildingHighlights(relatedBuildings(undefined, buildings.length))}</section><section class="discovery-module" aria-label="${isEnglish ? 'Campus image collection' : '校园图片集'}"><div class="discovery-spacer" aria-hidden="true"></div><div class="discovery-viewport" tabindex="0" aria-label="${isEnglish ? 'Swipe horizontally to browse images' : '左右滑动浏览图片'}"><div class="discovery-board"></div></div></section><section class="campus-adventure" aria-label="${isEnglish ? 'Campus adventure — game coming soon' : '校园探索 · 游戏区域预留'}"><div class="campus-adventure-art"><img ${CampusMedia.attributes('assets/campus-adventure.png','(max-width:720px) 100vw, 900px')} width="1129" height="1393" loading="lazy" decoding="async" alt="${isEnglish ? 'Embark on a campus adventure. Find clues, explore Sipailou and discover campus history and daily life. More ways to play. The central game area and five activity capsules are reserved.' : '开启一场校园探索。寻找校园线索，探索四牌楼，发现校园里的历史与日常。More ways to play。中央游戏区和五个玩法胶囊暂留空。'}"><div class="campus-adventure-game-slot" id="campus-adventure-game-slot"></div></div></section>`;document.title=t('site');}
else if(hash==='#buildings'){renderDirectory()}
else if(hash==='#alumni'){renderAlumni()}
else if(hash.startsWith('#alumni/')){
  const person = alumniPeople.find(item => alumniLink(item) === hash);
  if (person) renderAlumniProfile(person);
  else renderAlumni();
}
else if (hash === '#game') {
  const title = isEnglish ? 'Game' : '游戏';
  document.title = title + ' · ' + t('site');
  app.innerHTML = `<div class="breadcrumbs wrap"><a href="#home">${esc(t('home'))}</a><span>/</span><span>${title}</span></div><section class="column-placeholder wrap"><p class="section-kicker">${esc(t('site'))}</p><h1>${title}</h1><p>${isEnglish ? 'Content is being prepared. Please check back soon.' : '内容筹备中，敬请期待。'}</p><a class="inline-link" href="#home">${siteIcon('arrow-left')} ${isEnglish ? 'Back to home' : '返回首页'}</a></section>`;
}
else if(b){document.title=b.name+' · '+t('site');app.innerHTML=crumb(b.name)+hallTourMarkup(b)+`<div class="detail-tabs"><nav class="wrap" aria-label="${esc(t("detailNavigation"))}"><a href="#overview" data-scroll="overview" class="current">${esc(t("overview"))}</a><a href="#stories" data-scroll="stories">${esc(t("history"))}</a><a href="#location" data-scroll="location">${esc(t("mapLocation"))}</a></nav></div><div class="detail-layout wrap"><div class="detail-main"><section id="overview" class="article-section"><h2>${esc(t("overview"))}</h2><p class="lead">${esc(b.intro)}</p></section><section id="stories" class="article-section"><h2>${esc(t("history"))}</h2>${b.sections.map(s=>`<article><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></article>`).join('')}${archiveGallery(b)}</section><section id="location" class="article-section">${buildingMap(b)}</section>${b.sources?.length?`<section class="article-section sources"><h2>${esc(t("references"))}</h2>${b.sources.filter(s=>s.title&&s.url).map(s=>`<a href="${sourceUrl(s.url)}" target="_blank" rel="noopener">${esc(s.title)} <span>${siteIcon("arrow-up-right", 14)}</span></a>`).join('')}</section>`:''}</div><aside class="detail-aside"><div class="fact-sheet"><h2>${esc(t("facts"))}</h2><dl>${b.facts.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl></div>${b.photo ? `<div class="aside-photo">${coverImage(b)}<p>${esc(b.photoCaption)}${b.photoCredit ? `<br>${esc(b.photoCredit)}` : ""}</p></div>` : ""}</aside></div>${buildingRecommendationGallery(relatedBuildings(b.id, 7))}`;
mountHallTour(app.querySelector(".hall-tour"));
mountArchiveGallery(b, app);
document.querySelectorAll('[data-scroll]').forEach(a=>a.onclick=ev=>{ev.preventDefault();document.getElementById(a.dataset.scroll).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.querySelectorAll('.detail-tabs a').forEach(t=>t.classList.toggle('current',t.dataset.scroll===a.dataset.scroll))});}
else{document.title=t('notFound')+' · '+t('site');app.innerHTML=`<section class="wrap directory-head"><h1>${esc(t("notFound"))}</h1><a class="inline-link" href="#buildings">${siteIcon("arrow-left")} ${esc(t("returnToBuildings"))}</a></section>`}window.scrollTo({top:0,behavior:'instant'});app.dispatchEvent(new Event('campus:render'))}
function buildingHighlights(items) {
  return `<div class="building-highlights"><div class="highlight-viewport" tabindex="0" role="region" aria-roledescription="${isEnglish ? 'carousel' : '轮播'}" aria-label="${isEnglish ? 'Recommended buildings. Use arrow keys to browse.' : '推荐建筑，使用左右方向键切换'}"><div class="highlight-track">${items.map(b => `<a class="highlight-card" href="${buildingLink(b)}"><div class="highlight-copy"><h3>${esc(b.name)}<span aria-hidden="true">${siteIcon('arrow-up-right', 20)}</span></h3><p>${esc(b.summary || b.intro)}</p></div><div class="highlight-art">${coverImage(b.cover ? {...b, photo: b.cover} : b)}<span class="highlight-glint" aria-hidden="true"></span></div></a>`).join('')}</div></div><div class="highlight-controls"><button type="button" class="highlight-arrow" data-direction="-1" aria-label="${isEnglish ? 'Previous building' : '上一座建筑'}">‹</button><div class="highlight-pagination" aria-label="${isEnglish ? 'Choose a building' : '选择建筑'}"></div><button type="button" class="highlight-play" aria-pressed="false"></button><button type="button" class="highlight-arrow" data-direction="1" aria-label="${isEnglish ? 'Next building' : '下一座建筑'}">›</button></div><p class="highlight-hint"><span class="highlight-count"></span> · ${isEnglish ? 'Swipe to browse · Click to explore' : '左右滑动切换 · 点击卡片进入'}</p><span class="highlight-status" aria-live="polite"></span></div>`;
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let routeFade;
let sectionObserver;

function showRoute() {
  sectionObserver?.disconnect();
  render();
  mountBuildingRecommendationGallery();
  if (reducedMotion.matches || location.hash === '#buildings') return;

  const blocks = app.querySelectorAll([
    '.breadcrumbs', '.home-hero', '.visit-option', '.section-heading',
    '.directory-head', '.building-hero',
    '.detail-tabs', '.fact-sheet', '.aside-photo', '.article-section',
    '.recommendation-gallery', '.return-link'
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
