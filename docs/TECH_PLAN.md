# 技术方案

> 最后更新：2026-10-01
> 需求依据：[REQUIREMENTS.md](REQUIREMENTS.md)（需求部分不在这里重复）
>
> 本次（2026-10-01）改了什么：
> · 新增**第 4 节「实际落地的结构」**——改版后真实的目录与文件，并逐条列出与最初计划的差异
>   （含 `tailwind.config.js` 最终**没有**这件事）
> · 新增**第 5 节「Tailwind v4 的 CSS-first 配色机制」**——`@theme` / `html:not(.dark)` 怎么配合，
>   以及那个"颜色写到 `:root` 里工具类会静默消失"的坑
> · 新增**第 8 节「开发工具脚本」**——`tools\` 下 8 个脚本的用途、用法和踩坑
> · 新增**第 9 节「查 GitHub 数据：用 `gh api`，不要裸调」**——配额差 80 倍
> · 第 2 节补上实际版本号；第 3 节补上第三个 C 盘漏洞；第 6、10 节标注为历史。

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

> 📌 **改版后补记**：这两处漏洞都堵住了，另外还发现**第三处**——Node 的模块编译缓存
> 默认落在 `LOCALAPPDATA`（C 盘），`TEMP` 重定向管不到它。
> 实测一次全量编译会写约 1.4 MB，已由 `dev.ps1` 一起指到 D 盘。详见第 3 节。

---

## 2. 技术选型

### 选定：Vite + React + Tailwind CSS

**实际版本（2026-10-01）**

| 工具 | 版本 |
|---|---|
| Vite | **7.3.6** |
| React / React DOM | **19.3.0** |
| Tailwind CSS（及 `@tailwindcss/postcss`） | **4.3.3** |
| `@vitejs/plugin-react` | 5.2.0 |
| PostCSS / Autoprefixer | 8.5.28 / 10.5.6 |

| 工具 | 作用 | 为什么选它 |
|---|---|---|
| **Vite** | 构建 + 本地开发服务 | 冷启动约 1 秒，存盘即刷新（HMR），构建产物是纯静态文件 |
| **React** | 写界面组件 | 项目卡片、区块这种重复结构写一次复用；生态最成熟，以后想让 AI 改也最容易 |
| **Tailwind CSS** | 写样式 | 样式写在标签上，改字号颜色不用翻 CSS 文件。**直接服务于"方便后期改动"这个第一优先级** |

> ⚠️ **Tailwind 是 v4，用 CSS-first 配置：项目里没有 `tailwind.config.js`。**
> 所有设计令牌（颜色、字号、圆角）写在 `src/index.css` 的 `@theme` 块里。
> 详见第 5 节。看到旧文档或旧教程里"改 `tailwind.config.js`"的写法，在这个项目里不适用。

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
（改版后又发现**第三处**，一并列在下面。）

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
fund=false
audit=false
```

> **加了这个文件后，这个项目 clone 到别的机器也能用**（npm 会自动创建目录）。
> 后两行是关掉安装完的赞助提示与审计请求，输出更干净、也少一次联网。

### 漏洞 3：Node 的模块编译缓存（改版后补上的）

Node 会把编译后的模块缓存写到 `LOCALAPPDATA`（也就是 C 盘）。
**`TEMP` 重定向管不到它**，必须单独指一个环境变量：

```powershell
$env:NODE_COMPILE_CACHE = "D:\www\_temp\node-compile-cache"
```

实测一次全量编译会写约 **1.4 MB**，量不大，但每次启动都写一点，久了就是几个 GB。
`dev.ps1` 里已经加上了。

> ⚠️ 注意：`Get-ChildItem` / `Get-PSDrive C` 这类检查只能看出"少了多少"，
> 看不出"是谁写的"。怀疑有东西写 C 盘时，优先查这三个位置：
> `%TEMP%`、`%LOCALAPPDATA%\npm`、`%LOCALAPPDATA%\node-compile-cache`。

