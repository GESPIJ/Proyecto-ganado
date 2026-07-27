// ---- Compartidos ----
export interface Socio {
  activo: boolean;
  modo: 'porcentaje' | 'monto'; // % de la utilidad, o monto fijo mensual
  valor: number;
}

export interface Payback {
  meses: number; // Infinity si no se recupera
  anios: number;
}

export interface Timeline {
  kgFaltantes: number;
  dias: number; // Infinity si no crece
  meses: number;
  anios: number;
  pesoInicial: number;
  pesoFinal: number;
}

// ---- Leche ----
export interface MilkInput {
  costoPorVaca: number;
  litrosDiaPorVaca: number; // promedio por vaca ordeñada
  cantidadVacas: number; // total del hato
  vacasOrdenadas: number; // cuántas se están ordeñando
  inversionExtra: number;
  inversionOverride: number | null; // si tiene valor, gana sobre costo*cantidad + extra
  precioLitro: number;
  conservadorPct: number; // % del escenario óptimo para el 2º escenario
  costosAdminPct: number;
  socio: Socio;
  criaPesoNacimiento: number;
  criaPesoEngorde: number;
  criaGananciaDiaria: number;
}

export interface MilkScenario {
  litrosDiaTotal: number;
  ingresoDiario: number;
  ingresoMensual: number;
  ingresoAnual: number;
  costosMensual: number;
  utilidadMensual: number; // toma del propietario
  utilidadAnual: number;
  gananciaSocioMensual: number;
  payback: Payback;
  roi: number; // % anual sobre la inversión
}

export interface MilkOutput {
  inversionTotal: number;
  optimo: MilkScenario;
  conservador: MilkScenario;
  cria: Timeline;
}

// ---- Mautes ----
export interface MauteInput {
  costoPorKilo: number;
  cantidadMautes: number;
  pesoInicialPorMaute: number;
  pesoObjetivoPorMaute: number;
  kilosSubenDia: number;
  gastosPastosAdminMensual: number;
  rendimientoCanalPct: number;
  precioKiloPie: number;
  precioKiloCanal: number;
}

export interface MauteSaleResult {
  ingreso: number;
  utilidad: number;
  roi: number;
  payback: Payback;
}

export interface MauteOutput {
  inversionCompra: number;
  gastosPeriodo: number;
  costoTotal: number;
  timeline: Timeline;
  mesesEngorde: number;
  pesoFinal: number;
  pesoCanal: number;
  pie: MauteSaleResult;
  canal: MauteSaleResult;
  mejorOpcion: 'pie' | 'canal';
}

// ---- Inventario ----
export type AnimalTipo = 'vaca' | 'maute' | 'toro' | 'cria' | 'novilla';
export type AnimalEstado = 'activo' | 'vendido' | 'muerto' | 'matadero';
export type AnimalProposito = 'leche' | 'engorde' | 'cria' | 'reproduccion' | 'otro';
export type RegistroTipo = 'peso' | 'leche';

// Registro en el tiempo: peso (kg) o litros de leche producidos en una fecha.
export interface Registro {
  id: string; // _id de Mongo, o crypto.randomUUID() en modo local
  fecha: string; // YYYY-MM-DD
  tipo: RegistroTipo;
  valor: number; // kg (peso) | litros (leche)
  nota?: string;
}

export interface Animal {
  id: string;
  identificador: string; // arete / nombre
  tipo: AnimalTipo;
  estado: AnimalEstado;
  proposito: AnimalProposito;
  fechaEntrada: string; // ISO (YYYY-MM-DD)
  fechaSalida?: string;
  fechaNacimiento?: string; // para derivar la edad
  pesoEntrada: number; // kg
  pesoActual: number; // kg (o peso de salida cuando sale)
  costoCompra: number;
  gastosAcumulados: number; // pastos/veterinario/etc desde la entrada
  valorVenta?: number; // ingreso por venta (vendido/matadero)
  fotoUrl?: string | null;
  notas?: string;
  registros: Registro[];
}

// ---- Contabilidad ----
export type MovimientoTipo = 'inversion' | 'ingreso' | 'gasto';
export type MetodoPago = 'efectivo' | 'zelle' | 'otro';

export interface Movimiento {
  id: string;
  fecha: string; // YYYY-MM-DD
  tipo: MovimientoTipo;
  monto: number; // siempre positivo; el signo lo da el tipo
  concepto: string;
  metodo: MetodoPago;
  nota?: string;
}

// ---- Capa de datos ----
export interface DataSource {
  listAnimals(): Promise<Animal[]>;
  saveAnimal(a: Animal): Promise<Animal>; // upsert por id
  deleteAnimal(id: string): Promise<void>;
  addRegistro(animalId: string, r: Omit<Registro, 'id'>): Promise<Animal>;
  deleteRegistro(animalId: string, registroId: string): Promise<Animal>;
  uploadFoto(animalId: string, file: File): Promise<string | null>; // devuelve fotoUrl o null
  // Contabilidad
  listMovimientos(): Promise<Movimiento[]>;
  saveMovimiento(m: Movimiento): Promise<Movimiento>; // upsert por id
  deleteMovimiento(id: string): Promise<void>;
}
