import Icon from './Icon.jsx'
import Screenshots from './Screenshots.jsx'

/* 单个作品。内容全部来自 src/data/profile.js 的 projects 数组，
   所以加新作品不用碰这个文件。

   ── 为什么不做成"卡片" ──────────────────────────────────────────────
   常见的做法是每个项目一张圆角大卡片、上下堆叠。问题是这样下来每个项目
   长得一模一样，读者分不清哪个是重点，而且卡片本身会吃掉大量留白。

   这里改成"规格表"（spec sheet）：一块面板里，左边一列竖直排项目参数，
   右边是叙述和亮点，最下面是横滑截图。
   参数用等宽字竖排，读起来像在看一份产品规格，比堆形容词可信得多。

   ── 每个字段对应哪一块 ──────────────────────────────────────────────
     num          左上角的编号（由 Projects.jsx 按顺序传进来）
     name/subname 标题行
     status       标题行右侧的状态标签，如"持续维护"
     meta         左边那列规格表，一行一条 { k, v }
     tags         规格表下面那排小标签
     description  右侧正文
     highlights   右侧要点列表
     links        右侧链接按钮
     shots        底部截图（见 Screenshots.jsx） */

export default function ProjectCard({ project: p, num }) {
  const hasMeta = p.meta?.length || p.tags?.length

  return (
    <article className="panel rounded-lg">
      {/* ── 标题行 ── */}
      <header className="border-hair flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b px-5 py-4 sm:px-6">
        {num ? <span className="spec text-fg-muted">{num}</span> : null}
        <h3 className="text-h3 font-semibold">{p.name}</h3>
        {p.subname ? <span className="num text-fg-muted text-small">{p.subname}</span> : null}

        {/* 状态标签推到最右边。没有 status 就直接不显示，不留空位。 */}
        {p.status ? (
          <span className="border-accent-dim text-accent ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2 py-0.5">
            <span className="bg-accent h-1 w-1 rounded-full" />
            <span className="spec">{p.status}</span>
          </span>
        ) : null}
      </header>

      {/* ── 主体：左规格表 / 右叙述 ── */}
      <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-7">
        {/* 左：规格表 + 标签 */}
        {hasMeta ? (
          <div className="lg:col-span-3">
            {p.meta?.length ? (
              <dl className="border-hair border-t">
                {p.meta.map((m) => (
                  <div
                    key={m.k}
                    className="border-hair-soft flex items-baseline justify-between gap-3 border-b py-2"
                  >
                    <dt className="spec text-fg-muted shrink-0">{m.k}</dt>
                    <dd className="num text-fg text-small text-right">{m.v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {p.tags?.length ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <li
                    key={t}
                    className="border-hair text-fg-soft num rounded-sm border px-1.5 py-0.5 text-[0.6875rem]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {/* 右：正文 + 亮点 */}
        <div className={hasMeta ? 'lg:col-span-9' : 'lg:col-span-12'}>
          <p className="text-fg-soft leading-relaxed">{p.summary}</p>

          {p.description ? (
            <p className="text-fg-soft mt-4 text-small leading-relaxed">{p.description}</p>
          ) : null}

          {p.highlights?.length ? (
            <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {p.highlights.map((h) => (
                <li key={h} className="text-fg-soft flex gap-2.5 text-small leading-relaxed">
                  {/* 小方块而不是圆点：方点更"工程"，和整体的直角调子一致 */}
                  <span className="bg-accent-dim mt-[0.5rem] h-1 w-1 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          ) : null}

          {p.links?.length ? (
            // items-start + 每个按钮自带注释：按钮排成一行，注释挂在各自按钮下面，
            // 所以一行里按钮不会因为别的按钮有注释就被拉高。
            <div className="mt-6 flex flex-wrap items-start gap-x-2.5 gap-y-3">
              {p.links.map((l) => {
                // 按链接内容自动挑图标（也可以在数据里写 icon 直接指定）
                const icon =
                  l.icon ||
                  (/lanzou|pan\.|123pan|aliyundrive|quark|蓝奏|网盘/.test(l.href + l.label)
                    ? 'cloud'
                    : l.label.includes('下载') || l.label.includes('APK')
                      ? 'download'
                      : 'external')
                return (
                  <div key={l.href} className="flex flex-col items-start gap-1">
                    <a
                      href={l.href}
                      {...(l.href.startsWith('http')
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                      className="border-hair text-fg-soft hover:border-fg-muted hover:text-fg inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-small transition-colors duration-150"
                    >
                      <Icon name={icon} className="h-3.5 w-3.5 shrink-0" />
                      {l.label}
                    </a>
                    {l.note ? (
                      <span className="spec text-fg-muted max-w-56 leading-relaxed">{l.note}</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── 底部截图（没有截图的项目这一段自动不渲染）── */}
      {p.shots?.items?.length ? (
        <div className="border-hair border-t px-5 py-5 sm:px-6">
          <Screenshots shots={p.shots} />
        </div>
      ) : null}
    </article>
  )
}
