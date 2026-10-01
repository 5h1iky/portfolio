/* ============================================================================
   下载链接自检

   作用：检查 src/data/profile.js 里所有下载项，链接是否真的可用。
   什么时候用：上传了新关卡、或者怀疑某个链接失效时。

   用法（在项目根目录执行）：
       node tools\check-links.mjs

   ── 为什么不用 fetch 直接请求那些下载地址（踩过的坑）────────────────
   GitHub 的 release 下载地址会把请求 302 到 objects.githubusercontent.com，
   而**这台机器所在的网络取不到那个域名**（和 raw.githubusercontent.com 一样被挡）。
   于是每个链接都会报 UND_ERR_CONNECT_TIMEOUT，
   看起来像"19 个链接全挂了"，其实链接本身完全正常 —— 纯粹是网络环境问题。

   所以这里改成**问 GitHub API 要资产清单**，再拿本地数据去比对：
     · gh CLI 已登录（读 Windows 凭据管理器里的令牌），配额 5000 次/小时
     · 只走 api.github.com，不碰被封的域名
     · 比对的是"这个文件在不在 release 里"，比"能不能下载"更接近真正想验证的事
   ============================================================================ */

import { execFileSync } from 'node:child_process'
import { downloads } from '../src/data/profile.js'

/** 调一次 gh api，返回解析后的 JSON。失败就抛出，由调用方兜底。 */
function ghApi(path) {
  const out = execFileSync('gh', ['api', path], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  return JSON.parse(out)
}

/** 把 release 里的资产名收集成一个 Set */
function assetNames(repo, tag) {
  const path = tag
    ? `repos/${repo}/releases/tags/${tag}`
    : `repos/${repo}/releases?per_page=20`
  const data = ghApi(path)
  const releases = Array.isArray(data) ? data : [data]
  const names = new Set()
  for (const r of releases) for (const a of r.assets || []) names.add(a.name)
  return names
}

function linkFor(item) {
  if (!item?.file) return ''
  if (/^https?:\/\//.test(item.file)) return item.file
  if (!downloads.releaseBase) return ''
  return `${downloads.releaseBase}/${encodeURIComponent(item.file)}`
}

// releaseBase 形如 https://github.com/<owner>/<repo>/releases/download/<tag>
const base = downloads.releaseBase || ''
const m = base.match(/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)/)
const LEVELS = m ? { repo: `${m[1]}/${m[2]}`, tag: m[3] } : null

let ok = 0
let fail = 0
let skip = 0

// 先把需要的资产清单拉下来（只要两个仓库，不用逐个文件请求）
let levelsAssets = null
if (LEVELS) {
  try {
    levelsAssets = assetNames(LEVELS.repo, LEVELS.tag)
    console.log(`已取到 ${LEVELS.repo} 的 release「${LEVELS.tag}」资产清单：${levelsAssets.size} 个文件`)
  } catch (e) {
    console.log(`⚠️ 取 ${LEVELS.repo} 资产清单失败：${e.message}`)
    console.log('   （gh 没登录或没网时会出现；这时下面的关卡链接无法核对）')
  }
} else {
  console.log('⚠️ downloads.releaseBase 里没解析出 GitHub 仓库，关卡链接无法核对')
}

// 各 App 的 releases 页集合，按需缓存
const appAssets = new Map()

for (const group of downloads.groups || []) {
  console.log(`\n【${group.group}】`)
  for (const item of group.items || []) {
    const url = linkFor(item)
    if (!url) {
      skip++
      console.log(`  ⏭  未填地址  ${item.name}`)
      continue
    }

    // 情况一：指向某个仓库的 releases 列表页（App 下载）
    const rm = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)\/releases\/?$/)
    if (rm) {
      const repo = rm[1]
      try {
        if (!appAssets.has(repo)) appAssets.set(repo, assetNames(repo))
        const names = appAssets.get(repo)
        if (names.size) {
          ok++
          console.log(`  ✅ 有 release  ${String(names.size).padStart(3)} 个资产  ${item.name}`)
        } else {
          fail++
          console.log(`  ❌ 该仓库没有任何 release 资产  ${item.name}`)
        }
      } catch (e) {
        fail++
        console.log(`  ❌ 查询失败  ${item.name} — ${e.message}`)
      }
      continue
    }

    // 情况二：关卡包，指向具体的 zip
    if (url.includes('/releases/download/')) {
      const file = decodeURIComponent(url.split('/').pop())
      if (!levelsAssets) {
        skip++
        console.log(`  ⏭  资产清单不可用，跳过  ${item.name}`)
      } else if (levelsAssets.has(file)) {
        ok++
        console.log(`  ✅ 存在于 release  ${file}`)
      } else {
        fail++
        console.log(`  ❌ release 里没有这个文件：${file}  （${item.name}）`)
      }
      continue
    }

    skip++
    console.log(`  ⏭  无法识别的链接形式  ${item.name}`)
  }
}

console.log(`\n──────────────`)
console.log(`可用 ${ok} 个，失败 ${fail} 个，跳过 ${skip} 个`)
if (fail > 0) {
  console.log('\n失败通常有两个原因：')
  console.log('  1. 文件名写错了（GitHub 会改写上传的文件名，见 docs/EDITING.md）')
  console.log('  2. 文件还没上传到 release')
  process.exitCode = 1
}
