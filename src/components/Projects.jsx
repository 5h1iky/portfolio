import { projects, sections } from '../data/profile.js'
import ProjectCard from './ProjectCard.jsx'
import Reveal from './Reveal.jsx'
import { SectionShell, SectionHead, idOf } from './Section.jsx'

/* 作品列表区。
   ⚠️ 这个文件不用改。要加作品，去 src/data/profile.js 的 projects 数组里加。

   编号（01/02/…）是这里按数组顺序自动生成的，
   所以在 profile.js 里调整项目前后顺序，编号会跟着变，不用手动改。

   区块 id 从 profile.js 的 sections 里取（不硬编码），
   这样以后改 id 时导航高亮和锚点链接不会静默失灵。 */

export default function Projects() {
  return (
    <SectionShell id={idOf(sections, 'projects', 'work')}>
      <SectionHead
        num="01"
        title="作品"
        aside={projects?.length ? `共 ${projects.length} 件` : ''}
      />

      {projects?.length ? (
        // min-w-0：卡片里的长文本（曲名、链接标签）不要顶宽整页
        <div className="min-w-0 space-y-6">
          {projects.map((p, i) => (
            // 每张卡比上一张晚 80ms 出现，依次铺开
            <Reveal key={p.name} delay={i * 80}>
              <ProjectCard project={p} num={String(i + 1).padStart(2, '0')} />
            </Reveal>
          ))}
        </div>
      ) : (
        // 一个作品都没有时会显示这句提示
        <p className="text-fg-muted panel rounded-lg px-5 py-8 text-small">
          还没有作品。去 src/data/profile.js 的 projects 里加一个吧。
        </p>
      )}
    </SectionShell>
  )
}
