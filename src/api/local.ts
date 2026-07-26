import type { Animal, DataSource, Registro } from '../types';
import { STORAGE_KEY } from './client';
import { uid } from '../lib/id';

// Normaliza animales guardados antes de añadir registros/propósito para no romper
// datos existentes en localStorage.
function normalize(a: Partial<Animal>): Animal {
  return {
    ...(a as Animal),
    proposito: a.proposito ?? 'otro',
    fotoUrl: a.fotoUrl ?? null,
    registros: a.registros ?? [],
  };
}

function read(): Animal[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Partial<Animal>[];
    return raw.map(normalize);
  } catch {
    return [];
  }
}

function write(animals: Animal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const localDataSource: DataSource = {
  async listAnimals() {
    return read();
  },
  async saveAnimal(a) {
    const all = read();
    const i = all.findIndex((x) => x.id === a.id);
    const normalized = normalize(a);
    if (i >= 0) all[i] = normalized;
    else all.push(normalized);
    write(all);
    return normalized;
  },
  async deleteAnimal(id) {
    write(read().filter((x) => x.id !== id));
  },
  async addRegistro(animalId, r: Omit<Registro, 'id'>) {
    const all = read();
    const a = all.find((x) => x.id === animalId);
    if (!a) throw new Error('Animal no encontrado');
    a.registros = [...a.registros, { ...r, id: uid() }];
    write(all);
    return a;
  },
  async deleteRegistro(animalId, registroId) {
    const all = read();
    const a = all.find((x) => x.id === animalId);
    if (!a) throw new Error('Animal no encontrado');
    a.registros = a.registros.filter((x) => x.id !== registroId);
    write(all);
    return a;
  },
  async uploadFoto(animalId, file) {
    const all = read();
    const a = all.find((x) => x.id === animalId);
    if (!a) throw new Error('Animal no encontrado');
    const dataUrl = await fileToDataUrl(file);
    a.fotoUrl = dataUrl;
    write(all);
    return dataUrl;
  },
};
