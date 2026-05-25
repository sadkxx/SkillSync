from __future__ import annotations

from typing import Optional

from app.services.geocoding_service import normalize_location as _normalize_raw


def normalize_location(location: Optional[str]) -> Optional[str]:
    """
    Normalize job location strings for geocoding.
    Returns None for empty or remote postings.
    """
    if location is None:
        return None
    loc = str(location).strip()
    if not loc:
        return None
    if "remote" in loc.lower():
        return None

    normalized = _normalize_raw(loc)
    return normalized if normalized else None
