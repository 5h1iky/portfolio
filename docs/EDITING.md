# 改内容看这里

> 最后更新：**2026-10-01**
> 这份文档写给**不想碰代码**的你。网站的文字、作品、链接，全部在**一个文件**里：
> **`src/data/profile.js`**
>
> 本次（2026-10-01）改了什么：网站做了一次大改版，`profile.js` 的字段跟着变了。
> 这份文档里**所有的字段名、示例代码、目录列表都重新对着源码核过一遍**：
> `tagline` → **`label`**、`screenshots` → **`shots`**（结构也换了）、
> `osuStats.updated` → **`checked`**、预留的 `posts` 已删除、
> `sections` 里 `projects` 的 id 改成了 **`work`**。
> 另外新增两节：[加作品截图（含先跑压缩脚本）](#加作品截图含先跑压缩脚本) 和 [crop 是干什么的](#crop-是干什么的)。

---

## 目录

- [一句话规则](#一句话规则)
- [怎么把网站跑起来](#怎么把网站跑起来)
- [字段名速查表](#字段名速查表) ← **不确定字段叫什么就先看这里**
- [常见改动怎么做](#常见改动怎么做)
  - [改名字 / 一句话介绍](#改名字-一句话介绍)
  - [改首屏右侧的「最近在做」](#改首屏右侧的最近在做)
  - [改首屏底部那三格统计](#改首屏底部那三格统计)
  - [加一个新作品](#加一个新作品)
  - [加作品截图（含先跑压缩脚本）](#加作品截图含先跑压缩脚本)
  - [crop 是干什么的](#crop-是干什么的)
  - [换配色](#换配色)
  - [改圆角](#改圆角)
  - [藏掉一块内容](#藏掉一块内容)
  - [改区块顺序 / 导航](#改区块顺序-导航)
  - [改关于区和 osu! 数据](#改关于区和-osu-数据)
  - [改联系方式 / 页脚 / 浏览器标题](#改联系方式-页脚-浏览器标题)
- [改错了怎么办](#改错了怎么办)
- [⚠️ 一条重要警告：不要用 PowerShell 改 profile.js](#-一条重要警告不要用-powershell-改-profilejs)
- [怎么加一个可下载的文件](#怎么加一个可下载的文件)
- [⚠️ 加内容时最容易踩的坑：整页被顶宽（手机上尤其明显）](#-加内容时最容易踩的坑整页被顶宽手机上尤其明显)
- [几个要知道的小事](#几个要知道的小事)
- [检查有没有把 C 盘写满](#检查有没有把-c-盘写满)
- [想发布到网上](#想发布到网上)

---

## 一句话规则

**改字 → 只开 `profile.js`。**
**改颜色 / 圆角 / 字号 → 只开 `src/index.css` 最上面的 `@theme` 里那一段。**
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

## 字段名速查表

`profile.js` 从上到下是这 7 块。加内容前先扫一眼，免得改错地方。
（左边数字是文件里的编号，搜「①」～「⑦」能直接跳过去。）

| # | 变量 | 管什么 |
|---|---|---|
| ① | `sections` | 区块**顺序** + 导航栏（导航是从这里自动生成的） |
| ② | `hero` | 首屏：名字、头上一行小字、自我介绍、最近在做、按钮、三格统计 |
| ③ | `projects` | **作品列表，最常改的就是这里** |
| ④ | `downloads` | 文件下载区（分组 + 文件表，支持搜索和排序） |
| ⑤ | `about` | 关于：正文段落、osu! 数据面板、技能标签 |
| ⑥ | `contacts` | 联系方式 + 页脚 |
| ⑦ | `site` | 浏览器标签页上的标题 + 分享出去的摘要 |

**除了这 7 块，文件里没有别的东西。** 之前那个预留的空 `posts` 数组已经删掉了（博客没做）。

---

## 常见改动怎么做

### 改名字 / 一句话介绍

打开 `profile.js`，第 ② 块就是：

```js
export const hero = {
  // 你的名字 / 网名，显示成首屏最大的字
  name: '5h1iky',

  // 名字上面那行等宽小字，留空 "" 就不显示
  label: 'Android · 独立开发',        // ← 原名 tagline，现在叫 label

  // 两三句话的自我介绍。首页只显示第一句，剩下的在「关于」区展开。
  intro:
    '写自己用得上的东西。主力是 Android 端的应用，也在 osu! 上做谱面、给冰与火之舞做自制关卡。',
}
```

> ⚠️ 旧的写法里这一行叫 `tagline`，**现在改名叫 `label` 了**。
> 如果看到别处（旧文档、旧截图）写 `tagline`，那是不对的，改 `label`。

### 改首屏右侧的「最近在做」

首屏右边那块清单是真内容，不是装饰。**写上去就等于对外承诺"我最近在做这个"**，
所以每条都要是真的。

```js
  // 首屏右边的「最近在做」清单。不要这块就写 []
  now: [
    { text: '腕上音符', note: 'v0.8.1', href: '#work' },
    { text: '腕能图库', note: 'v1.0.0', href: '#work' },
    { text: 'SAChat', note: 'v2.1.2', href: '#work' },
  ],
```

- `text` 显示的名字
- `note` 右边那串等宽小字（版本号、日期都行），不想要就删掉这一项
- `href` 点了跳哪去。`'#work'` = 跳到作品区，`'#downloads'` = 跳到下载区

### 改首屏底部那三格统计

```js
  // 首屏底部的三格统计。数字必须是真的，来源写在 source 里，会显示在下方。
  // 不要这块就写 []。改完记得把 checked 改成今天。
  stats: [
    { label: '开源项目', value: '4', note: 'GitHub 公开仓库' },
    { label: '手表端应用', value: '2', note: '安卓手表' },
    { label: '自制关卡', value: '16', note: '冰与火之舞' },
  ],
  statsChecked: '2026-10-01',
```

> ⚠️ **`statsChecked` 是"核对于哪天"，改完数字必须一起改。**
> 它显示在三格下面那行小字里。删了它，这三个数字就会变成
> "看起来像实时数据"的假数字——那是这个网站唯一不能忍的事。

### 加一个新作品

1. 打开 `profile.js`，搜 `projects`（第 ③ 块）
2. 找到一整段作品（从 `{` 到 `},`），比如 `SAChat` 那段
3. **整段复制**，粘贴在后面
4. 改掉里面的内容

一个作品长这样（字段都是真实存在的，可以直接抄）：

```js
  {
    name: '腕上音符',                    // 作品名（大标题）
    subname: 'wanshang-yinfu',           // 副名，显示在名字右边的等宽小字，没有就写 ''
    summary: '安卓手表上的轻量抖音客户端，刷视频、回私信，抬腕即达。',
    description: '给手表这种小屏设备重新做了一遍信息架构……',  // 没有就写 ''
    status: '持续维护',                   // 标题右边的状态标签，不想要就写 ''
    tags: ['Java', 'Android', 'Wear OS'],// 规格表下面那排小标签，不要就写 []
    meta: [                              // 左边的规格表，一行一条
      { k: '平台', v: 'Android 5.0+' },
      { k: '最新版本', v: 'v0.8.1' },
      { k: '安装包', v: '6.26 MB' },
      { k: '更新于', v: '2026-10-01' },
    ],
    links: [                             // 右下角的链接按钮
      { label: '网盘下载', href: 'https://beifang1.lanzouu.com/iSvCK4alragj',
        note: '打不开 GitHub 就用这个' },   // note = 按钮下面那行小字，可省略
      { label: 'GitHub 仓库', href: 'https://github.com/5h1iky/wanshang-yinfu' },
      { label: '下载 APK', href: 'https://github.com/5h1iky/wanshang-yinfu/releases' },
    ],
    highlights: [                        // 右下的要点列表，一行一条
      '刷视频：上下滑切换、预加载缓冲、H.264 / 540p 省流选档',
      '全屏播放：双指缩放 1x–5x、放大后单指拖动、手动旋转',
    ],
    shots: null,                         // 截图，见下一节；没有截图就写 null
  },
```

**关键点**：**每个 `{` 和 `}` 必须成对**，每段结尾要有英文逗号 `,`。

> 小提示：作品的编号（01 / 02 / …）是自动生成的，按数组顺序排。
> **想调整作品的先后顺序，直接把整段上下移动即可，不用改编号。**

#### 链接按钮的写法（`links` 里每一项）

| 字段 | 必填 | 说明 |
|---|---|---|
| `label` | ✅ | 按钮上显示的字 |
| `href` | ✅ | 跳转地址。写 `#downloads` 这种也能用，会跳到页内区块 |
| `note` | ❌ | **按钮下面那行小灰字**，用来提示"这条链接什么时候用"。写长了会自动折行 |
| `icon` | ❌ | 手动指定图标：`cloud` 云盘 / `download` 下载 / `external` 外链 |

**图标一般不用写**，会自动判断：

- 链接里含 `lanzou` / `pan.` / `蓝奏` / `网盘` 等字眼 → 云盘图标
- `label` 里有"下载"或"APK" → 下载图标
- 其余 → 外链图标

> ⚠️ `note` 是挂在**单个按钮**上的，所以它只影响那一个按钮，
> 同一行里别的按钮不会被顶高（这行按钮用的是顶部对齐）。
>
> **多个下载渠道就用这个方式**：一个 GitHub、一个网盘，
> 在网盘那个上写 `note: '打不开 GitHub 就用这个'` 即可。

### 加作品截图（含先跑压缩脚本）

**第一步一定是先压缩，再放进项目。** 顺序反了会很难受。

1. **把新截图放进 `public\screenshots\` 里对应的子目录**（没有子目录就建一个）
2. **跑压缩脚本**：

   ```powershell
   python tools\optimize-shots.py
   ```

   它会把 `public\screenshots\` 里的图按目录分别压到网页用的尺寸
   （手机/手表截图压到宽 640，`gallery\` 压到宽 480，统一 JPEG q82），
   已经够小、够规格的会跳过不动。

   > ⚠️ **这一步不能省。** 手机导出的原图单张动辄 1 MB（最长边能到 3050px）。
   > 现在站内 15 张图合计只有 **0.51 MB**；压之前是 **3.40 MB**——省了 85%。
   > 忘压的话首屏会被一张图拖慢。

3. **在 `profile.js` 里加截图**。截图字段叫 **`shots`**（旧文档里叫 `screenshots`，已改名），
   而且**不是数组，是一个对象**，长这样：

   ```js
    shots: {
      dir: 'screenshots/wanshang',    // 图片在哪个目录（从 public 里面开始写）
      ratio: '372 / 430',             // 所有截图的宽高比，照抄图片真实像素尺寸
      items: [
        { file: '01-main.jpg', alt: '主屏：刷视频 / 聊天 / 我的 / 设置' },
        { file: '02-feed.jpg', alt: '刷视频页面' },
        { file: '04-chat-list.jpg', alt: '私信会话列表', crop: 0.82 },  // ← 加这行
      ],
    },
   ```

   - `dir` 从 `screenshots/` 开始写，**不要**写 `public/`
   - `ratio` 就写图片的像素宽高，例如 `'640 / 1422'`、`'480 / 1017'`。
     同一个作品下**默认所有图比例一样**，缩略图才会高矮一致
   - 某一两张图方向不一样时（比如横屏截图混在竖屏里），
     **单独给那一张写 `ratio`** 即可，不用为了迁就它把所有图都改掉
   - `alt` 是图片加载不出来时的说明文字，也方便读屏软件
   - `crop` 是可选的，解释见下一节

4. **保存 → 页面立刻生效，不用重启。**

> 一个作品**没有截图**就写 `shots: null`（osu! 谱面和冰与火之舞那两段就是这么写的），
> 那一整块会自动不渲染，不会留空白。

### crop 是干什么的

**一句话：`crop` 只裁缩略图，不裁大图。**

有些截图底部有一大段纯黑空白——比如手表上只有两三个控件的页面。
这种图原样缩成小缩略图，看起来就是**一个空盒子**，还以为是图挂了。

`crop` 就是告诉页面"缩略图只保留上面多少比例"：

```js
{ file: 'transfer.jpg', alt: 'WiFi 互传：二维码配对', crop: 0.78 },
//                                                     ↑ 只保留上面 78%
```

- 取值范围 0～1，**不写就是完整显示**（不裁）
- **是"裁"，不是"压"**：画面不会变形，只是把下面那段切掉
- **点开看大图时依旧是完整原图**，不受 `crop` 影响

**那 crop 该填多少？** 不用猜，有脚本量：

```powershell
python tools\measure-crop.py
```

它会逐张打印"内容止于 y=xxx (xx.x%)"和底部空白占多少，并给出建议值。

> ⚠️ **填之前一定要肉眼看一遍那张图。**
> 亮度统计会把**深灰色的小字**当成空白。实测 `settings.jpg` 和 `about.jpg`
> 被脚本判成"底部 21% 是空白"，但打开一看，底部一直有内容
> （最后一行是"关于腕能图库"，颜色很暗，没到阈值）。
> 差点就把真内容裁掉了。**脚本给的是线索，不是结论。**

> ⚠️ 跑之前记得把新图**加进脚本里的 `FILES` 列表**，否则它不会量到你的新图。

> 关于实现：容器宽高比的算法是「图片比例 ÷ crop」，不是「1 ÷ crop」。
> 这里错过一次 —— 后者只在正方形图上成立，对 480×1017 这种竖长图，
> `crop: 0.68` 会算成只显示 32% 的画面，表现就是"图只显示了一半"。
> 细节和推导写在 `src/components/Screenshots.jsx` 的注释里。

### 换配色

打开 **`src/index.css`**，最上面 `@theme` 块里有一段带中文注释的色值。
**最常改的是这一个：**

```css
  /* 强调色（作者原来选的紫蓝色，但用法收紧了：
     只在"当前项 / 链接 / 选中态 / 小圆点"上出现，不再做大面积渐变底） */
  --color-accent: #8b8cf0;      /* ← 主强调色，改这个最主要 */
  --color-accent-soft: #a5a6ff; /* hover 时更亮 */
  --color-accent-dim: #4a4b8f;  /* 边框、暗态 */
```

底色（整页背景、面板背景、边框）在它上面一段：

```css
  --color-ground: #0a0a0b;   /* 整页背景 */
  --color-panel: #131315;    /* 卡片/面板背景 */
  --color-hair: #26262a;     /* 发丝边框（全站主要的分隔手段） */
```

色值格式是 `#RRGGBB`。想找颜色可以去搜「颜色选择器」，复制 `#` 开头的六位字符即可。

> ⚠️ **改这里必须知道的两件事**
>
> **1. 深色和浅色是两份值，都要改。**
> 上面那一段是**深色**（默认呈现）。浅色的值在同一个文件**下面**，长这样：
>
> ```css
> html:not(.dark) {
>   --color-ground: #fbfbfc;
>   --color-accent: #5758d6;
>   --color-accent-soft: #4344bd;
>   --color-accent-dim: #b9b9ea;
>   /* …下面还有底色、文字色、语义色，一共十几行 */
> }
> ```
>
> 这是**同一批变量名的另一套值**，所以要改就得两边都改。
> 好处是：组件里不用写任何 `dark:` 前缀，改配色只改这一个文件。
>
> **2. 颜色只能写在 `@theme` 块里面。**
> 写到外面的 `:root` 里，Tailwind 不会生成对应的类名，
> 页面上的 `bg-ground` 这类样式会**悄悄消失**——不报错，就是不生效。
> 这是在改版时踩过的坑，别重复踩。

### 改圆角

同一个文件，`@theme` 里：

```css
  --radius-sm: 4px;    /* 小控件：标签、输入框 */
  --radius-md: 8px;    /* 中控件：按钮、截图 */
  --radius-lg: 12px;   /* 大面板：整块内容区 */
```

改大更圆润，改小更方正。整体是"精密"的调子，**最大只到 12px**，
再大就会变成那种到处圆滚滚的通用卡片风。

### 藏掉一块内容

**不要删代码**，把值改成空的就行，页面会自动不显示：

```js
  label: '',            // 空字符串 → 名字上面那行小字不显示
  stats: [],            // 空数组   → 首屏底部三格统计不显示
  now: [],              // 空数组   → 「最近在做」那块不显示
  buttons: [],          // 空数组   → 首屏两个按钮不显示
  tags: [],             // 空数组   → 标签那排不显示
  skills: [],           // 空数组   → 「在用的东西」不显示
  shots: null,          // null     → 截图区不显示
  status: '',           // 空字符串 → 状态标签不显示，也不留空位
```

不想显示 osu! 数据那块：

```js
  osuStats: {
    enabled: false,     // ← 改成 false
    …
  },
```

### 改区块顺序 / 导航

打开 `profile.js`，第 ① 块 `sections`：

```js
export const sections = [
  { id: 'top',       type: 'hero',      title: '首页', nav: '首页' },
  { id: 'work',      type: 'projects',  title: '作品', nav: '作品' },
  { id: 'downloads', type: 'downloads', title: '下载', nav: '下载' },
  { id: 'about',     type: 'about',     title: '关于', nav: '关于' },
  { id: 'contact',   type: 'contact',   title: '联系', nav: '联系' },
]
```

- **`nav`**：导航栏上显示的短名。删掉这一项就退回去用 `title`
- **`title`**：区块标题。想改名改这个
- **调整顺序**：把整行上下移动
- **临时藏掉一个区块**：整行前面加 `//`（导航里也会跟着消失）
- **`type`**：决定这一块渲染成什么，只能填 `hero` / `projects` / `downloads` / `about` / `contact`
  这五个之一，填错会跳过这一块并在控制台警告

**导航栏是从这个数组自动生成的，不用改任何组件代码。** 手机端会自动折叠成汉堡菜单。

> ⚠️ **`id` 不要随手改。**
> 导航高亮、以及作品里的 `href: '#work'`、`href: '#downloads'` 这些跳转，靠的都是 `id`。
> 现在页面里写死的锚点是这五个：`top` / `work` / `downloads` / `about` / `contact`。
> **作品区那个 id 以前叫 `projects`，现在叫 `work`**——如果你照着旧文档把它改回 `projects`，
> 导航点"作品"就跳不过去了（页面里没有叫 `projects` 的锚点）。
>
> 一句话：`id` 保持默认，改名改 `title` 和 `nav`。

### 改关于区和 osu! 数据

```js
export const about = {
  title: '关于',

  paragraphs: [                         // 正文段落，一段一个字符串
    '主要是自己用得到什么就写什么。……',
    '近一年主要在做 Android 端的东西，……',
  ],

  osuStats: {
    enabled: true,                      // 不想显示就改 false
    checked: '2026-10-01',              // ← 原来叫 updated，现在叫 checked
    handle: '5h1iky',                   // 面板右上角那个链接显示的名字
    href: 'https://osu.ppy.sh/users/39723694',
    items: [                            // 六个格子，加一条就多一格
      { label: '全球排名', value: '#455,938' },
      { label: 'pp', value: '2,182' },
      { label: '准确率', value: '90.51%' },
      { label: '游玩次数', value: '2,372' },
      { label: '等级', value: '68' },
      { label: '入坑', value: '2026-05-04' },
    ],
  },

  skills: ['Kotlin', 'Java', 'Jetpack Compose', 'Android', 'Wear OS', …],  // 不要就写 []
}
```

（`skills` 里现在有 10 项，加一条就多一个标签。）

**更新 osu! 数据的步骤**：打开自己 osu! 主页抄一遍新数字 → 改 `items` 里的 `value`
→ **把 `checked` 改成今天**。面板底部那行"取自 osu! 主页 · 核对于 …"就是它，
**不要删**——删了就变成看起来像实时数据的假数字。

（`checked` 这个字段以前叫 `updated`。另外 `handle` 和 `href` 是新增的。）

### 改联系方式 / 页脚 / 浏览器标题

第 ⑥ 块和第 ⑦ 块，改法都很直白：

```js
export const contacts = {
  title: '联系方式',

  // 加一个平台就多一条
  // ⚠️ GitHub 和 B站 的昵称不一样（5h1iky / 明日awo），这是真的，
  //    所以两条都保留了平台原名，不要为了"统一"改成同一个。
  items: [
    { platform: 'GitHub', handle: '5h1iky',    href: 'https://github.com/5h1iky',            note: '代码都在这' },
    { platform: 'B站',    handle: '明日awo',   href: 'https://space.bilibili.com/432122433', note: '2,562 关注者' },
    { platform: 'osu!',   handle: '5h1iky',    href: 'https://osu.ppy.sh/users/39723694',   note: '有空可以一起玩' },
  ],

  // 页脚那行小字。{year} 会自动替换成当前年份。
  footerNote: '© {year} 5h1iky',
}

export const site = {
  title: '5h1iky · 作品集',
  description: '5h1iky 的个人作品集 —— Android 应用、osu! 谱面与冰与火之舞自制关卡。',
}
```

- `contacts.items[].platform` 决定前面那个小图标：
  含 `GitHub` 用 GitHub 图标，含 `B站` / `bilibili` 用音符，含 `osu` 用手柄，其它用外链图标
- `note` 右边那句说明，不想要就删掉这一项
- **`site.description` 是新增的**，会写进网页的 `<meta name="description">`，
  也就是把链接分享到聊天软件里时显示的那句摘要。不要就写 `''`
- `index.html` 里也有一份 `title` / `description`，那是给"没跑 JS 时"看的兜底，
  **运行时会以 `profile.js` 里的 `site` 为准**。想改记得两边一起改

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

### 改完想确认"真的没坏"

页面看着没问题，不代表交互没坏（比如搜索框、点图放大）。
项目里有一个脚本会**真的把页面点一遍**：

```powershell
npm run build
node tools\make-qa-page.mjs
npx vite preview --base /portfolio/     # 另开一个窗口跑
node tools\interaction-check.mjs http://localhost:4173/portfolio/qa.html
```

它会验证：搜索能筛、能清空、搜不到时有提示、排序点得动、点图能放大、`Esc` 能关、
**导航锚点都存在**、所有图片加载成功、页面没有 JS 报错。
最后打印"通过 7/7"这样的结论。**改过 `sections` 之后建议跑一次。**

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

## 怎么加一个可下载的文件

关卡包和大文件**不存在网站仓库里**，而是放在 GitHub Releases 上（这样网站本身很轻，clone 也快）。

**步骤**：

1. 上传文件到 release：https://github.com/5h1iky/portfolio/releases/tag/adofai-levels
2. 打开 `src/data/profile.js`，搜 `downloads`（第 ④ 块）
3. 在对应的 `items` 里加一行：

```js
{ name: '显示的名字', size: '10.3 MB', date: '2024-02-07', file: 'GitHub上的真实文件名.zip' },
```

字段一共五个，全都可以直接抄现有行：

| 字段 | 含义 | 必填吗 |
|---|---|---|
| `name` | 显示的名字（写中文没关系） | 必填 |
| `size` | 文件大小，**只是显示用**，写 `'10.3 MB'` 这种 | 必填 |
| `date` | 日期 `'YYYY-MM-DD'`，**只是显示用**，"最新"排序按它排 | 建议填 |
| `file` | 文件名，或完整网址 | 必填 |
| `note` | 右边一小串等宽备注，比如版本号 `'v0.8.1'` | 可选（新增的） |

> ⚠️ **`file` 必须写 GitHub 上的真实文件名，不是你电脑里的名字。**
>
> **GitHub 会自动改写上传的文件名**：空格变成点、去掉括号和感叹号。
> 实测例子：
>
> | 你电脑里的名字 | 传到 GitHub 后变成 |
> |---|---|
> | `miko skip.zip` | `miko.skip.zip` |
> | `Fractured Angel.zip` | `Fractured.Angel.zip` |
> | `TECHNOPOLIS 2085..zip` | `TECHNOPOLIS.2085.zip` |
> | `anybody can find love (except you.).zip` | `anybody.can.find.love.except.you.zip` |
> | **纯中文/日文名（如 `アイドル.zip`）** | **`default.zip`（名字全丢！）** |
>
> **最保险的做法：上传前先把文件名改成英文小写加连字符**，例如
> `usotsuki-macaron.zip`、`idol.zip`、`yuki-meri-kuri.zip`。
> 这样 GitHub 不会改写，链接永远不会失效。
> 页面上显示的名字照旧写中文（`name` 字段），不影响。

4. 保存 → 页面立刻生效，不用重启

**分组里的文件超过 5 个时，页面上会自动出现搜索框和排序按钮**（默认 / 最新 / 名称），
搜索会同时匹配名字、日期和备注。不用做任何配置，加够 6 行它就自己出来了。

**换托管平台**（比如改用蓝奏云）只需改 `downloads.releaseBase` 一行，
或者在每一项里把 `file` 写成完整网址（`http` 开头就原样使用，不拼前缀）。
**「Android 应用」那一组就是这么写的**——三个应用直接指向各自仓库的 Releases 页。

---

## ⚠️ 加内容时最容易踩的坑：整页被顶宽（手机上尤其明显）

**症状**：手机上页面能左右拖动、内容超出屏幕。电脑上看不出来，所以很容易漏掉。

**原因**：CSS 网格（grid）的每一项默认 `min-width: auto`，
意思是"**内容有多宽我就多宽，不肯收缩**"。
所以只要卡片里有一行放不下（比如"名字 + 日期 + 大小"三列挤在一起），
它就会把整页顶宽，而不是让文字用省略号截断。

**修法**：网格列写成 `grid-cols-[minmax(0,1fr)]`，**不要只写 `grid-cols-1`**。

```jsx
// ❌ 手机上会溢出
<div className="grid gap-2 sm:grid-cols-2">

// ✅ 不会溢出
<div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
```

同时给卡片本身加 `min-w-0`：

```jsx
const base = 'group flex min-w-0 items-center gap-3 rounded-md border px-4 py-3'
```

这个写法已经在 `DownloadGroup.jsx`、`Contact.jsx`、`Projects.jsx` 里用上了。
**你以后新加多列布局，记得照抄。**

**自查方法**：不用肉眼找，项目里有专门的脚本，它会直接告诉你**是谁把页面撑宽的**
（连带 class、`min-width`、`white-space` 一起打出来）：

```powershell
node tools\overflow-probe.mjs http://localhost:5173/ 412 900
```

也可以在浏览器控制台（F12）手动量：

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth
```

返回 `true` 就是溢出了，正常应该是 `false`。

---

## 几个要知道的小事

- **改了 `vite.config.js`（端口、忽略规则那些）需要重启服务器**才生效，
  改 `profile.js`、`index.css`、组件文件都不用重启。
- **作品截图要先跑压缩脚本再放进来**，见 [加作品截图（含先跑压缩脚本）](#加作品截图含先跑压缩脚本)。
  现在站内 15 张图合计 **0.51 MB**（压之前 3.40 MB）。
  自己手动缩的话目标也是**手机/手表图 640px 宽、`gallery\` 480px 宽**。
- **整页截图时，无头浏览器会截到空白区块**：区块是进入视口才淡入的。
  截图检查用 `dist/qa.html`（关掉入场动画的副本）：
  ```powershell
  npm run build
  node tools\make-qa-page.mjs
  npx vite preview --base /portfolio/
  ```
  然后看 http://localhost:4173/portfolio/qa.html
- **验证下载链接是否还有效**：在项目目录执行
  `node --use-system-ca tools\check-links.mjs`
  （`--use-system-ca` 不能省。这台机器有代理/VPN 做证书拦截，
  Node 自带的 CA 列表会报 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`。）
- **查 GitHub 上的数据用 `gh api`**，不要用浏览器或裸调 `api.github.com`：
  前者的配额是 5000 次/小时，后者匿名只有 60 次/小时。
  ```powershell
  gh api repos/5h1iky/Simple-Ai-Chat/releases/latest --jq '.tag_name'
  ```

---

## 检查有没有把 C 盘写满

```powershell
Get-PSDrive C | Select-Object Free
```

正常应该是 **13.4 GB 左右**。如果明显变少了，说明有东西写到 C 盘了。

---

## 想发布到网上

```powershell
git add -A
git commit -m "更新内容"
git push
```

等 1–2 分钟，https://5h1iky.github.io/portfolio/ 自动更新。
**不需要本地构建，也不需要登录 GitHub 网页。**

（完整流程、`git push` 失败怎么办，见 [DEPLOY.md](DEPLOY.md)。）
