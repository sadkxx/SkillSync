from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Protocol


@dataclass(frozen=True)
class ExternalJob:
    source_id: str
    title: str
    company: Optional[str]
    location: Optional[str]
    url: Optional[str] = None
    industry: Optional[str] = None


class JobProvider(Protocol):
    name: str

    def fetch(self, query: str, location: Optional[str], limit: int) -> list[ExternalJob]:
        ...

