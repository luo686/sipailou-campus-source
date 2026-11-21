(() => {
  'use strict';
  let dispose = () => {};
  function mount() {
    dispose();
    const root = document.querySelector('.building-highlights');
    if (!root) return;
    const viewport = root.querySelector('.highlight-viewport');
    const track = root.querySelector('.highlight-track');
    const cards = [...root.querySelectorAll('.highlight-card')];
    if (!cards.length) return;
    const pagination = root.querySelector('.highlight-pagination');
    const play = root.querySelector('.highlight-play');
    const english = CampusLanguage.isEnglish;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    const on = (target, event, handler) => target.addEventListener(event, handler, { signal: controller.signal });
    let current = 0, playing = false, timer, visible = false, start = null, suppressClick = false;
    const dots = cards.map((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button'; dot.className = 'highlight-dot';
      dot.setAttribute('aria-label', (english ? 'View ' : '查看') + card.querySelector('h3').textContent);
      on(dot, 'click', () => go(index, true)); pagination.append(dot); return dot;
    });
    function position() {
      const card = cards[current];
      track.style.transform = `translateX(${(viewport.clientWidth - card.offsetWidth) / 2 - card.offsetLeft}px)`;
    }
    function schedule() {
      clearTimeout(timer);
      if (playing && visible && !document.hidden) timer = setTimeout(() => {
        if (!root.closest('[inert]') && !root.contains(document.activeElement) && !viewport.matches(':hover')) go(current + 1);
        schedule();
      }, 3200);
    }
    function go(index, manual = false) {
      current = (index + cards.length) % cards.length;
      cards.forEach((card, i) => { card.classList.toggle('active', i === current); card.tabIndex = i === current ? 0 : -1; dots[i].setAttribute('aria-current', String(i === current)); });
      viewport.dataset.current = current;
      root.querySelector('.highlight-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      if (manual) root.querySelector('.highlight-status').textContent = cards[current].querySelector('h3').textContent;
      position();
      const dot = dots[current];
      pagination.scrollTo({ left: dot.offsetLeft - pagination.offsetLeft - pagination.clientWidth / 2 + dot.offsetWidth / 2, behavior: reduced.matches ? 'instant' : 'smooth' });
      if (manual) schedule();
    }
    function setPlaying(value) {
      playing = value; play.textContent = value ? 'Ⅱ' : '▶';
      play.setAttribute('aria-label', english ? (value ? 'Pause autoplay' : 'Start autoplay') : (value ? '暂停自动播放' : '自动播放'));
      play.setAttribute('aria-pressed', String(value)); schedule();
    }
    on(play, 'click', () => setPlaying(!playing));
    root.querySelectorAll('[data-direction]').forEach(button => on(button, 'click', () => go(current + Number(button.dataset.direction), true)));
    on(viewport, 'keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1), true);
      cards[current].focus({ preventScroll: true });
    });
    on(viewport, 'dragstart', event => event.preventDefault());
    on(viewport, 'pointerdown', event => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      suppressClick = false; start = [event.clientX, event.clientY];
    });
    on(viewport, 'pointermove', event => {
      if (!start) return;
      const dx = event.clientX - start[0], dy = event.clientY - start[1];
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { suppressClick = true; viewport.setPointerCapture(event.pointerId); }
    });
    on(viewport, 'pointerup', event => {
      if (!start) return;
      const dx = event.clientX - start[0], dy = event.clientY - start[1]; start = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { suppressClick = true; go(current + (dx < 0 ? 1 : -1), true); }
    });
    on(viewport, 'pointercancel', () => { start = null; });
    on(window, 'pointerup', () => { start = null; });
    viewport.addEventListener('click', event => {
      if (suppressClick && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    }, { capture: true, signal: controller.signal });
    on(document, 'visibilitychange', schedule);
    on(reduced, 'change', () => { if (reduced.matches) setPlaying(false); });
    const sizeObserver = new ResizeObserver(position); sizeObserver.observe(viewport);
    const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }); visibilityObserver.observe(root);
    dispose = () => { controller.abort(); sizeObserver.disconnect(); visibilityObserver.disconnect(); clearTimeout(timer); };
    go(0); setPlaying(false);
  }
  document.getElementById('app').addEventListener('campus:render', mount);
  mount();
})();
