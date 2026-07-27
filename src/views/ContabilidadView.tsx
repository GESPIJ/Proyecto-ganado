import { useEffect, useMemo, useState } from 'react';
import type { MetodoPago, Movimiento, MovimientoTipo } from '../types';
import { useContabilidad } from '../hooks/useContabilidad';
import { setContaAuth, clearContaAuth } from '../api/client';
import { usingLocal } from '../api';
import { NumField, SelectField, TextField } from '../components/Field';
import ResultCard from '../components/ResultCard';
import { Empty, ErrorState, Loading } from '../components/States';
import { uid } from '../lib/id';
import { fmtMoney } from '../lib/format';

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
  return { id: uid(), fecha: today(), tipo: 'inversion', monto: 0, concepto: '', metodo: 'efectivo' };
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
  const { movimientos, loading, error, save, remove, reload, totals } = conta;

  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [editing, setEditing] = useState<Movimiento | null>(null);

  const visibles = useMemo(
    () => (filtro === 'todos' ? movimientos : movimientos.filter((m) => m.tipo === filtro)),
    [movimientos, filtro],
  );

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
    if (!editing) return;
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

      {!editing && (
        <button className="btn pri" onClick={() => setEditing(nuevoMovimiento())}>
          + Agregar movimiento
        </button>
      )}

      {editing && (
        <div className="card">
          <h2 className="sec" style={{ marginTop: 0 }}>
            {movimientos.some((m) => m.id === editing.id) ? 'Editar movimiento' : 'Nuevo movimiento'}
          </h2>
          <div className="fieldgrid">
            <SelectField label="Tipo" value={editing.tipo} options={TIPOS} onChange={(v) => setEditing({ ...editing, tipo: v })} />
            <TextField label="Fecha" type="date" value={editing.fecha} onChange={(v) => setEditing({ ...editing, fecha: v })} />
            <NumField label="Monto" value={editing.monto} onChange={(v) => setEditing({ ...editing, monto: v })} suffix="USD" />
            <SelectField label="Método de pago" value={editing.metodo} options={METODOS} onChange={(v) => setEditing({ ...editing, metodo: v })} />
          </div>
          <TextField label="Concepto" value={editing.concepto} onChange={(v) => setEditing({ ...editing, concepto: v })} placeholder="Ej. Compra de mautes, 30 para la fecha" />
          <TextField label="Nota" value={editing.nota ?? ''} onChange={(v) => setEditing({ ...editing, nota: v || undefined })} placeholder="Opcional" />
          <div className="btnrow">
            <button className="btn" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn pri" onClick={onGuardar}>Guardar</button>
          </div>
        </div>
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
              </div>
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
