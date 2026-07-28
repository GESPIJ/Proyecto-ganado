import type { Animal, DataSource, Movimiento, Registro } from '../types';
import { STORAGE_KEY } from './client';
import { uid } from '../lib/id';

const MOV_KEY = 'ganado.movimientos';
const TIPO_LEGADO: Record<string, Movimiento['tipo']> = { inversion: 'aporte', ingreso: 'venta' };
function normalizeMov(m: Partial<Movimiento> & { tipo?: string }): Movimiento {
  return {
    ...(m as Movimiento),
    tipo: (TIPO_LEGADO[m.tipo as string] ?? m.tipo) as Movimiento['tipo'],
    categoria: m.categoria ?? 'otros',
    desglose: m.desglose ?? [],
  };
}
function readMovs(): Movimiento[] {
  try {
    const raw = JSON.parse(localStorage.getItem(MOV_KEY) ?? '[]') as Partial<Movimiento>[];
    return raw.map(normalizeMov);
  } catch {
    return [];
  }
}
function writeMovs(m: Movimiento[]): void {
  localStorage.setItem(MOV_KEY, JSON.stringify(m));
}

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
  async listMovimientos() {
    return readMovs().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  },
  async saveMovimiento(m) {
    const all = readMovs();
    const i = all.findIndex((x) => x.id === m.id);
    if (i >= 0) all[i] = m;
    else all.push(m);
    writeMovs(all);
    return m;
  },
  async deleteMovimiento(id) {
    writeMovs(readMovs().filter((x) => x.id !== id));
  },
};
