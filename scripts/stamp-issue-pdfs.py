"""
Stamp Life Sutra Synthesis article PDFs with their bibliographic details.

ISSN India asks for the journal name, volume, issue, month/year and page
numbers on each article (and the ISSN on the first page once assigned).
This reads the untouched originals from research-papers-source/ and writes
stamped copies to public/research-papers/ under the same file names, so
article URLs never change.

Adds, on every page: a running header (journal title · Vol., Issue · period)
and a footer page number, continuous across the issue. The first page also
carries the article's citation line. Nothing in the original content moves.

Usage:  python scripts/stamp-issue-pdfs.py
Needs:  pip install pypdf reportlab

For a new issue or once the ISSN is assigned: edit ISSUE / ARTICLES below
(and the page ranges in src/data/content.ts to match), then re-run.
"""

from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "research-papers-source"
OUT = ROOT / "public" / "research-papers"

ISSUE = {
    "journal": "Life Sutra Synthesis",
    "volume": 1,
    "issue": 1,
    "period": "October–December 2026",
    "published": "11 October 2026",
    # Set to e.g. "ISSN (Online): 1234-5678" once assigned.
    "issn": None,
    "publisher": "I Smart Life Foundation (ISLF), India",
}

# Table-of-contents order (matches the archive). `drop_pages` removes
# trailing blank pages; `mask_old_numbers` hides page numbers the authors
# already printed at bottom centre, which would clash with issue pagination.
ARTICLES = [
    {"file": "quantum-emotional-semiconductors.pdf"},
    {"file": "bhava-centric-communication-architecture.pdf", "drop_pages": [21]},
    {"file": "collective-emotional-field-model-qefm.pdf", "mask_old_numbers": True},
    {"file": "integrative-vedanta-islf-framework.pdf", "mask_old_numbers": True},
    {"file": "astrological-emotional-quotient-aeq.pdf"},
    {"file": "theory-of-quantum-emotion-tqe.pdf"},
    {"file": "bhava-sutra.pdf"},
    {"file": "from-vrittis-to-emotional-fields.pdf"},
]

GREY = Color(0.30, 0.27, 0.24)
RULE = Color(0.55, 0.45, 0.33)


def overlay(width, height, page_no, first, first_page, last_page, mask):
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=(width, height))
    margin = 54
    head_y = height - 32

    if mask:
        # Cover the authors' own bottom-centre page number.
        c.setFillColorRGB(1, 1, 1)
        c.rect(width / 2 - 24, 26, 48, 40, stroke=0, fill=1)

    c.setFillColor(GREY)
    c.setFont("Times-Italic", 8.5)
    c.drawString(margin, head_y, ISSUE["journal"])
    c.setFont("Times-Roman", 8.5)
    c.drawRightString(
        width - margin,
        head_y,
        f"Vol. {ISSUE['volume']}, Issue {ISSUE['issue']} · {ISSUE['period']}",
    )
    c.setStrokeColor(RULE)
    c.setLineWidth(0.5)
    c.line(margin, head_y - 5, width - margin, head_y - 5)

    if first:
        parts = [
            f"Published {ISSUE['published']}",
            f"pp. {first_page}–{last_page}",
            ISSUE["publisher"],
        ]
        if ISSUE["issn"]:
            parts.insert(0, ISSUE["issn"])
        c.setFont("Times-Roman", 7.5)
        c.drawString(margin, head_y - 15, " · ".join(parts))

    c.setFont("Times-Roman", 9)
    c.drawCentredString(width / 2, 20, str(page_no))
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def main():
    next_page = 1
    for art in ARTICLES:
        reader = PdfReader(SOURCE / art["file"])
        drop = set(art.get("drop_pages", []))
        pages = [p for i, p in enumerate(reader.pages, start=1) if i not in drop]
        first_page, last_page = next_page, next_page + len(pages) - 1

        writer = PdfWriter()
        for offset, page in enumerate(pages):
            w = float(page.mediabox.width)
            h = float(page.mediabox.height)
            page.merge_page(
                overlay(
                    w,
                    h,
                    first_page + offset,
                    offset == 0,
                    first_page,
                    last_page,
                    art.get("mask_old_numbers", False),
                )
            )
            writer.add_page(page)

        writer.add_metadata(
            {
                "/Subject": f"{ISSUE['journal']}, Vol. {ISSUE['volume']}, Issue {ISSUE['issue']}, "
                f"{ISSUE['period']}, pp. {first_page}–{last_page}",
                "/Producer": ISSUE["publisher"],
            }
        )
        with open(OUT / art["file"], "wb") as f:
            writer.write(f)
        print(f"{art['file']:<48} pp. {first_page}–{last_page}")
        next_page = last_page + 1


if __name__ == "__main__":
    main()
