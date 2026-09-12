# 改内容看这里

> 这份文档写给**不想碰代码**的你。
> 网站的文字、作品、链接，全部在**一个文件**里：
> **`src/data/profile.js`**

---

## 一句话规则

**改字 → 只开 `profile.js`。**
**改颜色 → 只开 `src/index.css` 最上面。**
其他文件都不用管。

---

## 怎么把网站跑起来

在项目目录 `D:\www\portfolio` 里，**右键 → 在此处打开 PowerShell**，然后：

```powershell
.\dev.ps1
```

然后浏览器打开 **http://localhost:5173**

> ⚠️ **必须用 `.\dev.ps1`，不要直接敲 `npm run dev`。**
> 因为脚本会把临时目录指到 D 盘。这台机器 C 盘只剩 13 GB，
> 直接用 `npm run dev` 会让构建过程往 C 盘写东西。

**改完文件不用重启**，保存后浏览器会自动刷新。

关掉服务器：在那个窗口按 `Ctrl + C`。

---

## 常见改动怎么做

### 改名字 / 一句话介绍

打开 `profile.js`，最上面就是：

```js
export const hero = {
  name: '5h1iky',              // ← 改这里
  tagline: '写点自己用的东西',   // ← 名字上面那行小字
  intro: '主要在做 Android 端的应用。……',  // ← 介绍
}
```

### 加一个新作品

1. 打开 `profile.js`，搜 `projects`
2. 找到 `SAChat` 那一整段（从 `{` 到 `},`）
3. **整段复制**，粘贴在后面
4. 改掉里面的内容

关键点：**每个 `{` 和 `}` 必须成对**，每段结尾要有英文逗号 `,`。

### 加作品截图

1. 把图片文件放进 `public\screenshots\` 目录
2. 在 `profile.js` 的 `screenshots` 里加一行：

```js
screenshots: [
  { src: 'screenshots/chat-detail.jpg', alt: '对话界面' },
  { src: 'screenshots/你的新图.jpg',    alt: '一句话描述这张图' },  // ← 加这行
],
```

> `src` 从 `screenshots/` 开始写，**不要**写 `public/`。
> `alt` 是图片加载不出来时显示的说明，也方便无障碍阅读。

### 换配色

打开 **`src/index.css`**，最上面有几段带中文注释的色值：

```css
--color-brand-500: #6366f1;   /* ← 主色（紫色） */
--color-accent-500: #8b5cf6;  /* ← 副色（蓝色） */
```

改这两个，全站的标题、按钮、渐变会**一起变**。
色值去搜"颜色选择器"随便挑一个，复制 `#` 开头的六位字符即可。

### 改卡片圆角

同一个文件里：

```css
--radius-card: 1rem;   /* 改小更方正，改大更圆润 */
```

### 藏掉一块内容

**不要删代码**，把值改成空的就行，页面会自动不显示：

```js
tagline: '',          // 空字符串 → 不显示
screenshots: [],      // 空数组   → 不显示截图区
skills: [],           // 空数组   → 不显示技能标签
```

不想显示 osu! 数据那块：

```js
osuStats: {
  enabled: false,     // ← 改成 false
  ...
}
```

### 改区块顺序

打开 `src/App.jsx`，中间那几行：

```jsx
<Hero />
<Projects />
<About />
<Contact />
```

想调顺序就调这四行的先后。想临时藏掉一个，行首加 `//`：

```jsx
// <About />
```

---

## 改错了怎么办

**页面变白/报错**：多半是漏了逗号、少了个 `}` 或多打了个引号。

按 `F12` 打开浏览器控制台，红色报错里会写明**是 `profile.js` 的第几行**，
照着那一行检查标点即可。

### 如果那个黑窗口突然刷出一堆红字然后自己关了

这是 Windows 上的一个已知坑，**不是你改错了内容**。

原因：有些编辑器（包括 AI 助手）保存时会先在目录里建一个临时文件夹
（形如 `.Hero.jsx.1234.xxxx.tmpdir`），写完再改名。Vite 的文件监听器
如果正好扫到它，会去监听一个马上消失的文件，在 Windows 上直接报 `EBUSY` 崩掉。

**已经修好了**（`vite.config.js` 里加了两行忽略规则），正常不会再出现。
万一又遇到，重新跑一次 `.\dev.ps1` 即可，你的内容不会丢。

---

## ⚠️ 一条重要警告：不要用 PowerShell 改 profile.js

**如果你（或 AI 助手）用 PowerShell 命令去改这个文件，中文会变成乱码。**

原因：Windows PowerShell 5.1 的 `Get-Content -Raw` 默认按 **ANSI** 读文件，
而这个文件是 **UTF-8** 编码，读进来中文就已经坏了；再 `Set-Content` 写回去，
还会额外加一个可能导致报错的 BOM 头。

**正确做法**（任选其一）：
- ✅ 用 VS Code、记事本、Notepad++ 等**编辑器**直接打开改
- ✅ 用 `node` / Python 等**按 UTF-8 读写**的工具改
- ❌ 不要用 `Get-Content` + `Set-Content`、`Out-File` 这类 PowerShell 写法改中文文件

**已经踩过一次这个坑**（2026-09-12，文件被改成乱码后重建）。
万一又不小心改坏了，让 AI 助手用「write 工具」按 UTF-8 重建即可，内容不会丢。

---

## 几个要知道的小事

- **改了 `vite.config.js`（端口、忽略规则那些）需要重启服务器**才生效，
  改 `profile.js`、`index.css`、组件文件都不用重启。
- **作品截图建议控制在 500 KB 以内**。手机截图原图动辄 1 MB，
  现在这四张加起来约 2.2 MB，因为做了懒加载所以不影响打开速度，
  但以后加图多了建议先用画图工具缩小到 800px 宽再放进来。

---

## 检查有没有把 C 盘写满

```powershell
Get-PSDrive C | Select-Object Free
```

正常应该是 **13.4 GB 左右**。如果明显变少了，说明有东西写到 C 盘了。

---

## 想发布到网上

```powershell
npm run build
```

会生成 `dist\` 目录，里面就是完整的静态网站，整个目录传上去即可。
（部署到哪还没定，等网站内容满意了再说。）
