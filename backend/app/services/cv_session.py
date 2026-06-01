"""
In-memory CV sessions for the current API process.

This avoids CV mix-ups between browser tabs/users without adding login.
Production note: replace with Redis or DB-backed sessions if persistence or
multi-process deployment is needed.
"""

from typing import Optional

DEFAULT_SESSION_ID = "default"

_sessions: dict[str, dict[str, Optional[str]]] = {}


def _normalize_session_id(session_id: Optional[str]) -> str:
    value = session_id.strip() if session_id and session_id.strip() else ""
    return value[:128] or DEFAULT_SESSION_ID


def _get_session(session_id: Optional[str]) -> dict[str, Optional[str]]:
    key = _normalize_session_id(session_id)
    if key not in _sessions:
        _sessions[key] = {"cv_text": None, "job_text": None}
    return _sessions[key]


def set_cv(text: Optional[str], session_id: Optional[str] = None) -> None:
    _get_session(session_id)["cv_text"] = text


def set_job_text(text: Optional[str], session_id: Optional[str] = None) -> None:
    _get_session(session_id)["job_text"] = text.strip() if text and text.strip() else None


def get_cv(session_id: Optional[str] = None) -> Optional[str]:
    return _get_session(session_id)["cv_text"]


def get_job_text(session_id: Optional[str] = None) -> Optional[str]:
    return _get_session(session_id)["job_text"]


def clear(session_id: Optional[str] = None) -> None:
    key = _normalize_session_id(session_id)
    _sessions.pop(key, None)


def clear_all() -> None:
    _sessions.clear()
