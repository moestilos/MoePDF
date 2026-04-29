# Guía de uso — MV Analyzer

Manual práctico para ejecutar y usar la aplicación. Para fundamento estadístico y arquitectura técnica, ver `INSTRUCTIONS.md`.

---

## 1. Qué hace esta app

Calcula el **ahorro energético real** de una mejora (cambio de equipos, optimización, ESCO, etc.) comparando:

- **Lo que SE CONSUMIÓ** después de la mejora (real medido).
- **Lo que SE HABRÍA CONSUMIDO** sin la mejora (predicho por un modelo de regresión ajustado al período anterior).

La diferencia = ahorro atribuible a la mejora.

Sigue el protocolo **IPMVP Opción C** (ahorros a nivel de instalación con regresión).

---

## 2. Requisitos

- **Python 3.10+** instalado (`python --version`).
- Acceso a internet para instalar dependencias la primera vez.
- Dos archivos CSV: uno del período baseline (antes), otro del período post-mejora (después).

---

## 3. Instalación (una sola vez)

Abrir terminal en la carpeta del proyecto:

```bash
cd C:\Users\gmate\Desktop\claudeworkspace\apps\mv-analyzer
pip install -r requirements.txt
```

Tarda 1–3 minutos. Instala Streamlit, pandas, statsmodels, plotly, etc.

---

## 4. Lanzar la app

Hay tres formas:

### A) Doble click (Windows)

Doble click en `run.bat`. Abre terminal + navegador automáticamente.

### B) Comando manual

```bash
cd C:\Users\gmate\Desktop\claudeworkspace\apps\mv-analyzer
streamlit run app.py
```

### C) Desde Claude Code

```
! streamlit run app.py
```

En cualquier caso, abrir en navegador: **http://localhost:8501**.

Para parar: `Ctrl+C` en la terminal.

---

## 5. Generar datos de prueba

Si todavía no tienes CSVs reales:

```bash
python scripts/gen_samples.py
```

Crea:
- `data/samples/baseline.csv` — 240 filas, año 2023, sin mejora.
- `data/samples/post_mejora.csv` — 60 filas, año 2024, con 25% de ahorro simulado.

Sirven para probar todas las funciones.

---

## 6. Formato CSV esperado

Columnas mínimas:
- Una columna **fecha** (cualquier formato razonable, ej. `2024-03-15`, `15/03/2024`).
- Una columna **consumo** numérica (Y, ej. `Consumo_kWh`).
- Una o más columnas **explicativas** numéricas (X, ej. `Produccion`, `Temperatura`).

Ejemplo:

```
Fecha,Consumo_kWh,Produccion,Temperatura,Humedad,Horas_Turno
2023-03-01,725.40,612.30,21.50,52.10,8
2023-03-02,689.12,580.05,22.30,51.80,8
...
```

**Importante**: el CSV post-mejora debe tener **las mismas columnas X** que el baseline (los nombres tienen que coincidir exactamente).

---

## 7. Flujo de trabajo paso a paso

### Paso 1 — Subir baseline

Sidebar izquierdo, sección **"1. Baseline (Referencia)"**. Click en *Browse* y elegir el CSV del período antes de la mejora.

### Paso 2 — Configurar columnas

Tras la subida, el sidebar muestra selectores nuevos:

- **Fecha**: columna que contiene fechas (auto-detecta si la columna se llama "Fecha"/"Date").
- **Consumo (Y)**: variable a explicar (ej. `Consumo_kWh`).
- **Variables (X)**: una o varias variables independientes (ej. `Produccion`, `Temperatura`).

### Paso 3 — Ajustar parámetros

Sección **"3. Parámetros"**:

