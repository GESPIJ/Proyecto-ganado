import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Movimiento, MovimientoCategoria } from '../types';
import { dataSource } from '../api';

export interface ContaTotals {
  invertido: number;
  ingresos: number;
  gastos: number;
  balance: number;
}

export const CATEGORIAS: MovimientoCategoria[] = ['mautes', 'vacas', 'camion', 'finca', 'otros'];
export const CATEGORIA_LABEL: Record<MovimientoCategoria, string> = {
  mautes: 'Mautes',
  vacas: 'Vacas',
  camion: 'Camión',
  finca: 'Finca',
  otros: 'Otros',
};

/** El monto con signo según el tipo (gasto negativo). */
export function montoConSigno(m: Movimiento): number {
  return m.tipo === 'gasto' ? -m.monto : m.monto;
}

/** Atribución de un movimiento a categorías, con signo por tipo. Usa el desglose
 *  si existe; si no, atribuye todo el monto a su categoría única. */
export function atribucion(m: Movimiento): { categoria: MovimientoCategoria; neto: number }[] {
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

  const totals = useMemo<ContaTotals>(() => {
    const t: ContaTotals = { invertido: 0, ingresos: 0, gastos: 0, balance: 0 };
    for (const m of movimientos) {
      if (m.tipo === 'inversion') t.invertido += m.monto;
      else if (m.tipo === 'ingreso') t.ingresos += m.monto;
      else t.gastos += m.monto;
    }
    t.balance = t.invertido + t.ingresos - t.gastos;
    return t;
  }, [movimientos]);

  // Neto por categoría (inversión/ingreso suman, gasto resta).
  const porCategoria = useMemo<Record<MovimientoCategoria, number>>(() => {
    const acc = { mautes: 0, vacas: 0, camion: 0, finca: 0, otros: 0 } as Record<MovimientoCategoria, number>;
    for (const m of movimientos) {
      for (const a of atribucion(m)) acc[a.categoria] += a.neto;
    }
    return acc;
  }, [movimientos]);

  return { movimientos, loading, error, save, remove, reload, totals, porCategoria };
}
