#!/usr/bin/env python3
"""Copy the editable frog SVG into the inline SVG scene without raster embedding."""

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "assets" / "frog-example"
VECTOR = ROOT / "premium-frog.svg"
PAGE = ROOT / "index.html"


def replace_between(text: str, start_marker: str, end_marker: str, content: str) -> str:
    start = text.index(start_marker) + len(start_marker)
    end = text.index(end_marker, start)
    return text[:start] + "\n" + content + "\n                " + text[end:]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if the page differs from the vector source")
    args = parser.parse_args()
    source = VECTOR.read_text()
    if "<image" in source:
        parser.error("premium-frog.svg embeds an image instead of editable vectors")
    defs = source.split("<defs>", 1)[1].split("</defs>", 1)[0].strip()
    character = source.split("</defs>", 1)[1].rsplit("</svg>", 1)[0].strip()
    page = PAGE.read_text()
    page_new = replace_between(
        page,
        "<!-- PREMIUM_DEFS_START: generated from premium-frog.svg -->",
        "<!-- PREMIUM_DEFS_END -->",
        defs,
    )
    page_new = replace_between(
        page_new,
        "<!-- PREMIUM_CHARACTER_START: generated from premium-frog.svg -->",
        "<!-- PREMIUM_CHARACTER_END -->",
        '<g id="premium-position" transform="translate(81 5) scale(.38)">\n'
        + character
        + "\n                </g>",
    )
    if args.check:
        if page != page_new:
            print("Inline frog differs from premium-frog.svg; run sync_frog_scene.py")
            return 1
        print("Inline frog matches premium-frog.svg")
        return 0
    PAGE.write_text(page_new)
    print("Synchronized editable frog into index.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
