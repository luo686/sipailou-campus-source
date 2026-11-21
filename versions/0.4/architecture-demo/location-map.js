'use strict';
const WORLD={w:1800,h:1800};
const places=window.CAMPUS_LAYOUT.places;
const mapNames = {
  'mengfang-library': 'Mengfang Library',
  qiangong: 'Qiangong Yuan',
  gate: 'Sipailou South Gate',
  nangao: 'Nangao Courtyard',
  jianxiong: 'Jianxiong Courtyard',
  liuchao: 'Six-Dynasty Pine',
  field: 'Sports Field',
  workshop: 'Engineering Workshop',
};
const mapName = place => CampusLanguage.isEnglish
  ? englishBuildings[place.id]?.name || mapNames[place.id] || place.name
  : place.name;
class BuildingMap extends Phaser.Scene{
 preload(){this.load.image('auditorium',window.CAMPUS_LAYOUT.hallImage);for(const [key,value] of Object.entries(window.CAMPUS_LAYOUT.materialImages||{}))this.load.image('material-'+key,value);if(window.CAMPUS_LAYOUT.sportsImage)this.load.image('sports-ground',window.CAMPUS_LAYOUT.sportsImage);if(window.CAMPUS_LAYOUT.liuchaoImage)this.load.image('liuchao',window.CAMPUS_LAYOUT.liuchaoImage);if(window.CAMPUS_LAYOUT.fountainImage)this.load.image('fountain',window.CAMPUS_LAYOUT.fountainImage);for(const b of window.CAMPUS_LAYOUT.buildingSprites)this.load.image('building-'+b.slug,b.image)}
 create(){
  this.drawCampus();
  const id=new URLSearchParams(location.search).get('building')||'hall';
  const target=[...places,...window.CAMPUS_LAYOUT.buildingInfo].find(b=>b.id===id);
  const cam=this.cameras.main;let zoom=.8;
  cam.setBounds(0,0,WORLD.w,WORLD.h).setZoom(zoom);
  const focus=()=>{if(target)cam.centerOn(target.x+target.w/2,target.y+target.h/2);else cam.centerOn(WORLD.w/2,WORLD.h/2)};
  focus();
  document.title = target
    ? mapName(target) + ' · ' + CampusLanguage.t('mapSuffix')
    : CampusLanguage.t('mapTitle');
  if(target){this.add.graphics().setDepth(20).lineStyle(3,0xb38b49,.9).strokeRoundedRect(target.x-9,target.y-13,target.w+18,target.h+25,10)}
  const canvas=this.game.canvas;canvas.style.cursor='grab';canvas.style.touchAction='none';
  this.input.enabled=false;
  const pointers=new Map();
  const point=ev=>{const r=canvas.getBoundingClientRect();return {x:(ev.clientX-r.left)*this.scale.width/r.width,y:(ev.clientY-r.top)*this.scale.height/r.height}};
  const geometry=()=>{const p=[...pointers.values()];if(p.length<2)return p[0]?{...p[0],distance:0}:null;return {x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}};
  const transform=(nextZoom,from,to=from)=>{
   const worldX=cam.scrollX+cam.width/2+(from.x-cam.width/2)/zoom;
   const worldY=cam.scrollY+cam.height/2+(from.y-cam.height/2)/zoom;
   zoom=Math.max(.3,Math.min(2,nextZoom));cam.setZoom(zoom);
   cam.scrollX=worldX-cam.width/2-(to.x-cam.width/2)/zoom;
   cam.scrollY=worldY-cam.height/2-(to.y-cam.height/2)/zoom;
  };
  const down=ev=>{if(ev.pointerType==='mouse'&&ev.button!==0)return;if(pointers.size>=2)return;ev.preventDefault();pointers.set(ev.pointerId,point(ev));canvas.setPointerCapture(ev.pointerId);canvas.style.cursor='grabbing'};
  const move=ev=>{if(!pointers.has(ev.pointerId))return;ev.preventDefault();const before=geometry();pointers.set(ev.pointerId,point(ev));const after=geometry();const ratio=before.distance>1&&after.distance>1?after.distance/before.distance:1;transform(zoom*ratio,before,after)};
  const release=ev=>{pointers.delete(ev.pointerId);if(canvas.hasPointerCapture(ev.pointerId))canvas.releasePointerCapture(ev.pointerId);canvas.style.cursor=pointers.size?'grabbing':'grab'};
  const wheel=ev=>{ev.preventDefault();const delta=ev.deltaY*(ev.deltaMode===1?16:ev.deltaMode===2?this.scale.height:1);transform(zoom*Math.exp(-Math.max(-500,Math.min(500,delta))*.0015),point(ev))};
  const handlers={pointerdown:down,pointermove:move,pointerup:release,pointercancel:release,lostpointercapture:release,wheel};
  for(const [name,handler] of Object.entries(handlers))canvas.addEventListener(name,handler,{passive:false});
  this.events.once('shutdown',()=>{for(const [name,handler] of Object.entries(handlers))canvas.removeEventListener(name,handler);pointers.clear()});
  const center=()=>({x:cam.width/2,y:cam.height/2});
  document.getElementById('zoom-in').onclick=()=>transform(zoom+.15,center());
  document.getElementById('zoom-out').onclick=()=>transform(zoom-.15,center());
  document.getElementById('focus-building').onclick=()=>{zoom=.8;cam.setZoom(zoom);focus()};
  this.scale.on('resize',focus);
 }
 label(text,x,y,size=16,color='#6d8060',spacing=0){let t=this.add.text(x,y,text,{fontFamily:'Microsoft YaHei, sans-serif',fontSize:size,color,letterSpacing:spacing}).setOrigin(.5).setDepth(7);return t}
 drawTerrain(d){
  const texture=this.textures.createCanvas('campus-terrain',WORLD.w,WORLD.h),c=texture.context;
  let seed=20261028;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
  const path=(ctx,pts,close=false)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(close)ctx.closePath()};
  const surface=(base,variation,seams=false)=>{
   const tile=document.createElement('canvas');tile.width=tile.height=256;const t=tile.getContext('2d');t.fillStyle=base;t.fillRect(0,0,256,256);
   for(let i=0;i<10000;i++){t.fillStyle=rnd()>.5?`rgba(255,250,223,${rnd()*variation})`:`rgba(39,42,28,${rnd()*variation})`;t.fillRect(rnd()*256,rnd()*256,1+rnd(),1+rnd())}
   if(seams){t.strokeStyle='rgba(82,76,65,.12)';t.lineWidth=.6;for(let y=0;y<=256;y+=16){t.beginPath();t.moveTo(0,y);t.lineTo(256,y);t.stroke();for(let x=(y%32?16:0);x<256;x+=32){t.beginPath();t.moveTo(x,y);t.lineTo(x,y+16);t.stroke()}}}
   return c.createPattern(tile,'repeat');
  };
  const material=(key,base,opacity,size=256)=>{const tile=document.createElement('canvas');tile.width=tile.height=size;const t=tile.getContext('2d');t.fillStyle=base;t.fillRect(0,0,size,size);t.globalAlpha=opacity;t.drawImage(this.textures.get('material-'+key).getSourceImage(),0,0,size,size);return c.createPattern(tile,'repeat')};
  const lawn=material('grass','#d4e4bd',.48),stone=surface('#eee7d5',.07,true),asphalt=material('asphalt','#969e9b',.72,192),paving=surface('#dedfd7',.055,true);
  c.fillStyle='#e6eadd';c.fillRect(0,0,WORLD.w,WORLD.h);
  // Broad, low-contrast variation keeps the ground at the same detail level as the roofs.
  for(let i=0;i<100;i++){const x=rnd()*WORLD.w,y=rnd()*WORLD.h,r=25+rnd()*110;const shade=c.createRadialGradient(x,y,0,x,y,r);shade.addColorStop(0,i%2?'rgba(144,169,105,.025)':'rgba(255,250,221,.12)');shade.addColorStop(1,'rgba(218,230,199,0)');c.fillStyle=shade;c.fillRect(x-r,y-r,r*2,r*2)}
  d.grounds.filter(b=>['park','garden'].includes(b.kind)).forEach(b=>{path(c,b.points,true);c.fillStyle=lawn;c.fill()});
  for(const z of d.terrainZones||[]){path(c,z.points,true);c.fillStyle=z.kind==='lawn'?lawn:z.kind==='plaza'?stone:paving;c.fill();if(z.kind==='lawn'){c.strokeStyle='#e9ecdc';c.lineWidth=2;c.stroke()}}
  // Stone foundations follow the real footprints instead of rectangular sprite bounds.
  c.lineJoin='round';for(const b of d.buildings){if(b.hidden)continue;path(c,b.points,true);c.fillStyle=stone;c.strokeStyle='rgba(104,111,88,.08)';c.lineWidth=11;c.stroke();c.strokeStyle=stone;c.lineWidth=8;c.stroke();c.fill()}
  const paintRoad=(ctx,r,width,paint)=>{path(ctx,r.points);ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=paint;ctx.stroke()};
  // Paint every outline before every road surface so junctions have no internal curbs.
  for(const r of d.roads)paintRoad(c,r,r.width+6,'rgba(106,114,92,.09)');
  for(const r of d.roads)paintRoad(c,r,r.width+3,'#c6cbbf');
  for(const r of d.roads)paintRoad(c,r,r.width,asphalt);
  const plaza=d.roundPlaza;
  if(plaza){c.beginPath();c.arc(plaza.x,plaza.y,plaza.outer+3,0,Math.PI*2);c.fillStyle='#c6cbbf';c.fill();c.beginPath();c.arc(plaza.x,plaza.y,plaza.outer,0,Math.PI*2);c.fillStyle=asphalt;c.fill();c.beginPath();c.arc(plaza.x,plaza.y,plaza.inner,0,Math.PI*2);c.fillStyle=stone;c.fill();c.strokeStyle='#d7ddce';c.lineWidth=3;c.stroke()}
  // Courtyard and fountain paving share the same warm limestone material.
  const f=d.fountain;c.beginPath();c.arc(f.x,f.y,44,0,Math.PI*2);c.fillStyle=stone;c.fill();
  texture.refresh();this.add.image(0,0,'campus-terrain').setOrigin(0).setDepth(-2);
 }

 drawCampus(){
  const d=window.CAMPUS_LAYOUT,g=this.add.graphics();let seed=67;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const polygon=(pts,fill,stroke=0xb6c5a1,alpha=1)=>{g.fillStyle(fill,alpha);g.lineStyle(1.5,stroke,alpha);g.beginPath();g.moveTo(...pts[0]);pts.slice(1).forEach(p=>g.lineTo(...p));g.closePath();g.fillPath();g.strokePath()};
  const line=(pts,width,color,alpha=1)=>{g.lineStyle(width,color,alpha);g.beginPath();g.moveTo(...pts[0]);pts.slice(1).forEach(p=>g.lineTo(...p));g.strokePath()};
  const box=pts=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)}};
  this.drawTerrain(d);
  // The western sports ground contains paved courts, rather than a football lawn.
  d.grounds.filter(b=>b.kind==='track').forEach(b=>{polygon(b.points,0xb7927b,0xa78370);const r=box(b.points),cx=r.x+r.w/2,cy=r.y+r.h/2;for(let k=1;k<4;k++){const pts=b.points.map(([x,y])=>[cx+(x-cx)*(1-k*.055),cy+(y-cy)*(1-k*.03)]);line(pts,1.5,0xe8c8ac,.8)}});
  d.grounds.filter(b=>b.kind==='pitch').forEach(b=>{const colors={tennis:0x8eab83,basketball:0xbca58b};polygon(b.points,colors[b.sport]||0xa9b09a,0xd8ddc2);const r=box(b.points),cx=r.x+r.w/2,cy=r.y+r.h/2;g.lineStyle(1.3,0xf0efdc,.85).lineBetween(r.x+4,cy,r.x+r.w-4,cy);if(b.sport==='basketball')g.strokeCircle(cx,cy,Math.min(r.w,r.h)*.17)});
  d.grounds.filter(b=>b.kind==='water'&&!(d.fountainImage&&b.name==='中央喷泉')).forEach(b=>{polygon(b.points,0x9dbfb1,0xdedfc4);const r=box(b.points);g.fillStyle(0xdde8d4).fillCircle(r.x+r.w/2,r.y+r.h/2,7);g.lineStyle(2,0xc9dcd0).strokeCircle(r.x+r.w/2,r.y+r.h/2,18)});
  const hall=places.find(p=>p.id==='hall');
  const painted=new Set(d.buildingSprites.flatMap(b=>b.ids));
  d.buildings.forEach((b,i)=>{if(b.hidden)return;const r=box(b.points);if(b.artOnly||['东南大学大礼堂','礼东','礼西'].includes(b.name)||painted.has(i))return;
   polygon(b.points.map(([x,y])=>[x+7,y+8]),0x65764f,0x65764f,.12);
   const p=places.find(p=>p.name===b.name),roof=p?.kind==='library'?0xb58b71:p?.kind==='traditional'?0x817562:[0x9b9e86,0x929e85,0x9d9b84,0xa29f88][i%4];polygon(b.points,roof,0x879178);
   const cx=r.x+r.w/2,cy=r.y+r.h/2;line(b.points.map(([x,y])=>[cx+(x-cx)*.86,cy+(y-cy)*.84]),1.5,0xc3c6ad,.8);g.lineStyle(1.5,0x6b7d64,.3);if(r.w>r.h)g.lineBetween(r.x+8,cy,r.x+r.w-8,cy);else g.lineBetween(cx,r.y+8,cx,r.y+r.h-8);
   if(p?.kind==='library'){g.fillStyle(0xe7ddbc).fillRect(r.x+r.w*.3,r.y+r.h-5,r.w*.4,10);g.fillStyle(0xc2c5a9).fillRect(r.x+r.w*.26,r.y+r.h+6,r.w*.48,5)}
  });
  g.generateTexture('campus-overlays',WORLD.w,WORLD.h);
  const base=this.textures.createCanvas('campus-base',WORLD.w,WORLD.h);
  base.context.drawImage(this.textures.get('campus-terrain').getSourceImage(),0,0);
  base.context.drawImage(this.textures.get('campus-overlays').getSourceImage(),0,0);base.refresh();
  if(d.fountainImage){const f=d.fountain;this.add.image(f.x,f.y,'fountain').setDisplaySize(f.size,f.size).setDepth(4)}
  const hs=d.hallSprite;this.add.image(hs.x+hs.w/2,hs.y+hs.h/2,'auditorium').setDisplaySize(hs.w,hs.h).setDepth(6);
  if(d.sportsImage){const f=d.sportsGround;this.add.image(f.x+f.w/2,f.y+f.h/2,'sports-ground').setDisplaySize(f.w,f.h).setDepth(3)}
  for (const b of d.buildingSprites) {
   const key = 'building-' + b.slug;
   if (b.slug === 'qiangong') {
    // Mirror the roof and connecting bays from the north wing to close the courtyard.
    const texture = this.textures.get(key);
    const { width, height } = texture.getSourceImage();
    const left = Math.round(width * .16);
    const wingHeight = Math.round(height * .26);
    const displayHeight = b.h * wingHeight / height;
    texture.add('south-wing', 0, left, 0, width - left * 2, wingHeight);
    this.add.image(b.x + b.w / 2, b.y + b.h - displayHeight / 2, key, 'south-wing')
     .setDisplaySize(b.w * (width - left * 2) / width, displayHeight)
     .setFlipY(true)
     .setDepth(6);
   }
   this.add.image(b.x + b.w / 2, b.y + b.h / 2, key, '__BASE')
    .setDisplaySize(b.displayW || b.w, b.displayH || b.h)
    .setRotation(b.rotation || 0)
    .setDepth(6);
  }
  const tree=places.find(p=>p.id==='liuchao');
  if(d.liuchaoImage&&tree)this.add.image(tree.x+tree.w/2,tree.y+tree.h/2,'liuchao').setDisplaySize(tree.w,tree.h).setDepth(7);
 }

 tree(g,x,y,s=1,pine=false){g.fillStyle(0x506843,.11).fillEllipse(x+10*s,y+15*s,65*s,34*s);g.fillStyle(0x8b8261).fillRoundedRect(x-3*s,y,6*s,25*s,2);g.fillStyle(pine?0x657f51:0x92af70).fillCircle(x,y-10*s,23*s);g.fillStyle(pine?0x7f985f:0xa8bf83).fillCircle(x-12*s,y-16*s,18*s);g.fillStyle(pine?0x708b54:0x9ab778).fillCircle(x+14*s,y-8*s,19*s);g.fillStyle(0xc0d49d,.45).fillCircle(x-9*s,y-23*s,9*s)}
 building(g,b){const{x,y,w,h}=b;g.fillStyle(0x596f4f,.13).fillRoundedRect(x+10,y+14,w+6,h+9,5);if(b.kind==='gate'){g.fillStyle(0xc1b493).fillRect(x,y,w,h);for(let dx of [12,57,126,173]){g.fillStyle(0xe8dfc6).fillRect(x+dx,y-9,13,h+28);g.fillStyle(0xb7ae91).fillRect(x+dx-3,y+h+15,19,7)}g.fillStyle(0xc5b797).fillRect(x-8,y-12,w+16,13);g.fillStyle(0x8e9d80).fillRect(x+74,y-10,48,9);this.label(CampusLanguage.t('gateSign'),x+w/2,y+7,12,'#52624f');return}
  g.fillStyle(0xc9c5a8).fillRect(x,y+12,w,h);g.fillStyle(0xe9dfc2).fillRect(x,y+h-24,w,32);g.fillStyle(0xb0b59b).fillRect(x-6,y+h+5,w+12,7);g.fillStyle(b.roof).fillRect(x-5,y-6,w+10,h-17);g.lineStyle(2,0xf7f2d1,.3).strokeRect(x+6,y+3,w-12,h-33);g.lineStyle(2,0x52644f,.16).lineBetween(x+w/2,y+5,x+w/2,y+h-25);for(let wx=x+15;wx<x+w-10;wx+=24){g.fillStyle(0x718775).fillRect(wx,y+h-16,9,13);g.fillStyle(0xece6cc).fillRect(wx-3,y+h-18,3,20)}g.fillStyle(0x607363).fillRect(x+w/2-12,y+h-16,24,22);g.fillStyle(0xd6d5bb).fillRect(x+w/2-35,y+h+11,70,5).fillRect(x+w/2-43,y+h+16,86,5);
  if(b.kind==='dome'){g.fillStyle(0xe5ddbf).fillCircle(x+w/2,y+h/2-6,58);g.fillStyle(0x718d7d).fillCircle(x+w/2,y+h/2-13,51);g.fillStyle(0x88a08a).fillEllipse(x+w/2-10,y+h/2-24,56,62);g.lineStyle(1,0xc1cdb0,.5).strokeCircle(x+w/2,y+h/2-13,43);g.fillStyle(0xe4dfbd).fillCircle(x+w/2,y+h/2-13,7);for(let i=0;i<7;i++){g.fillStyle(0xf1e8ce).fillRect(x+32+i*26,y+h-28,9,37);g.fillStyle(0xb9b99c).fillRect(x+29+i*26,y+h+6,15,4)}g.fillStyle(0xd2ccb1).fillTriangle(x+16,y+h-28,x+w/2,y+h-62,x+w-16,y+h-28)}
  if(b.kind==='library'){g.fillStyle(0xd9d4b5).fillTriangle(x+30,y+h-20,x+w/2,y+h-53,x+w-30,y+h-20);for(let i=0;i<6;i++){g.fillStyle(0xf4e9cc).fillRect(x+46+i*28,y+h-17,8,28)}}
  if(b.kind==='traditional'){g.fillStyle(0x756956).fillTriangle(x-17,y+6,x+w/2,y-20,x+w+17,y+6);g.lineStyle(3,0x9d9278).lineBetween(x-20,y+6,x+w+20,y+6);g.fillStyle(0x8e775d).fillRect(x+w/2-26,y+h-18,52,25)}
 }
 field(g,p){let{x,y,w,h}=p;g.fillStyle(0xc4a08b).fillRoundedRect(x,y,w,h,132);for(let i=0;i<5;i++)g.lineStyle(1,0xebccae,.8).strokeRoundedRect(x+9+i*8,y+9+i*8,w-18-i*16,h-18-i*16,121-i*7);g.fillStyle(0x9bb47c).fillRect(x+65,y+65,w-130,h-130);g.lineStyle(2,0xe4e9cc,.9).strokeRect(x+71,y+71,w-142,h-142).lineBetween(x+72,y+h/2,x+w-72,y+h/2).strokeCircle(x+w/2,y+h/2,28).strokeRect(x+105,y+72,w-210,35).strokeRect(x+105,y+h-107,w-210,35)}

}
if(window.Phaser)new Phaser.Game({type:Phaser.CANVAS,loader:{imageLoadType:'HTMLImageElement'},parent:'map',backgroundColor:'#dce7cf',antialias:true,scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight},scene:BuildingMap,input:{activePointers:2,keyboard:false},render:{roundPixels:true},audio:{noAudio:true}});else document.getElementById('map-error').hidden=false;
