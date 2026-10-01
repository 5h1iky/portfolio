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
#
#  ⚠️ 这个文件必须存成「UTF-8 带 BOM」。
#  原因：本机没有 PowerShell 7（pwsh 不在 PATH），实际跑的是
#  Windows PowerShell 5.1。而 5.1 读取 .ps1 时，如果文件没有 BOM，
#  会按系统 ANSI 代码页（中文机器上是 GBK）解码 ——
#  于是上面这些中文注释会变成乱码，更糟的是乱码会**吃掉换行**，
#  把下一行代码并进注释里，脚本就以莫名其妙的方式失败
#  （实测报错是「New-Item 的 -Path 是空值」，其实那行赋值被并进注释了）。
#  带 BOM 后 5.1 就会正确按 UTF-8 读，注释和代码都不会串。
#  改这个文件时请保持 BOM，别用会丢 BOM 的工具存。
# ============================================================

$ErrorActionPreference = "Stop"

# 切到脚本所在目录，这样在任何地方执行都能正确工作
Set-Location -Path $PSScriptRoot

# ── 关键：把临时目录指到 D 盘 ──
$env:TEMP = "D:\www\_temp"
$env:TMP = "D:\www\_temp"
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null

# Node 的模块编译缓存默认按 LOCALAPPDATA 定位（在 C 盘），TEMP 重定向管不到它，
# 所以这里单独再指到 D 盘（实测一次全量编译会写约 1.4 MB）。
$env:NODE_COMPILE_CACHE = "D:\www\_temp\node-compile-cache"
New-Item -ItemType Directory -Force -Path $env:NODE_COMPILE_CACHE | Out-Null

# 兜底自检：如果上面哪一行没生效（比如文件编码又被弄坏了），
# 这里会明确报出来，而不是等到 New-Item 抛一个看不懂的"参数为空"。
foreach ($v in @('TEMP', 'TMP', 'NODE_COMPILE_CACHE')) {
    $val = [System.Environment]::GetEnvironmentVariable($v)
    if ([string]::IsNullOrWhiteSpace($val)) {
        Write-Host "[dev.ps1] 启动失败：环境变量 $v 没有被设置成功。" -ForegroundColor Red
        Write-Host "          最常见的原因是本文件丢失了 UTF-8 BOM，请见文件顶部的说明。" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[dev.ps1] TEMP -> $env:TEMP  (C pan is protected)" -ForegroundColor Green
Write-Host "[dev.ps1] NODE_COMPILE_CACHE -> $env:NODE_COMPILE_CACHE" -ForegroundColor Green
Write-Host "[dev.ps1] Starting Vite dev server on http://localhost:5173" -ForegroundColor Green
Write-Host ""

# 用 npx 调本地 vite，不使用全局安装（全局包目录还在 C 盘）
npx vite
