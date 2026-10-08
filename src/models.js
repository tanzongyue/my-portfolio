import * as THREE from 'three';

export function softBox(w,h,d,radius=.035){
  const r=Math.min(radius,w*.22,h*.22,d*.22),x=w/2-r,y=h/2-r,c=r*.4,s=new THREE.Shape();
  s.moveTo(-x+c,-y);s.lineTo(x-c,-y);s.quadraticCurveTo(x,-y,x,-y+c);s.lineTo(x,y-c);s.quadraticCurveTo(x,y,x-c,y);s.lineTo(-x+c,y);s.quadraticCurveTo(-x,y,-x,y-c);s.lineTo(-x,-y+c);s.quadraticCurveTo(-x,-y,-x+c,-y);
  const g=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,curveSegments:3,steps:1});g.translate(0,0,-d/2+r);return g;
}
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
function add(parent,geo,material,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function ellipsoid(parent,r,x,y,z,s,material){const m=add(parent,new THREE.SphereGeometry(r,24,16),material,x,y,z);m.scale.set(...s);return m;}
function tube(parent,points,r,material){return add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,8,false),material);}
function limb(parent,a,b,r1,r2,material){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),m=add(parent,new THREE.CylinderGeometry(r2,r1,delta.length(),16),material);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}

// Adult proportions, shaped clothes, articulated knees and elbows.
export function createExplorer(){
  const actor=new THREE.Group(),body=new THREE.Group();actor.add(body);
  const skin=mat('#d7a17e'),shirt=mat('#e9e4d9'),jacket=mat('#344b69'),pants=mat('#47535e'),leather=mat('#554138'),hair=mat('#302b28'),metal=mat('#bb9871',{metalness:.6,roughness:.32});
  const coat=add(body,new THREE.LatheGeometry([[.067,.41],[.089,.43],[.096,.53],[.105,.66],[.073,.72],[.044,.735]].map(p=>new THREE.Vector2(...p)),32),jacket);coat.scale.z=.7;
  add(body,softBox(.065,.23,.02),shirt,0,.608,.066);
  for(const side of [-1,1]){
    const lapel=add(body,softBox(.032,.145,.018),jacket,side*.032,.646,.082);lapel.rotation.z=side*.27;
    add(body,softBox(.035,.045,.011),jacket,side*.065,.502,.063);
    add(body,softBox(.014,.12,.015),leather,side*.064,.64,-.078);
  }
  for(let i=0;i<3;i++)ellipsoid(body,.007,.019,.496+i*.055,.081,[1,1,.4],metal);
  add(body,softBox(.135,.018,.105),leather,0,.43,0);add(body,softBox(.021,.019,.008),metal,0,.43,.057);
  ellipsoid(body,.038,0,.75,0,[.68,1,.68],skin);
  const head=new THREE.Group();body.add(head);head.position.y=.823;
  ellipsoid(head,.064,0,0,0,[.82,1.16,.92],skin);
  ellipsoid(head,.047,0,-.047,.007,[.82,.6,.8],skin);
  ellipsoid(head,.067,0,.028,-.014,[.86,.94,.85],hair);
  ellipsoid(head,.049,0,.019,.041,[.95,.38,.4],hair);
  for(const side of [-1,1]){
    ellipsoid(head,.014,side*.055,-.006,-.002,[.4,1,.7],skin);
    ellipsoid(head,.008,side*.023,.006,.054,[.95,.52,.4],hair);
    tube(head,[[side*.014,.019,.053],[side*.026,.022,.055],[side*.034,.019,.049]],.003,hair);
  }
  ellipsoid(head,.013,0,-.012,.061,[.55,.85,.75],skin);
  tube(head,[[-.016,-.035,.056],[0,-.038,.059],[.016,-.035,.056]],.0025,mat('#8e5444'));
  const pack=add(body,softBox(.13,.185,.08,.02),leather,0,.585,-.11);
  add(body,softBox(.14,.05,.075),mat('#a98767'),0,.666,-.117);
  add(body,softBox(.075,.058,.025),leather,0,.548,-.162);
  for(const side of [-1,1])add(body,softBox(.012,.15,.011),metal,side*.038,.586,-.156);
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();body.add(arm);arm.position.set(side*.098,.69,0);
    limb(arm,[0,0,0],[side*.013,-.12,0],.028,.023,jacket);ellipsoid(arm,.024,side*.013,-.12,0,[1,1,1],jacket);
    const forearm=new THREE.Group();arm.add(forearm);forearm.position.set(side*.013,-.12,0);forearm.rotation.x=-.13;
    limb(forearm,[0,0,0],[0,-.117,0],.023,.017,jacket);add(forearm,softBox(.037,.023,.033),shirt,0,-.105,0);
    ellipsoid(forearm,.022,0,-.143,.006,[.75,1.4,.65],skin);ellipsoid(forearm,.01,-side*.017,-.135,.013,[.6,1,.6],skin);
    arm.userData.forearm=forearm;arms.push(arm);
    const leg=new THREE.Group();body.add(leg);leg.position.set(side*.047,.427,0);
    limb(leg,[0,0,0],[0,-.19,0],.04,.027,pants);ellipsoid(leg,.029,0,-.19,0,[1,1,1],pants);
    const shin=new THREE.Group();leg.add(shin);shin.position.y=-.19;
    limb(shin,[0,0,0],[0,-.192,0],.027,.02,pants);
    ellipsoid(shin,.038,0,-.206,.021,[.75,.55,1.5],leather);add(shin,softBox(.057,.014,.112),hair,0,-.225,.024);
    leg.userData.shin=shin;legs.push(leg);
  }
  actor.userData={body,head,coat,arms,legs,pack};return actor;
}
export function animateExplorer(actor,t,moving,reduced){
  const {body,head,arms,legs}=actor.userData,phase=t*10.5,stride=moving?.36:0;
  legs.forEach((l,i)=>{const swing=Math.sin(phase+i*Math.PI);l.rotation.x=swing*stride;l.userData.shin.rotation.x=moving?Math.max(0,-swing)*.55:0;});
  arms.forEach((a,i)=>{a.rotation.x=-Math.sin(phase+i*Math.PI)*stride*.6;a.rotation.z=(i?1:-1)*.05;a.userData.forearm.rotation.x=-.13-(moving?Math.max(0,Math.sin(phase+i*Math.PI))*.18:0);});
  body.position.y=moving?Math.abs(Math.sin(phase))*.012:reduced?0:Math.sin(t*1.8)*.0025;body.rotation.z=moving?Math.sin(phase)*.015:0;head.rotation.y=reduced||moving?0:Math.sin(t*.42)*.09;
}

