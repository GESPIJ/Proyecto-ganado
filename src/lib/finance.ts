import type { Payback, Socio } from '../types';

/** Retorno sobre la inversión, en %. */
export function roi(inversion: number, utilidad: number): number {
  return inversion > 0 ? (utilidad / inversion) * 100 : 0;
}

/** Tiempo de recuperación de la inversión. meses = Infinity si no hay utilidad positiva. */
export function payback(inversion: number, utilidadMensual: number): Payback {
  if (utilidadMensual <= 0) return { meses: Infinity, anios: Infinity };
  const meses = inversion / utilidadMensual;
  return { meses, anios: meses / 12 };
}

/** Reparte una utilidad entre propietario y socio según la configuración del socio. */
export function splitSocio(
  utilidad: number,
  socio: Socio,
): { propietario: number; socio: number } {
  if (!socio.activo || utilidad <= 0) return { propietario: utilidad, socio: 0 };
  const bruto = socio.modo === 'porcentaje' ? utilidad * (socio.valor / 100) : socio.valor;
  const parteSocio = Math.min(Math.max(bruto, 0), utilidad);
  return { propietario: utilidad - parteSocio, socio: parteSocio };
}
