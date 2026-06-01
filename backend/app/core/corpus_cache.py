"""
LRU cache for job corpus embeddings with deterministic keys.
"""

from __future__ import annotations

from collections import OrderedDict
from typing import Any, Optional, Tuple

import numpy as np
import pandas as pd

from app.services import job_corpus

_CacheValue = Tuple[pd.DataFrame, np.ndarray, str]
_cache: OrderedDict[str, _CacheValue] = OrderedDict()
_max_entries = 4


def configure_max_entries(n: int) -> None:
    global _max_entries
    _max_entries = max(1, n)


def clear_corpus_cache() -> None:
    _cache.clear()
    job_corpus.bump_corpus_version()


def get_cached(key: str) -> Optional[_CacheValue]:
    if key not in _cache:
        return None
    _cache.move_to_end(key)
    return _cache[key]


def set_cached(key: str, value: _CacheValue) -> None:
    if key in _cache:
        _cache.move_to_end(key)
    _cache[key] = value
    while len(_cache) > _max_entries:
        _cache.popitem(last=False)
