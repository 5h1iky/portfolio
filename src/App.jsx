import { useEffect } from 'react'
import { site, sections } from './data/profile.js'

import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Projects from './components/Projects.jsx'
import Downloads from './components/Downloads.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'

/* ============================================================================
   页面装配 —— 区块顺序由 src/data/profile.js 的 sections 数组决定。

   这个文件一般不用改：
     · 调整区块顺序 / 改名 / 增减区块 → 改 profile.js 里的 sections
   ============================================================================ */

// 区块类型 → 对应组件
const BLOCKS = {
  hero: Hero,
  projects: Projects,
  downloads: Downloads,
  about: About,
  contact: Contact,
}

export default function App() {
  // 浏览器标签页标题，内容在 profile.js 的 site.title 里改
  useEffect(() => {
    document.title = site.title
  }, [])

  return (
    <>
      <Nav />
      <main>
        {sections.map((s) => {
          const Block = BLOCKS[s.type]
          // 类型写错时不要整页崩掉，跳过并提示
          if (!Block) {
            console.warn(`[profile.js] sections 里的 type "${s.type}" 没有对应组件，已跳过`)
            return null
          }
          return <Block key={s.id} />
        })}
      </main>
    </>
  )
}
