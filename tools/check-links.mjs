/* ============================================================================
   下载链接自检

   作用：检查 src/data/profile.js 里所有下载项，链接是否真的能下载。
   什么时候用：上传了新关卡、或者怀疑某个链接失效时。

   用法（在项目根目录执行）：
       node --use-system-ca tools\check-links.mjs

   ⚠️ --use-system-ca 不能省。
   这台机器上有代理/VPN 做证书拦截，Node 自带的 CA 列表会报
   UNABLE_TO_VERIFY_LEAF_SIGNATURE，加上这个参数才会用系统证书库。
   ============================================================================ */

import { downloads } from '../src/data/profile.js'

// 只取文件头 1 个字节，不会真的把几百 MB 拉下来
const HEADERS = { 'User-Agent': 'Mozilla/5.0', Range: 'bytes=0-0' }

function linkFor(item) {
  if (!item?.file) return ''
  if (/^https?:\/\//.test(item.file)) return item.file
  if (!downloads.releaseBase) return ''
  return `${downloads.releaseBase}/${encodeURIComponent(item.file)}`
}

let ok = 0
let fail = 0
let skip = 0

for (const group of downloads.groups || []) {
  console.log(`\n【${group.group}】`)
  for (const item of group.items || []) {
    const url = linkFor(item)
    if (!url) {
      skip++
      console.log(`  ⏭  未填地址  ${item.name}`)
      continue
    }
    try {
      const r = await fetch(url, { headers: HEADERS, redirect: 'follow' })
      if (r.status === 200 || r.status === 206) {
        const total = r.headers.get('content-range')?.split('/')?.[1]
        const mb = total ? (Number(total) / 1048576).toFixed(1) + ' MB' : ''
        ok++
        console.log(`  ✅ 可下载  ${mb.padStart(9)}  ${item.name}`)
      } else {
        fail++
        console.log(`  ❌ HTTP ${r.status}  ${item.name}`)
        console.log(`        ${url}`)
      }
    } catch (e) {
      fail++
      console.log(`  ❌ 请求失败  ${item.name} — ${e.cause?.code || e.message}`)
      console.log(`        ${url}`)
    }
    // 别把 GitHub 请求打得太密
    await new Promise((r) => setTimeout(r, 250))
  }
}

console.log(`\n──────────────`)
console.log(`可下载 ${ok} 个，失败 ${fail} 个，未填地址 ${skip} 个`)
if (fail > 0) {
  console.log('\n失败通常有两个原因：')
  console.log('  1. 文件名写错了（GitHub 会改写上传的文件名，见 docs/EDITING.md）')
  console.log('  2. 文件还没上传到 release')
  process.exitCode = 1
}
