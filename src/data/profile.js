/* ============================================================================
   ★★★ 网站的全部内容都在这个文件里 ★★★

   你不是程序员也没关系。这个文件就是一份「填空题」：
   引号 " " 中间的字，直接改掉就行，改完保存，浏览器会自动刷新。

   三条规则，记住就不会出错：
     1. 只改引号里的字，别删引号、别删逗号、别删大括号 { }
     2. 每一条后面都要有英文逗号 ,  —— 最后一条可以不加
     3. 想临时藏起一块内容，把它的值改成空字符串 "" 或空数组 []，页面会自动不显示

   ── 目录 ──────────────────────────────────────────────────────────────
     ① sections   区块顺序 + 导航栏（改顺序/改名就改这里）
     ② hero       首屏：名字和一句话
     ③ projects   作品列表  ← 最常改的是这里
     ④ downloads  文件下载区
     ⑤ about      关于我
     ⑥ contacts   联系方式 + 页脚
     ⑦ site       浏览器标题

   ── 内容来源与核对日期：2026-10-01 ────────────────────────────────────
     本文件里的数字、版本号、链接都是当天从各平台实际抓取的。
     它们会过期，尤其下面这几项，更新方法写在对应位置：
       · 项目版本号 / release 大小  → GitHub 仓库的 Releases 页
       · osu! 数据                  → osu! 个人主页
       · B站 关注者                 → B站个人空间
   ============================================================================ */

/* ────────────────────────────────────────────────────────────────────────────
   ① 区块顺序 —— 导航栏是从这里自动生成的，不用另外改导航代码

     · 想调整区块顺序：把整行往上/下移
     · 想改名（导航上显示的字）：改 title
     · 想临时藏掉一个区块：把整行前面加 // 注释掉（导航里也会跟着消失）
     · nav 是导航栏上显示的短名，留空就退回去用 title
   ──────────────────────────────────────────────────────────────────────────── */
export const sections = [
  { id: 'top', type: 'hero', title: '首页', nav: '首页' },
  { id: 'work', type: 'projects', title: '作品', nav: '作品' },
  { id: 'downloads', type: 'downloads', title: '下载', nav: '下载' },
  { id: 'about', type: 'about', title: '关于', nav: '关于' },
  { id: 'contact', type: 'contact', title: '联系', nav: '联系' },
]

/* ────────────────────────────────────────────────────────────────────────────
   ② 首屏：名字和一句话介绍
   ──────────────────────────────────────────────────────────────────────────── */
export const hero = {
  // 你的名字 / 网名，显示成首屏最大的字
  name: '5h1iky',

  // 名字上面那行等宽小字，留空 "" 就不显示
  label: 'Android · 独立开发',

  // 两三句话的自我介绍。首页只显示第一句，剩下的在「关于」区展开。
  // ⚠️ 刻意写得很短很克制。想加长随时改，但别写成「我热爱编程」那类套话。
  intro:
    '写自己用得上的东西。主力是 Android 端的应用，也在 osu! 上做谱面、给冰与火之舞做自制关卡。',

  // 首屏右边的「最近在做」清单。不要这块就写 []
  // ⚠️ 每条都要是真的。写上去就等于对外承诺"我最近在做这个"。
  now: [
    { text: '腕上音符', note: 'v0.8.1', href: '#work' },
    { text: '腕能图库', note: 'v1.0.0', href: '#work' },
    { text: 'SAChat', note: 'v2.1.2', href: '#work' },
  ],

  // 首屏那两个按钮。不要按钮就写 []
  buttons: [
    { label: '看看作品', href: '#work', style: 'primary' },
    { label: '直接下载', href: '#downloads', style: 'ghost' },
  ],

  // 首屏底部的三格统计。数字必须是真的，来源写在 source 里，会显示在下方。
  // 不要这块就写 []。改完记得把 checked 改成今天。
  stats: [
    { label: '开源项目', value: '4', note: 'GitHub 公开仓库' },
    { label: '手表端应用', value: '2', note: '安卓手表' },
    { label: '自制关卡', value: '16', note: '冰与火之舞' },
  ],
  statsChecked: '2026-10-01',
}

