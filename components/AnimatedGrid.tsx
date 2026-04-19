'use client'

/**
 * AnimatedGrid — fondo de cuadros tipo Linear/Raycast
 *
 * - Grid de celdas 80×80px
 * - ~10% de celdas pulsan con color índigo/violeta
 * - Totalmente determinista (sin Math.random) para evitar
 *   hidratación inconsistente en Next.js
 * - GPU-accelerated via opacity only
 */

const CELL = 80   // tamaño de celda en px
const COLS = 26   // columnas (cubre pantallas hasta ~2100px)
const ROWS = 18   // filas (cubre pantallas hasta ~1440px)

// Función determinista: decide si una celda brilla
function shouldGlow(col: number, row: number): boolean {
  // Hash rápido sin random — distribuye ~1/12 celdas
  return ((col * 11 + row * 7 + col * row * 3) % 12) === 0
}

// Delay estable por celda: 0–14s (distribuido tipo golden ratio)
function getDelay(col: number, row: number): number {
  const idx = row * COLS + col
  return ((idx * 137) % 28) * 0.5  // 0 – 14s
}

// Duración: 4–8s
function getDuration(col: number, row: number): number {
  const idx = row * COLS + col
  return 4 + ((idx * 97) % 5)  // 4 – 8s
}

// Color de la celda al brillar
function getColor(col: number, row: number): string {
  const palette = [
    'rgba(99,102,241,0.18)',    // indigo
    'rgba(124,58,237,0.15)',    // violet
    'rgba(79,70,229,0.16)',     // indigo oscuro
    'rgba(139,92,246,0.13)',    // violet claro
    'rgba(59,130,246,0.12)',    // azul
  ]
  return palette[(col * 3 + row * 5) % palette.length]
}

export function AnimatedGrid() {
  const cells: React.ReactNode[] = []

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!shouldGlow(col, row)) continue
      cells.push(
        <div
          key={`${col}-${row}`}
          style={{
            position: 'absolute',
            left:  col * CELL,
            top:   row * CELL,
            width:  CELL - 1,
            height: CELL - 1,
            background: getColor(col, row),
            borderRadius: 2,
            opacity: 0,
            animation: `cellGlow ${getDuration(col, row)}s ${getDelay(col, row)}s ease-in-out infinite alternate`,
            willChange: 'opacity',
          }}
        />
      )
    }
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {cells}
    </div>
  )
}
