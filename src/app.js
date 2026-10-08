import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { createWorld } from './world.js';
import { projects } from './projects.js';
import { createExplorer, animateExplorer } from './models.js';
const $=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=new THREE.Scene();scene.background=new THREE.Color('#d7e7f9');scene.fog=new THREE.Fog('#d7e7f9',45,100);
const camera=new THREE.OrthographicCamera(-16,16,11,-11,.1,130);
camera.position.set(18,20,25);
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;$('#world').appendChild(renderer.domElement);}
catch{ $('#loader').remove();$('#world').innerHTML='<p class="fallback">当前设备无法显示 3D 场景，请使用 QUICK VIEW 浏览作品。</p>'; }
const controls=renderer?new OrbitControls(camera,renderer.domElement):null;
if(controls){controls.target.set(0,1.4,1.4);controls.enableDamping=true;controls.enablePan=false;controls.minZoom=.6;controls.maxZoom=2;controls.minPolarAngle=.35;controls.maxPolarAngle=1.24;controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};}
scene.add(new THREE.HemisphereLight('#edf6ff','#93acd6',1.7));
const sun=new THREE.DirectionalLight('#fff0df',3);sun.position.set(-8,20,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.1,far:65});sun.shadow.normalBias=.025;sun.shadow.bias=-.00025;sun.shadow.radius=4;scene.add(sun);
const fill=new THREE.DirectionalLight('#b8caff',.8);fill.position.set(8,7,-10);scene.add(fill);
const world=createWorld(scene);
let mode='home',buildings=world.portals,selected=null,path=[],nearest=null,transition=null,hover=null;
const keys={};let galleryRoot=null,galleryBuildings=[],galleryGround=[],projectWorld=null;
const actor=createExplorer();scene.add(actor);actor.position.copy(world.spawn);
function piece(geo,material,x,y,z,parent=actor){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const ringMat=new THREE.MeshBasicMaterial({color:'#a397ff',transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false});
const marker=piece(new THREE.RingGeometry(.19,.245,32),ringMat,0,0,0,scene);marker.rotation.x=-Math.PI/2;marker.visible=false;
function attachLabel(b){const el=document.createElement('button');el.className='label';el.innerHTML=b.projectTitleOnly?b.title:`${b.title}<small>${b.sub}</small>`;el.setAttribute('aria-label',`进入 ${b.title}`);el.onclick=()=>goBuilding(b);$('#labels').appendChild(el);b.label=el;}
buildings.forEach(attachLabel);
function heightAt(x,z){return (mode==='home'?world:projectWorld).heightAt(x,z);}
function free(x,z){return (mode==='home'?world:projectWorld).free(x,z);}
function horizontalDistance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
function canStep(x,z,nx,nz){const a=heightAt(x,z),b=heightAt(nx,nz);return free(nx,nz)&&a!==null&&b!==null&&Math.abs(a-b)<.4;}
function route(dest){
  if(!free(dest.x,dest.z))return false;
  const step=.22,key=(x,z)=>`${x},${z}`,start=[Math.round(actor.position.x/step),Math.round(actor.position.z/step)];
  const end=[Math.round(dest.x/step),Math.round(dest.z/step)];
  let open=[{x:start[0],z:start[1],g:0,f:0}],seen=new Map(),closed=new Set(),last=null;seen.set(key(...start),open[0]);
  for(let n=0;open.length&&n<11000;n++){
    open.sort((a,b)=>a.f-b.f);const a=open.shift(),k=key(a.x,a.z);if(closed.has(k))continue;closed.add(k);
    if(Math.hypot(a.x-end[0],a.z-end[1])<=1){last=a;break;}
    for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const x=a.x+dx,z=a.z+dz,nk=key(x,z),ax=a.x*step,az=a.z*step;
      if(closed.has(nk)||!canStep(ax,az,x*step,z*step)||!free(ax,z*step)||!free(x*step,az))continue;
      const g=a.g+Math.hypot(dx,dz);if(seen.has(nk)&&seen.get(nk).g<=g)continue;
      const b={x,z,g,f:g+Math.hypot(x-end[0],z-end[1]),prev:a};seen.set(nk,b);open.push(b);
    }
  }
  if(!last)return false;path=[];while(last.prev){path.unshift(new THREE.Vector3(last.x*step,heightAt(last.x*step,last.z*step)+.05,last.z*step));last=last.prev;}
  path.push(new THREE.Vector3(dest.x,heightAt(dest.x,dest.z)+.05,dest.z));marker.position.set(dest.x,heightAt(dest.x,dest.z)+.025,dest.z);marker.visible=true;return true;
}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;const pointers=new Set();
function hit(e){pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(pointer,camera);}
function buildingHit(){const hits=ray.intersectObjects(buildings.map(b=>b.g),true);if(!hits.length)return null;let o=hits[0].object;while(o&&!o.userData.building)o=o.parent;return o?.userData.building;}
if(renderer){
  renderer.domElement.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size>1)down=null;else down={x:e.clientX,y:e.clientY,time:performance.now()};});
  renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;});
  renderer.domElement.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);const d=down;down=null;if(!d||pointers.size||Math.hypot(e.clientX-d.x,e.clientY-d.y)>7||performance.now()-d.time>600||transition)return;hit(e);const b=buildingHit();if(b)return goBuilding(b);const points=ray.intersectObjects(mode==='home'?world.ground:galleryGround,true);if(points.length){selected=null;route(points[0].point);}});
  renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;hit(e);hover=buildingHit();renderer.domElement.style.cursor=hover?'pointer':'grab';});
}
addEventListener('keydown',e=>{if($('#panel').open)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();keys[e.key.toLowerCase()]=true;path=[];selected=null;}if(e.key==='Enter'&&nearest)enterBuilding(nearest);if(e.key==='Escape'&&mode==='gallery')home();});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
function goBuilding(b){if(!controls)return show(b.id==='projects'?'quick':b.id);if(transition)return;if(horizontalDistance(actor.position,b.entrance)<.32)return enterBuilding(b);selected=b;if(!route(b.entrance))selected=null;}
function enterBuilding(b){selected=null;path=[];marker.visible=false;transition={start:performance.now(),from:camera.position.clone(),target:controls.target.clone(),zoom:camera.zoom,to:b.entrance.clone().add(new THREE.Vector3(8,7,11)),look:new THREE.Vector3(b.x,b.y+1.7,b.z),done:()=>b.id==='projects'?gallery():show(b.id)};}
function modal(html){$('#panel-content').innerHTML=html;if(!$('#panel').open)$('#panel').showModal();Object.keys(keys).forEach(k=>keys[k]=false);path=[];}
const items=[['ReadPaper','沉浸式阅读体验','Product design · Reading'],['ReadPaper','移动端与 iPad','Multi-platform · UI / UX'],['ReadPaper','运营与品牌','Brand · Visual design'],['低空视界','大屏展示','Data visualization'],['RWA','交易平台','Web3 · Product design'],['RWA','B 端平台','Enterprise · UI / UX'],['其他作品','设计探索','Selected explorations']];
let navigationVersion=0,portfolioPromise,galleryPromise;
async function show(id){
  const version=++navigationVersion;
  try{
    const portfolio=await (portfolioPromise||=import('./portfolio.js').then(({createPortfolio})=>createPortfolio(modal)));
    if(version===navigationVersion)portfolio.show(id);
  }catch(error){
    portfolioPromise=null;
    if(version===navigationVersion)loadFailure(error);
  }
}
function loadFailure(error){
  console.error('Portfolio content could not be loaded',error);
  $('#panel').classList.remove('project-detail');
  modal('<h2>内容暂时未能加载</h2><p>请检查网络后重新打开；若网站刚更新，请刷新页面。</p>');
}

