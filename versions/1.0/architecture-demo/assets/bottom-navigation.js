(() => {
  const navigation = document.querySelector('.bottom-navigation');
  const links = [...navigation.querySelectorAll('a')];
  if (CampusLanguage.isEnglish) {
    navigation.setAttribute('aria-label', 'Main sections');
    const labels = ['Home', 'Buildings', 'Alumni', 'Game'];
    links.forEach((link, index) => { link.querySelector('span').textContent = labels[index]; });
  }
  links.find(link => link.dataset.bottomRoute === 'game')?.querySelector('span')?.replaceChildren(document.createTextNode(CampusLanguage.isEnglish ? 'Game · Coming soon' : '游戏 · 筹备中'));
  function update() {
    const hash = location.hash || '#home';
    const section = hash.startsWith('#building/') ? 'buildings' : hash.slice(1).split('/')[0];
    links.forEach(link => {
      if (link.dataset.bottomRoute === section) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('hashchange', update);
  document.getElementById('app').addEventListener('campus:render', update);
  update();
})();
