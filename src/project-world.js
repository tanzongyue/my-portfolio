import * as THREE from 'three';
import { softBox, createBlossomTree, createProjectDisplay } from './models.js';

export function createProjectWorld(scene, projects, {textures: _textures = false} = {}) {
  const root = new THREE.Group();
  scene.add(root);
  const ground = [];
  const surfaces = [];
  const portals = [];
  const obstacles = [];
  const flags = [];
  const streams = [];
  const floaters = [];
  const rotors = [];
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({color, roughness: .8, ...extra});
  const stone = mat('#e7eadb');
  const cream = mat('#fff0c9');
  const rose = mat('#cda9bc');
  const lavender = mat('#b7a4c6');
  const green = mat('#b5c744');
  const gold = mat('#c9c526', {metalness: .08});
  const mint = mat('#80d6c6');
  const deep = mat('#495f85');
  const dark = mat('#26354f');
  const bookCover = mat('#5f78a5');
  const page = mat('#fff8df');
  const silver = mat('#b9c9d2', {metalness: .5, roughness: .32});
  const coinGold = mat('#f2be38', {metalness: .65, roughness: .25});
  const diamond = mat('#9adce1', {transparent: true, opacity: .82, metalness: .12, roughness: .12, emissive: '#58c6c9', emissiveIntensity: .18});
  const mesh = (geo, material, x, y, z, parent = root) => {
    const object = new THREE.Mesh(geo, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const box = (w, h, d, x, y, z, material = stone, parent = root) =>
    mesh(softBox(w, h, d), material, x, y, z, parent);
  const cylinder = (radius, height, x, y, z, material, segments = 32, parent = root) =>
    mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material, x, y, z, parent);
  function balustrade(x1,x2,z,y) {
    const length=x2-x1;
    box(length,.055,.055,(x1+x2)/2,y+.43,z,gold);
    box(length,.032,.032,(x1+x2)/2,y+.17,z,rose);
    const n=Math.ceil(length/.64);
    for(let i=0;i<=n;i++) cylinder(.025,.43,x1+length*i/n,y+.215,z,cream,8);
    obstacles.push({x:(x1+x2)/2,z,w:length+.05,d:.08});
  }
  function inlayLine(points,material=gold,parent=root,radius=.018) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,radius,6,false),material,0,0,0,parent);
  }

  function platformShape(w, d) {
    const shape = new THREE.Shape();
    shape.moveTo(-w * .5, -d * .32);
    shape.lineTo(-w * .32, -d * .5);
    shape.lineTo(w * .45, -d * .42);
    shape.lineTo(w * .5, d * .2);
    shape.lineTo(w * .28, d * .5);
    shape.lineTo(-w * .44, d * .42);
    shape.closePath();
    return shape;
  }

  function deck(x, z, w, d, y, rotation = 0) {
    const plate = mesh(new THREE.ExtrudeGeometry(platformShape(w, d), {
      depth: .16,
      bevelEnabled: true,
      bevelSize: .035,
      bevelThickness: .035,
      bevelSegments: 2
    }), cream, x, y - .16, z);
    plate.rotation.x = -Math.PI / 2;
    plate.rotation.z = rotation;
    ground.push(plate);
    surfaces.push({x, z, w, d, y});
    const underside = box(w * .74, .28, d * .65, x, y - .32, z, stone);
    underside.rotation.y = rotation;
  }

  function arch(w, h, opening, depth, material = stone, parent = root) {
    const radius = opening / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(-radius, 0);
    shape.lineTo(-radius, h * .55);
    shape.absarc(0, h * .55, radius, Math.PI, 0, true);
    shape.lineTo(radius, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(w / 2, h);
    shape.lineTo(-w / 2, h);
    shape.closePath();
    return mesh(new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2}), material, 0, 0, 0, parent);
  }

  function support(x, z, w, d, y, rotation = 0) {
    if (y < .5) return;
    const wall = arch(w, y - .2, w * .58, .28, lavender);
    wall.position.set(x, .02, z + d / 2 - .3);
    wall.rotation.y = rotation;
    const left = box(.28, y - .2, d, x - w / 2 + .14, (y - .2) / 2, z, rose);
    const right = box(.28, y - .2, d, x + w / 2 - .14, (y - .2) / 2, z, rose);
    left.rotation.y = rotation;
    right.rotation.y = rotation;
    const cap = box(w, .22, d, x, y - .3, z, stone);
    cap.rotation.y = rotation;
    for(const side of [-1,1]){
      box(.36,.12,d+.05,x+side*(w/2-.14),.08,z,cream);
      box(.33,.065,d+.035,x+side*(w/2-.14),y*.42,z,rose);
    }
  }

  function stairs(x, z1, z2, y1, y2, width = 1.5, rotation = 0) {
    const n = Math.ceil(Math.abs(y2 - y1) / .14);
    const length = z2 - z1;
    for (let i = 0; i < n; i += 1) {
      const y = y1 + (y2 - y1) * (i + .5) / n;
      const z = z1 + length * (i + .5) / n;
      const step = box(width, .16, Math.abs(length) / n + .025, x, y - .08, z, i % 3 === 0 ? rose : cream);
      step.rotation.y = rotation;
      ground.push(step);
    }
    surfaces.push({
      x,
      z: (z1 + z2) / 2,
      w: width,
      d: Math.abs(length),
      y: (value) => THREE.MathUtils.lerp(y1, y2, THREE.MathUtils.clamp((value - z1) / length, 0, 1))
    });
    const beam = box(width - .1, .16, Math.hypot(length, y2 - y1), x, (y1 + y2) / 2 - .21, (z1 + z2) / 2, stone);
    beam.rotation.x = -Math.atan2(y2 - y1, length);
    beam.rotation.y = rotation;
  }

  function tiltedGateway(x, z, y, scale = 1, rotation = 0) {
    const gateway = new THREE.Group();
    root.add(gateway);
    gateway.position.set(x, y, z);
    gateway.rotation.y = rotation;
    const frame = arch(1.45 * scale, 2.65 * scale, .7 * scale, .18 * scale, rose, gateway);
    frame.rotation.z = -.08;
    box(.12 * scale, 2.25 * scale, .16 * scale, -.72 * scale, 1.12 * scale, 0, lavender, gateway);
    box(.12 * scale, 2.25 * scale, .16 * scale, .72 * scale, 1.12 * scale, 0, lavender, gateway);
    const halo = mesh(new THREE.TorusGeometry(.64 * scale, .035 * scale, 8, 32, Math.PI * 1.25), cream, 0, 1.95 * scale, .08, gateway);
    halo.rotation.x = Math.PI / 2;
    return gateway;
  }

  function floatingStone(x, z, y, w, d, rotation = 0) {
    const slab = box(w, .15, d, x, y, z, cream);
    slab.rotation.y = rotation;
    slab.rotation.z = Math.sin(rotation) * .08;
    floaters.push({object: slab, baseY: y, phase: x * .7 + z});
    const pin = cylinder(.08, .4, x, y - .23, z, rose, 8);
    pin.rotation.z = Math.PI / 2;
  }

  function pedestal(parent, color = rose, scale = 1) {
    cylinder(.68 * scale, .18 * scale, 0, .1 * scale, 0, cream, 8, parent);
    cylinder(.48 * scale, .18 * scale, 0, .29 * scale, 0, color, 6, parent);
    const ring = mesh(new THREE.TorusGeometry(.42 * scale, .025 * scale, 8, 32), gold, 0, .4 * scale, 0, parent);
    ring.rotation.x = Math.PI / 2;
  }

  function addCrypto(parent, scale = 1, phase = 0) {
    pedestal(parent, coinGold, scale);
    const coin = cylinder(.43 * scale, .16 * scale, 0, .88 * scale, 0, coinGold, 32, parent);
    coin.rotation.x = Math.PI / 2;
    const rim = mesh(new THREE.TorusGeometry(.37 * scale, .035 * scale, 8, 32), cream, 0, .88 * scale, .1 * scale, parent);
    const mark = new THREE.Group();parent.add(mark);mark.position.set(0,.88*scale,.105*scale);mark.scale.setScalar(scale);
    if(phase>=5){const symbol=mesh(new THREE.OctahedronGeometry(.21),cream,0,0,.012,mark);symbol.scale.set(.55,1.05,.1);}
    else{
      for(const x of [-.07,-.017])box(.025,.46,.026,x,0,.008,cream,mark);
      for(const y of [-.087,.087]){const loop=mesh(new THREE.TorusGeometry(.104,.024,8,24,Math.PI),cream,-.045,y,.008,mark);loop.rotation.z=-Math.PI/2;}
    }
    for(let i=0;i<20;i++){
      const a=i*Math.PI/10;
      const tick=box(.015*scale,.032*scale,.012*scale,Math.cos(a)*.397*scale,.88*scale+Math.sin(a)*.397*scale,.082*scale,cream,parent);tick.rotation.z=a-Math.PI/2;
    }
    floaters.push({object: parent, baseY: parent.position.y, phase});
  }

  function addBook(parent, scale = 1, phase = 0) {
    pedestal(parent, bookCover, scale);
    const leftCover = box(.56 * scale, .06 * scale, .82 * scale, -.28 * scale, .72 * scale, 0, bookCover, parent);
    const rightCover = box(.56 * scale, .06 * scale, .82 * scale, .28 * scale, .72 * scale, 0, bookCover, parent);
    const leftPage = box(.5 * scale, .055 * scale, .73 * scale, -.25 * scale, .77 * scale, 0, page, parent);
    const rightPage = box(.5 * scale, .055 * scale, .73 * scale, .25 * scale, .77 * scale, 0, page, parent);
    leftCover.rotation.z = -.16;
    rightCover.rotation.z = .16;
    leftPage.rotation.z = -.16;
    rightPage.rotation.z = .16;
    const spine = cylinder(.07 * scale, .78 * scale, 0, .77 * scale, 0, rose, 12, parent);
    spine.rotation.x = Math.PI / 2;
    for(const side of [-1,1]){
      for(let i=0;i<3;i++){
        const layer=box(.49*scale,.013*scale,.715*scale,side*.25*scale,(.802+i*.014)*scale,0,page,parent);layer.rotation.z=side*.16;
      }
      for(let i=0;i<5;i++){
        const rule=box((i===4?.22:.32)*scale,.005*scale,.009*scale,side*.27*scale,.872*scale,(-.21+i*.095)*scale,rose,parent);rule.rotation.z=side*.16;
      }
    }
    const ribbon=box(.065*scale,.012*scale,.37*scale,.35*scale,.73*scale,.29*scale,rose,parent);ribbon.rotation.x=-.19;
    floaters.push({object: parent, baseY: parent.position.y, phase});
  }

  function addDrone(parent, scale = 1, phase = 0) {
    pedestal(parent, mint, scale);
    box(.45*scale,.17*scale,.3*scale,0,.95*scale,0,silver,parent);
    box(.24*scale,.02*scale,.2*scale,0,1.044*scale,0,deep,parent);
    for(const x of [-1,1])for(const z of [-1,1]){
      const px=x*.37*scale,pz=z*.32*scale;
      inlayLine([[x*.12*scale,.95*scale,z*.09*scale],[px,.96*scale,pz]],deep,parent,.027*scale);
      cylinder(.05*scale,.1*scale,px,.985*scale,pz,silver,12,parent);
      const guard=mesh(new THREE.TorusGeometry(.185*scale,.012*scale,6,24),mint,px,1.02*scale,pz,parent);guard.rotation.x=Math.PI/2;
      const rotor=new THREE.Group();parent.add(rotor);rotor.position.set(px,1.04*scale,pz);
      box(.3*scale,.013*scale,.037*scale,0,0,0,deep,rotor);box(.037*scale,.013*scale,.3*scale,0,0,0,deep,rotor);
      rotors.push({object:rotor,phase:phase+x+z,direction:x*z});
      cylinder(.017*scale,.21*scale,px*.58,.78*scale,pz*.62,deep,8,parent);
    }
    for(const side of [-1,1])box(.035*scale,.025*scale,.5*scale,side*.21*scale,.67*scale,0,silver,parent);
    const camera=mesh(new THREE.SphereGeometry(.082*scale,16,10),deep,0,.86*scale,.21*scale,parent);camera.scale.z=.75;
    const lens=mesh(new THREE.SphereGeometry(.047*scale,16,10),diamond,0,.86*scale,.265*scale,parent);lens.scale.z=.4;
    box(.035*scale,.025*scale,.015*scale,.15*scale,.97*scale,.159*scale,mint,parent);
    floaters.push({object:parent,baseY:parent.position.y,phase});
  }

  function addDiamond(parent, scale = 1, phase = 0) {
    pedestal(parent, lavender, scale);
    const gem=new THREE.Group();parent.add(gem);
    const crown=mesh(new THREE.CylinderGeometry(.28*scale,.46*scale,.27*scale,8),diamond,0,1.3*scale,0,gem);
    const point=mesh(new THREE.ConeGeometry(.46*scale,.58*scale,8),diamond,0,.875*scale,0,gem);point.rotation.z=Math.PI;
    for(const part of [crown,point]){
      const outline=new THREE.LineSegments(new THREE.EdgesGeometry(part.geometry),new THREE.LineBasicMaterial({color:'#f6ffff',transparent:true,opacity:.75}));part.add(outline);
    }
    floaters.push({object: parent, baseY: parent.position.y, phase});
  }

  function addEyeCube(parent, scale = 1, phase = 0) {
    pedestal(parent, rose, scale);
    const cube = box(.82 * scale, .82 * scale, .82 * scale, 0, .92 * scale, 0, deep, parent);
    cube.rotation.y = .22;
    cube.rotation.z = .08;
    const eye = mesh(new THREE.SphereGeometry(.2 * scale, 18, 12), cream, 0, .94 * scale, .43 * scale, parent);
    eye.scale.z = .22;
    eye.rotation.y = .22;
    const pupil = mesh(new THREE.SphereGeometry(.08 * scale, 16, 10), dark, 0, .94 * scale, .47 * scale, parent);
    pupil.scale.z = .3;
    pupil.rotation.y = .22;
    const sparkle=mesh(new THREE.SphereGeometry(.025*scale,10,8),cream,-.026*scale,.968*scale,.495*scale,parent);sparkle.scale.z=.2;
    inlayLine([[-.16*scale,1.23*scale,.42*scale],[0,1.27*scale,.46*scale],[.15*scale,1.23*scale,.42*scale]],cream,parent,.013*scale);
    floaters.push({object: parent, baseY: parent.position.y, phase});
  }

  function projectObject(index, parent) {
    if (index === 0) addBook(parent, 1.05, index);
    else if (index === 1) addEyeCube(parent, .95, index);
    else if (index === 2) addDiamond(parent, .9, index);
    else if (index === 3) addDrone(parent, .95, index);
    else if (index === 4) addCrypto(parent, 1.02, index);
    else if (index === 5) addCrypto(parent, .86, index + .4);
    else addEyeCube(parent, .82, index + .7);
  }

  // The terraces remain easy to traverse, while their visual edges and supports are skewed.
  const gardenBase=mesh(new THREE.ExtrudeGeometry(platformShape(14,16),{depth:.26,bevelEnabled:true,bevelSize:.09,bevelThickness:.05,bevelSegments:2}),green,0,-.5,.1);gardenBase.rotation.x=-Math.PI/2;
  const gardenEdge=mesh(new THREE.ExtrudeGeometry(platformShape(13.85,15.85),{depth:.13,bevelEnabled:false}),rose,0,-.62,.1);gardenEdge.rotation.x=-Math.PI/2;
  deck(0, 6.1, 2.25, 1.5, 0, -.12);
  deck(0, 3.15, 11.5, 2.2, 1.8, .02);
  support(-2.7, 3.15, 5.5, 2.2, 1.8, -.08);
  support(3, 3.15, 5.5, 2.2, 1.8, .06);
  stairs(0, 5.65, 4.08, 0, 1.8, 1.5, -.04);
  deck(.3, -2.05, 12, 1.9, 4.2, -.015);
  support(-4, -2.05, 2.1, 1.9, 4.2, -.16);
  support(1.8, -2.05, 2.5, 1.9, 4.2, .11);
  support(5, -2.05, 2.1, 1.9, 4.2, .14);
  stairs(-4, 2.2, -1.24, 1.8, 4.2, 1.55, -.08);
  deck(.35, -6, 8.7, 1.95, 6.6, .025);
  support(-1.8, -6, 2.1, 1.95, 6.6, .1);
  support(2.7, -6, 2.1, 1.95, 6.6, -.06);
  stairs(0, -2.13, -5.23, 4.2, 6.6, 1.55, .04);
  stairs(5, 2.2, -1.24, 1.8, 4.2, 1.5, .1);
  balustrade(-5.15,-.92,4.18,1.8);balustrade(.92,5.3,4.18,1.8);
  balustrade(-2.95,3.91,-1.13,4.2);
  balustrade(-3.5,-.98,-5.09,6.6);balustrade(.98,4.25,-5.09,6.6);
  // Slender colonnades and hanging arches deepen the silhouette between levels.
  for(const [x,z,y]of [[-5.25,-3.05,0],[5.65,-3.06,0],[-3.35,-6.64,4.2]]){
    const g=new THREE.Group();root.add(g);g.position.set(x,y,z);
    const col=arch(.85,1.45,.49,.12,rose,g);
    box(.97,.08,.23,0,1.49,.08,cream,g);
    for(const side of [-1,1])box(.22,.07,.22,side*.31,.035,.08,stone,g);
  }

  tiltedGateway(-4.6, 1.55, 1.8, .88, -.18);
  tiltedGateway(2.55, -4.55, 4.2, .82, .16);
  tiltedGateway(1.9, -6.45, 6.6, .76, -.2);
  floatingStone(-5.5, 5.5, 2.45, 1.2, .7, -.22);
  floatingStone(5.7, 4.9, 5.1, 1.25, .65, .16);
  floatingStone(-3.15, -5.25, 7.2, 1, .55, .18);

  const positions = [
    [-1.8, -6.65, 6.6],
    [-4, -2.7, 4.2],
    [2.7, -6.65, 6.6],
    [1.85, -2.7, 4.2],
    [-2.25, 2.5, 1.8],
    [5, -2.7, 4.2],
    [3, 2.5, 1.8]
  ];
  projects.forEach((project, index) => {
    const [x, z, y] = positions[index];
    const group = new THREE.Group();
    root.add(group);
    group.position.set(x, y, z);
    const model=new THREE.Group();group.add(model);projectObject(index, model);
    const display=createProjectDisplay(project,index,_textures);group.add(display);display.visible=false;
    cylinder(1.01,.12,0,.19,-.12,stone,32,group);
    cylinder(1.05,.045,0,.267,-.12,cream,32,group);
    const halo = mesh(new THREE.RingGeometry(.7, .76, 40), new THREE.MeshBasicMaterial({
      color: index === 3 ? '#6ce1d0' : '#fff8a8',
      transparent: true,
      opacity: .45,
      side: THREE.DoubleSide
    }), 0, .025, .88, group);
    halo.rotation.x = -Math.PI / 2;
    cylinder(.025, .55, 0, 1.65, 0, cream, 8, group);
    const flag = mesh(new THREE.PlaneGeometry(.55, .16, 10, 2), new THREE.MeshBasicMaterial({
      color: index === 3 ? '#45cfc0' : '#ff9b2e',
      side: THREE.DoubleSide
    }), .28, 1.88, 0, group);
    flag.userData.base = Float32Array.from(flag.geometry.attributes.position.array);
    flags.push(flag);
    const object = group.children.find((child) => child.isMesh) || group;
    const portal = {
      id: `project-${index}`,
      title: project.title,
      sub: project.role,
      x,
      z,
      y,
      h: 1.45,
      g: group,
      model,
      display,
      reveal:0,
      door: object,
      ring: halo,
      projectTitleOnly: true,
      labelPoint: new THREE.Vector3(x, y + 2.05, z + .35),
      entrance: new THREE.Vector3(x, y + .05, z + .98)
    };
    group.userData.building = portal;
    portals.push(portal);
    obstacles.push({x, z, w: 1.05, d: .82});
  });

  const waterMat = mat('#46cbbd', {transparent: true, opacity: .78, roughness: .2, emissive: '#43c2c0', emissiveIntensity: .16});
  box(2.7, .035, 2.1, 2.7, .03, .05, waterMat);
  box(3, .14, .14, 2.7, 0, 1.17, cream);
  box(3, .14, .14, 2.7, 0, -1.07, cream);
  function fall(x, z, y, height, width) {
    const uniforms = {time: {value: 0}};
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      uniforms,
      vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec2 v;uniform float time;void main(){float s=pow(.5+.5*sin(v.x*70.+sin(v.y*10.+time*2.)),6.);gl_FragColor=vec4(.28+s*.35,.85+s*.13,.77+s*.2,.75);}'
    });
    mesh(new THREE.PlaneGeometry(width, height), material, x, y - height / 2, z);
    streams.push(material);
    box(width, .07, .4, x, y, z - .12, waterMat);
  }
  fall(2.72, -4.96, 6.6, 2.4, .6);
  fall(2.72, -1.04, 4.2, 4.1, .7);
  box(.7, .06, 3.8, 2.72, 4.16, -3, waterMat);
  for (const side of [-1, 1]) box(.1, .1, 3.8, 2.72 + side * .4, 4.2, -3, cream);

  function tree(x, z, height) {
    cylinder(.035, height * .3, x, height * .15, z, deep, 8);
    const crown=mesh(new THREE.LatheGeometry([[0,0],[.12,.05],[.23,.23],[.2,.5],[.12,.8],[0,1]].map(([r,y])=>new THREE.Vector2(r,y*height*.79)),16),green,x,height*.24,z);
    for(let i=0;i<3;i++){const tuft=mesh(new THREE.SphereGeometry(.15,12,8),mint,x+Math.sin(i*2.4)*.14,.15,z+Math.cos(i*2.4)*.14);tuft.scale.y=.55;}
  }
  for (const [x, z, height] of [[-6, 2.7, 2.5], [-5.8, 4.7, 1.5], [6, 4.7, 2.4], [5.9, 6.5, 1.6], [-3.5, 6.5, .8], [-6, -4, 2.2]]) tree(x, z, height);
  for(const [x,y,z,h]of [[-6.2,0,5.6,2.6],[6.1,0,2.1,2.8],[-5.7,0,-4.5,2.2],[4.5,0,6.4,2.2]]){
    const blossom=createBlossomTree(h,x+z);root.add(blossom);blossom.position.set(x,y,z);
  }
  // Hanging colonnades, a circular sanctuary and thin sky bridges give the exhibition depth.
  const sanctuary=new THREE.Group();root.add(sanctuary);sanctuary.position.set(-5.2,0,-6.8);
  cylinder(1.1,.2,0,2.9,0,rose,32,sanctuary);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    cylinder(.062,2.7,Math.cos(a)*.83,1.42,Math.sin(a)*.83,cream,16,sanctuary);
    cylinder(.1,.09,Math.cos(a)*.83,2.76,Math.sin(a)*.83,gold,16,sanctuary);
  }
  const dome=mesh(new THREE.SphereGeometry(1.1,32,16,0,Math.PI*2,0,Math.PI/2),lavender,0,3.01,0,sanctuary);dome.scale.y=.45;
  const roundTower=new THREE.Group();root.add(roundTower);roundTower.position.set(6.7,0,-5.7);
  cylinder(.59,5.7,0,2.85,0,lavender,32,roundTower);
  for(let i=0;i<6;i++)cylinder(.65,.07,0,.4+i*.92,0,rose,32,roundTower);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;box(.065,1.7,.065,Math.cos(a)*.55,6.51,Math.sin(a)*.55,cream,roundTower);
    obstacles.push({x:6.7+Math.cos(a)*.55,z:-5.7+Math.sin(a)*.55,w:.065,d:.065});
  }
  const observatoryDeck=cylinder(.88,.16,0,5.77,0,cream,32,roundTower);ground.push(observatoryDeck);
  // The upper loggia is a walkable destination reached by a continuous spiral.
  surfaces.push({x:6.7,z:-5.7,r:.88,y:5.85});
  cylinder(.79,.16,0,7.4,0,cream,32,roundTower);const towerTop=mesh(new THREE.ConeGeometry(.83,.58,32),rose,0,7.77,0,roundTower);
  cylinder(.025,.35,0,8.18,0,gold,12,roundTower);
  deck(6.25,-2.13,1.6,1.65,4.2);deck(6.7,-3.52,1.08,2.7,4.2);
  const spiralStart=Math.PI/2,spiralLength=Math.PI*1.5,spiralRise=1.65,spiralSteps=24,railPoints=[];
  for(let i=0;i<=spiralSteps;i++){
    const a=spiralStart+i/spiralSteps*spiralLength,y=4.2+i/spiralSteps*spiralRise;
    const step=box(.68,.13,.25,6.7+Math.cos(a)*.96,y-.065,-5.7+Math.sin(a)*.96,cream);step.rotation.y=-a;ground.push(step);
    const px=6.7+Math.cos(a)*1.29,pz=-5.7+Math.sin(a)*1.29;railPoints.push([px,y+.37,pz]);
    if(i%2===0)cylinder(.016,.37,px,y+.185,pz,gold,8);
  }
  inlayLine(railPoints,gold,root,.019);
  surfaces.push({x:6.7,z:-5.7,spiral:true,inner:.76,outer:1.17,start:spiralStart,length:spiralLength,y:4.2,rise:spiralRise});
  obstacles.push({x:6.7,z:-5.7,r:.6,maxY:5.64});
  for(let i=0;i<4;i++){
    const arcade=arch(1.1,2.8,.78,.16,rose);arcade.position.set(-1.65+i*1.1,0,-8.65);
    box(1.12,.08,.45,-1.65+i*1.1,2.89,-8.55,cream);
  }
  for(const [x,z,y]of [[-4.5,3.7,1.8],[4.2,3.7,1.8],[-2.7,-1.45,4.2],[3.8,-5.56,6.6]]){
    cylinder(.035,.32,x,y+.17,z,gold,12);box(.15,.15,.15,x,y+.4,z,mat('#fff2c1',{emissive:'#ffc979',emissiveIntensity:.45}));
  }
  for (let i = 0; i < 22; i += 1) {
    const x = Math.sin(i * 3.13) * 6;
    const z = Math.cos(i * 1.79) * 6;
    const sprout = mesh(new THREE.ConeGeometry(.12, .5, 5), deep, x, .12, z);
    sprout.rotation.z = Math.sin(i) * .55;
  }

  function heightAt(x, z) {
    for (let i = surfaces.length - 1; i >= 0; i -= 1) {
      const surface = surfaces[i];
      if(surface.spiral){
        const dx=x-surface.x,dz=z-surface.z,r=Math.hypot(dx,dz);let angle=Math.atan2(dz,dx);if(angle<0)angle+=Math.PI*2;
        if(r>=surface.inner&&r<=surface.outer&&angle>=surface.start-.06&&angle<=surface.start+surface.length+.06)return surface.y+surface.rise*THREE.MathUtils.clamp((angle-surface.start)/surface.length,0,1);
        continue;
      }
      if(surface.r){if(Math.hypot(x-surface.x,z-surface.z)<surface.r-.07)return surface.y;continue;}
      if (Math.abs(x - surface.x) <= surface.w / 2 - .1 && Math.abs(z - surface.z) <= surface.d / 2 - .01) {
        return typeof surface.y === 'function' ? surface.y(z) : surface.y;
      }
    }
    return null;
  }

  function free(x, z) {
    const y=heightAt(x,z);
    return y!==null&&!obstacles.some(o=>o.r?y<o.maxY&&Math.hypot(x-o.x,z-o.z)<o.r+.12:Math.abs(x-o.x)<o.w/2+.12&&Math.abs(z-o.z)<o.d/2+.12);
  }

  function animate(time) {
    streams.forEach((material) => { material.uniforms.time.value = time; });
    flags.forEach((flag) => {
      const position = flag.geometry.attributes.position;
      const base = flag.userData.base;
      for (let i = 0; i < position.count; i += 1) {
        position.setZ(i, base[i * 3 + 2] + Math.sin(base[i * 3] * 7 + time * 2) * .08 * (base[i * 3] + .35));
      }
      position.needsUpdate = true;
    });
    floaters.forEach((item, index) => {
      if (item.object.isMesh) {
        item.object.position.y = item.baseY + Math.sin(time * .8 + item.phase) * .04;
        item.object.rotation.y = time * .12;
      } else {
        item.object.position.y = item.baseY + Math.sin(time * .75 + item.phase) * .06;
        item.object.rotation.y = Math.sin(time * .35 + index) * .08;
      }
    });
    rotors.forEach(r=>r.object.rotation.y=time*18*r.direction+r.phase);
  }

  return {
    root,
    portals,
    ground,
    surfaces,
    obstacles,
    heightAt,
    free,
    animate,
    spawn: new THREE.Vector3(0, .05, 6.2)
  };
}
