import { useEffect, useMemo, useState } from 'react';
import type { Linea, MetodoPago, Movimiento, MovimientoCategoria, MovimientoTipo } from '../types';
import { useContabilidad, CATEGORIAS, CATEGORIA_LABEL } from '../hooks/useContabilidad';
import { setContaAuth, clearContaAuth } from '../api/client';
import { usingLocal } from '../api';
import { NumField, SelectField, TextField } from '../components/Field';
import Modal from '../components/Modal';
import ResultCard from '../components/ResultCard';
import DonutCategorias from '../components/DonutCategorias';
import { Empty, ErrorState, Loading } from '../components/States';
import { uid } from '../lib/id';
import { fmtMoney } from '../lib/format';

const CAT_OPTS: { value: MovimientoCategoria; label: string }[] = CATEGORIAS.map((c) => ({ value: c, label: CATEGORIA_LABEL[c] }));

const TIPOS: { value: MovimientoTipo; label: string }[] = [
  { value: 'inversion', label: 'Inversión' },
  { value: 'ingreso', label: 'Ingreso / Venta' },
  { value: 'gasto', label: 'Gasto' },
];
const TIPO_LABEL: Record<MovimientoTipo, string> = {
  inversion: 'Inversión',
  ingreso: 'Ingreso / Venta',
  gasto: 'Gasto',
};
const METODOS: { value: MetodoPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'otro', label: 'Otro' },
];
const METODO_LABEL: Record<MetodoPago, string> = { efectivo: 'Efectivo', zelle: 'Zelle', otro: 'Otro' };

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'inversion', label: 'Inversiones' },
  { value: 'ingreso', label: 'Ingresos' },
  { value: 'gasto', label: 'Gastos' },
] as const;
type Filtro = (typeof FILTROS)[number]['value'];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function nuevoMovimiento(): Movimiento {
  return { id: uid(), fecha: today(), tipo: 'inversion', monto: 0, concepto: '', metodo: 'efectivo', categoria: 'otros', desglose: [] };
}

