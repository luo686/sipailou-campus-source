'use strict';

const T = THREE;
const $ = id => document.getElementById(id);
const canvas = $('scene');
const stage = $('stage');
const shelf = $('shelf');
const detail = $('detail');
const profile = $('profile');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const options = new URLSearchParams(location.search);
const english = options.get('lang') === 'en';
const embedded = options.has('guide');
const ui = (zh, en) => english ? en : zh;
const shortNames = english
  ? ['Physics','Space','Design','Tech','Materials','Health','Education','Arts','Business']
  : ['物理','航天','建筑','电子','材料','医学','教育','人文','经济'];
const galleryTitle = ui('校友唱片馆','Alumni Record Archive');
const university = ui('东南大学','Southeast University');
document.documentElement.lang = ui('zh-CN','en');
document.title = university + ' · ' + galleryTitle;
$('gallery-title').textContent = galleryTitle;
$('university').textContent = university;
$('back').textContent = ui('← 返回唱片架','← Back to the shelf');
for (const [id, zh, en] of [
  ['stage','唱片架，左右拖动或使用方向键，按回车抽出唱片','Record shelf. Drag or use the arrow keys. Press Enter to open.'],
  ['previous','上一张','Previous record'], ['next','下一张','Next record'],
  ['open','抽出唱片','Pull out the record'], ['timeline','选择领域','Choose a field'],
  ['tracks','校友名单','Alumni list'], ['profile-close','关闭人物介绍','Close profile'],
]) $(id).setAttribute('aria-label',ui(zh,en));
const palettes = [
  ['#6045a2','#f0e8ff','#b49af0'], ['#284582','#e7efff','#92b7ff'],
  ['#135b69','#e1f5f3','#79d1cf'], ['#ae4366','#fbe7ee','#f5a5bd'],
  ['#875518','#fff2ce','#f4c159'], ['#23634e','#e2f4e8','#93d5ac'],
  ['#a24330','#ffede3','#f7a17e'], ['#65429a','#f2eaff','#c2a5ef'],
  ['#225895','#e5f2ff','#8dc5f4'],
];
const albums = alumniFields.map((titles, id) => ({
  id, title: titles[english ? 1 : 0], short: shortNames[id],
  people: alumniPeople.filter(person => person.group === id),
}));
const wrap = index => ((index % albums.length) + albums.length) % albums.length;
const albumAt = index => albums[wrap(index)];
const label = index => String(wrap(index) + 1).padStart(3, '0');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const step = (value, from, to) => clamp((value - from) / (to - from), 0, 1);
const ease = value => value * value * (3 - 2 * value);
const segment = (value, from, to) => ease(step(value, from, to));
const mix = (a, b, t) => a + (b - a) * t;
const palette = index => palettes[wrap(index)];
let renderer;
let selected = 2;
let progress = 0;
let mode = 'shelf';
let dirty = true;
let width, height, size, baseline;
const boxes = new Map();
let record;

function showFallback() {
  const list = $('error');
  list.textContent = ui('3D 唱片架暂不可用。','The 3D record shelf is unavailable.');
  if (embedded) {
    for (const album of albums) {
      const heading = document.createElement('h2');
      heading.textContent = album.title;
      const entries = document.createElement('ul');
      for (const person of album.people) {
        const entry = document.createElement('li');
        entry.append(archiveLink(person, person.name));
        entries.append(entry);
      }
      list.append(heading,entries);
    }
  }
  shelf.hidden = true;
  list.hidden = false;
}

function archiveLink(person, label = ui('查看完整档案','View full profile')) {
  const link = document.createElement('a');
  link.href = '../index.html?lang=' + (english ? 'en' : 'zh-CN') + '#alumni/' + encodeURIComponent(person.id);
  link.target = '_parent';
  link.textContent = label;
  return link;
}

try {
  renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
} catch {
  showFallback();
}
if (renderer) initializeShelf();

function initializeShelf() {
renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth <= 600 ? 1.5 : 2));
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(35, 1, 1, 20000);

function texture(width, height, paint) {
  const image = document.createElement('canvas');
  image.width = width;
  image.height = height;
  paint(image.getContext('2d'));
  const map = new T.CanvasTexture(image);
  map.colorSpace = T.SRGBColorSpace;
  map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return map;
}

