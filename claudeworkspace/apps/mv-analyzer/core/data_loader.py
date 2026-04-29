import pandas as pd
import numpy as np


def load_csv(file, parse_date_col: str | None = None) -> pd.DataFrame:
    df = pd.read_csv(file)
    df.columns = [c.strip() for c in df.columns]
    if parse_date_col and parse_date_col in df.columns:
        df[parse_date_col] = pd.to_datetime(df[parse_date_col], errors="coerce", dayfirst=True)
    return df


def coerce_numeric(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    out = df.copy()
    for c in cols:
        if c in out.columns:
            out[c] = pd.to_numeric(out[c], errors="coerce")
    return out


def impute_mean(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    out = df.copy()
    for c in cols:
        if c in out.columns and out[c].isna().any():
            out[c] = out[c].fillna(out[c].mean())
    return out


def detect_date_column(df: pd.DataFrame) -> str | None:
    for c in df.columns:
        low = c.lower()
        if "fecha" in low or "date" in low or "time" in low:
            return c
    return None


def detect_numeric_columns(df: pd.DataFrame) -> list[str]:
    return [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
