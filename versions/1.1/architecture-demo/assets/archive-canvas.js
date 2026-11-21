'use strict';

function mountArchiveCanvas(gallery, name, photos) {
  const stage = gallery.querySelector('.archive-canvas');
  const track = gallery.querySelector('.archive-tiles');
  const controller = new AbortController();
  const { signal } = controller;
  const modulus = (value, base) => ((value % base) + base) % base;
  let tiles = [];
  let x = 0, y = 0, vx = 0, vy = 0;
  let frame = 0, lastFrame = 0;
  let stepX, stepY, columns, rows;
  let lastColumn, lastRow;
  let drag;

  function draw() {
    if (!stepX || !stepY) return;
    const column = Math.floor(-x / stepX);
    const row = Math.floor(-y / stepY);
    track.style.transform = `translate3d(${x + column * stepX}px,${y + row * stepY}px,0)`;
    if (column === lastColumn && row === lastRow) return;
    lastColumn = column; lastRow = row;
    for (const tile of tiles) {
      const c = column - 1 + modulus(tile.column - (column - 1), columns);
      const r = row - 1 + modulus(tile.row - (row - 1), rows);
      const stagger = modulus(c,2) * stepY * .5;
      tile.button.style.transform = `translate3d(${(c - column)*stepX}px,${(r - row)*stepY - stagger}px,0)`;
      const index = modulus(c * 3 + r, photos.length);
      if (index === tile.index) continue;
      tile.index = index;
      tile.button.dataset.photo = index;
      tile.img.alt = photos[index].caption || name;
      tile.img.src = photos[index].photo;
    }
  }

  function resize() {
    if (!stage.clientWidth || !stage.clientHeight) return;
    const computed = getComputedStyle(stage);
    const width = Math.min(165, Math.max(88, stage.clientWidth * .181));
    const gap = parseFloat(computed.columnGap);
    const height = Math.round(width * 1.32);
    stepX = width + gap;
    stepY = height + gap;
    columns = Math.ceil(stage.clientWidth / stepX) + 3;
    rows = Math.ceil(stage.clientHeight / stepY) + 3;
    stage.style.setProperty('--archive-width', width + 'px');
    stage.style.setProperty('--archive-height', height + 'px');
    lastColumn = lastRow = undefined;
    track.replaceChildren();
    tiles = Array.from({ length: columns * rows }, (_, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'archive-tile';
      button.tabIndex = -1;
      const img = new Image();
      img.draggable = false;
      img.decoding = 'async';
      button.append(img);
      track.append(button);
      return { button, img, column:index % columns, row:Math.floor(index / columns) };
    });
    draw();
  }

  function animate(time) {
    frame = 0;
    const elapsed = lastFrame ? Math.min(time - lastFrame,32) : 16;
    lastFrame = time;
    if (!drag && (Math.abs(vx) > .012 || Math.abs(vy) > .012)) {
      x += vx * elapsed;
      y += vy * elapsed;
      const friction = Math.exp(-elapsed / 225);
      vx *= friction;
      vy *= friction;
      frame = requestAnimationFrame(animate);
    } else if (!drag) {
      lastFrame = 0;
    }
    draw();
  }
  const queue = () => { if (!frame) frame = requestAnimationFrame(animate); };

  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    vx = vy = lastFrame = 0;
    drag = { id:event.pointerId, x:event.clientX, y:event.clientY, time:event.timeStamp, startX:x, startY:y,
      photo:event.target.closest('.archive-tile')?.dataset.photo, moved:false };
    stage.setPointerCapture(event.pointerId);
  }, { signal });
  stage.addEventListener('pointermove', event => {
    if (event.pointerId !== drag?.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const elapsed = Math.max(8,event.timeStamp - drag.time);
    const nextX = drag.startX + dx;
    const nextY = drag.startY + dy;
    if (!drag.moved && Math.hypot(dx,dy) < 6) return;
    drag.moved = true;
    stage.classList.add('is-dragging');
    vx = .32 * vx + .68 * (nextX - x) / elapsed;
    vy = .32 * vy + .68 * (nextY - y) / elapsed;
    x = nextX; y = nextY; drag.time = event.timeStamp;
    queue();
  }, { signal });
  function release(event) {
    if (event.pointerId !== drag?.id) return;
    const { moved, photo, time } = drag;
    drag = undefined;
    stage.classList.remove('is-dragging');
    if (event.type !== 'pointerup' || !moved || galleryMotion.matches || event.timeStamp - time > 100) vx = vy = 0;
    vx = Math.max(-2.2,Math.min(2.2,vx));
    vy = Math.max(-2.2,Math.min(2.2,vy));
    queue();
    if (event.type === 'pointerup' && !moved && photo !== undefined) openPhotoGallery(name,photos,Number(photo));
  }
  stage.addEventListener('pointerup', release, { signal });
  stage.addEventListener('pointercancel', release, { signal });
  stage.addEventListener('lostpointercapture', event => {
    if (event.target === stage) release(event);
  }, { signal });
  stage.addEventListener('keydown', event => {
    const delta = { ArrowLeft:[1,0], ArrowRight:[-1,0], ArrowUp:[0,1], ArrowDown:[0,-1] }[event.key];
    if (delta) {
      event.preventDefault();
      vx = vy = 0;
      x += delta[0]*stepX;
      y += delta[1]*stepY;
      queue();
    } else if (event.key === 'Enter' && event.target === stage) {
      event.preventDefault();
      const bounds = stage.getBoundingClientRect();
      const cx = bounds.left + bounds.width/2;
      const cy = bounds.top + bounds.height/2;
      const tile = document.elementFromPoint(cx,cy)?.closest('.archive-tile');
      openPhotoGallery(name,photos,Number(tile?.dataset.photo ?? 0));
    }
  }, { signal });
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  gallery.dispose = () => {
    observer.disconnect();
    controller.abort();
    cancelAnimationFrame(frame);
  };
}