// Curved anatomical forms and tapered fur tufts, rather than a toy cube body.
export function createDog(){
  const g=new THREE.Group(),fur=mat('#bc8855'),light=mat('#d9b985'),dark=mat('#302820',{roughness:.38}),pink=mat('#c57673'),eyes=[];
  ellipsoid(g,.32,0,.51,-.08,[.66,.85,1.55],fur);
  ellipsoid(g,.26,0,.57,.19,[.76,1.02,.9],light);
  ellipsoid(g,.2,0,.8,.3,[.95,1.1,.86],fur);
  ellipsoid(g,.146,0,.724,.476,[.82,.66,1.18],light);
  ellipsoid(g,.08,0,.747,.604,[.88,.56,.65],dark);
  ellipsoid(g,.105,0,.673,.48,[.78,.28,1.08],dark);
  ellipsoid(g,.038,0,.651,.55,[.72,1,.5],pink);
  const ears=[];
  for(const side of [-1,1]){
    const ear=new THREE.Group();g.add(ear);ear.position.set(side*.153,.9,.23);ear.rotation.z=side*.14;
    ellipsoid(ear,.12,side*.02,-.09,.015,[.56,1.5,.75],fur);ears.push(ear);
    ellipsoid(g,.06,side*.105,.832,.449,[1,.8,.55],light);
    const eye=ellipsoid(g,.025,side*.098,.828,.473,[1,.85,.52],dark);eyes.push(eye);
    ellipsoid(g,.006,side*.092,.836,.488,[1,1,.4],mat('#faf2dd'));
    for(const front of [-1,1]){
      const z=front>0?.25:-.37,x=side*.15;
      ellipsoid(g,.125,x,.36,z,[.65,1.6,.75],fur);
      limb(g,[x,.29,z],[x,.09,z+.028],.042,.035,light);
      ellipsoid(g,.058,x,.053,z+.05,[.85,.6,1.45],light);
      for(let i=0;i<2;i++)tube(g,[[x+(i-.5)*.025,.056,z+.099],[x+(i-.5)*.025,.039,z+.116]],.003,fur);
    }
  }
  const tail=new THREE.Group();g.add(tail);tail.position.set(0,.63,-.53);
  tube(tail,[[0,0,0],[0,.1,-.18],[.025,.19,-.35],[.03,.21,-.47]],.035,light);
  const tuftGeo=new THREE.ConeGeometry(.022,.12,5),furTufts=new THREE.InstancedMesh(tuftGeo,light,90),dummy=new THREE.Object3D();g.add(furTufts);
  for(let i=0;i<90;i++){
    const a=i*2.399,y=.34+(i%11)*.03;
    dummy.position.set(Math.cos(a)*(.19+(y-.34)*.08),y,.13+Math.sin(a)*.24);
    dummy.rotation.set(.3+Math.sin(a)*.3,0,-Math.cos(a)*.7);dummy.scale.setScalar(.7+(i%4)*.1);dummy.updateMatrix();furTufts.setMatrixAt(i,dummy.matrix);
  }
  for(let i=0;i<12;i++){const a=i/11;ellipsoid(tail,.047,.025,a*.19,-.15-a*.29,[.75,1.8,.6],light);}
  const collar=add(g,new THREE.TorusGeometry(.145,.014,8,32),mat('#6a827f'),0,.709,.27);collar.rotation.x=Math.PI/2;
  ellipsoid(g,.024,0,.662,.406,[1,1,.3],mat('#cfac67',{metalness:.65,roughness:.25}));
  g.userData={tail,ears,eyes};return g;
}

