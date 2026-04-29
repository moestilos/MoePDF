import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.stats.outliers_influence import OLSInfluence


def cooks_distance(fit: dict) -> np.ndarray:
    return OLSInfluence(fit["model"]).cooks_distance[0]


def filter_by_cooks(df: pd.DataFrame, fit: dict, threshold: float) -> pd.DataFrame:
    cd = cooks_distance(fit)
    mask = cd <= threshold
    idx = fit["X"].index[mask]
    return df.loc[idx].copy()


def residuals(fit: dict) -> pd.Series:
    return fit["model"].resid


def fitted(fit: dict) -> pd.Series:
    return fit["model"].fittedvalues


def shapiro_test(resid: pd.Series) -> dict:
    sample = resid if len(resid) <= 5000 else resid.sample(5000, random_state=0)
    stat, p = stats.shapiro(sample)
    return {"W": float(stat), "p-value": float(p), "normal_alpha_0.05": bool(p > 0.05)}


def descriptive(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    rows = []
    for c in cols:
        s = df[c].dropna().astype(float)
        rows.append({
            "variable": c,
            "mean": s.mean(),
            "sd": s.std(),
            "median": s.median(),
            "skew": s.skew(),
            "kurtosis": s.kurtosis(),
        })
    return pd.DataFrame(rows).round(2)
