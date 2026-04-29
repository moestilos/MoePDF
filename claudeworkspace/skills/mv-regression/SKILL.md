---
name: mv-regression
description: Guía para análisis M&V (Medida y Verificación) de ahorros energéticos con regresión lineal estilo IPMVP Opción C. Use when user says 'M&V', 'medida y verificación', 'ahorro energético', 'línea base energética', 'IPMVP', 'baseline regresión', 'verificar ahorros', or trabaja en `apps/mv-analyzer`. Cubre criterios ASHRAE Guideline 14, transformaciones, VIF, Cook's distance, dummies, validación de supuestos OLS.
---

# Skill: mv-regression — análisis M&V con regresión

## Cuándo aplicar

Usuario quiere medir ahorros energéticos comparando consumo real post-mejora contra consumo esperado modelado desde una línea base. Estándar IPMVP (International Performance Measurement and Verification Protocol).

## Flujo canónico

1. **Cargar baseline** — período antes de mejora (idealmente ≥ 12 meses para capturar estacionalidad).
2. **Identificar variables explicativas** — drivers físicos del consumo:
   - Producción (unidades/lotes/output).
   - Temperatura ambiente (HVAC).
   - Humedad.
   - Horas de operación.
   - Días de la semana / festivos (dummies).
3. **Limpiar datos**:
   - Convertir a numérico (`as.numeric` / `pd.to_numeric`).
   - Imputar NAs por media/mediana o eliminar si son pocos.
   - Eliminar registros de paradas, mantenimientos, anomalías documentadas.
4. **Ajustar OLS** y revisar:
   - Significancia (p-value < 0.05) por coeficiente.
   - R² ≥ 0.75, idealmente > 0.85.
   - CV(RMSE) ≤ 20 % (ASHRAE 14 mensual; ≤ 5 % bills horarios).
   - VIF < 5 por X (sin multicolinealidad severa).
5. **Diagnóstico residuos**:
   - Residuos vs ajustados → aleatorios (homocedasticidad).
   - QQ-plot + Shapiro-Wilk → normalidad (p > 0.05).
   - Histograma → forma de campana.
6. **Si fallan supuestos**:
   - Sesgo derecha → transformar Y a log.
   - Heterocedasticidad → log o Box-Cox.
   - Outliers → Cook's distance (> 4/n o > 0.5 — descartable).
   - Multicolinealidad → eliminar X redundante (la de mayor VIF).
7. **Predecir post-mejora** con el modelo final aplicado a las nuevas X.
8. **Ahorro = ŷ_post − y_post_real** (consumo evitado).
9. **Reportar**: ahorro absoluto (kWh), porcentual (%), incertidumbre (intervalo confianza al 90/95%).

## Criterios de aceptación (resumen)

| Métrica | Umbral aceptable |
|---|---|
| R² | ≥ 0.75 |
| CV(RMSE) mensual | ≤ 20 % |
| CV(RMSE) horario | ≤ 30 % |
| VIF | < 5 |
| Shapiro p-value | > 0.05 |
| t-statistic por X | \|t\| > 2 |

## Variables dummy (categóricas)

Convertir variables categóricas (origen, turno, estación) con one-hot encoding. R: `factor(df$col)`. Python: `pd.get_dummies(df, columns=[...], drop_first=True)`. Una categoría queda como base (intercepto).

## Transformaciones comunes de Y

| Forma residuos | Transformación |
|---|---|
| Sesgo derecha (cola larga >0) | log(Y) |
| Varianza ∝ media | sqrt(Y) |
| Varianza ∝ media² | log(Y) |
| Datos % o tasas | logit / arcsin√ |
| Auto-óptima | Box-Cox (`scipy.stats.boxcox`) |

Para invertir predicciones recordar: `exp(ŷ)` para log, `ŷ²` para sqrt, etc.

## Errores frecuentes

- Usar baseline corto (< 9 meses) → no captura estacionalidad.
- Olvidar variables operativas clave (producción) → R² bajo y ahorro contaminado.
- Aplicar modelo baseline a un rango operativo fuera del entrenamiento (extrapolación).
- Mezclar unidades (kWh vs MWh) entre baseline y post.
- No documentar exclusiones (paradas) → no auditable.

## Referencias

- IPMVP Volume I (EVO).
- ASHRAE Guideline 14-2014 — Measurement of Energy, Demand, and Water Savings.
- FEMP M&V Guidelines v4.0.

## Apps relacionadas en este workspace

- `apps/mv-analyzer/` — implementación Streamlit (ver su `INSTRUCTIONS.md`).