async function gallery(){
  const version=++navigationVersion;
  if(!projectWorld){
    try{
      const {createProjectWorld}=await (galleryPromise||=import('./project-world.js'));
      if(version!==navigationVersion)return;
      projectWorld=createProjectWorld(scene,projects,{textures:true});galleryRoot=projectWorld.root;galleryBuildings=projectWorld.portals;galleryGround=projectWorld.ground;galleryBuildings.forEach(attachLabel);
    }catch(error){galleryPromise=null;if(version===navigationVersion)loadFailure(error);return;}
  }
  if(location.hash!=='#projects')history.replaceState(null,'','#projects');
  mode='gallery';world.root.visible=false;world.portals.forEach(b=>b.label.hidden=true);$('#world').classList.add('gallery');
  galleryRoot.visible=true;buildings=galleryBuildings;buildings.forEach(b=>{b.label.hidden=false;b.reveal=0;b.display.visible=false;b.model.scale.setScalar(1);b.model.position.set(0,0,0);});
  $('#enter').innerHTML='查看作品 <kbd>Enter</kbd>';
  $('.gallery-exit')?.remove();$('.gallery-title')?.remove();
  $('#labels').insertAdjacentHTML('beforeend','<button class="gallery-exit">← BACK TO ISLAND</button><div class="gallery-title"><div class="eyebrow">SEVEN PROJECTS / THREE LEVELS</div><h2>A journey<br>through my work.</h2><p>点击标题，走近作品。<br>屏幕展开后，再次点击查看详情。</p><div class="floor-readout">LEVEL <strong id="floor-number">00</strong></div></div>');$('.gallery-exit').onclick=home;
  scene.background.set('#caecdc');scene.fog.color.set('#caecdc');
  actor.position.copy(projectWorld.spawn);path=[];selected=null;reset();
}
function home(){
  navigationVersion++;
  if(location.hash==='#projects')history.replaceState(null,'',location.pathname+location.search);
  if($('#panel').open)$('#panel').close();mode='home';scene.background.set('#d7e7f9');scene.fog.color.set('#d7e7f9');world.root.visible=true;if(galleryRoot)galleryRoot.visible=false;
  galleryBuildings.forEach(b=>b.label.hidden=true);world.portals.forEach(b=>b.label.hidden=false);buildings=world.portals;
  $('#world').classList.remove('gallery');$('.gallery-exit')?.remove();$('.gallery-title')?.remove();
  $('#enter').innerHTML='进入探索 <kbd>Enter</kbd>';
  actor.position.copy(world.spawn);selected=null;path=[];marker.visible=false;reset();
}
function resize(){
  if(!renderer)return;const mobile=innerWidth<800,span=mobile?23.5:21.5,aspect=innerWidth/innerHeight;
  camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;
  if(mobile){camera.left=-11;camera.right=11;camera.top=11/aspect;camera.bottom=-11/aspect;}
  camera.setViewOffset(innerWidth,innerHeight,-innerWidth*(mobile?.02:.14),-innerHeight*(mobile?.16:0),innerWidth,innerHeight);
  camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
}
function reset(){transition=null;if(!controls)return;controls.enabled=true;camera.position.set(18,20,25);camera.zoom=1;controls.target.set(0,mode==='home'?1.4:3.4,mode==='home'?1.4:0);camera.updateProjectionMatrix();controls.update();resize();}
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='home')home();else if(a==='projects'||a==='start'){if(mode==='home')goBuilding(world.projects);}else show(a);});
$('.close').onclick=()=>$('#panel').close();$('#panel').addEventListener('click',e=>{if(e.target===$('#panel')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});$('#panel').addEventListener('close',reset);
$('#enter').onclick=()=>nearest&&enterBuilding(nearest);$('#reset').onclick=reset;$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}};
addEventListener('resize',resize);reset();
const clock=new THREE.Clock();let elapsed=0;
function tick(){
  requestAnimationFrame(tick);if(!renderer)return;const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;
  if(transition){controls.enabled=false;const t=Math.min((performance.now()-transition.start)/(reduced?1:1200),1),e=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.target,transition.look,e);camera.zoom=THREE.MathUtils.lerp(transition.zoom,1.75,e);camera.updateProjectionMatrix();if(t===1){const done=transition.done;transition=null;controls.enabled=true;done();}}
  controls.update();let moving=false;
  if(!$('#panel').open&&!transition){
    const v=new THREE.Vector3(),f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const r=new THREE.Vector3().crossVectors(f,new THREE.Vector3(0,1,0));
    if(keys.w||keys.arrowup)v.add(f);if(keys.s||keys.arrowdown)v.sub(f);if(keys.d||keys.arrowright)v.add(r);if(keys.a||keys.arrowleft)v.sub(r);
    if(v.length()){
      v.normalize().multiplyScalar(dt*2.15);let x=actor.position.x,z=actor.position.z;
      if(canStep(x,z,x+v.x,z))actor.position.x+=v.x;x=actor.position.x;
      if(canStep(x,z,x,z+v.z))actor.position.z+=v.z;moving=true;
    }else if(path.length){
      v.subVectors(path[0],actor.position);v.y=0;const distance=v.length();
      if(distance<.035)path.shift();else{v.normalize().multiplyScalar(Math.min(dt*2.15,distance));actor.position.add(v);moving=true;}
    }
    actor.position.y=(heightAt(actor.position.x,actor.position.z)??0)+.05;
    if(moving)actor.rotation.y=Math.atan2(v.x,v.z);
    if(!path.length){marker.visible=false;if(selected&&horizontalDistance(actor.position,selected.entrance)<.32){if(mode==='gallery')selected=null;else enterBuilding(selected);}}
  }
  animateExplorer(actor,elapsed,moving,reduced);
  nearest=null;
  for(const b of buildings){
    const distance=actor.position.distanceTo(b.entrance);if(distance<1.2)nearest=b;
    if(b.ring)b.ring.material.opacity=(hover===b||distance<1.2)?.75:.25;
    if(b.doorGlow){const target=THREE.MathUtils.clamp(1-distance/1.6,0,1);const glow=THREE.MathUtils.lerp(b.doorGlow.material.uniforms.intensity.value,target,1-Math.exp(-dt*5));b.doorGlow.material.uniforms.intensity.value=glow;b.door.material.uniforms.warmth.value=glow;b.doorLight.intensity=glow*4.2;}
    if(b.display){const target=distance<2.65?1:0;if(target)b.display.userData.ensureTextures?.();b.reveal=THREE.MathUtils.lerp(b.reveal||0,target,1-Math.exp(-dt*6));b.display.visible=b.reveal>.01;b.display.scale.setScalar(Math.max(.001,b.reveal));b.model.scale.setScalar(1-b.reveal*.72);b.model.position.x=-b.reveal*.96;b.model.position.y=b.reveal*.12;b.label.classList.toggle('exhibit-open',b.reveal>.5);}
    const p=(b.labelPoint?b.labelPoint.clone():new THREE.Vector3(b.x+(b.id==='projects'?(innerWidth<800?3.6:1.85):0),b.y+b.h+.95,b.z)).project(camera);
    let labelX=(p.x*.5+.5)*innerWidth;
    if(mode==='gallery'&&innerWidth<800){const offsets=[-.075,-.16,.05,-.105,-.04,.08,.08];labelX+=innerWidth*(offsets[Number(b.id.split('-')[1])]||0);labelX=THREE.MathUtils.clamp(labelX,b.label.offsetWidth/2+5,innerWidth-b.label.offsetWidth/2-5);}
    b.label.style.left=labelX+'px';b.label.style.top=(-p.y*.5+.5)*innerHeight+'px';b.label.style.visibility=p.z>1||!!transition?'hidden':'visible';b.label.classList.toggle('near',distance<1.2);
  }
  $('#near').hidden=!nearest||!!transition||$('#panel').open;if(nearest)$('#near-name').textContent=nearest.title;
  if(mode==='gallery'){projectWorld.animate(reduced?0:elapsed);const level=actor.position.y<.7?0:actor.position.y<3?1:actor.position.y<5.5?2:3;$('#floor-number').textContent=String(level).padStart(2,'0');}else{world.animate(reduced?0:elapsed);world.updateWaterReflection(renderer,camera);}renderer.render(scene,camera);
}
tick();
if(renderer){$('#progress').textContent='100%';setTimeout(()=>{$('#loader').style.opacity=0;setTimeout(()=>$('#loader').remove(),750);},450);}
setTimeout(()=>$('.instructions').style.opacity='.55',11000);

if(location.hash==='#projects'&&renderer)gallery();
addEventListener('hashchange',()=>{if(!renderer)return;if(location.hash==='#projects'&&mode==='home')gallery();else if(location.hash!=='#projects'&&mode==='gallery')home();});
