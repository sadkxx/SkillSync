from __future__ import annotations

import hashlib
from typing import Optional

from app.services.job_providers.base import ExternalJob


class JobSpyProvider:
    """
    Optional provider. Requires a third-party library to be installed.

    We keep this import lazy and defensive to avoid breaking the dataset pipeline.
    """

    name = "jobspy"

    def fetch(self, query: str, location: Optional[str], limit: int) -> list[ExternalJob]:
        try:
            # There are multiple "jobspy" libs in the wild; we keep this flexible.
            # If you standardize on a specific package, update this adapter accordingly.
            import jobspy  # type: ignore
        except Exception as e:
            raise RuntimeError(
                "JobSpy provider is not available. Install the jobspy dependency and try again."
            ) from e

        # Best-effort: try common entrypoints; if not found, raise a clear error.
        fetch_fn = getattr(jobspy, "search", None) or getattr(jobspy, "fetch_jobs", None)
        if fetch_fn is None:
            raise RuntimeError(
                "Installed jobspy module does not expose a supported fetch function (search/fetch_jobs)."
            )

        results = fetch_fn(query=query, location=location, limit=limit)  # type: ignore[call-arg]

        jobs: list[ExternalJob] = []
        for r in results or []:
            title = str(getattr(r, "title", None) or r.get("title") or "").strip()
            if not title:
                continue
            company = str(getattr(r, "company", None) or r.get("company") or "").strip() or None
            loc = str(getattr(r, "location", None) or r.get("location") or "").strip() or None
            url = str(getattr(r, "url", None) or r.get("url") or "").strip() or None

            # Make a stable source_id even if provider doesn't give one
            raw_id = getattr(r, "id", None) or r.get("id") if isinstance(r, dict) else None
            if raw_id:
                source_id = str(raw_id)
            else:
                key = f"{title}|{company or ''}|{loc or ''}|{url or ''}"
                source_id = hashlib.sha256(key.encode("utf-8")).hexdigest()[:32]

            jobs.append(
                ExternalJob(
                    source_id=source_id,
                    title=title,
                    company=company,
                    location=loc,
                    url=url,
                    industry=None,
                )
            )
        return jobs

