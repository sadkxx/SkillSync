from typing import Optional

from sqlalchemy import Float, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        UniqueConstraint("source", "source_id", name="uq_jobs_source_source_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Where the job came from: "dataset", "linkedin", "indeed", etc.
    source: Mapped[str] = mapped_column(String, nullable=False, index=True)
    # ID within the source system (string to support non-numeric ids)
    source_id: Mapped[str] = mapped_column(String, nullable=False, index=True)

    title: Mapped[str] = mapped_column(String, nullable=False, index=True)
    company: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)

    location_raw: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    location_normalized: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    # Keep backward compatibility: some code may still refer to `location`
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)

    url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

