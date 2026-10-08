"""Optional asset-authoring utility; npm builds use the committed WebP previews.

Run with Python + Pillow: python scripts/generate-device-previews.py
Original project boards are never rewritten.
"""
import json
import re
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
code = (root / "src/projects.js").read_text(encoding="utf-8")
projects = json.loads(re.search(r"export const projects = (\[[\s\S]*?\n\]);", code).group(1))
count = 0
original_bytes = preview_bytes = 0
for index, project in enumerate(projects):
    for image in project["images"][:2 if index in (0, 1, 6) else 1]:
        source = root / "src" / image["src"]
        target = root / "src" / image["src"].replace("./assets/projects/", "./assets/project-previews/")
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as opened:
            width = min(640, opened.width)
            resized = opened.resize((width, round(opened.height * width / opened.width)), Image.Resampling.LANCZOS)
            resized.save(target, format="WEBP", quality=82, method=6)
        count += 1
        original_bytes += source.stat().st_size
        preview_bytes += target.stat().st_size
print(f"{count} device previews: {original_bytes:,} -> {preview_bytes:,} bytes; full-size originals preserved.")
