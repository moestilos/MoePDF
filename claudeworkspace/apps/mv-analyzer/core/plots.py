import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from scipy import stats


def predicted_vs_real(y_real, y_pred, title="Predicho vs Real (Baseline)"):
    fig = px.scatter(x=y_pred, y=y_real, labels={"x": "Consumo predicho", "y": "Consumo real"}, title=title)
    lo, hi = float(min(y_pred.min(), y_real.min())), float(max(y_pred.max(), y_real.max()))
    fig.add_trace(go.Scatter(x=[lo, hi], y=[lo, hi], mode="lines", name="y=x", line=dict(color="gray", dash="dash")))
    return fig


def residuals_vs_fitted(fitted, resid):
    fig = px.scatter(x=fitted, y=resid, labels={"x": "Valores ajustados", "y": "Residuos"},
                     title="Residuos vs Ajustados")
    fig.add_hline(y=0, line_dash="dash", line_color="gray")
    return fig


def qq_plot(resid):
    r = np.asarray(resid)
    osm, osr = stats.probplot(r, dist="norm", fit=False)
    slope, intercept, *_ = stats.linregress(osm, osr)
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=osm, y=osr, mode="markers", name="Residuos"))
    fig.add_trace(go.Scatter(x=osm, y=slope * osm + intercept, mode="lines",
                             name="Línea teórica", line=dict(color="red")))
    fig.update_layout(title="QQ-Plot Normalidad", xaxis_title="Cuantiles teóricos",
                      yaxis_title="Cuantiles observados")
    return fig


def residuals_hist(resid):
    fig = px.histogram(resid, nbins=30, title="Histograma de residuos")
    fig.update_layout(xaxis_title="Residuo", yaxis_title="Frecuencia", showlegend=False)
    return fig


def monthly_bars(monthly: pd.DataFrame):
    fig = go.Figure()
    fig.add_trace(go.Bar(x=monthly["mes"], y=monthly["consumo_real"], name="Real", marker_color="#2E8B57"))
    fig.add_trace(go.Bar(x=monthly["mes"], y=monthly["consumo_predicho"], name="Esperado",
                         marker_color="#C71585"))
    fig.add_trace(go.Scatter(x=monthly["mes"], y=monthly["ahorro"], name="Ahorro", mode="lines+markers",
                             yaxis="y2", line=dict(color="#1f77b4")))
    fig.update_layout(
        title="Período Demostrativo — Real vs Esperado + Ahorro",
        barmode="group",
        xaxis_title="Mes",
        yaxis=dict(title="Consumo (kWh)"),
        yaxis2=dict(title="Ahorro (kWh)", overlaying="y", side="right"),
    )
    return fig


def tracking_line(df_savings: pd.DataFrame, date_col: str):
    df = df_savings.sort_values(date_col)
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df[date_col], y=df["consumo_real"], name="Real", mode="lines+markers"))
    fig.add_trace(go.Scatter(x=df[date_col], y=df["consumo_predicho"], name="Esperado", mode="lines+markers"))
    fig.update_layout(title="Seguimiento", xaxis_title="Fecha", yaxis_title="Consumo (kWh)")
    return fig
