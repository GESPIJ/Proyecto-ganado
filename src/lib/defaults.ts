// Valores de referencia. Todos son editables en pantalla; sirven solo como
// punto de partida para que el formulario no arranque en cero.
import type { MilkInput, MauteInput } from '../types';

export const COSTOS_ADMIN_PCT = 15; // % de los ingresos de leche (costos básicos + admin)
export const RENDIMIENTO_CANAL_PCT = 50; // % de rendimiento en canal
export const CRIA_PESO_NACIMIENTO = 35; // kg
export const CRIA_PESO_ENGORDE = 180; // kg (cuando la cría pasa a ser maute)
export const CRIA_GANANCIA_DIARIA = 0.6; // kg/día
export const MAUTE_PESO_INICIAL = 200; // kg
export const MAUTE_PESO_OBJETIVO = 450; // kg
export const MAUTE_GANANCIA_DIARIA = 0.9; // kg/día
export const LITROS_CONSERVADOR_FACTOR = 0.7;

export const MILK_DEFAULTS: MilkInput = {
  costoPorVaca: 1200,
  litrosDiaPorVaca: 8,
  cantidadVacas: 10,
  vacasOrdenadas: 8,
  inversionExtra: 0,
  inversionOverride: null,
  precioLitro: 0.6,
  conservadorPct: 75,
  costosAdminPct: COSTOS_ADMIN_PCT,
  socio: { activo: false, modo: 'porcentaje', valor: 50 },
  criaPesoNacimiento: CRIA_PESO_NACIMIENTO,
  criaPesoEngorde: CRIA_PESO_ENGORDE,
  criaGananciaDiaria: CRIA_GANANCIA_DIARIA,
};

export const MAUTE_DEFAULTS: MauteInput = {
  costoPorKilo: 2.2,
  cantidadMautes: 10,
  pesoInicialPorMaute: MAUTE_PESO_INICIAL,
  pesoObjetivoPorMaute: MAUTE_PESO_OBJETIVO,
  kilosSubenDia: MAUTE_GANANCIA_DIARIA,
  gastosPastosAdminMensual: 150,
  rendimientoCanalPct: RENDIMIENTO_CANAL_PCT,
  precioKiloPie: 2.6,
  precioKiloCanal: 4.8,
};