---

## 4. 实际落地的结构（2026-10-01）

下面是**改版后真实的目录与文件**，与最初计划的差异见本节末尾。

```
D:\www\portfolio\
├─ README.md
├─ dev.ps1                    ★ 启动脚本（TEMP + NODE_COMPILE_CACHE 重定向到 D 盘）
├─ .npmrc                     缓存固定在 D 盘
├─ .gitignore                 node_modules / dist / .shots 不提交
├─ index.html                 ⚠️ title 与 description 运行时会被 profile.js 的 site 覆盖
├─ vite.config.js             base 切换 + 端口 5173 + 忽略临时目录
├─ postcss.config.js          只挂 @tailwindcss/postcss 与 autoprefixer
├─ package.json               脚本只有 dev / build / preview
├─ .github\workflows\
│  └─ deploy.yml              推 main 就自动构建并发布到 Pages
├─ docs\                      文档（本文件所在的目录）
├─ tools\                     开发工具脚本，见第 8 节
├─ public\
│  ├─ .nojekyll               告诉 Pages 别用 Jekyll 处理站点（内容是空的，别删）
│  └─ screenshots\            截图。合计 0.51 MB / 15 张
│     ├─ (根目录)              SAChat：chat-detail / chat-empty / worldbook / settings
│     ├─ wanshang\             腕上音符：6 张
│     └─ gallery\              腕能图库：5 张
├─ src\
│  ├─ main.jsx                入口，一般不用动
│  ├─ App.jsx                 按 sections 数组装配区块（不含任何硬编码顺序）
│  ├─ index.css               ★ 全站视觉：@theme 颜色/字号/圆角 + 工具类 + 动画
│  ├─ data\
│  │  └─ profile.js           ★★★ 改内容只改这个文件
│  ├─ utils\
│  │  └─ assetUrl.js          把 'screenshots/x.jpg' 补成带 base 前缀的完整地址
│  └─ components\
│     ├─ Nav.jsx              顶部导航（从 sections 自动生成，含手机汉堡菜单）
│     ├─ ScrollProgress.jsx   顶部阅读进度条
│     ├─ Hero.jsx             首屏：名字 + 一句话 + 最近在做 + 三格统计
│     ├─ Projects.jsx         作品列表区（编号 01/02… 自动生成）
│     ├─ ProjectCard.jsx      单个作品：规格表 + 叙述 + 截图
│     ├─ Screenshots.jsx      截图横滑条 + 点击放大
│     ├─ Downloads.jsx        下载区外壳
│     ├─ DownloadGroup.jsx    一个下载分组：文件表 + 搜索 + 排序
│     ├─ About.jsx            关于区 + osu! 数据面板
│     ├─ Contact.jsx          联系方式区 + 页脚
│     ├─ Section.jsx          区块外壳 / 区块标头（全站复用）
│     ├─ Reveal.jsx           滚动进场动画（进视口才淡入）
│     └─ Icon.jsx             内联 SVG 图标
└─ .shots\                    本地无头浏览器截图（已 gitignore，不提交）
```

**与最初计划的差异（重要）**

| 计划里写的 | 实际 |
|---|---|
| `tailwind.config.js` 里改颜色字体 | ❌ **文件不存在**。Tailwind v4 用 `src/index.css` 的 `@theme`，见 5.1 |
| 组件只有 Hero / ProjectCard / Projects / About / Footer | 实际 13 个组件，多出下载区、导航、动画、图标等 |
| `public\screenshots\` 只放 SAChat 截图 | 现在是三个目录：根目录 SAChat、`wanshang\`、`gallery\` |
| 区块顺序写在 `App.jsx` 里 | 顺序由 `profile.js` 的 `sections` 数组决定，`App.jsx` 只负责把 type 映射到组件 |
| 需求里预留的空 `posts` 数组 | ❌ **已删除**，博客最终没做 |

**关于 `src/data/profile.js`**：这是整个"方便后期改动"需求的核心。
制作者要改的内容——名字、简介、项目列表、链接、下载项、截图路径——全在这一个文件里，
结构是普通的 JavaScript 对象，写错了页面会明确报错指出哪一行，不需要懂 React。
字段用法逐条写在 [EDITING.md](EDITING.md) 里。

---

## 5. Tailwind v4 的 CSS-first 配色机制（改版后新增）

这一节是改版时最重要的技术决定，**改样式之前必须看**。

### 5.1 令牌定义在哪

全站的设计令牌都在 `src/index.css` 的 `@theme` 块里（**深色值**）：

```css
@import 'tailwindcss';

