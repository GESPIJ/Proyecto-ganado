interface Props {
  label: string;
  value: string;
  sub?: string;
  tone?: 'pos' | 'neg' | 'default';
  highlight?: boolean;
  wide?: boolean;
}

/** Tarjeta KPI: etiqueta + valor grande + sublabel opcional. */
export default function ResultCard({ label, value, sub, tone = 'default', highlight, wide }: Props) {
  const toneClass = tone === 'pos' ? ' pos' : tone === 'neg' ? ' neg' : '';
  return (
    <div className={`kpi${highlight ? ' hl' : ''}${wide ? ' wide' : ''}`}>
      <div className="k">{label}</div>
      <div className={`v${toneClass}`}>{value}</div>
      {sub && <div className="s">{sub}</div>}
    </div>
  );
}
