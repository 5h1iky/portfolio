"""精确量出每张截图"内容到哪儿为止"，用来定 crop 值。

和 shot-content-bounds.py 的区别：
  那个是粗量（亮像素占比 > 1% 就算有内容），用来判断"要不要裁"。
  这个更严：先找出每一行的亮度，再看**从底部往上**有多少行是"几乎全黑"，
  并给出几个候选 crop 值供选择，避免裁掉真实内容。

用法：
    python tools/measure-crop.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "public" / "screenshots"

FILES = [
    "gallery/home.jpg",
    "gallery/transfer.jpg",
    "gallery/files.jpg",
    "gallery/settings.jpg",
    "gallery/about.jpg",
]


def analyse(rel: str) -> None:
    p = SHOTS / rel
    if not p.exists():
        print(f"{rel:26} 不存在")
        return

    a = np.asarray(Image.open(p).convert("L")).astype(int)
    h, w = a.shape

    # 每行的"内容量"。用两个阈值各算一遍：
    #   45  普通阈值，能找到浅色文字和卡片
    #   22  很宽松，专门用来抓**深灰色小字** —— 那是亮度统计最容易漏掉的东西，
    #       漏了就会把真内容当成空白裁掉（settings.jpg / about.jpg 差点中招）
    rows = (a > 45).mean(1)
    rows_dim = (a > 22).mean(1)
    # 一行里只要有 0.4% 的亮点就算"有东西"（能抓住单行小字）
    has = rows > 0.004
    has_dim = rows_dim > 0.004

    # 从底部往上数，连续空白的行数
    i = h - 1
    while i >= 0 and not has[i]:
        i -= 1
    last_content = i  # 最后一行有内容的 y

    # 底部留一点呼吸空间，再加 8 行余量，避免贴着内容边缘切
    keep = min(h, last_content + 1 + 8)
    crop = round(keep / h, 3)

    # 给出保守/激进两档，方便按观感挑
    conservative = round(min(1.0, (last_content + 1 + 30) / h), 3)
    aggressive = round(min(1.0, (last_content + 1) / h), 3)

    print(f"{rel:26} {w}x{h}")
    print(f"    内容止于 y={last_content}  (占 {last_content / h * 100:.1f}%)")
    print(f"    底部纯空白 {h - last_content - 1} 行 ({((h - last_content - 1) / h * 100):.1f}%)")
    print(f"    建议 crop: {crop}   保守 {conservative}   激进 {aggressive}")

    # 用宽松阈值再算一次，两次差得多就说明底部有深色小字，别裁
    i2 = h - 1
    while i2 >= 0 and not has_dim[i2]:
        i2 -= 1
    keep_dim = min(h, i2 + 1)
    print(f"    宽松阈值下内容止于 y={i2} (占 {keep_dim / h * 100:.1f}%)")
    if keep_dim - (last_content + 1) > h * 0.03:
        print("    ⚠️ 两种阈值差得多 —— 底部可能有**深灰色小字**。")
        print("       不要去裁！先肉眼打开图看一眼再决定（亮度统计会把暗色文字当空白）。")
    else:
        print("    ✓ 两种阈值接近，底部大概率是真空白")
    print()


if __name__ == "__main__":
    for f in FILES:
        analyse(f)
