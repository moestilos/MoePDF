import numpy as np
import pandas as pd

from .regression import predict


def compute_savings(fit: dict, df_post: pd.DataFrame, y_col: str, date_col: str | None) -> pd.DataFrame:
    df = df_post.copy()
    df["consumo_predicho"] = predict(fit, df)
    df["consumo_real"] = df[y_col].astype(float)
    df["ahorro"] = df["consumo_predicho"] - df["consumo_real"]
    df["ahorro_pct"] = df["ahorro"] / df["consumo_predicho"] * 100
    if date_col and date_col in df.columns:
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
    return df


def monthly_aggregate(df_savings: pd.DataFrame, date_col: str) -> pd.DataFrame:
    df = df_savings.dropna(subset=[date_col]).copy()
    df["mes"] = df[date_col].dt.to_period("M").dt.to_timestamp()
    g = df.groupby("mes").agg(
        consumo_real=("consumo_real", "sum"),
        consumo_predicho=("consumo_predicho", "sum"),
        ahorro=("ahorro", "sum"),
    ).reset_index()
    g["ahorro_pct"] = g["ahorro"] / g["consumo_predicho"] * 100
    return g


def summary(df_savings: pd.DataFrame) -> dict:
    total_pred = df_savings["consumo_predicho"].sum()
    total_real = df_savings["consumo_real"].sum()
    total_ahorro = df_savings["ahorro"].sum()
    return {
        "ahorro_total_kwh": float(total_ahorro),
        "ahorro_medio_muestra_kwh": float(df_savings["ahorro"].mean()),
        "eficiencia_pct": float(total_ahorro / total_pred * 100) if total_pred else 0.0,
        "consumo_real_total": float(total_real),
        "consumo_predicho_total": float(total_pred),
        "n_muestras": int(len(df_savings)),
    }