/* 让 dark: 前缀跟着 <html class="dark"> 走。
   现在组件里基本用不到 dark:，但留着，以后想给个别地方写例外时能用。 */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: system-ui, -apple-system, 'Segoe UI', 'Microsoft YaHei', …;
  --font-mono: ui-monospace, 'Cascadia Mono', 'SF Mono', …;

  --text-display: clamp(2.5rem, 6.5vw, 4rem); /* 首屏名字 */
  --text-h2: …;  --text-h3: …;  --text-body: …;  --text-small: …;  --text-micro: …;

  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;

  --color-ground: #0a0a0b;   /* 整页背景 */
  --color-panel: #131315;    /* 卡片/面板背景 */
  --color-raised: #1a1a1d;
  --color-hair: #26262a;     /* 发丝边框（全站主要的分隔手段） */
  --color-hair-soft: #1c1c1f;
  --color-fg: #f2f2f3;  --color-fg-soft: #a6a6ae;  --color-fg-muted: #6d6d77;
  --color-accent: #8b8cf0;   /* ← 唯一的强调色 */
  --color-accent-soft: #a5a6ff;  --color-accent-dim: #4a4b8f;
  --color-accent-wash: #17172a;  --color-on-accent: #0a0a0b;
  --color-warn: #d9a441;
}
```

### 5.2 深色 / 浅色是怎么切换的

**全站只有一套颜色名字。** 深色和浅色是给同一批变量名赋两组不同的值：

| 选择器 | 作用 |
|---|---|
| `:root`（也就是 `@theme`） | **深色**，默认呈现 |
| `html:not(.dark)` | **浅色**，覆盖上面那批值 |

`<html>` 上的 `.dark` 类由 `index.html` 里一段内联脚本按系统设置挂上（读 `localStorage.theme`，
没有就跟随 `prefers-color-scheme`）。

**好处**：组件里几乎完全不用写 `dark:` 前缀——**改配色只改 `index.css` 一个文件**。

> ⚠️ **两处不能动的地方**
> 1. 浅色那一段的选择器必须是 `html:not(.dark)`（或至少落在 `:root` 上）。
>    它的优先级 (0,1,1) 要高于 `:root` 的 (0,1,0)，否则**覆盖不掉**深色值。
> 2. `@custom-variant dark` 那行留着。现在用不到，但删了以后想给个别地方写例外就得重加。

### 5.3 ⚠️ 踩坑记录：颜色必须写在 `@theme` 里

**这是本次改版踩得最深的坑，写下来免得再踩。**

**症状**：在 `:root` 里定义了一个颜色变量，比如

```css
:root {
  --color-ground: #0a0a0b;
}
```

然后在组件里写 `className="bg-ground"`——**什么也不会发生**。
不报错、不警告，class 就是没有对应样式，元素该是什么底色还是什么底色。

**原因**：Tailwind v4 只会为 `@theme` 块里的令牌**生成工具类**
（`bg-ground` / `text-fg-soft` / `border-hair` / `rounded-lg` / `text-h3` …）。
写到外面的 `:root`，Tailwind 看不见，工具类**静默消失**。

**正确做法**：

- 要生成工具类的令牌 → 写在 `@theme { … }` 里
- 只想被 `var()` 引用的普通变量 → 才可以写在外面
- 判断方法：看这个类名在页面上**有没有生效**，别只看 CSS 文件里变量存不存在

**相关的一点**：工具类名也是**构建时扫描源码字面量**生成的，
所以**不能用模板字符串拼类名**。例如

```jsx
// ❌ Tailwind 看不见这个类名，宽度会静默失效（图变成 0 宽）
<div className={`w-[${x}rem]`} />

