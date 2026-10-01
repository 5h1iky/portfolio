/* 用 CDP 截取某个元素的精确区域。
 *
 * 为什么需要这个：
 *   想检查"某个按钮/某一行"长什么样时，靠估算 y 坐标裁整页截图很不可靠
 *   （我为此白裁了四五次，还裁错过项目卡片）。
 *   直接问浏览器要元素的 boundingBox，再按那个框截，一次就对。
 *
 * 用法：
 *   node tools/element-shot.mjs <url> <选择器> <输出.png> [宽] [高] [dark|light]
 *
 * 例：
 *   node tools/element-shot.mjs http://localhost:5173/ "#work article" shot.png
 */

import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const [, , URL_, SEL, OUT, W_ARG, H_ARG, SCHEME = 'dark'] = process.argv
if (!URL_ || !SEL || !OUT) {
  console.error('用法: node tools/element-shot.mjs <url> <选择器> <out.png> [宽] [高] [dark|light]')
  process.exit(1)
}
const W = Number(W_ARG || 1440)
const H = Number(H_ARG || 900)
const PAD = 16 // 元素框外留一点余量，好看清边界
const PORT = 9700 + Math.floor(Math.random() * 200)
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
    `--user-data-dir=D:\\www\\_temp\\elemshot`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

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

async function evaluate(ws, expr) {
  const r = await cdp(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true })
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails.exception))
  return r.result.value
}

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

try {
  const ws = new WebSocket(await target())
  await new Promise((res, rej) => {
    ws.addEventListener('open', res)
    ws.addEventListener('error', rej)
  })

  await cdp(ws, 'Page.enable')
  await cdp(ws, 'Runtime.enable')
  await cdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: W,
    height: H,
    deviceScaleFactor: 1,
    mobile: W < 700,
  })
  await cdp(ws, 'Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: SCHEME }],
  })
  await cdp(ws, 'Page.navigate', { url: URL_ })
  await sleep(4500)

  // 先把懒加载的图滚出来，否则元素高度会算小
  await evaluate(
    ws,
    `(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80))
      }
      window.scrollTo(0, 0)
    })()`,
  )
  await sleep(900)

  const box = await evaluate(
    ws,
    `(() => {
      const el = document.querySelector(${JSON.stringify(SEL)})
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: r.left + window.scrollX,
        y: r.top + window.scrollY,
        width: r.width,
        height: r.height,
        text: (el.textContent || '').trim().slice(0, 60),
      }
    })()`,
  )

  if (!box) {
    console.error(`找不到元素: ${SEL}`)
    process.exitCode = 1
  } else {
    console.log(`元素: <${SEL}>  ${Math.round(box.width)}x${Math.round(box.height)}`)
    console.log(`文本: ${box.text}`)

    const clip = {
      x: Math.max(0, box.x - PAD),
      y: Math.max(0, box.y - PAD),
      width: box.width + PAD * 2,
      height: box.height + PAD * 2,
      scale: 1,
    }
    const shot = await cdp(ws, 'Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip,
    })
    writeFileSync(OUT, Buffer.from(shot.data, 'base64'))
    console.log(`已写出 ${OUT}`)
  }
  ws.close()
} finally {
  child.kill()
}
