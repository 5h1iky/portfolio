/* 实测滚动的帧率，用来判断背景氛围层有没有拖慢页面。
 *
 * 为什么需要：
 *   "截图文件变大" 只能说明画面变复杂，说明不了渲染变慢
 *   （渐变和噪点会让 PNG 变大，但它们完全可以由 GPU 合成）。
 *   真正该量的是**滚动时每帧耗时**，这个脚本就是干这个的。
 *
 * 用法：
 *   node tools/perf-probe.mjs [url] [是否隐藏背景层]
 *   例：node tools/perf-probe.mjs http://localhost:5173/
 *       node tools/perf-probe.mjs http://localhost:5173/ hide
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const URL_ = process.argv[2] || 'http://localhost:5173/'
const HIDE = process.argv.includes('hide')
const PORT = 9800 + Math.floor(Math.random() * 90)
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const child = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu', // 故意关掉 GPU：软件渲染是最坏情况，能扛住就说明真机没问题
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=D:\\www\\_temp\\perfprof`,
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

/* 在页面里跑一段滚动，同时用 rAF 采样每帧间隔。
   返回帧数、平均/最差帧时长、以及超过 16.7ms 的帧数（掉帧）。 */
const MEASURE = `(async () => {
  ${HIDE ? `document.querySelectorAll('.aurora-orb, .grid-layer, .grain-layer').forEach(e => e.style.display = 'none')` : ''}
  await new Promise(r => setTimeout(r, 800));

  const frames = [];
  let last = performance.now();
  let running = true;
  const sample = (t) => {
    frames.push(t - last);
    last = t;
    if (running) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);

  // 匀速滚一整屏多一点
  const H = document.body.scrollHeight;
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    window.scrollTo(0, (H - window.innerHeight) * (i / steps));
    await new Promise(r => setTimeout(r, 16));
  }
  running = false;
  await new Promise(r => setTimeout(r, 100));
  window.scrollTo(0, 0);

  // 丢掉头几帧（起跑抖动）
  const f = frames.slice(3);
  const sum = f.reduce((a, b) => a + b, 0);
  const sorted = [...f].sort((a, b) => a - b);
  return JSON.stringify({
    frames: f.length,
    avg: sum / f.length,
    p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
    worst: sorted[sorted.length - 1] || 0,
    janky: f.filter(x => x > 16.7).length,
    longTasks: f.filter(x => x > 33).length,
  });
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
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp(ws, 'Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  })
  await cdp(ws, 'Page.navigate', { url: URL_ })
  await sleep(4500)

  const r = JSON.parse(await evaluate(ws, MEASURE))
  console.log(`背景氛围层：${HIDE ? '已隐藏' : '开启'}`)
  console.log(`  采样帧数    ${r.frames}`)
  console.log(`  平均帧时长  ${r.avg.toFixed(2)} ms   (60fps 的预算是 16.7ms)`)
  console.log(`  p95 帧时长  ${r.p95.toFixed(2)} ms`)
  console.log(`  最差一帧    ${r.worst.toFixed(2)} ms`)
  console.log(`  掉帧(>16.7) ${r.janky} / ${r.frames}`)
  console.log(`  长任务(>33) ${r.longTasks}`)
  ws.close()
} finally {
  child.kill()
}
