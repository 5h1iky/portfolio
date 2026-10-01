import { useEffect, useState } from 'react'

/* 顶部滚动进度条（一条强调色细线，贴在导航栏最上面）。
   fixed 定位，不参与页面布局，也不占高度。

   刻意做得非常克制：高 2px、单一强调色，不发光、不加渐变。
   （上一版用的是紫→蓝渐变 + 阴影，太重了，和现在的整体调子不搭。） */

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    // 滚动事件很密，用 requestAnimationFrame 合并，每帧最多算一次
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="bg-accent fixed inset-x-0 top-0 z-[60] h-0.5 origin-left transition-transform duration-150"
      style={{ transform: `scaleX(${progress})` }}
    />
  )
}
