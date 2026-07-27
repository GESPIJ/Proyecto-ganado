import type { Animal, DataSource, Movimiento, Registro } from '../types';
import { apiBaseUrl, getApiKey, getContaAuth } from './client';

// Implementación contra el backend Mongo. Misma interfaz que la local, así que
// activar VITE_API_URL cambia la fuente de datos sin modificar las vistas.
function headers(extra: Record<string, string> = {}): Record<string, string> {
  const k = getApiKey();
  return { ...extra, ...(k ? { 'x-api-key': k } : {}) };
}

// Headers para /movimientos: API key + credenciales de contabilidad.
function contaHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const a = getContaAuth();
  return { ...headers(extra), ...(a ? { 'x-conta-user': a.user, 'x-conta-key': a.key } : {}) };
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
  async listMovimientos() {
    return json<Movimiento[]>(await fetch(`${apiBaseUrl}/movimientos`, { headers: contaHeaders() }));
  },
  async saveMovimiento(m) {
    return json<Movimiento>(
      await fetch(`${apiBaseUrl}/movimientos/${m.id}`, {
        method: 'PUT',
        headers: contaHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(m),
      }),
    );
  },
  async deleteMovimiento(id) {
    const res = await fetch(`${apiBaseUrl}/movimientos/${id}`, { method: 'DELETE', headers: contaHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};