export function createBlossomTree(height=2.5,seed=0){
  const g=new THREE.Group(),bark=mat('#77544e'),branches=new THREE.Group();g.add(branches);
  const points=[[0,0,0],[.02,height*.25,0],[-.07,height*.47,.04],[.04,height*.69,-.03]];
  tube(branches,points,height*.027,bark);
  const blooms=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mat('#f7bacf'),170),leaves=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),mat('#a5b58c'),38),d=new THREE.Object3D();g.add(blooms,leaves);
  for(let i=0;i<7;i++){
    const a=i*2.399+seed,start=[0,height*.36,0],tip=[Math.cos(a)*height*.32,height*(.61+(i%3)*.09),Math.sin(a)*height*.26];
    tube(branches,[start,[tip[0]*.4,height*.52,tip[2]*.4],tip],height*.014,bark);
  }
  for(let i=0;i<170;i++){
    const a=i*2.399+seed,r=Math.sqrt(((i*37)%171)/171),ny=Math.sin(i*1.7);
    d.position.set(Math.cos(a)*r*height*.37,height*(.64+ny*.14),Math.sin(a)*r*height*.3);d.rotation.set(a,i*.7,0);d.scale.set(height*.044,height*.028,height*.042);d.updateMatrix();blooms.setMatrixAt(i,d.matrix);blooms.setColorAt(i,new THREE.Color(i%5===0?'#fff1f3':i%3===0?'#e896b6':'#f7bfd0'));
    if(i<38){d.scale.set(height*.025,height*.009,height*.048);d.updateMatrix();leaves.setMatrixAt(i,d.matrix);}
  }
  g.userData.blooms=blooms;return g;
}

