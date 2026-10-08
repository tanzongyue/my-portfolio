# 部署到腾讯云 EdgeOne Pages

## 技术与部署方式

本项目是 **Vite 构建的原生 JavaScript / Three.js 静态站点**。没有 React、Next.js、SSR、服务端 API、数据库、用户认证、函数或服务端视频处理。作品、模型、动画、寻路和弹窗均在浏览器执行，无服务端功能需要迁移或删除。

发布目录是 `dist/`。不需要 EdgeOne 函数、Node 服务、Docker、框架 SSR 适配器或腾讯云 API 密钥。

## GitHub 导入

1. 将本项目目录的内容作为 GitHub 仓库根目录。必须包括 `index.html`、`src/`、`package.json`、`package-lock.json`、`vite.config.js`、`edgeone.json` 及本地媒体资源。
2. 提交 `.gitignore`；不要提交 `node_modules/`、`dist/`、`.env`、`.openai/`、云密钥或本地凭据。源码压缩包已排除这些内容。
3. 在 EdgeOne Pages 创建项目，选择 Git 仓库导入，连接该 GitHub 仓库，并选择实际使用的生产分支。
4. 使用下面的配置进行部署。`edgeone.json` 位于所选项目根目录，其字段可覆盖控制台设置。[官方配置文档](https://pages.edgeone.ai/document/edgeone-json)

| 字段 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `.` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `22.11.0` |
| Environment Variables | 留空 |

若将整个工作区而非本项目上传为仓库，Root Directory 改为 `outputs/portfolio-island`，其他配置不变。推荐直接使用项目目录作为仓库根目录。

选择 Vite 6.4.4 是为了兼容官方列出的预装 Node 22.11.0；不直接升级到要求更高 Node 小版本的 Vite 8。锁文件包含 Linux 构建所需的 Rollup / esbuild 平台包。[EdgeOne Node 配置](https://pages.edgeone.ai/document/edgeone-json)、[Vite 6 静态构建说明](https://v6.vite.dev/guide/build)

不要在依赖安装之前设置 `NODE_ENV=production` 或使用 `npm ci --omit=dev`，否则会跳过 Vite。没有业务环境变量或部署 Token 需要配置；`VITE_*` 若未来使用，只能存放公开配置，不能存放密钥。

## 路由与缓存

原网站采用 `#projects` 切换展厅，没有 React 路由。哈希不会发送到服务器，刷新 `/#projects` 仍读取首页并进入展厅。

此外，`edgeone.json` 配置了官方支持的 SPA 回退：

```json
{ "rewrites": [{ "source": "/*", "destination": "/index.html" }] }
```

EdgeOne 将这个精确配置识别为回退：先匹配已有静态资源，未匹配到的请求才返回 `index.html`。它不会将真实图片或 JS 改写成 HTML。资源使用 `/assets/...` 绝对路径，子路径刷新时不会产生相对路径 404。[官方 SPA 路由说明](https://pages.edgeone.ai/document/edgeone-json)

这项配置提供刷新回退，不会凭空增加新的页面；当前业务导航仍然使用哈希。

缓存规则按官方示例排列：先设置通用 `no-cache`，再给 `/assets/*` 的带哈希文件设置 `public, max-age=31536000, immutable`。`no-cache` 允许缓存，但使用前必须验证。新构建的文件名随内容改变，更新时 HTML 会引用新版本。缓存设置还应在真实部署后的响应头中核验。[官方响应头配置](https://pages.edgeone.ai/document/edgeone-json)

## 中国大陆访问

页面运行时全部资源位于本部署域名：作品 WebP、设备预览、字体、Three.js 和简历均无需跨境第三方请求。项目代码分包、图片懒加载及资源哈希缓存已配置。图片原本就是 WebP，完整作品原图未再次有损压缩；无需同时强制 AVIF 才能满足现代图片格式要求。

构建阶段的 npm 下载和访问 GitHub 发生在构建环境，不会由网站访客发起。`package-lock.json` 固定依赖版本与完整性，当前锁定的 npm 包下载地址使用 npm 镜像。

上线时选择适合目标访客的 EdgeOne 加速区域和域名配置。源码优化已完成；实际中国大陆访问速度仍需用最终域名、真实网络和平台配置测试，不能以本地浏览器结果代替。

## 上线核验

部署成功后，用无需登录的浏览器访问 EdgeOne 分配的地址，检查首页、`/#projects`、作品图片放大、简历下载和手机显示，再刷新展厅地址。

可用浏览器 Network 面板或终端核验 HTML 短缓存、哈希资源长缓存及压缩传输：

```sh
curl -I https://你的域名/
curl -I https://你的域名/assets/构建后的实际文件名.js
curl -I https://你的域名/portfolio/reading
```

不要直接双击 `dist/index.html`；ES 模块与绝对资源路径需要 HTTP 托管。使用 `npm run preview` 可在本地预览。

当前已完成本地生产准备，没有创建 GitHub 远程仓库、绑定域名或执行腾讯云部署。
