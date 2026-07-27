import { useEffect, useState } from 'react';

interface NumFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  help?: string;
  placeholder?: string;
}

// "" | "." | "," → 0; si no, número (acepta coma decimal).
function parseNum(text: string): number {
  if (text === '' || text === '.' || text === ',') return 0;
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
// Deja solo dígitos y un único separador decimal.
function sanitize(raw: string): string {
  let t = raw.replace(/[^\d.,]/g, '');
  const i = t.search(/[.,]/);
  if (i !== -1) t = t.slice(0, i + 1) + t.slice(i + 1).replace(/[.,]/g, '');
  return t;
}
const numToText = (v: number) => (v === 0 ? '' : String(v));

/**
 * Input numérico etiquetado. Maneja su propio texto para que el campo vacío se
 * vea vacío (placeholder 0) sin ceros a la izquierda (evita "015") y permita
 * escribir decimales como "0.6" con fluidez. El modelo guarda un número (vacío = 0).
 */
export function NumField({ label, value, onChange, suffix, help, placeholder }: NumFieldProps) {
  const [text, setText] = useState(() => numToText(value));

  // Sincroniza cambios externos (defaults, botón Auto/Manual) sin pisar lo que
  // el usuario está tecleando: si el texto ya representa el mismo número, no toca.
  useEffect(() => {
    if (parseNum(text) !== value) setText(numToText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handle = (raw: string) => {
    const sane = sanitize(raw);
    setText(sane);
    onChange(parseNum(sane));
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div className="inwrap">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          placeholder={placeholder ?? '0'}
          onChange={(e) => handle(e.target.value)}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      {help && <span className="help">{help}</span>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'date';
}

export function TextField({ label, value, onChange, placeholder, type = 'text' }: TextFieldProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="inwrap">
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

export function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="inwrap">
        <select value={value} onChange={(e) => onChange(e.target.value as T)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
