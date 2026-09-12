# 技术方案

> 最后更新：2026-09-12
> 需求依据：[REQUIREMENTS.md](REQUIREMENTS.md)（需求部分不在这里重复）

---

## 1. 环境现状（已实际核实，非推测）

| 项目 | 实际值 |
|---|---|
| Node.js | `v24.19.0`，安装在 `D:\Program Files\node\node.exe` |
| npm | `11.17.0` |
| npm 缓存 | `D:\npm-cache`（**已经在 D 盘**，之前就配好了） |
| npm 全局包目录 | `C:\Users\admin\AppData\Roaming\npm`（在 C 盘） |
| `TEMP` / `TMP` | 指向 C 盘的 `AppData\Local\Temp` |
| C 盘剩余 | **13.4 GB**（紧张） |
| D 盘剩余 | **134.3 GB** |

**结论**：Node 本身不占 C 盘，npm 下载缓存也不占 C 盘。**只剩两处漏洞要堵**，见第 3 节。

同时注意：`D:\npm-cache` 当前是 **9 月 11 日给别的项目用的**，我们共用它即可，不新建。

---

## 2. 技术选型

### 选定：Vite + React + Tailwind CSS

| 工具 | 作用 | 为什么选它 |
|---|---|---|
| **Vite** | 构建 + 本地开发服务 | 冷启动约 1 秒，存盘即刷新（HMR），构建产物是纯静态文件 |
| **React** | 写界面组件 | 项目卡片、区块这种重复结构写一次复用；生态最成熟，以后想让 AI 改也最容易 |
| **Tailwind CSS** | 写样式 | 样式写在标签上，改字号颜色不用翻 CSS 文件。**直接服务于"方便后期改动"这个第一优先级** |

**依赖体积预估**
- `node_modules`：约 200–300 MB，位于 `D:\www\portfolio\node_modules`（D 盘）
- npm 下载缓存：约 100–200 MB，位于 `D:\npm-cache`（D 盘，已有）

### 被否决的方案及理由

| 方案 | 为什么不选 |
|---|---|
| **Next.js** | 依赖 500 MB+，需要 Node 服务端。我们是纯静态内容站，用不上 SSR；且"配置复杂度"与"方便改动"直接冲突 |
| **Nuxt / Remix / SvelteKit** | 同类问题：为一个单页作品集引入整个全栈框架，维护成本远大于收益 |
| **纯 HTML + CSS + 手写 JS** | 无依赖、C 盘绝对安全，但内容一多就会变成复制粘贴地狱；改一次样式要翻多个文件。**如果后期发现依赖维护太累，这是退路** |
| **Astro** | 对内容站其实很合适，但对"单页作品集 + 一个项目"来说引入 island 概念反而增加理解成本。**作为第二备选保留** |

---

## 3. 堵住 C 盘的两个漏洞（关键）

虽然 Node 和 npm 缓存都在 D 盘，但下面两处仍会写 C 盘，必须处理：

### 漏洞 1：全局包目录

