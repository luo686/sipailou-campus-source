// Geometry reused from the campus auditorium concept model.
function buildHall(scene) {
scene.add(new HallThree.HemisphereLight('#e7f4ff','#a48c71',2.4));const sun=new HallThree.DirectionalLight('#fff0d9',3.2);sun.position.set(-15,27,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;sun.shadow.bias=-.00025;scene.add(sun);
const mat=(c,roughness=1,metalness=0)=>new HallThree.MeshStandardMaterial({color:c,roughness,metalness});const stone=mat('#d4bfa5'),trim=mat('#e9d9c2'),brick=mat('#b7826d'),roof=mat('#63756f'),roofDark=mat('#526d62'),glass=mat('#394e4a',.32,.15),dark=mat('#685a4a'),path=mat('#c5baa5'),grass=mat('#a7af92'),water=new HallThree.MeshStandardMaterial({color:'#6caaa9',metalness:.45,roughness:.22,transparent:true,opacity:.88}),white=mat('#eee6d8');
function box(w,h,d,x,y,z,m,parent=scene){const o=new HallThree.Mesh(new HallThree.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}function cyl(rt,rb,h,x,y,z,m,n=48){const o=new HallThree.Mesh(new HallThree.CylinderGeometry(rt,rb,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
const ground=box(110,.4,110,0,-.28,0,grass);ground.castShadow=false;box(34,.12,40,0,-.04,7,path);box(33,.18,17,0,.02,-7,stone);
// Symmetrical hall massing, broad facade, colonnade, gabled roof, central tower.
box(27,7.6,13,0,3.85,-8,brick);box(28,.55,14,0,7.8,-8,trim);box(30,.38,15,0,1.05,-8,trim);
for(let side of [-1,1]){box(5.3,6.6,12,side*10.9,4,-8,stone);box(5.6,.36,12.7,side*10.9,7.55,-8,trim)}
function pitchedRoof(w,d,x,y,z){const shape=new HallThree.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,3.1);shape.lineTo(w/2,0);shape.closePath();const g=new HallThree.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});const o=new HallThree.Mesh(g,roof);o.rotation.y=Math.PI;o.position.set(x,y,z+d/2);o.castShadow=true;scene.add(o);return o}pitchedRoof(29,14,0,8.03,-8);
// Front portico is oriented toward +Z
box(16.8,1.1,4.7,0,7.15,.45,trim);box(17.7,.28,5,0,7.85,.45,stone);box(17.2,.7,5,0,1.2,.45,stone);
for(let i=-3;i<=3;i++){const x=i*2.4;cyl(.38,.43,5.45,x,4.2,2.18,trim,16);cyl(.53,.53,.25,x,1.55,2.18,stone,16);cyl(.55,.45,.35,x,7.03,2.18,stone,16)}
for(let i=-3;i<=3;i++){const x=i*3.5;box(1.5,3.5,.12,x,4.5,-1.42,glass);box(1.8,.22,.25,x,6.45,-1.31,trim);box(.13,3.6,.2,x,4.5,-1.31,trim)}
// front steps
for(let i=0;i<5;i++)box(18+i*.7,.2,1.1,0,.99-i*.19,3.15+i*.65,stone);
// central roof pediment
const pedShape=new HallThree.Shape();pedShape.moveTo(-9,0);pedShape.lineTo(0,3.7);pedShape.lineTo(9,0);pedShape.closePath();const ped=new HallThree.Mesh(new HallThree.ShapeGeometry(pedShape),stone);ped.position.set(0,8.0,2.9);scene.add(ped);const pedInner=new HallThree.Mesh(new HallThree.RingGeometry(1,1.15,40),dark);pedInner.position.set(0,9.35,2.93);scene.add(pedInner);
// tower / drum
box(8,2.4,7,0,10.6,-9.2,stone);cyl(3.6,3.8,3.2,0,13.2,-9.2,trim,12);cyl(4.2,4.2,.35,0,14.9,-9.2,stone,12);const dome=new HallThree.Mesh(new HallThree.SphereGeometry(3.8,36,20,0,Math.PI*2,0,Math.PI/2),roofDark);dome.position.set(0,15.05,-9.2);dome.castShadow=true;scene.add(dome);cyl(.17,.25,1.25,0,19.2,-9.2,dark,12);
for(let a=0;a<12;a++){let t=a*Math.PI/6;let x=Math.sin(t)*3.7,z=-9.2+Math.cos(t)*3.7;const win=box(.9,1.4,.15,x,13.3,z,glass);win.rotation.y=t}
// facade window rhythm
for(let s of [-1,1])for(let i=0;i<3;i++){const x=s*(10+i*1.45);box(.8,2.7,.14,x,4.9,-1.41,glass);box(1.0,.22,.3,x,6.4,-1.32,trim)}
// circular fountain: concentric rim, water disk, central pedestal, animated jets
const fountainZ=13.4;const ringGeo=new HallThree.TorusGeometry(5.4,.48,14,96);const rim=new HallThree.Mesh(ringGeo,stone);rim.rotation.x=Math.PI/2;rim.position.set(0,.62,fountainZ);rim.castShadow=true;scene.add(rim);cyl(5.4,5.4,.4,0,.27,fountainZ,stone,96);cyl(4.95,4.95,.06,0,.53,fountainZ,water,96);cyl(1.15,1.55,.65,0,.92,fountainZ,stone,32);cyl(.55,.8,.6,0,1.53,fountainZ,stone,32);const jetMaterial=new HallThree.MeshStandardMaterial({color:'#b8e5e5',transparent:true,opacity:.75,roughness:.12,metalness:.1});const jets=[];for(let i=0;i<12;i++){const a=i*Math.PI/6;const x=Math.cos(a)*3.4,z=fountainZ+Math.sin(a)*3.4;const jet=new HallThree.Mesh(new HallThree.CylinderGeometry(.025,.07,1.5,7),jetMaterial);jet.position.set(x,1.27,z);jet.rotation.z=Math.cos(a)*.3;jet.rotation.x=-Math.sin(a)*.3;scene.add(jet);jets.push(jet)}const centerJet=new HallThree.Mesh(new HallThree.CylinderGeometry(.04,.11,2.7,9),jetMaterial);centerJet.position.set(0,3.05,fountainZ);scene.add(centerJet);
// trees in formal landscape
function tree(x,z,r=1){cyl(.16,.21,2.3,x,1.15,z,mat('#76624b'),9);const crown=new HallThree.Mesh(new HallThree.IcosahedronGeometry(r,1),mat('#637d5b'));crown.position.set(x,3.05,z);crown.castShadow=true;scene.add(crown)}for(let s of [-1,1]){for(let i=0;i<4;i++)tree(s*20,-17+i*10,1.6+(i%2)*.35);for(let i=0;i<3;i++)tree(s*14,7+i*7,1.25)}
}
