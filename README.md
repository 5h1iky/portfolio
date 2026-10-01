# 个人作品集网站 — portfolio

> 项目位置：`D:\www\portfolio`
> 当前状态：**已上线 → https://5h1iky.github.io/portfolio/**
> 最后更新：2026-10-01（整站视觉重做 + 内容补到 5 件作品）

---

## 这是什么

一个静态的个人作品集网站，展示制作者的项目作品：
**3 个 Android 应用 + 2 张 osu! 谱面 + 16 个冰与火之舞自制关卡**。

**改文字、加作品都不需要懂 React**——所有内容集中在 `src/data/profile.js`
一个文件里，改法见 **[docs/EDITING.md](docs/EDITING.md)**。

---

## 先读哪个文件

| 文件 | 作用 | 什么时候看 |
|---|---|---|
| **[docs/EDITING.md](docs/EDITING.md)** | **怎么改内容、怎么加作品** | **想改网站内容时看这个** |
| **[docs/DEPLOY.md](docs/DEPLOY.md)** | **怎么把改动发布上线** | **改完想更新网站时看这个** |
| **[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)** | 需求：要做什么、已拍板的决定 | 想知道"为什么这样设计"时看 |
| **[docs/TECH_PLAN.md](docs/TECH_PLAN.md)** | 方案：技术选型、环境现状 | 想了解技术细节时看 |
| **[docs/HANDOFF.md](docs/HANDOFF.md)** | 交接：新会话怎么快速接手 | 新开工作区时看 |

---

## 怎么跑起来

```powershell
cd D:\www\portfolio
.\dev.ps1
```

然后浏览器打开 **http://localhost:5173**

> ⚠️ **必须用 `.\dev.ps1`，不要直接敲 `npm run dev`**——
> 脚本会把临时目录重定向到 D 盘，保护你只剩 13.3 GB 的 C 盘。

---

## 改完内容怎么上线

```powershell
git add -A
git commit -m "更新内容"
git push
```

等 1–2 分钟，https://5h1iky.github.io/portfolio/ 自动更新。
**不需要本地构建，也不需要登录 GitHub 网页**（原理见 `docs/DEPLOY.md`）。

> ⚠️ **推完务必确认状态**：
> ```powershell
> git status -sb
> # "## main...origin/main"           = 已同步 ✅
> # "## main...origin/main [ahead 1]" = 还没推上去 ❌
> ```

---

## 一句话方案

**Vite + React + Tailwind CSS，纯静态站点。**

理由：目标是"后期方便改动"，所以内容抽成一个数据文件，改内容不用碰代码。

**技术栈实际版本**：Vite 7.3.6 · React 19.3.0 · Tailwind CSS 4.3.3

> Tailwind 是 **v4**，用的是 CSS-first 配置 —— **没有 `tailwind.config.js`**，
> 所有设计令牌都写在 `src/index.css` 的 `@theme` 块里。

---

## 网站长什么样（2026-10-01 重做）

**深色优先的开发者工具风**（参考 linear.app / vercel.com 的克制感），
刻意避开了「居中大标题 + 渐变文字 + 两个按钮」这个个人主页默认模板。

靠四样东西立住：

| 手段 | 说明 |
|---|---|
| **发丝边框** | 1px 半透明描边分割内容，不用阴影、不用大圆角（最大 12px） |
| **等宽字** | 所有数字、日期、版本号、标签都用等宽字，像产品规格表 |
| **单一强调色** | 紫蓝 `#8b8cf0` 只在"可点/选中/当前"处出现，占屏面积 < 5% |
| **深色优先** | 深色是默认，浅色是配套的另一套（跟随系统） |
| **背景氛围层** | 极光光晕 + 网格 + 颗粒，极淡，让页面有纵深（见下） |

深色底色 `#0a0a0b` 是刻意对齐作者自己两个手表 App 的配色
（腕上音符 `#1E1E1E`、腕能图库 `#1C1C1E`），这样网站和作品看起来是一套东西。

### 背景氛围层（`src/components/Backdrop.jsx`）

全站铺在最底下的一层，由三部分组成：

| 层 | 作用 | 可调项 |
|---|---|---|
| 极光 | 三团极淡的径向渐变，各自以 30/42/52 秒周期缓慢漂移缩放 | 改 `ORBS` 里的 alpha（现在 11~16%） |
| 网格 | 40px 发丝细线，中间清楚四周淡出，给纯色底一点"材质" | `--grid-line`（现在只有 2.8% 白） |
| 颗粒 | 一层几乎看不见的噪点，消除大面积纯色的塑料感 | `--grain-url` 与 `.grain-layer` 的 opacity |

还有一个**鼠标视差**：指针移动时整层光晕轻微偏移，制造"页面有厚度"的感觉。
用的是 rAF + 缓动跟随（不是直接监听 mousemove 改样式），停下来就自动停掉 rAF。

