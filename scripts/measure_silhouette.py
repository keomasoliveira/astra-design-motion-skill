#!/usr/bin/env python3
"""Measure alpha-mask overlap of two pre-aligned transparent PNGs.

Requires Pillow. Render the fixed raster master and the SVG candidate to
the same canvas and scale first. Do not use this score as a visual-quality grade.
"""

import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw


def checkerboard(size: tuple[int, int], cell: int = 24) -> Image.Image:
    background = Image.new("RGBA", size, "#f4f5ef")
    draw = ImageDraw.Draw(background)
    width, height = size
    for top in range(0, height, cell):
        for left in range(0, width, cell):
            if (left // cell + top // cell) % 2:
                draw.rectangle((left, top, min(left + cell - 1, width), min(top + cell - 1, height)), fill="#e4e7e2")
    return background


def parse_region(value: str, width: int, height: int) -> tuple[str, tuple[int, int, int, int]]:
    match = re.fullmatch(r"([A-Za-z0-9_-]+):(\d+),(\d+),(\d+),(\d+)", value)
    if not match:
        raise ValueError("region must be NAME:x1,y1,x2,y2 in canvas pixels")
    name = match.group(1)
    x1, y1, x2, y2 = map(int, match.groups()[1:])
    if not (0 <= x1 < x2 <= width and 0 <= y1 < y2 <= height):
        raise ValueError(f"region {name} is outside the {width}x{height} canvas or empty")
    return name, (x1, y1, x2, y2)


def measure_region(master: list[bool], candidate: list[bool], width: int,
                   name: str, box: tuple[int, int, int, int]) -> dict:
    x1, y1, x2, y2 = box
    first = second = intersection = union = 0
    for y in range(y1, y2):
        for x in range(x1, x2):
            a = master[y * width + x]
            b = candidate[y * width + x]
            first += a
            second += b
            intersection += a and b
            union += a or b
    return {
        "name": name,
        "box": list(box),
        "iou": round(intersection / union, 6) if union else None,
        "master_pixels": first,
        "candidate_pixels": second,
        "intersection_pixels": intersection,
        "union_pixels": union,
    }


def write_evidence(master_image: Image.Image, candidate_image: Image.Image,
                   directory: Path, result: dict,
                   regions: list[tuple[str, tuple[int, int, int, int]]]) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    size = master_image.size
    background = checkerboard(size)
    left = Image.alpha_composite(background, master_image)
    right = Image.alpha_composite(background, candidate_image)
    pair = Image.new("RGBA", (size[0] * 2, size[1]))
    pair.paste(left, (0, 0))
    pair.paste(right, (size[0], 0))
    pair.convert("RGB").save(directory / "side-by-side.png")
    overlay = Image.alpha_composite(background, Image.blend(master_image, candidate_image, 0.5))
    overlay.convert("RGB").save(directory / "overlay-50.png")
    for name, box in regions:
        first = master_image.crop(box)
        second = candidate_image.crop(box)
        region_background = checkerboard(first.size, cell=12)
        regional_pair = Image.new("RGB", (first.width * 2, first.height))
        regional_pair.paste(Image.alpha_composite(region_background, first).convert("RGB"), (0, 0))
        regional_pair.paste(Image.alpha_composite(region_background, second).convert("RGB"), (first.width, 0))
        regional_pair.save(directory / f"region-{name}-side-by-side.png")
    (directory / "silhouette-result.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")


def bounds(mask: list[bool], width: int, height: int) -> list[int] | None:
    left, top = width, height
    right, bottom = -1, -1
    for index, opaque in enumerate(mask):
        if opaque:
            x, y = index % width, index // width
            left, top = min(left, x), min(top, y)
            right, bottom = max(right, x), max(bottom, y)
    return [left, top, right, bottom] if right >= 0 else None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("master", type=Path, help="Fixed transparent raster master PNG")
    parser.add_argument("candidate", type=Path, help="SVG rendered as transparent PNG")
    parser.add_argument("--alpha", type=int, default=128, choices=range(1, 256), metavar="1..255")
    parser.add_argument("--minimum", type=float, default=0.95)
    parser.add_argument("--evidence-dir", type=Path, help="Save side-by-side, 50%% overlay and JSON score")
    parser.add_argument("--region", action="append", default=[], metavar="NAME:x1,y1,x2,y2",
                        help="Add a named canvas crop for diagnostic alpha IoU and side-by-side evidence; repeatable")
    args = parser.parse_args()
    if not 0 <= args.minimum <= 1:
        parser.error("--minimum must be between 0 and 1")

    with Image.open(args.master) as first, Image.open(args.candidate) as second:
        if first.size != second.size:
            parser.error(f"canvas mismatch: {first.size} versus {second.size}")
        first_rgba = first.convert("RGBA")
        second_rgba = second.convert("RGBA")
        a = first_rgba.getchannel("A")
        b = second_rgba.getchannel("A")
        width, height = first.size
        master = [value >= args.alpha for value in a.tobytes()]
        candidate = [value >= args.alpha for value in b.tobytes()]

    total = width * height
    if sum(master) > total * 0.9 or sum(candidate) > total * 0.9:
        parser.error("alpha covers >90% of canvas; use transparent exports without background")
    intersection = sum(x and y for x, y in zip(master, candidate))
    union = sum(x or y for x, y in zip(master, candidate))
    if union == 0:
        parser.error("both masks are empty at this alpha threshold")
    iou = intersection / union
    result = {
        "iou": round(iou, 6),
        "silhouette_iou_percent": round(iou * 100, 2),
        "silhouette_minimum_percent": round(args.minimum * 100, 2),
        "silhouette_passed": iou >= args.minimum,
        "overall_character_gate": "not_evaluated",
        "alpha_threshold": args.alpha,
        "canvas": [width, height],
        "master_bbox": bounds(master, width, height),
        "candidate_bbox": bounds(candidate, width, height),
    }
    try:
        regions = [parse_region(value, width, height) for value in args.region]
    except ValueError as error:
        parser.error(str(error))
    if len({name for name, _ in regions}) != len(regions):
        parser.error("region names must be unique")
    if regions:
        result["regional_diagnostics"] = [
            measure_region(master, candidate, width, name, box) for name, box in regions
        ]
    if args.evidence_dir:
        write_evidence(first_rgba, second_rgba, args.evidence_dir, result, regions)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if iou >= args.minimum else 1


if __name__ == "__main__":
    raise SystemExit(main())
