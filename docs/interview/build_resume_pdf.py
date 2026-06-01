"""Render every chen_xiaoyu_resume*.html → matching .pdf via WeasyPrint.

Discovers all `chen_xiaoyu_resume*.html` files in this directory and
emits a same-named `.pdf` next to each. Lets us keep versions side by
side (e.g. `chen_xiaoyu_resume.html` as the current, plus snapshots
`chen_xiaoyu_resume_v3.html`, `chen_xiaoyu_resume_v3-en.html`).

Requires Homebrew pango / cairo / glib (WeasyPrint native deps).

Run:
    python3 build_resume_pdf.py             # render all
    python3 build_resume_pdf.py -en         # render only English variants
    python3 build_resume_pdf.py v3          # render only chen_*_v3*.html
"""
from pathlib import Path
import os
import sys

# WeasyPrint needs Homebrew's libgobject/cairo on macOS.
os.environ.setdefault(
    "DYLD_FALLBACK_LIBRARY_PATH",
    "/opt/homebrew/lib:" + os.environ.get("DYLD_FALLBACK_LIBRARY_PATH", ""),
)

try:
    import weasyprint  # noqa: E402
except OSError as e:
    sys.stderr.write(
        "WeasyPrint failed to load native libs.\n"
        f"  {e}\n"
        "Fix: brew install pango cairo glib && reopen shell.\n"
    )
    sys.exit(1)

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None


HERE = Path(__file__).resolve().parent
PATTERN = "chen_xiaoyu_resume*.html"

filter_substr = sys.argv[1] if len(sys.argv) > 1 else None

candidates = sorted(HERE.glob(PATTERN))
if filter_substr:
    candidates = [p for p in candidates if filter_substr in p.stem]

if not candidates:
    sys.stderr.write(f"No HTML files match {PATTERN}\n")
    sys.exit(1)

for src in candidates:
    out = src.with_suffix(".pdf")
    print(f"Rendering {src.name} -> {out.name}")
    weasyprint.HTML(filename=str(src)).write_pdf(str(out))
    if PdfReader is not None:
        pages = len(PdfReader(str(out)).pages)
        marker = "✓" if pages == 1 else "!"
        print(f"  {marker} {pages} page{'s' if pages != 1 else ''}")
