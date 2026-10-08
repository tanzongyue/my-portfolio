# TAN 交互式设计作品集

原站采用原生 HTML / CSS / JavaScript、Three.js r180 和 OrbitControls。生产版本使用 **Vite 6.4.4** 构建，没有 React 或 Next.js，也没有 SSR、API、数据库、登录或其他服务端功能。构建后的 `dist/` 可以直接用于纯静态托管。

保留首页岛屿、人物行走、建筑金光、水面倒影、船只、桃花、小狗动画、七项目展厅、设备首图、作品详情、图片放大及简历下载。只调整工程结构和资源加载方式。

## 本地运行

建议使用与 EdgeOne 构建配置一致的 Node.js 22.11.0。

```sh
npm install
npm run dev
```

## 生产构建

```sh
npm ci
npm run build
npm run verify:production
npm run preview
```

`npm ci` 根据提交的锁文件安装依赖。Vite 是构建时依赖，不要在安装前设置 `NODE_ENV=production` 或使用 `--omit=dev`。生产服务器只提供 `dist/` 文件，不需要 Node.js 进程。

## EdgeOne Pages 配置

| 设置 | 值 |
| --- | --- |
| Framework | Vite |
| Root Directory | `.`（以本项目目录作为 GitHub 仓库根目录时） |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | `22.11.0` |
| 环境变量 | 无必需项 |

项目根目录的 `edgeone.json` 已配置构建、缓存响应头及 SPA 回退。完整步骤见 [部署说明](docs/DEPLOY-EDGEONE.md)。

## 仓库结构

```text
index.html                  HTML 入口，保留原有 UI
src/
  app.js                    场景导航与人物控制
  world.js                  首页场景及水面
  models.js                 人物、动物、船只、植物、设备
  project-world.js          按需加载的项目展厅
  portfolio.js              按需加载的作品详情与图片查看器
  projects.js               七项目完整数据及媒体地址
  style.css                 原有样式 + 本地字体
  vendor/                   原版 Three.js r180 / OrbitControls
  assets/
    projects/               74 个原始 WebP 文件
    project-previews/       10 个设备屏幕小图
    fonts/                  DM Sans / Manrope WOFF2
    tan-zongyue-resume.pdf
scripts/
  verify-production.mjs      构建产物与资源完整性检查
  generate-device-previews.py 可选的图片制作工具
docs/                       部署说明、资源审计及验证记录
licenses/                   Three.js MIT 和字体 SIL OFL
package.json
package-lock.json
vite.config.js
edgeone.json
.gitignore
.nvmrc
.env.example
dist/                       构建生成，不提交 Git
```

字体、图片、Three.js、图标、PDF 均自行托管。首页不请求项目图片；展厅和详情代码按需加载。设备小图走近后加载，详情图片保留懒加载和原图查看。带内容哈希的静态资源可长缓存，HTML 每次重新验证。[资源审计](docs/ASSET-AUDIT.md)记录了具体范围。

设备小图已提交，正常安装和构建不需要 Python。只有修改作品后需要重新制作小图时，才使用 Python + Pillow 运行 `scripts/generate-device-previews.py`。

`.gitignore` 排除了构建产物、依赖、环境文件、常见密钥及旧托管配置。示例环境文件只有注释。不要把腾讯云密钥放入 `VITE_*` 变量，它们会被写进浏览器代码。
