import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Animal } from '../types';
import { dataSource } from '../api';

export interface InventoryTotals {
  total: number;
  activos: number;
  kilosGanados: number;
  inversionTotal: number;
  valorVendido: number;
  resultadoNeto: number;
  totalLitros: number;
}

export function kilosGanados(a: Animal): number {
  return a.pesoActual - a.pesoEntrada;
}
export function inversionAnimal(a: Animal): number {
  return a.costoCompra + a.gastosAcumulados;
}
export function resultadoAnimal(a: Animal): number {
  return (a.valorVenta ?? 0) - inversionAnimal(a);
}
export function totalLitros(a: Animal): number {
  return a.registros.filter((r) => r.tipo === 'leche').reduce((s, r) => s + r.valor, 0);
}
export function ultimoPeso(a: Animal): number {
  const pesos = a.registros.filter((r) => r.tipo === 'peso');
  if (pesos.length === 0) return a.pesoActual;
  return [...pesos].sort((x, y) => (x.fecha < y.fecha ? 1 : -1))[0].valor;
}

export function useInventory() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const list = await dataSource.listAnimals();
      list.sort((a, b) => (a.fechaEntrada < b.fechaEntrada ? 1 : -1));
      setAnimals(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando el inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(
    async (a: Animal) => {
      await dataSource.saveAnimal(a);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await dataSource.deleteAnimal(id);
      await reload();
    },
    [reload],
  );

  const addRegistro = useCallback(
    async (animalId: string, r: Omit<Animal['registros'][number], 'id'>) => {
      await dataSource.addRegistro(animalId, r);
      await reload();
    },
    [reload],
  );

  const deleteRegistro = useCallback(
    async (animalId: string, registroId: string) => {
      await dataSource.deleteRegistro(animalId, registroId);
      await reload();
    },
    [reload],
  );

  const uploadFoto = useCallback(
    async (animalId: string, file: File) => {
      const url = await dataSource.uploadFoto(animalId, file);
      await reload();
      return url;
    },
    [reload],
  );

  const totals = useMemo<InventoryTotals>(() => {
    return animals.reduce<InventoryTotals>(
      (acc, a) => {
        acc.total += 1;
        if (a.estado === 'activo') acc.activos += 1;
        acc.kilosGanados += kilosGanados(a);
        acc.inversionTotal += inversionAnimal(a);
        acc.valorVendido += a.valorVenta ?? 0;
        acc.resultadoNeto += resultadoAnimal(a);
        acc.totalLitros += totalLitros(a);
        return acc;
      },
      { total: 0, activos: 0, kilosGanados: 0, inversionTotal: 0, valorVendido: 0, resultadoNeto: 0, totalLitros: 0 },
    );
  }, [animals]);

  return { animals, loading, error, save, remove, addRegistro, deleteRegistro, uploadFoto, totals, reload };
}
