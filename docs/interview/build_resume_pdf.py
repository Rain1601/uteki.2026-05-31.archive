"""Render chen_xiaoyu_resume.html → chen_xiaoyu_resume.pdf via WeasyPrint.

Requires WeasyPrint with cairo / pango / glib (installed via Homebrew).
Run:
    DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib:$DYLD_FALLBACK_LIBRARY_PATH \\
        python3 build_resume_pdf.py

Or just:
    ./build_resume_pdf.sh  (wrapper that sets the env)
"""
from pathlib import Path
import os
import sys

# Ensure WeasyPrint can find Homebrew's pango/cairo/glib
os.environ.setdefault(
    "DYLD_FALLBACK_LIBRARY_PATH",
    "/opt/homebrew/lib:" + os.environ.get("DYLD_FALLBACK_LIBRARY_PATH", ""),
)

try:
    import weasyprint  # noqa: E402  (env-setup must come first)
except OSError as e:
    sys.stderr.write(
        "WeasyPrint failed to load native libs.\n"
        f"  {e}\n"
        "Fix: brew install pango cairo glib && relaunch the shell.\n"
    )
    sys.exit(1)


HERE = Path(__file__).resolve().parent
SRC = HERE / "chen_xiaoyu_resume.html"
OUT = HERE / "chen_xiaoyu_resume.pdf"

print(f"Rendering {SRC.name} ...")
weasyprint.HTML(filename=str(SRC)).write_pdf(str(OUT))

# Quick sanity check: 1-page guarantee
try:
    from pypdf import PdfReader
    pages = len(PdfReader(str(OUT)).pages)
    print(f"OK -> {OUT.name} ({pages} page{'s' if pages != 1 else ''})")
    if pages != 1:
        print(f"!! WARNING: expected 1 page, got {pages}", file=sys.stderr)
except ImportError:
    print(f"OK -> {OUT.name}")
