(() => {
  'use strict';
  const trigger = document.querySelector('.header-search');
  const dialog = document.createElement('dialog');
  dialog.className = 'building-lookup';
  dialog.setAttribute('aria-label', t('searchPlaceholder'));
  dialog.innerHTML = `
    <div class="building-lookup-field">
      <input type="search" autofocus autocomplete="off" placeholder="${esc(t('searchPlaceholder'))}" aria-label="${esc(t('searchPlaceholder'))}">
      <button type="button" aria-label="${esc(t('close'))}">×</button>
    </div>
    <ul class="building-lookup-list"></ul>`;
  document.body.append(dialog);

  const input = dialog.querySelector('input');
  const list = dialog.querySelector('ul');
  const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[\s'’-]/g, '');

  function results() {
    const query = input.value.trim().toLowerCase();
    const phonetic = normalize(query);
    const matches = buildings.filter(building => {
      const names = [building.name, building.originalName, building.en, building.legacyEnglish, ...(building.aliases || [])];
      if (names.some(name => name && name.toLowerCase().includes(query))) return true;
      if (!phonetic || !building.pinyin) return false;
      const initials = building.pinyin.trim().split(/\s+/).map(syllable => normalize(syllable)[0]).join('');
      return normalize(building.pinyin).includes(phonetic) || initials.startsWith(phonetic);
    });
    list.innerHTML = matches.length
      ? matches.map(building => `<li><a href="${buildingLink(building)}">${esc(building.name)}</a></li>`).join('')
      : `<li class="building-lookup-empty" role="status">${esc(t('noResults'))}</li>`;
  }

  trigger.setAttribute('aria-label', isEnglish ? 'Search buildings' : '搜索建筑');
  trigger.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    input.value = '';
    results();
    dialog.showModal();
  });
  input.addEventListener('input', results);
  input.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229) return;
    list.querySelector('a')?.click();
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('a')) dialog.close();
  });
})();
