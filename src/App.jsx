import { useEffect } from 'react'
import { site, sections } from './data/profile.js'

import Nav from './components/Nav.jsx'
import Backdrop from './components/Backdrop.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
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
  // 浏览器标签页标题和页面描述，内容在 profile.js 的 site 里改
  useEffect(() => {
    document.title = site.title

    // 描述也一并同步，这样把链接分享出去时能出一句像样的摘要
    if (site.description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', site.description)
    }
  }, [])

  return (
    <>
      {/* 背景氛围层（极光 + 网格 + 颗粒）。想关掉整层就删掉这一行。 */}
      <Backdrop />
      <ScrollProgress />
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
