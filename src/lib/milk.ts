import type { MilkInput, MilkOutput, MilkScenario } from '../types';
import { payback, roi, splitSocio } from './finance';
import { growthTimeline } from './growth';

const DIAS_MES = 30.44;
const DIAS_ANIO = 365;

/** Proyección del negocio de leche. Pura: resultado = milkProjection(input). */
export function milkProjection(input: MilkInput): MilkOutput {
  const inversionTotal =
    input.inversionOverride != null && input.inversionOverride > 0
      ? input.inversionOverride
      : input.costoPorVaca * input.cantidadVacas + input.inversionExtra;

  const scenario = (litrosDiaTotal: number): MilkScenario => {
    const ingresoDiario = litrosDiaTotal * input.precioLitro;
    const ingresoMensual = ingresoDiario * DIAS_MES;
    const ingresoAnual = ingresoDiario * DIAS_ANIO;
    const costosMensual = ingresoMensual * (input.costosAdminPct / 100);
    const utilidadBrutaMensual = ingresoMensual - costosMensual;
    const { propietario, socio } = splitSocio(utilidadBrutaMensual, input.socio);
    const utilidadAnual = propietario * 12;
    return {
      litrosDiaTotal,
      ingresoDiario,
      ingresoMensual,
      ingresoAnual,
      costosMensual,
      utilidadMensual: propietario,
      utilidadAnual,
      gananciaSocioMensual: socio,
      payback: payback(inversionTotal, propietario),
      roi: roi(inversionTotal, utilidadAnual),
    };
  };

  const litrosOptimo = input.vacasOrdenadas * input.litrosDiaPorVaca;
  const litrosConservador = litrosOptimo * (input.conservadorPct / 100);

  return {
    inversionTotal,
    optimo: scenario(litrosOptimo),
    conservador: scenario(litrosConservador),
    cria: growthTimeline({
      pesoInicial: input.criaPesoNacimiento,
      pesoObjetivo: input.criaPesoEngorde,
      gananciaDiaria: input.criaGananciaDiaria,
    }),
  };
}

export interface CategoriaEscenario {
  nombre: string;
  tono: 'pos' | 'warn' | 'neg';
}

/** Clasifica un % del escenario óptimo en una categoría con su tono. */
export function categoriaEscenario(pct: number): CategoriaEscenario {
  if (pct >= 90) return { nombre: 'Óptimo', tono: 'pos' };
  if (pct >= 70) return { nombre: 'Conservador', tono: 'warn' };
  if (pct >= 50) return { nombre: 'Malo', tono: 'warn' };
  return { nombre: 'Crítico', tono: 'neg' };
}
