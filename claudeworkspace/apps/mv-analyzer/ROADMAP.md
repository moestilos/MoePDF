# Roadmap MV Analyzer

## Fase 1 — Paridad con original + extras inmediatos

- [ ] **Variables dummy/categóricas** desde UI. Selector "tratar como factor" → one-hot encoding `pd.get_dummies(drop_first=True)`. Casos típicos: turno, máquina, estación, día de la semana.
- [ ] **Auto-selección de transformación Y**. Botón "probar todas" → tabla comparativa (R², CV-RMSE, Shapiro p) por transformación. Recomienda la ganadora automáticamente.
- [ ] **Persistencia de sesión**. Guardar análisis (CSVs + parámetros + exclusiones) en `data/sessions/<timestamp>.json`. Botón "Cargar sesión previa".
- [ ] **Anotaciones en residuos**. Click sobre punto outlier → tooltip con fecha/fila/valor. Útil para identificar paradas no documentadas.

## Fase 2 — Robustez estadística

- [ ] **Intervalos de confianza del ahorro**. Banda 90/95% sobre predicción (no solo punto). Reporte: "ahorro 1314 ± 87 kWh (95% CI)".
- [ ] **Stepwise / Lasso** para selección automática de X. Útil con muchas variables candidatas.
- [ ] **Detección de heterocedasticidad** (Breusch-Pagan, White). Aviso si falla supuesto.
- [ ] **Durbin-Watson** para autocorrelación residual (series temporales).
- [ ] **Cross-validation baseline** (k-fold) para R² fuera de muestra. Más honesto que R² in-sample.

## Fase 3 — Reporting profesional

- [ ] **Export PDF informe IPMVP**. Plantilla con: portada, descripción de mejora, modelo, ecuación, diagnósticos, gráficas, tabla de ahorros, firma técnica. Usar ReportLab o WeasyPrint.
- [ ] **Export Excel multi-hoja**: datos, modelo, residuos, ahorros, resumen.
- [ ] **Versionado de modelos**. Comparar v1 vs v2 (re-entrenamiento periódico de baseline).

## Fase 4 — Modelos avanzados

- [ ] **GAM** (Generalized Additive Models). Consumo vs temperatura suele ser no-lineal (curva en U: calefacción + refrigeración).
- [ ] **Change-point regression (modelos 3P/4P/5P)**. HDD/CDD para edificios HVAC.
- [ ] **Random Forest baseline** + SHAP para identificar drivers cuando OLS no captura bien.
- [ ] **Time-of-use weighting**: pesar muestras por tarifa horaria.

## Fase 5 — Producto / multi-tenant

Si se quiere comercializar:

- [ ] Auth (login + organizaciones).
- [ ] BD persistente (Postgres/Supabase) con histórico de clientes/proyectos.
- [ ] API REST `/predict` y `/savings` para integraciones (n8n, ERP, BMS).
- [ ] Dashboard agregado multi-proyecto.
- [ ] Alertas: ahorro real < umbral → email/Slack.
- [ ] Conectores de lecturas automáticas (Modbus, OPC-UA, REST APIs de contadores).

## Fase 6 — Inteligencia

- [ ] Detección automática de anomalías post-mejora (degradación del ahorro en el tiempo).
- [ ] Recomendaciones automáticas: "VIF alto en X1/X2, sugiero quitar X2".
- [ ] Forecast de consumo a futuro (ARIMA/Prophet sobre baseline + drivers proyectados).
- [ ] Calculador de ROI: ahorro €/año vs CAPEX mejora → payback.

## Prioridad sugerida

1. **Fase 1 completa** primero. Cierra el gap funcional con apps comerciales (`Analizador Pro`, `EnergyCAP`, etc.). Sin dummies, muchos análisis reales no salen.
2. **Fase 3 (PDF)** si va a clientes. Es el entregable que firma la auditoría energética.
3. **Fase 5** si escala a producto SaaS.

Las fases 2/4/6 son mejoras de calidad técnica que se intercalan según necesidad real de los proyectos.
