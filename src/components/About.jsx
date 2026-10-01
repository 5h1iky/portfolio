import { about, sections } from '../data/profile.js'
import Reveal from './Reveal.jsx'
import { SectionShell, SectionHead, idOf } from './Section.jsx'

/* 关于区。
   文字在 src/data/profile.js 的 about 里改。
   不想显示 osu! 数据，把 profile.js 里 about.osuStats.enabled 改成 false 即可。

   ── 这里的数字为什么不滚动 ──────────────────────────────────────────
   之前做过"数字从 0 跑上去"的入场动画。去掉了：那属于纯装饰，
   而且会给人"这是实时数据"的错觉。现在就是一份静态快照，
   旁边明确标着核对于哪天，反而更可信。 */

export default function About() {
  const s = about.osuStats

  return (
    <SectionShell id={idOf(sections, 'about', 'about')}>
      <SectionHead num="03" title={about.title} />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* ── 左：正文 + 技能 ── */}
        <Reveal className="lg:col-span-7">
          <div className="space-y-4">
            {about.paragraphs?.map((text) => (
              <p key={text} className="text-fg-soft leading-relaxed">
                {text}
              </p>
            ))}
          </div>

          {about.skills?.length ? (
            <div className="mt-8">
              <h3 className="spec text-fg-muted mb-3">在用的东西</h3>
              <ul className="flex flex-wrap gap-1.5">
                {about.skills.map((skill) => (
                  <li
                    key={skill}
                    className="border-hair text-fg-soft num rounded-sm border px-2 py-0.5 text-[0.6875rem]"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Reveal>

        {/* ── 右：osu! 真实成绩 ──
            做成一块"数据面板"，和作品区那种规格表是同一种语言。 */}
        {s?.enabled && s.items?.length ? (
          <Reveal delay={120} className="lg:col-span-5">
            <div className="panel rounded-lg">
              <div className="border-hair flex items-center justify-between gap-3 border-b px-4 py-3">
                <span className="spec text-fg-soft">osu! 数据</span>
                {s.href ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="num text-accent hover:text-accent-soft text-[0.6875rem] transition-colors duration-150"
                  >
                    {s.handle} ↗
                  </a>
                ) : null}
              </div>

              {/* 两列的小格子，每格一个数字 + 名称。
                  边框单独画在每一格上（而不是给 dl 加 divide），
                  这样最后一行不会多出一条悬空的下框线。 */}
              <dl className="grid grid-cols-2">
                {s.items.map((it, i) => (
                  <div
                    key={it.label}
                    className={`border-hair-soft border-b px-4 py-3 ${
                      i % 2 === 0 ? 'border-r' : ''
                    }`}
                  >
                    <dt className="spec text-fg-muted">{it.label}</dt>
                    <dd className="num mt-1 text-base font-medium">{it.value}</dd>
                  </div>
                ))}
              </dl>

              {/* 数据来源与日期。不要删——删了就变成"看起来像实时数据"的假数字。 */}
              <p className="spec text-fg-muted border-hair border-t px-4 py-2.5 leading-relaxed">
                取自 osu! 主页 · 核对于 {s.checked}
              </p>
            </div>
          </Reveal>
        ) : null}
      </div>
    </SectionShell>
  )
}
