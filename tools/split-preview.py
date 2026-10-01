"""把整页长截图切成「看得清又能直接打开」的分段图。

为什么需要这个：
  1440×6388 的整页截图直接贴出来是看不清的 —— 缩放后字全糊，
  不缩放又长到没法看。而且很多看图工具对超长图会拒绝渲染。

  所以统一处理成：按视口高度切成若干段，每段缩到合适宽度，
  存成 JPEG。这样每段都接近正常网页的比例，点开就能读。

用法：
    python tools/split-preview.py <输入长图> <输出目录> <前缀> [每段高度] [目标宽度]

例子：
    python tools/split-preview.py .shots/final/desktop-dark-full.png preview desk 1600 1100
"""

import sys
from pathlib import Path

from PIL import Image

MAX_WIDTH = 1400  # 再大浏览器也会缩，反而更糊


def main() -> None:
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)

    src = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    prefix = sys.argv[3]
    seg_h = int(sys.argv[4]) if len(sys.argv) > 4 else 1600
    target_w = int(sys.argv[5]) if len(sys.argv) > 5 else 1100

    out_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size

        # 先整体缩到目标宽度，再切段 —— 先切后缩会把段边缘的字切坏
        if w > target_w:
            im = im.resize((target_w, round(h * target_w / w)), Image.LANCZOS)
            w, h = im.size

        # 段高也跟着等比缩放，保证每段大概是"一屏多一点"的比例
        seg = max(400, round(seg_h * w / MAX_WIDTH))
        n = (h + seg - 1) // seg

        for i in range(n):
            top = i * seg
            bottom = min(h, top + seg)
            piece = im.crop((0, top, w, bottom))
            name = f"{prefix}-{i + 1:02d}.jpg"
            piece.save(out_dir / name, "JPEG", quality=88, optimize=True)
            print(f"  {name}  {piece.size[0]}x{piece.size[1]}")

        print(f"\n共 {n} 段，输出到 {out_dir}")


if __name__ == "__main__":
    main()
