// Auditorium geometry from the project's model preview.
function makeHall(T) {
  const hall = new T.Group();
  hall.name = '四牌楼大礼堂';
  const material = (name, color, roughness = 0.89, metalness = 0) => {
    const m = new T.MeshStandardMaterial({color,roughness,metalness});
    m.name = name;
    return m;
  };
  const masonry = material('浅灰石墙','#aaa69a');
  const wing = material('两翼墙面','#aaa699');
  const base = material('台基石材','#8b8580');
  const stone = material('门廊石材','#c0baaa');
  const trim = material('檐口石材','#cbc3b2');
  const seam = material('砌缝','#807b70');
  const glass = material('深色玻璃','#36423d',0.49,0.12);
  const frame = material('窗框','#555b4e');
  const door = material('木门','#4b382d');
  const roof = material('两翼屋面','#494743');
  const copper = ['#4e786c','#527d70','#587e72','#4c746a'].map((color,i)=>material('穹顶铜板 '+(i+1),color,0.64,0.21));
  const rib = material('铜顶接缝','#46695e',0.7,0.18);
  const lantern = material('顶亭玻璃','#343534',0.57);
  const red = material('顶亭窗框','#704943');
  const shadow = material('门窗凹口','#777167');
  let group=hall;

  function component(name) {
    group=new T.Group();
    group.name=name;
    hall.add(group);
    return group;
  }
  function mesh(geometry,m,x=0,y=0,z=0,parent=group) {
    const object=new T.Mesh(geometry,m);
    object.position.set(x,y,z);
    object.castShadow=true;
    object.receiveShadow=true;
    parent.add(object);
    return object;
  }
  function box(w,h,d,x,y,z,m,parent=group) {
    return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
  }
  function oct(a,y,h,m,parent=group) {
    const radius=a/Math.cos(Math.PI/8);
    const object=mesh(new T.CylinderGeometry(radius,radius,h,8,1),m,0,y+h/2,0,parent);
    object.rotation.y=Math.PI/8;
    return object;
  }
  function stripFace(angle, x, z, parent=group) {
    const face=new T.Group();
    face.position.set(x,0,z);
    face.rotation.y=angle;
    parent.add(face);
    return face;
  }
  function windowAt(face,x,y,w,h,surround=true) {
    if (surround) box(w+0.32,h+0.32,0.18,x,y,0.03,stone,face);
    box(w+0.06,h+0.08,0.12,x,y,0.13,shadow,face);
    box(w,h,0.10,x,y,0.145,frame,face);
    for (const side of [-1,1]) {
      box(w*0.42,h*0.89,0.05,x+side*w*0.233,y,0.205,glass,face);
    }
    for (const f of [-0.28,-0.08,0.12,0.32]) box(w,0.048,0.056,x,y+h*f,0.228,frame,face);
    if (surround) box(w+0.42,0.15,0.24,x,y-h/2-0.16,0.08,trim,face);
  }
  function doorway(face,x,y,w,h) {
    box(w+0.25,h+0.22,0.17,x,y,0.07,shadow,face);
    box(w,h,0.12,x,y,0.16,door,face);
    box(w*0.87,h*0.29,0.04,x,y+h*0.285,0.234,glass,face);
    box(0.06,h,0.06,x,y,0.24,frame,face);
    box(w,0.07,0.065,x,y+h*0.13,0.24,frame,face);
  }
  function course(face,width,height,startY,step) {
    for (let y=startY;y<height;y+=step) box(width,0.017,0.027,0,y,0.012,seam,face);
  }

  component('八角形礼堂主体');
  oct(18.55,0,0.5,base);
  oct(18.25,0.5,5.38,base);
  oct(18.62,5.68,0.34,stone);
  oct(18.17,6.02,10.38,masonry);
  oct(18.65,16.38,0.33,stone);
  oct(19,16.7,0.38,trim);
  oct(18.79,17.08,0.35,stone);
  for (let i=0;i<8;i++) {
    if (i%2===0) continue;
    const theta=i*Math.PI/4;
    const face=stripFace(theta,Math.sin(theta)*18.18,Math.cos(theta)*18.18);
    course(face,14.92,16.35,6.71,0.8);
    for (const x of [-4.5,0,4.5]) {
      windowAt(face,x,8.75,1.43,2.83);
      windowAt(face,x,13.51,1.43,3.1);
      windowAt(face,x,2.88,1.16,1.7,false);
    }
    for (const x of [-6.83,6.83]) box(0.7,10.2,0.21,x,11.19,0.095,stone,face);
  }
  for (const side of [-1,1]) {
    const face=stripFace(side*Math.PI/2,side*18.17,0);
    for (const x of [-5,0,5]) windowAt(face,x,14.48,1.45,2.66);
  }

  component('南立面与门厅');
  const frontZ=24.14;
  const south=stripFace(0,0,frontZ);
  box(31,5.9,9.5,0,2.95,frontZ-4.75,base);
  box(30.7,10.24,9.42,0,11.0,frontZ-4.72,masonry);
  box(31.4,0.38,9.78,0,5.96,frontZ-4.76,stone);
  box(31.5,0.33,9.7,0,16.26,frontZ-4.65,stone);
  box(31.72,0.32,9.94,0,16.58,frontZ-4.65,trim);
  course(south,30.65,16.1,6.55,0.77);
  course(south,30.55,5.72,0.7,0.72);
  for (const x of [-6.8,0,6.8]) {
    windowAt(south,x,8.91,1.62,2.55);
    windowAt(south,x,13.57,1.58,2.9,false);
    doorway(south,x,2.68,2.21,4.22);
  }
  for (const x of [-12.8,12.8]) {
    windowAt(south,x,12.37,1.62,3.68,false);
    box(2.04,3.61,0.16,x,8.27,0.071,shadow,south);
    box(1.78,3.29,0.187,x,8.27,0.078,stone,south);
    windowAt(south,x,2.6,1.6,2.4,false);
  }
  for (const x of [-15,-10.6,10.6,15]) {
    box(0.85,9.96,0.23,x,11.16,0.15,stone,south);
    box(0.97,0.28,0.32,x,6.24,0.15,trim,south);
  }
  for (const side of [-1,1]) {
    const face=stripFace(side*Math.PI/2,side*15.5,21.31);
    windowAt(face,0,10.8,1.56,3.65);
  }
  const columnZ=26.4;
  box(22,0.42,3.45,0,6.0,25.24,stone);
  box(22.1,0.23,3.55,0,6.31,25.24,trim);
  const profile=[
    [0.45,6.43],[0.64,6.43],[0.64,6.57],[0.59,6.64],[0.55,6.74],
    [0.50,6.84],[0.50,7.06],[0.50,8.1],[0.49,9.4],[0.47,11.7],
    [0.421,14.72],[0.44,14.82],[0.48,14.9],[0.53,15.01],[0.56,15.13],[0.56,15.23]
  ];
  for (const x of [-9.51,-3.17,3.17,9.51]) {
    box(1.39,0.16,1.39,x,6.47,columnZ,stone);
    mesh(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),40),stone,x,0,columnZ);
    box(1.25,0.22,1.25,x,15.33,columnZ,trim);
  }
  box(22.5,1.02,3.84,0,15.91,25.09,stone);
  box(23.05,0.25,4,0,16.54,25.09,trim);
  function pediment(w,rise,depth,y,z,m) {
    const s=new T.Shape();
    s.moveTo(-w/2,0);
    s.lineTo(w/2,0);
    s.lineTo(0,rise);
    s.closePath();
    mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:false}),m,0,y,z);
  }
  pediment(23.35,2.95,3.92,16.66,23.22,trim);
  pediment(20.45,2.40,0.08,16.72,27.15,stone);
  for (const side of [-1,1]) {
    const eave=box(12.18,0.25,0.32,side*5.8,18.15,27.17,trim);
    eave.rotation.z=-side*Math.atan2(2.95,11.675);
  }
  for (let i=0;i<6;i++) {
    const y=0.18*(i+1);
    box(22.35-0.15*i,y,0.58,0,y/2,29.04-0.58*i,trim);
  }
  box(21.55,1.08,1.47,0,0.54,24.95,stone);
  for (const x of [-10.9,10.9]) {
    box(0.76,1.52,2.95,x,0.76,25.94,stone);
    box(0.92,0.13,3.08,x,1.58,25.94,trim);
  }

  component('北侧舞台楼');
  box(26.05,14.13,14.7,0,7.065,-21.55,masonry);
  box(26.4,0.36,15,0,0.48,-21.55,base);
  box(26.62,0.36,15.29,0,14.18,-21.55,stone);
  box(25.9,0.29,14.9,0,14.5,-21.55,roof);
  const north=stripFace(Math.PI,0,-28.91);
  course(north,25.95,14.1,0.9,0.85);
  for (const x of [-10.0,-7.0,-3.5,3.5,7,10.0]) {
    windowAt(north,x,5.5,1.42,2.73);
    windowAt(north,x,10.35,1.45,2.73);
  }
  doorway(north,0,2.15,2.45,4.07);

  for (const side of [-1,1]) {
    component(side<0?'西翼与端楼':'东翼与端楼');
    box(27.05,11.92,13.5,side*30.26,5.96,-0.15,wing);
    box(27.1,0.48,13.73,side*30.26,0.24,-0.15,base);
    box(27.25,0.24,13.84,side*30.26,5.31,-0.15,stone);
    box(27.4,0.38,14.05,side*30.26,11.86,-0.15,stone);
    box(27.15,0.28,13.79,side*30.26,12.09,-0.15,roof);
    box(11.8,14.53,32.25,side*48.90,7.265,-1.05,wing);
    box(12.08,0.45,32.54,side*48.90,0.23,-1.05,base);
    box(12.24,0.47,32.76,side*48.90,14.45,-1.05,stone);
    box(11.96,0.26,32.42,side*48.90,14.78,-1.05,roof);
    for (const direction of [-1,1]) {
      const face=stripFace(direction===1?0:Math.PI,side*30.26,-0.15+direction*6.75);
      for (let i=0;i<8;i++) {
        const x=-11.25+3.14*i;
        windowAt(face,x,8.42,1.58,3.16);
        if (i===4 && direction===1) doorway(face,x,1.96,1.6,3.7);
        else windowAt(face,x,2.78,1.53,2.22,false);
      }
      course(face,26.9,11.58,5.7,0.77);
      const pavilion=stripFace(direction===1?0:Math.PI,side*48.90,-1.05+direction*16.125);
      for (const x of [-3.75,0,3.75]) {
        for (const y of [2.65,7.16,11.57]) windowAt(pavilion,x,y,1.53,2.78);
      }
      course(pavilion,11.65,14.15,1.02,0.82);
    }
    const sideFace=stripFace(side*Math.PI/2,side*54.81,-1.05);
    for (let x=-13.0;x<14;x+=3.68) {
      for (const y of [2.65,7.16,11.57]) windowAt(sideFace,x,y,1.55,2.65);
    }
    course(sideFace,32.15,14.15,1.02,0.82);
  }

  component('八边穹顶与顶亭');
  oct(16.96,17.4,0.33,base);
  oct(16.78,17.73,2.63,stone);
  oct(17.0,20.31,0.21,rib);
  const contours=[
    [17.0,20.48],[16.74,20.87],[16.02,22.1],[14.98,23.62],
    [13.64,25.12],[12.08,26.38],[10.38,27.49],[8.48,28.44],
    [6.61,29.18],[4.98,29.66]
  ];
  function domePoint(theta,a,y) {
    const sectorAngle=Math.PI/4;
    const nearest=Math.round(theta/sectorAngle)*sectorAngle;
    const r=a/Math.cos(theta-nearest);
    return new T.Vector3(Math.sin(theta)*r,y,Math.cos(theta)*r);
  }
  for (let i=0;i<64;i++) {
    const start=(i-4)*Math.PI/32;
    const end=start+Math.PI/32;
    const vertices=[];
    for (let j=0;j<contours.length-1;j++) {
      const a=domePoint(start,...contours[j]);
      const b=domePoint(end,...contours[j]);
      const c=domePoint(end,...contours[j+1]);
      const d=domePoint(start,...contours[j+1]);
      for (const v of [a,b,c,a,c,d]) vertices.push(v.x,v.y,v.z);
    }
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    geometry.computeVertexNormals();
    mesh(geometry,copper[(i*7+Math.floor(i/8))%4]);
    const edge=contours.map(([a,y])=>domePoint(start,a+0.017,y+0.022));
    const curve=new T.CurvePath();
    for (let j=0;j<edge.length-1;j++) curve.add(new T.LineCurve3(edge[j],edge[j+1]));
    mesh(new T.TubeGeometry(curve,18,i%8===0?0.064:0.027,4,false),rib);
  }
  oct(5,29.58,0.28,rib);
  oct(4.63,29.86,2.54,red);
  for (let side=0;side<8;side++) {
    const theta=side*Math.PI/4;
    const face=stripFace(theta,Math.sin(theta)*4.64,Math.cos(theta)*4.64);
    for (const x of [-1.04,0,1.04]) box(0.87,1.75,0.055,x,31.04,0.035,lantern,face);
  }
  oct(4.98,32.36,0.38,rib);
  const cap=mesh(new T.CylinderGeometry(0.36,5.43,0.96,8),copper[0],0,33.14,0);
  cap.rotation.y=Math.PI/8;
  mesh(new T.SphereGeometry(0.22,12,8),rib,0,33.77,0);
  return hall;
}

