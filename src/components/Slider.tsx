import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  badge?: ReactNode; // p. ej. la categoría
  footLeft?: ReactNode;
  footRight?: ReactNode;
}

/** Control deslizante etiquetado. Muestra el valor y una insignia opcional arriba,
 *  y un pie con detalles (categoría, valor derivado, etc.). */
export default function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  badge,
  footLeft,
  footRight,
}: Props) {
  return (
    <div className="slider">
      <div className="shead">
        <label>{label}</label>
        {badge}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {(footLeft || footRight) && (
        <div className="sfoot">
          <span>{footLeft}</span>
          <span>{footRight}</span>
        </div>
      )}
    </div>
  );
}
