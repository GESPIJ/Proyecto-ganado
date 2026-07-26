import type { MauteInput, MauteOutput, MauteSaleResult } from '../types';
import { payback, roi } from './finance';
import { growthTimeline } from './growth';

/** Proyección del negocio de mautes de engorde. Pura: resultado = mauteProjection(input). */
export function mauteProjection(input: MauteInput): MauteOutput {
  const inversionCompra =
    input.costoPorKilo * input.pesoInicialPorMaute * input.cantidadMautes;

  const timeline = growthTimeline({
    pesoInicial: input.pesoInicialPorMaute,
    pesoObjetivo: input.pesoObjetivoPorMaute,
    gananciaDiaria: input.kilosSubenDia,
  });
  // Para efectos de costos/payback usamos un periodo finito aunque el timeline sea Infinity.
  const mesesEngorde = isFinite(timeline.meses) ? timeline.meses : 0;
  const pesoFinal = input.pesoObjetivoPorMaute;

  const gastosPeriodo = input.gastosPastosAdminMensual * mesesEngorde;
  const costoTotal = inversionCompra + gastosPeriodo;

  const sale = (ingreso: number): MauteSaleResult => {
    const utilidad = ingreso - costoTotal;
    return {
      ingreso,
      utilidad,
      roi: roi(costoTotal, utilidad),
      payback: payback(costoTotal, mesesEngorde > 0 ? utilidad / mesesEngorde : utilidad),
    };
  };

  const ingresoPie = pesoFinal * input.precioKiloPie * input.cantidadMautes;
  const pesoCanal = pesoFinal * (input.rendimientoCanalPct / 100);
  const ingresoCanal = pesoCanal * input.precioKiloCanal * input.cantidadMautes;

  const pie = sale(ingresoPie);
  const canal = sale(ingresoCanal);

  return {
    inversionCompra,
    gastosPeriodo,
    costoTotal,
    timeline,
    mesesEngorde,
    pesoFinal,
    pesoCanal,
    pie,
    canal,
    mejorOpcion: canal.utilidad >= pie.utilidad ? 'canal' : 'pie',
  };
}