function batchHallMeshes(THREE, model) {
  model.updateMatrixWorld(true);
  const batches = new Map();
  model.traverse(mesh => {
    if (!mesh.isMesh) return;
    const { geometry, material } = mesh;
    if (!batches.has(material)) batches.set(material, { positions: [], normals: [] });
    const batch = batches.get(material);
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    const position = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const count = geometry.index?.count ?? geometry.attributes.position.count;
    for (let i = 0; i < count; i++) {
      const vertex = geometry.index ? geometry.index.getX(i) : i;
      position.fromBufferAttribute(geometry.attributes.position, vertex).applyMatrix4(mesh.matrixWorld);
      normal.fromBufferAttribute(geometry.attributes.normal, vertex).applyNormalMatrix(normalMatrix);
      batch.positions.push(position.x, position.y, position.z);
      batch.normals.push(normal.x, normal.y, normal.z);
    }
    geometry.dispose();
  });

  const hall = new THREE.Group();
  hall.name = model.name;
  for (const [material, { positions, normals }] of batches) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;
    hall.add(mesh);
  }
  return hall;
}

function addHallModel(THREE, scene) {
  const hall = batchHallMeshes(THREE, makeHall(THREE));
  const bounds = new THREE.Box3().setFromObject(hall);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 30 / size.x;
  hall.scale.setScalar(scale);
  // Keep the facade on the plaza axis and align the base to the ground.
  hall.position.set(-center.x * scale, -bounds.min.y * scale, 5 - bounds.max.z * scale);
  scene.add(hall);
  return hall;
}