/* ────────────────────────────────────────────────────────────────────────────
   ③ 作品列表  ← 加一个作品就复制一整段 { ... },

   最常改的几行：
     summary      一句话说清这是什么
     status       状态标签（如"持续维护"），不想要就写 ''
     meta         右边那张规格表，一行一条 { k: '项目名', v: '值' }
     highlights   亮点，一行一条
     links        相关链接按钮
     shots        截图。目录和比例都要写，见下面每个项目的注释

   ⚠️ 截图文件放在 public/screenshots/ 里。
      新加的图先用 tools/optimize-shots.py 压一遍再放进来，
      否则一张手机原图就有 1 MB，首屏会被拖慢（压缩方法见该脚本头部注释）。
   ──────────────────────────────────────────────────────────────────────────── */
export const projects = [
  {
    name: '腕上音符',
    subname: 'wanshang-yinfu',
    summary: '安卓手表上的轻量抖音客户端，刷视频、回私信，抬腕即达。',
    description:
      '给手表这种小屏设备重新做了一遍信息架构：单行页头、圆屏边距百分比可调、表冠滚动、界面缩放与字体大小独立调节，没有手势和按键的设备也能完整操作。技术上做得比较讲究——读取类请求走原生接口直连（App 内跑 JS 引擎算签名，零后端、快首屏、省电），写入类操作走 App 内的 WebView 引擎（交给官方页面 SDK 处理签名与风控），在"协议复刻风险"和"手表性能基线"之间取了个平衡。',
    status: '持续维护',
    tags: ['Java', 'Android', 'Wear OS', 'WebView', 'Rhino', 'GPL-3.0'],
    meta: [
      { k: '平台', v: 'Android 5.0+' },
      { k: '最新版本', v: 'v0.8.1' },
      { k: '安装包', v: '6.26 MB' },
      { k: '更新于', v: '2026-10-01' },
      { k: '协议', v: 'GPL-3.0' },
      { k: '实机', v: 'OPPO Watch 3' },
    ],
    links: [
      // note 是按钮下面那行小字（可省）。用来提示"这条链接什么时候用"。
      { label: '网盘下载', href: 'https://beifang1.lanzouu.com/iSvCK4alragj', note: '打不开 GitHub 就用这个' },
      { label: 'GitHub 仓库', href: 'https://github.com/5h1iky/wanshang-yinfu' },
      { label: '下载 APK', href: 'https://github.com/5h1iky/wanshang-yinfu/releases' },
    ],
    highlights: [
      '刷视频：上下滑切换、预加载缓冲、H.264 / 540p 省流选档',
      '全屏播放：双指缩放 1x–5x、放大后单指拖动、手动旋转',
      '私信：会话列表、文字收发、4 个槽位可自编的快捷回复',
      '手表适配：圆屏边距百分比可调、表冠滚动、无按键设备完整可用',
      '会话只存本机，无广告、无统计 SDK、不上传任何账号信息',
    ],
    // 372×430 的手表实机截图，比例约 0.865。
    // ⚠️ 03 是全屏播放页，它是**横屏**（430×372），跟同组其它图方向相反，
    //    所以要单独写 ratio，否则会被按竖屏的比例裁掉四分之一。
    shots: {
      dir: 'screenshots/wanshang',
      ratio: '372 / 430',
      items: [
        { file: '01-main.jpg', alt: '主屏：刷视频 / 聊天 / 我的 / 设置' },
        { file: '02-feed.jpg', alt: '刷视频页面' },
        { file: '03-fullscreen.jpg', alt: '全屏播放与手势', ratio: '430 / 372' },
        { file: '04-chat-list.jpg', alt: '私信会话列表' },
        { file: '05-chat.jpg', alt: '聊天页与快捷回复' },
        { file: '06-margin-panel.jpg', alt: '圆屏边距调节面板' },
      ],
    },
  },

  {
    name: '腕能图库',
    subname: 'wristable-gallery',
    summary: '安卓手表上的看图看视频应用，附带同 WiFi 网页互传与文件浏览器。',
    description:
      '手表屏幕小、性能弱，所以这个应用在"能用"和"轻"之间反复取舍：UI 用传统 View + XML 而不是 Compose，省内存、启动快；整包纯字节码、不含任何 .so 原生库，32 位和 64 位手表都能装；圆屏方屏双兼容，圆屏会自动把安全区往里收。最实用的是互传——手表开一个 HTTP 服务，手机或电脑在同一个 WiFi 下用浏览器打开就能拖拽上传下载，不用装任何客户端。',
    status: '已发布',
    tags: ['Kotlin', 'Android', 'Wear OS', 'HTTP 服务', 'MIT'],
    meta: [
      { k: '平台', v: 'Android 7.0+' },
      { k: '最新版本', v: 'v1.0.0' },
      { k: '安装包', v: '2.44 MB' },
      { k: '更新于', v: '2026-09-24' },
      { k: '协议', v: 'MIT' },
      { k: '原生库', v: '无（纯字节码）' },
    ],
    links: [
      { label: 'GitHub 仓库', href: 'https://github.com/5h1iky/wristable-gallery' },
      { label: '下载 APK', href: 'https://github.com/5h1iky/wristable-gallery/releases' },
    ],
    highlights: [
      '相册：按日期分组的 3 列网格，今天 / 昨天 / 本周 / 本月 / 更早',
      '图片查看器：双指无极缩放、双击放大、左右翻页、下拉退出',
      '视频播放器：无极缩放、90° 步进旋转、音量亮度手势、续播记忆',
      'WiFi 互传：手表开 HTTP 服务，浏览器拖拽上传下载，二维码配对',
      '文件浏览器：/sdcard 目录树、任意后缀打开、删除重命名详情',
    ],
    // 1:1 圆屏，截图本身是 480×1017 的长图，按 0.47 展示。
    //
    // ⚠️ crop 是「缩略图**保留上面**多少比例」（0~1），用来裁掉截图底部的纯黑空白。
    //    不写 crop = 完整显示，什么都不裁。
    //    配错会切掉真内容（这里的公式错过一次：容器宽高比要写
    //    图片比例 ÷ crop，不是 1 ÷ crop，详见 Screenshots.jsx 的注释）。
    //    定这个值之前先肉眼看图，别只信亮度统计 ——
    //    表格里那种深灰色小字会被亮度阈值漏掉（settings / about 就差点被误裁）。
    //
    // ⚠️ ratio 是「这张图自己的宽高比」，只有跟同组其它图不一样时才需要写。
    //    点开看大图时永远是完整原图，crop 不影响大图。
    shots: {
      dir: 'screenshots/gallery',
      ratio: '480 / 1017',
      items: [
        { file: 'home.jpg', alt: '首页：相册 / 视频 / 文件 / 互传' },
        // 内容到 61% 左右（「停止服务」按钮），底下 39% 是纯黑，裁掉
        { file: 'transfer.jpg', alt: 'WiFi 互传：二维码配对', crop: 0.78 },
        { file: 'files.jpg', alt: '文件浏览器' },
        // settings / about 底部一直有内容（最后一行是「关于腕能图库」），不裁
        { file: 'settings.jpg', alt: '设置：UI 缩放与四色主题' },
        { file: 'about.jpg', alt: '关于页' },
      ],
    },
  },

  {
    name: 'SAChat',
    subname: 'Simple-Ai-Chat',
    summary: '一个轻量、开源、纯本地的 Android AI 聊天应用。',
    description:
      '支持自定义 API Key 接入任意 OpenAI 兼容接口，也内置了免费模型，不需要密钥就能直接开始对话。功能上做得比较深：结构化角色卡有 27 个字段，世界设定对标 SillyTavern（整词匹配、正则触发、次级关键词 AND/ANY/NOT、触发概率、token 预算），还能直接导入导出酒馆生态的 JSON 和 TavernV2V3 PNG 角色卡。数据全部存在本机，不上传任何服务器。v2.1.2 把附件上传改成标准做法（文件作为独立内容块发送，不再被拼进消息正文），免费模型列表也改成动态获取，提供商下架模型后不会再显示已经失效的选项。',
    status: '持续维护',
    tags: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Android', 'MIT'],
    meta: [
      { k: '平台', v: 'Android 7.0+' },
      { k: '最新版本', v: 'v2.1.2' },
      { k: '安装包', v: '14.92 MB' },
      { k: '更新于', v: '2026-09-12' },
      { k: '协议', v: 'MIT' },
      { k: '界面语言', v: '中文 / English' },
    ],
    links: [
      { label: 'GitHub 仓库', href: 'https://github.com/5h1iky/Simple-Ai-Chat' },
      { label: '下载 APK', href: 'https://github.com/5h1iky/Simple-Ai-Chat/releases' },
    ],
    highlights: [
      '自定义 API：同时保存多条 API 配置，随时切换',
      '角色扮演：结构化角色卡 27 个字段，含记忆封存',
      '世界设定：关键词触发的世界书系统，对标 SillyTavern',
      '酒馆兼容：导入导出 JSON 与 TavernV2V3 PNG 角色卡',
      '文字冒险：多张角色卡 + 世界书，开一局 AI 跑团',
      '完全本地：所有数据存在设备上，不经过服务器',
    ],
    // 1440×3200 的手机截图，比例约 0.45
    shots: {
      dir: 'screenshots',
      ratio: '640 / 1422',
      items: [
        { file: 'chat-detail.jpg', alt: '对话界面' },
        { file: 'chat-empty.jpg', alt: '新建对话' },
        { file: 'worldbook.jpg', alt: '世界书管理' },
        { file: 'settings.jpg', alt: '设置页' },
      ],
    },
  },

  {
    name: 'osu! 谱面',
    subname: 'beatmapping',
    summary: '两张 osu! 谱面，从选曲到每个难度都是自己做的。',
    // ⚠️ 这一段的数字是 2026-10-01 从谱面页面实测的（脚本：tools/parse-osu-beatmap.py）。
    // 旧的"5 个难度 / 10 个难度"是错的 —— 那两页会同时嵌入 mania/taiko 的预览难度，
    // 直接数页面上的难度会被重复计数，实际是 3 和 5。
    description:
      '两张都是 mapper 兼上传者，每张的每个难度也都是自己做的，没有找别人做 guest 难度。月が綺麗ね那首除标准模式外还做了一版 4K 的 mania 难度。',
    status: '制作中',
    tags: ['osu!', '谱面设计', 'osu!mania'],
    meta: [
      { k: '谱面数', v: '2' },
      { k: '难度合计', v: '8' },
      { k: '最高难度', v: '6.67★' },
      { k: '平台', v: 'osu.ppy.sh' },
    ],
    links: [
      { label: '月が綺麗ねと言われたい！', href: 'https://osu.ppy.sh/beatmapsets/2609977' },
      { label: 'Ravings', href: 'https://osu.ppy.sh/beatmapsets/2584217' },
    ],
    highlights: [
      '月が綺麗ねと言われたい！：3 个难度（含 4K mania）· BPM 160 · 147 秒',
      'Ravings：5 个难度（normal → Extra 6.67★）· BPM 135 · 114 秒',
      '两张的每个难度都是本人制作，没有 guest 难度',
      'Ravings 是崩坏：星穹铁道曲目，已被游玩 355 次',
    ],
    shots: null,
  },

  {
    name: '冰与火之舞关卡',
    subname: 'ADOFAI',
    summary: '16 个自制关卡，2023 - 2026 年陆续制作。',
    description: '',
    status: '',
    tags: ['冰与火之舞', '关卡设计', '节奏对时'],
    meta: [
      { k: '关卡数', v: '16' },
      { k: '时间跨度', v: '2023 - 2026' },
      { k: '单包大小', v: '< 100 MB' },
    ],
    links: [
      // 这一条跳到下载区，方便直接下载
      { label: '全部关卡下载', href: '#downloads' },
    ],
    highlights: [
      '共 16 个关卡，每个包含关卡文件、音频与图片素材',
      '曲目包括 アイドル、ラビットホール、うそつきマカロン 等',
      '2024 年 2 月到 4 月间完成 11 个',
      '每个包都在 100 MB 以内，逐一打包上传',
    ],
    shots: null,
  },
]

