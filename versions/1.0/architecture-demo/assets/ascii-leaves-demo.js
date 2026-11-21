'use strict';

const rackDemo = document.querySelector('.building-rack');
mountBuildingRack(rackDemo, window.CAMPUS_PUBLISHED_BUILDINGS, {
  isEnglish: false,
  buildingLink: building => 'index.html?lang=zh-CN#building/' + encodeURIComponent(building.id),
});

const screenDemo = rackDemo.querySelector('.rack-screen');
const leaves = document.createElement('div');
leaves.className = 'leaf-layer';
leaves.setAttribute('aria-hidden', 'true');
const canvas = rackDemo.querySelector('.rack-canvas');
const title = rackDemo.querySelector('.rack-title');
screenDemo.insertBefore(leaves, canvas);

const leafDrawing = [
  '.......A.......',
  '......AAB......',
  '......ABBA.....',
  '..A..ABBBC..A..',
  '..AB.ABBBCAAB..',
  '...ABBBBBBCC...',
  '.AABBBBBBCCCAA.',
  'AABBBBBBCCCCCAA',
  '.AABBBBCCCCCAA.',
  '..AABBBCCCCAA..',
  '...AABBCCCAA...',
  '.....BCCCA.....',
  '......BCB......',
  '.......D.......',
  '.......D.......',
];
const glyphs = 'seu';
const palettes = [
  ['#a6bd63', '#789747', '#4e7448', '#95724a'],
  ['#e9cf6e', '#c8a442', '#a37f3c', '#967048'],
  ['#f2b86a', '#d78943', '#af6139', '#9a6543'],
  ['#e89881', '#cf6f58', '#a94941', '#925744'],
  ['#e4a0aa', '#c47492', '#9d526c', '#936471'],
  ['#c4a5cf', '#9e78ad', '#765d8e', '#856775'],
  ['#9fc4a9', '#72a288', '#4e7d68', '#82745b'],
  ['#aac5d0', '#799eae', '#527786', '#7d7470'],
  ['#cfaf7b', '#ae8956', '#856443', '#7c604a'],
];

function paintLeaf(leaf) {
  const palette = palettes[Math.floor(Math.random() * palettes.length)];
  let index = 0;
  for (const [y, row] of leafDrawing.entries()) {
    for (const [x, shade] of [...row].entries()) {
      if (shade === '.') continue;
      const tile = document.createElement('span');
      tile.style.gridArea = (y + 1) + ' / ' + (x + 1);
      tile.style.backgroundColor = palette[shade.charCodeAt(0) - 65];
      tile.textContent = glyphs[index++ % glyphs.length];
      leaf.append(tile);
    }
  }
}

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const between = (min, max) => min + Math.random() * (max - min);
const recentLandings = [];
let nextLeaf;

function chooseLanding(width, height, leafSize, rotation) {
  const wall = leaves.getBoundingClientRect();
  const rack = canvas.getBoundingClientRect();
  const heading = title.getBoundingClientRect();
  const radians = rotation * Math.PI / 180;
  const radius = leafSize * (Math.abs(Math.sin(radians)) + Math.abs(Math.cos(radians))) / 2;
  const center = rack.left - wall.left + rack.width / 2;
  const obstacles = [
    // The rack can rotate into this space while a leaf is on the wall.
    { left: center - rack.width * .39, right: center + rack.width * .39, top: height * .15, bottom: height * .9 },
    { left: center - rack.width * .04, right: center + rack.width * .04, top: height * .14, bottom: height },
    { left: heading.left - wall.left, right: heading.right - wall.left, top: heading.top - wall.top, bottom: heading.bottom - wall.top },
  ];
  if (width < 2 * radius || height < 2 * radius) return null;
  for (let attempt = 0; attempt < 100; attempt++) {
    const x = between(radius, width - radius);
    const y = between(radius, height - radius);
    if (obstacles.some(box => x + radius > box.left && x - radius < box.right &&
      y + radius > box.top && y - radius < box.bottom)) continue;
    const overlapsRecent = recentLandings.some(point =>
      Math.hypot(x / width - point.x, y / height - point.y) < .055);
    if (overlapsRecent) continue;
    recentLandings.push({ x: x / width, y: y / height });
    if (recentLandings.length > 9) recentLandings.shift();
    return { x, y };
  }
  return null;
}

function dropLeaf(initialProgress = 0) {
  const { clientWidth: width, clientHeight: height } = leaves;
  const cellSize = width < 600 ? between(2.6, Math.min(5.4, width / 76)) : between(5, 8.5);
  const leafSize = cellSize * 15 + 7;
  const rotation = between(-42, 42);
  const landing = chooseLanding(width, height, leafSize, rotation);
  if (!landing) return;

  const leaf = document.createElement('div');
  leaf.className = 'ascii-leaf';
  leaf.style.setProperty('--cell-size', cellSize + 'px');
  paintLeaf(leaf);
  leaves.append(leaf);

  const direction = between(0, 2 * Math.PI);
  const distance = between(.15, .46) * Math.min(width, height);
  const driftX = Math.cos(direction) * distance;
  const driftY = Math.sin(direction) * distance;
  const flutter = between(-30, 30);
  const frame = (offset, approach, curl, tilt, yaw, size, opacity) => {
    const x = landing.x - leafSize / 2 + (1 - approach) * driftX - curl * Math.sin(direction) * flutter;
    const y = landing.y - leafSize / 2 + (1 - approach) * driftY + curl * Math.cos(direction) * flutter;
    return {
      offset,
      transform: `translate(${x}px,${y}px) rotate(${tilt}deg) rotateY(${yaw}deg) scale(${size})`,
      opacity,
    };
  };

  const contact = between(.60, .74);
  const animation = leaf.animate([
    frame(0, 0, 0, rotation + between(-95, 95), between(-45, 45), .15, 0),
    frame(contact * .26, .23, .85, rotation + between(-35, 35), between(-30, 30), .32, .58),
    frame(contact * .55, .52, -.6, rotation + between(-27, 27), between(-30, 30), .58, .76),
    frame(contact * .82, .82, .32, rotation + between(-15, 15), between(-16, 16), .83, .86),
    frame(contact, 1, 0, rotation, 0, 1, .92),
    frame(.88, 1, 0, rotation, 0, 1, .92),
    frame(1, 1, 0, rotation, 0, 1, 0),
  ], { duration: between(4600, 8200), fill: 'both' });
  animation.currentTime = animation.effect.getTiming().duration * initialProgress;
  animation.finished.then(() => leaf.remove(), () => leaf.remove());
}

function scheduleLeaf() {
  nextLeaf = setTimeout(() => {
    if (!document.hidden && leaves.childElementCount < 7) dropLeaf();
    scheduleLeaf();
  }, between(900, 2250));
}

function updateLeaves() {
  clearTimeout(nextLeaf);
  for (const leaf of leaves.children) leaf.getAnimations().forEach(animation => animation.cancel());
  leaves.replaceChildren();
  if (motion.matches) return;
  for (let index = 0; index < 4; index++) dropLeaf(between(.15, .72));
  scheduleLeaf();
}

motion.addEventListener('change', updateLeaves);
updateLeaves();
