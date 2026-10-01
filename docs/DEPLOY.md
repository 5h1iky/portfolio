# 部署到 GitHub Pages

> 最后更新：**2026-10-01**
> 状态：**已上线**，用的是 GitHub Actions 自动构建
>
> 本次（2026-10-01）改了什么：
> · 新增 [第 4 节「查 GitHub 数据：一律用 `gh api`」](#4-查-github-数据一律用-gh-api)——
>   匿名配额 60 次/小时 vs `gh` 令牌 5000 次/小时，改版时被限流过一次（一批请求集体 403）
> · 第 3 节把为什么"不需要登录网页"讲清楚了（Actions 用自己签发的临时令牌）
> · 第 7 节 `base` 的截图举例改成现在真实的路径；第 6 节补上 Actions 的实际步骤
> · 第 10 节踩坑记录第 4 条作废并改写（渐变文字已经不用了）

---

## 1. 网站地址

**https://5h1iky.github.io/portfolio/**

仓库：https://github.com/5h1iky/portfolio （公开）

---

## 2. 网站长什么样（改版后）

- **深色优先**，浅色跟随系统
- 靠 1px 发丝边框分割内容，不用阴影、不用大圆角（最大 12px）
- 数字、日期、版本号一律等宽字体
- 只有一个强调色（紫蓝 `#8b8cf0`），只在"可点 / 选中 / 当前"处出现

配色改在 `src/index.css` 的 `@theme` 里，**不需要重新部署配置**，推上去就生效。
细节见 [EDITING.md](EDITING.md)。

---

## 3. 为什么不需要登录网页

制作者的 GitHub 账号 2FA 密钥丢失，登录不上网页。**但这不影响部署**，因为：

| 步骤 | 靠什么完成 |
|---|---|
| 建仓库 | `gh repo create`（GitHub CLI 已登录，令牌存在系统密钥环里） |
| 推代码 | `git push`（凭据已存在 Windows 凭据管理器） |
| 构建 + 发布 | GitHub Actions 自动跑，用仓库自带的 `GITHUB_TOKEN` |

**关键点**：Actions 用的是 GitHub 自己签发的临时令牌，跟制作者的登录状态无关。
所以整条链路从头到尾**不需要任何人登录网页**。

> ⚠️ 注意：这台机器上有一个有效的 `5h1iky` 令牌（`gh auth status` 可见，
> 权限 `gist, read:org, repo, workflow`，令牌存在系统密钥环里）。
> 这意味着**任何能操作这台电脑的人都能以该账号名义推送代码**。
> 如果这不是你想要的，可以执行 `gh auth logout` 撤销。

---

## 4. 查 GitHub 数据：一律用 `gh api`

**这一条能省很多时间，而且是改版时真的踩过的坑。**

| 方式 | 配额 | 结果 |
|---|---|---|
| 裸调 `https://api.github.com/...`（不带令牌） | **60 次/小时**（匿名） | 查十几个仓库就被限流，返回 **403** |
| `gh api repos/5h1iky/...` | **5000 次/小时** | 用凭据管理器里那个令牌 |

**改版过程中就被限流过**：一批请求集体返回 403，排查了一阵才发现是匿名配额用完了，
换成 `gh api` 之后立刻正常。所以：

```powershell
# ✅ 一律这样查
gh api repos/5h1iky/portfolio --jq '.pushed_at'
gh api repos/5h1iky/wanshang-yinfu/releases/latest --jq '.tag_name, .published_at, (.assets[] | "\(.name) \(.size)")'
gh api repos/5h1iky/Simple-Ai-Chat/contents/app --jq '.[].path'

# 看当前配额用了多少、什么时候重置
gh api rate_limit --jq '.rate'

# ❌ 不要这样（匿名配额，一会儿就没了）
Invoke-RestMethod https://api.github.com/repos/5h1iky/portfolio
```

> ⚠️ **"`gh` 能用"不代表"`git push` 能用"**——`api.github.com` 和 `github.com`
> 是两条不同的路。加速器没开时，`gh` 照样能查数据，但 `git push` 会失败。
> 详见下面第 5 节的提醒。
**`gh api` 的常见坑**：在 PowerShell 里参数容易被吃掉（逗号、括号、转义符）。
遇到 `accepts at most 1 arg(s)` 这类报错时：

- 优先用 `--jq` 直接取字段，不要在 PowerShell 里再拼一层解析
- 或者 `gh api xxx > out.json` 存下来再解析，**别硬拼命令行**
- 用 `--paginate` 拿全部（默认只给第一页，最多 30 条）

---

## 5. 日常更新流程（改完内容怎么上线）

在 `D:\www\portfolio` 里打开 PowerShell：

```powershell
git add -A
git commit -m "更新内容"
git push
```

等 1–2 分钟，网站自动更新。**不需要在本地跑 `npm run build`**，构建在 GitHub 上做。

> ⚠️ **推之前确认加速器开着。**
> 实测过：加速器没开时 `git push` 会失败，报
> `Failed to connect to github.com:443 ... Could not connect to server`，
> 超时约 21 秒。有意思的是同一时刻 `api.github.com` 是通的（`gh` 能用），
> 只有 `github.com` 的 HTTPS 连不上——所以"`gh` 能用"不代表"`git push` 能用"。
>
> **更要紧的是：`git push` 失败时屏幕上的输出很少**，
> 如果用 `| Select-String` 之类过滤输出，很容易看漏，误以为推成功了。
> **推完务必确认这一行状态**：
>
> ```powershell
> git status -sb
> # 显示 "## main...origin/main"           = 已同步 ✅
> # 显示 "## main...origin/main [ahead 1]" = 还没推上去 ❌
> ```

查看构建进度：

```powershell
gh run list      # 列出最近的构建
gh run watch     # 实时看当前构建
```

构建失败时看日志：

```powershell
gh run view --log-failed
```

---

## 6. Actions 里到底跑了什么

`.github/workflows/deploy.yml`，推 `main` 触发（也能在网页/命令行手动触发）：

| 步骤 | 做什么 |
|---|---|
| 1 | `actions/checkout@v4` 拉代码 |
| 2 | `actions/setup-node@v4`，Node **22**，⚠️ **故意没开 npm 缓存**（见下面的坑） |
| 3 | `npm ci` 装依赖 |
| 4 | `npm run build` 构建（几秒） |
| 5 | `actions/configure-pages@v5` |
| 6 | `actions/upload-pages-artifact@v3`，把 `dist` 传上去 |
| 7 | 另一个 job `deploy` 用 `actions/deploy-pages@v4` 发布 |

> ⚠️ **`setup-node` 那里不要加 `cache: npm`。**
> 它的缓存后置步骤在某些仓库上会失败，而它一失败就会**把整个 build 任务判为失败**，
> 导致 deploy 被跳过——明明构建和上传都成功了，网站却发不出去。
> 我们的构建只要几秒，缓存带来的收益远小于这个风险。
> `deploy.yml` 里为此写了注释，**别删**。

---

## 7. 技术要点（改配置时要注意）

### 1. `vite.config.js` 里的 `base` 必须带仓库名

```js
base: command === 'build' ? '/portfolio/' : './',
```

**为什么不能写 `'./'`**：`src/data/profile.js` 里的截图写的是短路径，
比如 `shots.dir = 'screenshots/wanshang'` + `file = '01-main.jpg'`。
如果 base 是 `'./'`，浏览器在 `https://5h1iky.github.io/portfolio/` 下会把它解析成
`https://5h1iky.github.io/screenshots/wanshang/01-main.jpg`
——**少了 `/portfolio/`，图片全部 404**。

**换仓库名部署时**：把 `'/portfolio/'` 改成新仓库名即可。
`.github/workflows/deploy.yml` 里的 `path: dist` 不用动，
`assetUrl.js` 的机制会自动跟着 base 走，也不需要额外改。

### 2. `src/utils/assetUrl.js` 的作用

它把 profile.js 里的短路径补成完整路径，用的前缀来自 `import.meta.env.BASE_URL`
（自动等于上面配的 base）。**所以日后改仓库名，只要改 `vite.config.js` 一处。**

### 3. `public/.nojekyll`

告诉 Pages 别用 Jekyll 处理站点。内容是空的，别删。

---

## 8. 本地验证部署效果（不想推送就想看效果时）

```powershell
npm run build
npx vite preview --base /portfolio/
```

然后打开 http://localhost:4173/portfolio/ —— 这就是 GitHub Pages 上的真实效果。

---

## 9. 如果以后想换部署平台

`base` 那行改成对应平台的要求即可：

| 平台 | base 应该写什么 |
|---|---|
| GitHub Pages（项目仓库） | `'/portfolio/'` |
| GitHub Pages（用户主页仓库 `5h1iky.github.io`） | `'/'` |
| Cloudflare Pages / Netlify / Vercel | `'/'` |
| 自己的服务器（放根目录） | `'/'` |
| 自己的服务器（放子目录） | `'/子目录名/'` |

改完记得本地 `npm run build` + `npx vite preview` 验证一次再推。

---

## 10. 踩过的坑（避免重复踩）

1. **`base: './'` 在 GitHub Pages 子目录下会坏**——`index.html` 里的
   `./assets/...` 能正常工作，但 runtime 拼接的图片路径会 404。
   已验证：必须用 `'/仓库名/'`。
2. **本地起静态服务器测试时，一定要用新构建的产物**。
   有一次测试时 `dist` 还是旧的，导致误判"没问题"，差点把 404 推上线。
   测试前先 `Remove-Item dist -Recurse -Force` 再 build。
3. **`gh` 在 PowerShell 里参数容易被吃掉**（逗号、括号、转义符）。
   遇到 `accepts at most 1 arg(s)` 这类报错时，改成
   `gh api xxx > out.json` 再用 PowerShell 解析 JSON，别硬拼命令行。
4. ~~**`leading-none` 会把渐变文字的下伸部裁掉**~~
   **⚠️ 这条已作废（2026-10-01）**：改版后首屏名字不再是渐变文字
   （`grad-text` 这个类已经不存在了），原来的 `leading-[1.3]` 也换成了 `leading-[1.1]`。
   **但同类问题还在**：名字里的 `y` 有下伸部，行高小于 1 时尾巴照样会被水平切平。
   `Hero.jsx` 的 h1 上现在是 `leading-[1.1]`，**注释写了不要再收紧，别删**。
5. **不要用 `Start-Process` 起长驻进程**。
   用 `Start-Process -WindowStyle Hidden npx ...` 会在 Windows 上弹出
   `npx.ps1` 命令行窗口，而且进程脱离管理、忘了关就一直占着端口。
   **长驻命令一律用受管的后台任务启动**，用完明确结束。
6. **本地截图检查要用 `dist/qa.html`，并且整页截图前必须先滚动**。
   页面里的截图是 `loading="lazy"` 的，而 `captureBeyondViewport` 一次性画整页时
   **不会**触发懒加载，不滚就会出现一堆空框，看着像图挂了。
   Edge 的 `--window-size` 也不能当视口用（它含窗口边框，实测给 412 时真实是 482）。
   这些都是 `tools/screenshot.mjs` 已经处理掉的，细节见
   [TECH_PLAN.md 第 8.3 节](TECH_PLAN.md)。

---

## 11. 关于 `system-ui` 字体

网站的字体栈第一项是 `system-ui`，意思是"用访问者系统自带的界面字体"：

| 系统 | 实际用的字体 |
|---|---|
| Windows | Segoe UI |
| macOS | San Francisco |
| Android | Roboto |
| Linux | Noto Sans / DejaVu Sans |

**副作用**：不同系统上字形宽度和下伸部高度略有不同。
所以首屏大字号名字的行高特意留了余量（现在用 **1.1 倍**，
注释里写了"不要再收紧"，避免在字形下伸部更大的系统上被裁）。
另外**等宽字**（`--font-mono`）也跟着系统走：数字、日期、版本号那些小字，
在 Windows 上是 Cascadia Mono / Consolas，在 macOS 上是 SF Mono，
行宽会有细微差别，但对齐用的 `tabular-nums` 是锁住的，**多行数字不会左右跳**。

如果你想要**所有平台长得完全一样**，可以把 `src/index.css` 里的
`--font-sans` 第一项从 `system-ui` 换成一个网络字体或本地固定字体，
但那样会增加外部请求（或需要把字体文件放进项目里）。
**现在整站是零外部请求的**（不加载网络字体、不引用外部图片、图标全是内联 SVG），
换字体会打破这一点，改之前想清楚。
