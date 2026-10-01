import { useEffect, useRef } from 'react'

/* 滚动进场动画：元素进入视口时淡入上浮，只播一次。

   用法（三种）：
     <Reveal>内容</Reveal>              整体一起淡入
     <Reveal delay={120}>内容</Reveal>  比别人晚 120ms 出现（做"依次出现"的错峰）
     <Reveal className="stagger">       直接子元素按各自的 --sd 依次出现：
       <div style={{ '--sd': '160ms' }}>…</div>
     </Reveal>

   安全兜底（四层，缺一不可）：
     1. 浏览器不支持 IntersectionObserver → 直接显示
     2. 观察到了 → 正常淡入
     3. 一直在视口外、或观察回调因为任何原因没触发 → 3 秒后无条件显示
        （重要：内容是 opacity:0 起步的，万一 JS 出错或回调丢了，
          这一块就永远看不见了。所以必须有这条超时兜底。）
     4. 系统开了「减少动态效果」→ index.css 里强制显示，不受 JS 影响

   判定元素是否可见交给浏览器原生 API，不自己算坐标，不会算错。 */

// 视口外的元素最多等这么久（毫秒）。比首屏动画时长(0.6s)宽裕得多，
// 正常浏览时根本不会触发；只有在"内容始终没进视口"时才会兜底。
const FALLBACK_MS = 3000

export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const show = () => el.classList.add('rv-in')

    // 兜底 1：浏览器太老，没有 IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      show()
      return undefined
    }

    // 兜底 3：定时器。无论观察有没有生效，到点一定显示。
    const timer = window.setTimeout(show, FALLBACK_MS + delay)

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show()
          window.clearTimeout(timer)
          io.disconnect()
        }
      },
      // rootMargin 底部 -8%：元素要越过视口底部往上 8% 才算"进入"
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )
    io.observe(el)

    return () => {
      window.clearTimeout(timer)
      io.disconnect()
    }
  }, [delay])

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={`rv ${className}`}
      style={{ '--rv-d': `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
