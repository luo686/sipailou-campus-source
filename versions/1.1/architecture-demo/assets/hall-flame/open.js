let hallReaderAssets;
async function openBuildingFlame(opener, english, building) {
  if (document.querySelector('.flame-dialog')) return;
  building ||= buildings.find(b => b.id === document.querySelector('.hall-tour')?.dataset.building);
  if (!building) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'flame-dialog manuscript-reader';
  dialog.dataset.phase = 'welcome';
  dialog.dataset.building = building.id;
  dialog.lang = english ? 'en' : 'zh-CN';
  dialog.setAttribute('aria-label', building.name + (english ? ' tour' : '导览'));
  dialog.innerHTML = '<canvas tabindex="0" role="button"></canvas><p class="flame-sr" aria-live="polite"></p><footer hidden><span></span><div class="flame-actions"><button class="flame-skip" type="button" hidden></button><button class="flame-exit" type="button"></button></div></footer><section class="flame-welcome"><p class="welcome-eyebrow">SIPAILOU</p><h1></h1><button class="flame-start" type="button" disabled></button><p class="welcome-loading" role="status"></p></section>';
  const welcome = dialog.querySelector('.flame-welcome');
  welcome.querySelector('h1').textContent = (english ? 'Welcome to ' : '欢迎来到') + building.name;
  const start = welcome.querySelector('button');
  start.textContent = english ? 'Touch the screen' : '轻触屏幕';
  const exit = dialog.querySelector('.flame-exit');
  exit.textContent = english ? 'Return to building' : '返回建筑详情';
  exit.onclick = () => dialog.close();
  const previousOverflow = document.documentElement.style.overflow;
  const previousFocus = document.activeElement;
  document.body.append(dialog);
  dialog.showModal();
  document.documentElement.style.overflow = 'hidden';
  let dispose;
  const leave = () => { if (dialog.open) dialog.close(); };
  window.addEventListener('hashchange', leave);
  dialog.onclose = () => {
    dispose?.();
    window.removeEventListener('hashchange', leave);
    dialog.remove();
    document.documentElement.style.overflow = previousOverflow;
    const focus = opener || previousFocus;
    if (focus?.isConnected) focus.focus({preventScroll:true});
  };
  try {
    hallReaderAssets ||= Promise.all(['burn-model','live-shader','manuscript','reader'].map(name => new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = 'assets/hall-flame/' + name + '.js?v=8';
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error(name)); };
      document.head.append(script);
    })));
    await hallReaderAssets;
    await Promise.allSettled([
      document.fonts.load('24px "Postcard Hand"'),
      document.fonts.load('18px "Postcard Latin"')
    ]);
    if (!dialog.open) return;
    dispose = await startBuildingReader(dialog, english, building);
    if (!dialog.open) { dispose?.(); return; }
    start.disabled = false;
    start.classList.add('ready');
    start.onclick = () => {
      if (start.disabled || dialog.dataset.phase !== 'welcome') return;
      dialog.dataset.phase = 'reading';
      welcome.hidden = true;
      dialog.querySelector('footer').hidden = false;
      const canvas = dialog.querySelector('canvas');
      canvas.focus({preventScroll:true});
      canvas.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter'}));
    };
  } catch {
    hallReaderAssets = null;
    welcome.querySelector('.welcome-loading').textContent = english ? 'Unable to load. Return and try again.' : '加载失败，请返回后重试。';
    dialog.querySelector('footer').hidden = false;
  }
}
let flameRoute;
function openBuildingArrival() {
  const tour = document.querySelector('.hall-tour[data-building]');
  const id = tour?.dataset.building;
  if (!id) { flameRoute = null; return; }
  if (id === flameRoute) return;
  flameRoute = id;
  const building = buildings.find(b => b.id === id);
  if (building) openBuildingFlame(tour.querySelector('.flame-entry'), isEnglish, building);
}
app.addEventListener('campus:render', () => queueMicrotask(openBuildingArrival));
openBuildingArrival();
