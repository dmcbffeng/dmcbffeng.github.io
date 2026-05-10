#!/usr/bin/env python3
"""
Generate optimized travel thumbnails for the world map.

Typical usage:
  python3 scripts/generate_travel_thumbnails.py

This script:
  1) Reads images from assets/images/travel
  2) Writes thumbnails to assets/images/travel/thumbs
  3) Optionally rewrites data/world.json thumbnail paths
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image, ImageOps
except ImportError as exc:  # pragma: no cover - runtime guidance
    raise SystemExit(
        "Pillow is required. Install it with:\n"
        "  python3 -m pip install Pillow"
    ) from exc


SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate optimized thumbnails for travel photos."
    )
    parser.add_argument(
        "--input-dir",
        default="assets/images/travel",
        help="Directory containing original travel photos.",
    )
    parser.add_argument(
        "--output-dir",
        default="assets/images/travel/thumbs",
        help="Directory to save generated thumbnails.",
    )
    parser.add_argument(
        "--max-size",
        type=int,
        default=360,
        help="Max pixel size of the longest edge (default: 360).",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="JPEG/WebP quality (default: 82).",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing thumbnails.",
    )
    parser.add_argument(
        "--rewrite-world-json",
        action="store_true",
        help="Rewrite data/world.json thumbnail paths to generated files.",
    )
    parser.add_argument(
        "--world-json",
        default="data/world.json",
        help="Path to world.json (used with --rewrite-world-json).",
    )
    return parser.parse_args()


def iter_images(root: Path, exclude_prefix: Path | None = None) -> Iterable[Path]:
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in SUPPORTED_EXTS:
            continue
        if exclude_prefix and exclude_prefix in path.parents:
            continue
        yield path


def save_thumbnail(src: Path, dst: Path, max_size: int, quality: int) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

        suffix = dst.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            image.save(dst, quality=quality, optimize=True, progressive=True)
        elif suffix == ".webp":
            image.save(dst, quality=quality, method=6)
        else:
            image.save(dst, optimize=True)


def normalize_rel(path: Path) -> str:
    return path.as_posix()


def rewrite_world_json(
    world_json_path: Path,
    input_dir: Path,
    output_dir: Path,
    generated_rel_map: dict[str, str],
) -> tuple[int, int]:
    if not world_json_path.exists():
        return (0, 0)

    raw = json.loads(world_json_path.read_text(encoding="utf-8"))
    locations = raw.get("locations", [])
    changed = 0
    total = 0

    for loc in locations:
        total += 1
        candidate = loc.get("fullImage") or loc.get("photo") or loc.get("thumbnail")
        if not isinstance(candidate, str):
            continue

        candidate_path = Path(candidate)
        if candidate in generated_rel_map:
            loc["thumbnail"] = generated_rel_map[candidate]
            changed += 1
            continue

        # If photo path is inside input dir and a thumb exists, map it.
        try:
            rel = candidate_path.relative_to(input_dir)
        except ValueError:
            continue
        thumb_rel = normalize_rel(output_dir / rel)
        if thumb_rel in generated_rel_map.values():
            loc["thumbnail"] = thumb_rel
            changed += 1

    world_json_path.write_text(
        json.dumps(raw, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return changed, total


def main() -> None:
    args = parse_args()
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    world_json = Path(args.world_json)

    if not input_dir.exists():
        raise SystemExit(f"Input directory not found: {input_dir}")

    generated = 0
    skipped = 0
    generated_rel_map: dict[str, str] = {}

    for src in iter_images(input_dir, exclude_prefix=output_dir):
        rel = src.relative_to(input_dir)
        dst = output_dir / rel
        src_rel = normalize_rel(input_dir / rel)
        dst_rel = normalize_rel(output_dir / rel)

        if dst.exists() and not args.overwrite:
            skipped += 1
            generated_rel_map[src_rel] = dst_rel
            continue

        save_thumbnail(src, dst, args.max_size, args.quality)
        generated += 1
        generated_rel_map[src_rel] = dst_rel

    print(
        f"Done. Generated: {generated}, Skipped existing: {skipped}, "
        f"Output dir: {output_dir.as_posix()}"
    )

    if args.rewrite_world_json:
        changed, total = rewrite_world_json(
            world_json, input_dir, output_dir, generated_rel_map
        )
        print(
            f"Updated {changed}/{total} locations in {world_json.as_posix()} "
            f"(thumbnail paths)."
        )


if __name__ == "__main__":
    main()