**三条性能约束**（改之前先看，不然容易把页面拖慢）：

1. **只动画 `transform` / `opacity`**，不动颜色、不用动画 `filter: blur()`。
   大尺寸元素 + 动画模糊会强制每帧重新栅格化，滚动直接掉帧。光晕的柔边靠径向渐变本身。
2. **颗粒不要开 `mix-blend-mode`，透明度别超过 0.1**。实测调大后
   页面会变成"逐像素都在变"的状态。
3. **手机端自动关掉动画**（只关动画，静态的光晕和网格保留），
   系统开「减少动态效果」时整层静止。

> 实测数据：1440 宽、关闭 GPU（软件渲染的最坏情况）下匀速滚动，
> 有氛围层平均帧时长 **16.66 ms**（= 满帧 60fps），无氛围层 16.67 ms，长任务 0。
> 也就是这一层基本不花钱。复现命令：`npm run qa:perf`

> 想整体关掉：把 `App.jsx` 里的 `<Backdrop />` 删掉即可。

**改配色只改 `src/index.css` 一个文件。** 因为深色和浅色是给**同一批变量名**
赋两组值（深色在 `@theme`，浅色在 `html:not(.dark)`），
组件里因此完全不写 `dark:` 前缀。

> ⚠️ 一个连带的坑：**底色只能铺在 `html` 上，`body` 不能有背景色**。
> 因为氛围层是 `fixed` + 低 z-index 的一层，而 body 的背景绘制在它之前 ——
> 一旦 body 有不透明背景色，整层氛围就被盖得干干净净
> （现象是"加了背景层，页面上却什么都看不到"）。

---

## 网站结构

```
D:\www\portfolio\
├─ dev.ps1                    ★ 启动脚本（重定向 TEMP 到 D 盘）
├─ .npmrc                     缓存固定在 D 盘
├─ src\
│  ├─ data\profile.js         ★★★ 改内容只碰这个文件
│  ├─ index.css               ★ 改颜色/圆角/字号只碰这个文件
│  ├─ App.jsx                 区块装配（调顺序改 profile.js 的 sections）
│  └─ components\
│     ├─ Nav / Hero / Projects / ProjectCard     首屏与作品区
│     ├─ Downloads / DownloadGroup               下载区（可搜索、可排序）
│     ├─ Screenshots                             截图横滑 + 点开放大
│     ├─ About / Contact                         关于与联系方式
│     └─ Section / Reveal / Icon / ScrollProgress  共用件
├─ public\screenshots\        App 截图（3 个应用共 15 张）
├─ tools\                     开发辅助脚本（见下）
└─ docs\                      文档
```

**整体无外部依赖请求**：不加载网络字体、不引用外部图片、图标全是内联 SVG。

---

## tools\ 里的脚本

| 脚本 | 干什么 | 什么时候用 |
|---|---|---|
| `optimize-shots.py` | 把原始截图压到网页尺寸（3.40 MB → 0.51 MB） | **加截图时：先压好再放进 `public/screenshots/`** |
| `measure-crop.py` | 量截图底部有多少空白，给出 `crop` 建议值 | 缩略图看起来像空盒子时 |
| `shot-content-bounds.py` | 上一版的粗量脚本，留着做交叉验证 | 一般用不到 |
| `parse-osu-beatmap.py` | 解析 osu! 谱面的**真实**难度列表 | 核对 osu! 作品数据时 |
| `screenshot.mjs` | 无头浏览器按精确视口截图（支持整页/深色/浅色） | 想看改动后的实际效果 |
| `element-shot.mjs` | 只截某一个元素的精确区域 | 想细看某一行/某个按钮 |
| `split-preview.py` | 把整页长截图切成分段（可以直接发给人看） | 截图太长看不清时 |
| `make-qa-page.mjs` | 生成 `dist/qa.html`（关掉入场动画，供截图用） | 配合上面几个用 |
| `interaction-check.mjs` | 真的点一遍搜索/排序/放大查看，验证交互没坏 | 改过下载区或截图组件之后 |
| `inspect-shots.mjs` | 量每张缩略图**实际被裁掉多少** | 怀疑某张图显示不全时 |
| `overflow-probe.mjs` | 找出「是谁把页面撑宽了」 | 手机上出现横向滚动条时 |
| `perf-probe.mjs` | 实测滚动帧率（可对照隐藏氛围层） | 加了动效担心变卡时 |
| `check-links.mjs` | 用 GitHub API 核对下载文件是否都还在 | 改过下载区之后 |
| `check-encoding.mjs` | 全量检查文件有没有被编码往返弄坏 | 用 PowerShell 碰过文件之后 |

常用的都配成了 npm script：`npm run qa:check`、`qa:shots`、`qa:perf`、
`qa:element`、`check:links`、`check:encoding`、`shots:optimize`、`shots:crop`。

---

## 几条踩过的坑（避免重复踩）

