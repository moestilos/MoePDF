"""Genera CSVs sintéticos baseline + post-mejora para pruebas."""
from pathlib import Path
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)

OUT = Path(__file__).resolve().parent.parent / "data" / "samples"
OUT.mkdir(parents=True, exist_ok=True)

# ---- Baseline: 12 meses diarios, antes de mejora ----
n_base = 240
fechas_base = pd.date_range("2023-03-01", periods=n_base, freq="B")
produccion = rng.uniform(200, 900, n_base)
temperatura = rng.normal(22, 3, n_base)
humedad = rng.normal(53, 5, n_base)
horas = rng.choice([6, 8, 10, 12], n_base, p=[0.1, 0.6, 0.2, 0.1])

# Modelo verdadero baseline
ruido = rng.normal(0, 25, n_base)
consumo_base = 140 + 0.82 * produccion + 1.5 * temperatura - 0.3 * humedad + 4.0 * horas + ruido

df_base = pd.DataFrame({
    "Fecha": fechas_base,
    "Consumo_kWh": consumo_base.round(2),
    "Produccion": produccion.round(2),
    "Temperatura": temperatura.round(2),
    "Humedad": humedad.round(2),
    "Horas_Turno": horas,
})
df_base.to_csv(OUT / "baseline.csv", index=False)

# ---- Post-mejora: 3 meses, mejora ~25% ----
n_post = 60
fechas_post = pd.date_range("2024-03-01", periods=n_post, freq="B")
produccion_p = rng.uniform(200, 900, n_post)
temperatura_p = rng.normal(22, 3, n_post)
humedad_p = rng.normal(53, 5, n_post)
horas_p = rng.choice([6, 8, 10, 12], n_post, p=[0.1, 0.6, 0.2, 0.1])
ruido_p = rng.normal(0, 25, n_post)

# Aplicar reducción 25% (mejora real)
consumo_post = (140 + 0.82 * produccion_p + 1.5 * temperatura_p - 0.3 * humedad_p + 4.0 * horas_p + ruido_p) * 0.75

df_post = pd.DataFrame({
    "Fecha": fechas_post,
    "Consumo_kWh": consumo_post.round(2),
    "Produccion": produccion_p.round(2),
    "Temperatura": temperatura_p.round(2),
    "Humedad": humedad_p.round(2),
    "Horas_Turno": horas_p,
})
df_post.to_csv(OUT / "post_mejora.csv", index=False)

print(f"OK -> {OUT}")
print(f"  baseline.csv   ({len(df_base)} filas)")
print(f"  post_mejora.csv ({len(df_post)} filas)")
