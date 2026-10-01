import { downloads, sections } from '../data/profile.js'
import DownloadGroup from './DownloadGroup.jsx'
import { SectionShell, SectionHead, idOf } from './Section.jsx'

/* 文件下载区。内容全在 src/data/profile.js 的 downloads 里，加文件不用改这个组件。
   每个分组的渲染细节（搜索/排序/链接规则）在 DownloadGroup.jsx 里。 */

export default function Downloads() {
  const groups = downloads.groups || []
  const total = groups.reduce((n, g) => n + (g.items?.length || 0), 0)

  return (
    <SectionShell id={idOf(sections, 'downloads', 'downloads')}>
      <SectionHead
        num="02"
        title={downloads.title}
        aside={total ? `共 ${total} 个文件` : ''}
      />

      {downloads.note ? (
        <p className="text-fg-muted -mt-4 mb-8 max-w-2xl text-small">{downloads.note}</p>
      ) : null}

      <div className="space-y-10">
        {groups.map((g) => (
          <DownloadGroup key={g.group} group={g} />
        ))}
      </div>

      {downloads.footer ? (
        <p className="spec text-fg-muted border-hair mt-10 border-t pt-4 leading-relaxed">
          {downloads.footer}
        </p>
      ) : null}
    </SectionShell>
  )
}
