/* 全站复用的两个小组件：区块外壳、区块标头。

   想调「区块之间的疏密」→ 改下面 SectionShell 里的 py-*。
   想调「整页内容的宽度」→ 改 index.css 里的 shell（搜 shell 就能找到）。 */

import Reveal from './Reveal.jsx'

/* 从 profile.js 的 sections 数组里查某个区块类型的 id。
   为什么要这样绕一下：区块 id 是数据（在 profile.js 里），
   但锚点的落点由组件决定。如果两边各写一份，改了数据忘了改组件时，
   导航不会报错、只会**静默地不再高亮**，很难发现。
   所以组件统一来这里取，保证只有一个来源。

   查不到时退回 fallback（保持页面能用，不因为数据写错就白屏）。 */
export function idOf(sections, type, fallback) {
  const hit = sections?.find((s) => s.type === type)
  if (!hit) {
    console.warn(`[profile.js] sections 里没有 type "${type}"，区块 id 退回 "${fallback}"`)
    return fallback
  }
  return hit.id
}

/* 区块外壳：统一左右留白和上下间距。
   ⚠️ scroll-mt-16 不能删：导航栏是吸顶的，不加的话点导航跳过来时
   区块标题会被导航栏盖住。 */
export function SectionShell({ id, children, className = '' }) {
  return (
    <section id={id} className={`shell scroll-mt-16 py-16 sm:py-24 ${className}`}>
      {children}
    </section>
  )
}

/* 区块标头。
   用的是「等宽编号 + 中文标题 + 一条拉到底的发丝横线」这个组合，
   而不是常见的「小标题 + 大标题 + 一段说明」三段式套娃——
   那种在每个区块重复一次会显得很模板化。

   num   左边那个等宽编号，如 '01'
   title 区块标题
   aside 标题右侧的补充信息（如"共 5 件"），可省 */
export function SectionHead({ num, title, aside }) {
  return (
    <Reveal className="mb-8 sm:mb-10">
      <div className="flex items-baseline gap-3 sm:gap-4">
        <span className="spec text-accent shrink-0">{num}</span>
        <h2 className="text-h2 shrink-0 font-semibold">{title}</h2>
        {/* 这条线把标题和右侧信息连起来，是版面上的"骨架"，不是装饰 */}
        <span aria-hidden="true" className="bg-hair hidden h-px flex-1 sm:block" />
        {aside ? <span className="spec text-fg-muted hidden shrink-0 sm:block">{aside}</span> : null}
      </div>
    </Reveal>
  )
}
