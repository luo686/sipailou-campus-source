(() => {
  'use strict';
  let dispose = () => {};
  const artwork = {
    architecture: '<path d="M23 91h114M32 100h96M32 45h96M27 35h106M40 35a40 40 0 0 1 80 0M72-5v-10h16v10M80-15v-18M41 47v42m26-42v42m26-42v42m26-42v42" transform="translate(0 43)"/>',
    history: '<path d="M43 65a40 40 0 1 1 74 0M80 28v7m0 20 20-13M25 85q30-19 55 9 25-28 55-9v49q-30-19-55 0-25-19-55 0Zm55 10v39M36 86l8-3"/>',
    alumni: '<path d="M76 45c0-22 18-36 38-32 12 2 20 8 26 11l-4 7 2 16 5 10-7 5v12q-1 6-12 5l-5 18q18 9 23 24M28 141q13-24 32-30l-3-16-10 1-2-13-8-5 7-11c-1-19 11-31 29-32 21-2 36 12 36 32l-2 16q14 17 2 30M49 43q5 24 23 27 15-3 12 17l-2 20q18 11 26 34"/>',
    explore: '<path d="m80 13 5 28 19 5-19 4-5 28-5-28-19-4 19-5ZM65 20a32 32 0 0 0-13 53m44-53a32 32 0 0 1 13 53M24 94l25-11 31 14 31-14 25 11v51l-25-12-31 13-31-13-25 12Zm25-11v42m62-42v42M80 104c-11 0-13 11-6 19l6 7 6-7c7-8 5-19-6-19Z"/><circle cx="80" cy="114" r="3"/>'
  };
  function mount() {
    dispose();
    const root = document.querySelector('[data-card-stack]');
    if (!root) return;
    const english = CampusLanguage.isEnglish;
    const controller = new AbortController();
    const on = (target, event, handler) => target.addEventListener(event, handler, { signal: controller.signal });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    root.innerHTML = `<div class="card-stack-stage" tabindex="0" role="region" aria-roledescription="${english ? 'carousel' : '轮播'}" aria-label="${english ? 'Swipe or use arrow keys to change cards' : '叠卡翻页，左右滑动或使用方向键'}"></div><div class="stack-controls"><button type="button" class="stack-prev" aria-label="${english ? 'Previous card' : '上一张'}">‹</button><div class="stack-dots" aria-label="${english ? 'Choose a card' : '选择卡片'}"></div><button type="button" class="stack-next" aria-label="${english ? 'Next card' : '下一张'}">›</button><button type="button" class="stack-play"></button></div><span class="stack-status" aria-live="polite"></span>`;
    const stage = root.querySelector('.card-stack-stage');
    const play = root.querySelector('.stack-play');
    const status = root.querySelector('.stack-status');
    const cards = window.campusFeatureCards.map((content, index) => {
      const card = document.createElement('a');
      card.className = 'stack-card';
      card.href = content.href;
      card.innerHTML = `<svg class="stack-artwork" viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${artwork[content.icon]}</svg><div class="stack-card-copy"><h2></h2><span class="stack-card-rule" aria-hidden="true"></span></div>`;
      card.querySelector('h2').textContent = english ? content.titleEn || content.title : content.title;
      stage.append(card);
      return card;
    });
    let current = 0, busy = false, playing = false, timer, finishTimer, start = null, visible = false, suppressClick = false;
    const count = cards.length;
    const dots = cards.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button'; dot.className = 'stack-dot';
      dot.setAttribute('aria-label', english ? `Card ${index + 1}` : `第 ${index + 1} 张`);
      on(dot, 'click', () => change(index, true));
      root.querySelector('.stack-dots').append(dot);
      return dot;
    });
    function sync() {
      cards.forEach((card, index) => {
        const depth = (index - current + count) % count;
        card.style.transform = `translateX(${depth * 19}px) scale(${1 - depth * .085})`;
        card.style.opacity = '1'; card.style.zIndex = String(10 - depth);
        card.setAttribute('aria-hidden', String(depth !== 0));
        card.tabIndex = depth === 0 ? 0 : -1;
        card.inert = depth !== 0;
        dots[index].setAttribute('aria-current', String(depth === 0));
      });
      stage.dataset.current = current;
    }
    function schedule() {
      clearTimeout(timer);
      if (playing && visible && !document.hidden) timer = setTimeout(() => {
        if (root.closest('[inert]') || root.matches(':hover') || root.contains(document.activeElement)) schedule();
        else change((current + 1) % count);
      }, 1900);
    }
    function change(target, manual = false) {
      if (busy || target === current) return;
      clearTimeout(timer); busy = true;
      const old = cards[current], backward = target === (current + count - 1) % count;
      current = target;
      if (backward) {
        const incoming = cards[current]; incoming.classList.add('no-motion');
        incoming.style.transform = 'translateX(-95%) scale(1.015)'; incoming.style.opacity = '0'; incoming.style.zIndex = '12';
        void incoming.offsetWidth; incoming.classList.remove('no-motion'); sync(); incoming.style.zIndex = '12';
      } else {
        sync(); old.style.zIndex = '12'; old.style.transform = 'translateX(-95%) scale(1.015)'; old.style.opacity = '0';
      }
      if (manual) status.textContent = english ? `Card ${current + 1} of ${count}` : `第 ${current + 1} 张，共 ${count} 张`;
      finishTimer = setTimeout(() => {
        cards.forEach(card => card.classList.add('no-motion')); sync(); void stage.offsetWidth;
        cards.forEach(card => card.classList.remove('no-motion')); busy = false; schedule();
      }, reduced.matches ? 0 : 700);
    }
    function playback() {
      play.textContent = playing ? 'Ⅱ' : '▶';
      play.setAttribute('aria-label', english ? (playing ? 'Pause' : 'Play') : (playing ? '暂停' : '播放'));
      play.setAttribute('aria-pressed', String(playing)); schedule();
    }
    on(play, 'click', () => { playing = !playing; playback(); });
    on(root.querySelector('.stack-next'), 'click', () => change((current + 1) % count, true));
    on(root.querySelector('.stack-prev'), 'click', () => change((current + count - 1) % count, true));
    on(stage, 'keydown', event => {
      if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault(); change((current + (event.key === 'ArrowRight' ? 1 : count - 1)) % count, true);
      }
    });
    on(stage, 'pointerdown', event => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      suppressClick = false;
      start = [event.clientX, event.clientY];
    });
    on(window, 'pointerup', event => {
      if (!start) return;
      const dx = event.clientX - start[0], dy = event.clientY - start[1]; start = null;
      suppressClick = Math.abs(dx) > 10 || Math.abs(dy) > 10;
      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) change((current + (dx < 0 ? 1 : count - 1)) % count, true);
    });
    on(stage, 'click', event => {
      if (suppressClick || busy) event.preventDefault();
      suppressClick = false;
    });
    on(stage, 'dragstart', event => event.preventDefault());
    on(stage, 'pointercancel', () => { start = null; });
    on(document, 'visibilitychange', schedule);
    on(reduced, 'change', () => { if (reduced.matches) { playing = false; playback(); } });
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); });
    observer.observe(root);
    dispose = () => { controller.abort(); observer.disconnect(); clearTimeout(timer); clearTimeout(finishTimer); };
    sync(); playback();
  }
  document.getElementById('app').addEventListener('campus:render', mount);
  mount();
})();
