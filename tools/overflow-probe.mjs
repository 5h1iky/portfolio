/* 用 CDP 打开页面，找出「是谁把页面撑宽了」。
 *
 * 为什么需要这个：
 *   手机上出现横向滚动条时，光看截图只能知道"宽了"，
 *   不知道是哪个元素宽的。这个脚本直接问浏览器：
 *   文档 scrollWidth 是多少、哪些元素的右边缘超出了视口。
 *
 * 用法：
 *   node tools/overflow-probe.mjs <url> [viewportWidth] [viewportHeight]
 *
 * 原理：--remote-debugging-port 起一个 headless Edge，
 * 通过 /json/list 拿到调试目标，用 WebSocket 发 Runtime.evaluate。
 * 只用 Node 自带的 WebSocket（Node 22+），不装任何依赖。 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const URL_ = process.argv[2] || 'http://localhost:4173/portfolio/qa.html'
const W = Number(process.argv[3] || 412)
const H = Number(process.argv[4] || 900)
const PORT = 9333

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find(Boolean)

const child = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=D:\\www\\_temp\\cdpprof`,
    `--window-size=${W},${H}`,
    '--force-dark-mode',
    URL_,
  ],
  { stdio: 'ignore' },
)

/** 等到调试端口可用，返回 webSocketDebuggerUrl */
async function targetUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await r.json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page.webSocketDebuggerUrl
    } catch {
      /* 还没起来，继续等 */
    }
    await sleep(250)
  }
  throw new Error('调试端口没起来')
}

/** 发一条 CDP 命令并等回包 */
function cdp(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id !== id) return
      ws.removeEventListener('message', onMsg)
      if (m.error) reject(new Error(JSON.stringify(m.error)))
      else resolve(m.result)
    }
    ws.addEventListener('message', onMsg)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

const PROBE = `(() => {
  const vw = document.documentElement.clientWidth
  const out = {
    viewport: vw,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders: [],
  }
  const seen = new Set()
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) continue
    // 超出视口右边 1px 以上的都记下来
    if (r.right > vw + 1) {
      const cs = getComputedStyle(el)
      // 父元素已经超了就不重复报（只报最靠外的那一层）
      let p = el.parentElement, parentOver = false
      while (p && p !== document.body) {
        if (p.getBoundingClientRect().right > vw + 1) { parentOver = true; break }
        p = p.parentElement
      }
      if (parentOver) continue
      const key = el.tagName + '.' + (el.className || '')
      if (seen.has(key)) continue
      seen.add(key)
      out.offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 110),
        right: Math.round(r.right),
        width: Math.round(r.width),
        left: Math.round(r.left),
        display: cs.display,
        minWidth: cs.minWidth,
        whiteSpace: cs.whiteSpace,
        text: (el.textContent || '').trim().slice(0, 40),
      })
    }
  }
  return JSON.stringify(out)
})()`

try {
  const wsUrl = await targetUrl()
  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res)
    ws.addEventListener('error', rej)
  })

  await cdp(ws, 1, 'Runtime.enable')
  // 等 React 渲染完 + 兜底计时器跑完
  await sleep(4500)

  const res = await cdp(ws, 2, 'Runtime.evaluate', {
    expression: PROBE,
    returnByValue: true,
  })
  const data = JSON.parse(res.result.value)

  console.log(`视口宽度      : ${data.viewport}`)
  console.log(`文档 scrollWidth: ${data.docScrollWidth}  ${data.docScrollWidth > data.viewport ? '← 横向溢出了' : '（正常）'}`)
  console.log(`body scrollWidth: ${data.bodyScrollWidth}`)
  console.log(`\n撑宽页面的元素（最外层）共 ${data.offenders.length} 个：`)
  for (const o of data.offenders) {
    console.log(`  <${o.tag}> right=${o.right} width=${o.width} left=${o.left} display=${o.display} minW=${o.minWidth} ws=${o.whiteSpace}`)
    console.log(`      class: ${o.cls}`)
    if (o.text) console.log(`      text : ${o.text}`)
  }
  ws.close()
} finally {
  child.kill()
}