// ✅ 动态值走行内 style
<div style={{ width: `${x}rem` }} />
```

`Screenshots.jsx` 里缩略图宽度就是这么处理的，注释里写了原因。

### 5.4 工具类与动效

`src/index.css` 里另外定义了四个 `@utility`，组件里直接用：

| 类名 | 作用 |
|---|---|
| `spec` | 等宽小标注（区块编号、日期、版本号、标签）。**全站"产品规格表"气质的主要来源** |
| `num` | 等宽 + 锁定等宽数字，多行数字对齐时不会左右跳 |
| `panel` | 统一的面板：面板底色 + 1px 发丝边框，**没有阴影** |
| `shell` | 内容最大宽度 `74rem` + 左右留白 |

动效刻意做得很少，原则是"只表达状态变化，不做装饰"：
只有入场淡入（`.rv` / `.stagger` / `.rise`）、hover 反馈、放大查看、手机菜单展开。
系统开了「减少动态效果」时全部不动（`@media (prefers-reduced-motion: reduce)`）。

---

## 6. 部署：当时比较过的方案（已落地）

> 📌 **这一节已经落地。** 实际选的是**选项 A：GitHub Pages**，
> 日常发布流程、`base` 路径的坑和踩坑记录全部搬到了 [DEPLOY.md](DEPLOY.md)。
> 下面这段保留，作为"当时比较过哪些方案、为什么没选别的"的记录。

前提：**GitHub 账号当时登录不上**（2FA 密钥丢失，正在走官方恢复流程）。
**这不阻塞开发**——网站在本地就能完整开发和预览，只有最后"发到公网"才涉及账号。
（后来证明这个判断是对的：用 `gh` + Actions 的临时令牌，整条链路从头到尾不需要登录网页。）

### 选项 A：GitHub Pages ← **最终选的这个**

- **有利条件**：这台机器的 Windows 凭据管理器里**已经有** `git:https://github.com` 凭据（用户 `5h1iky`），
  所以从这里 `git push` **不需要重新登录**——推送这步能直接走通。
- **当时以为需要本人操作的部分**：网页端 Settings 里把 Pages 打开那一下。
  实际用 `gh repo edit`/Actions 的 `configure-pages` 也能解决，**最后没有需要本人登录**。
- **结果**：已上线 https://5h1iky.github.io/portfolio/ ，推 `main` 自动构建发布。

### 选项 B：Cloudflare Pages / Netlify（不碰 GitHub）

- 支持直接从本地目录上传构建产物，或本地 CLI 部署。
- 需要登录的是这些平台自己的账号，与 GitHub 无关。
- **适合**：不想等 GitHub 恢复，想先上线看效果。

### 选项 C：国内服务器 / 宝塔面板

- 纯 SSH + 上传 `dist/` 目录，从技术上完全与 GitHub 无关。
- 注意：国内服务器绑域名需要备案。

### 统一建议（当时写的，已执行）

**先把网站做出来，在本地看到满意效果，再决定部署。** 不要提前绑定部署方案，
因为选哪种托管会影响构建配置（比如 GitHub Pages 需要设置 `base` 路径）。
→ 现在 `vite.config.js` 里的 `base` 就是按这个原则写的：开发用 `'./'`，构建用 `'/portfolio/'`。

---

## 7. 开发环境注意事项

> 📌 本节是当前有效的版本（4 条）。文档末尾还有一份**首版时的 3 条**，
> 内容包含在这一节里，作为历史保留。

