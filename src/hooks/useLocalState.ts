import { useEffect, useState } from 'react';

/**
 * Estado persistido en localStorage bajo una clave propia. Sirve para que los
 * formularios de proyección no pierdan lo tecleado al recargar. Hace merge con
 * el valor inicial para tolerar campos nuevos añadidos después.
 */
export function useLocalState<T extends object>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      return { ...initial, ...(JSON.parse(raw) as Partial<T>) };
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* almacenamiento lleno o no disponible: se ignora */
    }
  }, [key, state]);

  return [state, setState] as const;
}
