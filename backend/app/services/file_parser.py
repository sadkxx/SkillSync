import pdfplumber
from docx import Document
from fastapi import UploadFile
import io

async def parse_file(file: UploadFile) -> str:
    content = await file.read()
    
    if file.filename.endswith(".pdf"):
        return parse_pdf(content)
    elif file.filename.endswith(".docx"):
        return parse_docx(content)
    else:
        raise ValueError("Sadece PDF veya DOCX dosyası yükleyebilirsiniz.")

def parse_pdf(content: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.strip()

def parse_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    return "\n".join([para.text for para in doc.paragraphs]).strip()