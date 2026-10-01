# 新会话交接指引

> 面向对象：接手这个项目的 AI 助手
> 最后更新：2026-10-01（网站已完成一次完整的视觉重做与内容更新）

---

## 你现在该做什么

制作者会在**新工作区**打开 `D:\www\portfolio`，然后说类似"继续做作品集网站"的话。

**按这个顺序读文件，读完了再动手：**

1. `README.md` —— 项目是什么、当前状态、**踩过的坑（第 6 节，务必看）**
2. `docs/REQUIREMENTS.md` —— 需求与已拍板的决定
3. `docs/EDITING.md` —— 内容怎么改（**字段名以 `src/data/profile.js` 实际内容为准**）
4. `docs/TECH_PLAN.md` —— 技术选型与环境约束
5. `src/data/profile.js` + `src/index.css` —— 实际的单一数据源与设计令牌
6. 本文件 —— 历史背景

---

## 项目现状（2026-10-01）

**网站已经完成两轮建设，现在是一个完整的成品并已上线：**
https://5h1iky.github.io/portfolio/

- 内容 5 件作品：3 个 Android 应用 + 2 张 osu! 谱面 + 16 个冰与火之舞关卡
- 视觉是**深色优先的开发者工具风**（Linear / Vercel 那种克制感），
  不是最初那版"紫蓝渐变 + 灰底圆角卡片"
- 内容全部集中在 `src/data/profile.js`，样式令牌全部集中在 `src/index.css`

**所以你不是"接手一个待开工的项目"，而是"在一个已完成并上线的成品上继续迭代"。**
动手前先打开线上页面看一眼实际效果，比读文档快。

---

## 必须知道的几条硬约束

**违反其中任何一条都会给制作者带来实际麻烦：**

| # | 约束 | 原因 |
|---|---|---|
| 1 | **项目固定在 `D:\www\portfolio`**，不要移到桌面或 C 盘 | C 盘只剩约 13 GB |
| 2 | **启动开发服务器用 `.\dev.ps1`**，不要直接 `npm run dev` | 脚本会把 TEMP 重定向到 D 盘 |
| 3 | **不要用 `npm install -g`**，工具一律 `npx` 本地调用 | 全局包目录还在 C 盘 |
| 4 | **不要动系统环境变量** | 制作者要求重定向只在项目内做 |
| 5 | **不要动 `C:\Users\admin\Desktop\www.cetools.com`** | 那是 SAChat 安卓源码，不是本项目 |
| 6 | **本地开发端口用 5173**，不要用 3080 | 3080 被 DeepSeek Harness 占用 |
| 7 | **不要编造内容** | 所有数字必须实际抓取，并标注核对日期 |
| 8 | **不要替制作者登录 GitHub 或绕过任何账号验证** | 已明确拒绝过，见下方背景 |

---

## 工具使用上的坑（这是本次改版最花时间的部分）

这几条都是实际踩过的，**照做能省掉大量返工**：

### 1. 改文本文件绝对不要用 PowerShell 的 `Get-Content` / `Set-Content`

**这一条是本次改版踩得最惨的坑，务必看完。**

这台机器**没有 PowerShell 7**（`pwsh` 不在 PATH），实际跑的是
**Windows PowerShell 5.1**。而 5.1 的 `Get-Content` / `Set-Content`
默认按**系统 ANSI 代码页**（中文机器上是 GBK）读写，不认 UTF-8。
后果分两层：

1. 中文变乱码（明显，容易发现）；
2. **更阴的**：乱码字节有时被当成引号/注释符，**把后面的换行吃掉**，
   两行并成一行，代码被并进注释里。脚本于是以完全不相干的方式失败。

实际案例：`dev.ps1` 的一行中文注释把下一行
`$env:NODE_COMPILE_CACHE = "D:\www\_temp\node-compile-cache"` 吞了进去，
导致再下一行的 `New-Item -Path $env:NODE_COMPILE_CACHE` 拿到空值，
报错是「**无法将参数绑定到参数"Path"，因为该参数是空值**」。
从报错完全看不出是编码问题，查了很久。

**规避办法**：
- 用编辑器改文件，或者写 Node / Python 脚本处理；不要用 PowerShell 做文本往返。
- **`.ps1` 文件必须存成「UTF-8 带 BOM」**。5.1 读 `.ps1` 时若没有 BOM 就按 ANSI 解码，
  上面那个坑立刻复现。`dev.ps1` 已带 BOM，改它时别把 BOM 弄丢。
- 拿不准就跑 `node tools/check-encoding.mjs` 做全量体检
  （检查合法 UTF-8、GBK 误读残留字符、U+FFFD 丢数据、`.ps1` 是否缺 BOM）。

