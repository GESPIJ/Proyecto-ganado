interface Point {
  fecha: string;
  valor: number;
}

interface Props {
  points: Point[];
  label: string;
  unit: string;
}

/** Mini-gráfico de línea (SVG puro, sin librerías) de una serie {fecha, valor}. */
export default function MiniChart({ points, label, unit }: Props) {
  if (points.length < 2) return null;

  const sorted = [...points].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const valores = sorted.map((p) => p.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const span = max - min || 1;

  // viewBox 0..100 (x) × 0..100 (y). Invertimos y para que arriba sea mayor.
  const coords = sorted.map((p, i) => {
    const x = sorted.length === 1 ? 0 : (i / (sorted.length - 1)) * 100;
    const y = 100 - ((p.valor - min) / span) * 90 - 5; // margen 5% arriba/abajo
    return [x, y] as const;
  });
  const poly = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  return (
    <div>
      <div className="spread" style={{ fontSize: 12 }}>
        <span className="mut">{label}</span>
        <span className="mut">
          {min === max ? `${max} ${unit}` : `${min}–${max} ${unit}`}
        </span>
      </div>
      <svg className="mini" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={label}>
        <line className="base" x1="0" y1="99" x2="100" y2="99" />
        <polyline points={poly} />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.6} />
        ))}
      </svg>
    </div>
  );
}
