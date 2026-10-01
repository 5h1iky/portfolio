import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import assetUrl from '../utils/assetUrl.js'

/* 截图横滑条 + 点击放大。

   数据来自每个作品的 shots，形状是这样（见 src/data/profile.js）：
     shots: {
       dir:   'screenshots/wanshang',   图片所在目录
       ratio: '372 / 430',              所有截图的宽高比（照抄图片真实尺寸即可）
       items: [ { file: '01-main.jpg', alt: '主屏' }, … ]
     }

   ── 为什么 ratio 要在数据里写死 ──────────────────────────────────────
   手机截图是 9:20 的长条，手表截图接近 1:1。如果统一裁成一个比例，
   要么手机内容被截掉，要么手表两边留一大片空白。
   所以让每个项目自己声明比例：所有缩略图尺寸一致（看着整齐），
   比例又忠于实机（看着真实）。
   ratio 的写法就是 CSS 的 aspect-ratio，直接抄图片的像素尺寸即可。

   ── 缩略图宽度怎么定 ────────────────────────────────────────────────
   不是所有图都给一个固定宽度。原因：手机截图是 9:20 的长条、手表截图接近 1:1，
   同样给一个宽度，长条的"面积"只有方图的四成，一排看过去轻重差很多，
   高瘦那种还会小到看不清内容。

   所以按比例反推宽度，让每张缩略图的**面积差不多**：
   宽 ∝ 1/sqrt(比例)。也就是越瘦的图给越宽。

   基准值 10rem 是量出来的：手机截图 0.45 的比例会得到约 215px 宽，
   这个尺寸下截图里的文字才勉强能认出是什么界面。调小会让缩略图变成"空盒子"。

   ── 关于 crop（裁掉截图底部的空白）────────────────────────────────
   有些截图底部有一大段纯黑空白（比如手表上只有三行设置的页面）。
   这些图原样缩到缩略图尺寸，看起来就是个空框。
   所以数据里可以给每张图配一个 crop（0~1，保留上面多少比例），
   **只有缩略图会裁**，点开看大图时仍然是完整原图。

   ⚠️ 宽度用行内 style 传，不要改成拼 Tailwind 类名（如 `w-[${x}rem]`）——
   Tailwind 是在构建时扫描源码里的字面类名的，拼出来的类名它看不见，
   最后会静默失效（图变成 0 宽）。行内 style 没这个问题。 */

// 面积守恒：以「比例 0.6 的图给 10rem 宽」为基准，上下限防止极端值
function widthRemFor(ratio) {
  const [w, h] = String(ratio)
    .split('/')
    .map((n) => parseFloat(n))
  const r = w && h ? w / h : 0.6
  return Math.min(20, Math.max(6, 10 * Math.sqrt(0.6 / Math.max(r, 0.2))))
}

export default function Screenshots({ shots }) {
  // 点开的那张图。null 表示没在放大状态。
  const [zoomed, setZoomed] = useState(null)
  // 正在播关闭动画（true 时遮罩还在，只是开始淡出）
  const [closing, setClosing] = useState(false)
  const timer = useRef(0)

  // 关闭：先播 150ms 退场动画，再真正卸载
  const close = () => {
    if (!zoomed || closing) return
    setClosing(true)
    timer.current = window.setTimeout(() => {
      setZoomed(null)
      setClosing(false)
    }, 150)
  }

  // 组件卸载时清掉还没跑完的定时器
  useEffect(() => () => window.clearTimeout(timer.current), [])

  // 放大状态下：按 Esc 关闭，并禁止背景跟着滚动
  useEffect(() => {
    if (!zoomed) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed])

  const items = shots?.items
  if (!items?.length) return null

  // 把 dir + file 拼成完整地址（补前缀的规则见 utils/assetUrl.js）
  const srcOf = (file) => assetUrl(`${shots.dir}/${file}`)
  const ratio = shots.ratio || '16 / 9'
  const widthRem = widthRemFor(ratio)

  // 算出某个比例对应的"容器宽高比"（CSS 的 aspect-ratio，宽/高）。
  // 数据里写的是 "480 / 1017" 这种，直接除一下就是宽高比。
  const ratioOf = (r) => {
    const [a, b] = String(r)
      .split('/')
      .map((n) => parseFloat(n))
    return a && b ? a / b : 16 / 9
  }
  const naturalRatio = ratioOf(ratio)

  /* 算出缩略图容器该用多高的比例。
   *
   * 想要的效果：**让图裁掉底部一段空白**，可以写 crop（保留上面多少，0~1）。
   *
   * ⚠️ 这里的公式错过一次，记下来免得再错：
   *   object-cover 的显示规则是"等比放大到刚好盖住容器，多出来的裁掉"。
   *   容器宽 W、宽高比 R 时容器高是 W/R；图按宽度铺满时高是 W/naturalRatio。
   *   所以  显示比例 = (W/naturalRatio) ÷ (W/R) = naturalRatio / R。
   *   要让它等于 crop，就得  R = naturalRatio / crop。
   *
   *   我原先写的是 R = 1 / crop —— 那是"图片是正方形"时才成立的式子，
   *   对 480×1017 这种竖长图（比例 0.472）会错得很离谱：
   *   crop=0.68 时算出的容器比是 1.47，实际只显示出 32% 的画面，
   *   也就是用户看到的"图只显示了一半"。
   *
   * 不配 crop 时不裁，完整显示（容器比就取图片自己的比例）。 */
  const boxRatioOf = (s) => {
    const own = s.ratio ? ratioOf(s.ratio) : naturalRatio
    if (!s.crop) return own
    return own / s.crop
  }

  return (
    <div>
      {/* 缩略图横滑条。固定比例 + 按比例算出的宽度 = 整排视觉重量均匀；
          超出容器就横向滚动，不换行。 */}
      <ul className="scrollbar-thin flex snap-x gap-3 overflow-x-auto pb-2">
        {items.map((s) => (
          <li key={s.file} className="shrink-0 snap-start" style={{ width: `${widthRem}rem` }}>
            <button
              type="button"
              onClick={() => setZoomed(s)}
              title={`放大：${s.alt}`}
              className="border-hair hover:border-accent-dim group block w-full overflow-hidden rounded-md border transition-colors duration-150"
            >
              {/* object-cover + object-top：等比铺满容器，多出来的从底部裁掉，
                  画面不会变形（是"裁"不是"压"）。点开的大图仍是完整原图。 */}
              <img
                src={srcOf(s.file)}
                alt={s.alt}
                loading="lazy"
                decoding="async"
                className="w-full object-cover object-top transition-opacity duration-200 group-hover:opacity-85"
                style={{ aspectRatio: boxRatioOf(s) }}
              />
            </button>
          </li>
        ))}
      </ul>

      <p className="spec text-fg-muted mt-2">点图片可放大 · 左右滑动查看更多</p>

      {/* 放大后的遮罩层 */}
      {zoomed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoomed.alt}
          onClick={close}
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm ${
            closing ? 'lb-out' : 'lb-in'
          }`}
        >
          <img
            src={srcOf(zoomed.file)}
            alt={zoomed.alt}
            className={`max-h-[92vh] w-auto max-w-full rounded-md ${
              closing ? 'lb-img-out' : 'lb-img-in'
            }`}
          />
          <button
            type="button"
            aria-label="关闭"
            onClick={close}
            className="absolute top-5 right-5 rounded-md bg-white/10 p-2 text-white transition-colors duration-150 hover:bg-white/20"
          >
            <Icon name="close" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
