import * as THREE from 'three';
import { softBox, createDog, createBlossomTree, createSailboat } from './models.js';

// Architecture and navigation share the same surfaces, including stair heights.
export function createWorld(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const surfaces = [], obstacles = [], ground = [], portals = [], falls = [], ripples = [], boats = [], foliage = [], glints = [], bridgeRailings = [];
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .72, ...extra });
  const ivory = material('#fff2e5'), trim = material('#fff8ee'), blueStone = material('#adc5e7');
  const pinkStone = material('#f3cddc'), darkStone = material('#829ed0');
  const light = material('#a8afff', { emissive: '#8178ff', emissiveIntensity: .8 });
  const green = ['#47897b', '#659c79', '#87b287'].map(c => material(c));
  const trunk = material('#95736f');
  const dogBody = material('#d99566');
  const dogCream = material('#fff0d0');
  const dogDark = material('#3a3443');
  const dogPink = material('#f29db0');
  const dogGold = material('#f2c14d', {metalness:.35,roughness:.28});
  const boatWood = material('#b98162');
  const boatSail = material('#fff4d4');
  const brass = material('#c6a274',{metalness:.45,roughness:.38});
  const flowerColors = ['#e99dac','#f8dfa6','#d1b0d8'].map(c=>material(c));
  const mesh = (geo, mat, x, y, z, parent = root) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const box = (w,h,d,x,y,z,mat=ivory,parent=root) => mesh(softBox(w,h,d),mat,x,y,z,parent);
  const sphere = (r,x,y,z,mat,parent=root) => mesh(new THREE.SphereGeometry(r,16,12),mat,x,y,z,parent);
  const cylinder = (r,h,x,y,z,mat=ivory,parent=root) => mesh(new THREE.CylinderGeometry(r,r,h,48),mat,x,y,z,parent);
  const archPath = (w,h) => {
    const p = new THREE.Path(); p.moveTo(-w/2,0); p.lineTo(w/2,0);
    p.lineTo(w/2,h-w/2); p.absarc(0,h-w/2,w/2,0,Math.PI,false); p.closePath(); return p;
  };
  function archWall(w,h,d,opening,openingHeight,mat,parent=root) {
    const shape = new THREE.Shape(); shape.moveTo(-w/2,0);
    shape.lineTo(-opening/2,0);shape.lineTo(-opening/2,openingHeight-opening/2);
    shape.absarc(0,openingHeight-opening/2,opening/2,Math.PI,0,true);
    shape.lineTo(opening/2,0);shape.lineTo(w/2,0);
    shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:24});
    return mesh(geo,mat,0,0,0,parent);
  }
  function rail(x1,z1,x2,z2,y,parent=root) {
    const dx=x2-x1,dz=z2-z1,length=Math.hypot(dx,dz),g=new THREE.Group();parent.add(g);
    g.position.set((x1+x2)/2,y,(z1+z2)/2);g.rotation.y=Math.atan2(dx,dz);
    box(.055,.055,length,0,.46,0,brass,g);
    box(.035,.035,length,0,.2,0,ivory,g);
    const count=Math.max(1,Math.ceil(length/.62));
    for(let i=0;i<=count;i++){
      box(.052,.49,.052,0,.245,-length/2+length*i/count,ivory,g);
      sphere(.04,0,.49,-length/2+length*i/count,brass,g);
    }
  }
  function lamp(x,y,z,parent=root) {
    cylinder(.095,.055,x,y+.025,z,ivory,parent);
    cylinder(.026,.44,x,y+.27,z,brass,parent);
    box(.14,.17,.14,x,y+.54,z,material('#ffe1a0',{emissive:'#ffce80',emissiveIntensity:.5}),parent);
    for(const side of [-1,1])box(.016,.19,.16,x+side*.07,y+.54,z,brass,parent);
    box(.18,.035,.18,x,y+.65,z,brass,parent);
    sphere(.028,x,y+.7,z,brass,parent);
  }
  function planter(x,y,z,size=.5,flowers=true) {
    const g=new THREE.Group();root.add(g);g.position.set(x,y,z);
    box(size,.22,size*.78,0,.11,0,pinkStone,g);box(size+.06,.05,size*.78+.06,0,.23,0,trim,g);
    box(size-.055,.014,size*.78-.04,0,.261,0,trunk,g);
    for(let i=0;i<7;i++){
      const a=i*2.399,r=size*(i%3+1)*.075;
      const leaf=sphere(.11,Math.cos(a)*r,.32+(i%2)*.04,Math.sin(a)*r,green[i%3],g);leaf.scale.set(1,.7,.75);
      if(flowers){const bloom=sphere(.067,Math.cos(a)*r,.41+(i%2)*.06,Math.sin(a)*r,flowerColors[i%3],g);bloom.scale.y=.65;sphere(.022,bloom.position.x,bloom.position.y+.044,bloom.position.z,boatSail,g);}
    }
    obstacles.push({x,z,w:size+.06,d:size*.78+.06});return g;
  }
  function rect(x,z,w,d,y,nav=true) {
    const surface={x,z,w,d,y}; if(nav)surfaces.push(surface);
    const top=box(w,.18,d,x,y-.09,z,trim); ground.push(top);return top;
  }
  function plinth(x,z,w,d,y,nav=true) {
    rect(x,z,w,d,y,nav);
    box(w-.08,.3,d-.08,x,y-.34,z,ivory);
    box(w-.24,Math.max(.25,y+2.55),d-.24,x,(y-2.55)/2-.5,z,blueStone);
    // Quiet masonry courses below the warm stone cap.
    for(let i=0;i<3;i++)box(w-.18,.055,d-.18,x,y-.78-i*.72,z,darkStone);
  }
  function bridge(x1,z1,x2,z2,y,width=1.45) {
    const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),g=new THREE.Group();
    root.add(g);g.position.set((x1+x2)/2,y,(z1+z2)/2);g.rotation.y=Math.atan2(dx,dz);
    const deck=box(width,.2,len,0,-.1,0,trim,g);ground.push(deck);
    const sx=Math.abs(dx)>Math.abs(dz),surface={x:(x1+x2)/2,z:(z1+z2)/2,w:sx?len:width,d:sx?width:len,y};surfaces.push(surface);
    for(let i=0;i<Math.floor(len/.6);i++)box(width,.016,.018,0,.012,-len/2+.3+i*.6,pinkStone,g);
    // Side faces with real openings; the negative space remains visible from orbit.
    const segments=Math.max(1,Math.floor(len/2.4)),segment=len/segments;
    for(let side of [-1,1])for(let i=0;i<segments;i++){
      const a=archWall(segment,1.75,.16,segment*.72,1.45,ivory,g);
      a.rotation.y=Math.PI/2;a.position.set(side*(width/2-.06),-1.92,-len/2+(i+.5)*segment);
    }
    bridgeRailings.push({group:g,width,len,surface});
  }
  function stairs(x,z1,z2,y1,y2,width=1.9) {
    const n=Math.ceil(Math.abs(y2-y1)/.15),len=z2-z1;
    for(let i=0;i<n;i++) {
      const z=z1+(i+.5)*len/n,y=THREE.MathUtils.lerp(y1,y2,(i+.5)/n);
      const step=box(width,.18,Math.abs(len)/n+.025,x,y-.09,z,i%3===0?pinkStone:trim);
      ground.push(step);
    }
    surfaces.push({x,z:(z1+z2)/2,w:width,d:Math.abs(len),y:(z)=>THREE.MathUtils.lerp(y1,y2,THREE.MathUtils.clamp((z-z1)/len,0,1))});
    for(const side of [-1,1]) {
      const beam=box(.14,.19,Math.hypot(len,y2-y1),x,(y1+y2)/2-.12,(z1+z2)/2,ivory);
      beam.position.x+=side*(width/2+.04);beam.rotation.x=-Math.atan2(y2-y1,len);
    }
  }
  function tree(x,y,z,h=2) {
    const g=new THREE.Group();root.add(g);g.position.set(x,y,z);
    cylinder(.065,h*.49,0,h*.245,0,trunk,g);
    if(h>2.25){
      for(let i=0;i<4;i++){const crown=mesh(new THREE.ConeGeometry(h*(.19-i*.027),h*.48,18),green[i%3],0,h*(.4+i*.17),0,g);foliage.push({object:crown,phase:x+z+i,amount:.013});}
    }else{
      for(let i=0;i<7;i++){
        const a=i*2.399,r=i===0?0:h*.11;
        const crown=sphere(h*.19,Math.cos(a)*r,h*(.59+(i%3)*.105),Math.sin(a)*r,green[i%3],g);crown.scale.set(.93,1.2,.93);
        foliage.push({object:crown,phase:x+z+i,amount:.009});
      }
      for(const side of [-1,1]){const branch=cylinder(.027,h*.25,side*h*.07,h*.47,0,trunk,g);branch.rotation.z=-side*.48;}
    }
    if(h>1.6)obstacles.push({x,z,w:.52,d:.52});return g;
  }
  function shrub(x,y,z,s=.45) {
    sphere(s,x,y+s*.65,z,green[2]).scale.set(1,.8,.8);
  }
  function crystal(x,y,z,size=1,parent=root) {
    const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);
    const geo=new THREE.OctahedronGeometry(size);
    mesh(geo,material('#c7dbff',{transparent:true,opacity:.4,metalness:.12,roughness:.13,emissive:'#7890ff',emissiveIntensity:.25,depthWrite:false}),0,0,0,g).scale.set(.72,1.2,.72);
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:'#f0ffff',transparent:true,opacity:.9}));
    outline.scale.set(.72,1.2,.72);g.add(outline);
    mesh(new THREE.OctahedronGeometry(size*.48),light,0,0,0,g).rotation.z=.3;
    g.userData.baseY=y;return g;
  }
  function dog(x,y,z,scale=1){const g=createDog();root.add(g);g.position.set(x,y,z);g.scale.setScalar(scale);g.userData.baseY=y;g.userData.phase=x*2.3;return g;}
  function blossom(x,y,z,h=2.4){const g=createBlossomTree(h,x+z);root.add(g);g.position.set(x,y,z);foliage.push({object:g,phase:x+z,amount:.006});obstacles.push({x,z,w:.42,d:.42});return g;}
  function line(points,parent,color='#ffffff') {
    const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity:.95}));parent.add(l);return l;
  }
  function building(id,title,sub,x,z,y,w,h,d) {
    const g=new THREE.Group();root.add(g);g.position.set(x,y,z);
    const doorWidth=w*.53,doorHeight=Math.min(h*.74,3.3);
    box(w,.22,d,0,h+.11,0,trim,g);
    box(w+.2,.15,d+.2,0,h+.29,0,ivory,g);
    box(w*.82,.25,d*.82,0,h+.48,0,trim,g);
    box(w*.66,.19,d*.66,0,h+.7,0,ivory,g);
    box(.23,h,d,-w/2+.115,h/2,0,ivory,g);box(.23,h,d,w/2-.115,h/2,0,ivory,g);
    box(w,h,.2,0,h/2,-d/2+.1,ivory,g);
    const front=archWall(w,h,.22,doorWidth,doorHeight,ivory,g);front.position.z=d/2-.22;
    // Pilasters, cornices and inset windows give the towers a readable scale.
    for(const side of [-1,1]){
      box(.105,h-.14,.06,side*(w/2-.08),h/2,d/2+.018,trim,g);
      box(.24,.13,.3,side*(w/2-.15),.065,d/2-.06,blueStone,g);
      const windowShape=new THREE.Shape(archPath(.4,.9).getPoints(24));
      const window=mesh(new THREE.ShapeGeometry(windowShape),material('#839bb6',{emissive:'#d3bc90',emissiveIntensity:.15}),side*(w/2+.009),h*.5,-.3,g);
      window.rotation.y=side*Math.PI/2;window.castShadow=false;
      const surround=archPath(.48,.98).getPoints(24).map(p=>new THREE.Vector3(side*(w/2+.018),h*.5+p.y,p.x-.3));
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(surround),36,.025,6,false),trim,0,0,0,g);
      box(.12,.065,.58,side*(w/2+.032),h*.5-.015,-.3,trim,g);
      lamp(side*(doorWidth/2+.2),.4,d/2+.095,g);
    }
    box(w+.035,.06,d+.035,0,h-.16,0,blueStone,g);
    box(w+.045,.045,d+.045,0,h-.32,0,trim,g);
    if(id==='projects')for(const xx of [-.76,0,.76]){
      const windowShape=new THREE.Shape(archPath(.34,.6).getPoints(24));
      mesh(new THREE.ShapeGeometry(windowShape),blueStone,xx,h-.95,d/2+.012,g);
      const frame=archPath(.41,.67).getPoints(24).map(p=>new THREE.Vector3(xx+p.x,h-.99+p.y,d/2+.033));
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(frame),32,.021,6,false),trim,0,0,0,g);
      box(.015,.46,.018,xx,h-.69,d/2+.041,brass,g);box(.27,.014,.018,xx,h-.64,d/2+.041,brass,g);
      box(.44,.05,.16,xx,h-.99,d/2+.065,trim,g);
    }
    const roofDisk=cylinder(w*.16,.11,0,h+.86,0,brass,g);roofDisk.castShadow=false;
    // Open rooftop loggias and rounded turrets break the solid tower silhouette.
    const pavilionY=h+.79;
    if(id==='projects'){
      for(const side of [-1,1]){
        const loggia=archWall(.72,.9,.14,.45,.71,ivory,g);loggia.position.set(side*.66,pavilionY,-.49);
        box(.86,.07,.49,side*.66,pavilionY+.94,-.3,trim,g);
        for(let i=0;i<5;i++)box(.03,.42,.06,side*.66+(.5-i*.25),pavilionY+.22,-.48,brass,g);
      }
      for(const side of [-1,1]){
        const tower=new THREE.Group();g.add(tower);tower.position.set(side*(w/2-.1),h*.57,-d/2+.22);
        cylinder(.29,h*.44,0,h*.22,0,pinkStone,tower);cylinder(.33,.09,0,h*.45,0,trim,tower);
        const dome=mesh(new THREE.SphereGeometry(.33,24,16,0,Math.PI*2,0,Math.PI/2),blueStone,0,h*.47,0,tower);dome.scale.y=1.3;
        cylinder(.019,.24,0,h*.47+.5,0,brass,tower);sphere(.045,0,h*.47+.64,0,brass,tower);
      }
    }else{
      const canopy=archWall(w*.71,1.05,.19,w*.49,.87,ivory,g);canopy.position.set(0,pavilionY,-.2);
      box(w*.79,.085,.75,0,pavilionY+1.06,.03,trim,g);
      for(const side of [-1,1])cylinder(.027,.54,side*w*.28,pavilionY+.27,.2,brass,g);
    }
    // Stone joint lines, carved cornices, recessed upper panels and balconies.
    for(let row=0;row<4;row++){
      const yy=h*.2+row*h*.18;
      for(const side of [-1,1])box(.008,.009,d*.85,side*(w/2+.007),yy,0,blueStone,g);
      for(const side of [-1,1])box(w*.15,.009,.008,side*w*.39,yy,d/2+.015,blueStone,g);
    }
    for(const side of [-1,1]){
      box(.12,.06,.81,side*(w/2+.06),h*.49,-.32,trim,g);
      for(let j=0;j<6;j++)cylinder(.014,.24,side*(w/2+.1),h*.49+.13,-.66+j*.14,brass,g);
      box(.055,.035,.85,side*(w/2+.1),h*.49+.25,-.31,brass,g);
    }
    const recess=archWall(w*.73,h*.85,.04,w*.39,h*.58,blueStone,g);recess.rotation.y=Math.PI/2;recess.position.set(-w/2-.012,0,-.1);
    const portalMat=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,
      uniforms:{time:{value:0},warmth:{value:0},tint:{value:new THREE.Color(id==='about'?'#74d5ff':'#8172ff')}},
      vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float time;uniform float warmth;uniform vec3 tint;varying vec3 v;void main(){float g=.78+.12*sin(v.y*3.-time);float stripe=pow(max(0.,sin(v.y*8.+time)),16.)*.1;vec3 hue=mix(tint,vec3(1.,.63,.18),warmth);gl_FragColor=vec4(hue*g+stripe,.82);}' });
    const shape=new THREE.Shape(archPath(doorWidth*.94,doorHeight*.97).getPoints(40));
    const doorGeometry=new THREE.ShapeGeometry(shape),uv=doorGeometry.attributes.uv,pos=doorGeometry.attributes.position;
    for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+doorWidth*.47)/(doorWidth*.94),pos.getY(i)/(doorHeight*.97));
    const door=mesh(doorGeometry,portalMat,0,.025,d/2-.3,g);door.castShadow=false;
    const glowMaterial=new THREE.ShaderMaterial({
      transparent:true,
      side:THREE.DoubleSide,
      depthWrite:false,
      depthTest:true,
      blending:THREE.AdditiveBlending,
      uniforms:{time:{value:0},intensity:{value:0}},
      vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec2 v;uniform float time;uniform float intensity;void main(){float edge=smoothstep(0.,.2,min(min(v.x,1.-v.x),min(v.y,1.-v.y)));float pulse=.82+.18*sin(time*2.5+v.y*4.);vec3 gold=vec3(1.,.55,.12);gl_FragColor=vec4(gold*(.72+.28*v.y),intensity*edge*pulse*.88);}'
    });
    const doorGlow=mesh(doorGeometry,glowMaterial,0,.035,d/2-.295,g);
    doorGlow.castShadow=false;doorGlow.renderOrder=3;
    const doorLight=new THREE.PointLight('#ffd36a',0,4.6,2);
    doorLight.position.set(0,doorHeight*.62,d/2-.12);g.add(doorLight);
    const floorMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
      uniforms:glowMaterial.uniforms,
      vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec2 v;uniform float intensity;void main(){float edge=pow(max(0.,1.-abs(v.x-.5)*2.),1.7);float falloff=pow(v.y,1.8);gl_FragColor=vec4(1.,.66,.24,intensity*edge*falloff*.6);}'
    });
    const floorGlow=mesh(new THREE.PlaneGeometry(doorWidth*1.7,2.25),floorMat,0,.026,d/2+.94,g);floorGlow.rotation.x=-Math.PI/2;floorGlow.castShadow=false;
    const rim=archPath(doorWidth+.1,doorHeight+.05).getPoints(45).map(p=>new THREE.Vector3(p.x,p.y,d/2+.025));
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim),64,.045,8,false),trim,0,0,0,g);
    const icon=new THREE.Group();g.add(icon);icon.position.set(0,doorHeight*.55,d/2+.03);
    if(id==='projects'){
      const cube=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.49,.49,.49)),new THREE.LineBasicMaterial({color:'#ffffff'}));cube.rotation.set(.25,.45,.05);icon.add(cube);
    }else if(id==='about'){
      const pts=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI*2;pts.push([Math.cos(a)*.12,.18+Math.sin(a)*.12,0])}line(pts,icon);
      line([[-.27,-.28,0],[-.25,-.08,0],[0,.02,0],[.25,-.08,0],[.27,-.28,0],[-.27,-.28,0]],icon);
    }else{
      line([[-.22,.3,0],[.22,.3,0],[.22,-.3,0],[-.22,-.3,0],[-.22,.3,0]],icon);
      for(let i=0;i<3;i++)line([[-.12,.12-i*.12,0],[.12,.12-i*.12,0]],icon);
    }
    const ring=mesh(new THREE.RingGeometry(.48,.55,48),material('#bcb0ff',{emissive:'#a798ff',emissiveIntensity:.7,transparent:true,opacity:.35,depthWrite:false}),0,.03,d/2+.65,g);ring.rotation.x=-Math.PI/2;
    const b={id,title,sub,x,z,y,w,h,d,g,door,doorGlow,doorLight,floorGlow,ring,entrance:new THREE.Vector3(x,y+.05,z+d/2+.82)};
    g.userData.building=b;portals.push(b);obstacles.push({x,z,w:w+.1,d:d+.1});return b;
  }

  // A terraced water garden replaces the monolithic square island.
  plinth(0,-1.95,4.2,5.3,1.8);
  plinth(-4.8,2.4,3.1,4.7,0);
  plinth(5,-1.55,3.1,4.5,1.8);
  rect(0,3.98,2.4,1.7,0);box(2.15,3,1.5,0,-1.69,3.98,blueStone);
  bridge(-4.8,3.65,0,3.65,0,1.45);
  stairs(0,.64,3.36,1.8,0,1.85);
  bridge(1.7,-.1,4.15,-.1,1.8,1.38);
  bridge(-4.8,4,-4.8,7.5,0,1.45);
  plinth(-4.8,7.6,1.8,1.3,0);
  bridge(.8,4,3.5,4,0,1.35);
  const projects=building('projects','PROJECTS','项目作品 · 07',0,-2.3,1.8,3.05,5.1,2.55);
  const about=building('about','ABOUT ME','关于我',-4.8,.66,0,2.15,3.2,1.85);
  const resume=building('resume','RESUME','经历与能力',5,-2.1,1.8,2.05,3.2,2);
  const heroCrystal=crystal(0,8.95,-2.3,.82);
  const minorCrystal=crystal(-4.8,4.15,.66,.32);
  // A distant suspended aqueduct and terraced rotunda establish a larger world.
  const backdrop=new THREE.Group();root.add(backdrop);backdrop.position.set(3.8,-1.45,-7.5);backdrop.rotation.y=-.2;
  for(let i=0;i<4;i++){
    const arcade=archWall(1.35,3.6,.38,.96,3.1,blueStone,backdrop);arcade.position.x=-2.0+i*1.35;
    box(1.36,.09,.53,arcade.position.x,3.68,.15,ivory,backdrop);
  }
  box(5.5,.18,.8,.02,3.81,.14,trim,backdrop);
  rail(-2.7,.38,2.73,.38,3.89,backdrop);
  const rotunda=new THREE.Group();root.add(rotunda);rotunda.position.set(-3.8,-.4,-6.75);
  for(let i=0;i<3;i++)cylinder(1.35-i*.11,.12,0,i*.12,0,i%2?blueStone:trim,rotunda);
  for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7;
    cylinder(.085,1.62,Math.cos(a)*.93,1.16,Math.sin(a)*.93,ivory,rotunda);
    cylinder(.14,.08,Math.cos(a)*.93,2.01,Math.sin(a)*.93,trim,rotunda);
  }
  cylinder(1.13,.16,0,2.11,0,blueStone,rotunda);
  const rotundaRoof=mesh(new THREE.SphereGeometry(1.13,32,16,0,Math.PI*2,0,Math.PI/2),pinkStone,0,2.19,0,rotunda);rotundaRoof.scale.y=.4;
  sphere(.1,0,2.73,0,brass,rotunda);
  for(let i=0;i<6;i++)box(.8,.12,.37,-2.73+i*.34,.55+i*.24,-5.8,ivory);
  blossom(6.8,-.5,-5.95,2.8);
  const garden=new THREE.Group();root.add(garden);garden.position.set(4,0,4.35);
  ground.push(cylinder(2.1,.25,0,-.13,0,trim,garden));cylinder(1.98,.7,0,-.61,0,ivory,garden);
  cylinder(1.8,1.95,0,-1.9,0,blueStone,garden);
  surfaces.push({x:4,z:4.35,r:2.1,y:0});
  // Circular contemplative pavilion and a small companion dog.
  const pavilion=archWall(2.05,2.45,.38,1.45,2.12,ivory,garden);pavilion.position.set(.5,.02,0);
  box(2.18,.09,.52,.5,2.48,.19,trim,garden);
  for(const side of [-1,1]){
    box(.35,.1,.54,.5+side*.87,.05,.19,pinkStone,garden);
    for(let i=0;i<5;i++){const vine=sphere(.085,.5+side*(.91+Math.sin(i)*.03),.58+i*.2,.4,green[i%3],garden);vine.scale.set(.8,1.2,.45);}
    obstacles.push({x:4.5+side*.87,z:4.54,w:.34,d:.48});
  }
  const companion=dog(3.1,0,4.7,.82);
  companion.name='companion-dog';
  companion.rotation.y=-.42;
  obstacles.push({x:3.1,z:4.7,w:.5,d:.5});
  blossom(-1.6,1.8,-3.5,2.3);tree(1.6,1.8,-3.6,2.6);blossom(5.9,1.8,-3.15,2.0);
  blossom(-5.85,0,2.8,2.2);blossom(5.45,0,3.7,2.1);
  shrub(4.85,5.84,-2.1,.28);shrub(5.8,1.8,-.8,.36);
  // Satellite garden fragments keep the silhouette open.
  plinth(6.9,6.35,1.8,1.7,-.8,false);blossom(6.7,-.8,6.2,2.25);tree(7.3,-.8,6.5,1.1);
  plinth(-6.5,-3.2,1.65,1.7,-.7,false);blossom(-6.5,-.7,-3.2,2.2);
  for(const [x,y,z,s]of [[-5.85,0,1.75,.48],[-5.85,0,4.37,.46],[1.63,1.8,-4.08,.55],[5.87,1.8,-1.64,.45],[5.3,0,5.12,.5]])planter(x,y,z,s);
  // Small places to pause, kept outside the center of the walkways.
  const bench=new THREE.Group();garden.add(bench);bench.position.set(.57,0,.75);bench.rotation.y=-.1;
  for(let i=0;i<3;i++)box(.9,.035,.09,0,.29,-.11+i*.11,boatWood,bench);
  for(const side of [-1,1]){box(.06,.28,.3,side*.34,.14,0,brass,bench);box(.06,.3,.05,side*.34,.42,-.17,brass,bench);}
  box(.9,.08,.04,0,.51,-.17,boatWood,bench);box(.9,.07,.04,0,.4,-.17,boatWood,bench);
  obstacles.push({x:4.57,z:5.1,w:.97,d:.38});
  rail(-6.27,3.95,-6.27,4.67,0);rail(6.48,-.45,6.48,.4,1.8);
  lamp(-5.46,0,7.64);lamp(1.61,1.8,.2);lamp(4.26,0,5.89);
  // Omit rails wherever a bridge meets another deck or a staircase.
  // This prevents decorative posts from crossing the character's route.
  for(const b of bridgeRailings)for(const side of [-1,1]){
    const localX=side*(b.width/2+.01),angle=b.group.rotation.y;
    const covered=z=>{
      const x=b.group.position.x+Math.cos(angle)*localX+Math.sin(angle)*z;
      const worldZ=b.group.position.z-Math.sin(angle)*localX+Math.cos(angle)*z;
      return surfaces.some(s=>{
        if(s===b.surface)return false;
        const inside=s.r?Math.hypot(x-s.x,worldZ-s.z)<s.r+.16:Math.abs(x-s.x)<s.w/2+.16&&Math.abs(worldZ-s.z)<s.d/2+.16;
        return inside&&Math.abs((typeof s.y==='function'?s.y(worldZ):s.y)-b.group.position.y)<.6;
      });
    };
    const n=Math.ceil(b.len/.1);let start=null;
    for(let i=0;i<=n;i++){
      const z=-b.len/2+b.len*i/n,blocked=covered(z);
      if(!blocked&&start===null)start=z;
      if((blocked||i===n)&&start!==null){const end=z-(blocked?b.len/n:0);if(end-start>.12)rail(localX,start,localX,end,0,b.group);start=null;}
    }
  }
  for(const [x,z,s]of [[-3.1,5.6,.55],[1.65,5.8,.6],[6.55,1.4,.4],[3.25,1.9,.5]])box(s,.3,s,x,-1.38,z,trim);
  for(const [x,y,z] of [[-5.8,0,4.1],[1.5,1.8,-.1],[4.15,1.8,-.1],[5.4,0,5.4]]){
    box(.25,.12,.25,x,y+.06,z,ivory);crystal(x,y+.24,z,.12);
  }
  const reflection=new THREE.WebGLRenderTarget(640,640,{type:THREE.HalfFloatType});
  const reflectionMatrix=new THREE.Matrix4();
  const waterUniforms={time:{value:0},eye:{value:new THREE.Vector3()},reflection:{value:reflection.texture},reflectionMatrix:{value:reflectionMatrix}};
  const waterMaterial=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:waterUniforms,
    vertexShader:`uniform float time;uniform mat4 reflectionMatrix;varying vec3 world;varying vec4 mirrorCoord;
      void main(){vec3 p=position;float w=sin(p.x*.81+time*.65)*.024+sin(p.y*1.22-time*.46)*.018;p.z+=w;
      vec4 wp=modelMatrix*vec4(p,1.);world=wp.xyz;mirrorCoord=reflectionMatrix*wp;gl_Position=projectionMatrix*viewMatrix*wp;}`,
    fragmentShader:`uniform float time;uniform vec3 eye;uniform sampler2D reflection;varying vec3 world;varying vec4 mirrorCoord;
      void main(){vec2 p=world.xz;float dx=cos(p.x*1.5+p.y*.4+time*.65)*.055+cos(p.x*6.1-p.y*4.2-time*.9)*.014;
      float dz=cos(p.y*1.8-p.x*.3-time*.45)*.045+cos(p.y*9.+p.x*3.7+time*.6)*.009;
      vec3 n=normalize(vec3(-dx,1.,-dz));vec3 view=normalize(eye-world);float fresnel=.16+.55*pow(1.-max(dot(view,n),0.),3.);
      vec2 uv=mirrorCoord.xy/mirrorCoord.w+vec2(dx,dz)*.11;vec3 reflected=texture2D(reflection,uv).rgb;
      vec3 water=mix(vec3(.025,.18,.25),vec3(.065,.35,.42),.5+.2*sin(p.x*.3+p.y*.21));
      float ripple=sin(p.x*4.+sin(p.y*3.+time*.4))+sin(p.y*4.5+time*.6);water+=pow(max(0.,ripple*.5),15.)*.025;
      vec3 sun=normalize(vec3(-.35,.8,.45));float spec=pow(max(dot(n,normalize(sun+view)),0.),180.);
      vec3 color=mix(water,reflected,fresnel)+vec3(1.,.92,.72)*spec*.75;
      gl_FragColor=vec4(color,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`});
  const water=mesh(new THREE.PlaneGeometry(180,180,128,128),waterMaterial,.3,-1.65,1.2);water.rotation.x=-Math.PI/2;water.castShadow=false;
  let reflectionFrame=0;
  function updateWaterReflection(renderer,camera){
    waterUniforms.eye.value.copy(camera.position);
    if(reflectionFrame++%4!==0)return;
    const mirror=camera.clone(),direction=new THREE.Vector3();camera.getWorldDirection(direction);
    mirror.position.copy(camera.position);mirror.position.y=-3.3-camera.position.y;
    direction.y=-direction.y;mirror.up.set(0,-1,0);mirror.lookAt(mirror.position.clone().add(direction));mirror.updateMatrixWorld();
    reflectionMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);reflectionMatrix.multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
    const target=renderer.getRenderTarget(),clip=renderer.clippingPlanes,shadowUpdate=renderer.shadowMap.autoUpdate;
    water.visible=false;renderer.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,1,0),1.65)];renderer.shadowMap.autoUpdate=false;
    renderer.setRenderTarget(reflection);renderer.render(scene,mirror);renderer.setRenderTarget(target);
    renderer.clippingPlanes=clip;renderer.shadowMap.autoUpdate=shadowUpdate;water.visible=true;
  }
  function boat(x,z,scale,phase){
    const g=createSailboat();root.add(g);g.position.set(x,-1.73,z);g.scale.setScalar(scale);
    g.name='sailboat';
    for(let i=0;i<3;i++){
      const wake=mesh(new THREE.RingGeometry(.31+i*.21,.326+i*.21,32,1,-.9,1.8),new THREE.MeshBasicMaterial({color:'#d6eff1',transparent:true,opacity:.18-i*.035,side:THREE.DoubleSide,depthWrite:false}),-.94-i*.12,.09,0,g);wake.rotation.x=-Math.PI/2;wake.rotation.z=Math.PI;
    }
    boats.push({group:g,flag:g.userData.flag,baseX:x,baseZ:z,baseY:-1.73,phase,rangeX:1.2,rangeZ:.47});
  }
  boat(-2.8,7.1,.94,.4);boat(5.8,8.2,.86,2.8);
  // Water lilies and translucent glints are static geometry with gentle shared motion.
  const lilyMat=material('#609d87',{side:THREE.DoubleSide});
  for(const [x,z,s]of [[-7.2,4.5,.3],[-7.6,5,.22],[-3.1,8.8,.25],[2.7,7.7,.2],[7.6,3.4,.27],[7.9,3.9,.18]]){
    const leaf=mesh(new THREE.CircleGeometry(s,24,.12,Math.PI*1.85),lilyMat,x,-1.61,z);leaf.rotation.x=-Math.PI/2;leaf.castShadow=false;
    if(s>.23)for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const bloom=sphere(.067,x+Math.cos(a)*.045,-1.57,z+Math.sin(a)*.045,flowerColors[0]);bloom.scale.set(.65,.5,1.25);bloom.rotation.y=-a;}
  }
  for(let i=0;i<16;i++){
    const x=-8+(i%6)*3.2,z=3+Math.floor(i/6)*2.8;
    const sparkle=mesh(new THREE.PlaneGeometry(.07,.07),new THREE.MeshBasicMaterial({color:'#e5fcff',transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide}),x,-1.59,z);sparkle.rotation.x=-Math.PI/2;sparkle.rotation.z=.8;sparkle.castShadow=false;glints.push(sparkle);
  }
  function waterfall(x,z,y,width,height,rotation=0) {
    const uniforms={time:{value:0}};
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms,
      vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec2 v;uniform float time;void main(){float threads=pow(.5+.5*sin(v.x*90.+sin(v.y*8.+time*1.6)),9.);float flow=pow(.5+.5*sin(v.y*27.+time*3.+v.x*10.),7.);float edge=pow(abs(v.x-.5)*2.,9.);gl_FragColor=vec4(vec3(.56,.88,1.)+(threads+flow+edge)*.22,.24+threads*.35+edge*.3);}' });
    const fall=mesh(new THREE.PlaneGeometry(width,height),m,x,y-height/2,z);fall.rotation.y=rotation;fall.castShadow=false;falls.push(m);
    const lip=box(width,.035,.3,x,y+.01,z,material('#b0eaff',{transparent:true,opacity:.72}));lip.rotation.y=rotation;
    for(let i=0;i<3;i++){
      const r=mesh(new THREE.RingGeometry(.25,.275,48),new THREE.MeshBasicMaterial({color:'#e5faff',transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}),x,y-height+.025+i*.003,z);
      r.rotation.x=-Math.PI/2;r.userData.phase=i/3;ripples.push(r);
    }
  }
  waterfall(-1.96,-2.9,1.75,.65,3.38,Math.PI/2);
  waterfall(5.35,.73,1.77,.65,3.4);
  waterfall(-4.8,5.38,-.03,.65,4.8);
  waterfall(6.5,6.4,-.84,.35,2.7,Math.PI/2);
  const clouds=[];
  const cloudMat=material('#ffffff',{roughness:1});
  for(const [x,y,z,s]of [[-9,-3,6,1.5],[8,-3,9,1.8],[-6,-3.5,10,1.7],[9,-3,-2,1.2],[-8,-3,-5,1.3],[1,-3.8,11,1.3]]){
    const c=new THREE.Group();scene.add(c);c.position.set(x,y,z);c.userData.baseY=y;
    for(let j=0;j<7;j++){const p=sphere(s*(.56+(j%3)*.13),(j-3)*s*.65,Math.sin(j*2)*s*.17,Math.cos(j)*s*.25,cloudMat,c);p.scale.y=.65;p.castShadow=false;p.receiveShadow=false;}
    clouds.push(c);
  }
  // Small petals and lights are instanced to keep the scene inexpensive.
  const petals=new THREE.InstancedMesh(new THREE.PlaneGeometry(.08,.045),new THREE.MeshBasicMaterial({color:'#fbc5e1',side:THREE.DoubleSide}),24);root.add(petals);
  const dummy=new THREE.Object3D();
  function heightAt(x,z) {
    for(let i=surfaces.length-1;i>=0;i--){const s=surfaces[i];if(s.r?Math.hypot(x-s.x,z-s.z)<s.r-.17:Math.abs(x-s.x)<=s.w/2-.12&&Math.abs(z-s.z)<=s.d/2-.02)return typeof s.y==='function'?s.y(z):s.y;}
    return null;
  }
  function free(x,z){return heightAt(x,z)!==null&&!obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.16&&Math.abs(z-o.z)<o.d/2+.16);}
  function animate(t) {
    waterUniforms.time.value=t;falls.forEach(m=>m.uniforms.time.value=t);
    portals.forEach(b=>{b.door.material.uniforms.time.value=t;b.doorGlow.material.uniforms.time.value=t;});
    heroCrystal.rotation.y=t*.2;heroCrystal.position.y=8.95+Math.sin(t*.9)*.1;
    minorCrystal.rotation.y=-t*.3;
    ripples.forEach(r=>{const p=(t*.24+r.userData.phase)%1;r.scale.setScalar(1+p*4);r.material.opacity=(1-p)*.28;});
    clouds.forEach((c,i)=>c.position.y=c.userData.baseY+Math.sin(t*.18+i)*.09);
    companion.position.y=Math.sin(t*1.1)*.005;
    companion.userData.tail.rotation.y=Math.sin(t*7.4+companion.userData.phase)*.65;
    companion.userData.ears[0].rotation.z=-.14+Math.sin(t*2.8)*.025;
    companion.userData.ears[1].rotation.z=.14-Math.sin(t*2.8)*.025;
    const blink=t%6.1;companion.userData.eyes.forEach(e=>e.scale.y=blink>5.92?.17:.85);
    foliage.forEach(f=>f.object.rotation.z=Math.sin(t*.8+f.phase)*f.amount);
    glints.forEach((g,i)=>g.material.opacity=Math.pow(Math.max(0,Math.sin(t*.75+i*1.7)),6)*.38);
    boats.forEach((b,i)=>{
      const phase=t*.12+b.phase;
      b.group.position.x=b.baseX+Math.sin(phase)*b.rangeX;
      b.group.position.z=b.baseZ+Math.cos(phase*.83)*b.rangeZ;
      b.group.position.y=b.baseY+Math.sin(t*.9+b.phase)*.018;
      b.group.rotation.y=Math.atan2(-Math.sin(phase*.83)*b.rangeZ*.83,Math.cos(phase)*b.rangeX)*-1;
      b.group.rotation.x=Math.sin(t*.8+b.phase)*.025;b.group.rotation.z=Math.sin(t*.7+b.phase)*.025;
      b.flag.rotation.y=Math.sin(t*1.6+i)*.1;
    });
    for(let i=0;i<24;i++){const p=(t*.11+i/24)%1,a=i*2.399+t*.1;dummy.position.set(3.1+Math.cos(a)*(.4+p),2.3-p*2.1,4.7+Math.sin(a)*(.4+p));dummy.rotation.set(t*.6+i,t*.3+i,0);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}petals.instanceMatrix.needsUpdate=true;
  }
  return {root,portals,ground,surfaces,obstacles,projects,free,heightAt,animate,updateWaterReflection,spawn:new THREE.Vector3(-4.8,.05,3.6)};
}
