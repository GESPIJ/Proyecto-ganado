export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="state">
      <div className="spinner" />
      {label}
    </div>
  );
}

export function Empty({ label }: { label: string }) {
  return <div className="state">{label}</div>;
}

export function ErrorState({ label }: { label: string }) {
  return <div className="state neg">{label}</div>;
}