- **Limpieza Outliers (Cook's <=)**: filas con distancia de Cook mayor al umbral se descartan. Por defecto 0.5. Bajar a 0.1–0.3 si hay muchos outliers obvios.
- **Transformación de Y**:
  - `ninguna` — modelo lineal puro.
  - `log` — usar si los residuos tienen sesgo a la derecha (lo más común).
  - `sqrt`, `inversa`, `cuadrada`, `boxcox` — alternativas según diagnóstico.

### Paso 4 — Excluir filas o fechas (opcional pero importante)

Expander **"Excluir filas/fechas del Baseline"**:

- **Rango de fechas a INCLUIR**: usa el calendario para acotar.
- **Excluir fechas concretas**: lista multi-select para quitar días puntuales (paradas, festivos, mantenimientos).
- **Excluir filas por índice**: si conoces el número de fila exacto.

### Paso 5 — Validar el modelo

Ir a la pestaña **"Modelo y Ecuación"**. Comprobar:

| Métrica | Aceptable | Dónde la veo |
|---|---|---|
| R² | ≥ 0.75 | Tabla "Resumen del modelo" |
| CV(RMSE) % | ≤ 20 | Tabla "Resumen del modelo" |
| VIF por variable | < 5 | Tabla VIF |
| p-value coeficiente | < 0.05 | Texto summary statsmodels |

Si una variable tiene **p-value > 0.05** → no aporta. Quítala del selector "Variables (X)".
Si una variable tiene **VIF > 5** → multicolinealidad. Quita la de mayor VIF.

### Paso 6 — Validar normalidad

Pestaña **"Normalidad (QQ-Plot)"**. Los puntos deben caer cerca de la línea roja. Test Shapiro-Wilk: **p > 0.05** = OK.

Si falla → cambiar transformación de Y a `log` o `boxcox` y volver a validar.

### Paso 7 — Subir post-mejora

Sidebar **"2. Post-Mejora (Ahorros)"**. Subir CSV del período después de la mejora.

### Paso 8 — Ver ahorros

Pestaña **"Seguimiento de Ahorros"**:

- Métricas arriba: ahorro total kWh, ahorro medio por muestra, eficiencia %.
- Gráfica de barras mensual: real (verde) vs esperado (rosa) + línea de ahorro.
- Tabla detalle muestra a muestra.
- Botón **"Descargar resultados CSV"** para exportar.

Mismo expander de exclusiones para el período post (paradas en el demostrativo).

---

## 8. Casos de uso típicos

### Caso A — Cambio de iluminación LED

- Baseline: 12 meses con iluminación antigua. X = `Horas_Operacion`.
- Post: 3 meses con LED. Mismas horas → menor consumo.
- Resultado esperado: 40–60% de ahorro.

### Caso B — Variador de frecuencia en bomba

- Baseline: 6+ meses. X = `Caudal`, `Presion`.
- Post: tras instalación del variador.
- Resultado esperado: 15–35% según perfil de carga.

### Caso C — Optimización HVAC

- Baseline: 12 meses (ciclo completo de estaciones). X = `Temperatura_Exterior`, `Ocupacion`, `HDD`, `CDD`.
- Post: tras ajustes de setpoints / recuperación de calor.
- Recomendación: revisar si los residuos muestran patrón estacional → considerar modelo change-point (Fase 4 del roadmap).

---

## 9. Errores comunes y soluciones

| Síntoma | Causa probable | Solución |
|---|---|---|
| App no abre `localhost:8501` | Streamlit no instalado o puerto ocupado | `pip install streamlit`. Probar `streamlit run app.py --server.port 8502`. |
| "No module named X" | Falta dependencia | `pip install -r requirements.txt`. |
| R² muy bajo (< 0.5) | Faltan variables explicativas clave | Añadir más X (producción, temperatura). Revisar correlaciones. |
| VIF > 10 en varias X | Multicolinealidad severa | Eliminar la X más correlacionada con otras. |
| Shapiro p < 0.001 | Residuos no normales | Cambiar transformación Y a `log` o `boxcox`. |
| Ahorro negativo | El post consume MÁS que lo esperado | Revisar que el modelo sea válido en el rango de operación post. Posible regresión de la mejora. |
| Fechas no se parsean | Formato regional raro | Editar CSV para formato `YYYY-MM-DD` o `DD/MM/YYYY`. |
| `KeyError` al subir post | Columnas X no coinciden con baseline | Renombrar columnas del CSV post para que coincidan exactamente. |

---

## 10. Recomendaciones operativas

- **Documenta exclusiones**. Cada fecha que quites debe tener justificación (parada, mantenimiento, fallo de sensor). Audita después.
- **No extrapoles**. Si tu baseline cubre producción 200–900 ud/día, no apliques el modelo a un post con 1500 ud/día. Resultado no fiable.
- **Período baseline ≥ 9–12 meses** si hay estacionalidad climática.
- **Guarda copia del baseline.csv original**. Las exclusiones aplicadas en la UI no se persisten todavía (ver Roadmap Fase 1).
- **Revisa el gráfico Predicho vs Real** antes de fiarte de cualquier número. Si los puntos no siguen la diagonal, el modelo no sirve.

---

## 11. Comandos útiles

```bash
# Lanzar app
streamlit run app.py

# Lanzar en otro puerto
streamlit run app.py --server.port 8502

# Generar datos sintéticos
python scripts/gen_samples.py

# Verificar imports / pipeline desde consola
python -c "from core import regression; print('OK')"
```

---

## 12. Estructura de archivos relevante

```
apps/mv-analyzer/
├── app.py                  # Punto de entrada (lanza Streamlit)
├── run.bat                 # Lanzador Windows (doble click)
├── requirements.txt        # Dependencias
├── core/                   # Lógica (no tocar salvo desarrollo)
├── data/samples/           # CSVs sintéticos de prueba
├── scripts/gen_samples.py  # Generador de datos de prueba
├── INSTRUCTIONS.md         # Documentación técnica + estadística
├── GUIA_USO.md             # Este archivo
└── ROADMAP.md              # Mejoras planificadas
```

---

## 13. Documentos relacionados

- `INSTRUCTIONS.md` — fundamento técnico, fórmulas, criterios estadísticos detallados.
- `ROADMAP.md` — funcionalidades futuras planificadas.
- `README.md` — quick start de una página.
- `skills/mv-regression/SKILL.md` — guía teórica IPMVP/ASHRAE 14 cargable como skill de Claude.
