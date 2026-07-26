import type { Timeline as TL } from '../types';
import { fmtDuracion, fmtKg } from '../lib/format';

interface Props {
  title: string;
  timeline: TL;
  note?: string;
}

/** Muestra el crecimiento de un animal hasta su peso objetivo con una barra. */
export default function Timeline({ title, timeline, note }: Props) {
  const total = timeline.pesoFinal;
  const pct = total > 0 ? Math.min(100, Math.max(0, (timeline.pesoInicial / total) * 100)) : 0;
  return (
    <div className="card">
      <div className="spread">
        <strong>{title}</strong>
        <span className="chip be">{fmtDuracion(timeline.meses)}</span>
      </div>
      <div className="bar">
        <i style={{ width: `${pct}%`, background: 'var(--muted)' }} />
      </div>
      <div className="meta">
        <div>
          <span className="l">Peso inicial</span>
          <span className="d">{fmtKg(timeline.pesoInicial)}</span>
        </div>
        <div>
          <span className="l">Peso objetivo</span>
          <span className="d">{fmtKg(timeline.pesoFinal)}</span>
        </div>
        <div>
          <span className="l">Faltan</span>
          <span className="d">{fmtKg(timeline.kgFaltantes)}</span>
        </div>
        <div>
          <span className="l">Tiempo estimado</span>
          <span className="d">{fmtDuracion(timeline.meses)}</span>
        </div>
      </div>
      {note && <div className="help" style={{ marginTop: 10 }}>{note}</div>}
    </div>
  );
}
