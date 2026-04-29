import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy import stats
from statsmodels.stats.outliers_influence import variance_inflation_factor


TRANSFORMS = ["ninguna", "log", "sqrt", "inversa", "cuadrada", "boxcox"]


def apply_transform(y: pd.Series, kind: str):
    if kind == "ninguna":
        return y.astype(float), None
    if kind == "log":
        return np.log(y), None
    if kind == "sqrt":
        return np.sqrt(y), None
    if kind == "inversa":
        return 1.0 / y, None
    if kind == "cuadrada":
        return y ** 2, None
    if kind == "boxcox":
        vals, lam = stats.boxcox(y.astype(float))
        return pd.Series(vals, index=y.index), lam
    raise ValueError(kind)


def inverse_transform(y_t: np.ndarray, kind: str, lam=None) -> np.ndarray:
    if kind == "ninguna":
        return y_t
    if kind == "log":
        return np.exp(y_t)
    if kind == "sqrt":
        return y_t ** 2
    if kind == "inversa":
        return 1.0 / y_t
    if kind == "cuadrada":
        return np.sqrt(np.maximum(y_t, 0))
    if kind == "boxcox":
        if lam == 0:
            return np.exp(y_t)
        return np.power(y_t * lam + 1.0, 1.0 / lam)
    raise ValueError(kind)


def fit_ols(df: pd.DataFrame, y_col: str, x_cols: list[str], y_transform: str = "ninguna"):
    data = df[[y_col] + x_cols].dropna().copy()
    y_t, lam = apply_transform(data[y_col], y_transform)
    X = sm.add_constant(data[x_cols].astype(float), has_constant="add")
    model = sm.OLS(y_t, X).fit()
    return {
        "model": model,
        "X": X,
        "y_t": y_t,
        "y_raw": data[y_col],
        "transform": y_transform,
        "boxcox_lambda": lam,
        "x_cols": x_cols,
        "y_col": y_col,
    }


def predict(fit: dict, df_new: pd.DataFrame) -> np.ndarray:
    X = sm.add_constant(df_new[fit["x_cols"]].astype(float), has_constant="add")
    y_pred_t = fit["model"].predict(X).values
    return inverse_transform(y_pred_t, fit["transform"], fit.get("boxcox_lambda"))


def vif_table(df: pd.DataFrame, x_cols: list[str]) -> pd.DataFrame:
    data = df[x_cols].dropna().astype(float)
    X = sm.add_constant(data, has_constant="add")
    rows = []
    for i, name in enumerate(X.columns):
        if name == "const":
            continue
        rows.append({"variable": name, "VIF": variance_inflation_factor(X.values, i)})
    return pd.DataFrame(rows)


def equation_string(fit: dict) -> str:
    m = fit["model"]
    coefs = m.params
    parts = [f"{coefs['const']:.4f}"]
    for c in fit["x_cols"]:
        sign = "+" if coefs[c] >= 0 else "-"
        parts.append(f"{sign} {abs(coefs[c]):.4f} * {c}")
    lhs = fit["y_col"] if fit["transform"] == "ninguna" else f"{fit['transform']}({fit['y_col']})"
    return f"{lhs} = " + " ".join(parts)


def model_summary(fit: dict) -> dict:
    m = fit["model"]
    return {
        "R²": m.rsquared,
        "R² ajustado": m.rsquared_adj,
        "RMSE": float(np.sqrt(np.mean(m.resid ** 2))),
        "CV(RMSE) %": float(np.sqrt(np.mean(m.resid ** 2)) / fit["y_t"].mean() * 100),
        "F p-value": m.f_pvalue,
        "n": int(m.nobs),
    }
