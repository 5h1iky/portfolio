import { downloads } from '../data/profile.js'
import Icon from './Icon.jsx'
import { SectionShell, SectionHeading } from './Section.jsx'

/* 文件下载区。内容全在 src/data/profile.js 的 downloads 里，加文件不用改这个组件。

   链接规则（两种写法都支持）：
     · file 写完整网址（http 开头）→ 原样使用，比如跳去 osu! 或 GitHub Releases
     · file 只写文件名           → 自动拼上 downloads.releaseBase 前缀

   ⚠️ 两个坑：
     1. GitHub 会改写上传的文件名（空格变点、去掉括号），所以 file 必须写
        GitHub 上的真实文件名，不是电脑里的名字。
     2. 文件名里有中文时需要编码，否则链接会 404 —— 下面已经自动处理了。 */

function linkFor(item) {
  if (!item?.file) return ''
  // 完整网址原样返回
  if (/^https?:\/\//.test(item.file)) return item.file
  // 相对文件名：拼前缀 + 逐段编码（encodeURIComponent 会把中文转义）
  if (!downloads.releaseBase) return ''
  return `${downloads.releaseBase}/${encodeURIComponent(item.file)}`
}

export default function Downloads() {
  const groups = downloads.groups || []

  return (
    <SectionShell id="downloads">
      <SectionHeading title={downloads.title} sub={downloads.note} />

      <div className="space-y-10">
        {groups.map((g) => (
          <div key={g.group}>
            {/* 分组标题 */}
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-base font-semibold tracking-tight">{g.group}</h3>
              {g.items?.length ? (
                <span className="text-ink-muted dark:text-ink-muted-dark font-mono text-xs">
                  {g.items.length} 项
                </span>
              ) : null}
            </div>
            {g.desc ? (
              <p className="text-ink-muted dark:text-ink-muted-dark mb-4 text-xs leading-relaxed">
                {g.desc}
              </p>
            ) : null}

            {/* 下载卡片 */}
            <div className="grid gap-2 sm:grid-cols-2">
              {g.items?.map((item) => {
                const href = linkFor(item)

                // 卡片内容（可点和不可点共用）
                const inner = (
                  <>
                    <Icon
                      name="download"
                      className="text-ink-muted dark:text-ink-muted-dark group-hover:text-brand-500 h-4 w-4 shrink-0 transition-colors"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.name}
                    </span>
                    {item.size ? (
                      <span className="text-ink-muted dark:text-ink-muted-dark shrink-0 font-mono text-xs">
                        {item.size}
                      </span>
                    ) : null}
                  </>
                )

                const base =
                  'group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors'

                // 没有 file 的显示成灰色不可点，避免死链
                return href ? (
                  <a
                    key={item.name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${base} border-edge dark:border-edge-dark hover:border-brand-400 dark:hover:border-brand-600 hover:bg-surface-2 dark:hover:bg-surface-2-dark`}
                    title={`下载 ${item.name}`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={item.name}
                    className={`${base} border-edge dark:border-edge-dark bg-surface dark:bg-surface-dark opacity-50`}
                    title="这一项还没有填下载地址"
                  >
                    {inner}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {downloads.footer ? (
        <p className="text-ink-muted dark:text-ink-muted-dark border-edge dark:border-edge-dark mt-10 border-t pt-5 text-xs leading-relaxed">
          {downloads.footer}
        </p>
      ) : null}
    </SectionShell>
  )
}
