// Interactive auditorium view using the local Three.js distribution.
window.startHallScene=function(onFailure){
let renderer;try{

const {THREE,OrbitControls}=window.Hall3DVendor;
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e4d9');scene.fog=new THREE.Fog('#e9e4d9',55,120);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,200);camera.position.set(25,18,30);
renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;document.body.prepend(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.target.set(0,3,2.8);controls.minDistance=14;controls.maxDistance=75;controls.maxPolarAngle=Math.PI/2.07;controls.autoRotate=true;controls.autoRotateSpeed=.5;
scene.add(new THREE.HemisphereLight('#e7f4ff','#a48c71',2.4));const sun=new THREE.DirectionalLight('#fff0d9',3.2);sun.position.set(-15,27,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;sun.shadow.bias=-.00025;scene.add(sun);
const mat=(c,roughness=1,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness,metalness});const path=mat('#c5baa5'),grass=mat('#9bab8d');
function box(w,h,d,x,y,z,m,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
const ground=box(110,.4,110,0,-.28,0,grass);ground.castShadow=false;box(34,.12,40,0,-.04,7,path);
addHallModel(THREE, scene);
const updateFountain=addHallFountain(THREE, scene);
const motion=matchMedia('(prefers-reduced-motion: reduce)');
function view(pos,target=[0,3,2.8]){camera.position.set(...pos);controls.target.set(...target);controls.update()}const autoBtn=document.getElementById('auto');autoBtn.onclick=()=>{controls.autoRotate=!controls.autoRotate;autoBtn.textContent='自动旋转：'+(controls.autoRotate?'开':'关');autoBtn.classList.toggle('active',controls.autoRotate);autoBtn.setAttribute('aria-pressed',String(controls.autoRotate))};document.getElementById('front').onclick=()=>{controls.autoRotate=false;autoBtn.textContent='自动旋转：关';autoBtn.classList.remove('active');autoBtn.setAttribute('aria-pressed','false');view([0,10,39],[0,5,1])};document.getElementById('top').onclick=()=>{controls.autoRotate=false;autoBtn.textContent='自动旋转：关';autoBtn.classList.remove('active');autoBtn.setAttribute('aria-pressed','false');view([.1,42,19],[0,1,4])};document.getElementById('reset').onclick=()=>view([25,18,30]);window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});let t=0;let raf=0,stopped=false;function stop(){if(stopped)return;stopped=true;cancelAnimationFrame(raf);controls.dispose();renderer.dispose()}renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();onFailure()},{once:true});function animate(){if(stopped)return;try{if(!motion.matches){t+=.025;updateFountain(t)}controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate)}catch(error){stop();onFailure()}}renderer.render(scene,camera);raf=requestAnimationFrame(animate);return stop;

}catch(error){renderer?.dispose();throw error;}
};
