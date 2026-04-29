# MV Analyzer — Instrucciones de operación

App Streamlit para verificación de ahorros energéticos vs línea base (M&V, IPMVP Opción C).

## Concepto

1. **Baseline**: período antes de la mejora. Se ajusta una regresión lineal:
   `Consumo = β₀ + β₁·X₁ + ... + βₙ·Xₙ + ε`
   con variables explicativas independientes (producción, temperatura, horas, etc.).
2. **Post-mejora**: período después de la intervención. Se aplica el modelo baseline a los nuevos `X` para obtener el **consumo esperado** (lo que se hubiera consumido sin mejora).
3. **Ahorro = Consumo esperado − Consumo real**.
4. La diferencia es atribuible a la mejora siempre que las variables explicativas capturen los drivers principales y los residuos del modelo cumplan supuestos OLS.

## Lanzar

```bash
cd apps/mv-analyzer
pip install -r requirements.txt
streamlit run app.py
```

URL local: `http://localhost:8501`.

## Generar datos sintéticos

```bash
python scripts/gen_samples.py
```

Crea `data/samples/baseline.csv` (240 filas) y `data/samples/post_mejora.csv` (60 filas, mejora del 25%).

## Estructura

- `app.py` — entry Streamlit, layout y tabs.
- `core/data_loader.py` — carga CSV, parseo fechas, imputación.
- `core/regression.py` — OLS, transformaciones (log/sqrt/inversa/cuadrada/Box-Cox), VIF.
- `core/diagnostics.py` — Cook's distance, residuos, Shapiro, descriptiva.
- `core/savings.py` — predicción y agregados de ahorro.
- `core/plots.py` — figuras Plotly.
- `scripts/gen_samples.py` — generador de datos sintéticos.

## Flujo de uso

1. **Sidebar 1** — Subir CSV baseline.
2. **Sidebar columnas** — Elegir Fecha, Y (Consumo), X (variables independientes).
3. **Sidebar 3 — Parámetros** — Slider Cook's distance (filas con CD > umbral se descartan), transformación de Y.
4. **Expander "Excluir filas/fechas del Baseline"** — Rango fechas a incluir, exclusión de fechas concretas o filas por índice.
5. **Tabs**:
   - *Modelo y Ecuación* — Predicho vs real, ecuación, R², CV(RMSE), VIF, residuos vs ajustados, histograma residuos.
   - *Normalidad (QQ-Plot)* — QQ + test Shapiro-Wilk.
   - *Estadística Descriptiva* — mean/sd/median/skew/kurtosis.
6. **Sidebar 2** — Subir CSV post-mejora (mismas columnas X que baseline).
7. **Tab Seguimiento de Ahorros** — Métricas (ahorro total, eficiencia %), gráfica mensual barras Real vs Esperado + línea ahorro, tabla detalle, descarga CSV.
   - Mismo expander de exclusión que baseline.

## Criterios M&V de aceptación

- **R² ≥ 0.75** del modelo baseline (idealmente > 0.85).
- **CV(RMSE) ≤ 20 %** (preferible < 15 %, ASHRAE Guideline 14).
- **VIF < 5** por variable independiente (sin multicolinealidad severa).
- **Shapiro-Wilk p > 0.05** sobre residuos (normalidad razonable).
- **Residuos vs ajustados** sin patrón evidente (homocedasticidad).

Si no se cumplen, opciones:
- Probar transformación log de Y (lo más común si los residuos están sesgados a la derecha).
- Eliminar variables con p-value > 0.05 o VIF > 5.
- Limpiar outliers con Cook's distance.

## Formato CSV esperado

Una columna fecha (parseable, dayfirst tolerado) + columnas numéricas. Ejemplo:

```
Fecha,Consumo_kWh,Produccion,Temperatura,Humedad,Horas_Turno
2023-03-01,725.40,612.30,21.50,52.10,8
...
```

El post-mejora debe contener **las mismas columnas X** seleccionadas en baseline + columna Y real para calcular ahorro.

## Limitaciones actuales

- Single-user, sin auth.
- Sin variables dummy / categóricas (todas las X se tratan numéricas). Roadmap: soporte `factor()` tipo `origin` del ejemplo Auto-mpg.
- Sin export PDF (solo CSV de resultados).
- Sin persistencia de sesión entre reinicios.

## Roadmap

- Variables dummy (one-hot encoding desde sidebar).
- Selección automática de mejor transformación (mínimo BIC).
- Stepwise / lasso para selección de X.
- Export informe PDF (IPMVP-style) con plantilla.
- Multi-modelo comparativo en tabla.
- Persistencia analiza JSON en `data/sessions/`.
