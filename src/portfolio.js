import resumeUrl from './assets/tan-zongyue-resume.pdf?url';
import { projects } from './projects.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
export function createPortfolio(modal){
  const viewer=document.createElement('dialog');viewer.id='image-viewer';viewer.setAttribute('aria-label','项目图片查看器');
  viewer.innerHTML='<div class="viewer-bar"><span id="image-count"></span><div><button id="image-zoom" type="button">放大细节</button><a id="image-original" target="_blank" rel="noopener">打开原图 ↗</a><button id="image-close" type="button" aria-label="关闭图片">×</button></div></div><div class="viewer-stage"><img id="viewer-image" alt=""></div><div class="viewer-bottom"><button id="image-prev" type="button" aria-label="上一张">← 上一张</button><span id="image-title"></span><button id="image-next" type="button" aria-label="下一张">下一张 →</button></div>';
  document.body.appendChild(viewer);let activeProject=0,activeImage=0;
  function renderImage(){const p=projects[activeProject],im=p.images[activeImage];$('#viewer-image').src=im.fullSrc;$('#viewer-image').alt=im.title;$('#image-original').href=im.fullSrc;$('#image-title').textContent=im.title;$('#image-count').textContent=`${activeImage+1} / ${p.images.length}`;$('#image-prev').disabled=activeImage===0;$('#image-next').disabled=activeImage===p.images.length-1;viewer.classList.remove('zoomed');$('#image-zoom').textContent='放大细节';$('.viewer-stage').scrollTo(0,0);}
  function openImage(i,j){activeProject=i;activeImage=j;renderImage();viewer.showModal();}
  const step=d=>{activeImage=Math.max(0,Math.min(projects[activeProject].images.length-1,activeImage+d));renderImage();};
  $('#image-close').onclick=()=>viewer.close();$('#image-prev').onclick=()=>step(-1);$('#image-next').onclick=()=>step(1);
  $('#image-zoom').onclick=()=>{$('#image-zoom').textContent=viewer.classList.toggle('zoomed')?'适应屏幕':'放大细节';};
  viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();step(e.key==='ArrowLeft'?-1:1);}});
  function present(html,wide=false){$('#panel').classList.toggle('project-detail',wide);modal(html);$('#panel').scrollTop=0;}
  function show(id){
    if(id.startsWith('project-'))return detail(+id.split('-')[1]);
    if(id==='quick'){
      present(`<div class="eyebrow">SELECTED WORK / 07</div><h2>Ideas, made tangible.</h2><p>从 AI 阅读到 Web3，探索产品与体验设计。</p><div class="project-list">${projects.map((p,i)=>`<button class="project-card title-only" data-project="${i}"><div class="card-copy"><small>0${i+1} / ${esc(p.role)}</small><strong>${esc(p.title)}</strong><span>${p.images.length} 张项目图 <b>↗</b></span></div></button>`).join('')}</div>`);
      document.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>detail(+b.dataset.project));
    }else if(id==='about'){
      present('<div class="eyebrow">01 / ABOUT ME</div><h2>谭宗粤<span class="name-en">TAN ZONGYUE</span></h2><p class="profile-lead">资深产品体验设计师 · 深圳</p><p>近 10 年产品体验与 UI/UX 设计经验，覆盖 AI 阅读、语音机器人、Web3 平台和数据可视化。</p><p>参与 ReadPaper 从 0 到 1 建设，支撑平台累计用户规模从 10 万增长至 150 万+。熟悉后台配置、运营管理、知识体系、交易发行与数据监控等复杂场景。</p><div class="tags"><span>AI 产品体验</span><span>B 端复杂系统</span><span>全链路产品设计</span><span>设计规范与组件库</span></div><h3>从问题到落地</h3><p>需求澄清、信息架构、交互流程、高保真原型、视觉规范、开发验收与迭代优化。</p><h3>设计工具</h3><p>Figma / Sketch / Photoshop / Blender / Principle / AI 绘画工具 / ChatGPT / Cursor</p>');
    }else if(id==='resume'){
      const jobs=[['2025.11 — 至今','深圳港通世纪科技有限公司','产品经理 / UX/UI 设计','负责 Web3 生态平台从 0 到 1 的产品设计与体验落地，覆盖数字资产交易平台 PC / APP、资产发行后台、运营管理平台及区块链浏览器。'],['2021.03 — 2024.07','粤港澳大湾区数字经济研究院','UI & UX 设计师','负责 ReadPaper 平台 UI/UX 设计，支持 BIOS 医疗知识图谱与低空视界大屏等项目，搭建设计组件库与 UI 规范。'],['2018.04 — 2021.03','中国平安财产保险总部科技中心','UI 设计师 / 视觉设计师','参与语音机器人平台从 0 到 1 建设，负责知识体系管理、配置流程、数据监控可视化与品牌运营视觉。'],['2016.10 — 2018.03','深圳汇美影像文化股份有限公司','UI 设计师 / 视觉设计师','负责约拍 H5、H5 商城、商户端后台与官网 UI / 交互设计。']];
      present(`<div class="eyebrow">03 / EXPERIENCE</div><h2>经历与能力</h2><a class="resume-download" href="${resumeUrl}" download="谭宗粤文本简历.pdf">下载完整简历 PDF ↓</a><div class="timeline">${jobs.map(j=>`<article><time>${j[0]}</time><h3>${j[1]}</h3><div class="job-role">${j[2]}</div><p>${j[3]}</p></article>`).join('')}</div><h3>教育经历</h3><p>南昌大学（211） · 动画专业（本科）<br>2011.09 — 2015.06</p>`);
    }else if(id==='contact'){
      present('<div class="eyebrow">LET’S CONNECT</div><h2>让想法，开始发生。</h2><p>谭宗粤 · 资深产品体验设计师 · 深圳</p><div class="contact-links"><a href="mailto:372188300@qq.com"><small>EMAIL</small>372188300@qq.com ↗</a><a href="tel:18675536435"><small>PHONE</small>186 7553 6435 ↗</a></div>');
    }
  }
  function detail(i){
    const p=projects[i];if(!p)return;
    present(`<button class="back" id="back-projects">← 全部作品</button><div class="eyebrow">PROJECT / 0${i+1}</div><h2>${esc(p.title)}</h2><div class="project-meta"><span>${esc(p.designerRole)}</span><span>${esc(p.date)}</span><span>${p.images.length} 张作品图</span></div><p class="project-summary">${esc(p.summary)}</p><div class="tags"><span>${esc(p.role)}</span></div><div class="screens-heading"><h3>Project gallery</h3><span>点击图片，放大查看</span></div><div class="screens-gallery">${p.images.map((im,j)=>`<figure><button class="screen-image" data-image="${j}" aria-label="放大查看：${esc(im.title)}"><img src="${im.src}" alt="${esc(im.title)}" width="${im.width}" height="${im.height}" loading="${j===0?'eager':'lazy'}" decoding="async"><span class="image-expand">↗ 放大查看</span></button><figcaption><span>${String(j+1).padStart(2,'0')} / ${String(p.images.length).padStart(2,'0')}</span>${esc(im.title)}</figcaption></figure>`).join('')}</div><div class="project-end"><p>${esc(p.focus)}</p><button class="next-project" id="next-project"><small>NEXT PROJECT</small>${esc(projects[(i+1)%projects.length].title)} →</button></div>`,true);
    $('#back-projects').onclick=()=>show('quick');$('#next-project').onclick=()=>detail((i+1)%projects.length);
    document.querySelectorAll('[data-image]').forEach(b=>b.onclick=()=>openImage(i,+b.dataset.image));
  }
  return {show,detail};
}
