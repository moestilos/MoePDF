import io
import numpy as np
import pandas as pd
import streamlit as st

from core import data_loader as dl
from core import regression as reg
from core import diagnostics as diag
from core import savings as sv
from core import plots as pl


st.set_page_config(page_title="MV Analyzer", layout="wide")
st.title("Analizador M&V — Verificación de Ahorros vs Línea Base")

# ---------- SIDEBAR ----------
with st.sidebar:
    st.header("1. Baseline (Referencia)")
    base_file = st.file_uploader("Subir Baseline (CSV)", type=["csv"], key="base")

    st.header("2. Post-Mejora (Ahorros)")
    post_file = st.file_uploader("Subir Ahorros (CSV)", type=["csv"], key="post")

    st.header("3. Parámetros")
    cooks_thr = st.slider("Limpieza Outliers (Cook's <=)", 0.0, 1.0, 0.5, 0.05)
    y_transform = st.selectbox("Transformación de Y", reg.TRANSFORMS, index=0)

    st.header("4. Visualización")
    view = st.selectbox("Vista seguimiento", ["Demostración (barras + ahorro mensual)", "Línea temporal"])


if base_file is None:
    st.info("Sube un CSV de baseline para empezar. Mira `data/samples/` para ejemplos.")
    st.stop()

# ---------- LOAD BASELINE ----------
df_base_raw = dl.load_csv(base_file)
date_col_default = dl.detect_date_column(df_base_raw)

st.sidebar.markdown("---")
st.sidebar.subheader("Columnas Baseline")
all_cols = list(df_base_raw.columns)
date_col = st.sidebar.selectbox("Fecha", [None] + all_cols,
                                index=(all_cols.index(date_col_default) + 1) if date_col_default else 0)
if date_col:
    df_base_raw = dl.load_csv(io.BytesIO(base_file.getvalue()), parse_date_col=date_col)

numeric_candidates = [c for c in df_base_raw.columns if c != date_col]
y_col = st.sidebar.selectbox("Consumo (Y)", numeric_candidates,
                             index=next((i for i, c in enumerate(numeric_candidates) if "consumo" in c.lower()), 0))
x_default = [c for c in numeric_candidates if c != y_col and "produc" in c.lower()]
x_cols = st.sidebar.multiselect("Variables (X)", [c for c in numeric_candidates if c != y_col],
                                default=x_default or [c for c in numeric_candidates if c != y_col][:1])

if not x_cols:
    st.warning("Selecciona al menos una variable independiente (X).")
    st.stop()

df_base = dl.coerce_numeric(df_base_raw, [y_col] + x_cols)
df_base = dl.impute_mean(df_base, [y_col] + x_cols)

# ---------- EXCLUSIÓN MANUAL ----------
with st.expander("Excluir filas/fechas del Baseline", expanded=False):
    if date_col and pd.api.types.is_datetime64_any_dtype(df_base[date_col]):
        dmin, dmax = df_base[date_col].min(), df_base[date_col].max()
        rng = st.date_input("Rango fechas a INCLUIR (baseline)", value=(dmin.date(), dmax.date()),
                            min_value=dmin.date(), max_value=dmax.date(), key="rng_base")
        if isinstance(rng, tuple) and len(rng) == 2:
            mask = (df_base[date_col].dt.date >= rng[0]) & (df_base[date_col].dt.date <= rng[1])
            df_base = df_base[mask]
        excl_dates = st.multiselect("Excluir fechas concretas", sorted(df_base[date_col].dt.date.unique()),
                                    key="excl_base")
        if excl_dates:
            df_base = df_base[~df_base[date_col].dt.date.isin(excl_dates)]
    excl_idx = st.multiselect("Excluir filas por índice", df_base.index.tolist(), key="excl_idx_base")
    if excl_idx:
        df_base = df_base.drop(index=excl_idx)

# ---------- FIT INICIAL + COOK'S ----------
fit0 = reg.fit_ols(df_base, y_col, x_cols, y_transform=y_transform)
cd = diag.cooks_distance(fit0)
keep_mask = cd <= cooks_thr
df_base_clean = df_base.loc[fit0["X"].index[keep_mask]].copy()
fit = reg.fit_ols(df_base_clean, y_col, x_cols, y_transform=y_transform)

# ---------- TABS ----------
tab1, tab2, tab3, tab4 = st.tabs([
    "Seguimiento de Ahorros", "Modelo y Ecuación", "Normalidad (QQ-Plot)", "Estadística Descriptiva"
])

