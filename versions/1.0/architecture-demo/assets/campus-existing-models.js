'use strict';

// Geometry and local sign textures from the project's completed 3D previews.
function makeGate(T, plaques) {
  const gate = new T.Group();
  gate.name = '四牌楼南大门';
  const stone = material('米黄色墙面', '#bfb097');
  const shaft = material('柱身', '#c9b99f');
  const rim = material('檐口与柱头', '#d2c3aa');
  const band = material('阴线', '#a6977f');
  const iron = material('铁门', '#292725', 0.52);
  const glass = material('门房玻璃', '#454749', 0.18);
  const wood = material('窗框', '#584c3e');
  const light = material('灯罩', '#e1dece');
  const flagRed = material('旗帜', '#af1725');
  let group = gate;

  function material(name, color, metalness = 0) {
    const m = new T.MeshStandardMaterial({ color, roughness: 0.88, metalness });
    m.name = name;
    return m;
  }
  function part(name) {
    group = new T.Group();
    group.name = name;
    gate.add(group);
    return group;
  }
  function mesh(geo, m, x, y, z) {
    const obj = new T.Mesh(geo, m);
    obj.position.set(x, y, z);
    obj.castShadow = true;
    obj.receiveShadow = true;
    group.add(obj);
    return obj;
  }
  function box(w, h, d, x, y, z, m) {
    return mesh(new T.BoxGeometry(w, h, d), m, x, y, z);
  }
  function pillarProfile(w, d, chamfer, fluted) {
    const face = [
      [-w/2+chamfer,d/2], [w/2-chamfer,d/2],
      [w/2,d/2-chamfer], [w/2,-d/2+chamfer],
      [w/2-chamfer,-d/2], [-w/2+chamfer,-d/2],
      [-w/2,-d/2+chamfer], [-w/2,d/2-chamfer],
    ];
    const outline = new T.Shape();
    outline.moveTo(face[0][0], face[0][1]);
    for (let i = 0; i < face.length; i++) {
      const [a,b] = face[i];
      const [c,d] = face[(i+1)%face.length];
      const length = Math.hypot(c-a,d-b);
      if (fluted && i%2 === 0) {
        const count = Math.round(length/0.1);
        for (let k=0; k<count; k++) {
          for (let j=0; j<=6; j++) {
            const fraction = (k + 0.13 + 0.74*j/6)/count;
            const inset = 0.019*Math.sin(Math.PI*j/6);
            outline.lineTo(a+(c-a)*fraction+(d-b)*inset/length,
                           b+(d-b)*fraction-(c-a)*inset/length);
          }
        }
      }
      outline.lineTo(c,d);
    }
    return outline;
  }
  function pier(w, d, chamfer, y0, y1, x, m, fluted = false) {
    const geometry = new T.ExtrudeGeometry(pillarProfile(w,d,chamfer,fluted), {
      depth: y1-y0, bevelEnabled: false
    });
    geometry.rotateX(-Math.PI/2);
    return mesh(geometry,m,x,y0,0);
  }
  for (const [i,x] of [-5.08,-2.215,2.215,5.08].entries()) {
    part('门柱 ' + (i+1));
    pier(1.02,2.62,0.14,0,0.12,x,band);
    pier(1.00,2.59,0.14,0.12,0.96,x,stone);
    pier(1.02,2.61,0.15,0.96,1.05,x,rim);
    pier(0.95,2.51,0.16,1.05,4.94,x,shaft,true);
    for (const y of [2.1,3.44]) {
      pier(0.949,2.513,0.16,y,y+0.012,x,band);
    }
    pier(0.96,2.53,0.16,4.94,5.09,x,shaft);
    pier(1.04,2.61,0.17,5.09,5.15,x,rim);
    pier(1.10,2.70,0.17,5.15,5.21,x,band);
    pier(1.15,2.78,0.18,5.21,5.30,x,rim);
  }

  part('门楣与檐口');
  box(11.18,1.77,2.79,0,6.16,0,stone);
  const layers = [
    [7.045, 0.10, 11.25, 2.89, band],
    [7.145, 0.09, 11.38, 3.01, rim],
    [7.235, 0.11, 11.48, 3.10, band],
    [7.345, 0.14, 11.59, 3.20, rim],
    [7.485, 0.09, 11.73, 3.30, rim],
  ];
  for (const [y,h,w,d,m] of layers) box(w,h,d,0,y+h/2,0,m);
  box(5.17,0.13,2.30,0,7.64,0,stone);
  box(3.70,0.13,1.82,0,7.77,0,stone);
  box(2.07,0.19,1.39,0,7.93,0,rim);
  for (const side of [-1,1]) {
    for (const y of [5.76,6.39,6.92]) box(11.17,0.011,0.012,0,y,side*1.397,band);
    for (let row=0; row<3; row++) {
      for (let x=-4.9+(row%2)*0.65; x<5.5; x+=1.42) {
        box(0.010,0.54,0.012,x,5.48+row*0.60,side*1.397,band);
      }
    }
    for (const [x,w] of [[-3.65,0.65],[0,1.06],[3.65,0.65]]) {
      box(w,0.032,0.45,x,5.255,side*0.22,iron);
      box(w-0.09,0.035,0.36,x,5.244,side*0.22,light);
    }
  }
  for (const [i,x] of [-2.55,-0.86,0.84,2.55].entries()) {
    const m = material('门额 ' + '東南大學'[i], '#ffffff');
    m.map = plaques[i];
    box(0.76,0.76,0.033,x,6.20,1.414,wood);
    mesh(new T.PlaneGeometry(0.748,0.748),m,x,6.20,1.432);
  }


  function facade(name,x,z,angle) {
    const face=new T.Group();
    face.name=name;
    face.position.set(x,0,z);
    face.rotation.y=angle;
    gate.add(face);
    group=face;
  }
  function opening(x,y,w,h,isDoor=false,grille=false) {
    box(w+0.15,h+0.17,0.07,x,y,0.014,band);
    box(w,h,0.09,x,y,0.035,wood);
    const top=y+h/2;
    box(w-0.13,0.39,0.037,x,top-0.255,0.092,glass);
    const lower=h-0.64;
    for (const side of [-1,1]) {
      box(w*0.42,lower,0.037,x+side*w*0.23,y-0.24,0.093,glass);
    }
    box(0.045,h,0.046,x,y,0.125,wood);
    box(w,0.065,0.05,x,top-0.53,0.13,wood);
    for (let i=1;i<4;i++) box(w,0.035,0.05,x,top-0.56-lower*i/4,0.13,wood);
    box(w+0.17,0.085,0.18,x,y-h/2-0.055,0.08,stone);
    if (isDoor) {
      box(w-0.14,0.52,0.055,x,0.39,0.12,wood);
      box(0.035,0.16,0.07,x+0.13,1.02,0.17,iron);
      box(w+0.38,0.12,0.52,x,0.06,0.22,rim);
    }
    if (grille) {
      for (let i=-3;i<=3;i++) box(0.018,h-0.61,0.023,x+i*w/8,y-0.26,0.165,iron);
      for (const dy of [-h*0.28,0.15]) box(w,0.024,0.035,x,y+dy,0.165,iron);
    }
  }
  function pipe(x,height) {
    const points=[new T.Vector3(x,height,0.09),new T.Vector3(x,height-0.21,0.19),
      new T.Vector3(x,height-0.49,0.13),new T.Vector3(x,0.18,0.13),new T.Vector3(x,0.11,0.26)];
    const curve=new T.CurvePath();
    for(let i=0;i<points.length-1;i++) curve.add(new T.LineCurve3(points[i],points[i+1]));
    mesh(new T.TubeGeometry(curve,12,0.034,8,false),band,0,0,0);
    box(0.17,0.22,0.13,x,height-0.15,0.1,rim);
    for (const y of [0.5,1.75,2.85]) box(0.1,0.045,0.08,x,y,0.13,iron);
  }
  function courses(width,height) {
    for (let y=0.49;y<height-0.1;y+=0.52) box(width,0.009,0.013,0,y,0.006,band);
  }
  function room(side) {
    part(side<0 ? '西侧门房体量' : '东侧门房体量');
    const cx=side*9.58;
    box(8.1,3.91,4.65,cx,1.955,-1.15,stone);
    box(8.18,0.14,4.76,cx,3.97,-1.15,band);
    box(8.29,0.13,4.88,cx,4.105,-1.15,rim);
    box(8.4,0.07,4.99,cx,4.205,-1.15,band);
    box(8.03,0.08,4.52,cx,4.19,-1.15,band);
    box(1.72,3.18,1.04,side*6.4,1.59,-3.995,stone);
    box(1.83,0.12,1.14,side*6.4,3.24,-3.995,band);
    box(1.96,0.11,1.27,side*6.4,3.355,-3.995,rim);
    facade('外侧墙面',cx,1.178,0);
    courses(8.08,3.9);
    facade('门房内侧门窗',cx,-3.48,Math.PI);
    courses(8.08,3.9);
    if (side<0) {
      for (const x of [-3.13,-1.84,-0.45,1.79,3.12]) opening(x,1.97,0.79,2.02,false,x===3.12);
      opening(0.69,1.43,0.87,2.82,true);
      const canopy=new T.Shape();
      canopy.moveTo(-0.72,0);
      for (let i=0;i<=16;i++) {
        const a=Math.PI*i/16;
        canopy.lineTo(-0.72+1.44*i/16,0.15*Math.sin(a));
      }
      canopy.lineTo(0.72,-0.035);
      canopy.lineTo(-0.72,-0.035);
      canopy.closePath();
      const cover=mesh(new T.ExtrudeGeometry(canopy,{depth:0.65,bevelEnabled:false}),glass,0.69,3.05,0.06);
      for(const x of [0.11,1.27]) {
        box(0.025,0.33,0.026,x,2.85,0.56,iron);
        box(0.025,0.027,0.55,x,2.69,0.32,iron);
      }
      pipe(-1.12,3.83);
      pipe(1.16,3.83);
    } else {
      for(const x of [-3.13,-1.92,2.02,3.15]) opening(x,1.97,0.77,2.02,false,x<0);
      for(const x of [-0.57,0.65]) opening(x,1.44,0.79,2.84,true);
      pipe(-3.77,3.83);
      pipe(1.35,3.83);
    }
    facade('门房端墙',side*13.64,-1.15,side*Math.PI/2);
    courses(4.63,3.9);
    opening(-0.85,1.96,0.83,1.94);
    opening(0.85,1.96,0.83,1.94);
    facade('低接间内墙',side*6.4,-4.525,Math.PI);
    courses(1.7,3.17);
    opening(0,1.64,0.79,1.75);
    facade('低接间侧墙',side*7.27,-3.99,side*Math.PI/2);
    opening(0,1.64,0.59,1.7);
    part('屋顶空调设备');
    for(const x of [side*6.65,side*10.35]) {
      box(0.85,0.53,0.49,x,4.49,-1.8,rim);
      box(0.71,0.42,0.025,x,4.49,-2.058,glass);
      for(let y=4.32;y<4.69;y+=0.046) box(0.71,0.013,0.03,x,y,-2.075,iron);
    }
  }
  room(-1);
  room(1);

  function leaf(name,x,z,width,angle) {
    const g = part(name);
    g.position.set(x,0,z);
    g.rotation.y = angle;
    const h = 2.19;
    for (const u of [0,width]) box(0.071,h,0.064,u,h/2+0.07,0,iron);
    for (const y of [0.1,0.27,1.98,2.17]) box(width,0.048,0.055,width/2,y,0,iron);
    const n = Math.round(width/0.16);
    for (let i=1; i<n; i++) {
      const u = width*i/n;
      box(0.023,2.12,0.024,u,1.17,0,iron);
      mesh(new T.ConeGeometry(0.036,0.15,4),iron,u,2.27,0);
    }
    const cells = Math.round(width/0.24);
    const step = width/cells;
    for (const y of [0.11,1.985]) {
      for (let i=0; i<cells; i++) {
        const u = step*(i+0.11);
        const segments = [[0,0,0,0.13],[0,0.13,0.16,0.13],[0.16,0.13,0.16,0.026],[0.16,0.026,0.055,0.026],[0.055,0.026,0.055,0.084],[0.055,0.084,0.11,0.084]];
        for (const [a,b,c,d] of segments) {
          box(Math.abs(c-a)+0.018,Math.abs(d-b)+0.018,0.018,u+(a+c)/2,y+(b+d)/2,0.017,iron);
        }
      }
    }
  }
  leaf('西侧铁门',-4.57,0.42,1.85,Math.PI*0.41);
  leaf('中央铁门·西扇',-1.72,0.48,1.72,Math.PI*0.44);
  leaf('中央铁门·东扇',0.015,0.48,1.71,0);
  leaf('东侧铁门',2.72,0.42,1.86,0);

  part('旗杆');
  mesh(new T.CylinderGeometry(0.024,0.03,1.8,12),iron,0,8.9,0);
  const flag = new T.BufferGeometry();
  flag.setAttribute('position',new T.Float32BufferAttribute([
    0,9.75,0, 0.37,9.35,0.05, 0.28,8.18,0.17,
    0,9.75,0, 0.28,8.18,0.17, 0,8.25,0
  ],3));
  flag.computeVertexNormals();
  flagRed.side=T.DoubleSide;
  mesh(flag,flagRed,0,0,0);
  return gate;
}