/* ────────────────────────────────────────────────────────────────────────────
   ④ 文件下载区

   这里的链接指向 GitHub Releases（文件不在网站仓库里，所以网站很轻）。
   换成别的网盘链接也可以，把 href 改掉即可。
   ──────────────────────────────────────────────────────────────────────────── */
export const downloads = {
  title: '下载',

  // 上面的说明文字，留空 "" 就不显示
  note: '关卡包解压后放进冰与火之舞的关卡目录即可使用。列表可以搜索和排序。',

  // 每组下载。想加一组就复制一整段 { ... },
  groups: [
    {
      // 分组名（显示成小标题）
      group: '冰与火之舞 · 自制关卡',

      // 分组说明
      desc: '16 个关卡，2023 - 2026 年制作。每个包里含关卡文件、音频和图片素材。',

      // ⚠️ 加新关卡时注意：
      // file 要写「GitHub 上的真实文件名」，不是电脑里的文件名。
      // GitHub 会自动改写上传的文件名（空格变点、去掉括号等），
      // 所以最保险的做法是：上传时就用英文小写加连字符命名，例如 my-level.zip
      items: [
        { name: 'snooze', size: '90.3 MB', date: '2024-02-07', file: 'snooze.zip' },
        { name: 'track', size: '49.3 MB', date: '2024-02-16', file: 'track.zip' },
        { name: '今年も「雪降り、メリクリ」目指して頑張ります！！', size: '38.7 MB', date: '2024-04-05', file: 'yuki-meri-kuri.zip' },
        { name: '说谎的马卡龙', size: '33.8 MB', date: '2026-02-14', file: 'usotsuki-macaron.zip' },
        { name: 'アイドル', size: '15.8 MB', date: '2023-08-03', file: 'idol.zip' },
        { name: 'K.Moe', size: '14.2 MB', date: '2024-02-17', file: 'K.Moe.zip' },
        { name: 'lorelei', size: '13.8 MB', date: '2023-07-20', file: 'lorelei.zip' },
        { name: 'freys', size: '12.0 MB', date: '2023-10-15', file: 'freys.zip' },
        { name: 'Fractured Angel', size: '11.6 MB', date: '2024-02-16', file: 'Fractured.Angel.zip' },
        { name: 'miko skip', size: '10.3 MB', date: '2024-02-16', file: 'miko.skip.zip' },
        { name: 'rabbit', size: '9.7 MB', date: '2024-03-23', file: 'rabbit.zip' },
        { name: 'TECHNOPOLIS 2085', size: '8.8 MB', date: '2024-02-17', file: 'TECHNOPOLIS.2085.zip' },
        { name: '520am', size: '7.4 MB', date: '2024-04-05', file: '520am.zip' },
        { name: 'anybody can find love (except you.)', size: '6.9 MB', date: '2023-11-26', file: 'anybody.can.find.love.except.you.zip' },
        { name: 'lozy', size: '3.5 MB', date: '2024-04-05', file: 'lozy.zip' },
        { name: 'muspelheim', size: '2.7 MB', date: '2023-07-07', file: 'muspelheim.zip' },
      ],
      topics: [
        'アイドル（YOASOBI）',
        'ラビットホール（DECO*27）',
        'うそつきマカロン（暴飲暴食P feat. 重音テト）',
        'Miko Skip（Kirara Magic）',
        'TECHNOPOLIS 2085（PRASTIK DANCEFLOOR）',
        'K.Moe（ZxNX）',
        "Frey's Philosophy（Powerless）",
      ],
    },
    {
      group: 'Android 应用',
      desc: '安装包走 GitHub Releases，方便回看历史版本。',
      items: [
        {
          name: '腕上音符',
          size: '6.26 MB',
          date: '2026-10-01',
          note: 'v0.8.1',
          file: 'https://github.com/5h1iky/wanshang-yinfu/releases',
        },
        {
          name: '腕能图库',
          size: '2.44 MB',
          date: '2026-09-24',
          note: 'v1.0.0',
          file: 'https://github.com/5h1iky/wristable-gallery/releases',
        },
        {
          name: 'SAChat',
          size: '14.92 MB',
          date: '2026-09-12',
          note: 'v2.1.2',
          file: 'https://github.com/5h1iky/Simple-Ai-Chat/releases',
        },
      ],
    },
  ],

  // 关卡包的下载地址前缀。
  // 想在别的平台托管就改这一行，其余不用动。
  releaseBase: 'https://github.com/5h1iky/portfolio/releases/download/adofai-levels',

  // 下载区底部说明
  footer: '全部文件托管在 GitHub Releases，下载不限速、不需要登录。',
}

