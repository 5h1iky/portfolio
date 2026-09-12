import { about } from '../data/profile.js'
import Icon from './Icon.jsx'
import { SectionShell, SectionHeading } from './Section.jsx'

/* 关于区。
   文字在 src/data/profile.js 的 about 里改。
   不想显示 osu! 数据，把 profile.js 里 osuStats.enabled 改成 false 即可。 */

export default function About() {
  const stats = about.osuStats

  return (
    <SectionShell id="about">
      <SectionHeading title={about.title} />

      <div className="grid gap-10 sm:grid-cols-5 sm:gap-12">
        {/* ── 左边：正文 ── */}
        <div className="space-y-4 sm:col-span-3">
          {about.paragraphs?.map((text) => (
            <p
              key={text}
              className="text-ink-soft dark:text-ink-soft-dark text-sm leading-7 sm:text-base sm:leading-8"
            >
              {text}
            </p>
          ))}

          {/* 技能标签 */}
          {about.skills?.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {about.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-surface-2 dark:bg-surface-2-dark text-ink-soft dark:text-ink-soft-dark rounded-chip px-2.5 py-1 font-mono text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── 右边：osu! 真实成绩 ── */}
        {stats?.enabled && stats.items?.length ? (
          <div className="sm:col-span-2">
            <div className="border-edge dark:border-edge-dark bg-surface dark:bg-surface-dark rounded-2xl border p-5">
              <div className="text-ink-muted dark:text-ink-muted-dark mb-4 flex items-center gap-2 text-xs">
                <Icon name="gamepad" className="h-4 w-4" />
                <span>osu! 数据</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.items.map((item) => (
                  <div key={item.label}>
                    <div className="grad-text font-mono text-lg font-semibold">
                      {item.value}
                    </div>
                    <div className="text-ink-muted dark:text-ink-muted-dark mt-0.5 text-xs">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* 数据来源与日期，避免被当成实时数据 */}
              <p className="text-ink-muted dark:text-ink-muted-dark border-edge dark:border-edge-dark mt-5 border-t pt-3 text-xs leading-relaxed">
                取自 osu! 主页，更新于 {stats.updated}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </SectionShell>
  )
}
