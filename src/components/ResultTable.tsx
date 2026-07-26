import type { ReactNode } from 'react';

export interface Row {
  label: string;
  value: ReactNode;
  tone?: 'pos' | 'neg' | 'default';
  strong?: boolean;
}

interface Props {
  title?: string;
  rows: Row[];
}

/** Tabla de dos columnas etiqueta / valor. */
export default function ResultTable({ title, rows }: Props) {
  return (
    <div className="proj">
      {title && <h2 className="sec">{title}</h2>}
      <table>
        <tbody>
          {rows.map((r, i) => {
            const toneClass = r.tone === 'pos' ? ' pos' : r.tone === 'neg' ? ' neg' : '';
            return (
              <tr key={i}>
                <td style={r.strong ? { fontWeight: 700 } : undefined}>{r.label}</td>
                <td className={`r${toneClass}`} style={r.strong ? { fontWeight: 700 } : undefined}>
                  {r.value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