const plaqueData = ["data:image/jpeg;base64,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","data:image/jpeg;base64,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","data:image/jpeg;base64,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","data:image/jpeg;base64,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"];

function makeArchivedCampusBuilding(T, kind) {
  const model=new T.Group();
  const names={gym:'体育馆',hehai:'河海院',workshop:'工艺实习场'};
  model.name=names[kind];
  function material(name,color) {
    const m=new T.MeshStandardMaterial({color,roughness:0.88});
    m.name=name;
    return m;
  }
  const brick=material('灰砖',kind==='gym'?'#646c6c':'#99998b');
  const stone=material('浅色线脚','#b8b6a4');
  const base=material('台基','#676b65');
  const joint=material('砖缝',kind==='gym'?'#81867e':'#7e8072');
  const frame=material('木窗框',kind==='workshop'?'#653c31':'#a69c73');
  const glass=material('玻璃','#404b49');
  const door=material('入口门','#4a5a50');
  const roof=material('屋面','#454947');
  const iron=material('铁件','#383a36');
  let parent=model;
  function part(name) {
    parent=new T.Group();
    parent.name=name;
    model.add(parent);
  }
  function mesh(geo,m,x,y,z) {
    const obj=new T.Mesh(geo,m);
    obj.position.set(x,y,z);
    obj.castShadow=true;
    obj.receiveShadow=true;
    parent.add(obj);
    return obj;
  }
  function box(w,h,d,x,y,z,m) {
    return mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
  }
  function face(x,z,angle) {
    const object=new T.Group();
    object.position.set(x,0,z);
    object.rotation.y=angle;
    model.add(object);
    parent=object;
    object.name='立面';
  }
  function window(x,y,w,h,columns=2) {
    box(w+0.18,h+0.16,0.12,x,y,0.02,stone);
    box(w,h,0.1,x,y,0.1,frame);
    const pitch=w/columns;
    for(let c=0;c<columns;c++) {
      for(let r=0;r<4;r++) {
        box(pitch-0.065,h/4-0.06,0.023,x-w/2+pitch*(c+0.5),y-h/2+h/4*(r+0.5),0.16,glass);
      }
    }
    box(w+0.23,0.1,0.24,x,y-h/2-0.08,0.09,stone);
  }
  function entrance(x,y,w,h) {
    box(w+0.2,h+0.18,0.16,x,y,0.04,stone);
    box(w,h,0.10,x,y,0.15,door);
    for(const side of [-1,1]) box(w*0.42,h*0.53,0.04,x+side*w*0.23,y+h*0.14,0.22,glass);
    box(0.055,h,0.06,x,y,0.23,frame);
  }
  function brickwork(width,height) {
    for(let row=0;row*0.19<height;row++) {
      const y=0.11+row*0.19;
      box(width,0.009,0.014,0,y,0.012,joint);
      for(let x=-width/2+(row%2)*0.2;x<width/2;x+=0.41) {
        box(0.008,0.18,0.014,x,y+0.095,0.012,joint);
      }
    }
  }
  function baluster(x,y,z) {
    const profile=[[0.075,0],[0.075,0.1],[0.048,0.18],[0.072,0.32],[0.051,0.48],[0.039,0.64],[0.066,0.73]];
    mesh(new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),10),stone,x,y,z);
  }
  function rail(x1,y1,z1,x2,y2,z2) {
    const length=Math.hypot(x2-x1,z2-z1);
    const count=Math.ceil(length/0.34);
    for(let i=0;i<=count;i++) {
      const f=i/count;
      baluster(x1+(x2-x1)*f,y1+(y2-y1)*f,z1+(z2-z1)*f);
    }
    const curve=new T.LineCurve3(new T.Vector3(x1,y1+0.79,z1),new T.Vector3(x2,y2+0.79,z2));
    mesh(new T.TubeGeometry(curve,1,0.09,6,false),stone,0,0,0);
  }
  function stairs(top,width,depth,z) {
    const count=Math.round(top/0.165);
    for(const side of [-1,1]) {
      for(let i=0;i<count;i++) {
        const h=top*(count-i)/count;
        box(depth/count,h,width,side*(2.3+depth*(i+0.5)/count),h/2,z,stone);
      }
      for(const dz of [-width/2,width/2]) rail(side*2.3,top,z+dz,side*(2.3+depth),0.1,z+dz);
    }
    box(4.6,0.25,width,0,top-0.125,z,stone);
    box(4.6,top,0.3,0,top/2,z-width/2+0.15,brick);
    rail(-2.2,top,z+width/2,2.2,top,z+width/2);
  }
  function pitched(w,d,y,z,rise) {
    const shape=new T.Shape();
    shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
    mesh(new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),roof,0,y,z-d/2);
  }
  if(kind==='gym') {
    const width=54,depth=17.8,height=12.5;
    part('体育馆主体');
    box(width,height,depth,0,height/2,0,brick);
    box(width+0.2,0.48,depth+0.2,0,0.24,0,base);
    box(width+0.75,0.23,depth+0.8,0,height,0,stone);
    pitched(width+0.6,depth+0.6,height+0.13,0,1.1);
    for(const direction of [-1,1]) {
      face(0,direction*depth/2,direction===1?0:Math.PI);
      brickwork(width,height);
      for(let i=-6;i<=6;i++) {
        const x=i*3.85;
        box(0.31,height-0.45,0.16,x+1.8,height/2,0.14,stone);
        if(i===0) continue;
        for(const y of [1.72,6.3,9.7]) window(x,y,2.02,y<2?2.5:2.32,3);
      }
      for(const x of [-15.4,15.4]) {
        box(3.07,7.05,0.23,x,8.1,0.14,stone);
        box(2.54,6.5,0.25,x,8.1,0.18,brick);
        const arch=new T.Shape();
        arch.moveTo(-0.83,0);arch.lineTo(0.83,0);arch.lineTo(0.83,4.2);
        arch.absarc(0,4.2,0.83,0,Math.PI,false);arch.closePath();
        mesh(new T.ShapeGeometry(arch),glass,x,5.1,0.33);
        for(const dx of [-0.44,0,0.44]) box(0.05,4.7,0.045,x+dx,7.6,0.36,frame);
        for(const y of [5.9,7,8.1,9.2]) box(1.65,0.05,0.04,x,y,0.36,frame);
        entrance(x,1.45,1.35,2.7);
      }
      entrance(0,6.0,2.85,3.55);
      entrance(0,1.55,1.5,2.75);
    }
    part('入口平台与双跑楼梯');
    stairs(4.17,2.3,7.6,11.2);
    for(const x of [-2.05,2.05]) {
      box(0.34,4.09,0.34,x,6.32,11.15,stone);
      box(0.55,0.16,0.55,x,8.39,11.15,stone);
    }
    box(5.05,0.4,3.17,0,8.7,10.42,stone);
    rail(-2.35,8.92,11.9,2.35,8.92,11.9);
    for(const x of [-2.35,2.35]) rail(x,8.92,9.02,x,8.92,11.9);
    part('屋檐撑木与烟囱');
    for(let x=-26;x<27;x+=1.28) {
      const support=box(0.10,0.62,0.12,x,12.04,9.04,stone);
      support.rotation.x=-0.52;
    }
    for(const x of [-20,20]) {
      box(0.83,2.1,0.9,x,13.43,-5.6,brick);
      box(1.03,0.17,1.08,x,14.51,-5.6,stone);
    }
  } else if(kind==='hehai') {
    const width=13.8,depth=30,height=7.64;
    part('河海院主体');
    box(width,height,depth,0,height/2,0,brick);
    box(width+0.2,0.4,depth+0.2,0,0.2,0,base);
    box(width+0.8,0.23,depth+0.8,0,height,0,stone);
    pitched(width+0.7,depth+0.7,height+0.13,0,1.34);
    for(const side of [-1,1]) {
      face(side*width/2,0,side*Math.PI/2);
      brickwork(depth,height);
      box(depth,0.16,0.19,0,3.35,0.04,stone);
      for(let i=0;i<8;i++) {
        const x=-12.8+i*3.65;
        window(x,5.46,1.35,2.55);
        window(x,1.54,1.12,1.99);
      }
    }
    for(const direction of [-1,1]) {
      face(0,direction*depth/2,direction===1?0:Math.PI);
      brickwork(width,height);
      for(const x of [-4.75,4.75]) {
        window(x,5.43,1.22,2.57);
        window(x,1.52,1.11,1.96);
      }
      entrance(0,1.48,1.6,2.79);
      entrance(0,5.31,2.18,2.85);
    }
    part('前门廊与分叉楼梯');
    stairs(3.53,1.77,4.24,17.0);
    for(const x of [-2.04,2.04]) box(0.38,3.68,0.38,x,5.4,17.02,stone);
    box(4.88,0.28,3.0,0,7.40,16.34,stone);
    box(4.99,0.14,3.12,0,7.61,16.34,roof);
    part('檐下木撑');
    for(const side of [-1,1]) {
      for(let z=-14;z<15;z+=1.15) {
        const support=box(0.13,0.44,0.11,side*7.12,7.3,z,stone);
        support.rotation.z=side*0.6;
      }
    }
  } else {
    const width=43.2,depth=11.7,height=9.2;
    part('工艺实习场主体');
    box(width,height,depth,0,height/2,0,brick);
    box(width+0.2,0.32,depth+0.2,0,0.16,0,base);
    box(width+0.34,0.19,depth+0.34,0,height-0.63,0,stone);
    box(width+0.48,0.19,depth+0.48,0,height,0,base);
    box(width,0.11,depth,0,height-0.12,0,roof);
    for(const direction of [-1,1]) {
      face(0,direction*depth/2,direction===1?0:Math.PI);
      brickwork(width,height);
      for(let i=-5;i<=5;i++) {
        const x=i*3.74;
        for(const y of [2.01,6.46]) {
          if(i===0&&y<3) entrance(x,1.81,2.32,3.43);
          else window(x,y,1.68,y>3?2.91:2.48,3);
        }
        box(0.49,8.69,0.27,x+1.88,4.45,0.16,stone);
        box(0.75,0.19,0.42,x+1.88,8.45,0.18,base);
        box(0.25,0.52,0.25,x+1.88,8.73,0.23,base);
      }
      box(4.9,0.24,0.6,0,4.15,0.23,stone);
      box(0.47,4.11,0.38,-2.21,2.1,0.21,stone);
      box(0.47,4.11,0.38,2.21,2.1,0.21,stone);
    }
    for(const side of [-1,1]) {
      face(side*width/2,0,side*Math.PI/2);
      brickwork(depth,height);
      for(const x of [-3.6,0,3.6]) for(const y of [2.01,6.46]) window(x,y,1.64,2.65,3);
    }
  }
  return model;
}

function makeExistingCampusModel(THREE,id,renderAgain) {
  if(id==='south-gate') {
    const loader=new THREE.TextureLoader();
    const textures=plaqueData.map(url=>{
      const texture=loader.load(url,renderAgain);
      texture.colorSpace=THREE.SRGBColorSpace;
      return texture;
    });
    return makeGate(THREE,textures);
  }
  const kinds={gymnasium:'gym',hehai:'hehai',workshop:'workshop'};
  return Object.hasOwn(kinds,id)?makeArchivedCampusBuilding(THREE,kinds[id]):null;
}
