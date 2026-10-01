/* 量出页面上每张缩略图的实际渲染状态：图片自然尺寸、容器尺寸、被裁掉多少。
 *
 * 用来排查"某张图看起来只显示了一半"这类问题 ——
 * 光看截图猜不出来，直接把浏览器算出来的数字打出来最快。
 *
 * 用法：node tools/inspect-shots.mjs [url]
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const URL_ = process.argv[2] || 'http://localhost:5173/'
const W = Number(process.argv[3] || 1440)
const PORT = 9900 + Math.floor(Math.random() * 90)
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
    `--user-data-dir=D:\\www\\_temp\\inspect`,
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
  const r = await cdp(ws, 'Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  })
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

const PROBE = `(async () => {
  // 把所有图滚进视口，确保懒加载的图真的有尺寸。
  // ⚠️ 要滚两遍：第一遍触发懒加载，第二遍才量得到 naturalWidth。
  //    只滚一遍 + 短等待时，后面的图还没加载完就被跳过，
  //    结果会误报成"没有被裁的图"（踩过：390 宽下只量到 6 张）。
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise(r => setTimeout(r, 130))
    }
  }
  window.scrollTo(0, 0)
  // 等到所有图都 complete，或者超时
  const t0 = Date.now()
  while (Date.now() - t0 < 8000) {
    const pending = [...document.images].filter(i => !i.complete)
    if (!pending.length) break
    await new Promise(r => setTimeout(r, 200))
  }
  await new Promise(r => setTimeout(r, 300))

  const out = []
  let skipped = 0
  for (const img of document.images) {
    const r = img.getBoundingClientRect()
    if (r.width < 4) continue
    const cs = getComputedStyle(img)
    const nw = img.naturalWidth, nh = img.naturalHeight
    // 还没加载出来的图跳过，但要记数，否则"0 张被裁"可能是假象
    if (!nw || !nh) {
      skipped++
      continue
    }
    const natRatio = nw / nh
    // object-cover 的裁剪量：
    //   图铺满盒子的宽时，需要的高度 = w / natRatio
    //   若这个高度 >= 盒子高，就是"按宽度铺满、上下被裁"，
    //   显示比例 = 盒子高 ÷ 铺满需要的高
    let fracShown = 1
    if (cs.objectFit === 'cover') {
      const needH = r.width / natRatio
      if (needH >= r.height) fracShown = r.height / needH
    }
    const bt = img.closest('button')
    out.push({
      src: img.getAttribute('src').split('/').slice(-1)[0],
      natural: nw + 'x' + nh,
      box: Math.round(r.width) + 'x' + Math.round(r.height),
      fit: cs.objectFit + ' / ' + cs.objectPosition,
      shown: (fracShown * 100).toFixed(0) + '%',
      cut: fracShown < 0.985,
      title: bt ? bt.title : '',
    })
  }
  return JSON.stringify({ rows: out, skipped })
})()`

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
    height: 900,
    deviceScaleFactor: 1,
    mobile: W < 700,
  })
  await cdp(ws, 'Page.navigate', { url: URL_ })
  await sleep(4500)

  const res = JSON.parse(await evaluate(ws, PROBE))
  const rows = res.rows
  console.log(`视口 ${W}  共 ${rows.length} 张已加载图片` + (res.skipped ? `（另有 ${res.skipped} 张未加载，已跳过）` : ''))
  console.log('')
  console.log(
    '文件'.padEnd(22) + '自然尺寸'.padEnd(12) + '显示盒'.padEnd(12) + 'fit'.padEnd(22) + '显示比例'.padEnd(10) + '被裁?',
  )
  console.log('-'.repeat(96))
  let cutCount = 0
  for (const r of rows) {
    if (r.cut) cutCount++
    console.log(
      r.src.padEnd(22) +
        r.natural.padEnd(12) +
        r.box.padEnd(12) +
        r.fit.padEnd(22) +
        r.shown.padEnd(10) +
        (r.cut ? '★ 是' : '否'),
    )
  }
  console.log(`\n被裁的图：${cutCount} 张`)

  ws.close()
} finally {
  child.kill()
}