let target = selected;
let offset = selected;
let travel = null;
let drag = null;
let spin = false;
let spinAngle = 0;
let lastTime = 0;
let lastFocus;
let shelfY, trayRadius;
const materials = new Map();
const rack = new T.Group();
scene.add(rack);
const surface = new T.Group();
rack.add(surface);
const unitCylinder = new T.CylinderGeometry(1, 1, 1, 128);
const brushed = texture(512,512, ctx => {
  const gradient = ctx.createConicGradient(0,256,256);
  for (const [n,c] of [[0,'#dbc8a8'],[.18,'#fff6e6'],[.37,'#e9d9be'],[.58,'#fdf2dc'],[.78,'#e9d8bb'],[1,'#dbc8a8']]) gradient.addColorStop(n,c);
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,512,512);
  for (let i=1;i<365;i++) {
    ctx.strokeStyle = i % 3 ? '#ffffff24' : '#9a71391c';
    ctx.beginPath(); ctx.arc(256,256,i,0,Math.PI*2); ctx.stroke();
  }
});
const rimMap = texture(1024,48, ctx => {
  ctx.fillStyle = '#d7bf98'; ctx.fillRect(0,0,1024,48);
  for (const [y,c] of [[2,'#ffefd4'],[43,'#a98960']]) { ctx.fillStyle=c; ctx.fillRect(0,y,1024,3); }
  ctx.fillStyle = '#ac8c61';
  for (let x=0;x<1024;x+=5) { ctx.fillRect(x,14,3,6); ctx.fillRect(x+2,29,3,6); }
});
const tray = new T.Mesh(unitCylinder, [
  new T.MeshBasicMaterial({map:rimMap}), new T.MeshBasicMaterial({map:brushed}), new T.MeshBasicMaterial({color:0xc4a67d}),
]);
surface.add(tray);
surface.rotation.x = .16;

function paintCoverArt(ctx, id, color, paper, accent) {
  ctx.save();
  ctx.translate(32, 142);
  ctx.beginPath();
  ctx.rect(0, 0, 448, 328);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 448, 328);

  if (id % 3 === 2) {
    // Offset the crests to make the waves look like a layered print.
    const inks = [accent, paper, accent, paper, color];
    inks.forEach((ink, layer) => {
      const crest = 80 + layer * 55;
      const shift = id * 11 - layer * 20;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(-100, crest);
      ctx.bezierCurveTo(86 + shift, crest + 120, 152 + shift, crest - 136, 283 + shift, crest - 29);
      ctx.bezierCurveTo(373 + shift, crest + 46, 460, crest - 37, 520, crest - 45);
      ctx.lineTo(520, 360);
      ctx.lineTo(-100, 360);
      ctx.fill();
    });
  } else if (id % 3 === 0) {
    ctx.translate(224, 164);
    ctx.rotate(id % 2 ? -.42 : .42);
    const inks = [paper, accent, color];
    for (let band = 0; band < 7; band++) {
      ctx.strokeStyle = inks[band % inks.length];
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, 54 + band * 26, 31 + band * 16, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (let column = 0; column < 6; column++) {
      const x = 42 + column * 73;
      const top = 42 + (column * 43 + id * 23) % 109;
      ctx.fillStyle = column % 2 ? accent : paper;
      ctx.beginPath();
      ctx.roundRect(x - 25, top, 50, 290, [25, 25, 0, 0]);
      ctx.fill();
    }
  }
  ctx.restore();
}

