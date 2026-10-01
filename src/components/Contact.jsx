import { contacts, sections } from '../data/profile.js'
import Icon from './Icon.jsx'
import Reveal from './Reveal.jsx'
import { SectionShell, SectionHead, idOf } from './Section.jsx'

/* 联系方式区 + 页脚。
   联系方式和页脚文字在 src/data/profile.js 的 contacts 里改。
   加一个平台就多一行，删一个就少一行。

   ── 为什么不做成三张卡片 ────────────────────────────────────────────
   三个平台各自一张圆角卡片，看起来像三个并列的功能模块，
   但这三条其实是同一种信息（去哪找我），排成一行行反而更好扫。
   所以用发丝横线分行：左边平台名，中间等宽账号，右边一句说明。 */

// 根据平台名自动挑一个图标
function iconFor(platform) {
  if (platform.includes('GitHub')) return 'github'
  if (platform.includes('osu')) return 'gamepad'
  if (platform.includes('B站') || platform.includes('bilibili')) return 'music'
  return 'external'
}

export default function Contact() {
  const year = new Date().getFullYear()

  return (
    <>
      <SectionShell id={idOf(sections, 'contact', 'contact')}>
        <SectionHead num="04" title={contacts.title} />

        <Reveal>
          <ul className="border-hair border-t">
            {contacts.items?.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group border-hair-soft hover:bg-raised flex items-center gap-4 border-b py-4 transition-colors duration-150"
                >
                  <Icon
                    name={iconFor(item.platform)}
                    className="text-fg-muted group-hover:text-accent h-4 w-4 shrink-0 transition-colors duration-150"
                  />

                  <span className="w-16 shrink-0 text-small font-medium">{item.platform}</span>

                  <span className="num text-fg-soft min-w-0 flex-1 truncate text-small">
                    {item.handle}
                  </span>

                  {item.note ? (
                    <span className="text-fg-muted hidden shrink-0 text-small sm:block">
                      {item.note}
                    </span>
                  ) : null}

                  <Icon
                    name="arrowRight"
                    className="text-fg-muted group-hover:text-accent h-3.5 w-3.5 shrink-0 transition-all duration-150 group-hover:translate-x-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </SectionShell>

      {/* ── 页脚 ── */}
      <footer className="border-hair border-t">
        <div className="shell text-fg-muted flex flex-col gap-2 py-7 sm:flex-row sm:items-center sm:justify-between">
          <span className="spec">{contacts.footerNote.replace('{year}', year)}</span>
          <a href="#top" className="spec hover:text-fg-soft transition-colors duration-150">
            回到顶部 ↑
          </a>
        </div>
      </footer>
    </>
  )
}
