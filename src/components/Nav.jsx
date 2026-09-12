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

  // 手机菜单展开时锁住页面滚动。
  // 不锁的话，菜单面板会盖在 Hero 的文字上露出半截，看起来像布局坏了。
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? 'bg-page/95 dark:bg-page-dark/95 border-edge dark:border-edge-dark border-b backdrop-blur-lg'
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

      {/* 手机端：展开的菜单
          菜单下方再加一层半透明遮罩，点它就收起。
          作用是让"菜单已打开"这件事看起来是有意为之，
          而不是像页面被什么东西盖住了。 */}
      {open ? (
        <>
          {/* relative + z-10 必须保留：
              下面的遮罩是 fixed inset-0，会盖到这一层上面。
              不加的话菜单里的文字会被 backdrop-blur 糊成一片灰块。 */}
          <div className="bg-page/95 dark:bg-page-dark/95 border-edge dark:border-edge-dark relative z-10 border-b backdrop-blur-lg sm:hidden">
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

          {/* 遮罩：铺满菜单以下的所有区域 */}
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="bg-page/70 dark:bg-page-dark/80 fixed inset-0 top-20 backdrop-blur-sm sm:hidden"
          />
        </>
      ) : null}
    </header>
  )
}
