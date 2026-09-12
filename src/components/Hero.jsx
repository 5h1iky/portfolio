import { hero } from '../data/profile.js'
import Icon from './Icon.jsx'
import { SECTION_WRAP } from './Section.jsx'

/* 顶部介绍区。
   文字内容在 src/data/profile.js 的 hero 里改。 */

export default function Hero() {
  return (
    <section
      id="top"
      className="relative pt-32 pb-12 sm:pt-40 sm:pb-16"
      style={{
        // 顶部那团紫蓝光晕。三个径向渐变叠加，每个都在碰到区块边缘之前就淡出，
        // 所以不会出现"能看出边界"的硬边。
        // 想让它更明显：把下面 0.10 / 0.13 调大；不想要：把整个 style 删掉。
        backgroundImage:
          'radial-gradient(680px circle at 26% 6%, color-mix(in oklab, var(--color-brand-500) 18%, transparent), transparent 72%), radial-gradient(560px circle at 62% 0%, color-mix(in oklab, var(--color-accent-500) 16%, transparent), transparent 74%)',
      }}
    >
      {/* 深色模式下光晕再亮一点 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            'radial-gradient(680px circle at 26% 6%, color-mix(in oklab, var(--color-brand-500) 22%, transparent), transparent 72%), radial-gradient(560px circle at 62% 0%, color-mix(in oklab, var(--color-accent-500) 20%, transparent), transparent 74%)',
        }}
      />

      <div className={`${SECTION_WRAP} relative`}>
        {/* 名字上面那个小标签 */}
        <div className="border-edge dark:border-edge-dark bg-surface dark:bg-surface-dark text-ink-muted dark:text-ink-muted-dark mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
          <span className="grad-bg h-1.5 w-1.5 rounded-full" />
          {hero.tagline}
        </div>

        {/* 名字，紫蓝渐变大字
            ⚠️ 行高必须留足，不要改成 leading-none。
            原因：grad-text 用的是 background-clip: text，渐变会被裁到行盒范围内。
            而默认行高（1×字号）比字形还矮——字号 60px 时字形实际需要约 76px
            （含 y 这类字母的下伸部），行盒只有 60px，于是「y」的尾巴会被水平切掉。
            实测：1.25 倍行高时基线下留 15px，正好够 Windows 的 system-ui；
            但 system-ui 在不同系统解析成不同字体（Windows=Segoe UI，
            macOS=SF，Linux=Noto/DejaVu），Linux 字体的下伸部更大，
            所以这里用 1.3 倍多留一点余量，保证任何系统上都不裁。 */}
        <h1 className="grad-text text-4xl leading-[1.3] font-bold tracking-tight sm:text-6xl">
          {hero.name}
        </h1>

        {/* 一句话介绍 */}
        <p className="text-ink-soft dark:text-ink-soft-dark mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
          {hero.intro}
        </p>

        {/* 按钮。按钮内容在 profile.js 的 hero.buttons 里改。 */}
        {hero.buttons?.length ? (
          <div className="mt-9 flex flex-wrap items-center gap-3">
            {hero.buttons.map((btn) => (
              <a
                key={btn.href}
                href={btn.href}
                {...(btn.href.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                className={
                  btn.style === 'primary'
                    ? 'grad-bg inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-transform hover:-translate-y-0.5'
                    : 'border-edge dark:border-edge-dark text-ink-soft dark:text-ink-soft-dark hover:bg-surface-2 dark:hover:bg-surface-2-dark inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors'
                }
              >
                {btn.label}
              </a>
            ))}
          </div>
        ) : null}

        {/* 往下滚的提示箭头 */}
        <div className="mt-12 sm:mt-14">
          <a
            href="#projects"
            aria-label="查看作品"
            className="text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark inline-flex transition-colors"
          >
            <Icon name="arrowDown" className="h-5 w-5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  )
}
