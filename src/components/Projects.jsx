import { projects } from '../data/profile.js'
import ProjectCard from './ProjectCard.jsx'
import { SectionShell, SectionHeading } from './Section.jsx'

/* 作品列表区。
   ⚠️ 这个文件不用改。要加作品，去 src/data/profile.js 的 projects 数组里加。 */

export default function Projects() {
  return (
    <SectionShell id="projects">
      <SectionHeading title="作品" />

      {projects?.length ? (
        <div className="space-y-8">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      ) : (
        // 一个作品都没有时会显示这句提示
        <p className="text-ink-muted dark:text-ink-muted-dark text-sm">
          还没有作品。去 src/data/profile.js 的 projects 里加一个吧。
        </p>
      )}
    </SectionShell>
  )
}
