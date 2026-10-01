import { useMemo, useState } from 'react'
import { downloads } from '../data/profile.js'
import Icon from './Icon.jsx'
import Reveal from './Reveal.jsx'

/* 下载区里的一个分组：标题 + 说明 + 一份可搜索/可排序的文件表。

   内容全在 src/data/profile.js 的 downloads 里，加文件不用改这个组件。

   ── 为什么要做成表，还要能搜索排序 ──────────────────────────────────
   这里是全站信息最密的地方：16 个关卡包，每个都有名字、日期、大小。
   原来的做法是两列小卡片一路铺下去，整屏都是重复的圆角方块，
   既占地方又不好找。

   改成表以后：一行一个文件，名字/日期/大小三列对齐，一屏能看十几个；
   再加一个搜索框和两种排序（按名字 / 按时间），找东西不用再一行行扫。
   搜索和排序都是浏览器里算的，纯静态站点也能用，不依赖任何后端。

   链接规则（两种写法都支持）：
     · file 写完整网址（http 开头）→ 原样使用，比如跳去 GitHub Releases
     · file 只写文件名            → 自动拼上 downloads.releaseBase 前缀

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

// "90.3 MB" → 90.3；解析不出来就当 0（排在最后）
function sizeNum(s) {
  const m = String(s || '').match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

export default function DownloadGroup({ group: g }) {
  const [q, setQ] = useState('')
  // 'default' = 数据文件里的顺序；'date' = 新到旧；'name' = 字母序
  const [sort, setSort] = useState('default')

  const items = g.items || []

  // 过滤 + 排序。
  // 用 useMemo 是因为列表有 16 行、每次输入都要重算，没必要每帧都算一遍。
  const shown = useMemo(() => {
    const key = q.trim().toLowerCase()
    let list = key
      ? items.filter(
          (it) =>
            it.name.toLowerCase().includes(key) ||
            (it.date || '').includes(key) ||
            (it.note || '').toLowerCase().includes(key),
        )
      : items.slice()

    if (sort === 'date') {
      list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    } else if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
    }
    return list
  }, [items, q, sort])

  return (
    <Reveal className="stagger">
      {/* ── 分组标题行 ── */}
      <div className="border-hair flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b pb-3">
        <h3 className="text-h3 font-semibold">{g.group}</h3>
        <span className="spec text-fg-muted">
          {shown.length}
          {q ? ` / ${items.length}` : ''} 项
        </span>
        {g.desc ? <p className="text-fg-muted w-full text-small">{g.desc}</p> : null}
      </div>

      {/* ── 工具条：搜索 + 排序 ──
          只有文件多到需要找的时候才显示（超过 5 个），
          不然一个组里就 3 个文件还配个搜索框，纯属添乱。 */}
      {items.length > 5 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="border-hair focus-within:border-accent-dim flex flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors duration-150 sm:max-w-64">
            <Icon name="search" className="text-fg-muted h-3.5 w-3.5 shrink-0" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索关卡名或日期…"
              className="text-small placeholder:text-fg-muted w-full min-w-0 bg-transparent outline-none"
              aria-label={`在「${g.group}」里搜索`}
            />
          </label>

          <div className="border-hair flex shrink-0 items-center gap-0.5 rounded-md border p-0.5">
            {[
              { k: 'default', label: '默认' },
              { k: 'date', label: '最新' },
              { k: 'name', label: '名称' },
            ].map((o) => (
              <button
                key={o.k}
                type="button"
                onClick={() => setSort(o.k)}
                aria-pressed={sort === o.k}
                className={`spec rounded-sm px-2 py-1 transition-colors duration-150 ${
                  sort === o.k
                    ? 'bg-accent-wash text-accent'
                    : 'text-fg-muted hover:text-fg-soft'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── 文件表 ──
          ⚠️ minmax(0,1fr) 不能简化成 1fr：
          CSS 网格项默认 min-width:auto，长文件名不肯收缩，
          会把整页顶宽导致手机上出现横向滚动条。
          minmax(0,1fr) 才允许被压窄，文字才会走省略号。 */}
      {shown.length ? (
        <ul
          style={{ '--sd': '80ms' }}
          className="stagger border-hair mt-3 grid grid-cols-[minmax(0,1fr)] border-t sm:grid-cols-2 sm:gap-x-8"
        >
          {shown.map((it, i) => {
            const href = linkFor(it)
            const inner = (
              <>
                <Icon
                  name="download"
                  className="text-fg-muted group-hover:text-accent h-3.5 w-3.5 shrink-0 transition-colors duration-150"
                />
                <span className="text-small min-w-0 flex-1 truncate">{it.name}</span>
                {it.note ? <span className="spec text-fg-muted shrink-0">{it.note}</span> : null}
                <span className="num text-fg-muted hidden shrink-0 text-[0.6875rem] sm:inline">
                  {it.date}
                </span>
                <span className="num text-fg-muted w-14 shrink-0 text-right text-[0.6875rem]">
                  {it.size}
                </span>
              </>
            )

            const base =
              'group border-hair-soft flex min-w-0 items-center gap-2.5 border-b py-2.5'
            // 每一行比上一行晚 24ms 出现。行多，间隔要比其它区块更小才不拖沓。
            const rowStyle = { '--sd': `${i * 24}ms` }

            // 没有 file 的显示成灰色不可点，避免死链
            return (
              <li key={it.name} style={rowStyle}>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={`下载 ${it.name}`}
                    className={`${base} hover:text-accent transition-colors duration-150`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={`${base} text-fg-muted opacity-55`} title="这一项还没有填下载地址">
                    {inner}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        // 搜不到东西时给一句明确的提示，不要让区块凭空消失
        <p className="text-fg-muted border-hair-soft mt-3 border-t py-6 text-small">
          没有匹配「{q}」的文件。
          <button
            type="button"
            onClick={() => setQ('')}
            className="text-accent ml-1 underline underline-offset-2"
          >
            清空搜索
          </button>
        </p>
      )}

      {/* 收录曲目（只有配了 topics 的分组才显示） */}
      {g.topics?.length ? (
        <div className="border-hair-soft mt-5 border-t pt-4">
          <h4 className="spec text-fg-muted mb-2.5">部分收录曲目</h4>
          <ul className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
            {g.topics.map((t) => (
              <li key={t} className="text-fg-muted num text-[0.6875rem] leading-relaxed">
                {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Reveal>
  )
}
