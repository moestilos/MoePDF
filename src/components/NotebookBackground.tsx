import { useEffect, useRef, useState } from 'react';

const CELL = 24;
const MAJOR_EVERY = 5;

interface Dot { id: number; x: number; y: number; color: string; born: number; life: number; }

const COLORS = ['rgba(20, 184, 166, 0.55)', 'rgba(249, 115, 22, 0.5)', 'rgba(245, 158, 11, 0.45)'];

export default function NotebookBackground() {
  const [dots, setDots] = useState<Dot[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastSpawn = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced.current) return;

    let id = 0;
    function tick(t: number) {
      // spawn dot every 1.2-2s, max 5 alive
      if (t - lastSpawn.current > 1400 + Math.random() * 800) {
        lastSpawn.current = t;
        setDots((d) => {
          const alive = d.filter((x) => t - x.born < x.life);
          if (alive.length >= 5) return alive;
          const cols = Math.floor(window.innerWidth / CELL);
          const rows = Math.floor(window.innerHeight / CELL);
          const gx = Math.floor(Math.random() * cols) * CELL;
          const gy = Math.floor(Math.random() * rows) * CELL;
          return [
            ...alive,
            {
              id: ++id,
              x: gx,
              y: gy,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              born: t,
              life: 2800 + Math.random() * 1800,
            },
          ];
        });
      }
      // clean dead
      setDots((d) => d.filter((x) => t - x.born < x.life));
      rafRef.current = requestAnimationFrame(tick);
    }

    function onVis() {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    document.addEventListener('visibilitychange', onVis);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const patternId = 'nb-grid';
  const majorId = 'nb-grid-major';
  const MAJOR = CELL * MAJOR_EVERY;

  return (
    <div aria-hidden className="notebook-bg fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* base paper color handled by CSS vars */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <path
              d={`M ${CELL} 0 L 0 0 0 ${CELL}`}
              fill="none"
              stroke="rgb(var(--nb-minor))"
              strokeWidth="1"
              className="nb-line-minor"
            />
          </pattern>
          <pattern id={majorId} width={MAJOR} height={MAJOR} patternUnits="userSpaceOnUse">
            <rect width={MAJOR} height={MAJOR} fill={`url(#${patternId})`} />
            <path
              d={`M ${MAJOR} 0 L 0 0 0 ${MAJOR}`}
              fill="none"
              stroke="rgb(var(--nb-major))"
              strokeWidth="1.25"
              className="nb-line-major"
            />
          </pattern>
          <linearGradient id="nb-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="50%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.55" />
          </linearGradient>
          <mask id="nb-mask">
            <rect width="100%" height="100%" fill="url(#nb-fade)" />
          </mask>
        </defs>

        <g mask="url(#nb-mask)">
          <rect width="100%" height="100%" fill={`url(#${majorId})`} className="nb-pan" />
          {/* margin line */}
          <line x1="52" y1="0" x2="52" y2="100%" stroke="rgb(var(--nb-margin))" strokeWidth="1.25" className="nb-margin" />
        </g>

        {/* ink dots */}
        <g className="nb-dots">
          {dots.map((d) => {
            const now = performance.now();
            const age = (now - d.born) / d.life;
            const opacity = age < 0.2 ? age / 0.2 : age > 0.75 ? (1 - age) / 0.25 : 1;
            const r = 2 + Math.sin(age * Math.PI) * 2;
            return (
              <g key={d.id} transform={`translate(${d.x}, ${d.y})`}>
                <circle r={r + 2} fill={d.color} opacity={Math.max(0, opacity * 0.25)} />
                <circle r={r} fill={d.color} opacity={Math.max(0, opacity)} />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
