/* 把图片地址补成完整可用的地址。

   为什么需要这个？
   src/data/profile.js 里的图片写的是 'screenshots/chat-detail.jpg' 这种短写法，
   方便你手写。但网站在 GitHub Pages 上的地址是：
       https://5h1iky.github.io/portfolio/
   如果直接把短写法交给浏览器，它会解析成：
       https://5h1iky.github.io/screenshots/chat-detail.jpg   ← 少了 /portfolio/，404

   所以这里统一补上前缀。前缀来自 Vite 的 import.meta.env.BASE_URL，
   它会自动等于 vite.config.js 里配的 base（本地是 './'，构建时是 '/portfolio/'）。

   好处：你改内容时完全不用关心这个，照旧写 'screenshots/xxx.jpg' 就行。
   顺便也支持直接写完整的网图地址（https:// 开头的会原样返回）。 */

const BASE = import.meta.env.BASE_URL || './'

export default function assetUrl(path) {
  // 空值直接返回，避免出现 src="undefined"
  if (!path) return ''

  // 已经是完整网址、data: 或绝对路径的，原样返回
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('/')) {
    return path
  }

  // 去掉开头的 './'，避免和 BASE 拼成 '././screenshots/...'
  const clean = path.replace(/^\.\//, '')
  // 确保 BASE 以 / 结尾
  const base = BASE.endsWith('/') ? BASE : BASE + '/'

  return base + clean
}
