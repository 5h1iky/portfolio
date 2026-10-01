/* 检查项目里所有文本文件是否被「编码往返」弄坏过。
 *
 * 背景（这个项目踩过的坑）：
 *   本机没有 PowerShell 7，实际跑的是 Windows PowerShell 5.1。
 *   而 5.1 的 Get-Content / Set-Content 默认按**系统 ANSI 代码页**（中文机器上是 GBK）
 *   读写文件，不认 UTF-8。用它读一个 UTF-8 的中文文件再写回去，
 *   中文会变乱码，而且乱码里的字节有时会被当成引号/注释符，
 *   **把后面的换行吃掉**，导致两行合并、代码被并进注释里。
 *
 *   实测后果：dev.ps1 里 `$env:NODE_COMPILE_CACHE = ...` 整行被并进上一行的
 *   中文注释，脚本报「New-Item 的 -Path 是空值」，查了很久才发现是编码问题。
 *
 * 这个脚本检查三件事：
 *   1. 是不是合法 UTF-8（乱码过的话通常还能解出来，所以单看这条不够）
 *   2. 有没有典型的 GBK 误读特征字符（"锛" "鈥" "鍖" 这类）
 *   3. 有没有 U+FFFD 替换字符（真正丢数据的标志）
 *   4. .ps1 文件必须有 BOM —— 否则 PowerShell 5.1 会按 ANSI 读，直接出问题
 *
 * 用法：node tools/check-encoding.mjs
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.shots', 'preview'])

// 会被读成文本的扩展名
const TEXT_EXT = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.css', '.html',
  '.json', '.md', '.ps1', '.py', '.yml', '.yaml', '.txt', '.gitignore',
])

// GBK 误读 UTF-8 中文后的典型残留字符。这些字本身是合法汉字，
// 所以不会被"是否合法 UTF-8"发现 —— 必须专门找。
const MOJIBAKE = ['锛', '鈥', '鍖', '銆', '镐', '鐨', '涓', '鏂', '鍜', '涔', '鏄', '浣', '寮', '鑴', '鎵', '缂', '缁', '璺', '鍥']

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const files = walk(ROOT)
let problems = 0
let checked = 0

for (const f of files) {
  const ext = extname(f).toLowerCase()
  const base = f.split(/[\\/]/).pop()
  if (!TEXT_EXT.has(ext) && base !== '.gitignore' && base !== '.npmrc') continue

  checked++
  const buf = readFileSync(f)
  const rel = relative(ROOT, f).replace(/\\/g, '/')

  // 1) BOM 检查（.ps1 必须要有）
  const hasBOM = buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf
  if (ext === '.ps1' && !hasBOM) {
    console.log(`❌ ${rel}\n     .ps1 缺少 UTF-8 BOM —— PowerShell 5.1 会按 ANSI 读它，中文注释会变乱码并吃掉换行`)
    problems++
  }

  // 2) 合法 UTF-8 检查
  let text
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    console.log(`❌ ${rel}\n     不是合法的 UTF-8（有非法字节序列）`)
    problems++
    continue
  }

  // 3) 替换字符 = 真的丢过数据
  if (text.includes('\uFFFD')) {
    const n = (text.match(/\uFFFD/g) || []).length
    console.log(`❌ ${rel}\n     含 ${n} 个 U+FFFD 替换字符（说明解码时丢过数据）`)
    problems++
  }

  // 4) GBK 误读特征
  const hits = MOJIBAKE.filter((c) => text.includes(c))
  if (hits.length) {
    const lines = text.split('\n')
    const bad = []
    lines.forEach((l, i) => {
      if (MOJIBAKE.some((c) => l.includes(c))) bad.push(i + 1)
    })
    console.log(
      `⚠️  ${rel}\n     疑似 GBK 误读残留字符 ${hits.join('')}，出现在第 ${bad.slice(0, 8).join(', ')} 行`,
    )
    problems++
  }
}

console.log(`\n──────────────`)
console.log(`检查了 ${checked} 个文本文件，发现问题 ${problems} 处`)
if (problems === 0) console.log('全部干净 ✓')
