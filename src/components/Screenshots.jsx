import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import assetUrl from '../utils/assetUrl.js'

/* 截图区：横向滑动的缩略图 + 点击放大看大图。

   截图列表来自 src/data/profile.js 里每个作品的 screenshots 数组，
   所以加图不用碰这个文件。 */

export default function Screenshots({ shots }) {
  // 点开的那张图。null 表示没在放大状态。
  const [zoomed, setZoomed] = useState(null)

  // 放大状态下：按 Esc 关闭，并禁止背景跟着滚动
  useEffect(() => {
    if (!zoomed) return
    const onKey = (e) => {
      if (e.key === 'Escape') setZoomed(null)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [zoomed])

  if (!shots?.length) return null

  return (
    <div className="border-edge dark:border-edge-dark border-t px-6 pt-6 pb-6 sm:px-8 sm:pb-8">
      <div className="scrollbar-thin flex snap-x gap-4 overflow-x-auto pb-2">
        {shots.map((shot) => (
          <button
            key={shot.src}
            type="button"
            onClick={() => setZoomed(shot)}
            title="点击看大图"
            className="border-edge dark:border-edge-dark hover:border-brand-400 dark:hover:border-brand-600 group w-36 shrink-0 snap-start overflow-hidden rounded-xl border transition-colors sm:w-40"
          >
            {/* 固定成手机屏幕比例（9:19.5），每张缩略图大小一致、排列整齐。
                完整画面点开大图后能看到。 */}
            <img
              src={assetUrl(shot.src)}
              alt={shot.alt}
              loading="lazy"
              className="aspect-[9/19.5] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <p className="text-ink-muted dark:text-ink-muted-dark mt-1 text-xs">
        点图片可放大 · 左右滑动查看更多
      </p>

      {/* 放大后的遮罩层 */}
      {zoomed ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomed(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <img
            src={assetUrl(zoomed.src)}
            alt={zoomed.alt}
            className="max-h-[92vh] w-auto max-w-full rounded-2xl shadow-2xl"
          />
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setZoomed(null)}
            className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <Icon name="close" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
