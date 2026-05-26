"""
In-memory CV session for the current API process.

Production note: replace with Redis or DB-backed sessions keyed by user/session id.
"""

from typing import Optional

_cv_text: Optional[str] = None
_job_text: Optional[str] = None


def set_cv(text: str) -> None:
    global _cv_text
    _cv_text = text


def set_job_text(text: Optional[str]) -> None:
    global _job_text
    _job_text = text.strip() if text and text.strip() else None


def get_cv() -> Optional[str]:
    return _cv_text


def get_job_text() -> Optional[str]:
    return _job_text


def clear() -> None:
    global _cv_text, _job_text
    _cv_text = None
    _job_text = None
