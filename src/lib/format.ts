// Formateadores de presentación. Moneda en USD (decisión del proyecto).

const money0 = new Intl.NumberFormat('es-VE', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const money2 = new Intl.NumberFormat('es-VE', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat('es-VE', { maximumFractionDigits: 1 });

/** Dinero. Usa 2 decimales para montos pequeños (< 100) y enteros para el resto. */
export function fmtMoney(v: number): string {
  if (!isFinite(v)) return '—';
  return Math.abs(v) < 100 ? money2.format(v) : money0.format(v);
}

export function fmtMoney2(v: number): string {
  return isFinite(v) ? money2.format(v) : '—';
}

export function fmtKg(v: number): string {
  if (!isFinite(v)) return '—';
  return `${num.format(v)} kg`;
}

export function fmtNum(v: number): string {
  return isFinite(v) ? num.format(v) : '—';
}

export function fmtPct(v: number): string {
  return isFinite(v) ? `${num.format(v)}%` : '—';
}

/** Edad derivada desde una fecha de nacimiento (YYYY-MM-DD) hasta hoy. */
export function edadDesde(fechaNacimiento?: string): string {
  if (!fechaNacimiento) return '—';
  const nac = new Date(fechaNacimiento);
  if (isNaN(nac.getTime())) return '—';
  const meses = (Date.now() - nac.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (meses < 0) return '—';
  return fmtDuracion(meses);
}

/** Convierte meses a "X años Y meses" (o "Z meses", o "No se recupera"). */
export function fmtDuracion(meses: number): string {
  if (!isFinite(meses)) return 'No se recupera';
  if (meses < 1) return `${Math.round(meses * 30.44)} días`;
  const anios = Math.floor(meses / 12);
  const rest = Math.round(meses % 12);
  if (anios === 0) return `${rest} ${rest === 1 ? 'mes' : 'meses'}`;
  const aTxt = `${anios} ${anios === 1 ? 'año' : 'años'}`;
  if (rest === 0) return aTxt;
  return `${aTxt} ${rest} ${rest === 1 ? 'mes' : 'meses'}`;
}