1. **端口冲突**：本机 `127.0.0.1:3080` 已被 DeepSeek Harness 的 Web 界面占用。
   Vite 默认用 **5173**，正好不冲突，**不要改成 3080**。
   现在的 `vite.config.js` 里写的是 `port: 5173` + `strictPort: true`
   （端口被占就直接报错，不会偷偷换到别的端口——免得你以为在 5173 上看到的其实不是这个项目）。
2. **不要动 `C:\Users\admin\Desktop\www.cetools.com`**，那是 SAChat 的安卓源码，
   本项目只从它的 `ui/screenshots/` 里**复制**截图素材过来。
3. **C 盘空间每次构建后检查一下**：`Get-PSDrive C | Select-Object Free`，
   如果发现减少，说明还有东西在往 C 盘写，及时排查（排查顺序见第 3 节末尾）。
4. **编辑器保存时的临时目录会搞崩 Vite**（Windows 上的坑，已修）：
   有些编辑器（包括 AI 助手）保存时会先建一个 `.Hero.jsx.1234.xxxx.tmpdir` 再改名，
   Vite 的文件监听器正好扫到它就会去 watch 一个马上消失的文件，抛 `EBUSY` 把开发服务器搞崩。
   `vite.config.js` 里已经加了 `watch.ignored: ['**/.*.tmpdir/**', '**/.*.tmp']`，**这两行不要删**。

---

## 8. 开发工具脚本（`tools\`）

改版时攒下来的工具，都是"踩过坑才写的"。按用途分三类：

### 8.1 截图压缩与裁剪

| 脚本 | 作用 | 用法 |
|---|---|---|
| `tools/optimize-shots.py` | 把 `public/screenshots/` 里的原始截图压到网页用的尺寸 | `python tools/optimize-shots.py` |
| `tools/shot-content-bounds.py` | 量每张截图"内容到哪儿为止"，判断要不要配 `crop` | `python tools/shot-content-bounds.py` |

**`optimize-shots.py` 是加截图前的必经步骤。**
来源截图是手机/手表导出的原图（最长边可达 3050px，单张 300KB+）。
它按目录分别压：`screenshots/` 根目录和 `wanshang/` 压到宽 **640**，`gallery/` 压到宽 **480**，
统一 JPEG q82（progressive），已经是目标尺寸以内且体积更小的会跳过、不覆盖。

> 效果：**3.40 MB → 0.51 MB，省 85%**（15 张）。
> 不压的话一张手机原图就有 1 MB，首屏会被拖慢。

**`shot-content-bounds.py` 解决的是"缩略图看起来像个空盒子"**：
手表上只有两三行内容的页面，截图底部会有一大段纯黑。
它按行统计亮像素占比，找出最后一行还有内容的 y 坐标，
低于 88% 就提示"空白多，建议裁"。裁多少写进 `profile.js` 的 `crop` 字段
（含义与用法见 `EDITING.md`）。

### 8.2 osu! 谱面解析

| 脚本 | 作用 | 用法 |
|---|---|---|
| `tools/parse-osu-beatmap.py` | 从已存好的 osu! 谱面页面里解析出**真实**难度列表 | `python tools/parse-osu-beatmap.py 2609977 2584217` |

**为什么要有这个脚本**：谱面页面会**同时嵌入** mania / taiko / catch 的"预览难度"
（`version` 形如 `[4K] hard`），那是页面为切换模式准备的替身，不是真实难度。
照着页面数 `difficulty_rating` 会重复计数好几倍——改版时就因此把难度数写错过。
真实数据只在 `<script id="json-beatmapset">` 里的 `beatmaps` 数组里。

**⚠️ 这个脚本自己不发网络请求**，只读已经存好的 HTML。原因和抓取姿势：

