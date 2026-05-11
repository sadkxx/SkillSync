import os
from typing import Optional, Tuple

import requests


OPENCAGE_URL = "https://api.opencagedata.com/geocode/v1/json"


def geocode_location(location: str) -> Tuple[Optional[float], Optional[float]]:
    api_key = os.getenv("GEOCODE_API_KEY")
    if not api_key:
        return (None, None)

    try:
        resp = requests.get(
            OPENCAGE_URL,
            params={"q": location, "key": api_key, "limit": 1},
            timeout=10,
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
    except Exception:
        return (None, None)