export default function ContabilidadView() {
  // --- Candado: pide usuario + contraseña cada vez que se entra a la pestaña ---
  const [unlocked, setUnlocked] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Al salir de la pestaña (desmontar), olvidar las credenciales.
  useEffect(() => () => clearContaAuth(), []);

  const conta = useContabilidad(unlocked);
  const { movimientos, loading, error, save, remove, reload, totals, porCategoria } = conta;

  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [editing, setEditing] = useState<Movimiento | null>(null);

  const visibles = useMemo(
    () => (filtro === 'todos' ? movimientos : movimientos.filter((m) => m.tipo === filtro)),
    [movimientos, filtro],
  );

  // --- Desglose del movimiento en edición ---
  const desglose = editing?.desglose ?? [];
  const sumaDesglose = desglose.reduce((s, l) => s + l.monto, 0);
  const faltaAsignar = editing ? editing.monto - sumaDesglose : 0;
  const desgloseCuadra = desglose.length === 0 || Math.abs(faltaAsignar) < 0.01;

  const setDesglose = (lineas: Linea[]) => setEditing((e) => (e ? { ...e, desglose: lineas } : e));
  const addLinea = () => setDesglose([...desglose, { id: uid(), monto: Math.max(0, faltaAsignar), categoria: 'otros' }]);
  const updateLinea = (id: string, patch: Partial<Linea>) =>
    setDesglose(desglose.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLinea = (id: string) => setDesglose(desglose.filter((l) => l.id !== id));

  const entrar = async () => {
    if (!user.trim() || !pass) return;
    setChecking(true);
    setAuthError(null);
    setContaAuth({ user: user.trim(), key: pass });
    try {
      await reload(); // valida contra el backend (401 si es incorrecto)
      setUnlocked(true);
    } catch {
      clearContaAuth();
      setAuthError(usingLocal ? 'No se pudo abrir la contabilidad' : 'Usuario o contraseña incorrectos');
    } finally {
      setChecking(false);
    }
  };

  const bloquear = () => {
    clearContaAuth();
    setUnlocked(false);
    setPass('');
    setEditing(null);
  };

  const onGuardar = async () => {
    if (!editing || !desgloseCuadra) return;
    await save({ ...editing, concepto: editing.concepto.trim() || 'Sin concepto' });
    setEditing(null);
  };

  // --- Pantalla de bloqueo ---
  if (!unlocked) {
    return (
      <div className="gate">
        <h1>🔒 Contabilidad</h1>
        <p>Este módulo requiere acceso. Ingresa el usuario y la contraseña de contabilidad.</p>
        <input
          type="text"
          placeholder="Usuario"
          autoComplete="off"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && entrar()}
        />
        {authError && <p className="neg">{authError}</p>}
        <button className="btn pri" onClick={entrar} disabled={checking || !user.trim() || !pass}>
          {checking ? 'Verificando…' : 'Entrar'}
        </button>
      </div>
    );
  }

  // --- Módulo desbloqueado ---
  return (
    <div className="view">
      <div className="spread">
        <h2 className="sec" style={{ margin: 0 }}>Resumen</h2>
        <button className="linkbtn" onClick={bloquear}>🔒 Bloquear</button>
      </div>
      <div className="hero">
        <ResultCard label="Invertido" value={fmtMoney(totals.invertido)} tone="pos" />
        <ResultCard label="Ingresos" value={fmtMoney(totals.ingresos)} tone="pos" />
        <ResultCard label="Gastos" value={fmtMoney(totals.gastos)} tone="neg" />
        <ResultCard
          label="Balance"
          value={fmtMoney(totals.balance)}
          tone={totals.balance >= 0 ? 'pos' : 'neg'}
          wide
        />
      </div>

      {movimientos.length > 0 && (
        <>
          <h2 className="sec">Por categoría</h2>
          <DonutCategorias data={porCategoria} />
        </>
      )}

      {!editing && (
        <button className="btn pri" onClick={() => setEditing(nuevoMovimiento())}>
          + Agregar movimiento
        </button>
      )}

      {editing && (
        <Modal
          title={movimientos.some((m) => m.id === editing.id) ? 'Editar movimiento' : 'Nuevo movimiento'}
          onClose={() => setEditing(null)}
        >
          <div className="fieldgrid">
            <SelectField label="Tipo" value={editing.tipo} options={TIPOS} onChange={(v) => setEditing({ ...editing, tipo: v })} />
            <TextField label="Fecha" type="date" value={editing.fecha} onChange={(v) => setEditing({ ...editing, fecha: v })} />
            <NumField label="Monto" value={editing.monto} onChange={(v) => setEditing({ ...editing, monto: v })} suffix="USD" />
            <SelectField label="Método de pago" value={editing.metodo} options={METODOS} onChange={(v) => setEditing({ ...editing, metodo: v })} />
          </div>
          <TextField label="Concepto" value={editing.concepto} onChange={(v) => setEditing({ ...editing, concepto: v })} placeholder="Ej. Compra de mautes, 30 para la fecha" />

          {/* Categoría única (si no hay desglose) o editor de desglose */}
          {desglose.length === 0 && (
            <SelectField label="Categoría" value={editing.categoria} options={CAT_OPTS} onChange={(v) => setEditing({ ...editing, categoria: v })} />
          )}
          <div style={{ marginBottom: 12 }}>
            <button className="linkbtn" onClick={() => (desglose.length === 0 ? addLinea() : setDesglose([]))}>
              {desglose.length === 0 ? '+ Desglosar por categoría' : '✕ Quitar desglose'}
            </button>
          </div>

          {desglose.length > 0 && (
            <div className="proj" style={{ marginTop: 0 }}>
              {desglose.map((l, i) => (
                <div key={l.id} className="card" style={{ marginBottom: 10, padding: 12 }}>
                  <div className="spread" style={{ marginBottom: 8 }}>
                    <span className="mut" style={{ fontSize: 12 }}>Línea {i + 1}</span>
                    <button className="linkbtn neg" onClick={() => removeLinea(l.id)}>Quitar</button>
                  </div>
                  <div className="fieldgrid">
                    <NumField label="Monto" value={l.monto} onChange={(v) => updateLinea(l.id, { monto: v })} suffix="USD" />
                    <SelectField label="Categoría" value={l.categoria} options={CAT_OPTS} onChange={(v) => updateLinea(l.id, { categoria: v })} />
                  </div>
                  <TextField label="Concepto (opcional)" value={l.concepto ?? ''} onChange={(v) => updateLinea(l.id, { concepto: v || undefined })} placeholder="Ej. para la Meru" />
                </div>
              ))}
              <button className="btn" onClick={addLinea}>+ Agregar línea</button>
              <div className="spread" style={{ marginTop: 12 }}>
                <span className="mut">Asignado</span>
                <strong>{fmtMoney(sumaDesglose)} / {fmtMoney(editing.monto)}</strong>
              </div>
              {!desgloseCuadra && (
                <div className="help neg" style={{ marginTop: 4 }}>
                  {faltaAsignar > 0 ? `Falta asignar: ${fmtMoney(faltaAsignar)}` : `Te pasaste por: ${fmtMoney(-faltaAsignar)}`}
                </div>
              )}
            </div>
          )}

          <TextField label="Nota" value={editing.nota ?? ''} onChange={(v) => setEditing({ ...editing, nota: v || undefined })} placeholder="Opcional" />
          <div className="btnrow">
            <button className="btn" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn pri" onClick={onGuardar} disabled={!desgloseCuadra}>Guardar</button>
          </div>
        </Modal>
      )}

      <h2 className="sec">Movimientos</h2>
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
        <Empty label={movimientos.length === 0 ? 'Aún no hay movimientos. Agrega el primero.' : 'No hay movimientos en este filtro.'} />
      ) : (
        visibles.map((m) => {
          const esGasto = m.tipo === 'gasto';
          return (
            <div key={m.id} className="card">
              <div className="spread">
                <strong>{m.concepto || 'Sin concepto'}</strong>
                <span className={esGasto ? 'neg' : 'pos'} style={{ fontWeight: 750, whiteSpace: 'nowrap' }}>
                  {esGasto ? '−' : '+'}{fmtMoney(m.monto)}
                </span>
              </div>
              <div className="meta">
                <div><span className="l">Fecha</span><span className="d">{m.fecha}</span></div>
                <div><span className="l">Tipo</span><span className="d">{TIPO_LABEL[m.tipo]}</span></div>
                <div><span className="l">Método</span><span className="d">{METODO_LABEL[m.metodo]}</span></div>
                {m.desglose.length === 0 && <div><span className="l">Categoría</span><span className="d">{CATEGORIA_LABEL[m.categoria]}</span></div>}
              </div>
              {m.desglose.length > 0 && (
                <div className="reg-list">
                  {m.desglose.map((l) => (
                    <div key={l.id} className="reg-item">
                      <span>{CATEGORIA_LABEL[l.categoria]}{l.concepto ? ` · ${l.concepto}` : ''}</span>
                      <span className={esGasto ? 'neg' : 'pos'} style={{ whiteSpace: 'nowrap' }}>{esGasto ? '−' : '+'}{fmtMoney(l.monto)}</span>
                    </div>
                  ))}
                </div>
              )}
              {m.nota && <div className="help" style={{ marginTop: 8 }}>{m.nota}</div>}
              <div className="btnrow">
                <button className="btn" onClick={() => setEditing(m)}>Editar</button>
                <button
                  className="btn danger"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar "${m.concepto || 'este movimiento'}"? No se puede deshacer.`)) void remove(m.id);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
