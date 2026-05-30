import io

from fastapi.testclient import TestClient

from app.main import app
from app.services import cv_session

client = TestClient(app)


def setup_function():
    """Her testten önce session temizle."""
    cv_session.set_cv(None)
    cv_session.set_job_text(None)


def test_analyze_without_cv_returns_400():
    """CV yüklenmeden /analyze çağrısı 400 dönmeli."""
    response = client.post("/analyze", json={})
    assert response.status_code == 400
    assert "CV" in response.json()["detail"] or "yukle" in response.json()["detail"].lower()


def test_upload_cv_unsupported_extension_returns_400():
    """Desteklenmeyen dosya uzantısı 400 dönmeli."""
    fake_file = io.BytesIO(b"some content")
    response = client.post(
        "/upload-cv",
        files={"file": ("test.txt", fake_file, "text/plain")},
    )
    assert response.status_code == 400
    detail = response.json()["detail"].lower()
    assert "pdf" in detail or "docx" in detail


def test_upload_cv_empty_file_returns_400():
    """Boş dosya yükleme 400 dönmeli."""
    empty_file = io.BytesIO(b"")
    response = client.post(
        "/upload-cv",
        files={"file": ("empty.pdf", empty_file, "application/pdf")},
    )
    assert response.status_code == 400