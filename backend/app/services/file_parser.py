import io

import pdfplumber
from docx import Document
from fastapi import UploadFile

from app.core.config import MAX_UPLOAD_BYTES, MIN_CV_TEXT_LENGTH

ALLOWED_EXTENSIONS = (".pdf", ".docx")


def _extension(filename: str) -> str:
    lower = filename.lower()
    for ext in ALLOWED_EXTENSIONS:
        if lower.endswith(ext):
            return ext
    return ""


def validate_cv_text(text: str) -> str:
    if not text or not text.strip():
        raise ValueError("CV metni cikarilamadi veya dosya bos.")
    cleaned = text.strip()
    if len(cleaned) < MIN_CV_TEXT_LENGTH:
        raise ValueError(
            f"CV metni cok kisa (en az {MIN_CV_TEXT_LENGTH} karakter gerekli)."
        )
    return cleaned


async def parse_file(file: UploadFile) -> str:
    if not file.filename:
        raise ValueError("Dosya adi gerekli.")

    ext = _extension(file.filename)
    if not ext:
        raise ValueError("Sadece PDF veya DOCX dosyasi yukleyebilirsiniz.")

    content = await file.read()
    if not content:
        raise ValueError("Dosya bos.")

    if len(content) > MAX_UPLOAD_BYTES:
        raise ValueError(
            f"Dosya cok buyuk (maksimum {MAX_UPLOAD_BYTES // (1024 * 1024)} MB)."
        )

    if ext == ".pdf":
        raw = parse_pdf(content)
    else:
        raw = parse_docx(content)

    return validate_cv_text(raw)


def parse_pdf(content: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.strip()


def parse_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    return "\n".join([para.text for para in doc.paragraphs]).strip()
