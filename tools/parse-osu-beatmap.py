"""从 osu! 谱面页面里把真正的"难度列表"抠出来。

⚠️ 这个脚本**自己不发网络请求**，只读已经存好的 HTML 文件。
原因：osu.ppy.sh 对 Python 的 urllib 直接返回 403（Cloudflare 挡），
所以抓取这一步交给 PowerShell 做，而且**必须带 -UseBasicParsing**：

    $H = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36' }
    New-Item -ItemType Directory -Force -Path 'D:\\www\\_temp\\osu' | Out-Null
    Invoke-WebRequest -Uri "https://osu.ppy.sh/beatmapsets/2609977" `
        -Headers $H -UseBasicParsing -OutFile 'D:\\www\\_temp\\osu\\2609977.html'

  ↑ -UseBasicParsing 不能省。不加的话 PowerShell 会走 IE 的 DOM 解析器，
    对带脚本的页面会弹一个"是否继续执行"的安全确认框，很烦人。

用法：
    python tools/parse-osu-beatmap.py 2609977 2584217
    python tools/parse-osu-beatmap.py --dir D:\\somewhere 2609977

── 为什么不能直接对整页做正则 ──────────────────────────────────────
谱面页把数据放在 <script id="json-beatmapset"> 里。
而页面**同时**还嵌了 mania / taiko / catch 的"预览难度"
（version 形如 [4K] hard、[7K] Tell Me : EXTRA），
那是页面为了切换模式准备的替身，不是真实难度。
直接数整页的 "difficulty_rating" 会出现好几倍的重复计数，
必须只读 json-beatmapset 里的 beatmaps 数组。
"""

import json
import os
import re
import sys

DEFAULT_DIR = os.environ.get("OSU_HTML_DIR", r"D:\www\_temp\osu")

# 页面里真正放数据的那一段
SCRIPT_RE = re.compile(
    r'<script[^>]*id="json-beatmapset"[^>]*>(.*?)</script>', re.S
)

MODES = {0: "osu!std", 1: "taiko", 2: "catch", 3: "mania"}


def unescape(html: str) -> str:
    """把 HTML 实体换回普通字符。

    有的页面会把 JSON 转义成 &quot; 形式，有的不会；
    统一先解一遍，两种情况就都能处理。"""
    return (
        html.replace("&quot;", '"')
        .replace("&amp;", "&")
        .replace("&#39;", "'")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
    )


def report(bsid: str, folder: str) -> None:
    path = os.path.join(folder, f"{bsid}.html")
    if not os.path.exists(path):
        print(f"[{bsid}] 找不到 {path}")
        print("        请先用 PowerShell 存页面（见本文件顶部说明）")
        return

    with open(path, encoding="utf-8", errors="replace") as f:
        page = unescape(f.read())

    m = SCRIPT_RE.search(page)
    if not m:
        print(f"[{bsid}] 页面里找不到 <script id=\"json-beatmapset\">")
        return

    try:
        meta = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        print(f"[{bsid}] JSON 解析失败：{e}")
        return

    diffs = [d for d in (meta.get("beatmaps") or []) if isinstance(d, dict) and d.get("id")]

    print(f"\n{'=' * 74}")
    print(f"[{bsid}] {meta.get('artist')} - {meta.get('title')}")
    print(f"{'=' * 74}")
    print(f"  mapper       : {meta.get('creator')}  (user_id={meta.get('user_id')})")
    print(f"  状态         : {meta.get('status')}")
    print(f"  BPM          : {meta.get('bpm')}")
    print(f"  提交 / 更新  : {meta.get('submitted_date')}  /  {meta.get('last_updated')}")
    print(f"  游玩 / 收藏  : {meta.get('play_count')} / {meta.get('favourite_count')}")
    print(f"  曲长         : {meta.get('total_length')}s")
    print(f"  ★ 真实难度数 : {len(diffs)}")
    for d in diffs:
        print(
            f"      · {str(d.get('version')):<26}"
            f"{d.get('difficulty_rating', 0):>6.2f}★  "
            f"{MODES.get(d.get('mode_int'), '?'):<8}"
            f"长度 {d.get('total_length')}s  combo {d.get('max_combo')}"
        )

    authors = {d.get("user_id") for d in diffs}
    own = authors == {meta.get("user_id")}
    print(
        f"  难度作者     : {authors}  → "
        + ("全部难度都是本人做的（没有 guest 难度）" if own else "⚠️ 含他人制作的 guest 难度")
    )


if __name__ == "__main__":
    argv = sys.argv[1:]
    folder = DEFAULT_DIR
    if "--dir" in argv:
        i = argv.index("--dir")
        folder = argv[i + 1]
        del argv[i : i + 2]
    for t in argv or ["2609977", "2584217"]:
        report(t, folder)
