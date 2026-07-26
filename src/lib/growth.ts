import type { Timeline } from '../types';

const DIAS_MES = 30.44;
const DIAS_ANIO = 365;

/** Estima cuánto tarda un animal en llegar de un peso a otro dada su ganancia diaria. */
export function growthTimeline(opts: {
  pesoInicial: number;
  pesoObjetivo: number;
  gananciaDiaria: number;
}): Timeline {
  const kgFaltantes = Math.max(0, opts.pesoObjetivo - opts.pesoInicial);
  const dias = opts.gananciaDiaria > 0 ? kgFaltantes / opts.gananciaDiaria : Infinity;
  return {
    kgFaltantes,
    dias,
    meses: dias / DIAS_MES,
    anios: dias / DIAS_ANIO,
    pesoInicial: opts.pesoInicial,
    pesoFinal: opts.pesoObjetivo,
  };
}
