/* 用 CDP 精确截图：可控视口宽度、可整页、可深/浅色。
 *
 * 为什么不用 Edge 的 --screenshot？
 *   那个开关的 --window-size 指的是**窗口**尺寸，包含窗口边框和标题栏，
 *   实际视口会比它窄。实测给 412 时真实视口是 482，
 *   于是截出来的图右边被切掉一截，看起来像"页面横向溢出了"，
 *   但页面其实完全正常 —— 纯粹是截图工具的口径问题。
 *
 *   这个脚本用 Emulation.setDeviceMetricsOverride 直接把视口定死，
 *   所以量到的宽度就是真实的布局宽度。
 *
 * 用法：
 *   node tools/screenshot.mjs <url> <输出.png> [宽] [高] [dark|light] [--full]
 *
 * 例子：
 *   node tools/screenshot.mjs http://localhost:4173/portfolio/ stable.png 1440 900 dark
 *   node tools/screenshot.mjs http://localhost:4173/portfolio/qa.html full.png 390 900 dark --full
 *
 * 只依赖 Node 自带的 WebSocket / fetch（Node 22+），不装任何依赖。 */

import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const [, , URL_, OUT, W_ARG, H_ARG, SCHEME = 'dark', ...rest] = process.argv
if (!URL_ || !OUT) {
  console.error('用法: node tools/screenshot.mjs <url> <out.png> [宽] [高] [dark|light] [--full]')
  process.exit(1)
}
const W = Number(W_ARG || 1440)
const H = Number(H_ARG || 900)
const FULL = rest.includes('--full')
const PORT = 9334 + Math.floor(Math.random() * 200)

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const child = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=D:\\www\\_temp\\shotprof`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

async function target() {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const p = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (p) return p.webSocketDebuggerUrl
    } catch {
      /* 继续等 */
    }
    await sleep(250)
  }
  throw new Error('调试端口没起来')
}

let nextId = 1
function cdp(ws, method, params = {}) {
  const id = nextId++
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id !== id) return
      ws.removeEventListener('message', onMsg)
      if (m.error) reject(new Error(method + ': ' + JSON.stringify(m.error)))
      else resolve(m.result)
    }
    ws.addEventListener('message', onMsg)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

try {
  const ws = new WebSocket(await target())
  await new Promise((res, rej) => {
    ws.addEventListener('open', res)
    ws.addEventListener('error', rej)
  })

  await cdp(ws, 'Page.enable')
  await cdp(ws, 'Runtime.enable')
  // 关键：把视口定死，而不是靠窗口尺寸
  await cdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: W,
    height: H,
    deviceScaleFactor: 1,
    mobile: W < 700,
  })
  // 深/浅色由 prefers-color-scheme 驱动（index.html 的脚本据此挂 .dark）
  await cdp(ws, 'Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: SCHEME }],
  })

  await cdp(ws, 'Page.navigate', { url: URL_ })
  await sleep(5000) // 等 React 渲染 + Reveal 的兜底计时器

  // ⚠️ 整页截图前必须先滚一遍。
  //    页面里的截图是 loading="lazy" 的：浏览器的懒加载按"是否进入视口"触发，
  //    而 captureBeyondViewport 是一次性把整页画出来，**不会**触发懒加载。
  //    不滚的话，首屏以下的图全是空框，看着像图挂了。（踩过一次）
  const metrics = await cdp(ws, 'Page.getLayoutMetrics')
  const total = Math.ceil(metrics.cssContentSize.height)
  const step = Math.max(200, H - 100)
  for (let y = 0; y < total; y += step) {
    await cdp(ws, 'Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` })
    await sleep(320)
  }
  await cdp(ws, 'Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' })
  // ⚠️ 滚回顶部后要多等一会：平滑滚动（scroll-behavior: smooth）是异步的，
  //    立刻截图会截到还在半路的位置 —— 首屏截图变成"作品区"就是这么来的。
  await sleep(1500)
  await cdp(ws, 'Runtime.evaluate', {
    expression: 'window.scrollTo({ top: 0, behavior: "instant" })',
  })
  await sleep(500)

  if (FULL) console.log(`整页高度: ${total}px`)

  let clip
  if (FULL) {
    clip = { x: 0, y: 0, width: W, height: total, scale: 1 }
  }

  const shot = await cdp(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: FULL,
    ...(clip ? { clip } : {}),
  })
  writeFileSync(OUT, Buffer.from(shot.data, 'base64'))
  console.log(`已写出 ${OUT}  (视口 ${W}x${H}, ${SCHEME}${FULL ? ', 整页' : ''})`)
  ws.close()
} finally {
  child.kill()
}
