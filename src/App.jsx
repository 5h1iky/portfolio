import { useEffect } from 'react'
import { site } from './data/profile.js'

import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Projects from './components/Projects.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'

/* ============================================================================
   页面装配顺序 —— 想让哪个区块排在上面，就调整下面这几行的先后。
   要临时藏掉某个区块，把它那一行前面加 // 注释掉即可。
   ============================================================================ */

export default function App() {
  // 浏览器标签页上的标题，内容在 profile.js 的 site.title 里改
  useEffect(() => {
    document.title = site.title
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
    </>
  )
}
