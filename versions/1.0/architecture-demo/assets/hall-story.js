'use strict';

const hallRuntimes = new Map();
function loadHallRuntime(isHall) {
  if (isHall && typeof Hall3DVendor !== 'undefined' && typeof buildHall === 'function') return Promise.resolve(Hall3DVendor.THREE);
  if (!isHall && typeof HallThree !== 'undefined') return Promise.resolve(HallThree);
  if (!hallRuntimes.has(isHall)) {
    const files = isHall ? ['hall-3d-vendor.js?v=169', 'hall-model.js?v=3'] : ['hall-three.min.js'];
    const runtime = Promise.all(files.map(file => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/' + file;
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error(file)); };
      document.head.append(script);
    }))).then(() => isHall ? Hall3DVendor.THREE : HallThree).catch(error => {
      hallRuntimes.delete(isHall);
      throw error;
    });
    hallRuntimes.set(isHall, runtime);
  }
  return hallRuntimes.get(isHall);
}

function hallTourMarkup(building) {
  const hall = building.id === "hall";
  const hallScenes = isEnglish ? [
    ['Along the central axis', 'Cross the plaza past the fountain toward the auditorium entrance.'],
    ['The portico and steps', 'Ionic columns and a triangular pediment frame the entrance.'],
    ['Around the side wing', 'Three floors of classrooms were added to each wing in 1965.'],
    ['Above the copper dome', 'The dome rises about 34 metres above the ground.'],
  ] : [
    ['沿中轴走近', '穿过中央大道与广场，走向涌泉和礼堂正门。'],
    ['门廊与台阶', '拾阶而上，爱奥尼柱与三角山花构成正面的门廊。'],
    ['绕到礼堂侧翼', '视线沿立面转向侧翼。1965 年，两翼各增建了三层教室。'],
    ['从上方看穹顶', '铜质穹顶最高处距地面约 34 米。'],
  ];
  const sections = building.sections.slice(0,2).map(({title,body}) => {
    const limit = isEnglish ? 165 : 78;
    if (body.length <= limit) return [title, body];
    const opening = body.slice(0,limit).match(isEnglish ? /^.*[.!?](?=\s|$)/ : /^.*[。！？]/)?.[0];
    return [title, opening || body.slice(0,limit).trimEnd() + '…'];
  });
  const scenes = hall ? hallScenes : [[t('overview'),building.summary || building.intro], ...sections];
  const photo = hall ? '../assets/photos/archives/hall/06.jpg' : building.photo;
  const photoAlt = hall
    ? (isEnglish ? 'The auditorium seen from the plaza' : '从广场望向大礼堂')
    : building.photoCaption || building.name;
  return `<section class="tour hall-tour hall-tour-in-archive" data-building="${esc(building.id)}" aria-labelledby="hall-tour-title">
    <div class="stage">
      <div class="model">
        ${photo ? `<img src="${imageUrl(photo)}" alt="${esc(photoAlt)}">` : ''}
      </div>
      <div class="stage-copy">
        <h1 id="hall-tour-title">${esc(building.name)}</h1>
        ${hall ? '' : `<span class="tour-model-note">${isEnglish ? 'Illustrative 3D model' : '3D 外观示意'}</span>`}
        ${scenes.map(([heading, description], index) => `<div class="chapter"${index ? ' hidden' : ''}><h2>${esc(heading)}</h2><p>${esc(description)}</p></div>`).join('')}
      </div>
      ${!hall && photo ? `<button class="tour-photo-button" id="enlarge-photo" type="button">${esc(t('viewPhoto'))} ${siteIcon('maximize', 14)}</button>` : ''}
      <button class="flame-entry" type="button">${isEnglish ? "Read the building tour" : "重看建筑导览"} ↗</button>
      <div class="progress" aria-hidden="true"><i></i></div>
    </div>
  </section>`;
}