# ---- Tab 2: Modelo ----
with tab2:
    st.subheader("Predicho vs Real (Baseline)")
    y_pred_base = reg.predict(fit, df_base_clean)
    st.plotly_chart(pl.predicted_vs_real(df_base_clean[y_col], pd.Series(y_pred_base)), use_container_width=True)
    st.latex(reg.equation_string(fit).replace("*", r"\cdot "))

    cols = st.columns(2)
    with cols[0]:
        st.markdown("**Resumen del modelo**")
        st.dataframe(pd.Series(reg.model_summary(fit), name="valor").to_frame().round(4))
    with cols[1]:
        st.markdown("**VIF (multicolinealidad)**")
        if len(x_cols) > 1:
            st.dataframe(reg.vif_table(df_base_clean, x_cols).round(3))
        else:
            st.caption("VIF requiere ≥ 2 variables X")

    st.markdown("**Coeficientes (statsmodels)**")
    st.text(str(fit["model"].summary()))

    st.plotly_chart(pl.residuals_vs_fitted(diag.fitted(fit), diag.residuals(fit)), use_container_width=True)
    st.plotly_chart(pl.residuals_hist(diag.residuals(fit)), use_container_width=True)

    st.caption(f"Filas usadas tras limpieza Cook's ≤ {cooks_thr}: {len(df_base_clean)} / {len(df_base)}")

# ---- Tab 3: QQ ----
with tab3:
    st.plotly_chart(pl.qq_plot(diag.residuals(fit)), use_container_width=True)
    sh = diag.shapiro_test(diag.residuals(fit))
    st.write("**Shapiro-Wilk**:", sh)
    st.caption("p > 0.05 → no se rechaza normalidad de residuos.")

# ---- Tab 4: Descriptiva ----
with tab4:
    st.dataframe(diag.descriptive(df_base, [c for c in [y_col] + x_cols if c in df_base.columns]))

# ---- Tab 1: Seguimiento ----
with tab1:
    if post_file is None:
        st.info("Sube un CSV post-mejora para calcular ahorros.")
    else:
        df_post_raw = dl.load_csv(io.BytesIO(post_file.getvalue()), parse_date_col=date_col)
        df_post = dl.coerce_numeric(df_post_raw, [y_col] + x_cols)
        df_post = dl.impute_mean(df_post, [y_col] + x_cols)

        with st.expander("Excluir filas/fechas del Demostrativo", expanded=False):
            if date_col and pd.api.types.is_datetime64_any_dtype(df_post[date_col]):
                dmin, dmax = df_post[date_col].min(), df_post[date_col].max()
                rng2 = st.date_input("Rango fechas a INCLUIR (post)", value=(dmin.date(), dmax.date()),
                                     min_value=dmin.date(), max_value=dmax.date(), key="rng_post")
                if isinstance(rng2, tuple) and len(rng2) == 2:
                    mask = (df_post[date_col].dt.date >= rng2[0]) & (df_post[date_col].dt.date <= rng2[1])
                    df_post = df_post[mask]
                excl_post = st.multiselect("Excluir fechas concretas (post)",
                                           sorted(df_post[date_col].dt.date.unique()), key="excl_post")
                if excl_post:
                    df_post = df_post[~df_post[date_col].dt.date.isin(excl_post)]
            excl_idx_post = st.multiselect("Excluir filas por índice (post)", df_post.index.tolist(),
                                           key="excl_idx_post")
            if excl_idx_post:
                df_post = df_post.drop(index=excl_idx_post)

        df_sav = sv.compute_savings(fit, df_post, y_col, date_col)
        s = sv.summary(df_sav)

        c1, c2, c3 = st.columns(3)
        c1.metric("Ahorro total (kWh)", f"{s['ahorro_total_kwh']:.2f}")
        c2.metric("Ahorro medio / muestra", f"{s['ahorro_medio_muestra_kwh']:.2f}")
        c3.metric("Eficiencia lograda", f"{s['eficiencia_pct']:.1f} %")

        if view.startswith("Demostración") and date_col:
            monthly = sv.monthly_aggregate(df_sav, date_col)
            st.plotly_chart(pl.monthly_bars(monthly), use_container_width=True)
            st.dataframe(monthly.round(2))
        elif date_col:
            st.plotly_chart(pl.tracking_line(df_sav, date_col), use_container_width=True)

        st.markdown("**Detalle muestra a muestra**")
        st.dataframe(df_sav.round(2))

        csv_buf = df_sav.to_csv(index=False).encode("utf-8")
        st.download_button("Descargar resultados CSV", csv_buf, "ahorros.csv", "text/csv")
