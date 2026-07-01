#!/usr/bin/env python3
"""
pdf_to_docx.py – Convert a PDF file to DOCX using the pdf2docx library.

Usage:
    python3 pdf_to_docx.py <input_pdf> <output_docx>

Exit codes:
    0  success
    1  import error (pdf2docx / dependencies not installed)
    2  conversion error
    3  bad arguments

Works on Windows, Linux, Docker, Render, Oracle Cloud without modification.
"""

import os
import platform
import site
import sys


# ── Windows: probe user site-packages so pip-installed packages are found ─────
def _add_windows_site_packages() -> None:
    localappdata = os.environ.get("LOCALAPPDATA", "")
    appdata      = os.environ.get("APPDATA", "")
    candidates: list[str] = []

    # Windows Store Python
    store_base = os.path.join(localappdata, "Packages")
    if os.path.isdir(store_base):
        for entry in os.scandir(store_base):
            if entry.is_dir() and "PythonSoftwareFoundation" in entry.name:
                for ver in ("Python311", "Python312", "Python313"):
                    candidates.append(
                        os.path.join(entry.path, "LocalCache", "local-packages", ver, "site-packages")
                    )

    if appdata:
        for ver in ("Python311", "Python312", "Python313"):
            candidates.append(os.path.join(appdata, "Python", ver, "site-packages"))

    if localappdata:
        prog = os.path.join(localappdata, "Programs", "Python")
        if os.path.isdir(prog):
            for entry in os.scandir(prog):
                if entry.is_dir():
                    candidates.append(os.path.join(entry.path, "Lib", "site-packages"))

    # Also check venv inside the Laravel project (parent dirs of this script)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    for _ in range(4):  # walk up to 4 levels
        script_dir = os.path.dirname(script_dir)
        for venv_sub in ("venv", ".venv"):
            site_pkg = os.path.join(script_dir, venv_sub, "Lib", "site-packages")
            candidates.append(site_pkg)

    try:
        candidates.append(site.getusersitepackages())
    except AttributeError:
        pass

    for path in candidates:
        if os.path.isdir(path) and path not in sys.path:
            sys.path.insert(0, path)


if platform.system() == "Windows":
    _add_windows_site_packages()


# ── Import pdf2docx ───────────────────────────────────────────────────────────
try:
    from pdf2docx import Converter
except ImportError:
    print(
        "ERROR: 'pdf2docx' is not installed.\n"
        "  Linux / Docker:  pip3 install pdf2docx\n"
        "  Windows venv:    venv\\Scripts\\pip install pdf2docx\n"
        "  Windows global:  pip install pdf2docx",
        file=sys.stderr,
    )
    sys.exit(1)


# ── Conversion ────────────────────────────────────────────────────────────────

def convert(pdf_path: str, docx_path: str) -> None:
    if not os.path.isfile(pdf_path):
        print(f"ERROR: Input file not found: {pdf_path}", file=sys.stderr)
        sys.exit(2)

    os.makedirs(os.path.dirname(os.path.abspath(docx_path)), exist_ok=True)

    print(f"Converting: {pdf_path}")
    print(f"Output:     {docx_path}")

    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
    except Exception as exc:
        print(f"ERROR: Conversion failed: {exc}", file=sys.stderr)
        sys.exit(2)

    if not os.path.isfile(docx_path) or os.path.getsize(docx_path) == 0:
        print("ERROR: Output file was not created or is empty.", file=sys.stderr)
        sys.exit(2)

    size_kb = os.path.getsize(docx_path) / 1024
    print(f"Done. Output size: {size_kb:.1f} KB")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(
            "Usage: python3 pdf_to_docx.py <input.pdf> <output.docx>",
            file=sys.stderr,
        )
        sys.exit(3)

    convert(sys.argv[1], sys.argv[2])