- osu.ppy.sh 对 Python 的 `urllib` 直接返回 **403**（Cloudflare 挡），所以抓取交给 PowerShell
- **`-UseBasicParsing` 不能省**。不加的话 PowerShell 会走 IE 的 DOM 解析器，
  对带脚本的页面弹一个"是否继续执行脚本"的安全确认框，很烦人

```powershell
$H = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36' }
New-Item -ItemType Directory -Force -Path 'D:\www\_temp\osu' | Out-Null
Invoke-WebRequest -Uri "https://osu.ppy.sh/beatmapsets/2609977" `
    -Headers $H -UseBasicParsing -OutFile 'D:\www\_temp\osu\2609977.html'
python tools\parse-osu-beatmap.py 2609977 2584217
```

脚本除了难度列表，还会打一行"难度作者"——用来确认**有没有 guest 难度**
（判断依据是所有难度的 `user_id` 是否都等于谱面作者的 `user_id`）。

### 8.3 无头浏览器检查（本地验证用）

| 脚本 | 作用 | 用法 |
|---|---|---|
| `tools/screenshot.mjs` | 用 CDP 精确截图，可控视口、可整页、可深/浅色 | `node tools/screenshot.mjs <url> <out.png> [宽] [高] [dark\|light] [--full]` |
| `tools/overflow-probe.mjs` | 找出"是谁把页面撑宽了" | `node tools/overflow-probe.mjs <url> [宽] [高]` |
| `tools/interaction-check.mjs` | 真的点一遍交互件，确认它们能用 | `node tools/interaction-check.mjs [url]` |
| `tools/make-qa-page.mjs` | 生成 `dist/qa.html`（关掉入场动画的副本）供截图检查 | `npm run build && node tools/make-qa-page.mjs` |
| `tools/check-links.mjs` | 检查 `profile.js` 里所有下载项是否真能下载 | `node --use-system-ca tools\check-links.mjs` |

这几个都只依赖 Node 自带的 `WebSocket` / `fetch`（需要 Node 22+），**不装任何依赖**。

**`interaction-check.mjs` 补的是"截图证明不了的那一半"**：
截图只能证明"看起来对"，证明不了"点得动"。它会依次验证：

1. 下载区渲染出文件行
2. 搜索框能筛出结果（搜 `rabbit`）、搜不到时显示空状态提示而不是区块凭空消失、
   清空搜索后能恢复全部
3. 排序按钮可点击并真的改变顺序
4. 点截图能打开放大层，按 `Esc` 能关掉
5. 导航与页脚的锚点都有对应区块（**改过 `sections` 的 `id` 就该跑这一条**）
6. 所有图片加载成功（滚动一遍后查 `naturalWidth === 0`）
7. 页面无 JS 报错（它会在任何页面脚本之前挂一个错误收集器，React 抛错也能记下来）

**跑法建议**：先 `npm run build` → `node tools/make-qa-page.mjs` →
起 `npx vite preview --base /portfolio/`，然后
`node tools/interaction-check.mjs http://localhost:4173/portfolio/qa.html`。
用 `qa.html` 是因为它关掉了入场动画，元素一开始就是可见的，点击才点得到。

> ⚠️ **一个容易误判的点**：搜索是按**显示名**匹配的。
> 拿 `idol` 去搜关卡「アイドル」会得到 0 条——那是正确行为，不是 bug。
> 想验证搜索就用 `rabbit`（显示名就叫 `rabbit`）。

**⚠️ 三个踩坑记录**

1. **Edge 的 `--window-size` 指的是窗口尺寸（含边框和标题栏），真实视口会更窄。**
   实测给 412 时真实视口是 **482**，截出来的图右边被切掉一截，看着像"页面横向溢出了"，
   但页面完全正常。
   **所以必须用 CDP 的 `Emulation.setDeviceMetricsOverride` 把视口定死**，
   不要靠窗口尺寸。`screenshot.mjs` 里就是这么做的。
