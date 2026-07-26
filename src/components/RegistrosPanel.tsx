import { useState } from 'react';
import type { Animal, Registro, RegistroTipo } from '../types';
import { NumField, SelectField, TextField } from './Field';
import MiniChart from './MiniChart';
import { fmtKg, fmtNum } from '../lib/format';
import { totalLitros, ultimoPeso } from '../hooks/useInventory';

interface Props {
  animal: Animal;
  onAdd: (animalId: string, r: Omit<Registro, 'id'>) => Promise<void>;
  onDelete: (animalId: string, registroId: string) => Promise<void>;
}

const TIPOS: { value: RegistroTipo; label: string }[] = [
  { value: 'peso', label: 'Peso (kg)' },
  { value: 'leche', label: 'Leche (L)' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Registros en el tiempo de un animal: alta, lista, totales y mini-gráfico. */
export default function RegistrosPanel({ animal, onAdd, onDelete }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<RegistroTipo>('peso');
  const [fecha, setFecha] = useState(today());
  const [valor, setValor] = useState(0);
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);

  const registros = [...animal.registros].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const pesos = animal.registros.filter((r) => r.tipo === 'peso').map((r) => ({ fecha: r.fecha, valor: r.valor }));
  const leches = animal.registros.filter((r) => r.tipo === 'leche').map((r) => ({ fecha: r.fecha, valor: r.valor }));

  const agregar = async () => {
    if (valor <= 0) return;
    setGuardando(true);
    try {
      await onAdd(animal.id, { fecha, tipo, valor, nota: nota.trim() || undefined });
      setValor(0);
      setNota('');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="proj">
      <div className="spread">
        <span className="mut">
          Registros · {animal.registros.length} · {fmtNum(totalLitros(animal))} L leche · último peso {fmtKg(ultimoPeso(animal))}
        </span>
        <button className="linkbtn" onClick={() => setAbierto((v) => !v)}>
          {abierto ? 'Ocultar' : 'Ver / agregar'}
        </button>
      </div>

      {abierto && (
        <>
          <MiniChart points={pesos} label="Evolución de peso" unit="kg" />
          <MiniChart points={leches} label="Leche por registro" unit="L" />

          <div style={{ marginTop: 12 }}>
            <div className="fieldgrid">
              <SelectField label="Tipo" value={tipo} options={TIPOS} onChange={setTipo} />
              <TextField label="Fecha" type="date" value={fecha} onChange={setFecha} />
              <NumField label="Valor" value={valor} onChange={setValor} suffix={tipo === 'peso' ? 'kg' : 'L'} />
              <TextField label="Nota" value={nota} onChange={setNota} placeholder="Opcional" />
            </div>
            <button className="btn pri" onClick={agregar} disabled={guardando || valor <= 0}>
              {guardando ? 'Agregando…' : 'Agregar registro'}
            </button>
          </div>

          {registros.length > 0 && (
            <div className="reg-list">
              {registros.map((r) => (
                <div key={r.id} className="reg-item">
                  <span>
                    {r.fecha} · {r.tipo === 'peso' ? fmtKg(r.valor) : `${fmtNum(r.valor)} L`}
                    {r.nota ? ` · ${r.nota}` : ''}
                  </span>
                  <button className="rx" title="Borrar" onClick={() => onDelete(animal.id, r.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
