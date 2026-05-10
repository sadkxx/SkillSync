from __future__ import annotations

from typing import Optional


COUNTRY_CODE_MAP = {
    "TR": "Turkey",
    "GR": "Greece",
    "DE": "Germany",
    "GB": "United Kingdom",
    "UK": "United Kingdom",
    "US": "United States",
}


def normalize_location(location: str) -> Optional[str]:
    if location is None:
        return None
    loc = str(location).strip()
    if not loc:
        return None

    lower = loc.lower()
    if "remote" in lower:
        return None

    # Handle patterns like "TR, Istanbul"
    if "," in loc:
        parts = [p.strip() for p in loc.split(",") if p.strip()]
        if len(parts) >= 2:
            first, second = parts[0], parts[1]
            # If first part looks like a country code, flip to "City, Country"
            if len(first) in (2, 3) and first.isupper():
                country = COUNTRY_CODE_MAP.get(first, first)
                city = second
                return f"{city}, {country}"
            # Otherwise assume it's already "City, Country"
            return f"{first}, {second}"

    # Fall back to raw (OpenCage can often geocode this)
    return loc

