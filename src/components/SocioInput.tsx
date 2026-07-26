import type { Socio } from '../types';
import { NumField } from './Field';

interface Props {
  socio: Socio;
  onChange: (s: Socio) => void;
}

/** Configura si las ganancias se dividen con un socio y cuánto se queda. */
export default function SocioInput({ socio, onChange }: Props) {
  return (
    <div className="card">
      <label className="switch">
        <input
          type="checkbox"
          checked={socio.activo}
          onChange={(e) => onChange({ ...socio, activo: e.target.checked })}
        />
        Dividir ganancias con un socio
      </label>

      {socio.activo && (
        <div style={{ marginTop: 12 }}>
          <div className="seg" style={{ marginBottom: 12 }}>
            <button
              className={socio.modo === 'porcentaje' ? 'on' : ''}
              onClick={() => onChange({ ...socio, modo: 'porcentaje' })}
            >
              % de la ganancia
            </button>
            <button
              className={socio.modo === 'monto' ? 'on' : ''}
              onClick={() => onChange({ ...socio, modo: 'monto' })}
            >
              Monto fijo
            </button>
          </div>
          <NumField
            label={socio.modo === 'porcentaje' ? 'Porcentaje del socio' : 'Monto mensual del socio'}
            value={socio.valor}
            onChange={(v) => onChange({ ...socio, valor: v })}
            suffix={socio.modo === 'porcentaje' ? '%' : 'USD/mes'}
            help={
              socio.modo === 'porcentaje'
                ? 'Parte de la utilidad que se lleva el socio.'
                : 'Monto fijo que se lleva el socio cada mes.'
            }
          />
        </div>
      )}
    </div>
  );
}
