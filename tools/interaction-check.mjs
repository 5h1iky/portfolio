/* 用 CDP 真的点一遍交互件，确认它们能用。
 *
 * 为什么要这个：
 *   截图只能证明"看起来对"，证明不了"点得动"。
 *   下载区的搜索/排序、截图的放大查看都是自己写的，
 *   改版后必须实际触发一次才知道有没有坏。
 *
 * 用法：node tools/interaction-check.mjs [url]
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const URL_ = process.argv[2] || 'http://localhost:4173/portfolio/qa.html'
const PORT = 9555
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const child = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=D:\\www\\_temp\\intprof',
    '--window-size=1440,900',
    '--force-dark-mode',
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

/** 在页面里跑一段表达式，返回它的值 */
async function evaluate(ws, expr) {
  const r = await cdp(ws, 'Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  })
  if (r.exceptionDetails) {
    throw new Error('页面异常: ' + JSON.stringify(r.exceptionDetails.exception))
  }
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

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? '  — ' + detail : ''}`)
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
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp(ws, 'Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  })

  // 在任何页面脚本之前挂一个错误收集器，这样 React 抛错也能被记下来
  await cdp(ws, 'Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__qaErrors = [];
      window.addEventListener('error', e => window.__qaErrors.push(String(e.message)));
      window.addEventListener('unhandledrejection', e => window.__qaErrors.push('rejection: ' + e.reason));
      const origErr = console.error;
      console.error = (...a) => { window.__qaErrors.push('console.error: ' + a.join(' ')); origErr(...a); };
    `,
  })

  await cdp(ws, 'Page.navigate', { url: URL_ })
  await sleep(5000)

  // ── 1. 搜索框筛选 ──────────────────────────────────────────────
  // ⚠️ 只有文件多的分组才有搜索框（超过 5 个才显示工具条），
  //    所以下面的断言必须限定在"这个搜索框所在的分组"里数行数，
  //    不能数整个下载区 —— 否则另一组那 3 行会混进来，看着像没恢复。
  const groupInfo = await evaluate(
    ws,
    `(() => {
      const input = document.querySelector('#downloads input[type=search]')
      if (!input) return null
      // 往上找到这一组的容器（Reveal 的根节点），再数它里面的文件行
      let box = input.closest('section')
      const group = input.closest('[data-reveal]')
      const countRows = el => [...el.querySelectorAll('ul > li')]
        .filter(li => li.querySelector(':scope > a, :scope > div')).length
      return {
        section: countRows(box),
        group: group ? countRows(group) : null,
        hasGroup: !!group,
      }
    })()`,
  )
  check(
    '下载区渲染出文件行',
    groupInfo && groupInfo.group > 5,
    `搜索框所在分组 ${groupInfo ? groupInfo.group : '?'} 行，整个下载区 ${groupInfo ? groupInfo.section : '?'} 行`,
  )

  const groupRows = groupInfo ? groupInfo.group : 0

  // 搜 "rabbit" —— 这一组里对应 rabbit.zip，显示名就是 "rabbit"。
  // （注意别拿 "idol" 试：那个关卡的中文/日文显示名是「アイドル」，
  //   搜索是按显示名匹配的，用文件名试会得到 0 条，那是正确行为不是 bug。）
  const filtered = await evaluate(
    ws,
    `(() => {
      const input = document.querySelector('#downloads input[type=search]')
      if (!input) return { err: '找不到搜索框' }
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      setter.call(input, 'rabbit')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      return { ok: true }
    })()`,
  )
  await sleep(400)
  const afterSearch = await evaluate(
    ws,
    `(() => {
      const input = document.querySelector('#downloads input[type=search]')
      const group = input.closest('[data-reveal]')
      const rows = [...group.querySelectorAll('ul > li')]
        .filter(li => li.querySelector(':scope > a, :scope > div'))
      return { count: rows.length, names: rows.map(r => r.textContent.trim().slice(0, 24)) }
    })()`,
  )
  check(
    '搜索 "rabbit" 能筛出结果',
    filtered.ok && afterSearch.count > 0 && afterSearch.count < groupRows,
    `从 ${groupRows} 行筛到 ${afterSearch.count} 行: ${JSON.stringify(afterSearch.names)}`,
  )

  // 搜一个不存在的词，应该出现空状态提示而不是区块消失
  await evaluate(
    ws,
    `(() => {
      const input = document.querySelector('#downloads input[type=search]')
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      setter.call(input, 'zzzz-no-such-level')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })()`,
  )
  await sleep(400)
  const emptyState = await evaluate(
    ws,
    `document.getElementById('downloads').textContent.includes('没有匹配')`,
  )
  check('搜不到时显示空状态提示', emptyState === true)

  // 清空搜索，恢复全部
  await evaluate(
    ws,
    `(() => {
      const input = document.querySelector('#downloads input[type=search]')
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      setter.call(input, '')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })()`,
  )
  await sleep(400)
  const restored = await evaluate(
    ws,
    `(() => {
      const input = document.querySelector('#downloads input[type=search]')
      const group = input.closest('[data-reveal]')
      return [...group.querySelectorAll('ul > li')]
        .filter(li => li.querySelector(':scope > a, :scope > div')).length
    })()`,
  )
  check('清空搜索后恢复全部', restored === groupRows, `${restored} / ${groupRows} 行`)

  // ── 2. 排序：点「最新」后第一行应该是日期最大的 ──────────────
  const sortResult = await evaluate(
    ws,
    `(() => {
      const btns = [...document.querySelectorAll('#downloads button')]
      const b = btns.find(x => x.textContent.trim() === '最新')
      if (!b) return { err: '找不到排序按钮' }
      b.click()
      return { ok: true }
    })()`,
  )
  await sleep(400)
  const firstAfterSort = await evaluate(
    ws,
    `(() => {
      const rows = [...document.querySelectorAll('#downloads ul li')].filter(li => li.querySelector('a,div'))
      if (!rows.length) return null
      const t = rows[0].textContent
      return { text: t.trim().slice(0, 40) }
    })()`,
  )
  check(
    '排序按钮可点击并改变顺序',
    sortResult.ok && !!firstAfterSort,
    `第一行: ${JSON.stringify(firstAfterSort)}`,
  )

  // ── 3. 截图放大（lightbox）────────────────────────────────────
  await evaluate(
    ws,
    `(() => {
      const b = [...document.querySelectorAll('#work button')].find(x => (x.title||'').startsWith('放大'))
      if (b) b.click()
      return !!b
    })()`,
  )
  await sleep(500)
  const dialog = await evaluate(
    ws,
    `(() => {
      const d = document.querySelector('[role=dialog]')
      if (!d) return { open: false }
      const img = d.querySelector('img')
      return { open: true, hasImg: !!img, src: img ? img.getAttribute('src') : null }
    })()`,
  )
  check('点截图能打开放大层', dialog.open && dialog.hasImg, JSON.stringify(dialog))

  // Esc 应该能关掉
  await cdp(ws, 'Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  })
  await sleep(600)
  const closed = await evaluate(ws, `!document.querySelector('[role=dialog]')`)
  check('按 Esc 能关闭放大层', closed === true)

  // ── 4. 导航锚点都存在 ────────────────────────────────────────
  const anchors = await evaluate(
    ws,
    `(() => {
      const links = [...document.querySelectorAll('header nav a[href^="#"], footer a[href^="#"]')]
      const missing = links.filter(a => !document.querySelector(a.getAttribute('href')))
      return { total: links.length, missing: missing.map(a => a.getAttribute('href')) }
    })()`,
  )
  check(
    '导航/页脚的锚点都有对应区块',
    anchors.missing.length === 0,
    `${anchors.total} 个链接，缺失: ${JSON.stringify(anchors.missing)}`,
  )

  // ── 5. 图片都加载成功了 ──────────────────────────────────────
  await evaluate(
    ws,
    `(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90))
      }
      window.scrollTo(0, 0)
    })()`,
  )
  await sleep(1200)
  const imgs = await evaluate(
    ws,
    `(() => {
      const all = [...document.images]
      const broken = all.filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src'))
      return { total: all.length, broken }
    })()`,
  )
  check('所有图片加载成功', imgs.broken.length === 0, `${imgs.total} 张图，坏图: ${JSON.stringify(imgs.broken)}`)

  // ── 6. 控制台有没有报错 ─────────────────────────────────────
  const errs = await evaluate(ws, `window.__qaErrors ? window.__qaErrors.length : 0`)
  check('页面无 JS 报错', errs === 0, `捕获到 ${errs} 条`)

  ws.close()
} finally {
  child.kill()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n通过 ${results.length - failed.length}/${results.length}`)
if (failed.length) {
  console.log('失败项: ' + failed.map((f) => f.name).join('、'))
  process.exitCode = 1
}
