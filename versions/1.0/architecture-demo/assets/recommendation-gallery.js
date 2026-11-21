'use strict';

function buildingRecommendationGallery(items) {
  if (!items.length) return '';
  const image = building => coverImage(building.photo ? building : { ...building, photo: building.cover });
  const tile = (building, index, copy) => copy
    ? `<span class="recommendation-tile" data-index="${index}">${image(building)}</span>`
    : `<button type="button" class="recommendation-tile" data-index="${index}" tabindex="-1" aria-label="${esc(building.name)}">${image(building)}</button>`;
  return `<section class="recommendation-gallery" aria-labelledby="recommendation-title">
    <header class="recommendation-heading wrap">
      <h2 id="recommendation-title">${esc(t('keepExploring'))}</h2>
      <p>${isEnglish ? 'Swipe to browse and open the featured building.' : '左右滑动浏览，点击中央照片继续参观。'}</p>
    </header>
    <div class="recommendation-window">
      <div class="recommendation-marquee">${[false, true].map(copy =>
        `<div class="recommendation-set"${copy ? ' aria-hidden="true"' : ''}>${items.map((building, index) => tile(building,index,copy)).join('')}</div>`
      ).join('')}</div>
      <div class="recommendation-feature">${items.map((building,index) =>
        `<a class="recommendation-link" href="${buildingLink(building)}" aria-label="${esc(building.name)}"${index ? ' hidden' : ''}>
          ${image(building)}<span class="recommendation-overlay"><span>${esc(building.name)} ${siteIcon('arrow-up-right', 18)}</span></span>
        </a>`
      ).join('')}</div>
    </div>
    <div class="recommendation-caption">
      <span class="recommendation-name" aria-live="polite">${esc(items[0].name)}</span>
      <div class="recommendation-actions">
        <button type="button" data-step="-1" aria-label="${isEnglish ? 'Previous building' : '上一座建筑'}">‹</button>
        <span class="recommendation-index">01 / ${String(items.length).padStart(2,'0')}</span>
        <button type="button" data-step="1" aria-label="${isEnglish ? 'Next building' : '下一座建筑'}">›</button>
        <button type="button" class="recommendation-motion" aria-label="${isEnglish ? 'Pause gallery motion' : '暂停背景滚动'}" aria-pressed="false">Ⅱ</button>
      </div>
    </div>
    <a class="recommendation-directory" href="#buildings">${esc(t('allBuildings'))} ${siteIcon('arrow-right', 16)}</a>
  </section>`;
}

function mountBuildingRecommendationGallery() {
  const gallery = app.querySelector('.recommendation-gallery');
  if (!gallery) return;
  const links = [...gallery.querySelectorAll('.recommendation-link')];
  const stage = gallery.querySelector('.recommendation-window');
  const name = gallery.querySelector('.recommendation-name');
  const count = gallery.querySelector('.recommendation-index');
  const motion = gallery.querySelector('.recommendation-motion');
  let active = 0;
  let drag;
  let skipClick = false;
  let frame = 0;
  let distance = 0;
  let settle;
  const feature = gallery.querySelector('.recommendation-feature');
  const marquee = gallery.querySelector('.recommendation-marquee');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const translation = x => x + 'px 0px';

  function paintDrag() {
    frame = 0;
    feature.style.translate = translation(distance);
    marquee.style.translate = translation(distance);
  }

  function finishDrag(direction) {
    cancelAnimationFrame(frame);
    paintDrag();
    gallery.classList.remove('is-dragging');
    if (direction) choose(active + direction);
    const entry = direction ? distance + direction * drag.width : distance;
    feature.style.removeProperty('translate');
    marquee.style.removeProperty('translate');
    if (!reduced.matches) {
      const options = { duration: 240, easing: 'cubic-bezier(.22,.72,.24,1)' };
      settle = [
        feature.animate([{ translate: translation(entry) }, { translate: 'none' }], options),
        marquee.animate([{ translate: translation(distance) }, { translate: 'none' }], options),
      ];
    }
    distance = 0;
  }
  const choose = index => {
    const hadFocus = document.activeElement === links[active];
    links[active].hidden = true;
    active = (index + links.length) % links.length;
    links[active].hidden = false;
    name.textContent = links[active].getAttribute('aria-label');
    count.textContent = `${String(active + 1).padStart(2,'0')} / ${String(links.length).padStart(2,'0')}`;
    if (hadFocus) links[active].focus({ preventScroll: true });
  };
  for (const button of gallery.querySelectorAll('[data-step]')) {
    button.disabled = links.length === 1;
    button.onclick = () => choose(active + Number(button.dataset.step));
  }
  motion.onclick = () => {
    const paused = gallery.classList.toggle('is-paused');
    motion.setAttribute('aria-pressed', String(paused));
    motion.setAttribute('aria-label', paused
      ? (isEnglish ? 'Resume gallery motion' : '继续背景滚动')
      : (isEnglish ? 'Pause gallery motion' : '暂停背景滚动'));
    motion.textContent = paused ? '▷' : 'Ⅱ';
  };
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || links.length < 2) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, width: feature.offsetWidth, moving: false };
    skipClick = false;
  });
  stage.addEventListener('pointermove', event => {
    if (event.pointerId !== drag?.id) return;
    const dx = event.clientX - drag.x;
    if (!drag.moving) {
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      drag.moving = true;
      skipClick = true;
      settle?.forEach(animation => animation.cancel());
      gallery.classList.add('is-dragging');
      stage.setPointerCapture(event.pointerId);
    }
    const limit = drag.width * .84;
    distance = Math.max(-limit, Math.min(limit, dx));
    if (!frame) frame = requestAnimationFrame(paintDrag);
  });
  stage.addEventListener('pointerup', event => {
    if (event.pointerId !== drag?.id) return;
    if (drag.moving) {
      const dx = event.clientX - drag.x;
      finishDrag(Math.abs(dx) >= Math.min(48, drag.width * .22) ? -Math.sign(dx) : 0);
    }
    drag = undefined;
  });
  function cancelDrag(event) {
    if (event.pointerId !== drag?.id) return;
    if (drag.moving) finishDrag(0);
    drag = undefined;
  }
  stage.addEventListener('pointercancel', cancelDrag);
  stage.addEventListener('lostpointercapture', event => {
    // Touch transfers implicit capture from the touched child to the stage.
    if (event.target === stage) cancelDrag(event);
  });
  stage.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('click', event => {
    if (skipClick && event.detail > 0) { event.preventDefault(); return; }
    const tile = event.target.closest('[data-index]');
    if (tile) choose(Number(tile.dataset.index));
  });
  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    choose(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
}