2. **整页截图前必须先滚动一遍。**
   页面里的截图是 `loading="lazy"`，浏览器的懒加载按"是否进入视口"触发，
   而 `captureBeyondViewport` 是一次性把整页画出来，**不会**触发懒加载。
   不滚的话首屏以下的图全是空框，看着像图挂了。（踩过一次，`screenshot.mjs` 里已内置滚动。）
3. **`Reveal.jsx` 的入场动画会让无头截图截到空白区块。**
   区块是进入视口才淡入的，视口外的可能还没触发。
   所以截图检查时用 `dist/qa.html`——它把初始状态直接置为终态。
   `dist/` 在 `.gitignore` 里，**不会提交**，每次 `npm run build` 后要重新生成一次。

`overflow-probe.mjs` 的用法：给出文档 `scrollWidth` 和所有右边缘超出视口的元素
（只报最外层那个，不然一报一大串），带 `class`、`min-width`、`white-space`，
直接定位到是哪一行 CSS 的问题。

**`screenshot.mjs` 和 `interaction-check.mjs` 都带 `--headless=new` 起 Edge，
用 `--remote-debugging-port` + `/json/list` 拿调试目标，再用 WebSocket 发 CDP 命令。**
想加新的检查项时照抄这个骨架即可，不需要装 Puppeteer。

---

## 9. 查 GitHub 数据：用 `gh api`，不要裸调（改版后新增）

**这一条能省很多时间，而且很容易犯。**

| 方式 | 配额 | 说明 |
|---|---|---|
| 裸调 `api.github.com` | **60 次/小时**（匿名） | 很容易被限流，返回 403 |
| `gh api repos/5h1iky/...` | **5000 次/小时** | 用凭据管理器里那个令牌 |

这台机器的 Windows 凭据管理器里**存着有效的 `gh` 令牌**（`gh:github.com:5h1iky`），
`gh` CLI 已经自动在用。所以**凡是查 GitHub 数据，一律走 `gh api`**。

```powershell
# ✅ 推荐
gh api repos/5h1iky/wanshang-yinfu/contents/.github/workflows --jq '.[].path'
gh api repos/5h1iky/Simple-Ai-Chat/releases/latest --jq '.tag_name, .published_at, .assets[].size'
gh api rate_limit --jq '.rate'      # 查当前配额用了多少

# ❌ 不要这样（匿名配额，一会儿就被限流）
Invoke-RestMethod https://api.github.com/repos/5h1iky/portfolio
```

> **本次改版过程中就被限流过**：一批请求集体返回 403，排查了一阵才发现是匿名配额用完了，
> 换成 `gh api` 之后立刻正常。
>
> ⚠️ 顺带一条：`gh` 能用**不代表** `git push` 能用——`github.com` 的 HTTPS 和
> `api.github.com` 是两条路，加速器没开时前者会失败而后者照常。详见 `DEPLOY.md`。

**`gh api` 的常见坑**：在 PowerShell 里参数容易被吃掉（逗号、括号、转义符）。
遇到 `accepts at most 1 arg(s)` 这类报错时，改成 `gh api xxx --jq ...` 直接取字段，
或者 `gh api xxx > out.json` 再用 PowerShell 解析，**别硬拼命令行**。

---

## 10. 附：首版时的开发环境注意事项（历史，已被第 7 节覆盖）

> 这三条写于 2026-09-12，内容都在第 7 节里（第 4 条是改版后新增的）。保留作为记录。

1. **端口冲突**：本机 `127.0.0.1:3080` 已被 DeepSeek Harness 的 Web 界面占用。
   Vite 默认用 **5173**，正好不冲突，**不要改成 3080**。
2. **不要动 `C:\Users\admin\Desktop\www.cetools.com`**，那是 SAChat 的安卓源码，
   本项目只从它的 `ui/screenshots/` 里**复制**截图素材过来。
3. **C 盘空间每次构建后检查一下**：`Get-PSDrive C | Select-Object Free`，
   如果发现减少，说明还有东西在往 C 盘写，及时排查。
