import Icon from './Icon.jsx'
import Screenshots from './Screenshots.jsx'

/* 单个作品卡片。内容全部来自 src/data/profile.js 的 projects 数组，
   所以加新作品不用碰这个文件。
   （截图和放大查看在 Screenshots.jsx 里） */

export default function ProjectCard({ project }) {
  return (
    <article className="border-edge dark:border-edge-dark bg-surface dark:bg-surface-dark overflow-hidden rounded-2xl border">
      <div className="p-6 sm:p-8">
        {/* ── 标题行：名字 + 版本/协议徽章 ── */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {project.name}
          </h3>
          {project.subname ? (
            <span className="text-ink-muted dark:text-ink-muted-dark font-mono text-sm">
              {project.subname}
            </span>
          ) : null}
          {project.version ? (
            <span className="border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-300 rounded-chip border px-2 py-0.5 font-mono text-xs">
              {project.version}
            </span>
          ) : null}
          {project.license ? (
            <span className="border-edge dark:border-edge-dark text-ink-muted dark:text-ink-muted-dark rounded-chip border px-2 py-0.5 font-mono text-xs">
              {project.license}
            </span>
          ) : null}
        </div>

        {/* ── 一句话说明 ── */}
        <p className="text-ink-soft dark:text-ink-soft-dark mt-3 text-sm leading-relaxed sm:text-base">
          {project.summary}
        </p>

        {/* ── 技术标签 ── */}
        {project.tags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-2 dark:bg-surface-2-dark text-ink-soft dark:text-ink-soft-dark rounded-chip px-2.5 py-1 font-mono text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* ── 详细描述 ── */}
        {project.description ? (
          <p className="text-ink-soft dark:text-ink-soft-dark mt-6 text-sm leading-7">
            {project.description}
          </p>
        ) : null}

        {/* ── 功能亮点 ── */}
        {project.highlights?.length ? (
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {project.highlights.map((item) => (
              <li
                key={item}
                className="text-ink-soft dark:text-ink-soft-dark flex gap-2.5 text-sm leading-relaxed"
              >
                <span className="grad-bg mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {/* ── 相关链接 ── */}
        {project.links?.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="border-edge dark:border-edge-dark hover:bg-surface-2 dark:hover:bg-surface-2-dark text-ink-soft dark:text-ink-soft-dark inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
              >
                <Icon
                  name={link.label.includes('下载') ? 'download' : 'external'}
                  className="h-4 w-4"
                />
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── 截图区（横向滑动，点开看大图）── */}
      <Screenshots shots={project.screenshots} />
    </article>
  )
}
