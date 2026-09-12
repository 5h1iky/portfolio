# 个人作品集网站 — portfolio

> 项目位置：`D:\www\portfolio`
> 创建时间：2026-09-12
> 当前状态：**首版已完成，本地可运行（`http://localhost:5173`）**

---

## 这是什么

一个静态的个人作品集网站，用于展示制作者的项目作品。

**网站已经能跑了。** 现在改文字、加作品都不需要懂 React——
所有内容集中在 `src/data/profile.js` 一个文件里，改法见 **[docs/EDITING.md](docs/EDITING.md)**。

---

## 先读哪个文件

| 文件 | 作用 | 什么时候看 |
|---|---|---|
| **[docs/EDITING.md](docs/EDITING.md)** | **怎么改内容、怎么加作品** | **想改网站内容时看这个** |
| **[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)** | 需求：要做什么、已拍板的决定 | 想知道"为什么这样设计"时看 |
| **[docs/TECH_PLAN.md](docs/TECH_PLAN.md)** | 方案：技术选型、环境现状、部署选项 | 准备部署时看 |
| **[docs/HANDOFF.md](docs/HANDOFF.md)** | 交接：新会话怎么快速接手 | 新开工作区时看 |

---

## 怎么跑起来

```powershell
cd D:\www\portfolio
.\dev.ps1
```

然后浏览器打开 **http://localhost:5173**

> ⚠️ **必须用 `.\dev.ps1`，不要直接敲 `npm run dev`**——
> 脚本会把临时目录重定向到 D 盘，保护你只剩 13 GB 的 C 盘。

---

## 一句话方案

**Vite + React + Tailwind CSS，纯静态站点。**

理由：目标是"后期方便改动"，所以内容抽成一个数据文件，改内容不用碰代码。

**技术栈实际版本**：Vite 7.3.6 · React 19.3.0 · Tailwind CSS 4.3.3

---

## 当前已知的核心需求

1. **作品只有一个**：`Simple-Ai-Chat` (SAChat)，安卓 AI 聊天应用。
2. **网站内容还没想好**：不要为了填版面编造内容，先搭好架子，内容慢慢补。
3. **最高优先级：方便后期改动**。
4. **工程全部放在 D 盘，C 盘不能变少**（C 盘仅剩 13.3 GB）。

## 已拍板的设计方向（2026-09-12）

- **风格**：跟随 SAChat 的 Material 风格（圆角卡片 + Material 3 间距）
- **配色**：紫蓝渐变（⚠️ 这是 SAChat 之外的新配色，App 本身是青色系，详见需求 3.1）
- **称呼**：只用网名 `5h1iky`，**不要头像**
- **语言**：纯中文
- **深色模式**：跟随系统
- **联系方式**：GitHub + B站 + osu!（地址见需求 3.2）
- **不做博客**，但数据文件预留空数组

---

## 网站结构

```
D:\www\portfolio\
├─ dev.ps1                ★ 启动脚本（重定向 TEMP 到 D 盘）
├─ .npmrc                 缓存固定在 D 盘
├─ src\
│  ├─ data\profile.js     ★★★ 改内容只碰这个文件
│  ├─ index.css           ★ 改颜色/圆角只碰这个文件
│  ├─ App.jsx             区块顺序（调整顺序改这里）
│  └─ components\         Hero / Nav / Projects / ProjectCard
│                         / Screenshots / About / Contact / Section / Icon
├─ public\screenshots\    SAChat 截图（4 张）
└─ docs\                  文档
```

**整体无外部依赖请求**：不加载网络字体、不引用外部图片、图标全是内联 SVG。

---

## 下一步

首版已完成并通过实测。接下来可以做：

1. **看实物提意见** —— 打开 http://localhost:5173，觉得哪里不对就说
2. **补内容** —— 改 `src/data/profile.js`（改法见 `docs/EDITING.md`）
3. **决定 B站/osu! 两个昵称怎么统一显示**（现在各按平台原名：「明日awo」/「5h1iky」）
4. **满意后再讨论部署** —— 方案见 `TECH_PLAN.md` 第 5 节

**不需要再问的问题**：需求第 3 节的 10 项已全部拍板。
