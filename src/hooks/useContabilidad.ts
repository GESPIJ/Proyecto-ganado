import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Movimiento, MovimientoCategoria } from '../types';
import { dataSource } from '../api';

export type Naturaleza = 'liquida' | 'inversion';

export const CATEGORIAS: MovimientoCategoria[] = ['mautes', 'vacas', 'camion', 'finca', 'otros'];
export const CATEGORIA_LABEL: Record<MovimientoCategoria, string> = {
  mautes: 'Mautes',
  vacas: 'Vacas',
  camion: 'Camión',
  finca: 'Finca',
  otros: 'Otros',
};
// Naturaleza de cada cuenta. 'otros' es líquida pero se oculta de gráficos/totales.
export const NATURALEZA: Record<MovimientoCategoria, Naturaleza> = {
  mautes: 'liquida', vacas: 'liquida', otros: 'liquida', finca: 'inversion', camion: 'inversion',
};
export const esLiquida = (c: MovimientoCategoria) => NATURALEZA[c] === 'liquida';
// Categorías que se muestran en gráficos/totales (Otros queda fuera).
export const CATEGORIAS_VISIBLES: MovimientoCategoria[] = ['mautes', 'vacas', 'camion', 'finca'];
export const LIQUIDAS_VISIBLES: MovimientoCategoria[] = ['mautes', 'vacas'];
export const INVERSION_CATS: MovimientoCategoria[] = ['finca', 'camion'];

export interface ContaTotals {
  liquido: number;
  invertido: number;
  total: number;
  otros: number;
}

/** Deltas por categoría de un movimiento (el efecto en cada cuenta). */
export function atribucion(m: Movimiento): { categoria: MovimientoCategoria; neto: number }[] {
  if (m.tipo === 'transferencia') {
    if (!m.origen || !m.destino) return [];
    return [{ categoria: m.origen, neto: -m.monto }, { categoria: m.destino, neto: m.monto }];
  }
  const signo = m.tipo === 'gasto' ? -1 : 1;
  if (m.desglose && m.desglose.length > 0) {
    return m.desglose.map((l) => ({ categoria: l.categoria, neto: signo * l.monto }));
  }
  return [{ categoria: m.categoria, neto: signo * m.monto }];
}

/**
 * Igual que useInventory pero para movimientos. `enabled` controla si se carga
 * (la contabilidad sólo carga cuando el usuario ya se autenticó en la vista).
 */
export function useContabilidad(enabled: boolean) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      setMovimientos(await dataSource.listMovimientos());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando la contabilidad');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void reload().catch(() => {});
  }, [enabled, reload]);

  const save = useCallback(
    async (m: Movimiento) => {
      await dataSource.saveMovimiento(m);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await dataSource.deleteMovimiento(id);
      await reload();
    },
    [reload],
  );

  // Saldo por categoría (cuenta): aportes/ventas suman, gastos restan, transferencias mueven.
  const saldoPorCategoria = useMemo<Record<MovimientoCategoria, number>>(() => {
    const acc = { mautes: 0, vacas: 0, camion: 0, finca: 0, otros: 0 } as Record<MovimientoCategoria, number>;
    for (const m of movimientos) {
      for (const a of atribucion(m)) acc[a.categoria] += a.neto;
    }
    return acc;
  }, [movimientos]);

  const totals = useMemo<ContaTotals>(() => {
    const sum = (cats: MovimientoCategoria[]) => cats.reduce((s, c) => s + saldoPorCategoria[c], 0);
    const liquido = sum(LIQUIDAS_VISIBLES);
    const invertido = sum(INVERSION_CATS);
    return { liquido, invertido, total: liquido + invertido, otros: saldoPorCategoria.otros };
  }, [saldoPorCategoria]);

  return { movimientos, loading, error, save, remove, reload, totals, saldoPorCategoria };
}
