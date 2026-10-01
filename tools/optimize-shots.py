"""把 public/screenshots 里的原始截图压缩成网页用的尺寸。

来源截图是手机/手表导出的原图（最长边可达 3050px，单张 300KB+），
直接放进网页会让首屏变慢，所以统一压到「显示尺寸的 2 倍」，够清晰又不浪费。

用法：
    python tools/optimize-shots.py

处理规则：
  · 手机竖屏截图（SAChat / 腕上音符）  → 宽 640，JPEG q82
  · 手表截图（腕能图库，1:1 圆屏）      → 宽 480，JPEG q82
  · 已经在目标尺寸以内、且体积更小的，跳过不覆盖
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "public" / "screenshots"

# (子目录, 目标宽度)  —— 子目录为 None 表示 screenshots 根目录
TARGETS = [
    (None, 640),          # SAChat 手机截图
    ("wanshang", 640),    # 腕上音符：372x430 手表截图，原图就很小，基本原样保留
    ("gallery", 480),     # 腕能图库：1:1 长图，压到 480 宽
]


def convert(path: Path, target_w: int) -> str:
    """按目标宽度等比缩放并转成 JPEG。返回一行结果说明。"""
    before = path.stat().st_size
    with Image.open(path) as im:
        im = im.convert("RGB")
        w, h = im.size
        if w > target_w:
            im = im.resize((target_w, round(h * target_w / w)), Image.LANCZOS)
        out = path.with_suffix(".jpg")
        im.save(out, "JPEG", quality=82, optimize=True, progressive=True)

    after = out.stat().st_size
    # 输出和输入同名（.jpg）时直接覆盖；不同名时删掉原始 png
    if out != path:
        path.unlink()
    saved = (1 - after / before) * 100 if before else 0
    return (
        f"  {out.name:<22} {w}x{h} -> {im.size[0]}x{im.size[1]}   "
        f"{before / 1024:7.1f} KB -> {after / 1024:6.1f} KB  (-{saved:.0f}%)"
    )


def main() -> None:
    total_before = total_after = 0
    for sub, width in TARGETS:
        folder = SHOTS / sub if sub else SHOTS
        if not folder.exists():
            print(f"[skip] {folder} 不存在")
            continue
        print(f"\n[{sub or 'screenshots'}] 目标宽度 {width}px")
        for f in sorted(folder.iterdir()):
            if f.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
                continue
            before = f.stat().st_size
            print(convert(f, width))
            after = f.with_suffix(".jpg").stat().st_size
            total_before += before
            total_after += after

    if total_before:
        print(
            f"\n合计 {total_before / 1024 / 1024:.2f} MB -> "
            f"{total_after / 1024 / 1024:.2f} MB  "
            f"(省 {(1 - total_after / total_before) * 100:.0f}%)"
        )


if __name__ == "__main__":
    main()
