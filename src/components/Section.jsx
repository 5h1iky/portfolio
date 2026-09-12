/* 一个区块的外壳：统一所有区块的左右留白、上下间距和标题样式。

   想调「区块之间的疏密」，改下面 SECTION_WRAP 里的 py-20 sm:py-28。
   想调「内容的最大宽度」（现在约 1100px），改 max-w-5xl。 */

const SECTION_WRAP = 'mx-auto w-full max-w-5xl px-5 sm:px-8'

export function SectionShell({ id, children }) {
  return (
    <section id={id} className={`${SECTION_WRAP} py-16 sm:py-24`}>
      {children}
    </section>
  )
}

export function SectionHeading({ title, sub }) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-3">
        {/* 标题左边那根渐变竖条 */}
        <span className="grad-bg h-5 w-1 rounded-full" />
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      {sub ? (
        <p className="text-ink-muted dark:text-ink-muted-dark mt-3 text-sm sm:ml-4">
          {sub}
        </p>
      ) : null}
    </div>
  )
}

export { SECTION_WRAP }
