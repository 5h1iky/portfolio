/* 生成 dist/qa.html —— 一个"关掉入场动画"的副本，只用于截图检查。
 *
 * 为什么要单独生成一份：
 *   页面上的区块是进入视口才淡入的（见 Reveal.jsx）。用无头浏览器整页截图时，
 *   视口外的区块可能还没触发动画，截出来是一片空白，看着像页面坏了。
 *   所以截图专用一份把初始状态直接置为终态的副本。
 *
 *   ⚠️ 这份文件只用于本地检查，不要提交、也不要在线上引用。
 *      dist 每次构建都会被清空，所以每次 build 之后要重新跑一次这个脚本。
 *
 * 用法：
 *   npm run build && node tools/make-qa-page.mjs
 *   然后打开 http://localhost:4173/portfolio/qa.html
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'dist', 'index.html')
const OUT = join(ROOT, 'dist', 'qa.html')

if (!existsSync(SRC)) {
  console.error('找不到 dist/index.html —— 先跑一次 npm run build')
  process.exit(1)
}

const STYLE = `<style id="qa-reveal-off">
      /* 仅用于截图检查：把入场动画的初始状态直接置为终态。线上的页面不带这一段。 */
      .rv, .stagger > * { opacity: 1 !important; transform: none !important; transition: none !important; }
      .rise { animation: none !important; opacity: 1 !important; }
    </style>
  </head>`

const html = readFileSync(SRC, 'utf8').replace('</head>', STYLE)
writeFileSync(OUT, html, 'utf8')
console.log(`已写出 ${OUT}`)
