'use strict';

function addCampusPine(T,scene) {
  const material = color => new T.MeshStandardMaterial({ color, roughness: .86 });
  const stone = material('#d2c6ae');
  const bark = material('#625447');
  const green = material('#5a7052');
  function mesh(geometry, x, y, z, surface) {
    const item = new T.Mesh(geometry, surface);
    item.position.set(x,y,z);
    item.castShadow = item.receiveShadow = true;
    scene.add(item);
    return item;
  }
  const cylinder = (rt,rb,h,x,y,z,surface) => mesh(new T.CylinderGeometry(rt,rb,h,10),x,y,z,surface);
  function branch(a,b,radius,surface) {
    const start = new T.Vector3(...a);
    const end = new T.Vector3(...b);
    const middle = start.clone().lerp(end,.5);
    const item = cylinder(radius*.42,radius,start.distanceTo(end),...middle.toArray(),surface);
    item.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());
  }
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
}

function batchCampusModel(THREE, source) {
  source.updateMatrixWorld(true);
  const model=new THREE.Group();
  model.name=source.name;
  const byMaterial=new Map();
  source.traverse(mesh=>{
    if(!mesh.isMesh) return;
    const {geometry,material}=mesh;
    // Preserve texture coordinates and object sorting for signs and transparent parts.
    if(material.map || material.transparent) {
      const copy=mesh.clone(false);
      mesh.matrixWorld.decompose(copy.position,copy.quaternion,copy.scale);
      model.add(copy);
      return;
    }
    if(!byMaterial.has(material)) byMaterial.set(material,{meshes:[],vertices:0});
    const batch=byMaterial.get(material);
    batch.meshes.push(mesh);
    batch.vertices+=geometry.index?.count ?? geometry.attributes.position.count;
  });
  for(const [material,{meshes,vertices}] of byMaterial) {
    const positions=new Float32Array(vertices*3);
    const normals=new Float32Array(vertices*3);
    const position=new THREE.Vector3();
    const normal=new THREE.Vector3();
    const normalMatrix=new THREE.Matrix3();
    let offset=0;
    for(const mesh of meshes) {
      const {geometry,matrixWorld}=mesh;
      normalMatrix.getNormalMatrix(matrixWorld);
      const count=geometry.index?.count ?? geometry.attributes.position.count;
      for(let i=0;i<count;i++) {
        const vertex=geometry.index ? geometry.index.getX(i) : i;
        position.fromBufferAttribute(geometry.attributes.position,vertex).applyMatrix4(matrixWorld);
        normal.fromBufferAttribute(geometry.attributes.normal,vertex).applyNormalMatrix(normalMatrix);
        position.toArray(positions,offset);
        normal.toArray(normals,offset);
        offset+=3;
      }
      geometry.dispose();
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
    const mesh=new THREE.Mesh(geometry,material);
    mesh.castShadow=mesh.receiveShadow=true;
    model.add(mesh);
  }
  return model;
}

function buildCampusMassing(scene,id,THREE,renderAgain) {
  scene.add(new THREE.HemisphereLight('#ecf2ff','#a5937d',2.6));
  const sun=new THREE.DirectionalLight('#fff1dd',2.9);
  sun.position.set(-17,29,20);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28});
  sun.shadow.normalBias=.05;
  scene.add(sun);

  const ground=new THREE.Mesh(new THREE.PlaneGeometry(140,140),new THREE.MeshStandardMaterial({color:'#d5d0c2',roughness:.91}));
  ground.rotation.x=-Math.PI/2;
  ground.position.y=-.025;
  ground.receiveShadow=true;
  scene.add(ground);
  if(id==='liuchao') {
    addCampusPine(THREE,scene);
    return null;
  }

  const source=makeExistingCampusModel(THREE,id,renderAgain) || makeCampusBuilding(THREE,id);
  if(!source) return null;
  const model=batchCampusModel(THREE,source);
  const bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3());
  const center=bounds.getCenter(new THREE.Vector3());
  const scale=32/Math.max(size.x,size.z);
  model.scale.setScalar(scale);
  model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  scene.add(model);
  return size.multiplyScalar(scale);
}