/* ────────────────────────────────────────────────────────────────────────────
   ⑤ 关于我
   ──────────────────────────────────────────────────────────────────────────── */
export const about = {
  title: '关于',

  // 正文段落，一段一个字符串
  paragraphs: [
    '主要是自己用得到什么就写什么。做出来的东西自己天天在用，所以会比较在意细节和手感——比如手表上那个圆屏边距，就是因为默认边距会切到内容才做成了可调的。',
    '近一年主要在做 Android 端的东西，桌面端和手表端都有。除了写代码，平时玩 osu! 和冰与火之舞比较多，osu! 上做谱面，冰与火之舞上做自制关卡，都是从选曲开始自己一点点对出来的。',
  ],

  // ⚠️ 这段是真实抓取的快照，会随时间变化。
  // 更新方法：打开 osu! 主页抄一遍新数字，并把 checked 改成新日期。
  // 不想显示这块，把下面 enabled 改成 false 即可。
  osuStats: {
    enabled: true,
    checked: '2026-10-01',
    handle: '5h1iky',
    href: 'https://osu.ppy.sh/users/39723694',
    items: [
      { label: '全球排名', value: '#455,938' },
      { label: 'pp', value: '2,182' },
      { label: '准确率', value: '90.51%' },
      { label: '游玩次数', value: '2,372' },
      { label: '等级', value: '68' },
      { label: '入坑', value: '2026-05-04' },
    ],
  },

  // 技能标签。不需要就写 []
  skills: [
    'Kotlin',
    'Java',
    'Jetpack Compose',
    'Android',
    'Wear OS',
    'WebView 混合',
    'API 接入',
    '本地数据存储',
    '界面设计',
    '谱面设计',
  ],
}

