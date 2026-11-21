// Optional destinations can be filled in later, keyed by building id.
window.campusDiscoveryDestinations = window.campusDiscoveryDestinations || {};
(() => {
  let dispose = () => {};
  function mount() {
    dispose();
    const viewport = document.querySelector('.discovery-viewport');
    if (!viewport || !buildings.length) return;
    const board = viewport.querySelector('.discovery-board');
    const controller = new AbortController();
    const on = (target, event, handler, options = {}) => target.addEventListener(event, handler, { ...options, signal: controller.signal });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const items = buildings.filter(building => building.cover || building.photo).slice(0, 12);
    const split = Math.ceil(items.length / 2);
    [items.slice(0, split), items.slice(split)].forEach((rowItems, rowIndex) => {
      const row = document.createElement('div'); row.className = 'discovery-row';
      rowItems.forEach((building, index) => {
        const card = document.createElement('figure'); card.className = 'discovery-card';
        card.style.setProperty('--ratio', [1.25,1,1.55,1.25,1.4,1.1][(index + rowIndex * 2) % 6]);
        const image = document.createElement('img'); image.dataset.mediaSource = building.cover || building.photo; image.alt = building.name; image.loading = 'lazy'; image.draggable = false;
        const caption = document.createElement('figcaption'); caption.textContent = building.name;
        const destination = window.campusDiscoveryDestinations[building.id];
        if (destination && /^(#|\.\/|https?:\/\/)/.test(destination)) {
          const link = document.createElement('a'); link.href = destination; link.append(image, caption); card.append(link);
        } else card.append(image, caption);
        row.append(card);
      });
      board.append(row);
    });
    const loadImages = () => board.querySelectorAll('img[data-media-source]').forEach(image => {
      CampusMedia.apply(image,image.dataset.mediaSource,'(max-width:720px) 70vw, 420px');
      delete image.dataset.mediaSource;
    });
    const nearby = new IntersectionObserver(entries => {
      if(entries.some(entry => entry.isIntersecting)){loadImages();nearby.disconnect();}
    },{rootMargin:'240px 0px'});
    nearby.observe(viewport);
    let drag = null, velocity = 0, frame = 0, lastTime = 0, moved = false;
    function stop() { cancelAnimationFrame(frame); frame = 0; }
    function coast(now) {
      const delta = Math.min(32, now - lastTime); lastTime = now;
      const before = viewport.scrollLeft;
      viewport.scrollLeft += velocity * delta;
      velocity *= Math.pow(.94, delta / 16.67);
      if (Math.abs(velocity) > .025 && viewport.scrollLeft !== before) frame = requestAnimationFrame(coast);
    }
    on(viewport, 'pointerdown', event => {
      stop(); moved = false;
      // Touch uses the browser's native scrolling and momentum, matching the recording.
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { x: event.clientX, time: performance.now() }; velocity = 0;
    });
    on(viewport, 'pointermove', event => {
      if (!drag) return;
      const now = performance.now(), dx = drag.x - event.clientX;
      if (Math.abs(dx) > 2) { moved = true; viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging'); }
      viewport.scrollLeft += dx;
      velocity = .65 * velocity + .35 * dx / Math.max(1, now - drag.time);
      drag = { x: event.clientX, time: now };
    });
    on(window, 'pointerup', () => {
      if (!drag) return;
      if (performance.now() - drag.time > 100) velocity = 0;
      drag = null; viewport.classList.remove('is-dragging');
      if (!reduced.matches && moved) { lastTime = performance.now(); frame = requestAnimationFrame(coast); }
    });
    on(viewport, 'pointercancel', () => { drag = null; stop(); viewport.classList.remove('is-dragging'); });
    on(viewport, 'dragstart', event => event.preventDefault());
    on(viewport, 'click', event => { if (moved && event.detail) { event.preventDefault(); moved = false; } }, { capture: true });
    on(viewport, 'keydown', event => {
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault(); stop(); viewport.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * viewport.clientWidth * .7, behavior: reduced.matches ? 'instant' : 'smooth' });
    });
    on(viewport, 'wheel', stop, { passive: true });
    dispose = () => { stop(); nearby.disconnect(); controller.abort(); };
  }
  document.getElementById('app').addEventListener('campus:render', mount);
  mount();
})();
