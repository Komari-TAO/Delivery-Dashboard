from __future__ import annotations

from types import MappingProxyType
from typing import Any

import pandas as pd


# This is the single authoritative implementation set for governed analytical
# exclusions. Browser consumers receive this set through generated dashboard
# metadata; they do not maintain a separate hardcoded exclusion list.
GLOBAL_EXCLUDED_ISSUE_KEYS = frozenset(
    {
        "TEMPO-54",
        "TEMPO-92",
        "TEMPO-106",
        "TEMPO-111",
        "TEMPO-112",
    }
)

GLOBAL_EXCLUSION_REASONS = MappingProxyType(
    {
        "TEMPO-54": "Absence (Out Of Office); not governed delivery or operational effort.",
        "TEMPO-92": "HR daily registration or vacation; not governed delivery or operational effort.",
        "TEMPO-106": "Daily total working time (Legal Tracking); not governed delivery or operational effort.",
        "TEMPO-111": "HR daily registration or vacation; not governed delivery or operational effort.",
        "TEMPO-112": "HR daily registration or vacation; not governed delivery or operational effort.",
    }
)


def normalize_issue_key(value: Any) -> str:
    """Return the governed exact-match representation of an issue key."""
    if value is None or pd.isna(value):
        return ""
    return str(value).strip().upper()


def normalize_issue_key_series(series: pd.Series) -> pd.Series:
    """Normalize candidate keys without substring or prefix semantics."""
    return series.fillna("").astype(str).str.strip().str.upper()


def globally_excluded_issue_mask(series: pd.Series) -> pd.Series:
    """Identify globally excluded rows using normalized exact-key matching."""
    return normalize_issue_key_series(series).isin(GLOBAL_EXCLUDED_ISSUE_KEYS)


def partition_governed_issue_rows(
    frame: pd.DataFrame,
    key_column: str,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Normalize keys and split source rows before governed analytical use."""
    normalized = normalize_issue_key_series(frame[key_column])
    excluded_mask = normalized.isin(GLOBAL_EXCLUDED_ISSUE_KEYS)

    governed = frame.loc[~excluded_mask].copy()
    governed[key_column] = normalized.loc[~excluded_mask]

    excluded = frame.loc[excluded_mask].copy()
    excluded[key_column] = normalized.loc[excluded_mask]
    return governed, excluded
