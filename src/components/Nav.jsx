import { useEffect, useState } from 'react'
import { hero, sections } from '../data/profile.js'
import Icon from './Icon.jsx'
import { SECTION_WRAP } from './Section.jsx'

/* 顶部导航栏。

   ⚠️ 菜单项不用改这个文件！
   导航是从 src/data/profile.js 的 sections 数组自动生成的。
   想改名字 / 顺序 / 增减区块，去改那个数组。

   这个组件负责三件事：
     1. 从 sections 生成菜单
     2. 手机端折叠成汉堡菜单
     3. 滚动时高亮当前所在区块 */

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  // 往下滚动一点之后，导航栏加毛玻璃背景和描边
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 高亮当前区块：从下往上找第一个已经滚过导航栏的区块
  useEffect(() => {
    const ids = sections.map((s) => s.id)
    const onScroll = () => {
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 120) current = id
      }
      setActive(current)
    }
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

        {/* 电脑端：横排菜单。区块多了会自动排开，不用改代码 */}
        <nav className="hidden items-center gap-1 sm:flex">
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                active === item.id
                  ? 'text-brand-600 dark:text-brand-300 bg-surface-2 dark:bg-surface-2-dark font-medium'
                  : 'text-ink-soft dark:text-ink-soft-dark hover:text-ink dark:hover:text-ink-dark hover:bg-surface-2 dark:hover:bg-surface-2-dark'
              }`}
            >
              {item.title}
            </a>
          ))}
        </nav>

        {/* 手机端：汉堡按钮 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          className="text-ink-soft dark:text-ink-soft-dark hover:bg-surface-2 dark:hover:bg-surface-2-dark -mr-2 rounded-lg p-2 transition-colors sm:hidden"
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>

      {/* 手机端：展开的菜单 */}
      {open ? (
        <div className="bg-page/95 dark:bg-page-dark/95 border-edge dark:border-edge-dark border-b backdrop-blur-lg sm:hidden">
          <nav className={`${SECTION_WRAP} flex flex-col py-2`}>
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className={`py-3 text-sm ${
                  active === item.id
                    ? 'text-brand-600 dark:text-brand-300 font-medium'
                    : 'text-ink-soft dark:text-ink-soft-dark'
                }`}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