export function createSailboat(){
  const g=new THREE.Group(),wood=mat('#79503a'),deckMat=mat('#c8a779'),paint=mat('#ece9df',{roughness:.35}),metal=mat('#bbc6c8',{metalness:.65,roughness:.24});
  const vertices=[],uv=[],indices=[],rings=26,radial=16;
  // Lofted hull: pointed bow, broad stern, flared gunwales and a submerged keel.
  for(let j=0;j<=rings;j++){
    const t=j/rings,x=-.95+t*2.05,width=.34*Math.pow(Math.sin(Math.PI*(t*.91+.06)),.68)*(1-t*.48);
    for(let i=0;i<=radial;i++){const a=i/radial*Math.PI,y=.17-Math.sin(a)*(.27*(1-t*.28));vertices.push(x,y,Math.cos(a)*width);uv.push(t,i/radial);if(j<rings&&i<radial){const n=j*(radial+1)+i;indices.push(n,n+1,n+radial+1,n+1,n+radial+2,n+radial+1);}}
  }
  for(const end of [0,rings]){const center=vertices.length/3;vertices.push(-.95+end/rings*2.05,.17,0);uv.push(end/rings,.5);for(let i=0;i<radial;i++){const n=end*(radial+1)+i;indices.push(center,end===0?n+1:n,end===0?n:n+1);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();add(g,geo,paint);
  for(const side of [-1,1]){
    const path=[];for(let j=0;j<=rings;j++){const t=j/rings;path.push([-.95+t*2.05,.185,side*.34*Math.pow(Math.sin(Math.PI*(t*.91+.06)),.68)*(1-t*.48)]);}
    tube(g,path,.026,wood);tube(g,path.map(p=>[p[0],p[1]-.07,p[2]*.99]),.008,mat('#426278'));
  }
  const shape=new THREE.Shape();shape.moveTo(-.95,-.12);shape.quadraticCurveTo(-.6,-.38,.1,-.28);shape.quadraticCurveTo(.8,-.15,1.1,0);shape.quadraticCurveTo(.8,.15,.1,.28);shape.quadraticCurveTo(-.6,.38,-.95,.12);shape.closePath();
  const deck=add(g,new THREE.ShapeGeometry(shape,24),deckMat,0,.15,0);deck.rotation.x=-Math.PI/2;
  for(let i=0;i<5;i++)tube(g,[[-.87,.163,(i-2)*.08],[.45,.163,(i-2)*.062],[.78,.163,(i-2)*.025]],.003,wood);
  for(const x of [-.6,-.2])add(g,softBox(.12,.04,.46),wood,x,.2,0);
  const cabin=add(g,softBox(.36,.13,.35,.03),paint,.33,.235,0);add(g,softBox(.12,.01,.16),mat('#476478',{metalness:.3,roughness:.2}),.33,.309,0);
  limb(g,[-.02,.18,0],[-.02,1.75,0],.02,.014,metal);limb(g,[0,.48,0],[.8,.48,.02],.012,.012,wood);
  const sailGeo=new THREE.PlaneGeometry(1,1,18,18),p=sailGeo.attributes.position;
  for(let i=0;i<p.count;i++){const u=p.getX(i)+.5,v=p.getY(i)+.5;p.setXYZ(i,u*(1-v)*.81,.5+v*1.2,Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.14);}sailGeo.computeVertexNormals();
  const sail=add(g,sailGeo,mat('#f6f1df',{side:THREE.DoubleSide,roughness:.95}));
  for(let row=1;row<5;row++){const v=row/5;const pts=[];for(let i=0;i<=10;i++){const u=i/10;pts.push([u*(1-v)*.81,.5+v*1.2,Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.14+.003]);}tube(g,pts,.002,mat('#d5c7ac'));}
  for(const x of [-.88,.99])tube(g,[[x,.18,0],[-.02,1.73,0]],.004,metal);
  for(const side of [-1,1])for(const x of [-.6,.7]){limb(g,[x,.18,side*.2],[x,.33,side*.2],.009,.009,metal);}
  for(const side of [-1,1])tube(g,[[-.6,.33,side*.2],[.12,.34,side*.26],[.7,.33,side*.2]],.006,metal);
  const flag=add(g,new THREE.PlaneGeometry(.19,.09),mat('#a56556',{side:THREE.DoubleSide}),.075,1.7,0);
  add(g,softBox(.035,.24,.19),wood,-.89,-.035,0);g.userData={flag,sail};return g;
}

export function createProjectDisplay(project,index,loadTextures){
  const g=new THREE.Group(),silver=mat('#9da8b0',{metalness:.7,roughness:.27}),black=mat('#20282f',{roughness:.4}),screenMat=new THREE.MeshBasicMaterial({color:'#dce5e8'});
  const screens=[{material:screenMat,image:project.images?.[0],whiten:true}];
  const laptop=new THREE.Group();g.add(laptop);laptop.position.y=.42;
  add(laptop,softBox(1.85,.065,1.12,.025),silver,0,0,.32);
  const lid=new THREE.Group();laptop.add(lid);lid.position.set(0,.02,-.19);lid.rotation.x=-.11;
  add(lid,softBox(1.85,1.14,.06,.035),silver,0,.57,0);add(lid,softBox(1.75,1.04,.017),black,0,.57,.037);
  add(lid,new THREE.PlaneGeometry(1.64,.923),screenMat,0,.56,.049);
  ellipsoid(lid,.012,0,1.08,.05,[1,1,.4],black);
  const keys=new THREE.InstancedMesh(softBox(.112,.011,.093,.009),black,48),keyDummy=new THREE.Object3D();laptop.add(keys);keys.castShadow=true;keys.receiveShadow=true;
  for(let row=0;row<4;row++)for(let col=0;col<12;col++){keyDummy.position.set((col-5.5)*.127,.04,row*.115);keyDummy.updateMatrix();keys.setMatrixAt(row*12+col,keyDummy.matrix);}
  add(laptop,softBox(.43,.007,.23,.018),silver,0,.039,.64);
  if(index===0||index===1||index===6){
    const phone=new THREE.Group();g.add(phone);phone.position.set(1.13,.43,.45);phone.rotation.y=-.18;phone.rotation.x=-.12;
    add(phone,softBox(.41,.86,.055,.045),black,0,.43,0);add(phone,softBox(.37,.8,.009,.037),silver,0,.43,.031);
    const mobileMat=screenMat.clone();screens.push({material:mobileMat,image:project.images?.[1]||project.images?.[0]});
    add(phone,new THREE.PlaneGeometry(.342,.72),mobileMat,0,.44,.038);add(phone,softBox(.085,.017,.008),black,0,.79,.047);
  }
  if(index===3){
    laptop.scale.set(1.13,1.13,1.13);add(g,softBox(.085,.52,.085),silver,0,.22,-.19);add(g,softBox(.62,.03,.38),silver,0,.015,-.17);
  }
  // Load device textures only when the traveler approaches this exhibit.
  // Small WebP previews keep the full-resolution artwork available in the gallery.
  g.userData.ensureTextures=()=>{
    if(!loadTextures)return;
    for(const screen of screens){
      if(!screen.image||screen.loaded||screen.loading||Date.now()<(screen.retryAt||0))continue;
      screen.loading=true;
      new THREE.TextureLoader().load(screen.image.displaySrc||screen.image.src,texture=>{
        texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
        screen.material.map=texture;if(screen.whiten)screen.material.color.set('#ffffff');screen.material.needsUpdate=true;
        screen.loaded=true;screen.loading=false;
      },undefined,()=>{screen.loading=false;screen.retryAt=Date.now()+10000;});
    }
  };
  g.rotation.y=.55;g.name='project-device-display';return g;
}