/* ────────────────────────────────────────────────────────────────────────────
   ⑥ 联系方式 + 页脚
   ──────────────────────────────────────────────────────────────────────────── */
export const contacts = {
  title: '联系方式',

  // 加一个平台就多一条
  // ⚠️ GitHub 和 B站 的昵称不一样（5h1iky / 明日awo），这是真的，
  //    所以两条都保留了平台原名，不要为了"统一"改成同一个。
  items: [
    {
      platform: 'GitHub',
      handle: '5h1iky',
      href: 'https://github.com/5h1iky',
      note: '代码都在这',
    },
    {
      platform: 'B站',
      handle: '明日awo',
      href: 'https://space.bilibili.com/432122433',
      note: '2,562 关注者',
    },
    {
      platform: 'osu!',
      handle: '5h1iky',
      href: 'https://osu.ppy.sh/users/39723694',
      note: '有空可以一起玩',
    },
  ],

  // 页脚那行小字。{year} 会自动替换成当前年份。
  footerNote: '© {year} 5h1iky',
}

/* ────────────────────────────────────────────────────────────────────────────
   ⑦ 网站标题（浏览器标签页上显示的字）
   ──────────────────────────────────────────────────────────────────────────── */
export const site = {
  title: '5h1iky · 作品集',
  description: '5h1iky 的个人作品集 —— Android 应用、osu! 谱面与冰与火之舞自制关卡。',
}
