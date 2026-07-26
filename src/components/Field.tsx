interface NumFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  help?: string;
  step?: number;
  min?: number;
  placeholder?: string;
}

/** Input numérico etiquetado. Guarda el valor como número; vacío = 0. */
export function NumField({ label, value, onChange, suffix, help, step, min, placeholder }: NumFieldProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="inwrap">
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ''}
          step={step ?? 'any'}
          min={min}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
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
