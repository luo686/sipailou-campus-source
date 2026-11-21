'use strict';

// Plans follow the campus map, with the photographed entrance facing +Z.
// Facade details come from the matching photo archive and building records.
const campusBuildingPlans = {
  library: {
    outline: [[-17,8],[5,8],[5,5],[16,5],[16,-15],[5,-15],[5,-9],[-7,-9],[-7,-15],[-17,-15]],
    floor: 2.3, levels: 6, wall: '#b0a99e', finish: 'piers', pitch: 2.15, front: [0,8],
    entry: 'library'
  },
  meian: {
    outline: [[-14,-5],[14,-5],[14,5],[-14,5]],
    floor: 3.8, levels: 1, wall: '#b7a472', frames: '#693b32', finish: 'lattice', pitch: 3.8,
    front: [0,5], entry: 'meian', roofs: [[0,0,29,11,2.65,'hip']]
  },
  nangao: {
    outline: [[-19,-4],[19,-4],[19,4],[7,4],[7,5],[-7,5],[-7,4],[-19,4]],
    floor: 2.55, levels: 3, wall: '#929b9d', base: '#c8b68d', finish: 'piers', pitch: 2.5,
    front: [0,5], entry: 'nangao', roofs: [[-13,0,12,8.6,1.25,'hip'],[0,.3,14.6,9.7,1.4,'hip'],[13,0,12,8.6,1.25,'hip']]
  },
  dongnan: {
    outline: [[-13,-10],[4,-10],[4,-5],[13,-5],[13,9],[4,9],[4,6],[-13,6]],
    floor: 2.55, levels: 3, wall: '#9e9383', finish: 'bands', pitch: 3.5, front: [-4,6],
    entry: 'bands', roofs: [[-8,-1.6,17,10.8,1.15,'hip',Math.PI/2],[.4,.3,13.1,8,.9,'hip'],[8.8,1.8,14.8,9.4,1.05,'hip',Math.PI/2]]
  },
  'mengfang-library': {
    outline: [[-15,6],[-6,6],[-6,8],[6,8],[6,6],[15,6],[15,-1],[11,-1],[11,-9],[4,-9],[4,-4],[-4,-4],[-4,-9],[-11,-9],[-11,-1],[-15,-1]],
    floor: 3.0, levels: 2, wall: '#a69c83', finish: 'stone', pitch: 2.9, front: [0,8],
    entry: 'pediment', roofs: [[0,2,30.4,8.5,.65,'hip'],[-7.5,-4,7.4,10.3,.72,'hip'],[7.5,-4,7.4,10.3,.72,'hip']],
    roof: '#925b4b'
  },
  zhongshan: {
    outline: [[-18,-4.6],[18,-4.6],[18,4.6],[-18,4.6]],
    floor: 2.3, levels: 4, wall: '#9f9686', finish: 'bands', pitch: 3.05, front: [0,4.6],
    entry: 'bands'
  },
  jianxiong: {
    outline: [[-16,-8],[16,-8],[16,6],[7,6],[7,8],[-7,8],[-7,6],[-16,6]],
    floor: 2.8, levels: 3, wall: '#938671', frames: '#b2afa0', finish: 'stone', pitch: 3.0,
    front: [0,8], entry: 'arch', roofs: [[0,-.3,32.9,16,1.25,'hip']], roof: '#6d4c45'
  },
  zhongda: {
    outline: [[-17,3],[-8,3],[-8,5],[8,5],[8,3],[17,3],[17,-4],[12,-4],[12,-10],[8,-10],[8,-4],[-8,-4],[-8,-10],[-12,-10],[-12,-4],[-17,-4]],
    floor: 2.65, levels: 3, wall: '#999284', finish: 'stone', pitch: 2.65, front: [0,5],
    entry: 'biology', roofs: [[0,0,34.6,8.3,1.1,'hip'],[-10,-6,4.6,9,.92,'hip'],[10,-6,4.6,9,.92,'hip']]
  },
  qiangong: {
    outline: [[-13,10],[-11,10],[-11,12],[11,12],[11,10],[13,10],[13,-11],[-13,-11]],
    courtyard: [[-9,-7],[9,-7],[9,7],[-9,7]],
    floor: 2.45, levels: 5, wall: '#aaa699', finish: 'bands', pitch: 3.45, front: [0,12],
    entry: 'screen'
  },
  jinling: {
    outline: [[-16,6],[-11,6],[-11,4],[11,4],[11,6],[16,6],[16,-7],[11,-7],[11,-5],[2,-5],[2,-8],[-2,-8],[-2,-5],[-11,-5],[-11,-7],[-16,-7]],
    floor: 2.75, levels: 3, wall: '#a89979', finish: 'stone', pitch: 2.75, front: [0,4],
    entry: 'canopy', roofs: [[0,-.5,24,9.5,1.07,'hip'],[-13.5,-.5,13.8,5.6,.95,'hip',Math.PI/2],[13.5,-.5,13.8,5.6,.95,'hip',Math.PI/2],[0,-6,5.2,4.1,.66,'hip',Math.PI/2]]
  },
  'alumni-hall': {
    outline: [[-12,7],[12,7],[12,-3],[5,-3],[5,-12],[-2,-12],[-2,-1],[-12,-1]],
    floor: 2.55, levels: 3, wall: '#b7b5a9', finish: 'bands', pitch: 2.8, front: [0,7],
    entry: 'alumni', roofs: [[0,3,24.6,8.8,.9,'hip'],[1.5,-5.3,7.8,14,1.1,'hip']]
  },
  wusi: {
    outline: [[-17,-6],[17,-6],[17,6],[-17,6]],
    floor: 2.8, levels: 3, wall: '#8e9898', finish: 'stone', pitch: 2.8, front: [0,6],
    entry: 'wusi', roofs: [[0,0,35,12.5,1.1,'hip'],[-13,0,13.2,8.7,1.28,'hip',Math.PI/2],[13,0,13.2,8.7,1.28,'hip',Math.PI/2]]
  },
  wuwu: {
    outline: [[-17,5],[-3,5],[3,2],[11,-7],[11,-13],[17,-13],[17,-5],[9,4],[-1,11],[-17,11]],
    floor: 2.15, levels: 5, wall: '#969da0', frames: '#71554d', finish: 'piers', pitch: 2.75, front: [-6,11],
    entry: 'canopy', roofs: [[-8.4,8,17.7,6.7,.9,'hip'],[4,3.4,16.8,6.7,.9,'hip',.64],[14,-9.1,6.7,8.4,.85,'hip']]
  },
  'power-building': {
    outline: [[-15,0],[-7,0],[-7,6],[0,6],[0,0],[15,0],[15,-6],[2,-6],[2,-12],[-6,-12],[-6,-6],[-15,-6]],
    floor: 2.45, levels: 4, wall: '#858c8d', frames: '#674540', finish: 'stone', pitch: 2.6, front: [-3.5,6],
    entry: 'power', roofs: [[0,-3,30.7,6.8,.85,'hip'],[-3.5,1.4,7.8,10,.85,'hip'],[-2,-8,8.8,9,.85,'hip']]
  },
  'wu-memorial': {
    outline: [[-12,-6],[13,-6],[13,2],[10,3.3],[6,4.5],[1,5],[-2,4.9],[-6,4.2],[-9,3],[-12,1]],
    floor: 2.5, levels: 4, wall: '#adada7', finish: 'panels', pitch: 2.65, front: [-2,4.9],
    entry: 'glass'
  }
};

