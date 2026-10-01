import { useEffect } from 'react'

/* 全站背景氛围层（铺在所有内容底下，固定不动）。

   ── 三层是什么 ──────────────────────────────────────────────────────
     ① 极光   三大团极淡的径向渐变，各自以不同周期缓慢漂移、缩放
     ② 网格   40px 的发丝细线，中间清楚四周淡出，给纯色底一点"材质"
     ③ 颗粒   一层几乎看不见的噪点，消除大面积纯色的塑料感

   ── 为什么这么克制 ──────────────────────────────────────────────────
   深色底本来就容易显得"空"，加氛围是对的；但一放开就会变成廉价的科技感。
   所以亮度压到极低（网格只有 2.8% 的白），远看只是"底色在呼吸"，
   截图里几乎看不出来，盯着看才觉得页面有纵深。

   ── 性能上的三条取舍（重要）────────────────────────────────────────
     1. **只动画 transform / opacity**，不动颜色、不用动画 blur。
        大尺寸元素 + 动画 filter 会强制每帧重新栅格化，滚动直接掉帧。
        光晕的柔边交给径向渐变本身，不叠 blur。
     2. **鼠标视差用 rAF + 缓动**，不是监听 mousemove 直接改样式 ——
        后者每秒能触发上百次重排。
     3. **手机上完全不跑视差**（没鼠标），CSS 里也把动画关了（省电）。

   ── 想调 / 想关 ─────────────────────────────────────────────────────
     · 想更亮：改 index.css 里的 --grid-line，或下面 ORBS 里的 alpha
     · 想关掉整层：把 App.jsx 里的 <Backdrop /> 删掉即可
     · 想关掉动效但保留质感：系统里开「减少动态效果」 */

// 三团光晕。alpha 是"有多亮"，自己调；值都在 0.10~0.16 之间是有意的。
const ORBS = [
  {
    cls: 'orb-a',
    // 主强调色（紫蓝），放在左上
    bg: 'radial-gradient(closest-side, color-mix(in oklab, var(--color-accent) 16%, transparent), transparent)',
    style: { top: '-14vh', left: '-6vw', width: '48vw', height: '48vw', minWidth: 420, minHeight: 420 },
  },
  {
    cls: 'orb-b',
    // 第二团偏冷，放右上，和紫色拉开一点色相
    bg: 'radial-gradient(closest-side, color-mix(in oklab, #4b7bd6 13%, transparent), transparent)',
    style: { top: '-8vh', right: '-10vw', width: '42vw', height: '42vw', minWidth: 380, minHeight: 380 },
  },
  {
    cls: 'orb-c',
    // 第三团压在下面靠中间，让中段不要空
    bg: 'radial-gradient(closest-side, color-mix(in oklab, var(--color-accent) 11%, transparent), transparent)',
    style: { top: '46vh', left: '28vw', width: '52vw', height: '40vw', minWidth: 420, minHeight: 320 },
  },
]

// 噪点图：用 SVG 滤镜生成，内联成 data URI，所以不产生任何网络请求。
// baseFrequency 0.8 = 颗粒足够细；配 0.16 的 opacity 只是"去塑料感"。
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function Backdrop() {
  // 鼠标视差：整页光晕跟着指针轻微偏移，制造"页面有厚度"的感觉。
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const noPointer = window.matchMedia('(hover: none)').matches
    // 减少动效 / 触屏设备：直接不挂监听，一点开销都不产生
    if (reduce || noPointer) return undefined

    const root = document.documentElement
    let raf = 0
    let tx = 0 // 目标偏移
    let ty = 0
    let cx = 0 // 当前偏移（缓动跟随，避免生硬）
    let cy = 0

    const onMove = (e) => {
      // 归一化到 -1~1，再乘以最大位移（px）
      tx = (e.clientX / window.innerWidth - 0.5) * 2 * 26
      ty = (e.clientY / window.innerHeight - 0.5) * 2 * 18
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const tick = () => {
      // 缓动系数 0.06：跟手但不抖，停下来时会自己慢慢归位
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      root.style.setProperty('--mx', `${cx.toFixed(2)}px`)
      root.style.setProperty('--my', `${cy.toFixed(2)}px`)
      // 还有明显差距就继续跑，到位就停 —— 不常驻 rAF
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      /* ⚠️ 用 z-0 而不是 -z-10。
         负 z-index 会跑到 body 背景之前，被 body 的底色盖掉；
         而 body 现在已经不设背景色了（底色在 html 上），所以 z-0 就能正常露出来。
         内容区都在 main 里，属于同一个层叠上下文且排在后面，所以会盖在这层之上。
         pointer-events-none 保证它不吃任何点击。 */
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* ① 极光 */}
      {ORBS.map((o) => (
        <div key={o.cls} className={`aurora-orb ${o.cls}`} style={{ background: o.bg, ...o.style }} />
      ))}

      {/* ② 网格 */}
      <div className="grid-layer" />

      {/* ③ 颗粒 */}
      <div className="grain-layer absolute inset-0" style={{ '--grain-url': GRAIN }} />
    </div>
  )
}
