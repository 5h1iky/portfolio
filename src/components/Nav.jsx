import { useEffect, useState } from 'react'
import { hero, sections, contacts } from '../data/profile.js'
import Icon from './Icon.jsx'

/* 顶部导航栏。

   ⚠️ 菜单项不用改这个文件！
   导航是从 src/data/profile.js 的 sections 数组自动生成的。
   想改名字 / 顺序 / 增减区块，去改那个数组（nav 字段是导航上的短名）。

   这个组件负责四件事：
     1. 从 sections 生成菜单
     2. 手机端折叠成汉堡菜单
     3. 滚动时高亮当前所在区块
     4. 滚动过一点之后加毛玻璃底和一条发丝下边框 */

// 取 GitHub 那条联系方式当导航右侧的入口（找不到就不显示）
const GITHUB = contacts.items?.find((c) => c.platform === 'GitHub')

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  // 往下滚动一点之后，导航栏加毛玻璃背景和发丝下边框
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
        if (el && el.getBoundingClientRect().top <= 96) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 手机菜单展开时锁住页面滚动。
  // 不锁的话，菜单面板会盖在首屏文字上露出半截，看起来像布局坏了。
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled || open
          ? 'bg-ground/85 border-hair border-b backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="shell flex h-14 items-center gap-4">
        {/* 左边的名字，点了回到顶部 */}
        <a href="#top" className="text-small shrink-0 font-semibold tracking-tight">
          {hero.name}
        </a>

        {/* 电脑端：横排菜单。区块多了会自动排开，不用改代码。
            当前区块用"淡底 + 强调色"标出来，不靠加粗（加粗会让整行抖动）。 */}
        <nav className="ml-auto hidden items-center gap-0.5 sm:flex" aria-label="页面导航">
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              className={`text-small rounded-sm px-2.5 py-1.5 transition-colors duration-150 ${
                active === item.id
                  ? 'bg-accent-wash text-accent'
                  : 'text-fg-soft hover:text-fg'
              }`}
            >
              {item.nav || item.title}
            </a>
          ))}
        </nav>

        {/* 右边的 GitHub 入口（只在电脑端显示） */}
        {GITHUB ? (
          <a
            href={GITHUB.href}
            target="_blank"
            rel="noreferrer"
            className="border-hair text-fg-soft hover:border-fg-muted hover:text-fg hidden shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-small transition-colors duration-150 sm:inline-flex"
          >
            <Icon name="github" className="h-3.5 w-3.5" />
            <span className="num">{GITHUB.handle}</span>
          </a>
        ) : null}

        {/* 手机端：汉堡按钮 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          className="text-fg-soft hover:text-fg -mr-2 ml-auto rounded-md p-2 transition-colors duration-150 sm:hidden"
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
          <div className="bg-ground/95 border-hair menu-in relative z-10 border-b backdrop-blur-md sm:hidden">
            <nav className="shell flex flex-col py-1.5">
              {sections.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between py-3 text-small ${
                    active === item.id ? 'text-accent' : 'text-fg-soft'
                  }`}
                >
                  {item.nav || item.title}
                  <Icon name="arrowRight" className="text-fg-muted h-3.5 w-3.5" />
                </a>
              ))}

              {GITHUB ? (
                <a
                  href={GITHUB.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="text-fg-soft border-hair flex items-center gap-2 border-t py-3 text-small"
                >
                  <Icon name="github" className="h-3.5 w-3.5" />
                  <span className="num">{GITHUB.handle}</span>
                </a>
              ) : null}
            </nav>
          </div>

          {/* 遮罩：铺满菜单以下的所有区域 */}
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="fade-in fixed inset-0 top-14 bg-black/50 backdrop-blur-sm sm:hidden"
          />
        </>
      ) : null}
    </header>
  )
}
