'use strict';

// Approximate exterior massing based on the photographs in the campus archive.
const campusMassing = {
  library: [32,13,4,11,'#b5b4a4','flat','band'],
  meian: [20,8,1,6,'#a66f58','gable','porch'],
  liuchao: 'pine',
  nangao: [34,10,3,13,'#b0b0a4','flat','porch'],
  workshop: [30,9,2,9,'#a6a39a','gable','pilasters'],
  dongnan: [28,12,4,8,'#aba898','flat','band'],
  'mengfang-library': [27,10,2,9,'#9b988b','gable','temple'],
  gymnasium: [26,12,2,7,'#93988d','gable','tall'],
  zhongshan: [29,12,4,9,'#aaa99e','flat','band'],
  jianxiong: [28,12,3,9,'#88897e','dormer','temple'],
  zhongda: [25,12,3,7,'#97998b','gable','pilasters'],
  qiangong: [31,11,4,10,'#a8a89e','flat','band'],
  'south-gate': 'gate',
  jinling: [22,11,3,7,'#b8b4a8','flat','pilasters'],
  'alumni-hall': [23,10,2,8,'#cbc7b9','flat','canopy'],
  wusi: [29,13,3,9,'#979a8e','flat','canopy'],
  hehai: [20,9,2,6,'#82867b','hip','stairs'],
  wuwu: [27,13,3,9,'#adaca2','flat','court'],
  'power-building': [32,14,3,11,'#9f9f95','flat','court'],
  'wu-memorial': [20,10,3,6,'#b6b8ae','flat','glass'],
};