function addHallFountain(THREE, scene) {
  const fountain = new THREE.Group();
  fountain.name = '八角形喷泉';
  fountain.position.z = 14.7;
  scene.add(fountain);

  const granite = new THREE.MeshStandardMaterial({ color: '#a49b8c', roughness: .9, flatShading: true });
  const coping = new THREE.MeshStandardMaterial({ color: '#c4b8a4', roughness: .8, flatShading: true });
  const bronze = new THREE.MeshStandardMaterial({ color: '#334836', roughness: .52, metalness: .3 });
  const rim = new THREE.MeshStandardMaterial({ color: '#52634b', roughness: .51, metalness: .26 });
  const poolWater = new THREE.MeshStandardMaterial({ color: '#24747a', roughness: .25, metalness: .13 });
  const spray = new THREE.MeshStandardMaterial({
    color: '#c1edf0', emissive: '#3f747c', roughness: .25, transparent: true,
    opacity: .48, depthWrite: false, side: THREE.DoubleSide
  });

  function mesh(geometry, material, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = !material.transparent;
    object.receiveShadow = true;
    fountain.add(object);
    return object;
  }
  function lathe(profile, segments) {
    return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  }
  function octagonalRing(profile, material) {
    const ring = mesh(lathe(profile, 8), material);
    ring.rotation.y = Math.PI / 8;
  }

  octagonalRing([[6.63, .02], [7.58, .02], [7.74, .15], [7.68, .24], [6.63, .24], [6.63, .02]], granite);
  octagonalRing([[6.46, .02], [6.95, .02], [7.03, .46], [6.97, .55], [6.53, .55], [6.46, .43], [6.46, .02]], coping);
  const basin = mesh(new THREE.CylinderGeometry(6.52, 6.52, .06, 8), poolWater, 0, .35, 0);
  basin.rotation.y = Math.PI / 8;

  // The inscription slab is on the side of the pool opposite the auditorium.
  const plaque = mesh(new THREE.BoxGeometry(2.8, .17, .82), coping, 0, .65, 6.34);
  plaque.rotation.x = -.14;

  const column = new THREE.CylinderGeometry(.115, .135, 1.46, 12);
  const foot = new THREE.CylinderGeometry(.15, .17, .09, 12);
  for (const x of [-.38, .38]) {
    for (const z of [-.38, .38]) {
      mesh(column, bronze, x, 1.11, z);
      mesh(foot, rim, x, .42, z);
    }
  }
  mesh(lathe([[.08, 1.78], [.53, 1.78], [.92, 1.91], [1.3, 2.14], [1.43, 2.3],
    [1.42, 2.36], [1.32, 2.36], [1.25, 2.25], [.75, 2.13], [.08, 2.13], [.08, 1.78]], 48), bronze);
  const upperWater = mesh(new THREE.CylinderGeometry(1.29, 1.27, .035, 48), poolWater, 0, 2.28, 0);
  upperWater.castShadow = false;
  mesh(new THREE.TorusGeometry(1.42, .028, 8, 48), rim, 0, 2.34, 0).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(.056, .085, .11, 10), bronze, 0, 2.35, 0);

  const bell = lathe([[.025, .36], [.13, .36], [.24, .29], [.34, .15], [.38, 0]], 20);
  const nozzle = new THREE.CylinderGeometry(.035, .049, .42, 8);
  const bells = [];
  // Match the three rows of sprays seen in the overhead photograph.
  for (const [x, z] of [[-.98, 2.55], [1.08, 2.55], [-2.62, 1], [2.55, 1.03],
    [-2.61, -1.06], [2.49, -1.02], [-.96, -2.5], [1.12, -2.52]]) {
    mesh(nozzle, bronze, x, .54, z);
    bells.push(mesh(bell, spray, x, .38, z));
  }

  const sprayPositions = new Float32Array(180 * 3);
  const particles = new THREE.BufferGeometry();
  const position = new THREE.BufferAttribute(sprayPositions, 3);
  position.setUsage(THREE.DynamicDrawUsage);
  particles.setAttribute('position', position);
  const plume = new THREE.Points(particles, new THREE.PointsMaterial({
    color: '#e3f7f6', size: .052, transparent: true, opacity: .87, depthWrite: false
  }));
  plume.frustumCulled = false;
  fountain.add(plume);

  function update(time) {
    bells.forEach((item, i) => item.scale.setScalar(1 + .05 * Math.sin(time * 4 + i)));
    for (let i = 0; i < position.count; i++) {
      const phase = (i * .6180339 + time * (.54 + (i % 9) * .036)) % 1;
      const angle = i * 2.399963 + time;
      const spread = .028 + (.06 + (i % 13) * .006) * phase;
      const height = (3.3 + (i % 17) * .122) * phase * (1 - phase);
      position.setXYZ(i, Math.cos(angle) * spread, 2.39 + height, Math.sin(angle) * spread);
    }
    position.needsUpdate = true;
  }
  update(0);
  return update;
}

function buildHall(scene, THREE) {
scene.add(new THREE.HemisphereLight('#e7f4ff','#a48c71',2.4));const sun=new THREE.DirectionalLight('#fff0d9',3.2);sun.position.set(-15,27,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;sun.shadow.bias=-.00025;scene.add(sun);
const mat=(c,roughness=1,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness,metalness});const path=mat('#c5baa5'),grass=mat('#a7af92');
function box(w,h,d,x,y,z,m,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
const ground=box(110,.4,110,0,-.28,0,grass);ground.castShadow=false;box(34,.12,40,0,-.04,7,path);
addHallModel(THREE, scene);
addHallFountain(THREE, scene);
}
