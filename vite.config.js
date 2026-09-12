import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // 资源路径。
  //  - 开发时（npm run dev）：用 './'，随便从哪访问都行
  //  - 构建时（npm run build）：用 '/仓库名/'，因为 GitHub Pages 的地址是
  //         https://5h1iky.github.io/portfolio/
  //    如果这里写 './' 会出问题：浏览器会把 img 的 "screenshots/a.jpg"
  //    解析成 https://5h1iky.github.io/screenshots/a.jpg（少了仓库名），图片全部 404。
  //    所以构建时必须带上仓库名前缀。
  //  - 换仓库名部署：把下面的 'portfolio' 改成你的仓库名即可。
  base: command === 'build' ? '/portfolio/' : './',

  server: {
    // 3080 被 DeepSeek Harness 的 Web 界面占用，这里固定用 5173，不要改。
    port: 5173,
    strictPort: true,
    open: false,

    // ⚠️ 这段是为了绕开一个 Windows 上的坑（不要删）：
    // 某些编辑器（包括 AI 助手）保存文件时，会先在目录里建一个临时文件夹
    // （形如 .Hero.jsx.1234.xxxx.tmpdir），写完再改名。
    // Vite 的文件监听器如果正好扫到它，会去 watch 一个马上消失的临时文件，
    // 在 Windows 上直接抛 EBUSY 报错，把整个开发服务器搞崩。
    // 下面这行让监听器忽略所有以点开头的临时目录，从根上避免崩溃。
    watch: {
      ignored: ['**/.*.tmpdir/**', '**/.*.tmp'],
    },
  },

  build: {
    outDir: 'dist',
    // 关掉 sourcemap：体积更小，也不往外暴露源码结构
    sourcemap: false,
  },
}))
