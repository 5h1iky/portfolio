# ============================================================
#  开发服务器启动脚本
#
#  为什么需要这个脚本？
#  Vite / esbuild / PostCSS 构建时会往 TEMP 目录写中间文件，
#  默认落在 C 盘。这台机器 C 盘只剩 13.4 GB，所以必须重定向。
#
#  本脚本只改「当前这个进程」的环境变量，不动系统设置。
#
#  用法（在项目根目录执行）：
#      .\dev.ps1
#  然后浏览器打开 http://localhost:5173
# ============================================================

$ErrorActionPreference = "Stop"

# 切到脚本所在目录，这样在任何地方执行都能正确工作
Set-Location -Path $PSScriptRoot

# ── 关键：把临时目录指到 D 盘 ──
$env:TEMP = "D:\www\_temp"
$env:TMP  = "D:\www\_temp"
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null

Write-Host ""
Write-Host "[dev.ps1] TEMP -> $env:TEMP  (C pan is protected)" -ForegroundColor Green
Write-Host "[dev.ps1] Starting Vite dev server on http://localhost:5173" -ForegroundColor Green
Write-Host ""

# 用 npx 调本地 vite，不使用全局安装（全局包目录还在 C 盘）
npx vite
