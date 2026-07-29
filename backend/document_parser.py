import pypdf
# pyrefly: ignore [missing-import]
import docx
from pathlib import Path

def extract_text_from_pdf(file_path: Path) -> str:
    """Extract text from a PDF file using pypdf."""
    reader = pypdf.PdfReader(file_path)
    text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text.append(page_text)
    return "\n".join(text)

def extract_text_from_docx(file_path: Path) -> str:
    """Extract text from a DOCX file using python-docx."""
    doc = docx.Document(str(file_path))
    text = []
    for para in doc.paragraphs:
        if para.text.strip():
            text.append(para.text)
    return "\n".join(text)

def extract_text(file_path: Path) -> str:
    """Extract text based on the file extension."""
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(file_path)
    elif suffix == ".docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file format '{suffix}'. Only PDF and DOCX are allowed.")