function coverMaterials(index) {
  const key = label(index);
  if (materials.has(key)) return materials.get(key);
  const [color, paper, accent] = palette(index);
  const album = albumAt(index);
  const textColor = '#f6f4ec';
  const face = texture(512,512, ctx => {
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, 512, 512);
    paintCoverArt(ctx, album.id, color, paper, accent);
    ctx.fillStyle = color;
    ctx.font = '20px "Microsoft YaHei", sans-serif';
    ctx.fillText(ui('东南大学校友录', 'Southeast University'), 32, 55);
    ctx.font = 'bold 44px "Microsoft YaHei", sans-serif';
    ctx.fillText(album.title, 32, 110, 448);
    ctx.font = '17px Consolas';
    ctx.fillText(key, 32, 497);
  });
  const edge = texture(64,512, ctx => {
    ctx.fillStyle=color; ctx.fillRect(0,0,64,512);
    ctx.fillStyle='#ffffff33'; ctx.fillRect(0,0,2,512);
    ctx.fillStyle='#171a193b'; ctx.fillRect(60,0,4,512);
    ctx.translate(24,34); ctx.rotate(Math.PI/2);
    ctx.fillStyle=textColor; ctx.font='bold 30px "Microsoft YaHei", sans-serif'; ctx.fillText(album.short,0,0);
    const titleWidth = ctx.measureText(album.short).width;
    ctx.font='19px Consolas'; ctx.fillText('SEU–'+key,titleWidth+24,0);
    ctx.resetTransform(); ctx.beginPath(); ctx.arc(32,482,7,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=color; ctx.beginPath(); ctx.arc(32,482,2,0,Math.PI*2); ctx.fill();
  });
  const back = texture(256,256, ctx => {
    ctx.fillStyle=color; ctx.fillRect(0,0,256,256); ctx.fillStyle=textColor;
    ctx.font='bold 18px "Microsoft YaHei", sans-serif'; ctx.fillText(album.title,18,36,220);
    ctx.font='13px "Microsoft YaHei", sans-serif';
    album.people.slice(0,6).forEach((person,i) => ctx.fillText(String(i+1).padStart(2,'0')+'  '+person.name,18,69+i*19,220));
    ctx.fillRect(168,211,70,24); ctx.fillStyle=color;
    for (let i=0;i<25;i++) ctx.fillRect(171+i*2.5,214,i%3?1:2,18);
  });
  const flat = map => new T.MeshBasicMaterial({map});
  const faces = {front:flat(face), spine:flat(edge), back:flat(back), paper:new T.MeshBasicMaterial({color}), inside:new T.MeshBasicMaterial({color:0x262625})};
  materials.set(key,faces);
  return faces;
}

const plane = new T.PlaneGeometry(1,1);
const boxGeometry = new T.BoxGeometry(1,1,1);
function panel(parent, material, x,y,z,w,h,d) {
  const mesh = new T.Mesh(boxGeometry,material);
  mesh.position.set(x,y,z);
  mesh.scale.set(w,h,d);
  parent.add(mesh);
  return mesh;
}
function sleeve(index) {
  const mat = coverMaterials(index);
  const group = new T.Group();
  const depth = .073;
  // The front and back are separate panels. The right edge is a hollow opening.
  panel(group,[mat.paper,mat.paper,mat.paper,mat.paper,mat.front,mat.inside],0,0,depth/2,1,1,.008);
  panel(group,[mat.paper,mat.paper,mat.paper,mat.paper,mat.inside,mat.back],0,0,-depth/2,1,1,.008);
  panel(group,mat.paper,0,.497,0,1,.006,depth);
  panel(group,mat.paper,0,-.497,0,1,.006,depth);
  panel(group,mat.spine,-.497,0,0,.006,1,depth);
  // Keep the extraction opening hollow during both outward and return motion.
  const lip = new T.Group();
  return {group, lip};
}

const vinylMaps = new Map();
function vinyl(index) {
  const key = label(index);
  if (!vinylMaps.has(key)) {
    const [color,paper] = palette(index);
    vinylMaps.set(key,texture(768,768, ctx => {
      const sweep = ctx.createConicGradient(.3,384,384);
      for (const [n,c] of [[0,'#161418'],[.13,'#2d252f'],[.22,'#837482'],[.30,'#302731'],[.48,'#161419'],[.65,'#39303c'],[.74,'#716371'],[.83,'#29222b'],[1,'#161418']]) sweep.addColorStop(n,c);
      ctx.fillStyle=sweep; ctx.fillRect(0,0,768,768);
      for(let r=115;r<380;r+=5) {
        ctx.beginPath(); ctx.arc(384,384,r,0,Math.PI*2);
        ctx.strokeStyle = r % 3 ? '#0b090a85' : '#e2d8e43a'; ctx.lineWidth = r % 3 ? 1.4 : 2; ctx.stroke();
      }
      ctx.fillStyle=paper; ctx.beginPath(); ctx.arc(384,384,112,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=color; ctx.beginPath(); ctx.arc(384,384,91,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#37433e'; ctx.font='bold 38px "Microsoft YaHei", sans-serif'; ctx.textAlign='center'; ctx.fillText(albumAt(index).short,384,351,182);
      ctx.font='22px Consolas'; ctx.fillText(key,384,449);
    }));
  }
  const material = new T.MeshBasicMaterial({ map:vinylMaps.get(key), side:T.DoubleSide });
  return new T.Mesh(discGeometry,material);
}
const discGeometry = new T.RingGeometry(.008,.5,128);
const grooveUv = discGeometry.attributes.uv;
for (let i=0;i<grooveUv.count;i++) {
  const point = discGeometry.attributes.position;
  grooveUv.setXY(i,point.getX(i)+.5,point.getY(i)+.5);
}
let detailRecord, detailCover;

function rebuildSelection() {
  for (const mesh of [record,detailRecord,detailCover]) {
    if (!mesh) continue;
    mesh.removeFromParent();
    if (mesh === detailCover) continue;
    mesh.material.dispose();
  }
  record = vinyl(selected);
  detailRecord = vinyl(selected);
  detailCover = new T.Mesh(plane,coverMaterials(selected).front);
  scene.add(record,detailRecord,detailCover);
}

function resize() {
  width = innerWidth; height = innerHeight;
  const rect = stage.getBoundingClientRect();
  const mobile = width <= 600;
  size = Math.min(rect.height * (mobile ? .72 : .80),width * (mobile ? .48 : .254));
  baseline = rect.bottom - rect.height * .06;
  shelfY = height/2 - baseline + size/2;
  trayRadius = Math.max(size * 4.2, width * .86);
  renderer.setSize(width,height,false);
  camera.aspect=width/height;
  camera.position.set(0,0,height/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2))));
  camera.updateProjectionMatrix();
  tray.scale.set(trayRadius,size*.052,trayRadius);
  surface.position.set(0,height/2-baseline-10+trayRadius*Math.sin(surface.rotation.x),-trayRadius+size*.14);
  dirty=true;
}
window.addEventListener('resize',resize);
window.addEventListener('scroll',()=>{ dirty=true; },{passive:true});

