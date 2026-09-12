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
     ② hero       顶部：名字和一句话
     ③ projects   作品列表
     ④ downloads  文件下载区
     ⑤ about      关于我
     ⑥ contacts   联系方式 + 页脚
     ⑦ site       浏览器标题
     ⑧ posts      文章区（暂时空着）
   ============================================================================ */

/* ────────────────────────────────────────────────────────────────────────────
   ① 区块顺序 —— 导航栏是从这里自动生成的，不用另外改导航代码

     · 想调整区块顺序：把整行往上/下移
     · 想改名（导航上显示的字）：改 title
     · 想临时藏掉一个区块：把整行前面加 // 注释掉（导航里也会跟着消失）
   ──────────────────────────────────────────────────────────────────────────── */
export const sections = [
  { id: 'top', type: 'hero', title: '首页' },
  { id: 'projects', type: 'projects', title: '作品' },
  { id: 'downloads', type: 'downloads', title: '下载' },
  { id: 'about', type: 'about', title: '关于' },
  { id: 'contact', type: 'contact', title: '联系' },
]

/* ────────────────────────────────────────────────────────────────────────────
   ② 网站顶部：名字和一句话介绍
   ──────────────────────────────────────────────────────────────────────────── */
export const hero = {
  // 你的名字 / 网名，显示成紫蓝渐变大字
  name: '5h1iky',

  // 名字上面那行小字，留空 "" 就不显示
  tagline: '写点自己用的东西',

  // 一两句话的自我介绍
  // ⚠️ 刻意写得很短很克制。想加长随时改，但别写成「我热爱编程」那类套话。
  intro: '主要在做 Android 端的应用，也在 osu! 上做谱面、给冰与火之舞做自制关卡。',

  // 顶部那两个按钮。不要按钮就写 []
  buttons: [
    { label: '看看作品', href: '#projects', style: 'primary' },
    { label: '直接下载', href: '#downloads', style: 'ghost' },
  ],
}

/* ────────────────────────────────────────────────────────────────────────────
   ③ 作品列表 —— 加一个作品就复制一整段 { ... },

   最常改的几行：
     summary      一句话说清这是什么
     highlights   亮点，一行一条
     links        相关链接按钮
     screenshots  截图（图片放 public/screenshots/），不要就写 []
   ──────────────────────────────────────────────────────────────────────────── */
export const projects = [
  {
    name: 'SAChat',
    subname: 'Simple-Ai-Chat',
    summary: '一个轻量、开源、纯本地的 Android AI 聊天应用。',
    description:
      '支持自定义 API Key 接入任意 OpenAI 兼容接口，也内置了免费模型，不需要密钥就能直接开始对话。功能上做了角色扮演、世界设定、文字冒险这些偏进阶的玩法，数据全部存在本机，不上传任何服务器。',
    tags: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Android'],
    version: 'v2.1.1',
    license: 'MIT',
    links: [
      { label: 'GitHub 仓库', href: 'https://github.com/5h1iky/Simple-Ai-Chat' },
      { label: '下载 APK', href: 'https://github.com/5h1iky/Simple-Ai-Chat/releases' },
    ],
    highlights: [
      '自定义 API：同时保存多条 API 配置，随时切换',
      '角色扮演：角色卡、性格、开场白、示例对话都能自己写',
      '世界设定：关键词触发的世界书系统，对标 SillyTavern',
      '文字冒险：多张角色卡 + 世界书，开一局 AI 跑团',
      '完全本地：所有数据存在设备上，不经过服务器',
    ],
    screenshots: [
      { src: 'screenshots/chat-detail.jpg', alt: '对话界面' },
      { src: 'screenshots/chat-empty.jpg', alt: '新建对话' },
      { src: 'screenshots/worldbook.jpg', alt: '世界书管理' },
      { src: 'screenshots/settings.jpg', alt: '设置页' },
    ],
  },

  {
    name: 'osu! 谱面',
    subname: 'beatmapping',
    summary: '两张 osu! 谱面，已在 osu! 官网可玩。',
    // 备注：这里刻意不写"怎么做的"，因为那属于猜测。
    // 想补上真实过程（选曲是不是自己定的、花了多久、有没有人帮忙）随时加。
    description: '',
    tags: ['osu!', '谱面设计'],
    version: '',
    license: '',
    links: [
      { label: '月が綺麗ねと言われたい！', href: 'https://osu.ppy.sh/beatmapsets/2609977' },
      { label: 'Ravings', href: 'https://osu.ppy.sh/beatmapsets/2584217' },
    ],
    highlights: [
      '月が綺麗ねと言われたい！：5 个难度 · BPM 160',
      'Ravings：10 个难度 · BPM 135',
    ],
    screenshots: [],
  },

  {
    name: '冰与火之舞关卡',
    subname: 'ADOFAI',
    summary: '16 个自制关卡，2023 - 2026 年陆续制作。',
    description: '',
    tags: ['冰与火之舞', '关卡设计', '节奏对时'],
    version: '',
    license: '',
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
    screenshots: [],
  },
]

/* ────────────────────────────────────────────────────────────────────────────
   ④ 文件下载区 —— 加一个下载就复制一整段 { ... },

   这里的链接指向 GitHub Releases（文件不在网站仓库里，所以网站很轻）。
   换成别的网盘链接也可以，把 href 改掉即可。
   ──────────────────────────────────────────────────────────────────────────── */
export const downloads = {
  title: '下载',

  // 上面的说明文字，留空 "" 就不显示
  note: '关卡包解压后放进冰与火之舞的关卡目录即可使用。',

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
          name: 'SAChat v2.1.1',
          size: '约 15 MB',
          // 这一项用完整网址（文件不放在本站的 release 里）
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
    '主要是自己用得到什么就写什么，做出来的东西自己天天在用，所以会比较在意细节和手感。',
    '除了写代码，平时玩 osu! 和冰与火之舞比较多。osu! 上做谱面，冰与火之舞上做自制关卡，都是从选曲开始自己一点点对出来的。',
  ],

  // ⚠️ 这段是真实抓取的快照，会随时间变化。
  // 更新方法：打开 osu! 主页抄一遍新数字，并把 updated 改成新日期。
  // 不想显示这块，把下面 enabled 改成 false 即可。
  osuStats: {
    enabled: true,
    updated: '2026-09-12',
    items: [
      { label: '全球排名', value: '#449,076' },
      { label: 'pp', value: '2,170' },
      { label: '准确率', value: '90.43%' },
      { label: '游玩次数', value: '2,336' },
    ],
  },

  // 技能标签。不需要就写 []
  skills: [
    'Kotlin',
    'Jetpack Compose',
    'Android',
    'API 接入',
    '本地数据存储',
    '界面设计',
    '谱面设计',
  ],
}

/* ────────────────────────────────────────────────────────────────────────────
   ⑥ 联系方式
   ──────────────────────────────────────────────────────────────────────────── */
export const contacts = {
  title: '联系方式',

  // 加一个平台就多一张卡片
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
      note: '2,559 关注者',
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
}

/* ────────────────────────────────────────────────────────────────────────────
   ⑧ 文章区（暂时没做，先占个位置）

   以后想加文章就在这里按格式填，再把 sections 里的 posts 那行打开。
   ──────────────────────────────────────────────────────────────────────────── */
export const posts = [
  // { title: '文章标题', date: '2026-09-12', href: 'https://...' },
]