function buildCampusMassing(scene, id) {
  const T = HallThree;
  const material = color => new T.MeshStandardMaterial({ color, roughness: .86 });
  const stone = material('#d2c6ae');
  const glass = material('#435653');
  const roof = material('#58615b');
  const bark = material('#625447');
  const green = material('#5a7052');
  function mesh(geometry, x, y, z, surface) {
    const item = new T.Mesh(geometry, surface);
    item.position.set(x,y,z);
    item.castShadow = item.receiveShadow = true;
    scene.add(item);
    return item;
  }
  const box = (w,h,d,x,y,z,surface) => mesh(new T.BoxGeometry(w,h,d),x,y,z,surface);
  const cylinder = (rt,rb,h,x,y,z,surface) => mesh(new T.CylinderGeometry(rt,rb,h,10),x,y,z,surface);
  function roofPrism(w,d,h,y,z) {
    const shape = new T.Shape();
    shape.moveTo(-w/2,0);
    shape.lineTo(0,h);
    shape.lineTo(w/2,0);
    shape.closePath();
    mesh(new T.ExtrudeGeometry(shape,{ depth:d, bevelEnabled:false }),0,y,z-d/2,roof);
  }
  function branch(a,b,radius,surface) {
    const start = new T.Vector3(...a);
    const end = new T.Vector3(...b);
    const middle = start.clone().lerp(end,.5);
    const item = cylinder(radius*.42,radius,start.distanceTo(end),...middle.toArray(),surface);
    item.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());
  }
  scene.add(new T.HemisphereLight('#ecf2ff','#a5937d',2.6));
  const sun = new T.DirectionalLight('#fff1dd',2.9);
  sun.position.set(-17,29,20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{ left:-28, right:28, top:28, bottom:-28 });
  sun.shadow.normalBias = .05;
  scene.add(sun);
  box(110,.4,110,0,-.25,0,material('#a7af93')).castShadow = false;
  box(28,.1,26,0,0,10,material('#c6bea9'));

  const spec = campusMassing[id];
  if (spec === 'pine') {
    branch([0,0,0],[-1,7,0],.8,bark);
    branch([-1,7,0],[1,14,-.6],.58,bark);
    const limbs = [
      [[-1,5,0],[-5,8,2],.41], [[-1,7,0],[4,9,2],.38],
      [[0,10,0],[-4,13,-2],.3], [[.4,11,0],[4,12,-1],.31],
    ];
    for (const [a,b,r] of limbs) {
      branch(a,b,r,bark);
      branch(b,[b[0]+1,b[1]-2,b[2]+.5],r*.6,bark);
      mesh(new T.IcosahedronGeometry(1.35,1),...b,green).scale.set(1.45,.48,1);
    }
    branch([-3,0,2],[-1,7,0],.17,stone);
    branch([2,0,-2],[-1,7,0],.17,stone);
    return;
  }
  if (spec === 'gate') {
    for (const x of [-9,-3,3,9]) {
      box(1.45,7.5,2.2,x,3.75,0,stone);
      box(1.85,.45,2.6,x,.25,0,stone);
    }
    box(20,1.65,2.8,0,8,0,stone);
    box(20.6,.32,3.05,0,8.98,0,roof);
    const red = material('#a95142');
    for (const x of [-7.4,-4.6,-1.4,1.4,4.6,7.4]) {
      mesh(new T.SphereGeometry(.29,12,8),x,6.8,1.05,red).scale.y = .72;
    }
    return;
  }
  const [w,d,floors,bays,color,top,front] = spec;
  const wall = material(color);
  const floor = 2.6;
  const height = floors*floor;
  const z = d/2;
  const bay = (w-2)/bays;
  const sill = .36;
  box(w+.4,sill,d+.4,0,sill/2,0,stone);
  box(w,height,d,0,sill+height/2,0,wall);
  box(w+.65,.3,d+.65,0,sill+height+.11,0,stone);
  if (top === 'gable' || top === 'hip' || top === 'dormer') {
    roofPrism(w+.9,d+.8,top === 'hip' ? 1.7 : 2.4,sill+height+.26,0);
    if (top === 'dormer') for (const x of [-7,0,7]) {
      box(2.1,1.2,1.6,x,height+1.12,z*.62,wall);
      box(1.48,.72,.12,x,height+1.22,z*.62+.86,glass);
    }
  }
  for (let level=0;level<floors;level++) {
    const y = sill + level*floor + 1.46;
    const windowHeight = front === 'tall' ? 1.92 : 1.48;
    if (level && (front === 'band' || front === 'court')) {
      box(w+.15,.16,d+.15,0,y-1.08,0,stone);
    }
    for (let i=0;i<bays;i++) {
      if (level === 0 && Math.abs(i-(bays-1)/2) < 1) continue;
      const x = (i-(bays-1)/2)*bay;
      const windowWidth = bay*(front === 'band' || front === 'glass' ? .82 : .57);
      box(windowWidth,windowHeight,.1,x,y,z+.055,glass);
      box(windowWidth+.15,.09,.19,x,y-windowHeight/2,z+.11,stone);
      box(.07,windowHeight,.1,x,y,z+.12,stone);
    }
    for (const side of [-1,1]) for (let i=0;i<4;i++) {
      box(.1,windowHeight,d*.13,side*(w/2+.055),y,(i-1.5)*d*.22,glass);
    }
  }
  box(front === 'glass' ? 4.6 : 2.5,2.45,.15,0,1.58,z+.09,glass);
  if (front === 'temple' || front === 'porch' || front === 'canopy') {
    const porchWidth = front === 'porch' ? Math.min(w*.74,18) : w*.4;
    const porchHeight = front === 'temple' ? height*.86 : 3;
    const pillars = front === 'canopy' ? 2 : 4;
    for(let i=0;i<pillars;i++) {
      const x = (i/(pillars-1)-.5)*porchWidth*.82;
      if (front === 'temple') cylinder(.23,.29,porchHeight,x,sill+porchHeight/2,z+2,stone);
      else box(.44,porchHeight,.46,x,sill+porchHeight/2,z+2,stone);
    }
    box(porchWidth,.38,2.75,0,sill+porchHeight,z+1.12,stone);
    if (front === 'temple') roofPrism(porchWidth+.45,2.7,1.65,sill+porchHeight+.2,z+1.12);
  }
  if (front === 'pilasters') {
    for (let i=0;i<=bays;i++) box(.38,height*.87,.31,(i-bays/2)*bay,sill+height*.435,z+.16,stone);
  }
  if (front === 'court') {
    for (const side of [-1,1]) {
      const x = side*(w*.5-2.3);
      box(4.6,height,3.6,x,sill+height/2,z+1.8,wall);
      box(4.85,.23,3.85,x,sill+height,z+1.8,stone);
      for (let i=0;i<floors;i++) box(2.7,1.4,.12,x,sill+i*floor+1.45,z+3.66,glass);
    }
  }
  if (front === 'glass') {
    box(6,height+.32,1.4,0,sill+height/2,z+.73,glass);
    for (const x of [-2.85,-1.45,0,1.45,2.85]) box(.09,height+.34,.12,x,sill+height/2,z+1.5,stone);
    for(let i=1;i<=floors;i++) box(6,.09,.13,0,sill+i*floor,z+1.5,stone);
  }
  const stairs = front === 'stairs' ? 8 : 3;
  for(let i=0;i<stairs;i++) box(w*.34,.15,.68,0,.1+i*.13,z+3-i*.36,stone);
}
