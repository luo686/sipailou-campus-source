'use strict';

const CampusLanguage = (() => {
  const strings = {
    site: ['四牌楼校园导览', 'Sipailou Campus Guide'],
    affiliation: ['东南大学 · 南京', 'Southeast University · Nanjing'],
    campusAffiliation: ['东南大学 · 四牌楼校区', 'Southeast University · Sipailou Campus'],
    campus: ['四牌楼校区', 'Sipailou Campus'],
    home: ['首页', 'Home'],
    buildings: ['校园建筑', 'Campus Buildings'],
    navigation: ['主导航', 'Main navigation'],
    footerNavigation: ['页脚导航', 'Footer navigation'],
    language: ['网页语言', 'Site language'],
    photoDialog: ['建筑照片', 'Building photo'],
    closePhoto: ['关闭照片', 'Close photo'],
    close: ['关闭', 'Close'],
    welcome: ['欢迎来到四牌楼', 'Welcome to Sipailou'],
    heroAlt: ['大礼堂前的校园景观', 'The grounds in front of the Grand Auditorium'],
    heroDescription: ['了解校园建筑，探索校园里的历史与日常。', 'Explore the buildings, history, and daily life of the campus.'],
    startVisit: ['开始参观', 'Start exploring'],
    featured: ['本期建筑 · {name}', 'Featured building · {name}'],
    explore: ['探索入口', 'Explore the campus'],
    guide: ['校园导览', 'Campus Guide'],
    guideDescription: ['查看建筑介绍，在地图中找到它们。', 'Read about the buildings and find them on the map.'],
    game: ['剧情探索', 'Story Adventure'],
    comingSoon: ['筹备中', 'Coming soon'],
    gameDescription: ['校园主题的互动解谜故事。', 'An interactive campus mystery.'],
    visit: ['参观四牌楼', 'Visiting Sipailou'],
    getStarted: ['从这些建筑开始', 'Start with these buildings'],
    allBuildings: ['查看全部建筑', 'View all buildings'],
    directoryDescription: ['选择一座建筑，了解它的故事与位置。', 'Choose a building to discover its story and location.'],
    searchPlaceholder: ['搜索建筑名称', 'Search buildings'],
    search: ['搜索', 'Search'],
    clearSearch: ['清空', 'Clear'],
    loading: ['正在加载建筑资料…', 'Loading campus buildings…'],
    emptyBuildings: ['暂时没有已发布的建筑资料。', 'No building records have been published yet.'],
    unavailable: ['资料暂时无法加载', 'Building records are temporarily unavailable'],
    retry: ['重新加载', 'Try again'],
    noDraft: ['没有可预览的草稿，请从后台打开预览。', 'Open a draft preview from the editor.'],
    draftPreview: ['草稿预览 · 尚未发布', 'Draft preview · Unpublished'],
    suggestions: ['建筑搜索建议', 'Building suggestions'],
    countOne: ['共 {count} 处建筑', '{count} building'],
    countMany: ['共 {count} 处建筑', '{count} buildings'],
    noResults: ['没有找到相关建筑，请尝试其他名称。', 'No matching buildings. Try another name.'],
    notFound: ['未找到这座建筑', 'Building not found'],
    photoOf: ['查看{name}实景大图', 'View a larger photo of {name}'],
    folio: ['建筑档案 No. {number}', 'Building file No. {number}'],
    viewPhoto: ['查看照片', 'View photo'],
    enlargePhoto: ['放大建筑照片', 'Enlarge building photo'],
    detailNavigation: ['建筑详情栏目', 'Building sections'],
    overview: ['建筑概况', 'Overview'],
    history: ['建筑与历史', 'Architecture & History'],
    mapLocation: ['地图位置', 'Map Location'],
    openMap: ['展开地图', 'Open map'],
    previousPhoto: ['上一张', 'Previous photo'],
    nextPhoto: ['下一张', 'Next photo'],
    originalPhoto: ['原图', 'Original image'],
    gallery: ['建筑影像', 'Building photographs'],
    photoUnavailable: ['暂无建筑照片', 'Photo unavailable'],
    mapUnavailable: ['现有校园地图尚未收录此处位置。', 'This location is not yet marked on the campus map.'],
    mapNote: ['{name}已在地图中标出，支持拖动、滚轮缩放和双指缩放。', '{name} is highlighted. Drag to pan, or scroll or pinch to zoom.'],
    mapOf: ['{name}在校园地图中的位置', '{name} on the campus map'],
    references: ['相关资料', 'References'],
    facts: ['建筑信息', 'Building Facts'],
    keepExploring: ['继续参观', 'Keep Exploring'],
    returnToBuildings: ['返回校园建筑', 'Back to campus buildings'],
    contents: ['目录', 'Contents'],
    mapTitle: ['建筑位置地图', 'Building Location Map'],
    mapSuffix: ['位置地图', 'Location Map'],
    mapLabel: ['建筑位置地图，可拖动和缩放', 'Building location map. Drag to pan or zoom.'],
    mapTools: ['地图工具', 'Map controls'],
    zoomIn: ['放大地图', 'Zoom in'],
    zoomOut: ['缩小地图', 'Zoom out'],
    recenter: ['回到当前建筑', 'Center on the building'],
    mapError: ['地图暂时无法加载，请刷新重试。', 'The map could not load. Refresh the page to try again.'],
    northRoad: ['北 京 东 路', 'Beijing East Road'],
    southRoad: ['四 牌 楼', 'Sipailou'],
    gateSign: ['东南大学', 'SEU'],
  };

  const storageKey = 'sipailou-language';
  let savedLanguage;
  try { savedLanguage = localStorage.getItem(storageKey); } catch {}
  const requestedLanguage = new URLSearchParams(location.search).get('lang');
  const isEnglish = (requestedLanguage || savedLanguage) === 'en';
  const language = isEnglish ? 'en' : 'zh-CN';

  function t(key, values = {}) {
    return strings[key][isEnglish ? 1 : 0].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  }

  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-label]').forEach(element => {
    element.setAttribute('aria-label', t(element.dataset.i18nLabel));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    element.title = t(element.dataset.i18nTitle);
  });

  document.querySelectorAll('[data-campus-language]').forEach(button => {
    const target = button.dataset.campusLanguage;
    button.setAttribute('aria-pressed', String(target === language));
    button.addEventListener('click', () => {
      if (target === language) return;
      try { localStorage.setItem(storageKey, target); } catch {}
      const url = new URL(location.href);
      url.searchParams.set('lang', target);
      location.replace(url.href);
    });
  });

  return { isEnglish, language, t };
})();