1. **颜色令牌必须写在 `@theme` 里**，写到外面的 `:root` 会让 Tailwind v4
   不生成对应工具类（`bg-ground` 这类会**静默消失**，页面看着"没样式"）。
2. **改这个项目里的文本文件，不要用 PowerShell 的 `Get-Content` / `Set-Content`**。
   这台机器**没有 PowerShell 7**（`pwsh` 不在 PATH），实际跑的是
   **Windows PowerShell 5.1**，它的 `Get-Content`/`Set-Content` 默认按
   **系统 ANSI 代码页（中文机器上是 GBK）**读写，不认 UTF-8。
   用它读一个 UTF-8 的中文文件再写回去，中文会变乱码，而且乱码会**吃掉换行**、
   把下一行并进注释 —— `dev.ps1` 就这么坏过一次，
   报错却是「`New-Item` 的 `-Path` 是空值」，很难往编码上想。
   → 用编辑器改，或者用 Node 脚本。跑 `node tools/check-encoding.mjs` 可以全量体检。
3. **`.ps1` 文件必须存成「UTF-8 带 BOM」**。
   同样是因为只有 PowerShell 5.1：它读 `.ps1` 时若没有 BOM，
   会按 ANSI 解码，上面那个坑就会复现。`dev.ps1` 已带 BOM，改它时别把 BOM 弄丢。
4. **抓网页时 `Invoke-WebRequest` 要带 `-UseBasicParsing`**，
   不加会调 IE 的 DOM 解析器并弹出"是否继续执行脚本"的安全确认框。
5. **查 GitHub 数据用 `gh api`，不要裸调 `api.github.com`**。
   匿名配额只有 60 次/小时，很容易被限流；`gh` 已经读了你凭据管理器里的令牌，
   配额是 5000 次/小时。
6. **osu! 谱面页会同时嵌入 mania/taiko 的预览难度**，
   直接数页面上的难度会重复计数好几倍。要用 `tools/parse-osu-beatmap.py` 解析。
7. **无头浏览器截图时，Edge 的 `--window-size` 是窗口尺寸（含边框）**，
   真实视口更窄（实测给 412 时真实是 482），要用 `Emulation.setDeviceMetricsOverride` 定死。
   另外整页截图前必须先滚动一遍，否则 `loading="lazy"` 的图片不会加载。
8. **`tools/check-links.mjs` 不要去 fetch 那些下载地址**。
   GitHub 的 release 下载会 302 到 `objects.githubusercontent.com`，
   而这个域名在当前网络取不到（和 `raw.githubusercontent.com` 一样被挡），
   于是每个链接都报超时，看着像"19 个链接全挂了"。
   现在改成问 GitHub API 要资产清单再比对，稳且快。
9. **整页长截图（6000px+）直接发给别人是看不清的**，
   很多看图工具也会拒绝渲染。用 `tools/split-preview.py` 切成分段再发。

---

## 当前已知的核心需求（原始约束，仍然有效）

1. **最高优先级：方便后期改动** —— 内容与代码分离，只改 `profile.js`。
2. **工程全部放在 D 盘，C 盘不能变少**（C 盘仅剩约 13 GB）。
3. **不要编造内容** —— 数字、日期、版本号必须来自实际抓取，并标注核对日期。
4. **只用网名 `5h1iky`，不要头像。**
5. **纯中文**，深色模式跟随系统，不做博客。

## 内容现状（2026-10-01）

| 作品 | 类型 | 版本 / 规模 |
|---|---|---|
| 腕上音符 | 安卓手表抖音客户端 | v0.8.1 · Java · GPL-3.0 |
| 腕能图库 | 安卓手表图库 + WiFi 互传 | v1.0.0 · Kotlin · MIT |
| SAChat | 安卓 AI 聊天应用 | v2.1.2 · Kotlin + Compose · MIT |
| osu! 谱面 | 谱面创作 | 2 张 · 8 个难度 |
| 冰与火之舞关卡 | 关卡创作 | 16 个 · 2023–2026 |

> 所有数字的核对日期都写在页面上（首屏与「关于」区），
> 过期后按 `docs/EDITING.md` 的方法更新。

---

## 下一步可以做

1. **看实物提意见** —— 打开 https://5h1iky.github.io/portfolio/ ，觉得哪里不对就说
2. **补内容** —— 改 `src/data/profile.js`（改法见 `docs/EDITING.md`），然后 `git push`
3. **决定 B站/osu! 两个昵称怎么统一显示**（现在各按平台原名：「明日awo」/「5h1iky」）
4. **要不要加自定义域名**（现在用的是 `5h1iky.github.io/portfolio/` 这个免费地址）
5. **冰与火之舞每个关卡的"制作日期"只有你自己知道** ——
   GitHub 上所有关卡包的资产时间都是上传时间（2026-09-12），
   现在的日期是照抄原有数据的，需要你确认对不对