function updateShelf() {
  const album = albumAt(selected);
  $('status').textContent = album.title;
  $('open').replaceChildren(album.title);
  const count = document.createElement('small');
  count.textContent = album.people.length + ui(' 位校友',' alumni');
  $('open').append(count);
  for (const [i, tick] of [...$('timeline').children].entries()) {
    if (label(i) === label(selected)) tick.setAttribute('aria-current','true');
    else tick.removeAttribute('aria-current');
  }
}
function choose(index) {
  if(mode !== 'shelf') return;
  target=index;
  selected=Math.round(target);
  updateShelf(); dirty=true;
}
function chooseTick(index) {
  const forward = wrap(index - selected);
  const distance = forward > albums.length / 2 ? forward - albums.length : forward;
  choose(selected+distance);
}
for(const { id, title, short } of albums) {
  const button=document.createElement('button');
  button.type='button';
  button.setAttribute('aria-label', title);
  button.innerHTML='<span class="ticks" aria-hidden="true">'+Array.from({length:13},(_,j)=>'<i style="--tick:'+ (4+(j*j+id*7+j*13)%19) +'px"></i>').join('')+'</span><span>'+short+'</span>';
  button.onclick=()=>chooseTick(id);
  $('timeline').append(button);
}

function placeBoxes(gap) {
  const mobile = width<=600;
  const keep=new Set();
  const base=Math.round(offset);
  const reach=Math.max(13,Math.ceil(width/size*.5/.135)+2);
  for(let index=base-reach;index<=base+reach;index++) {
    keep.add(index);
    if(!boxes.has(index)) {
      const box=sleeve(index);
      rack.add(box.group); boxes.set(index,box);
    }
    const {group,lip}=boxes.get(index);
    const d=index-offset;
    const magnitude=Math.abs(d);
    const sign=Math.sign(d);
    const turn=segment(magnitude,0,1.22);
    const spread = magnitude<1 ? magnitude*.62 : .62+(magnitude-1)*.135;
    const pack = d>.04 ? step(d,0,1) : 0;
    const retreat = gap*(pack*1.23 - (1-pack)*.57);
    const arc = Math.min(.115, .00067*magnitude*magnitude);
    group.position.set(size*(sign*spread+retreat),shelfY+size*arc,-size*(.03+turn*.51+Math.min(magnitude,10)*.016));
    const turnBack = d > 0 ? (1-step(d,1,2))*gap*.84 : 0;
    group.rotation.set(-.024,-sign*(1.53*turn+turnBack),0);
    group.scale.setScalar(size);
    lip.visible=!(gap>.9 && index===selected);
  }
  for(const [index,box] of boxes) if(!keep.has(index)) { rack.remove(box.group); boxes.delete(index); }
}

function positionDetailModels(settle) {
  const rect=$('art-position').getBoundingClientRect();
  const y=height/2-(rect.top+rect.height/2) - (1-settle)*12;
  const x=rect.left+rect.width/2-width/2;
  const s=rect.width;
  detailCover.position.set(x,y,0);
  detailCover.rotation.set(-.04,-.08,.022);
  detailCover.scale.setScalar(s);
  detailRecord.position.set(x+s*mix(.01,.42,settle),y,-s*.065);
  detailRecord.rotation.z=.34+spinAngle;
  detailRecord.scale.setScalar(s*.91);
}

