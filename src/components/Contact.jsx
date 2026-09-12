import { contacts } from '../data/profile.js'
import Icon from './Icon.jsx'
import { SectionShell, SectionHeading } from './Section.jsx'

/* 联系方式区 + 页脚。
   联系方式和页脚文字在 src/data/profile.js 的 contacts 里改。
   加一个平台就多一张卡片，删一个就少一张。 */

// 根据平台名自动挑一个图标
function iconFor(platform) {
  if (platform.includes('GitHub')) return 'github'
  if (platform.includes('osu')) return 'gamepad'
  return 'external'
}

export default function Contact() {
  const year = new Date().getFullYear()

  return (
    <>
      <SectionShell id="contact">
        <SectionHeading title={contacts.title} />

        <div className="grid gap-4 sm:grid-cols-3">
          {contacts.items?.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="border-edge dark:border-edge-dark bg-surface dark:bg-surface-dark hover:border-brand-400 dark:hover:border-brand-600 group rounded-2xl border p-5 transition-colors"
            >
              <div className="text-ink-muted dark:text-ink-muted-dark group-hover:text-brand-500 flex items-center justify-between transition-colors">
                <Icon name={iconFor(item.platform)} className="h-5 w-5" />
                <Icon
                  name="external"
                  className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>

              <div className="mt-4 text-sm font-medium">{item.platform}</div>
              <div className="text-ink-soft dark:text-ink-soft-dark mt-0.5 font-mono text-sm">
                {item.handle}
              </div>
              {item.note ? (
                <div className="text-ink-muted dark:text-ink-muted-dark mt-2 text-xs">
                  {item.note}
                </div>
              ) : null}
            </a>
          ))}
        </div>
      </SectionShell>

      {/* ── 页脚 ── */}
      <footer className="border-edge dark:border-edge-dark border-t">
        <div className="text-ink-muted dark:text-ink-muted-dark mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-8 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>{contacts.footerNote.replace('{year}', year)}</span>
          <span className="font-mono">Vite · React · Tailwind</span>
        </div>
      </footer>
    </>
  )
}
