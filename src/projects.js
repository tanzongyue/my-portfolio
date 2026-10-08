// Vite emits local media with content hashes for long-lived CDN caching.
const imageUrls = import.meta.glob('./assets/projects/**/*.webp', { eager: true, query: '?url', import: 'default' });
const displayUrls = import.meta.glob('./assets/project-previews/**/*.webp', { eager: true, query: '?url', import: 'default' });
const assetUrl = source => {
  const url = imageUrls[source];
  if (!url) throw new Error('Missing project asset: ' + source);
  return url;
};

export const projects = [
  {
    "slug": "readpaper-immersive",
    "title": "ReadPaper 沉浸式阅读体验",
    "role": "AI 阅读 / 知识交互",
    "accent": "#2E9BFF",
    "images": [
      {
        "src": "./assets/projects/readpaper-immersive/01.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 01",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/01.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/02.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 02",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/02.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/03.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 03",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/03.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/04.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 04",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/04.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/05.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 05",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/05.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/06.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 06",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/06.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/07.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 07",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/07.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/08.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 08",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/08.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/09.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 09",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/09.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/10.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 10",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/10.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/11.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 11",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/11.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/12.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 12",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/12.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/13.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 13",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/13.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/14.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 14",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/14.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/15.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 15",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/15.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/16.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 16",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/16.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/17.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 17",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/17.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/18.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 18",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-immersive/18.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/19.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 19",
        "width": 1508,
        "height": 772,
        "fullSrc": "./assets/projects/readpaper-immersive/19.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/20.webp",
        "title": "ReadPaper 沉浸式阅读体验 · 20",
        "width": 2558,
        "height": 1353,
        "fullSrc": "./assets/projects/readpaper-immersive/20.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/21.webp",
        "title": "笔记标签外置",
        "width": 7005,
        "height": 1341,
        "fullSrc": "./assets/projects/readpaper-immersive/21-full.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/22.webp",
        "title": "图形编辑",
        "width": 2324,
        "height": 1599,
        "fullSrc": "./assets/projects/readpaper-immersive/22.webp"
      },
      {
        "src": "./assets/projects/readpaper-immersive/23.webp",
        "title": "文本编辑框交互流程",
        "width": 2612,
        "height": 1221,
        "fullSrc": "./assets/projects/readpaper-immersive/23-full.webp"
      }
    ],
    "cover": "./assets/projects/readpaper-immersive/cover.webp",
    "designerRole": "UI / UX 设计",
    "date": "2021.03 — 2024.07",
    "summary": "参与 ReadPaper 从 0 到 1 的设计建设，覆盖论文 AI 阅读器、文献检索与管理、AI 润色、学术社区和 EUREKA 学术大模型。",
    "focus": "从产品架构、交互流程到组件化 UI 规范，持续优化论文阅读与知识管理体验。"
  },
  {
    "slug": "readpaper-mobile-ipad",
    "title": "ReadPaper 移动端与 iPad",
    "role": "移动产品 / 多端体验",
    "accent": "#00A88B",
    "images": [
      {
        "src": "./assets/projects/readpaper-mobile-ipad/01.webp",
        "title": "ReadPaper 移动端与 iPad · 01",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-mobile-ipad/01.webp"
      },
      {
        "src": "./assets/projects/readpaper-mobile-ipad/02.webp",
        "title": "ReadPaper 移动端与 iPad · 02",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-mobile-ipad/02.webp"
      },
      {
        "src": "./assets/projects/readpaper-mobile-ipad/03.webp",
        "title": "ReadPaper 移动端与 iPad · 03",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-mobile-ipad/03.webp"
      },
      {
        "src": "./assets/projects/readpaper-mobile-ipad/04.webp",
        "title": "ReadPaper 移动端与 iPad · 04",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-mobile-ipad/04.webp"
      },
      {
        "src": "./assets/projects/readpaper-mobile-ipad/05.webp",
        "title": "ReadPaper 移动端与 iPad · 05",
        "width": 4293,
        "height": 1206,
        "fullSrc": "./assets/projects/readpaper-mobile-ipad/05-full.webp"
      },
      {
        "src": "./assets/projects/readpaper-mobile-ipad/06.webp",
        "title": "ReadPaper 移动端与 iPad · 06",
        "width": 823,
        "height": 913,
        "fullSrc": "./assets/projects/readpaper-mobile-ipad/06.webp"
      },
      {
        "src": "./assets/projects/readpaper-mobile-ipad/07.webp",
        "title": "拉新流程方案",
        "width": 5542,
        "height": 4140,
        "fullSrc": "./assets/projects/readpaper-mobile-ipad/07-full.webp"
      },
      {
        "src": "./assets/projects/readpaper-mobile-ipad/08.webp",
        "title": "小程序主流程和关键页面",
        "width": 2237,
        "height": 6060,
        "fullSrc": "./assets/projects/readpaper-mobile-ipad/08.webp"
      }
    ],
    "cover": "./assets/projects/readpaper-mobile-ipad/cover.webp",
    "designerRole": "多端 UI / UX 设计",
    "date": "2021.03 — 2024.07",
    "summary": "将 ReadPaper 的论文阅读与知识管理体验延伸至移动端、iPad 和小程序，兼顾各平台的使用场景与体验一致性。",
    "focus": "围绕阅读、笔记与关键任务流程完成多端适配。"
  },
  {
    "slug": "readpaper-brand",
    "title": "ReadPaper 运营与品牌",
    "role": "品牌视觉 / 增长物料",
    "accent": "#FF7A59",
    "images": [
      {
        "src": "./assets/projects/readpaper-brand/01.webp",
        "title": "ReadPaper 运营与品牌 · 01",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-brand/01.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/02.webp",
        "title": "ReadPaper 运营与品牌 · 02",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-brand/02.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/03.webp",
        "title": "ReadPaper 运营与品牌 · 03",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/readpaper-brand/03.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/04.webp",
        "title": "ReadPaper 运营与品牌 · 04",
        "width": 1080,
        "height": 4505,
        "fullSrc": "./assets/projects/readpaper-brand/04.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/05.webp",
        "title": "笔记本封面-2",
        "width": 1080,
        "height": 3228,
        "fullSrc": "./assets/projects/readpaper-brand/05.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/06.webp",
        "title": "海报-学霸",
        "width": 686,
        "height": 1104,
        "fullSrc": "./assets/projects/readpaper-brand/06.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/07.webp",
        "title": "海报-学弱",
        "width": 686,
        "height": 1104,
        "fullSrc": "./assets/projects/readpaper-brand/07.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/08.webp",
        "title": "海报-学神",
        "width": 686,
        "height": 1104,
        "fullSrc": "./assets/projects/readpaper-brand/08.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/09.webp",
        "title": "海报-学渣",
        "width": 686,
        "height": 1104,
        "fullSrc": "./assets/projects/readpaper-brand/09.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/10.webp",
        "title": "亚克力钥匙扣",
        "width": 411,
        "height": 241,
        "fullSrc": "./assets/projects/readpaper-brand/10.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/11.webp",
        "title": "钥匙扣",
        "width": 3024,
        "height": 4032,
        "fullSrc": "./assets/projects/readpaper-brand/11-full.webp"
      },
      {
        "src": "./assets/projects/readpaper-brand/12.webp",
        "title": "钥匙扣3cm-爆肝论文_画板 1 副本",
        "width": 1714,
        "height": 1005,
        "fullSrc": "./assets/projects/readpaper-brand/12.webp"
      }
    ],
    "cover": "./assets/projects/readpaper-brand/cover.webp",
    "designerRole": "品牌与运营视觉设计",
    "date": "2021.03 — 2024.07",
    "summary": "参与 ReadPaper 的品牌与视觉规范建设，覆盖 Logo、色彩定义、运营活动、广告和周边物料。",
    "focus": "统一品牌语言，并结合产品迭代与运营场景持续输出视觉设计。"
  },
  {
    "slug": "low-altitude-dashboard",
    "title": "低空视界大屏展示",
    "role": "数据可视化 / 大屏系统",
    "accent": "#246BFE",
    "images": [
      {
        "src": "./assets/projects/low-altitude-dashboard/01.webp",
        "title": "低空视界大屏展示 · 01",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/low-altitude-dashboard/01.webp"
      },
      {
        "src": "./assets/projects/low-altitude-dashboard/02.webp",
        "title": "低空视界大屏展示 · 02",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/low-altitude-dashboard/02.webp"
      },
      {
        "src": "./assets/projects/low-altitude-dashboard/03.webp",
        "title": "低空视界大屏展示 · 03",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/low-altitude-dashboard/03.webp"
      },
      {
        "src": "./assets/projects/low-altitude-dashboard/04.webp",
        "title": "低空视界大屏展示 · 04",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/low-altitude-dashboard/04.webp"
      },
      {
        "src": "./assets/projects/low-altitude-dashboard/05.webp",
        "title": "低空视界大屏展示 · 05",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/low-altitude-dashboard/05.webp"
      }
    ],
    "cover": "./assets/projects/low-altitude-dashboard/cover.webp",
    "designerRole": "UI 与数据可视化设计",
    "date": "2024.03 — 2024.07",
    "summary": "负责低空视界大屏展示产品的 UI 与可视化设计，组织飞行器、地图、空域状态、航线、起降平台和运行环境等复杂信息。",
    "focus": "将多源飞行与空域信息组织为可读的大屏结构，支持运行状态识别。"
  },
  {
    "slug": "rwa-trading-platform",
    "title": "RWA 交易平台",
    "role": "Web3 / 资产交易",
    "accent": "#D8A03C",
    "images": [
      {
        "src": "./assets/projects/rwa-trading-platform/01.webp",
        "title": "项目概览 · 官网与移动端首页",
        "width": 1600,
        "height": 2365,
        "fullSrc": "./assets/projects/rwa-trading-platform/01.webp"
      },
      {
        "src": "./assets/projects/rwa-trading-platform/02.webp",
        "title": "移动端 · 区块链浏览器",
        "width": 1600,
        "height": 1654,
        "fullSrc": "./assets/projects/rwa-trading-platform/02.webp"
      },
      {
        "src": "./assets/projects/rwa-trading-platform/03.webp",
        "title": "网页端 · 区块链浏览器",
        "width": 1600,
        "height": 1522,
        "fullSrc": "./assets/projects/rwa-trading-platform/03.webp"
      }
    ],
    "cover": "./assets/projects/rwa-trading-platform/cover.webp",
    "designerRole": "产品经理 / UX/UI 设计",
    "date": "2025.11 — 至今",
    "summary": "负责 Web3 生态平台的需求梳理、交互方案、视觉设计与研发对接，覆盖数字资产交易平台 PC / APP 与区块链浏览器。",
    "focus": "梳理关键任务路径、页面层级、操作流程与异常状态，兼顾业务逻辑和落地质量。"
  },
  {
    "slug": "rwa-b-platform",
    "title": "RWA B端平台",
    "role": "企业级 / 资产管理",
    "accent": "#2563EB",
    "images": [
      {
        "src": "./assets/projects/rwa-b-platform/01.webp",
        "title": "项目概览 · Web3 生态平台运营管理平台",
        "width": 1600,
        "height": 900,
        "fullSrc": "./assets/projects/rwa-b-platform/01.webp"
      },
      {
        "src": "./assets/projects/rwa-b-platform/02.webp",
        "title": "跨链桥控制台 · 首页总览",
        "width": 1600,
        "height": 900,
        "fullSrc": "./assets/projects/rwa-b-platform/02.webp"
      },
      {
        "src": "./assets/projects/rwa-b-platform/03.webp",
        "title": "跨链桥控制台 · 中继链管理",
        "width": 1600,
        "height": 1427,
        "fullSrc": "./assets/projects/rwa-b-platform/03.webp"
      },
      {
        "src": "./assets/projects/rwa-b-platform/04.webp",
        "title": "联盟管理 · CBaaS 平台页面展示",
        "width": 1600,
        "height": 900,
        "fullSrc": "./assets/projects/rwa-b-platform/04.webp"
      },
      {
        "src": "./assets/projects/rwa-b-platform/05.webp",
        "title": "CBaaS-Consol 平台 · 总览首页",
        "width": 1600,
        "height": 900,
        "fullSrc": "./assets/projects/rwa-b-platform/05.webp"
      }
    ],
    "cover": "./assets/projects/rwa-b-platform/cover.webp",
    "designerRole": "产品经理 / UX/UI 设计",
    "date": "2025.11 — 至今",
    "summary": "围绕 Web3 生态平台的资产发行后台与运营管理场景，完成复杂管理流程的产品与体验设计。",
    "focus": "为平台后续扩展沉淀统一的体验基础。"
  },
  {
    "slug": "other-works",
    "title": "其他作品",
    "role": "视觉探索 / 综合项目",
    "accent": "#C05A2B",
    "images": [
      {
        "src": "./assets/projects/other-works/01.webp",
        "title": "其他作品 · 01",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/other-works/01.webp"
      },
      {
        "src": "./assets/projects/other-works/02.webp",
        "title": "其他作品 · 02",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/other-works/02.webp"
      },
      {
        "src": "./assets/projects/other-works/03.webp",
        "title": "其他作品 · 03",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/other-works/03.webp"
      },
      {
        "src": "./assets/projects/other-works/04.webp",
        "title": "其他作品 · 04",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/other-works/04.webp"
      },
      {
        "src": "./assets/projects/other-works/05.webp",
        "title": "其他作品 · 05",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/other-works/05.webp"
      },
      {
        "src": "./assets/projects/other-works/06.webp",
        "title": "其他作品 · 06",
        "width": 1920,
        "height": 1080,
        "fullSrc": "./assets/projects/other-works/06.webp"
      }
    ],
    "cover": "./assets/projects/other-works/cover.webp",
    "designerRole": "视觉与综合设计",
    "date": "精选作品",
    "summary": "角色、IP、插画与视觉应用探索。",
    "focus": "以完整项目图展示形象构思、视觉延展与应用。"
  }
];


for (const project of projects) {
  project.cover = assetUrl(project.cover);
  for (const image of project.images) {
    const previewKey = image.src.replace('./assets/projects/', './assets/project-previews/');
    image.displaySrc = displayUrls[previewKey] || assetUrl(image.src);
    image.src = assetUrl(image.src);
    image.fullSrc = assetUrl(image.fullSrc);
  }
}