function makeCampusBuilding(THREE, id) {
  const plan = campusBuildingPlans[id];
  if (!plan) return null;

  const model = new THREE.Group();
  model.name = id;
  const material = color => new THREE.MeshStandardMaterial({ color, roughness: .83 });
  const wall = material(plan.wall);
  const stone = material('#c5bdac');
  const darkStone = material('#877e6b');
  const base = material(plan.base || '#9a9385');
  const frames = material(plan.frames || '#9c998c');
  const glass = material(plan.entry === 'glass' ? '#658b83' : '#485b5b');
  const roof = material(plan.roof || '#525a56');
  const relief = material('#6f7468');
  const sill = .38;
  const h = plan.floor * plan.levels;

  function mesh(parent, geometry, surface, x, y, z) {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x,y,z);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  const box = (parent,w,height,d,x,y,z,surface) =>
    mesh(parent,new THREE.BoxGeometry(w,height,d),surface,x,y,z);
  function group(x,z,angle=0) {
    const part = new THREE.Group();
    part.position.set(x,0,z);
    part.rotation.y = angle;
    model.add(part);
    return part;
  }
  function slab(y, depth, surface) {
    const form = points => points.map(([x,z]) => new THREE.Vector2(x,-z));
    const shape = new THREE.Shape(form(plan.outline));
    if (plan.courtyard) shape.holes.push(new THREE.Path(form(plan.courtyard).reverse()));
    const geometry = new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false});
    geometry.rotateX(-Math.PI/2);
    mesh(model,geometry,surface,0,y,0);
  }

  slab(0,sill,base);
  slab(sill,h,wall);
  slab(sill+h,.19,stone);

  function pitchedRoof(parent,w,d,height,y,z,hip) {
    const x = w/2, back = -d/2, front = d/2;
    const ridge = hip ? Math.max(0,x-Math.min(d*.38,w*.28)) : x;
    const ridgeHeight = hip && d > w*1.6 ? height*.84 : height;
    const vertices = [
      [-x,0,back],[x,0,back],[x,0,front],[-x,0,front],[-ridge,ridgeHeight,0],[ridge,ridgeHeight,0],
    ];
    const faces = [[0,4,5],[0,5,1],[1,5,2],[2,5,4],[2,4,3],[3,4,0]];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(faces.flatMap(face=>face.flatMap(i=>vertices[i])),3));
    geometry.computeVertexNormals();
    mesh(parent,geometry,roof,0,y,z);
  }
  for (const [x,z,w,d,r,kind,angle] of plan.roofs || []) {
    const wing = group(x,z,angle);
    box(wing,w,.19,d,0,sill+h+.12,0,darkStone);
    pitchedRoof(wing,w,d,r,sill+h+.21,0,kind==='hip');
  }

  function windowBay(parent,x,y,w,height,finish) {
    box(parent,w+.13,height+.12,.13,x,y,.07,frames);
    box(parent,w,height,.035,x,y,.153,glass);
    const columns = finish==='lattice' ? 4 : finish==='bands' ? 3 : 2;
    for(let col=1;col<columns;col++) {
      box(parent,.055,height,.052,x-w/2+col*w/columns,y,.19,frames);
    }
    box(parent,w,.05,.052,x,y+height*.16,.19,frames);
    if(finish==='lattice') box(parent,w,.05,.052,x,y-height*.18,.19,frames);
    box(parent,w+.2,.085,.19,x,y-height/2-.05,.115,stone);
  }

  function facade(points,interior=false) {
    const area=points.reduce((sum,[x,z],i)=>{
      const [nextX,nextZ]=points[(i+1)%points.length];
      return sum+x*nextZ-nextX*z;
    },0);
    const outward=Math.sign(area)*(interior ? -1 : 1);
    for(let i=0;i<points.length;i++) {
      const [x,z] = points[i];
      const [nextX,nextZ] = points[(i+1)%points.length];
      const dx=nextX-x, dz=nextZ-z;
      const length=Math.hypot(dx,dz);
      if(length<1.1) continue;
      const wallGroup=group((x+nextX)/2,(z+nextZ)/2,Math.atan2(dz*outward,-dx*outward));
      const count=Math.max(1,Math.round(length/plan.pitch));
      const pitch=length/count;
      const bands=plan.finish==='bands';
      const paneWidth=Math.min(2.5,pitch*(bands ? .8 : plan.finish==='lattice' ? .73 : .57));
      const paneHeight=plan.floor*(plan.finish==='lattice' ? .62 : plan.finish==='piers' ? .7 : .59);
      box(wallGroup,length,.16,.17,0,sill+.14,.055,base);
      box(wallGroup,length,.18,.24,0,sill+h-.08,.05,stone);
      for(let row=0;row<plan.levels;row++) {
        const y=sill+plan.floor*(row+.53);
        if(plan.finish==='panels' || plan.finish==='bands' || row===1) {
          box(wallGroup,length,.09,.1,0,sill+row*plan.floor+.1,.04,darkStone);
        }
        for(let col=0;col<count;col++) {
          const xLocal=(col+.5-count/2)*pitch;
          const worldX=wallGroup.position.x+Math.cos(wallGroup.rotation.y)*xLocal;
          const worldZ=wallGroup.position.z-Math.sin(wallGroup.rotation.y)*xLocal;
          const nearEntry=!interior && Math.abs(worldX-plan.front[0])<1.8 && Math.abs(worldZ-plan.front[1])<.8;
          if(plan.finish==='panels') {
            box(wallGroup,.04,plan.floor,.082,xLocal-pitch/2,y,.035,darkStone);
          } else if(!(!row && nearEntry && plan.entry!=='meian')) {
            windowBay(wallGroup,xLocal,y,paneWidth,paneHeight,plan.finish);
          }
        }
      }
      if(plan.finish==='piers' || plan.finish==='bands') {
        for(let col=1;col<count;col++) {
          box(wallGroup,plan.finish==='piers'?.29:.18,h,.17,col*pitch-length/2,sill+h/2,.06,stone);
        }
      }
    }
  }
  facade(plan.outline);
  if(plan.courtyard) facade(plan.courtyard,true);

  const entrance=group(...plan.front);
  function steps(width,count=4) {
    for(let i=0;i<count;i++) box(entrance,width,.1*(count-i),.4+i*.38,0,.05*(count-i),.24+i*.19,base);
  }
  function pillar(x,height,z,round) {
    if(round) {
      mesh(entrance,new THREE.CylinderGeometry(.22,.27,height,14),stone,x,sill+height/2,z);
      box(entrance,.62,.17,.61,x,sill+.12,z,base);
      box(entrance,.61,.24,.58,x,sill+height-.12,z,stone);
    } else box(entrance,.47,height,.52,x,sill+height/2,z,stone);
  }
  function door(w,height,z=.2) {
    box(entrance,w+.3,height+.22,.13,0,sill+height/2,z,stone);
    box(entrance,w,height,.12,0,sill+height/2,z+.085,glass);
    box(entrance,.075,height,.12,0,sill+height/2,z+.152,frames);
    box(entrance,w,.08,.15,0,sill+height*.73,z+.15,frames);
  }
  function archDoor(w,height) {
    const radius=w/2, shoulder=height-radius;
    const shape = new THREE.Shape();
    shape.moveTo(-radius,0);
    shape.lineTo(radius,0);
    shape.lineTo(radius,shoulder);
    shape.absarc(0,shoulder,radius,0,Math.PI,false);
    shape.closePath();
    mesh(entrance,new THREE.ShapeGeometry(shape),glass,0,sill,.21);
    mesh(entrance,new THREE.ShapeGeometry(shape),stone,0,sill,.18).scale.set(1.17,1.06,1);
  }
  function plaque(text,y,z,w=2.5,height=.42) {
    box(entrance,w,height,.08,0,y,z,darkStone);
    const canvas=document.createElement('canvas');
    canvas.width=512;
    canvas.height=128;
    const context=canvas.getContext('2d');
    if (!context) return;
    context.fillStyle='#353631';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle='#ddbd66';
    context.font='bold 77px "Songti SC", SimSun, serif';
    context.textAlign='center';
    context.textBaseline='middle';
    context.fillText(text,256,68,470);
    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;
    mesh(entrance,new THREE.PlaneGeometry(w,height),new THREE.MeshStandardMaterial({map:texture,roughness:.84}),0,y,z+.042);
  }

  switch(plan.entry) {
    case 'meian':
      box(entrance,11.1,.25,2.2,0,3.64,.94,stone);
      plaque('庵梅',3.41,2.06,3.25,.84);
      break;
    case 'pediment':
    case 'arch':
    case 'biology': {
      const isArch=plan.entry==='arch';
      const columnHeight=h*.83;
      for(const x of [-4.8,-1.6,1.6,4.8]) pillar(x,columnHeight,1.95,true);
      box(entrance,11.95,.46,2.7,0,sill+columnHeight+.14,1.0,stone);
      box(entrance,11.65,.34,2.47,0,sill+columnHeight-.2,1,base);
      if(isArch) {
        archDoor(2.47,3.63);
        for(const x of [-10.1,-4.8,0,4.8,10.1]){
          const dormer=group(x,5.6);
          box(dormer,2.3,.94,1.24,0,sill+h+.67,0,darkStone);
          box(dormer,1.98,.57,.06,0,sill+h+.71,.65,glass);
        }
      } else {
        door(2.8,2.7);
        pitchedRoof(entrance,12.25,2.96,1.37,sill+columnHeight+.34,1.03,false);
      }
      if(plan.entry==='biology') box(entrance,5,.35,.12,0,sill+columnHeight+.07,2.42,relief);
      else plaque(isArch?'健 雄 院':'孟芳图书馆',sill+columnHeight+.15,2.39,4.4,.33);
      steps(11.8,7);
      break;
    }
    case 'glass':
      box(entrance,4.9,h+.48,1.2,0,sill+h/2, .71,glass);
      for(const x of [-2.45,-1.23,0,1.23,2.45]) box(entrance,.065,h+.51,.12,x,sill+h/2,1.34,stone);
      for(let y=.8;y<h;y+=.85) box(entrance,4.93,.055,.11,0,y,1.34,stone);
      box(entrance,10,.21,2.12,0,2.48,.89,darkStone);
      door(2.2,2.24,1.29);
      steps(7.2,4);
      break;
    case 'screen':
      for(const x of [-7.1,6]) {
        box(entrance,4.15,h,.31,x,sill+h/2,.51,base);
        for(let col=-2;col<=2;col++) {
          for(let row=1;row<plan.levels*3;row++) {
            box(entrance,.51,.42,.15,x+col*.72,.7+row*.74,.71,glass);
          }
        }
      }
      box(entrance,6.5,.43,2.15,0,plan.floor+1.1,.93,stone);
      door(3.45,2.47);
      plaque('前 工 院',plan.floor+.8,2.05);
      break;
    default: {
      const tall=plan.entry==='wusi';
      const broad=plan.entry==='alumni' || plan.entry==='nangao' || plan.entry==='library';
      const width=broad?8.1:6.0;
      const height=tall?5.2:3.05;
      const columns=plan.entry==='power'?4:2;
      for(let i=0;i<columns;i++) pillar((i/(columns-1)-.5)*(width-.85),height,1.58,plan.entry==='power');
      box(entrance,width,broad?.48:.34,2.47,0,sill+height,1.06,stone);
      door(broad?3.9:2.95,2.45);
      if(tall) {
        pitchedRoof(entrance,width+.58,2.78,.65,sill+height+.18,1.04,false);
        for(const x of [-3,3]) box(entrance,.6,.56,.49,x,sill+height-.08,.36,relief);
        windowBay(entrance,0,4.62,2.2,1.17,'lattice');
      }
      if(plan.entry==='nangao') {
        box(entrance,11.5,1.54,1.5,0,sill+h+.68,.38,wall);
        for(let i=-2;i<=2;i++) windowBay(entrance,i*1.87,sill+h+.58,.96,.79,'piers');
        pitchedRoof(entrance,12.2,2.35,.6,sill+h+1.44,.37,true);
      }
      const labels={library:'图书馆',nangao:'南高院',dongnan:'东南院',zhongshan:'中山院',jinling:'金陵院','alumni-hall':'校友会堂',wusi:'五四楼',wuwu:'五五楼','power-building':'动力楼'};
      plaque(labels[id],tall?3.75:3.0,plan.entry==='power'?2.33:.22);
      steps(width,plan.entry==='alumni'?6:4);
    }
  }
  return model;
}
