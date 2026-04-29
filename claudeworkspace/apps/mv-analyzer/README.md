# MV Analyzer

Verificación de ahorros energéticos vs línea base (M&V, IPMVP Opción C). Streamlit + statsmodels.

## Quick start

```bash
pip install -r requirements.txt
python scripts/gen_samples.py
streamlit run app.py
```

Abre `http://localhost:8501`. Sube `data/samples/baseline.csv` y luego `data/samples/post_mejora.csv`.

Documentación completa: [`INSTRUCTIONS.md`](INSTRUCTIONS.md).
