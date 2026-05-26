import logging
from typing import Optional, Tuple

import requests

from app.core.config import GEOCODE_API_KEY, GEOCODE_TIMEOUT_SECONDS

logger = logging.getLogger("skillsync.geocode")

OPENCAGE_URL = "https://api.opencagedata.com/geocode/v1/json"

COUNTRY_CODES = {
    "US": "United States",
    "TR": "Turkey",
    "GB": "United Kingdom",
    "DE": "Germany",
    "FR": "France",
    "CA": "Canada",
    "AU": "Australia",
    "NL": "Netherlands",
    "ES": "Spain",
    "IT": "Italy",
}


def normalize_location(raw: str) -> str:
    if not raw:
        return ""
    parts = [p.strip() for p in raw.split(",")]
    if len(parts) == 3:
        country_code, _state, city = parts[0], parts[1], parts[2]
        country = COUNTRY_CODES.get(country_code.upper(), country_code)
        return f"{city}, {country}"
    if len(parts) == 2:
        country = COUNTRY_CODES.get(parts[0].upper(), parts[0])
        return f"{parts[1]}, {country}"
    return raw


def geocode_location(location: str) -> Tuple[Optional[float], Optional[float]]:
    api_key = GEOCODE_API_KEY
    if not api_key:
        return (None, None)

    try:
        resp = requests.get(
            OPENCAGE_URL,
            params={"q": location, "key": api_key, "limit": 1},
            timeout=GEOCODE_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results") or []
        if not results:
            return (None, None)
        geom = results[0].get("geometry") or {}
        lat = geom.get("lat")
        lon = geom.get("lng")
        if lat is None or lon is None:
            return (None, None)
        return (float(lat), float(lon))
    except Exception as exc:
        logger.debug("Geocode failed for %r: %s", location, exc)
        return (None, None)