> 只有 `pwsh` **工具名**叫 pwsh，实际是 5.1。别再被这个名字骗一次。

### 2. 抓网页要带 `-UseBasicParsing`

```powershell
Invoke-WebRequest -Uri "..." -Headers $H -UseBasicParsing -OutFile "..."
```

不加这个开关，PowerShell 会走 IE 的 DOM 解析器，
对带脚本的页面弹出**"是否继续执行脚本"的安全确认框**，会打断制作者的操作。

### 3. 查 GitHub 数据一律用 `gh api`

裸调 `api.github.com` 是**匿名配额 60 次/小时**，本次改版过程中就被限流过
（一批请求返回 403，导致部分信息没能核实）。
但这台机器的 Windows 凭据管理器里存着有效的 `gh` 令牌
（`gh:github.com:5h1iky`），`gh` CLI 已经自动在用，**配额是 5000 次/小时**。

```powershell
gh api repos/5h1iky/Simple-Ai-Chat/releases | ConvertFrom-Json
gh auth status   # 确认登录态还在
```

### 4. 无头浏览器截图有两个坑

- **Edge 的 `--window-size` 是窗口尺寸（含边框和标题栏）**，真实视口更窄。
  实测给 `412` 时真实视口是 `482`，截出来的图右边被切掉一截，
  看着像"页面横向溢出了"，但页面完全正常。
  → 用 `tools/screenshot.mjs`，它用 `Emulation.setDeviceMetricsOverride` 把视口定死。
- **整页截图前必须先滚动一遍**。页面里的图是 `loading="lazy"` 的，
  而一次性整页捕获**不会**触发懒加载，不滚的话首屏以下的图全是空框。
  → `tools/screenshot.mjs` 已经处理了。

另外，页面区块是进入视口才淡入的，所以截图要用
`tools/make-qa-page.mjs` 生成一份关掉入场动画的 `dist/qa.html`。
（`dist/` 已在 `.gitignore` 里，不会提交。）

### 5. osu! 谱面页的难度会重复计数

谱面页**同时嵌入了 mania / taiko / catch 的"预览难度"**，
直接对整页正则数 `difficulty_rating` 会得到好几倍的重复计数。
→ 用 `tools/parse-osu-beatmap.py`，它只读真正的 `beatmaps` 数组。
（最初网站上写的"5 个难度 / 10 个难度"就是这么错的，实际是 3 和 5。）

### 6. Tailwind v4 的颜色令牌必须在 `@theme` 里

颜色写到外面的 `:root` 会导致 Tailwind **不生成**对应的工具类
（`bg-ground` 这类静默消失，页面看着像没样式）。
浅色模式的做法是：在 `html:not(.dark)` 里覆盖**同一批变量名**。

---

## 关于 GitHub 账号（背景，避免重复排查）

制作者的 GitHub 账号（`5h1iky`）**登录不上网页**：
2FA 密钥丢失，这台电脑上**确实没有备份**。

已经做过的排查（**结论：本机无密钥、无恢复码，不要再重复查一遍**）：
- Edge 全部历史、下载、自动填充、保存的账号
- `basetoolbox.com` 自己的 IndexedDB（当时用的网页 TOTP 生成器，纯内存计算，不留记录）
- 浏览器 LocalStorage / SessionStorage / Cache
- Windows 凭据管理器（只有 `git:https://github.com` 和 `gh:github.com:5h1iky`）
- C/D/E/F 四盘的文件名与文本内容检索
- 回收站（解析了 `$I` 元数据，含已删文件原名）
- 19,500 张图片全量 OCR
- 剪贴板历史 / Windows 时间线

**但这不阻塞开发，也不阻塞部署。**
`git push` 用凭据管理器里的令牌，GitHub Actions 用仓库自带的临时令牌，
整条链路不需要任何人登录网页。详见 `docs/DEPLOY.md`。

如果制作者又提起"能不能直接登录"，参考上面的结论回答，**不要尝试绕过验证**。

---

## 一个提醒

制作者的第一优先级始终是**"方便我后期改动"**。

每做一个技术决定，都问自己：**这会让制作者以后改内容变得更简单，还是更麻烦？**
如果答案是后者，就换一个做法。

具体到当前代码，这意味着：
- 新内容一律走 `src/data/profile.js`，不要写死在组件里
- 新样式令牌一律进 `src/index.css` 的 `@theme`，不要在组件里散落魔法数字
- 组件顶部的注释要解释"**为什么这样做**"（尤其是踩过的坑），
  这个项目的注释风格是给人看的，不是给编译器看的
