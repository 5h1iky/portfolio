"""量一下每张截图"内容到哪儿为止"，判断是不是有大量空白。

为什么需要这个：
  手表/手机截图如果底下有一大段纯黑空白，缩略图就会看起来像个空盒子。
  这个脚本按行统计"亮像素占比"，找出最后一行还有内容的 y，
  从而判断该不该裁掉空白。

用法：python tools/shot-content-bounds.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "public" / "screenshots"

# 只处理较长的截图（短的本来就没什么空白问题）
FILES = [
    "chat-detail.jpg",
    "chat-empty.jpg",
    "settings.jpg",
    "worldbook.jpg",
    "gallery/home.jpg",
    "gallery/about.jpg",
    "gallery/files.jpg",
    "gallery/settings.jpg",
    "gallery/transfer.jpg",
]


def main() -> None:
    for rel in FILES:
        p = SHOTS / rel
        if not p.exists():
            print(f"{rel:34} 不存在")
            continue
        a = np.asarray(Image.open(p).convert("L")).astype(int)
        h, w = a.shape
        # 每行"亮像素"的占比。阈值 60 是试出来的：能过滤掉纯黑背景，
        # 又不会把深灰卡片当成空白。
        rows = (a > 60).mean(1)
        hits = np.nonzero(rows > 0.01)[0]
        last = int(hits[-1]) if len(hits) else 0
        pct = last / h * 100
        verdict = "空白多，建议裁" if pct < 88 else "基本占满"
        print(f"{rel:34} {w}x{h}  内容止于 y={last:5d} ({pct:5.1f}%)  {verdict}")


if __name__ == "__main__":
    main()
