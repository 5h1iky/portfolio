# 部署到 GitHub Pages

> 最后更新：2026-09-12
> 状态：**已上线**，用的是 GitHub Actions 自动构建

---

## 网站地址

**https://5h1iky.github.io/portfolio/**

仓库：https://github.com/5h1iky/portfolio （公开）

---

## 为什么不需要登录网页

制作者的 GitHub 账号 2FA 密钥丢失，登录不上网页。**但这不影响部署**，因为：

| 步骤 | 靠什么完成 |
|---|---|
| 建仓库 | `gh repo create`（GitHub CLI 已登录，令牌存在系统密钥环里） |
| 推代码 | `git push`（凭据已存在 Windows 凭据管理器） |
| 构建 + 发布 | GitHub Actions 自动跑，用仓库自带的 `GITHUB_TOKEN` |

**关键点**：Actions 用的是 GitHub 自己签发的临时令牌，跟制作者的登录状态无关。
所以整条链路从头到尾**不需要任何人登录网页**。

> ⚠️ 注意：这台机器上有一个有效的 `5h1iky` 令牌（`gh auth status` 可见，
> 权限 `gist, read:org, repo, workflow`）。这意味着**任何能操作这台电脑的人都能
> 以该账号名义推送代码**。如果这不是你想要的，可以执行 `gh auth logout` 撤销。

---

## 日常更新流程（改完内容怎么上线）

在 `D:\www\portfolio` 里打开 PowerShell：

```powershell
git add -A
git commit -m "更新内容"
git push
```

等 1–2 分钟，网站自动更新。**不需要在本地跑 `npm run build`**，构建在 GitHub 上做。

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

## 技术要点（改配置时要注意）

### 1. `vite.config.js` 里的 `base` 必须带仓库名

```js
base: command === 'build' ? '/portfolio/' : './',
```

**为什么不能写 `'./'`**：`src/data/profile.js` 里的截图写的是
`screenshots/chat-detail.jpg` 这种短路径。如果 base 是 `'./'`，浏览器在
`https://5h1iky.github.io/portfolio/` 下会把它解析成
`https://5h1iky.github.io/screenshots/chat-detail.jpg`——**少了 `/portfolio/`，图片全部 404**。

**换仓库名部署时**：把 `'/portfolio/'` 改成新仓库名，同时改
`.github/workflows/deploy.yml` 里的 `path: dist` 不用动，但 `assetUrl.js`
的机制会自动跟着 base 走，不需要额外改。

### 2. `src/utils/assetUrl.js` 的作用

它把 profile.js 里的短路径补成完整路径，用的前缀来自 `import.meta.env.BASE_URL`
（自动等于上面配的 base）。**所以日后改仓库名，只要改 `vite.config.js` 一处。**

### 3. `public/.nojekyll`

告诉 Pages 别用 Jekyll 处理站点。内容是空的，别删。

---

## 本地验证部署效果（不想推送就想看效果时）

```powershell
npm run build
npx vite preview --base /portfolio/
```

然后打开 http://localhost:4173/portfolio/ —— 这就是 GitHub Pages 上的真实效果。

---

## 如果以后想换部署平台

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

## 踩过的坑（避免重复踩）

1. **`base: './'` 在 GitHub Pages 子目录下会坏**——`index.html` 里的
   `./assets/...` 能正常工作，但 runtime 拼接的图片路径会 404。
   已验证：必须用 `'/仓库名/'`。
2. **本地起静态服务器测试时，一定要用新构建的产物**。
   有一次测试时 `dist` 还是旧的，导致误判"没问题"，差点把 404 推上线。
   测试前先 `Remove-Item dist -Recurse -Force` 再 build。
3. **`gh` 在 PowerShell 里参数容易被吃掉**（逗号、括号、转义符）。
   遇到 `accepts at most 1 arg(s)` 这类报错时，改成
   `gh api xxx > out.json` 再用 PowerShell 解析 JSON，别硬拼命令行。
4. **`leading-none` 会把渐变文字的下伸部裁掉**。
   `grad-text` 用 `background-clip: text`，渐变被裁到行盒范围内。
   行高 = 1×字号（60px）时字形实际需要 76px，`y` 的尾巴就被水平切平。
   大字号渐变文字**必须留足行高**（现用 **1.3 倍**，见 `Hero.jsx` 里 h1 的注释）。
   改 `Hero.jsx` 时别把 `leading-[1.3]` 删了。
5. **不要用 `Start-Process` 起长驻进程**。
   用 `Start-Process -WindowStyle Hidden npx ...` 会在 Windows 上弹出
   `npx.ps1` 命令行窗口，而且进程脱离管理、忘了关就一直占着端口。
   **长驻命令一律用受管的后台任务启动**，用完明确结束。

---

## 关于 `system-ui` 字体

网站的字体栈第一项是 `system-ui`，意思是"用访问者系统自带的界面字体"：

| 系统 | 实际用的字体 |
|---|---|
| Windows | Segoe UI |
| macOS | San Francisco |
| Android | Roboto |
| Linux | Noto Sans / DejaVu Sans |

**副作用**：不同系统上字形宽度和下伸部高度略有不同。
所以大字号渐变文字的行高特意留了余量（用 1.3 倍，而不是刚好够的 1.25 倍），
避免在字形下伸部更大的系统上被裁。

如果你想要**所有平台长得完全一样**，可以把 `src/index.css` 里的
`--font-sans` 第一项从 `system-ui` 换成一个网络字体或本地固定字体，
但那样会增加外部请求（或需要把字体文件放进项目里）。
