import { hero, sections } from '../data/profile.js'
import Icon from './Icon.jsx'
import { idOf } from './Section.jsx'

/* 首屏。
   文字内容在 src/data/profile.js 的 hero 里改。

   ── 版面为什么是这样 ──────────────────────────────────────────────
   刻意避开了「大标题居中 + 渐变文字 + 两个按钮」这个个人主页的默认模板：
   那种排法把首屏的全部注意力交给一句 slogan，而这里其实没 slogan 可写。

   改成左右分栏：
     左边 = 我是谁、在做什么（文字，占 7 列）
     右边 = 最近在做的三件事（等宽列表，占 5 列，是一份真实的状态清单）
   再往下压一条三格统计，把「4 个开源项目 / 2 个手表应用 / 16 个关卡」
   这个量级直接摆在首屏，比任何形容词都有说服力。

   三格的数字和"核对于"日期都来自 profile.js 的 hero.stats，改那里即可。 */

// 大标题的入场延时，按出场顺序递增（毫秒）
const D = [0, 70, 140, 210, 280]

export default function Hero() {
  return (
    <section
      id={idOf(sections, 'hero', 'top')}
      className="relative scroll-mt-16 pt-28 pb-4 sm:pt-36"
    >
      {/* 首屏底部压一层渐隐，让氛围层（Backdrop）自然过渡到正文区，
          不然极光的中段会在作品区边缘显得突兀。
          这一层是"衔接"用的，本身不是装饰，所以用底色渐变而不是又加一团光。 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full -z-10 h-40"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in oklab, var(--color-ground) 60%, transparent), transparent)',
        }}
      />

      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ── 左边：名字 + 一句话 + 按钮 ── */}
          <div className="lg:col-span-7">
            {hero.label ? (
              <p className="spec text-fg-muted rise mb-5" style={{ animationDelay: `${D[0]}ms` }}>
                {hero.label}
              </p>
            ) : null}

            {/* 名字。
                ⚠️ leading-[1.1] 不要再收紧。名字里有「y」这种带下伸部的字母，
                行高小于 1 时尾巴会被裁掉（浅色/深色、不同系统字体都会中招）。 */}
            <h1
              className="text-display rise leading-[1.1] font-semibold tracking-[-0.03em]"
              style={{ animationDelay: `${D[1]}ms` }}
            >
              {hero.name}
            </h1>

            {hero.intro ? (
              <p
                className="text-fg-soft rise mt-6 max-w-xl text-base leading-relaxed"
                style={{ animationDelay: `${D[2]}ms` }}
              >
                {hero.intro}
              </p>
            ) : null}

            {/* 按钮 */}
            {hero.buttons?.length ? (
              <div
                className="rise mt-8 flex flex-wrap items-center gap-3"
                style={{ animationDelay: `${D[3]}ms` }}
              >
                {hero.buttons.map((btn) => (
                  <a
                    key={btn.href}
                    href={btn.href}
                    {...(btn.href.startsWith('http')
                      ? { target: '_blank', rel: 'noreferrer' }
                      : {})}
                    className={
                      btn.style === 'primary'
                        ? 'bg-accent text-on-accent rounded-md px-4 py-2 text-small font-medium transition-[filter] duration-150 hover:brightness-110'
                        : 'border-hair text-fg-soft hover:border-fg-muted hover:text-fg rounded-md border px-4 py-2 text-small font-medium transition-colors duration-150'
                    }
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* ── 右边：最近在做 ──
              这是一份真实的状态清单，不是装饰。想改内容去 profile.js 的 hero.now。
              在手机上它会排到名字下面，保持单列，不会挤。 */}
          {hero.now?.length ? (
            <div
              className="rise lg:col-span-5 lg:pt-10"
              style={{ animationDelay: `${D[2]}ms` }}
            >
              <div className="panel rounded-lg">
                <div className="border-hair flex items-center gap-2 border-b px-4 py-3">
                  <span className="bg-accent h-1.5 w-1.5 rounded-full" />
                  <span className="spec text-fg-soft">最近在做</span>
                </div>

                <ul className="divide-hair divide-y">
                  {hero.now.map((item) => (
                    <li key={item.text}>
                      <a
                        href={item.href || '#work'}
                        className="group hover:bg-raised flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150"
                      >
                        <span className="text-small text-fg truncate">{item.text}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          {item.note ? (
                            <span className="spec text-fg-muted">{item.note}</span>
                          ) : null}
                          <Icon
                            name="arrowRight"
                            className="text-fg-muted group-hover:text-accent h-3.5 w-3.5 transition-colors duration-150"
                          />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        {/* ── 底部三格统计 ──
            数字必须是真的。来源与核对日期写在下面那行小字里，
            不要删掉日期——不然过一阵就会变成看起来像实时数据的假数字。 */}
        {hero.stats?.length ? (
          <div className="rise mt-14 sm:mt-16" style={{ animationDelay: `${D[4]}ms` }}>
            <dl className="border-hair grid grid-cols-1 border-t sm:grid-cols-3">
              {hero.stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`border-hair py-5 sm:py-6 ${
                    i > 0 ? 'border-t sm:border-t-0 sm:border-l sm:pl-6' : ''
                  }`}
                >
                  <dt className="spec text-fg-muted">{s.label}</dt>
                  <dd className="num mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {s.value}
                  </dd>
                  <dd className="text-fg-muted mt-1 text-small">{s.note}</dd>
                </div>
              ))}
            </dl>
            {hero.statsChecked ? (
              <p className="spec text-fg-muted mt-3">核对于 {hero.statsChecked}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
