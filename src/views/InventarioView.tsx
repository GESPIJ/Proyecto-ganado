import { useMemo, useState } from 'react';
import type { Animal, AnimalEstado, AnimalProposito, AnimalTipo } from '../types';
import {
  useInventory,
  kilosGanados,
  inversionAnimal,
  resultadoAnimal,
} from '../hooks/useInventory';
import { NumField, SelectField, TextField } from '../components/Field';
import FotoInput from '../components/FotoInput';
import ImageLightbox from '../components/ImageLightbox';
import Modal from '../components/Modal';
import RegistrosPanel from '../components/RegistrosPanel';
import ResultCard from '../components/ResultCard';
import { Empty, ErrorState, Loading } from '../components/States';
import { edadDesde, fmtKg, fmtMoney, fmtNum } from '../lib/format';
import { uid } from '../lib/id';

const TIPOS: { value: AnimalTipo; label: string }[] = [
  { value: 'vaca', label: 'Vaca' },
  { value: 'maute', label: 'Maute' },
  { value: 'toro', label: 'Toro' },
  { value: 'cria', label: 'Cría' },
  { value: 'novilla', label: 'Novilla' },
];

const PROPOSITOS: { value: AnimalProposito; label: string }[] = [
  { value: 'leche', label: 'Leche' },
  { value: 'engorde', label: 'Engorde' },
  { value: 'cria', label: 'Cría' },
  { value: 'reproduccion', label: 'Reproducción' },
  { value: 'otro', label: 'Otro' },
];

const ESTADOS: { value: AnimalEstado; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'muerto', label: 'Muerto' },
  { value: 'matadero', label: 'Matadero' },
];

const ESTADO_CHIP: Record<AnimalEstado, string> = {
  activo: 'open',
  vendido: 'be',
  muerto: 'neg',
  matadero: 'pending',
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Solo coloreamos el "resultado" (verde/rojo) cuando hubo una venta real registrada;
// si no, la inversión no debe lucir como pérdida.
function tieneVenta(a: Animal): boolean {
  return a.valorVenta != null && a.valorVenta > 0;
}

function nuevoAnimal(): Animal {
  return {
    id: uid(),
    identificador: '',
    tipo: 'maute',
    estado: 'activo',
    proposito: 'otro',
    fechaEntrada: today(),
    pesoEntrada: 0,
    pesoActual: 0,
    costoCompra: 0,
    gastosAcumulados: 0,
    fotoUrl: null,
    registros: [],
  };
}

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'vendido', label: 'Vendidos' },
  { value: 'matadero', label: 'Matadero' },
  { value: 'muerto', label: 'Muertos' },
] as const;
type Filtro = (typeof FILTROS)[number]['value'];

