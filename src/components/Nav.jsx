import { useEffect, useState } from 'react'
import { hero, site } from '../data/profile.js'
import Icon from './Icon.jsx'
import { SECTION_WRAP } from './Section.jsx'

/* 顶部导航栏。
   菜单项在 src/data/profile.js 的 site.nav 里改。
   想调整导航栏高度，改下面 h-16。 */

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // 往下滚动一点之后，给导航栏加毛玻璃背景和一条描边
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-page/80 dark:bg-page-dark/80 border-edge dark:border-edge-dark border-b backdrop-blur-lg'
          : 'border-b border-transparent'
      }`}
    >
      <div className={`${SECTION_WRAP} flex h-16 items-center justify-between`}>
        {/* 左边的名字，点了回到顶部 */}
        <a href="#top" className="grad-text text-base font-semibold tracking-tight">
          {hero.name}
        </a>

        {/* 电脑上显示横排菜单 */}
        <nav className="hidden items-center gap-1 sm:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-ink-soft dark:text-ink-soft-dark hover:text-ink dark:hover:text-ink-dark hover:bg-surface-2 dark:hover:bg-surface-2-dark rounded-lg px-3 py-2 text-sm transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* 手机上显示汉堡按钮 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="打开菜单"
          className="text-ink-soft dark:text-ink-soft-dark hover:bg-surface-2 dark:hover:bg-surface-2-dark -mr-2 rounded-lg p-2 transition-colors sm:hidden"
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>

      {/* 手机上展开的菜单 */}
      {open ? (
        <div className="bg-page/95 dark:bg-page-dark/95 border-edge dark:border-edge-dark border-b backdrop-blur-lg sm:hidden">
          <nav className={`${SECTION_WRAP} flex flex-col py-2`}>
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-ink-soft dark:text-ink-soft-dark py-3 text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