function mountHallTour(tour) {
  const entry = tour.querySelector('.flame-entry');
  if (entry) entry.onclick = () => {
    const building = buildings.find(b => b.id === tour.dataset.building);
    if (building) openBuildingFlame(entry, isEnglish, building);
  };
  const stage = tour.querySelector('.stage');
  const model = tour.querySelector('.model');
  const chapters = [...tour.querySelectorAll('.chapter')];
  const archiveCopy = tour.classList.contains('hall-tour-in-archive')
    ? [...tour.parentElement.querySelectorAll('#overview h2, #overview .lead, #stories h2, #stories article h3, #stories article p')]
    : [];
  const links = [...document.querySelectorAll('.story-header nav a')];
  const progressBar = tour.querySelector('.progress i');
  const stops = [...tour.querySelectorAll('.stop')];
  const buildingId = tour.dataset.building || 'hall';
  const isHall = buildingId === 'hall';
  const chapterAt = isHall ? [.24, .55, .87] : chapters.slice(1).map((_, index) => (index + 1) / chapters.length);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const views = isHall ? [
    { at: 0, eye: [3, 11, 57], center: [0, 6.2, 3] },
    { at: .32, eye: [4, 9.2, 36], center: [0, 7.3, -2] },
    { at: .66, eye: [34, 12.4, 20], center: [0, 7.8, -5] },
    { at: 1, eye: [24, 30, 20], center: [0, 7.4, -3] },
  ] : [
    { at: 0, eye: [2, 9, 55], center: [0, 5.4, 0] },
    { at: .5, eye: [12, 10, 37], center: [0, 5.6, 0] },
    { at: 1, eye: [32, 22, 31], center: [0, 5.6, 0] },
  ];
  function initModel(THREE) {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      return null;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e6e3d6');
    scene.fog = new THREE.Fog('#e6e3d6', 55, 105);
    if (isHall) buildHall(scene, THREE);
    else buildCampusMassing(scene, buildingId);
    const path = new THREE.CatmullRomCurve3(views.map(view => new THREE.Vector3(...view.eye)));
    const target = new THREE.CatmullRomCurve3(views.map(view => new THREE.Vector3(...view.center)));
    const camera = new THREE.PerspectiveCamera(39, 1, .1, 200);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    model.append(renderer.domElement);
    return { THREE, renderer, scene, camera, path, target, focus: new THREE.Vector3() };
  }

  let world;
  let frame = 0;
  let lastWidth = 0;
  let lastHeight = 0;
  let chapter = -1;

  function easeBetween(value, start, end) {
    const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return t * t * (3 - 2 * t);
  }

  function updateCopy(progress, active) {
    tour.classList.toggle('hall-copy-motion', !motion.matches);
    chapters.forEach((item, index) => {
      if (motion.matches) {
        item.hidden = index !== active;
        item.removeAttribute('aria-hidden');
        return;
      }
      const entry = chapterAt[index - 1];
      const exit = chapterAt[index];
      const leaving = exit === undefined ? 0 : easeBetween(progress, exit - .043, exit + .012);
      const heading = entry === undefined ? 1 : easeBetween(progress, entry - .012, entry + .036);
      const body = entry === undefined
        ? easeBetween(progress, 0, .04) * .58 + .42
        : easeBetween(progress, entry + .004, entry + .056);
      item.hidden = heading === 0 || leaving === 1;
      item.setAttribute('aria-hidden', String(index !== active));
      item.style.setProperty('--heading-alpha', heading * (1 - leaving));
      item.style.setProperty('--body-alpha', body * (1 - leaving));
      item.style.setProperty('--heading-y', (1 - heading) * 15 - leaving * 10 + 'px');
      item.style.setProperty('--body-y', (1 - body) * 18 - leaving * 10 + 'px');
    });

  }

  // Start the fade when text enters the readable area. Time-based easing
  // keeps the reveal visible even when a flick jumps past the entry point.
  const archiveObserver = archiveCopy.length ? new IntersectionObserver(entries => {
    for (const { target, isIntersecting, boundingClientRect, rootBounds } of entries) {
      if (isIntersecting) target.classList.add('hall-copy-visible');
      else if (rootBounds && boundingClientRect.top >= rootBounds.bottom) {
        target.classList.remove('hall-copy-visible');
      }
    }
  }, { rootMargin: '0px 0px -88px 0px' }) : null;

  function syncArchiveMotion() {
    archiveObserver?.disconnect();
    for (const element of archiveCopy) {
      element.classList.toggle('hall-copy-reveal', !motion.matches);
      if (motion.matches) element.classList.remove('hall-copy-visible');
      else archiveObserver.observe(element);
    }
  }

  function render() {
    frame = 0;
    const top = parseFloat(getComputedStyle(stage).top);
    const travel = tour.offsetHeight - stage.offsetHeight;
    stops.forEach((stop, index) => {
      stop.style.top = Math.ceil(travel * (index ? chapterAt[index - 1] : 0)) + 'px';
    });
    const progress = Math.max(0, Math.min(1, (top - tour.getBoundingClientRect().top) / Math.max(1, travel)));
    const active = chapterAt.filter(at => progress + .001 >= at).length;
    if (active !== chapter) {
      chapter = active;
      links.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    updateCopy(progress, active);
    progressBar.style.transform = 'scaleX(' + progress + ')';
    if (!world || tour.getBoundingClientRect().bottom < 0) return;
    const { THREE, renderer, scene, camera, path, target, focus } = world;
    const width = model.clientWidth;
    const height = model.clientHeight;
    if (!width || !height) return;
    const mobile = width <= 720;
    if (width !== lastWidth || height !== lastHeight) {
      lastWidth = width;
      lastHeight = height;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = mobile ? Math.max(43, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(24)) / camera.aspect))) : 38;
      camera.updateProjectionMatrix();
      renderer.shadowMap.needsUpdate = true;
    }
    const position = motion.matches ? (views[active]?.at ?? 1) : progress;
    path.getPoint(position, camera.position);
    target.getPoint(position, focus);
    camera.lookAt(focus);
    camera.filmOffset = mobile ? 0 : -8;
    camera.setViewOffset(width, height, 0, mobile ? Math.round(height * .13) : 0, width, height);
    renderer.render(scene, camera);
    model.classList.add('is-ready');
  }

  function queueRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  const controller = new AbortController();
  const { signal } = controller;
  window.addEventListener('scroll', queueRender, { passive: true, signal });
  window.addEventListener('resize', queueRender, { signal });
  window.addEventListener('hashchange', queueRender, { signal });
  motion.addEventListener('change', queueRender, { signal });
  motion.addEventListener('change', syncArchiveMotion, { signal });
  syncArchiveMotion();
  loadHallRuntime(isHall).then(THREE => {
    if (signal.aborted) return;
    world = initModel(THREE);
    if (!world) tour.classList.add('tour-without-model');
    queueRender();
  }).catch(() => { if (!signal.aborted) tour.classList.add('tour-without-model'); });
  queueRender();
  tour.dispose = () => {
    controller.abort();
    archiveObserver?.disconnect();
    cancelAnimationFrame(frame);
    if (!world) return;
    const { scene, renderer } = world;
    scene.traverse(object => {
      object.geometry?.dispose();
      object.material?.dispose();
      object.shadow?.dispose();
    });
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