function render() {
  const p=progress;
  const gap=segment(p,0,.23);
  const slide=segment(p,.25,.55);
  const zoom=step(p,.55,.88);
  const reveal=step(p,.75,.89);
  const settle=segment(p,.89,1);
  rack.visible=p<.89;
  if(rack.visible) placeBoxes(gap);
  record.visible=p>.21 && p<.89;
  detailCover.visible=detailRecord.visible=p>=.89;
  if(record.visible) {
    const box=boxes.get(selected).group;
    const extraction=new T.Vector3(1.03*slide,0,0).multiplyScalar(size).applyQuaternion(box.quaternion).add(box.position);
    const x=extraction.x;
    const y=extraction.y;
    const push=Math.pow(zoom,2.6);
    // Bring the record up to the camera after it has cleared the sleeve.
    record.position.set(mix(x,0,ease(zoom)),mix(y,height*.025,ease(zoom)),mix(extraction.z,size*.36,zoom));
    record.rotation.set(mix(box.rotation.x,0,ease(zoom)),mix(box.rotation.y,0,ease(zoom)),-.53*ease(zoom));
    record.scale.setScalar(mix(size*.93,Math.hypot(width,height)*3.95,push));
  }
  if(p>=.89) positionDetailModels(settle);
  if(!detail.hidden) {
    if(p<.89 && reveal>0) {
      const screen=record.position.clone().project(camera);
      const cx=(screen.x+1)*width*.5;
      const cy=(1-screen.y)*height*.5;
      const radius=Math.hypot(width,height)*Math.pow(reveal,1.65);
      detail.style.clipPath='circle('+radius+'px at '+cx+'px '+cy+'px)';
      canvas.style.maskImage='radial-gradient(circle at '+cx+'px '+cy+'px, transparent '+Math.max(0,radius-1)+'px, #000 '+radius+'px)';
    } else {
      detail.style.clipPath=p>=.89?'none':'circle(0px)';
      canvas.style.maskImage='';
    }
  }
  renderer.render(scene,camera);
}

