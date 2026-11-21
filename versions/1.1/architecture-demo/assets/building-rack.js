'use strict';

function mountBuildingRack(root, records, { isEnglish, buildingLink }) {

  const labels = isEnglish
    ? { front: 'the front', back: 'the back', flip: 'Flip building card', put: 'Put back', detail: 'View building details', title: 'Campus Buildings', rack: 'Building postcard rack. Use left and right to turn, up and down to select a card, and Enter to open it.' }
    : { front: '正面', back: '背面', flip: '翻转建筑卡片', put: '放回', detail: '查看建筑详情', title: '校园建筑', rack: '建筑明信片架。左右键旋转，上下键选择建筑，回车抽出卡片。' };
  const escapeText = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const help = isEnglish ? 'Drag to turn the rack. Touch a card to pick it up, then touch again to read its back.' : '左右拖动转动书架，轻触抽出卡片，再次轻触阅读背面。';
  const directoryLabel = isEnglish ? `Text directory · ${records.length} places` : `文字目录 · ${records.length}处地点`;
  root.innerHTML = `
    <div class="rack-scene">
      <div class="rack-screen">
        <h1 class="rack-title" id="building-rack-title">${labels.title}</h1>
        <div class="rack-guidance">
          <p class="rack-help">${help}</p>
          <details class="rack-directory">
            <summary>${directoryLabel}</summary>
            <nav aria-label="${isEnglish ? 'Choose a campus place' : '选择校园地点'}"><ul>${records.map(record => `<li><a href="${escapeText(buildingLink(record))}">${escapeText(record.name)}</a></li>`).join('')}</ul></nav>
          </details>
        </div>
        <output class="rack-status" aria-live="polite"></output>
        <canvas class="rack-canvas" tabindex="0" aria-label="${labels.rack}"></canvas>
        <div class="rack-veil"></div>
        <div class="rack-inspector">
          <button type="button" class="rack-selected" aria-label="${labels.flip}" hidden>
            <span class="rack-flipper">
              <span class="rack-face rack-front"><canvas width="480" height="680"></canvas></span>
              <span class="rack-face rack-back">
                <span class="rack-postage" aria-hidden="true">
                  <img src="assets/rack-postage.webp" alt="" draggable="false">
                  <svg viewBox="0 0 112 66" fill="none" stroke="currentColor" stroke-width="1.15">
                    <circle cx="30" cy="36" r="22"/><circle cx="30" cy="36" r="18" opacity=".7"/>
                    <path d="M3 25q11 6 24 0t25 0t25 0t25 0M3 31q11 6 24 0t25 0t25 0t25 0M3 37q11 6 24 0t25 0t25 0t25 0M3 43q11 6 24 0t25 0t25 0t25 0"/>
                  </svg>
                </span>
                <strong class="rack-recipient"></strong>
                <span class="rack-note"></span>
              </span>
            </span>
          </button>
        </div>
        <div class="rack-actions">
          <button type="button" class="rack-put" hidden>${labels.put}</button>
          <a class="rack-detail" hidden>${labels.detail}</a>
        </div>
      </div>

    </div>`;
  const screen = root.querySelector('.rack-screen');
  const rack = root.querySelector('.rack-canvas');
  const ctx = rack.getContext('2d');
  const readout = root.querySelector('output');
  const selected = root.querySelector('.rack-selected');
  const putBack = root.querySelector('.rack-put');
  const detail = root.querySelector('.rack-detail');
  const frontCanvas = root.querySelector('.rack-front canvas');
  const cardName = root.querySelector('.rack-back strong');
  const note = root.querySelector('.rack-note');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const WIDTH = 312;
  const HEIGHT = 678;
  const REST_ANGLE = .29;
  const TURN_DURATION = 450;
  const LIFT_DURATION = 940;
  const RETURN_DURATION = 590;
  const SLOT_CLEARANCE_OFFSET = .36;
  const MAX_SWAY = 2.2;
  const MOMENTUM_WINDOW = 100;
  const COAST_DURATION = 580;
  const MAX_COAST = Math.PI / 4;
  const PIVOT_Y = 678;
  const SIDE_RADIUS = 79;
  const ROWS = [-113, 19, 151];
  const sideCount = Math.max(4, Math.ceil(records.length / 6));
  const sideTurn = Math.PI * 2 / sideCount;
  const sideCards = Array.from({ length: sideCount }, (_, side) =>
    records.slice(side * 6, side * 6 + 6).map((_, slot) => ({
      id: side * 6 + slot, side, x: slot % 2 ? 38 : -38, y: ROWS[Math.floor(slot / 2)],
    })),
  );

  const textures = records.map(record => paintCard(record));
  let hitAreas = [];
  let angle = REST_ANGLE;
  let sway = 0;
  let activeSide = 0;
  let targetAngle = REST_ANGLE;
  let selection = null;
  let gesture = null;
  let tappedCard = null;
  let rotationAnimation = 0;
  let keyboardCard = 0;
  let disposed = false;

  function project([x, y, z], rotation) {
    const depth = z * Math.cos(rotation) - x * Math.sin(rotation);
    const px = x * Math.cos(rotation) + z * Math.sin(rotation);
    const scale = 810 / (810 - depth);
    const py = 305 + (y + depth * .055) * scale;
    return [157 + px * scale * 1.075 + swayAt(py), py];
  }

  function swayAt(y) {
    return sway * (PIVOT_Y - y) / (PIVOT_Y - 99);
  }

  function drawPole() {
    ctx.save();
    ctx.transform(1, 0, -sway / (PIVOT_Y - 99), 1, sway * PIVOT_Y / (PIVOT_Y - 99), 0);
    const metal = ctx.createLinearGradient(151, 0, 167, 0);
    metal.addColorStop(0, '#686b68');
    metal.addColorStop(.17, '#adafac');
    metal.addColorStop(.38, '#dcddd7');
    metal.addColorStop(.72, '#92958f');
    metal.addColorStop(1, '#bcbeb9');
    ctx.fillStyle = metal;
    ctx.fillRect(151, 99, 16, HEIGHT - 66);
    for (const y of ROWS) {
      ctx.fillStyle = '#797c75';
      ctx.fillRect(151, y + 319, 16, 5);
    }
    ctx.restore();
  }

  function stroke(points, color, width) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function wire(points, rotation, brightness = 1, thickness = 1) {
    const path = points.map(point => project(point, rotation));
    ctx.globalAlpha = brightness;
    stroke(path.map(([x, y]) => [x + .55, y + .65]), '#64655e', thickness + .6);
    stroke(path, '#a7aaa1', thickness);
    stroke(path.map(([x, y]) => [x - .42, y - .37]), '#fbfcf6', thickness * .53);
    ctx.globalAlpha = 1;
  }

  function polygon(points, fill) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function drawTexture(image, quad, lighting) {
    const [tl, tr, br, bl] = quad;
    ctx.save();
    ctx.beginPath();
    quad.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.clip();
    // Thin affine strips follow the perspective of the four projected corners.
    const strips = 12;
    for (let i = 0; i < strips; i++) {
      const a = i / strips;
      const b = (i + 1) / strips;
      const x = tl[0] + (bl[0] - tl[0]) * a;
      const y = tl[1] + (bl[1] - tl[1]) * a;
      const rightX = tr[0] + (br[0] - tr[0]) * a;
      const rightY = tr[1] + (br[1] - tr[1]) * a;
      const endX = tl[0] + (bl[0] - tl[0]) * b;
      const endY = tl[1] + (bl[1] - tl[1]) * b;
      ctx.save();
      ctx.transform((rightX-x)/image.width, (rightY-y)/image.width, endX-x, endY-y, x, y);
      ctx.drawImage(image, 0, a*image.height, image.width, image.height/strips, 0, 0, image.width, 1.045);
      ctx.restore();
    }
    if (lighting > 0) {
      ctx.fillStyle = 'rgba(59,41,29,' + lighting + ')';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    ctx.restore();
  }

  function drawCard(card, rotation, front) {
    if (selection?.card === card) return;
    const { id } = card;
    const quad = locationOf(card, rotation);
    polygon(quad.map(([px, py]) => [px+1.8, py+1.8]), '#514333a6');
    if (front) {
      drawTexture(textures[id], quad, .06 + .22 * (1 - Math.cos(rotation)));
      hitAreas.push({ card, quad });
    } else {
      polygon(quad, '#b4a486');
      const [tl, tr, br, bl] = quad;
      const local = (u, v) => [
        tl[0]+(tr[0]-tl[0])*u+(bl[0]-tl[0])*v,
        tl[1]+(tr[1]-tl[1])*u+(bl[1]-tl[1])*v,
      ];
      polygon([local(.08,.07),local(.26,.07),local(.26,.18),local(.08,.18)], id % 3 ? '#57655b' : '#47424b');
      stroke([local(.09,.33),local(.48,.33)], '#71665488', .7);
      stroke([local(.09,.38),local(.44,.38)], '#71665488', .6);
      stroke([local(.09,.44),local(.71,.44)], '#71665488', .6);
    }
  }

  function drawSide(side, rotation, front) {
    const opacity = front ? .88 : .48;
    for (const x of [-73, 73]) wire([[x,-178,69],[x,260,69]], rotation, opacity, 1.13);
    for (const y of ROWS) {
      const bottom = y + 47;
      wire([[-82,bottom,62],[82,bottom,62]], rotation, opacity, 1.06);
      wire([[-82,y-21,65],[82,y-21,65]], rotation, opacity, .8);
      for (const x of [-82, 0, 82]) {
        wire([[x,bottom,58],[x,bottom,84],[x,bottom-19,84],[x,bottom-19,62]], rotation, opacity, .95);
      }
    }
    for (const card of sideCards[side]) drawCard(card, rotation, front);
    for (const y of ROWS) {
      const bottom = y + 47;
      for (const dy of [0, -19]) wire([[-82,bottom+dy,84],[82,bottom+dy,84]], rotation, opacity, 1.03);
      for (const x of [-82, 0, 82]) wire([[x,bottom,84],[x,bottom-19,84]], rotation, opacity, .96);
      wire([[-82,bottom+3,76],[82,bottom+3,76]], rotation, opacity * .66, .74);
    }
    wire([[-73,235,69],[73,235,69]], rotation, opacity * .65, .93);
    wire([[-73,260,69],[73,260,69]], rotation, opacity * .76, 1);
  }

  function render() {
    if (!textures.length) return;
    ctx.setTransform(rack.width / WIDTH, 0, 0, rack.height / HEIGHT, 0, 0);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    hitAreas = [];
    const faces = sideCards.map((_, side) => {
      const rotation = angle + side * sideTurn;
      return { side, rotation, depth: Math.cos(rotation) };
    }).sort((a, b) => a.depth - b.depth);
    for (const face of faces.filter(face => face.depth <= 0)) drawSide(face.side, face.rotation, false);
    drawPole();
    for (const y of ROWS) {
      for (const face of faces) {
        wire([[0,y+16,5],[0,y+16,SIDE_RADIUS]], face.rotation, .68, 2.8);
        wire([[0,y-15,4],[0,y-15,SIDE_RADIUS-5]], face.rotation, .47, 1.45);
      }
    }
    for (const face of faces.filter(face => face.depth > 0)) drawSide(face.side, face.rotation, true);
  }

  function resize() {
    const bounds = rack.getBoundingClientRect();
    const density = Math.min(devicePixelRatio || 1, 2.5);
    rack.width = Math.round(bounds.width * density);
    rack.height = Math.round(bounds.height * density);
    render();
    if (selection) fitPostcardText();
  }

  function sideAt(rotation) {
    return ((Math.round((REST_ANGLE - rotation) / sideTurn) % sideCount) + sideCount) % sideCount;
  }

  function settle(target, duration = TURN_DURATION) {
    targetAngle = target;
    cancelAnimationFrame(rotationAnimation);
    rack.dataset.turning = 'true';
    const from = angle;
    const startSway = sway;
    const impulse = MAX_SWAY * Math.tanh((target - from) * 2);
    const start = performance.now();
    activeSide = sideAt(target);
    keyboardCard = 0;
    readout.textContent = '';
    function tick(now) {
      const progress = reducedMotion.matches ? 1 : Math.min(1, (now - start) / duration);
      angle = from + (target - from) * (1 - (1-progress) ** 3);
      const remaining = 1 - progress;
      sway = (startSway * Math.cos(progress * 7) + impulse * Math.sin(progress * 7)) * remaining ** 2;
      render();
      if (progress < 1) rotationAnimation = requestAnimationFrame(tick);
      else rack.dataset.turning = 'false';
    }
    rotationAnimation = requestAnimationFrame(tick);
  }

  function turn(step) {
    const index = Math.round((targetAngle - REST_ANGLE) / sideTurn);
    settle(REST_ANGLE + (index - step) * sideTurn);
  }

  function hitTest(x, y) {
    return hitAreas.findLast(({ quad }) => {
      const signs = quad.map(([ax, ay], i) => {
        const [bx, by] = quad[(i+1) % quad.length];
        return (bx-ax)*(y-ay) - (by-ay)*(x-ax);
      });
      return signs.every(n => n >= 0) || signs.every(n => n <= 0);
    });
  }

  function locationOf(card, rotation = angle + card.side * sideTurn) {
    return [
      [card.x-32,card.y-44,67], [card.x+32,card.y-44,67],
      [card.x+32,card.y+45,77], [card.x-32,card.y+45,77],
    ].map(point => project(point, rotation));
  }

  function liftFrames(card) {
    const quad = locationOf(card);
    const [tl, tr, br, bl] = quad;
    const x = quad.reduce((total, p) => total+p[0], 0) / 4;
    const y = quad.reduce((total, p) => total+p[1], 0) / 4;
    const dx = (x / WIDTH - .5) * rack.clientWidth;
    const dy = (y / HEIGHT - .479) * rack.clientHeight;
    const scaleX = Math.max(.075, (Math.abs(tr[0]-tl[0])+Math.abs(br[0]-bl[0])) / 2 / (WIDTH*.64));
    const height = (Math.abs(bl[1]-tl[1])+Math.abs(br[1]-tr[1])) / 2 * rack.clientHeight / HEIGHT;
    const scaleY = height / selected.offsetHeight;
    const clearance = Math.min(34, height * .32);
    const skew = Math.atan2(tr[1]-tl[1], tr[0]-tl[0]) * 180 / Math.PI;
    const position = (x, y) => `translate(-50%, -50%) translate(${x}px, ${y}px) skewY(${skew}deg) scale(${scaleX}, ${scaleY})`;
    return [
      { transform: position(dx, dy), easing: 'cubic-bezier(.3,.05,.55,1)' },
      { transform: position(dx, dy - clearance), offset: SLOT_CLEARANCE_OFFSET, easing: 'cubic-bezier(.35,.08,.24,1)' },
      { transform: 'translate(-50%, -50%) translate(0px, 0px) skewY(0deg) scale(1, 1)' },
    ];
  }

  function fitPostcardText() {
    const fields = [cardName, note];
    for (const field of fields) field.style.removeProperty('font-size');
    note.style.removeProperty('line-height');
    const availableTitleHeight = note.offsetTop - cardName.offsetTop - 5;
    for (const field of fields) {
      let size = parseFloat(getComputedStyle(field).fontSize);
      const overflows = field === cardName
        ? () => cardName.offsetHeight > availableTitleHeight
        : () => note.scrollHeight > note.clientHeight;
      while (size > 10 && overflows()) {
        size -= .5;
        field.style.fontSize = size + 'px';
      }
      if (field === note && overflows()) note.style.lineHeight = '1.18';
    }
  }

  async function lift(card) {
    if (selection || disposed) return;
    cancelAnimationFrame(rotationAnimation);
    targetAngle = angle;
    selection = { card, back: false, settled: false };
    const destination = records[card.id];
    selected.dataset.back = 'false';
    frontCanvas.getContext('2d').drawImage(textures[card.id], 0, 0);
    cardName.textContent = destination.name;
    note.textContent = destination.summary || destination.intro || '';
    detail.href = buildingLink(destination);
    detail.hidden = true;
    selected.hidden = false;
    fitPostcardText();
    document.fonts.ready.then(() => {
      if (!disposed && selection?.card === card) fitPostcardText();
    });
    rack.tabIndex = -1;
    rack.dataset.turning = 'false';
    selected.classList.add('moving');
    render();
    const liftAnimation = selected.animate(liftFrames(card), {
      duration: reducedMotion.matches ? 0 : LIFT_DURATION,
    });
    const blurTimer = setTimeout(() => screen.classList.add('inspecting'), reducedMotion.matches ? 0 : LIFT_DURATION * SLOT_CLEARANCE_OFFSET);
    await liftAnimation.finished.catch(() => {});
    clearTimeout(blurTimer);
    if (disposed) return;
    screen.classList.add('inspecting');
    selection.settled = true;
    readout.textContent = destination.name + ' · ' + labels.front;
    selected.classList.remove('moving');
    putBack.hidden = false;
    if (document.activeElement === rack) selected.focus({ preventScroll: true });
  }

  function flip() {
    if (!selection?.settled) return;
    selection.back = !selection.back;
    selected.dataset.back = String(selection.back);
    detail.hidden = !selection.back;
    readout.textContent = records[selection.card.id].name + ' · ' + (selection.back ? labels.back : labels.front);
  }

  async function returnCard() {
    if (!selection?.settled) return;
    selection.settled = false;
    selected.classList.add('moving');
    putBack.disabled = true;
    detail.hidden = true;
    if (selection.back) {
      selected.dataset.back = 'false';
      const flipper = selected.querySelector('.rack-flipper');
      await Promise.allSettled(flipper.getAnimations().map(animation => animation.finished));
    }
    if (disposed) return;
    screen.classList.remove('inspecting');
    await selected.animate(liftFrames(selection.card), {
      direction: 'reverse',
      duration: reducedMotion.matches ? 0 : RETURN_DURATION,
    }).finished.catch(() => {});
    if (disposed) return;
    const restoreFocus = [selected, putBack, detail].includes(document.activeElement);
    selected.hidden = true;
    putBack.hidden = true;
    putBack.disabled = false;
    rack.tabIndex = 0;
    selection = null;
    readout.textContent = '';
    activeSide = sideAt(angle);
    render();
    if (restoreFocus) rack.focus({ preventScroll: true });
  }

  function pointerHit(event) {
    const bounds = rack.getBoundingClientRect();
    return hitTest((event.clientX-bounds.left)*WIDTH/bounds.width, (event.clientY-bounds.top)*HEIGHT/bounds.height);
  }

  rack.addEventListener('pointerdown', event => {
    if (selection || !textures.length || !event.isPrimary || event.button !== 0) return;
    cancelAnimationFrame(rotationAnimation);
    tappedCard = null;
    rack.setPointerCapture(event.pointerId);
    gesture = {
      pointer: event.pointerId, x: event.clientX, y: event.clientY, angle, dragged: false,
      samples: [{ x: event.clientX, time: event.timeStamp }],
    };
  });
  rack.addEventListener('pointermove', event => {
    if (gesture?.pointer !== event.pointerId) {
      rack.style.cursor = pointerHit(event) ? 'pointer' : 'grab';
      return;
    }
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 7) gesture.dragged = true;
    const samples = gesture.samples;
    samples.push({ x: event.clientX, time: event.timeStamp });
    while (samples.length > 2 && event.timeStamp - samples[1].time > MOMENTUM_WINDOW) samples.shift();
    if (!gesture.dragged) return;
    rack.style.cursor = 'grabbing';
    angle = gesture.angle + dx / rack.clientWidth * Math.PI;
    sway = reducedMotion.matches ? 0 : MAX_SWAY * Math.tanh(dx / 76);
    activeSide = sideAt(angle);
    render();
  });

  function finishGesture(event) {
    if (gesture?.pointer !== event.pointerId) return;
    const { dragged, samples } = gesture;
    gesture = null;
    rack.style.cursor = 'grab';
    const hit = !dragged && event.type === 'pointerup' ? pointerHit(event) : null;
    tappedCard = hit?.card ?? null;
    if (tappedCard) return;
    let coast = 0;
    if (dragged && event.type === 'pointerup' && !reducedMotion.matches) {
      const last = samples.at(-1);
      const first = samples[0];
      const duration = last.time - first.time;
      const freshness = Math.max(0, 1 - (event.timeStamp - last.time) / MOMENTUM_WINDOW);
      if (duration > 0 && duration <= MOMENTUM_WINDOW * 2) {
        const velocity = (last.x - first.x) / duration / rack.clientWidth * Math.PI;
        coast = Math.max(-MAX_COAST, Math.min(MAX_COAST, velocity * freshness * COAST_DURATION / 3));
      }
    }
    settle(angle + coast, coast ? COAST_DURATION : TURN_DURATION);
  }

  rack.addEventListener('click', () => {
    if (!tappedCard) return;
    const card = tappedCard;
    tappedCard = null;
    lift(card);
  });
  rack.addEventListener('pointerup', finishGesture);
  rack.addEventListener('pointercancel', finishGesture);
  rack.addEventListener('lostpointercapture', finishGesture);
  rack.addEventListener('keydown', event => {
    if (selection || !textures.length) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (step) {
      event.preventDefault();
      turn(step);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const cards = sideCards[activeSide];
      const card = cards[keyboardCard] || cards[0];
      if (card) lift(card);
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const cards = sideCards[activeSide];
      if (!cards.length) return;
      keyboardCard = (keyboardCard + (event.key === 'ArrowDown' ? 1 : -1) + cards.length) % cards.length;
      const name = records[cards[keyboardCard].id].name;
      readout.textContent = name;
    }
  });
  screen.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selection) returnCard();
  });
  selected.addEventListener('click', flip);
  putBack.addEventListener('click', returnCard);


  function paintCard(record, image, canvas = document.createElement('canvas'), poster = false) {
    canvas.width = 480;
    canvas.height = 680;
    const paint = canvas.getContext('2d');
    paint.scale(2, 2);
    paint.fillStyle = '#ebdbc0';
    paint.fillRect(0, 0, 240, 340);
    if (poster) {
      const titleHeight = 78;
      const artHeight = 328 - titleHeight;
      const scale = Math.max(216 / image.naturalWidth, artHeight / image.naturalHeight);
      const cropWidth = 216 / scale;
      const cropHeight = artHeight / scale;
      paint.drawImage(image, (image.naturalWidth - cropWidth) / 2, (image.naturalHeight - cropHeight) / 2,
        cropWidth, cropHeight, 12, titleHeight, 216, artHeight);
      paint.fillStyle = '#163d36';
      paint.font = '600 10px system-ui, sans-serif';
      paint.fillText(isEnglish ? 'SIPAILOU CAMPUS' : '东南大学 · 四牌楼', 21, 32);
      paint.font = '700 28px Georgia, "Songti SC", "SimSun", serif';
      paint.fillText(record.name, 20, 63, 197);
      return canvas;
    }

    paint.fillStyle = '#536658';
    paint.fillRect(12, 12, 216, 316);
    if (image) {
      const scale = Math.max(216 / image.naturalWidth, 316 / image.naturalHeight);
      const cropWidth = 216 / scale;
      const cropHeight = 316 / scale;
      paint.drawImage(image, (image.naturalWidth - cropWidth) / 2, (image.naturalHeight - cropHeight) / 2, cropWidth, cropHeight, 12, 12, 216, 316);
    }
    const shade = paint.createLinearGradient(0, 190, 0, 328);
    shade.addColorStop(0, '#1c251c00');
    shade.addColorStop(1, '#19261ce8');
    paint.fillStyle = shade;
    paint.fillRect(12, 190, 216, 138);
    paint.fillStyle = '#fff7e8';
    paint.font = '13px system-ui, sans-serif';
    paint.fillText(isEnglish ? 'SIPAILOU CAMPUS' : '四牌楼校区', 22, 281);
    paint.font = '600 25px system-ui, sans-serif';
    paint.fillText(record.name, 22, 311, 196);
    return canvas;
  }

  const observer = new ResizeObserver(resize);
  observer.observe(rack);
  resize();
  for (const [index, record] of records.entries()) {
    const image = new Image();
    let poster = true;
    image.onload = () => {
      if (disposed) return;
      paintCard(record, image, textures[index], poster);
      if (selection?.card.id === index) frontCanvas.getContext('2d').drawImage(textures[index], 0, 0);
      render();
    };
    image.onerror = () => {
      const fallback = record.cover || record.photo;
      if (!poster || !fallback || disposed) return;
      poster = false;
      image.src = fallback;
    };
    image.src = 'assets/rack-posters/' + encodeURIComponent(record.id) + '.webp';
  }
  root.dispose = () => {
    disposed = true;
    observer.disconnect();
    cancelAnimationFrame(rotationAnimation);
  };
}

