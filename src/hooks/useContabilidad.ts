import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Movimiento } from '../types';
import { dataSource } from '../api';

export interface ContaTotals {
  invertido: number;
  ingresos: number;
  gastos: number;
  balance: number;
}

/** El monto con signo según el tipo (gasto negativo). */
export function montoConSigno(m: Movimiento): number {
  return m.tipo === 'gasto' ? -m.monto : m.monto;
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

  return { movimientos, loading, error, save, remove, reload, totals };
}