function showDetail() {
  const album = albumAt(selected);
  detail.style.backgroundColor=palette(selected)[1];
  $('watermark').textContent=label(selected);
  $('edition').textContent=album.people.length+ui(' 位校友',' alumni');
  $('title').textContent=album.title;
  $('tracks').replaceChildren();
  for(const [index, person] of album.people.entries()) {
    const row=document.createElement('li');
    const button=document.createElement('button');
    button.type='button';
    const number = document.createElement('small');
    const name = document.createElement('span');
    const arrow = document.createElement('small');
    number.textContent = String(index + 1).padStart(2,'0');
    name.textContent = person.name;
    arrow.textContent = '↗';
    number.setAttribute('aria-hidden','true');
    arrow.setAttribute('aria-hidden','true');
    button.append(number,name,arrow);
    button.onclick=()=>showProfile(person,button);
    row.append(button); $('tracks').append(row);
  }
  detail.hidden=false;
  detail.classList.add('is-active');
  detail.scrollTop=0;
  detail.inert=true;
}
function showProfile(person, trigger) {
  if (mode !== 'detail' || profile.open) return;
  const heading = document.createElement('h2');
  heading.id = 'profile-title';
  heading.textContent = person.name;
  const biography = document.createElement('p');
  biography.textContent = person.bio;
  const relation = document.createElement('h3');
  relation.textContent = ui('与东南大学的关系','University connection');
  const affiliation = document.createElement('p');
  affiliation.textContent = person.affiliation;
  const content = $('profile-content');
  content.replaceChildren(heading,biography,relation,affiliation);
  if (person.photo) {
    const portrait = new Image();
    portrait.alt = person.name;
    portrait.src = (embedded ? '../assets/alumni-portraits/' : '../alumni-vinyl-demo/portraits/') + person.id + '.webp';
    portrait.addEventListener('error', () => portrait.remove(), { once:true });
    content.prepend(portrait);
  }
  if (embedded) content.append(archiveLink(person));
  profile.addEventListener('close', () => trigger.focus({ preventScroll:true }), { once:true });
  profile.showModal();
}
function setSpin(value) {
  spin = value;
  $('play').setAttribute('aria-pressed', String(value));
  $('play').textContent = value ? ui('Ⅱ 暂停转动','Ⅱ Pause') : ui('▷ 转动唱片','▷ Spin the record');
}
function open() {
  if(mode!=='shelf') return;
  lastFocus=document.activeElement;
  drag=null;
  selected=target=Math.round(target);
  offset=selected;
  setSpin(false); spinAngle=0;
  rebuildSelection();
  showDetail();
  shelf.classList.add('is-open');
  shelf.inert=true;
  mode='opening';
  travel={from:0,to:1,start:performance.now(),duration:reduced.matches?0:1940};
  dirty=true;
}
function close() {
  if(mode!=='detail' || profile.open) return;
  mode='closing';
  detail.inert=true;
  setSpin(false);
  travel={from:1,to:0,start:performance.now(),duration:reduced.matches?0:1380};
  dirty=true;
}
function frame(now) {
  const elapsed=Math.min(now-lastTime,50);
  lastTime=now;
  if(travel) {
    const time=travel.duration?step(now-travel.start,0,travel.duration):1;
    progress=mix(travel.from,travel.to,time);
    dirty=true;
    if(time===1) {
      travel=null;
      if(mode==='opening') {
        mode='detail'; detail.inert=false; $('back').focus({preventScroll:true});
      } else {
        mode='shelf'; detail.hidden=true; canvas.style.maskImage='';
        shelf.inert=false; shelf.classList.remove('is-open');
        (lastFocus===document.body?stage:lastFocus)?.focus({preventScroll:true});
      }
    }
  }
  if(mode==='shelf' && Math.abs(target-offset)>.0001) {
    offset=reduced.matches?target:mix(offset,target,1-Math.exp(-elapsed/(drag?28:122)));
    if(Math.abs(target-offset)<.001) offset=target;
    dirty=true;
  }
  if(mode==='detail' && spin && !reduced.matches) { spinAngle-=elapsed*.0021; dirty=true; }
  if(dirty) { render(); dirty=false; }
  requestAnimationFrame(frame);
}
const ray=new T.Raycaster();
const pointer=new T.Vector2();
stage.addEventListener('pointerdown',event=>{
  if(mode!=='shelf' || !event.isPrimary || event.button!==0) return;
  drag={id:event.pointerId,x:event.clientX,from:target,moved:false};
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove',event=>{
  if(event.pointerId!==drag?.id) return;
  const dx=event.clientX-drag.x;
  if(!drag.moved && Math.abs(dx)<7) return;
  drag.moved=true;
  choose(drag.from-dx/Math.max(34,size*.22));
});
stage.addEventListener('pointerup',event=>{
  if(event.pointerId!==drag?.id) return;
  const {moved}=drag; drag=null;
  if(moved) { choose(Math.round(target)); return; }
  pointer.set(event.clientX/width*2-1,1-event.clientY/height*2);
  ray.setFromCamera(pointer,camera);
  const visible=[...boxes.values()].map(box=>box.group);
  const hit=ray.intersectObjects(visible,true)[0];
  if(!hit) return;
  const hitIndex=[...boxes].find(([,box])=>box.group===hit.object.parent)?.[0];
  if(hitIndex===selected) open();
  else if(hitIndex!==undefined) choose(hitIndex);
});
stage.addEventListener('pointercancel',()=>{ if(drag) { drag=null; choose(Math.round(target)); } });
stage.addEventListener('wheel',event=>{
  if(Math.abs(event.deltaX)<Math.abs(event.deltaY) && !event.shiftKey) return;
  event.preventDefault(); choose(selected+Math.sign(event.deltaX||event.deltaY));
},{passive:false});
document.addEventListener('keydown',event=>{
  if(profile.open) return;
  if(event.key==='Escape') { close(); return; }
  if(mode!=='shelf') return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
    event.preventDefault(); choose(selected+(event.key==='ArrowRight'?1:-1));
  } else if(event.target===stage && ['Enter',' '].includes(event.key)) { event.preventDefault(); open(); }
});
$('previous').onclick=()=>choose(selected-1);
$('next').onclick=()=>choose(selected+1);
$('open').onclick=open;
$('back').onclick=close;
$('play').onclick=()=>setSpin(!spin);
$('profile-close').onclick=()=>profile.close();
detail.addEventListener('scroll',()=>{ dirty=true; },{passive:true});
rebuildSelection();
resize();
updateShelf();
setSpin(false);
requestAnimationFrame(frame);
}
