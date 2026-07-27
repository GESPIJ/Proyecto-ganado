import type { MovimientoCategoria } from '../types';
import { CATEGORIAS, CATEGORIA_LABEL } from '../hooks/useContabilidad';
import { fmtMoney } from '../lib/format';

export const CAT_COLOR: Record<MovimientoCategoria, string> = {
  mautes: '#5b8cff',
  vacas: '#2fce7f',
  camion: '#e6a23c',
  finca: '#b57bff',
  otros: '#8a94a6',
};

/** Dona (SVG puro) del neto por categoría + leyenda. Los netos ≤ 0 se listan
 *  en la leyenda pero no dibujan arco. */
export default function DonutCategorias({ data }: { data: Record<MovimientoCategoria, number> }) {
  const conValor = CATEGORIAS.filter((c) => Math.abs(data[c]) > 0.005);
  if (conValor.length === 0) return null;

  const positivos = CATEGORIAS.filter((c) => data[c] > 0);
  const totalPos = positivos.reduce((s, c) => s + data[c], 0);

  const r = 40;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const segs = positivos.map((c) => {
    const len = totalPos > 0 ? (data[c] / totalPos) * C : 0;
    const seg = { c, len, offset: -acc };
    acc += len;
    return seg;
  });

  return (
    <div className="card">
      <div className="row" style={{ gap: 16, alignItems: 'center' }}>
        <svg width="118" height="118" viewBox="0 0 100 100" style={{ flex: 'none' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--chip)" strokeWidth="15" />
          <g transform="rotate(-90 50 50)">
            {segs.map((s) => (
              <circle
                key={s.c}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={CAT_COLOR[s.c]}
                strokeWidth="15"
                strokeDasharray={`${s.len} ${C - s.len}`}
                strokeDashoffset={s.offset}
              />
            ))}
          </g>
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          {conValor.map((c) => {
            const pct = totalPos > 0 && data[c] > 0 ? (data[c] / totalPos) * 100 : 0;
            return (
              <div key={c} className="spread" style={{ margin: '5px 0', fontSize: 13.5 }}>
                <span className="row" style={{ gap: 8 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, background: CAT_COLOR[c], display: 'inline-block', flex: 'none' }} />
                  <span>{CATEGORIA_LABEL[c]}</span>
                </span>
                <span className={data[c] < 0 ? 'neg' : ''} style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {fmtMoney(data[c])}{data[c] > 0 ? ` · ${pct.toFixed(0)}%` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