export default function InventarioView() {
  const { animals, loading, error, save, remove, addRegistro, deleteRegistro, uploadFoto, totals } =
    useInventory();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [editing, setEditing] = useState<Animal | null>(null);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  const visibles = useMemo(
    () => (filtro === 'todos' ? animals : animals.filter((a) => a.estado === filtro)),
    [animals, filtro],
  );

  const salio = editing ? editing.estado !== 'activo' : false;
  const yaGuardado = editing ? animals.some((a) => a.id === editing.id) : false;

  const onGuardar = async () => {
    if (!editing) return;
    const a: Animal = {
      ...editing,
      identificador: editing.identificador.trim() || 'Sin arete',
    };
    await save(a);
    setEditing(null);
  };

  // La foto se sube contra el animal por id; en modo http conviene que ya exista.
  // Guardamos primero (upsert) y luego subimos, refrescando la vista previa.
  const onSubirFoto = async (file: File): Promise<string | null> => {
    if (!editing) return null;
    if (!yaGuardado) {
      await save({ ...editing, identificador: editing.identificador.trim() || 'Sin arete' });
    }
    const url = await uploadFoto(editing.id, file);
    if (url) setEditing((e) => (e ? { ...e, fotoUrl: url } : e));
    return url;
  };

  return (
    <div className="view">
      <h2 className="sec">Resumen de la finca</h2>
      <div className="hero">
        <ResultCard label="Animales" value={String(totals.total)} sub={`${totals.activos} activos`} />
        <ResultCard label="Kilos ganados" value={fmtKg(totals.kilosGanados)} />
        <ResultCard label="Inversión total" value={fmtMoney(totals.inversionTotal)} />
        <ResultCard label="Vendido" value={fmtMoney(totals.valorVendido)} />
        <ResultCard label="Litros de leche" value={`${fmtNum(totals.totalLitros)} L`} />
        <ResultCard
          label="Resultado neto"
          value={fmtMoney(totals.resultadoNeto)}
          tone={totals.valorVendido > 0 ? (totals.resultadoNeto >= 0 ? 'pos' : 'neg') : 'default'}
          wide
        />
      </div>

      {!editing && (
        <button className="btn pri" onClick={() => setEditing(nuevoAnimal())}>
          + Agregar animal
        </button>
      )}

      {editing && (
        <Modal
          title={animals.some((a) => a.id === editing.id) ? 'Editar animal' : 'Nuevo animal'}
          onClose={() => setEditing(null)}
        >
          <TextField
            label="Identificador / arete"
            value={editing.identificador}
            onChange={(v) => setEditing({ ...editing, identificador: v })}
            placeholder="Ej. 042 o 'La pinta'"
          />
          <div className="fieldgrid">
            <SelectField label="Tipo" value={editing.tipo} options={TIPOS} onChange={(v) => setEditing({ ...editing, tipo: v })} />
            <SelectField label="Propósito" value={editing.proposito} options={PROPOSITOS} onChange={(v) => setEditing({ ...editing, proposito: v })} />
            <SelectField label="Estado" value={editing.estado} options={ESTADOS} onChange={(v) => setEditing({ ...editing, estado: v })} />
            <TextField label="Fecha de nacimiento" type="date" value={editing.fechaNacimiento ?? ''} onChange={(v) => setEditing({ ...editing, fechaNacimiento: v || undefined })} />
            <TextField label="Fecha de entrada" type="date" value={editing.fechaEntrada} onChange={(v) => setEditing({ ...editing, fechaEntrada: v })} />
            {salio && (
              <TextField label="Fecha de salida" type="date" value={editing.fechaSalida ?? today()} onChange={(v) => setEditing({ ...editing, fechaSalida: v })} />
            )}
            <NumField label="Peso de entrada" value={editing.pesoEntrada} onChange={(v) => setEditing({ ...editing, pesoEntrada: v })} suffix="kg" />
            <NumField label={salio ? 'Peso de salida' : 'Peso actual'} value={editing.pesoActual} onChange={(v) => setEditing({ ...editing, pesoActual: v })} suffix="kg" />
            <NumField label="Costo de compra" value={editing.costoCompra} onChange={(v) => setEditing({ ...editing, costoCompra: v })} suffix="USD" help="Costo inicial" />
            <NumField label="Gastos acumulados" value={editing.gastosAcumulados} onChange={(v) => setEditing({ ...editing, gastosAcumulados: v })} suffix="USD" help="Pastos, veterinario, etc." />
            {(editing.estado === 'vendido' || editing.estado === 'matadero') && (
              <NumField label="Valor de venta" value={editing.valorVenta ?? 0} onChange={(v) => setEditing({ ...editing, valorVenta: v })} suffix="USD" />
            )}
          </div>
          {editing.fechaNacimiento && (
            <div className="help" style={{ marginTop: -4, marginBottom: 12 }}>Edad: {edadDesde(editing.fechaNacimiento)}</div>
          )}
          <FotoInput value={editing.fotoUrl} onUpload={onSubirFoto} />
          <TextField label="Notas" value={editing.notas ?? ''} onChange={(v) => setEditing({ ...editing, notas: v })} placeholder="Opcional" />
          <div className="btnrow">
            <button className="btn" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn pri" onClick={onGuardar}>Guardar</button>
          </div>
        </Modal>
      )}

      <h2 className="sec">Animales</h2>
      <div className="seg">
        {FILTROS.map((f) => (
          <button key={f.value} className={filtro === f.value ? 'on' : ''} onClick={() => setFiltro(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState label={error} />
      ) : visibles.length === 0 ? (
        <Empty label={animals.length === 0 ? 'Aún no hay animales. Agrega el primero.' : 'No hay animales en este filtro.'} />
      ) : (
        visibles.map((a) => {
          const res = resultadoAnimal(a);
          return (
            <div key={a.id} className="card">
              <div className="spread">
                <strong>{a.identificador}</strong>
                <span className={`chip ${ESTADO_CHIP[a.estado]}`}>{a.estado}</span>
              </div>
              {a.fotoUrl && (
                <button className="foto-thumb" onClick={() => setFotoAmpliada(a.fotoUrl!)} aria-label={`Ampliar foto de ${a.identificador}`}>
                  <img src={a.fotoUrl} alt={`Foto de ${a.identificador}`} />
                </button>
              )}
              <div className="meta">
                <div><span className="l">Tipo</span><span className="d">{a.tipo}</span></div>
                <div><span className="l">Propósito</span><span className="d">{a.proposito}</span></div>
                {a.fechaNacimiento && <div><span className="l">Edad</span><span className="d">{edadDesde(a.fechaNacimiento)}</span></div>}
                <div><span className="l">Entrada</span><span className="d">{a.fechaEntrada}</span></div>
                <div><span className="l">Peso</span><span className="d">{fmtKg(a.pesoEntrada)} → {fmtKg(a.pesoActual)}</span></div>
                <div><span className="l">Kilos ganados</span><span className="d">{fmtKg(kilosGanados(a))}</span></div>
                <div><span className="l">Inversión</span><span className="d">{fmtMoney(inversionAnimal(a))}</span></div>
                {a.valorVenta != null && <div><span className="l">Venta</span><span className="d">{fmtMoney(a.valorVenta)}</span></div>}
                {a.estado !== 'activo' && (
                  <div><span className="l">Resultado</span><span className={`d${tieneVenta(a) ? (res >= 0 ? ' pos' : ' neg') : ''}`}>{fmtMoney(res)}</span></div>
                )}
              </div>
              {a.notas && <div className="help" style={{ marginTop: 8 }}>{a.notas}</div>}
              <RegistrosPanel animal={a} onAdd={addRegistro} onDelete={deleteRegistro} />
              <div className="btnrow">
                <button className="btn" onClick={() => setEditing(a)}>Editar</button>
                <button
                  className="btn danger"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar ${a.identificador}? No se puede deshacer.`)) void remove(a.id);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })
      )}

      <ImageLightbox src={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
    </div>
  );
}