现状 `C:\Users\admin\AppData\Roaming\npm` 在 C 盘。
**绕过方式**：所有工具都从项目本地调用（`npx vite`、`npx tailwindcss`），不使用 `npm install -g`。
本地调用走的是 `D:\www\portfolio\node_modules\.bin\`，不碰全局目录。

> 如果以后确实要装全局工具，再执行这一行即可（**这属于系统级改动，需制作者同意后再做**）：
> ```
> npm config set prefix "D:\www\_global-npm"
> ```

### 漏洞 2：构建临时文件

Vite / esbuild / PostCSS 会往 `TEMP` 写中间文件，默认落在 C 盘。

**解决方式：项目内重定向，不改系统环境变量。** 用 `dev.ps1` 脚本启动：

```powershell
# D:\www\portfolio\dev.ps1
# 把临时目录指到 D 盘，避免构建过程写入 C 盘
$env:TEMP = "D:\www\_temp"
$env:TMP  = "D:\www\_temp"
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
npm run dev
```

以后启动开发服务器一律用 `.\dev.ps1`，不要直接 `npm run dev`。

### 配套：项目级 `.npmrc`

在项目根目录建 `.npmrc`，把路径固定死，不依赖机器上的环境变量：

```ini
cache=D:\npm-cache
```

> **加了这个文件后，这个项目 clone 到别的机器也能用**（npm 会自动创建目录）。

---

## 4. 计划目录结构

```
D:\www\portfolio\
├─ README.md                 项目说明
├─ docs\
│  ├─ REQUIREMENTS.md        需求（先读这个）
│  ├─ TECH_PLAN.md           本文件
│  └─ HANDOFF.md             新会话交接指引
├─ .npmrc                    路径固定（不依赖环境变量）
├─ dev.ps1                   开发启动脚本（重定向 TEMP 到 D 盘）
├─ package.json
├─ vite.config.js
├─ tailwind.config.js        颜色、字体在这里改，改一次全站生效
├─ index.html
├─ public\
│  └─ screenshots\           SAChat 截图放这里
└─ src\
   ├─ main.jsx               入口，一般不用动
   ├─ App.jsx                页面装配顺序（调整区块顺序改这里）
   ├─ index.css              只放 Tailwind 引入和极少数全局样式
   ├─ data\
   │  └─ profile.js          ★ 改内容只改这个文件
   └─ components\
      ├─ Hero.jsx            顶部：名字 + 一句话
      ├─ ProjectCard.jsx     单个项目卡片（按数据自动渲染）
      ├─ Projects.jsx        项目列表区
      ├─ About.jsx           关于区
      └─ Footer.jsx          联系方式区
```

**关于 `src/data/profile.js`**：这是整个"方便后期改动"需求的核心。
制作者要改的内容——名字、简介、项目列表、链接、截图路径——全在这一个文件里，
结构是普通的 JavaScript 对象，写错了页面会明确报错指出哪一行，不需要懂 React。

---

## 5. 部署选项

前提：**GitHub 账号目前登录不上**（2FA 密钥丢失，正在走官方恢复流程）。
**这不阻塞开发**——网站在本地就能完整开发和预览，只有最后"发到公网"才涉及账号。

### 选项 A：GitHub Pages

- **有利条件**：这台机器的 Windows 凭据管理器里**已经有** `git:https://github.com` 凭据（用户 `5h1iky`），
  所以从这里 `git push` 大概率**不需要重新登录**——推送这步能直接走通。
- **需要本人操作的部分**：网页端 Settings 里把 Pages 打开那一下需要登录。
- **建议时机**：等 GitHub 账号恢复后再做，最省事。

### 选项 B：Cloudflare Pages / Netlify（不碰 GitHub）

- 支持直接从本地目录上传构建产物，或本地 CLI 部署。
- 需要登录的是这些平台自己的账号，与 GitHub 无关。
- **适合**：不想等 GitHub 恢复，想先上线看效果。

### 选项 C：国内服务器 / 宝塔面板

- 纯 SSH + 上传 `dist/` 目录，从技术上完全与 GitHub 无关。
- 注意：国内服务器绑域名需要备案。

### 统一建议

**先把网站做出来，在本地看到满意效果，再决定部署。** 不要提前绑定部署方案，
因为选哪种托管会影响构建配置（比如 GitHub Pages 需要设置 `base` 路径）。

---

## 6. 开发环境注意事项

1. **端口冲突**：本机 `127.0.0.1:3080` 已被 DeepSeek Harness 的 Web 界面占用。
   Vite 默认用 **5173**，正好不冲突，**不要改成 3080**。
2. **不要动 `C:\Users\admin\Desktop\www.cetools.com`**，那是 SAChat 的安卓源码，
   本项目只从它的 `ui/screenshots/` 里**复制**截图素材过来。
3. **C 盘空间每次构建后检查一下**：`Get-PSDrive C | Select-Object Free`，
   如果发现减少，说明还有东西在往 C 盘写，及时排查。
