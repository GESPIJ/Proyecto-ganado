import type { Animal, DataSource, Registro } from '../types';
import { apiBaseUrl, getApiKey } from './client';

// Implementación contra el backend Mongo. Misma interfaz que la local, así que
// activar VITE_API_URL cambia la fuente de datos sin modificar las vistas.
function headers(extra: Record<string, string> = {}): Record<string, string> {
  const k = getApiKey();
  return { ...extra, ...(k ? { 'x-api-key': k } : {}) };
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const httpDataSource: DataSource = {
  async listAnimals() {
    return json<Animal[]>(await fetch(`${apiBaseUrl}/animals`, { headers: headers() }));
  },
  async saveAnimal(a) {
    return json<Animal>(
      await fetch(`${apiBaseUrl}/animals/${a.id}`, {
        method: 'PUT',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(a),
      }),
    );
  },
  async deleteAnimal(id) {
    const res = await fetch(`${apiBaseUrl}/animals/${id}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
  async addRegistro(animalId, r: Omit<Registro, 'id'>) {
    return json<Animal>(
      await fetch(`${apiBaseUrl}/animals/${animalId}/registros`, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(r),
      }),
    );
  },
  async deleteRegistro(animalId, registroId) {
    return json<Animal>(
      await fetch(`${apiBaseUrl}/animals/${animalId}/registros/${registroId}`, {
        method: 'DELETE',
        headers: headers(),
      }),
    );
  },
  async uploadFoto(animalId, file) {
    const form = new FormData();
    form.append('foto', file);
    // Nota: NO seteamos Content-Type — el navegador pone el boundary multipart.
    const res = await fetch(`${apiBaseUrl}/animals/${animalId}/foto`, {
      method: 'POST',
      headers: headers(),
      body: form,
    });
    const data = await json<{ fotoUrl: string | null }>(res);
    return data.fotoUrl;
  },
};
